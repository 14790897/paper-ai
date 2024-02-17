import { a as ViteModuleRunner, e as ViteRuntimeModuleContext } from './types.d-jgA8ss1A.js';
export { d as FetchFunction, F as FetchResult, f as HMRConnection, H as HMRLogger, c as HMRRuntimeConnection, g as ModuleCache, M as ModuleCacheMap, R as ResolvedResult, S as SSRImportMetadata, b as ViteRuntime, h as ViteRuntimeImportMeta, V as ViteRuntimeOptions, s as ssrDynamicImportKey, i as ssrExportAllKey, j as ssrImportKey, k as ssrImportMetaKey, l as ssrModuleExportsKey } from './types.d-jgA8ss1A.js';
import '../../types/hot.js';
import '../../types/hmrPayload.js';
import '../../types/customEvent.js';

declare class ESModulesRunner implements ViteModuleRunner {
    runViteModule(context: ViteRuntimeModuleContext, code: string): Promise<any>;
    runExternalModule(filepath: string): Promise<any>;
}

export { ESModulesRunner, ViteModuleRunner, ViteRuntimeModuleContext };
