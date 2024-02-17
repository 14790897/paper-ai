import { ViteDevServer, Plugin } from 'vite';
import * as _compiler from 'vue/compiler-sfc';
import { SFCScriptCompileOptions, SFCTemplateCompileOptions, SFCStyleCompileOptions } from 'vue/compiler-sfc';

interface VueQuery {
    vue?: boolean;
    src?: string;
    type?: 'script' | 'template' | 'style' | 'custom';
    index?: number;
    lang?: string;
    raw?: boolean;
    url?: boolean;
    scoped?: boolean;
    id?: string;
}
declare function parseVueRequest(id: string): {
    filename: string;
    query: VueQuery;
};

interface Options {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    isProduction?: boolean;
    script?: Partial<Omit<SFCScriptCompileOptions, 'id' | 'isProd' | 'inlineTemplate' | 'templateOptions' | 'sourceMap' | 'genDefaultAs' | 'customElement' | 'defineModel'>> & {
        /**
         * @deprecated defineModel is now a stable feature and always enabled if
         * using Vue 3.4 or above.
         */
        defineModel?: boolean;
    };
    template?: Partial<Omit<SFCTemplateCompileOptions, 'id' | 'source' | 'ast' | 'filename' | 'scoped' | 'slotted' | 'isProd' | 'inMap' | 'ssr' | 'ssrCssVars' | 'preprocessLang'>>;
    style?: Partial<Omit<SFCStyleCompileOptions, 'filename' | 'id' | 'isProd' | 'source' | 'scoped' | 'cssDevSourcemap' | 'postcssOptions' | 'map' | 'postcssPlugins' | 'preprocessCustomRequire' | 'preprocessLang' | 'preprocessOptions'>>;
    /**
     * Transform Vue SFCs into custom elements.
     * - `true`: all `*.vue` imports are converted into custom elements
     * - `string | RegExp`: matched files are converted into custom elements
     *
     * @default /\.ce\.vue$/
     */
    customElement?: boolean | string | RegExp | (string | RegExp)[];
    /**
     * Use custom compiler-sfc instance. Can be used to force a specific version.
     */
    compiler?: typeof _compiler;
}
interface ResolvedOptions extends Options {
    compiler: typeof _compiler;
    root: string;
    sourceMap: boolean;
    cssDevSourcemap: boolean;
    devServer?: ViteDevServer;
    devToolsEnabled?: boolean;
}
interface Api {
    get options(): ResolvedOptions;
    set options(value: ResolvedOptions);
    version: string;
}
declare function vuePlugin(rawOptions?: Options): Plugin<Api>;

export { type Api, type Options, type ResolvedOptions, type VueQuery, vuePlugin as default, parseVueRequest };
