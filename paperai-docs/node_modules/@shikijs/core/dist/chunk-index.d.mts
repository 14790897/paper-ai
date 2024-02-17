interface WebAssemblyInstantiator {
    (importObject: Record<string, Record<string, WebAssembly.ImportValue>> | undefined): Promise<WebAssemblyInstance>;
}
type WebAssemblyInstance = WebAssembly.WebAssemblyInstantiatedSource | WebAssembly.Instance | WebAssembly.Instance['exports'];
type OnigurumaLoadOptions = {
    instantiator: WebAssemblyInstantiator;
} | {
    default: WebAssemblyInstantiator;
} | {
    data: ArrayBufferView | ArrayBuffer | Response;
};
type Awaitable<T> = T | Promise<T>;
type LoadWasmOptionsPlain = OnigurumaLoadOptions | WebAssemblyInstantiator | ArrayBufferView | ArrayBuffer | Response;
type LoadWasmOptions = Awaitable<LoadWasmOptionsPlain> | (() => Awaitable<LoadWasmOptionsPlain>);
declare function loadWasm(options: LoadWasmOptions): Promise<void>;

export { type LoadWasmOptions as L, type WebAssemblyInstantiator as W, loadWasm as l };
