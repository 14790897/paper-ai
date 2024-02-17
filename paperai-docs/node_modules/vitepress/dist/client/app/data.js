import siteData from '@siteData';
import { useDark } from '@vueuse/core';
import { computed, inject, readonly, ref, shallowRef } from 'vue';
import { APPEARANCE_KEY, createTitle, resolveSiteDataByRoute } from '../shared';
export const dataSymbol = Symbol();
// site data is a singleton
export const siteDataRef = shallowRef((import.meta.env.PROD ? siteData : readonly(siteData)));
// hmr
if (import.meta.hot) {
    import.meta.hot.accept('/@siteData', (m) => {
        if (m) {
            siteDataRef.value = m.default;
        }
    });
}
// per-app data
export function initData(route) {
    const site = computed(() => resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath));
    const appearance = site.value.appearance; // fine with reactivity being lost here, config change triggers a restart
    const isDark = appearance === 'force-dark'
        ? ref(true)
        : appearance
            ? useDark({
                storageKey: APPEARANCE_KEY,
                initialValue: () => typeof appearance === 'string' ? appearance : 'auto',
                ...(typeof appearance === 'object' ? appearance : {})
            })
            : ref(false);
    return {
        site,
        theme: computed(() => site.value.themeConfig),
        page: computed(() => route.data),
        frontmatter: computed(() => route.data.frontmatter),
        params: computed(() => route.data.params),
        lang: computed(() => site.value.lang),
        dir: computed(() => route.data.frontmatter.dir || site.value.dir),
        localeIndex: computed(() => site.value.localeIndex || 'root'),
        title: computed(() => createTitle(site.value, route.data)),
        description: computed(() => route.data.description || site.value.description),
        isDark
    };
}
export function useData() {
    const data = inject(dataSymbol);
    if (!data) {
        throw new Error('vitepress data not properly injected in app');
    }
    return data;
}
