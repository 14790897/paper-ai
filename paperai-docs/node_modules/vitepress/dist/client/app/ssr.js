// entry for SSR
import { createApp } from './index';
import { renderToString } from 'vue/server-renderer';
export async function render(path) {
    const { app, router } = await createApp();
    await router.go(path);
    const ctx = { content: '' };
    ctx.content = await renderToString(app, ctx);
    return ctx;
}
