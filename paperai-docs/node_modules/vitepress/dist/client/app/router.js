import { inject, markRaw, nextTick, reactive, readonly } from 'vue';
import { notFoundPageData, treatAsHtml } from '../shared';
import { siteDataRef } from './data';
import { getScrollOffset, inBrowser, withBase } from './utils';
export const RouterSymbol = Symbol();
// we are just using URL to parse the pathname and hash - the base doesn't
// matter and is only passed to support same-host hrefs.
const fakeHost = 'http://a.com';
const getDefaultRoute = () => ({
    path: '/',
    component: null,
    data: notFoundPageData
});
export function createRouter(loadPageModule, fallbackComponent) {
    const route = reactive(getDefaultRoute());
    const router = {
        route,
        go
    };
    async function go(href = inBrowser ? location.href : '/') {
        href = normalizeHref(href);
        if ((await router.onBeforeRouteChange?.(href)) === false)
            return;
        updateHistory(href);
        await loadPage(href);
        await router.onAfterRouteChanged?.(href);
    }
    let latestPendingPath = null;
    async function loadPage(href, scrollPosition = 0, isRetry = false) {
        if ((await router.onBeforePageLoad?.(href)) === false)
            return;
        const targetLoc = new URL(href, fakeHost);
        const pendingPath = (latestPendingPath = targetLoc.pathname);
        try {
            let page = await loadPageModule(pendingPath);
            if (!page) {
                throw new Error(`Page not found: ${pendingPath}`);
            }
            if (latestPendingPath === pendingPath) {
                latestPendingPath = null;
                const { default: comp, __pageData } = page;
                if (!comp) {
                    throw new Error(`Invalid route component: ${comp}`);
                }
                route.path = inBrowser ? pendingPath : withBase(pendingPath);
                route.component = markRaw(comp);
                route.data = import.meta.env.PROD
                    ? markRaw(__pageData)
                    : readonly(__pageData);
                if (inBrowser) {
                    nextTick(() => {
                        let actualPathname = siteDataRef.value.base +
                            __pageData.relativePath.replace(/(?:(^|\/)index)?\.md$/, '$1');
                        if (!siteDataRef.value.cleanUrls && !actualPathname.endsWith('/')) {
                            actualPathname += '.html';
                        }
                        if (actualPathname !== targetLoc.pathname) {
                            targetLoc.pathname = actualPathname;
                            href = actualPathname + targetLoc.search + targetLoc.hash;
                            history.replaceState(null, '', href);
                        }
                        if (targetLoc.hash && !scrollPosition) {
                            let target = null;
                            try {
                                target = document.getElementById(decodeURIComponent(targetLoc.hash).slice(1));
                            }
                            catch (e) {
                                console.warn(e);
                            }
                            if (target) {
                                scrollTo(target, targetLoc.hash);
                                return;
                            }
                        }
                        window.scrollTo(0, scrollPosition);
                    });
                }
            }
        }
        catch (err) {
            if (!/fetch|Page not found/.test(err.message) &&
                !/^\/404(\.html|\/)?$/.test(href)) {
                console.error(err);
            }
            // retry on fetch fail: the page to hash map may have been invalidated
            // because a new deploy happened while the page is open. Try to fetch
            // the updated pageToHash map and fetch again.
            if (!isRetry) {
                try {
                    const res = await fetch(siteDataRef.value.base + 'hashmap.json');
                    window.__VP_HASH_MAP__ = await res.json();
                    await loadPage(href, scrollPosition, true);
                    return;
                }
                catch (e) { }
            }
            if (latestPendingPath === pendingPath) {
                latestPendingPath = null;
                route.path = inBrowser ? pendingPath : withBase(pendingPath);
                route.component = fallbackComponent ? markRaw(fallbackComponent) : null;
                route.data = notFoundPageData;
            }
        }
    }
    if (inBrowser) {
        window.addEventListener('click', (e) => {
            // temporary fix for docsearch action buttons
            const button = e.target.closest('button');
            if (button)
                return;
            const link = e.target.closest('a');
            if (link &&
                !link.closest('.vp-raw') &&
                (link instanceof SVGElement || !link.download)) {
                const { target } = link;
                const { href, origin, pathname, hash, search } = new URL(link.href instanceof SVGAnimatedString
                    ? link.href.animVal
                    : link.href, link.baseURI);
                const currentUrl = window.location;
                // only intercept inbound html links
                if (!e.ctrlKey &&
                    !e.shiftKey &&
                    !e.altKey &&
                    !e.metaKey &&
                    !target &&
                    origin === currentUrl.origin &&
                    treatAsHtml(pathname)) {
                    e.preventDefault();
                    if (pathname === currentUrl.pathname &&
                        search === currentUrl.search) {
                        // scroll between hash anchors in the same page
                        // avoid duplicate history entries when the hash is same
                        if (hash !== currentUrl.hash) {
                            history.pushState(null, '', hash);
                            // still emit the event so we can listen to it in themes
                            window.dispatchEvent(new Event('hashchange'));
                        }
                        if (hash) {
                            // use smooth scroll when clicking on header anchor links
                            scrollTo(link, hash, link.classList.contains('header-anchor'));
                        }
                        else {
                            updateHistory(href);
                            window.scrollTo(0, 0);
                        }
                    }
                    else {
                        go(href);
                    }
                }
            }
        }, { capture: true });
        window.addEventListener('popstate', async (e) => {
            await loadPage(normalizeHref(location.href), (e.state && e.state.scrollPosition) || 0);
            router.onAfterRouteChanged?.(location.href);
        });
        window.addEventListener('hashchange', (e) => {
            e.preventDefault();
        });
    }
    handleHMR(route);
    return router;
}
export function useRouter() {
    const router = inject(RouterSymbol);
    if (!router) {
        throw new Error('useRouter() is called without provider.');
    }
    return router;
}
export function useRoute() {
    return useRouter().route;
}
export function scrollTo(el, hash, smooth = false) {
    let target = null;
    try {
        target = el.classList.contains('header-anchor')
            ? el
            : document.getElementById(decodeURIComponent(hash).slice(1));
    }
    catch (e) {
        console.warn(e);
    }
    if (target) {
        const targetPadding = parseInt(window.getComputedStyle(target).paddingTop, 10);
        const targetTop = window.scrollY +
            target.getBoundingClientRect().top -
            getScrollOffset() +
            targetPadding;
        function scrollToTarget() {
            // only smooth scroll if distance is smaller than screen height.
            if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight)
                window.scrollTo(0, targetTop);
            else
                window.scrollTo({ left: 0, top: targetTop, behavior: 'smooth' });
        }
        requestAnimationFrame(scrollToTarget);
    }
}
function handleHMR(route) {
    // update route.data on HMR updates of active page
    if (import.meta.hot) {
        // hot reload pageData
        import.meta.hot.on('vitepress:pageData', (payload) => {
            if (shouldHotReload(payload)) {
                route.data = payload.pageData;
            }
        });
    }
}
function shouldHotReload(payload) {
    const payloadPath = payload.path.replace(/(?:(^|\/)index)?\.md$/, '$1');
    const locationPath = location.pathname
        .replace(/(?:(^|\/)index)?\.html$/, '')
        .slice(siteDataRef.value.base.length - 1);
    return payloadPath === locationPath;
}
function updateHistory(href) {
    if (inBrowser && normalizeHref(href) !== normalizeHref(location.href)) {
        // save scroll position before changing url
        history.replaceState({ scrollPosition: window.scrollY }, document.title);
        history.pushState(null, '', href);
    }
}
function normalizeHref(href) {
    const url = new URL(href, fakeHost);
    url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, '$1');
    // ensure correct deep link so page refresh lands on correct files.
    if (siteDataRef.value.cleanUrls)
        url.pathname = url.pathname.replace(/\.html$/, '');
    else if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html'))
        url.pathname += '.html';
    return url.pathname + url.search + url.hash;
}
