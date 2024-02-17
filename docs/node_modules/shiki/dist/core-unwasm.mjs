import { setDefaultWasmLoader } from '@shikijs/core';
export * from '@shikijs/core';

setDefaultWasmLoader(() => import('shiki/wasm'));
