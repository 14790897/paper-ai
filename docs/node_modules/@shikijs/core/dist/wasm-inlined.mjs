const getWasm = async (info) => {
    // @ts-expect-error this will be compiled to ArrayBuffer
    const binray = await import('./onig.mjs').then(m => m.default);
    return WebAssembly.instantiate(binray, info).then(wasm => wasm.instance.exports);
};

export { getWasm as default };
