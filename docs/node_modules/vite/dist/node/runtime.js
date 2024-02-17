class HMRContext {
    hmrClient;
    ownerPath;
    newListeners;
    constructor(hmrClient, ownerPath) {
        this.hmrClient = hmrClient;
        this.ownerPath = ownerPath;
        if (!hmrClient.dataMap.has(ownerPath)) {
            hmrClient.dataMap.set(ownerPath, {});
        }
        // when a file is hot updated, a new context is created
        // clear its stale callbacks
        const mod = hmrClient.hotModulesMap.get(ownerPath);
        if (mod) {
            mod.callbacks = [];
        }
        // clear stale custom event listeners
        const staleListeners = hmrClient.ctxToListenersMap.get(ownerPath);
        if (staleListeners) {
            for (const [event, staleFns] of staleListeners) {
                const listeners = hmrClient.customListenersMap.get(event);
                if (listeners) {
                    hmrClient.customListenersMap.set(event, listeners.filter((l) => !staleFns.includes(l)));
                }
            }
        }
        this.newListeners = new Map();
        hmrClient.ctxToListenersMap.set(ownerPath, this.newListeners);
    }
    get data() {
        return this.hmrClient.dataMap.get(this.ownerPath);
    }
    accept(deps, callback) {
        if (typeof deps === 'function' || !deps) {
            // self-accept: hot.accept(() => {})
            this.acceptDeps([this.ownerPath], ([mod]) => deps?.(mod));
        }
        else if (typeof deps === 'string') {
            // explicit deps
            this.acceptDeps([deps], ([mod]) => callback?.(mod));
        }
        else if (Array.isArray(deps)) {
            this.acceptDeps(deps, callback);
        }
        else {
            throw new Error(`invalid hot.accept() usage.`);
        }
    }
    // export names (first arg) are irrelevant on the client side, they're
    // extracted in the server for propagation
    acceptExports(_, callback) {
        this.acceptDeps([this.ownerPath], ([mod]) => callback?.(mod));
    }
    dispose(cb) {
        this.hmrClient.disposeMap.set(this.ownerPath, cb);
    }
    prune(cb) {
        this.hmrClient.pruneMap.set(this.ownerPath, cb);
    }
    // Kept for backward compatibility (#11036)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    decline() { }
    invalidate(message) {
        this.hmrClient.notifyListeners('vite:invalidate', {
            path: this.ownerPath,
            message,
        });
        this.send('vite:invalidate', { path: this.ownerPath, message });
        this.hmrClient.logger.debug(`[vite] invalidate ${this.ownerPath}${message ? `: ${message}` : ''}`);
    }
    on(event, cb) {
        const addToMap = (map) => {
            const existing = map.get(event) || [];
            existing.push(cb);
            map.set(event, existing);
        };
        addToMap(this.hmrClient.customListenersMap);
        addToMap(this.newListeners);
    }
    off(event, cb) {
        const removeFromMap = (map) => {
            const existing = map.get(event);
            if (existing === undefined) {
                return;
            }
            const pruned = existing.filter((l) => l !== cb);
            if (pruned.length === 0) {
                map.delete(event);
                return;
            }
            map.set(event, pruned);
        };
        removeFromMap(this.hmrClient.customListenersMap);
        removeFromMap(this.newListeners);
    }
    send(event, data) {
        this.hmrClient.messenger.send(JSON.stringify({ type: 'custom', event, data }));
    }
    acceptDeps(deps, callback = () => { }) {
        const mod = this.hmrClient.hotModulesMap.get(this.ownerPath) || {
            id: this.ownerPath,
            callbacks: [],
        };
        mod.callbacks.push({
            deps,
            fn: callback,
        });
        this.hmrClient.hotModulesMap.set(this.ownerPath, mod);
    }
}
class HMRMessenger {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    queue = [];
    send(message) {
        this.queue.push(message);
        this.flush();
    }
    flush() {
        if (this.connection.isReady()) {
            this.queue.forEach((msg) => this.connection.send(msg));
            this.queue = [];
        }
    }
}
class HMRClient {
    logger;
    importUpdatedModule;
    hotModulesMap = new Map();
    disposeMap = new Map();
    pruneMap = new Map();
    dataMap = new Map();
    customListenersMap = new Map();
    ctxToListenersMap = new Map();
    messenger;
    constructor(logger, connection, 
    // This allows implementing reloading via different methods depending on the environment
    importUpdatedModule) {
        this.logger = logger;
        this.importUpdatedModule = importUpdatedModule;
        this.messenger = new HMRMessenger(connection);
    }
    async notifyListeners(event, data) {
        const cbs = this.customListenersMap.get(event);
        if (cbs) {
            await Promise.allSettled(cbs.map((cb) => cb(data)));
        }
    }
    clear() {
        this.hotModulesMap.clear();
        this.disposeMap.clear();
        this.pruneMap.clear();
        this.dataMap.clear();
        this.customListenersMap.clear();
        this.ctxToListenersMap.clear();
    }
    // After an HMR update, some modules are no longer imported on the page
    // but they may have left behind side effects that need to be cleaned up
    // (.e.g style injections)
    // TODO Trigger their dispose callbacks.
    prunePaths(paths) {
        paths.forEach((path) => {
            const fn = this.pruneMap.get(path);
            if (fn) {
                fn(this.dataMap.get(path));
            }
        });
    }
    warnFailedUpdate(err, path) {
        if (!err.message.includes('fetch')) {
            this.logger.error(err);
        }
        this.logger.error(`[hmr] Failed to reload ${path}. ` +
            `This could be due to syntax errors or importing non-existent ` +
            `modules. (see errors above)`);
    }
    updateQueue = [];
    pendingUpdateQueue = false;
    /**
     * buffer multiple hot updates triggered by the same src change
     * so that they are invoked in the same order they were sent.
     * (otherwise the order may be inconsistent because of the http request round trip)
     */
    async queueUpdate(payload) {
        this.updateQueue.push(this.fetchUpdate(payload));
        if (!this.pendingUpdateQueue) {
            this.pendingUpdateQueue = true;
            await Promise.resolve();
            this.pendingUpdateQueue = false;
            const loading = [...this.updateQueue];
            this.updateQueue = [];
            (await Promise.all(loading)).forEach((fn) => fn && fn());
        }
    }
    async fetchUpdate(update) {
        const { path, acceptedPath } = update;
        const mod = this.hotModulesMap.get(path);
        if (!mod) {
            // In a code-splitting project,
            // it is common that the hot-updating module is not loaded yet.
            // https://github.com/vitejs/vite/issues/721
            return;
        }
        let fetchedModule;
        const isSelfUpdate = path === acceptedPath;
        // determine the qualified callbacks before we re-import the modules
        const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => deps.includes(acceptedPath));
        if (isSelfUpdate || qualifiedCallbacks.length > 0) {
            const disposer = this.disposeMap.get(acceptedPath);
            if (disposer)
                await disposer(this.dataMap.get(acceptedPath));
            try {
                fetchedModule = await this.importUpdatedModule(update);
            }
            catch (e) {
                this.warnFailedUpdate(e, acceptedPath);
            }
        }
        return () => {
            for (const { deps, fn } of qualifiedCallbacks) {
                fn(deps.map((dep) => (dep === acceptedPath ? fetchedModule : undefined)));
            }
            const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
            this.logger.debug(`[vite] hot updated: ${loggedPath}`);
        };
    }
}

const isWindows = typeof process !== 'undefined' && process.platform === 'win32';
const decodeBase64 = typeof atob !== 'undefined'
    ? atob
    : (str) => Buffer.from(str, 'base64').toString('utf-8');
// currently we copy this from '../../constants' - maybe we can inline it somewhow?
const NULL_BYTE_PLACEHOLDER = `__x00__`;
const VALID_ID_PREFIX = `/@id/`;
function wrapId(id) {
    return id.startsWith(VALID_ID_PREFIX)
        ? id
        : VALID_ID_PREFIX + id.replace('\0', NULL_BYTE_PLACEHOLDER);
}
function unwrapId(id) {
    return id.startsWith(VALID_ID_PREFIX)
        ? id.slice(VALID_ID_PREFIX.length).replace(NULL_BYTE_PLACEHOLDER, '\0')
        : id;
}
const windowsSlashRE = /\\/g;
function slash(p) {
    return p.replace(windowsSlashRE, '/');
}
const postfixRE = /[?#].*$/s;
function cleanUrl(url) {
    return url.replace(postfixRE, '');
}
function isPrimitive(value) {
    return !value || (typeof value !== 'object' && typeof value !== 'function');
}
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;
const questionRegex = /\?/g;
const hashRegex = /#/g;
function encodePathChars(filepath) {
    if (filepath.indexOf('%') !== -1)
        filepath = filepath.replace(percentRegEx, '%25');
    // In posix, backslash is a valid character in paths:
    if (!isWindows && filepath.indexOf('\\') !== -1)
        filepath = filepath.replace(backslashRegEx, '%5C');
    if (filepath.indexOf('\n') !== -1)
        filepath = filepath.replace(newlineRegEx, '%0A');
    if (filepath.indexOf('\r') !== -1)
        filepath = filepath.replace(carriageReturnRegEx, '%0D');
    if (filepath.indexOf('\t') !== -1)
        filepath = filepath.replace(tabRegEx, '%09');
    return filepath;
}
function posixPathToFileHref(posixPath) {
    let resolved = posixResolve(posixPath);
    // path.resolve strips trailing slashes so we must add them back
    const filePathLast = posixPath.charCodeAt(posixPath.length - 1);
    if ((filePathLast === CHAR_FORWARD_SLASH ||
        (isWindows && filePathLast === CHAR_BACKWARD_SLASH)) &&
        resolved[resolved.length - 1] !== '/')
        resolved += '/';
    // Call encodePathChars first to avoid encoding % again for ? and #.
    resolved = encodePathChars(resolved);
    // Question and hash character should be included in pathname.
    // Therefore, encoding is required to eliminate parsing them in different states.
    // This is done as an optimization to not creating a URL instance and
    // later triggering pathname setter, which impacts performance
    if (resolved.indexOf('?') !== -1)
        resolved = resolved.replace(questionRegex, '%3F');
    if (resolved.indexOf('#') !== -1)
        resolved = resolved.replace(hashRegex, '%23');
    return new URL(`file://${resolved}`).href;
}
function posixDirname(filepath) {
    const normalizedPath = filepath.endsWith('/')
        ? filepath.substring(0, filepath.length - 1)
        : filepath;
    return normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/';
}
function toWindowsPath(path) {
    return path.replace(/\//g, '\\');
}
// inlined from pathe to support environments without access to node:path
function cwd() {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
        return slash(process.cwd());
    }
    return '/';
}
function posixResolve(...segments) {
    // Normalize windows arguments
    segments = segments.map((argument) => slash(argument));
    let resolvedPath = '';
    let resolvedAbsolute = false;
    for (let index = segments.length - 1; index >= -1 && !resolvedAbsolute; index--) {
        const path = index >= 0 ? segments[index] : cwd();
        // Skip empty entries
        if (!path || path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = isAbsolute(path);
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
    if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
        return `/${resolvedPath}`;
    }
    return resolvedPath.length > 0 ? resolvedPath : '.';
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
function isAbsolute(p) {
    return _IS_ABSOLUTE_RE.test(p);
}
// Resolves . and .. elements in a path with directory names
function normalizeString(path, allowAboveRoot) {
    let res = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let char = null;
    for (let index = 0; index <= path.length; ++index) {
        if (index < path.length) {
            char = path[index];
        }
        else if (char === '/') {
            break;
        }
        else {
            char = '/';
        }
        if (char === '/') {
            if (lastSlash === index - 1 || dots === 1) ;
            else if (dots === 2) {
                if (res.length < 2 ||
                    lastSegmentLength !== 2 ||
                    res[res.length - 1] !== '.' ||
                    res[res.length - 2] !== '.') {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf('/');
                        if (lastSlashIndex === -1) {
                            res = '';
                            lastSegmentLength = 0;
                        }
                        else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
                        }
                        lastSlash = index;
                        dots = 0;
                        continue;
                    }
                    else if (res.length > 0) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = index;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    res += res.length > 0 ? '/..' : '..';
                    lastSegmentLength = 2;
                }
            }
            else {
                if (res.length > 0) {
                    res += `/${path.slice(lastSlash + 1, index)}`;
                }
                else {
                    res = path.slice(lastSlash + 1, index);
                }
                lastSegmentLength = index - lastSlash - 1;
            }
            lastSlash = index;
            dots = 0;
        }
        else if (char === '.' && dots !== -1) {
            ++dots;
        }
        else {
            dots = -1;
        }
    }
    return res;
}

class DecodedMap {
    map;
    _encoded;
    _decoded;
    _decodedMemo;
    url;
    version;
    names = [];
    resolvedSources;
    constructor(map, from) {
        this.map = map;
        const { mappings, names, sources } = map;
        this.version = map.version;
        this.names = names || [];
        this._encoded = mappings || '';
        this._decodedMemo = memoizedState();
        this.url = from;
        this.resolvedSources = (sources || []).map((s) => posixResolve(s || '', from));
    }
}
// This is a copy of all methods that we need for decoding a source map from "@jridgewell/trace-mapping"
function indexOf(mappings, index) {
    const idx = mappings.indexOf(';', index);
    return idx === -1 ? mappings.length : idx;
}
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const charToInt = new Uint8Array(128); // z is 122 in ASCII
for (let i = 0; i < chars.length; i++) {
    const c = chars.charCodeAt(i);
    charToInt[c] = i;
}
function decodeInteger(mappings, pos, state, j) {
    let value = 0;
    let shift = 0;
    let integer = 0;
    do {
        const c = mappings.charCodeAt(pos++);
        integer = charToInt[c];
        value |= (integer & 31) << shift;
        shift += 5;
    } while (integer & 32);
    const shouldNegate = value & 1;
    value >>>= 1;
    if (shouldNegate) {
        value = -0x80000000 | -value;
    }
    state[j] += value;
    return pos;
}
const comma = ','.charCodeAt(0);
function hasMoreVlq(mappings, i, length) {
    if (i >= length)
        return false;
    return mappings.charCodeAt(i) !== comma;
}
function decode(mappings) {
    const state = new Int32Array(5);
    const decoded = [];
    let index = 0;
    do {
        const semi = indexOf(mappings, index);
        const line = [];
        let sorted = true;
        let lastCol = 0;
        state[0] = 0;
        for (let i = index; i < semi; i++) {
            let seg;
            i = decodeInteger(mappings, i, state, 0); // genColumn
            const col = state[0];
            if (col < lastCol)
                sorted = false;
            lastCol = col;
            if (hasMoreVlq(mappings, i, semi)) {
                i = decodeInteger(mappings, i, state, 1); // sourcesIndex
                i = decodeInteger(mappings, i, state, 2); // sourceLine
                i = decodeInteger(mappings, i, state, 3); // sourceColumn
                if (hasMoreVlq(mappings, i, semi)) {
                    i = decodeInteger(mappings, i, state, 4); // namesIndex
                    seg = [col, state[1], state[2], state[3], state[4]];
                }
                else {
                    seg = [col, state[1], state[2], state[3]];
                }
            }
            else {
                seg = [col];
            }
            line.push(seg);
        }
        if (!sorted)
            line.sort((a, b) => a[0] - b[0]);
        decoded.push(line);
        index = semi + 1;
    } while (index <= mappings.length);
    return decoded;
}
const LINE_GTR_ZERO = '`line` must be greater than 0 (lines start at line 1)';
const COL_GTR_EQ_ZERO = '`column` must be greater than or equal to 0 (columns start at column 0)';
const COLUMN = 0;
const SOURCES_INDEX = 1;
const SOURCE_LINE = 2;
const SOURCE_COLUMN = 3;
const NAMES_INDEX = 4;
function OMapping(source, line, column, name) {
    return { source, line, column, name };
}
function decodedMappings(map) {
    return map._decoded || (map._decoded = decode(map._encoded));
}
let found = false;
function binarySearch(haystack, needle, low, high) {
    while (low <= high) {
        const mid = low + ((high - low) >> 1);
        const cmp = haystack[mid][COLUMN] - needle;
        if (cmp === 0) {
            found = true;
            return mid;
        }
        if (cmp < 0) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    found = false;
    return low - 1;
}
function lowerBound(haystack, needle, index) {
    for (let i = index - 1; i >= 0; index = i--) {
        if (haystack[i][COLUMN] !== needle)
            break;
    }
    return index;
}
function memoizedState() {
    return {
        lastKey: -1,
        lastNeedle: -1,
        lastIndex: -1,
    };
}
function memoizedBinarySearch(haystack, needle, state, key) {
    const { lastKey, lastNeedle, lastIndex } = state;
    let low = 0;
    let high = haystack.length - 1;
    if (key === lastKey) {
        if (needle === lastNeedle) {
            found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle;
            return lastIndex;
        }
        if (needle >= lastNeedle) {
            // lastIndex may be -1 if the previous needle was not found.
            low = lastIndex === -1 ? 0 : lastIndex;
        }
        else {
            high = lastIndex;
        }
    }
    state.lastKey = key;
    state.lastNeedle = needle;
    return (state.lastIndex = binarySearch(haystack, needle, low, high));
}
function traceSegmentInternal(segments, memo, line, column) {
    let index = memoizedBinarySearch(segments, column, memo, line);
    if (found) {
        index = lowerBound(segments, column, index);
    }
    if (index === -1 || index === segments.length)
        return -1;
    return index;
}
function getOriginalPosition(map, { line, column }) {
    line--;
    if (line < 0)
        throw new Error(LINE_GTR_ZERO);
    if (column < 0)
        throw new Error(COL_GTR_EQ_ZERO);
    map._decodedMemo ??= memoizedState();
    const decoded = decodedMappings(map);
    // It's common for parent source maps to have pointers to lines that have no
    // mapping (like a "//# sourceMappingURL=") at the end of the child file.
    if (line >= decoded.length)
        return null;
    const segments = decoded[line];
    const index = traceSegmentInternal(segments, map._decodedMemo, line, column);
    if (index === -1)
        return null;
    const segment = segments[index];
    if (segment.length === 1)
        return null;
    const { names, resolvedSources } = map;
    return OMapping(resolvedSources[segment[SOURCES_INDEX]], segment[SOURCE_LINE] + 1, segment[SOURCE_COLUMN], segment.length === 5 ? names[segment[NAMES_INDEX]] : null);
}

let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';
const VITE_RUNTIME_SOURCEMAPPING_URL = `${SOURCEMAPPING_URL}=data:application/json;charset=utf-8`;
const VITE_RUNTIME_SOURCEMAPPING_REGEXP = new RegExp(`//# ${VITE_RUNTIME_SOURCEMAPPING_URL};base64,(.+)`);
class ModuleCacheMap extends Map {
    root;
    constructor(root, entries) {
        super(entries);
        this.root = withTrailingSlash(root);
    }
    normalize(fsPath) {
        return normalizeModuleId(fsPath, this.root);
    }
    /**
     * Assign partial data to the map
     */
    update(fsPath, mod) {
        fsPath = this.normalize(fsPath);
        if (!super.has(fsPath))
            this.setByModuleId(fsPath, mod);
        else
            Object.assign(super.get(fsPath), mod);
        return this;
    }
    setByModuleId(modulePath, mod) {
        return super.set(modulePath, mod);
    }
    set(fsPath, mod) {
        return this.setByModuleId(this.normalize(fsPath), mod);
    }
    getByModuleId(modulePath) {
        if (!super.has(modulePath))
            this.setByModuleId(modulePath, {});
        const mod = super.get(modulePath);
        if (!mod.imports) {
            Object.assign(mod, {
                imports: new Set(),
                importers: new Set(),
            });
        }
        return mod;
    }
    get(fsPath) {
        return this.getByModuleId(this.normalize(fsPath));
    }
    deleteByModuleId(modulePath) {
        return super.delete(modulePath);
    }
    delete(fsPath) {
        return this.deleteByModuleId(this.normalize(fsPath));
    }
    /**
     * Invalidate modules that dependent on the given modules, up to the main entry
     */
    invalidateDepTree(ids, invalidated = new Set()) {
        for (const _id of ids) {
            const id = this.normalize(_id);
            if (invalidated.has(id))
                continue;
            invalidated.add(id);
            const mod = super.get(id);
            if (mod?.importers)
                this.invalidateDepTree(mod.importers, invalidated);
            super.delete(id);
        }
        return invalidated;
    }
    /**
     * Invalidate dependency modules of the given modules, down to the bottom-level dependencies
     */
    invalidateSubDepTree(ids, invalidated = new Set()) {
        for (const _id of ids) {
            const id = this.normalize(_id);
            if (invalidated.has(id))
                continue;
            invalidated.add(id);
            const subIds = Array.from(super.entries())
                .filter(([, mod]) => mod.importers?.has(id))
                .map(([key]) => key);
            subIds.length && this.invalidateSubDepTree(subIds, invalidated);
            super.delete(id);
        }
        return invalidated;
    }
    getSourceMap(moduleId) {
        const mod = this.get(moduleId);
        if (mod.map)
            return mod.map;
        if (!mod.meta || !('code' in mod.meta))
            return null;
        const mapString = mod.meta.code.match(VITE_RUNTIME_SOURCEMAPPING_REGEXP)?.[1];
        if (!mapString)
            return null;
        const baseFile = mod.meta.file || moduleId.split('?')[0];
        mod.map = new DecodedMap(JSON.parse(decodeBase64(mapString)), baseFile);
        return mod.map;
    }
}
function withTrailingSlash(path) {
    if (path[path.length - 1] !== '/') {
        return `${path}/`;
    }
    return path;
}
// unique id that is not available as "$bare_import" like "test"
const prefixedBuiltins = new Set(['node:test']);
// transform file url to id
// virtual:custom -> virtual:custom
// \0custom -> \0custom
// /root/id -> /id
// /root/id.js -> /id.js
// C:/root/id.js -> /id.js
// C:\root\id.js -> /id.js
function normalizeModuleId(file, root) {
    if (prefixedBuiltins.has(file))
        return file;
    // unix style, but Windows path still starts with the drive letter to check the root
    let unixFile = file
        .replace(/\\/g, '/')
        .replace(/^\/@fs\//, isWindows ? '' : '/')
        .replace(/^node:/, '')
        .replace(/^\/+/, '/');
    if (unixFile.startsWith(root)) {
        // keep slash
        unixFile = unixFile.slice(root.length - 1);
    }
    // if it's not in the root, keep it as a path, not a URL
    return unixFile.replace(/^file:\//, '/');
}

// they are exported from ssrTransform plugin, but we can't import from there for performance reasons
const ssrModuleExportsKey = `__vite_ssr_exports__`;
const ssrImportKey = `__vite_ssr_import__`;
const ssrDynamicImportKey = `__vite_ssr_dynamic_import__`;
const ssrExportAllKey = `__vite_ssr_exportAll__`;
const ssrImportMetaKey = `__vite_ssr_import_meta__`;

const noop = () => { };
const silentConsole = {
    debug: noop,
    error: noop,
};

// updates to HMR should go one after another. It is possible to trigger another update during the invalidation for example.
function createHMRHandler(runtime) {
    const queue = new Queue();
    return (payload) => queue.enqueue(() => handleHMRPayload(runtime, payload));
}
async function handleHMRPayload(runtime, payload) {
    const hmrClient = runtime.hmrClient;
    if (!hmrClient || runtime.isDestroyed())
        return;
    switch (payload.type) {
        case 'connected':
            hmrClient.logger.debug(`[vite] connected.`);
            hmrClient.messenger.flush();
            break;
        case 'update':
            await hmrClient.notifyListeners('vite:beforeUpdate', payload);
            await Promise.all(payload.updates.map(async (update) => {
                if (update.type === 'js-update') {
                    // runtime always caches modules by their full path without /@id/ prefix
                    update.acceptedPath = unwrapId(update.acceptedPath);
                    update.path = unwrapId(update.path);
                    return hmrClient.queueUpdate(update);
                }
                hmrClient.logger.error('[vite] css hmr is not supported in runtime mode.');
            }));
            await hmrClient.notifyListeners('vite:afterUpdate', payload);
            break;
        case 'custom': {
            await hmrClient.notifyListeners(payload.event, payload.data);
            break;
        }
        case 'full-reload':
            hmrClient.logger.debug(`[vite] program reload`);
            await hmrClient.notifyListeners('vite:beforeFullReload', payload);
            Array.from(runtime.moduleCache.keys()).forEach((id) => {
                if (!id.includes('node_modules')) {
                    runtime.moduleCache.deleteByModuleId(id);
                }
            });
            for (const id of runtime.entrypoints) {
                await runtime.executeUrl(id);
            }
            break;
        case 'prune':
            await hmrClient.notifyListeners('vite:beforePrune', payload);
            hmrClient.prunePaths(payload.paths);
            break;
        case 'error': {
            await hmrClient.notifyListeners('vite:error', payload);
            const err = payload.err;
            hmrClient.logger.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
            break;
        }
        default: {
            const check = payload;
            return check;
        }
    }
}
class Queue {
    queue = [];
    pending = false;
    enqueue(promise) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promise,
                resolve,
                reject,
            });
            this.dequeue();
        });
    }
    dequeue() {
        if (this.pending) {
            return false;
        }
        const item = this.queue.shift();
        if (!item) {
            return false;
        }
        this.pending = true;
        item
            .promise()
            .then(item.resolve)
            .catch(item.reject)
            .finally(() => {
            this.pending = false;
            this.dequeue();
        });
        return true;
    }
}

const sourceMapCache = {};
const fileContentsCache = {};
const moduleGraphs = new Set();
const retrieveFileHandlers = new Set();
const retrieveSourceMapHandlers = new Set();
const createExecHandlers = (handlers) => {
    return ((...args) => {
        for (const handler of handlers) {
            const result = handler(...args);
            if (result)
                return result;
        }
        return null;
    });
};
const retrieveFileFromHandlers = createExecHandlers(retrieveFileHandlers);
const retrievSourceMapFromHandlers = createExecHandlers(retrieveSourceMapHandlers);
let overriden = false;
const originalPrepare = Error.prepareStackTrace;
function resetInterceptor(runtime, options) {
    moduleGraphs.delete(runtime.moduleCache);
    if (options.retrieveFile)
        retrieveFileHandlers.delete(options.retrieveFile);
    if (options.retrieveSourceMap)
        retrieveSourceMapHandlers.delete(options.retrieveSourceMap);
    if (moduleGraphs.size === 0) {
        Error.prepareStackTrace = originalPrepare;
        overriden = false;
    }
}
function interceptStackTrace(runtime, options = {}) {
    if (!overriden) {
        Error.prepareStackTrace = prepareStackTrace;
        overriden = true;
    }
    moduleGraphs.add(runtime.moduleCache);
    if (options.retrieveFile)
        retrieveFileHandlers.add(options.retrieveFile);
    if (options.retrieveSourceMap)
        retrieveSourceMapHandlers.add(options.retrieveSourceMap);
    return () => resetInterceptor(runtime, options);
}
// Support URLs relative to a directory, but be careful about a protocol prefix
function supportRelativeURL(file, url) {
    if (!file)
        return url;
    const dir = posixDirname(file.replace(/\\/g, '/'));
    const match = /^\w+:\/\/[^/]*/.exec(dir);
    let protocol = match ? match[0] : '';
    const startPath = dir.slice(protocol.length);
    if (protocol && /^\/\w:/.test(startPath)) {
        // handle file:///C:/ paths
        protocol += '/';
        return (protocol +
            posixResolve(dir.slice(protocol.length), url).replace(/\\/g, '/'));
    }
    return protocol + posixResolve(dir.slice(protocol.length), url);
}
function getRuntimeSourceMap(position) {
    for (const moduleCache of moduleGraphs) {
        const sourceMap = moduleCache.getSourceMap(position.source);
        if (sourceMap) {
            return {
                url: position.source,
                map: sourceMap,
                vite: true,
            };
        }
    }
    return null;
}
function retrieveFile(path) {
    if (path in fileContentsCache)
        return fileContentsCache[path];
    const content = retrieveFileFromHandlers(path);
    if (typeof content === 'string') {
        fileContentsCache[path] = content;
        return content;
    }
    return null;
}
function retrieveSourceMapURL(source) {
    // Get the URL of the source map
    const fileData = retrieveFile(source);
    if (!fileData)
        return null;
    const re = /\/\/[@#]\s*sourceMappingURL=([^\s'"]+)\s*$|\/\*[@#]\s*sourceMappingURL=[^\s*'"]+\s*\*\/\s*$/gm;
    // Keep executing the search to find the *last* sourceMappingURL to avoid
    // picking up sourceMappingURLs from comments, strings, etc.
    let lastMatch, match;
    while ((match = re.exec(fileData)))
        lastMatch = match;
    if (!lastMatch)
        return null;
    return lastMatch[1];
}
const reSourceMap = /^data:application\/json[^,]+base64,/;
function retrieveSourceMap(source) {
    const urlAndMap = retrievSourceMapFromHandlers(source);
    if (urlAndMap)
        return urlAndMap;
    let sourceMappingURL = retrieveSourceMapURL(source);
    if (!sourceMappingURL)
        return null;
    // Read the contents of the source map
    let sourceMapData;
    if (reSourceMap.test(sourceMappingURL)) {
        // Support source map URL as a data url
        const rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
        sourceMapData = Buffer.from(rawData, 'base64').toString();
        sourceMappingURL = source;
    }
    else {
        // Support source map URLs relative to the source URL
        sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
        sourceMapData = retrieveFile(sourceMappingURL);
    }
    if (!sourceMapData)
        return null;
    return {
        url: sourceMappingURL,
        map: sourceMapData,
    };
}
function mapSourcePosition(position) {
    if (!position.source)
        return position;
    let sourceMap = getRuntimeSourceMap(position);
    if (!sourceMap)
        sourceMap = sourceMapCache[position.source];
    if (!sourceMap) {
        // Call the (overrideable) retrieveSourceMap function to get the source map.
        const urlAndMap = retrieveSourceMap(position.source);
        if (urlAndMap && urlAndMap.map) {
            const url = urlAndMap.url;
            sourceMap = sourceMapCache[position.source] = {
                url,
                map: new DecodedMap(typeof urlAndMap.map === 'string'
                    ? JSON.parse(urlAndMap.map)
                    : urlAndMap.map, url),
            };
            const contents = sourceMap.map?.map.sourcesContent;
            // Load all sources stored inline with the source map into the file cache
            // to pretend like they are already loaded. They may not exist on disk.
            if (sourceMap.map && contents) {
                sourceMap.map.resolvedSources.forEach((source, i) => {
                    const content = contents[i];
                    if (content && source && url) {
                        const contentUrl = supportRelativeURL(url, source);
                        fileContentsCache[contentUrl] = content;
                    }
                });
            }
        }
        else {
            sourceMap = sourceMapCache[position.source] = {
                url: null,
                map: null,
            };
        }
    }
    // Resolve the source URL relative to the URL of the source map
    if (sourceMap && sourceMap.map && sourceMap.url) {
        const originalPosition = getOriginalPosition(sourceMap.map, position);
        // Only return the original position if a matching line was found. If no
        // matching line is found then we return position instead, which will cause
        // the stack trace to print the path and line for the compiled file. It is
        // better to give a precise location in the compiled file than a vague
        // location in the original file.
        if (originalPosition && originalPosition.source != null) {
            originalPosition.source = supportRelativeURL(sourceMap.url, originalPosition.source);
            if (sourceMap.vite) {
                // @ts-expect-error vite is not defined
                originalPosition._vite = true;
            }
            return originalPosition;
        }
    }
    return position;
}
// Parses code generated by FormatEvalOrigin(), a function inside V8:
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js
function mapEvalOrigin(origin) {
    // Most eval() calls are in this format
    let match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
    if (match) {
        const position = mapSourcePosition({
            name: null,
            source: match[2],
            line: +match[3],
            column: +match[4] - 1,
        });
        return `eval at ${match[1]} (${position.source}:${position.line}:${position.column + 1})`;
    }
    // Parse nested eval() calls using recursion
    match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
    if (match)
        return `eval at ${match[1]} (${mapEvalOrigin(match[2])})`;
    // Make sure we still return useful information if we didn't find anything
    return origin;
}
// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
// implementation of wrapCallSite() used to just forward to the actual source
// code of CallSite.prototype.toString but unfortunately a new release of V8
// did something to the prototype chain and broke the shim. The only fix I
// could find was copy/paste.
function CallSiteToString() {
    let fileName;
    let fileLocation = '';
    if (this.isNative()) {
        fileLocation = 'native';
    }
    else {
        fileName = this.getScriptNameOrSourceURL();
        if (!fileName && this.isEval()) {
            fileLocation = this.getEvalOrigin();
            fileLocation += ', '; // Expecting source position to follow.
        }
        if (fileName) {
            fileLocation += fileName;
        }
        else {
            // Source code does not originate from a file and is not native, but we
            // can still get the source position inside the source string, e.g. in
            // an eval string.
            fileLocation += '<anonymous>';
        }
        const lineNumber = this.getLineNumber();
        if (lineNumber != null) {
            fileLocation += `:${lineNumber}`;
            const columnNumber = this.getColumnNumber();
            if (columnNumber)
                fileLocation += `:${columnNumber}`;
        }
    }
    let line = '';
    const functionName = this.getFunctionName();
    let addSuffix = true;
    const isConstructor = this.isConstructor();
    const isMethodCall = !(this.isToplevel() || isConstructor);
    if (isMethodCall) {
        let typeName = this.getTypeName();
        // Fixes shim to be backward compatable with Node v0 to v4
        if (typeName === '[object Object]')
            typeName = 'null';
        const methodName = this.getMethodName();
        if (functionName) {
            if (typeName && functionName.indexOf(typeName) !== 0)
                line += `${typeName}.`;
            line += functionName;
            if (methodName &&
                functionName.indexOf(`.${methodName}`) !==
                    functionName.length - methodName.length - 1)
                line += ` [as ${methodName}]`;
        }
        else {
            line += `${typeName}.${methodName || '<anonymous>'}`;
        }
    }
    else if (isConstructor) {
        line += `new ${functionName || '<anonymous>'}`;
    }
    else if (functionName) {
        line += functionName;
    }
    else {
        line += fileLocation;
        addSuffix = false;
    }
    if (addSuffix)
        line += ` (${fileLocation})`;
    return line;
}
function cloneCallSite(frame) {
    const object = {};
    Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach((name) => {
        const key = name;
        // @ts-expect-error difficult to type
        object[key] = /^(?:is|get)/.test(name)
            ? function () {
                return frame[key].call(frame);
            }
            : frame[key];
    });
    object.toString = CallSiteToString;
    return object;
}
function wrapCallSite(frame, state) {
    // provides interface backward compatibility
    if (state === undefined)
        state = { nextPosition: null, curPosition: null };
    if (frame.isNative()) {
        state.curPosition = null;
        return frame;
    }
    // Most call sites will return the source file from getFileName(), but code
    // passed to eval() ending in "//# sourceURL=..." will return the source file
    // from getScriptNameOrSourceURL() instead
    const source = frame.getFileName() || frame.getScriptNameOrSourceURL();
    if (source) {
        const line = frame.getLineNumber();
        let column = frame.getColumnNumber() - 1;
        // Fix position in Node where some (internal) code is prepended.
        // See https://github.com/evanw/node-source-map-support/issues/36
        // Header removed in node at ^10.16 || >=11.11.0
        // v11 is not an LTS candidate, we can just test the one version with it.
        // Test node versions for: 10.16-19, 10.20+, 12-19, 20-99, 100+, or 11.11
        const headerLength = 62;
        if (line === 1 && column > headerLength && !frame.isEval())
            column -= headerLength;
        const position = mapSourcePosition({
            name: null,
            source,
            line,
            column,
        });
        state.curPosition = position;
        frame = cloneCallSite(frame);
        const originalFunctionName = frame.getFunctionName;
        frame.getFunctionName = function () {
            const name = (() => {
                if (state.nextPosition == null)
                    return originalFunctionName();
                return state.nextPosition.name || originalFunctionName();
            })();
            return name === 'eval' && '_vite' in position ? null : name;
        };
        frame.getFileName = function () {
            return position.source ?? undefined;
        };
        frame.getLineNumber = function () {
            return position.line;
        };
        frame.getColumnNumber = function () {
            return position.column + 1;
        };
        frame.getScriptNameOrSourceURL = function () {
            return position.source;
        };
        return frame;
    }
    // Code called using eval() needs special handling
    let origin = frame.isEval() && frame.getEvalOrigin();
    if (origin) {
        origin = mapEvalOrigin(origin);
        frame = cloneCallSite(frame);
        frame.getEvalOrigin = function () {
            return origin || undefined;
        };
        return frame;
    }
    // If we get here then we were unable to change the source position
    return frame;
}
function prepareStackTrace(error, stack) {
    const name = error.name || 'Error';
    const message = error.message || '';
    const errorString = `${name}: ${message}`;
    const state = { nextPosition: null, curPosition: null };
    const processedStack = [];
    for (let i = stack.length - 1; i >= 0; i--) {
        processedStack.push(`\n    at ${wrapCallSite(stack[i], state)}`);
        state.nextPosition = state.curPosition;
    }
    state.curPosition = state.nextPosition = null;
    return errorString + processedStack.reverse().join('');
}

function enableSourceMapSupport(runtime) {
    if (runtime.options.sourcemapInterceptor === 'node') {
        if (typeof process === 'undefined') {
            throw new TypeError(`Cannot use "sourcemapInterceptor: 'node'" because global "process" variable is not available.`);
        }
        if (typeof process.setSourceMapsEnabled !== 'function') {
            throw new TypeError(`Cannot use "sourcemapInterceptor: 'node'" because "process.setSourceMapsEnabled" function is not available. Please use Node >= 16.6.0.`);
        }
        const isEnabledAlready = process.sourceMapsEnabled ?? false;
        process.setSourceMapsEnabled(true);
        return () => !isEnabledAlready && process.setSourceMapsEnabled(false);
    }
    return interceptStackTrace(runtime, typeof runtime.options.sourcemapInterceptor === 'object'
        ? runtime.options.sourcemapInterceptor
        : undefined);
}

class ViteRuntime {
    options;
    runner;
    debug;
    /**
     * Holds the cache of modules
     * Keys of the map are ids
     */
    moduleCache;
    hmrClient;
    entrypoints = new Set();
    idToUrlMap = new Map();
    fileToIdMap = new Map();
    envProxy = new Proxy({}, {
        get(_, p) {
            throw new Error(`[vite-runtime] Dynamic access of "import.meta.env" is not supported. Please, use "import.meta.env.${String(p)}" instead.`);
        },
    });
    _destroyed = false;
    _resetSourceMapSupport;
    constructor(options, runner, debug) {
        this.options = options;
        this.runner = runner;
        this.debug = debug;
        this.moduleCache = options.moduleCache ?? new ModuleCacheMap(options.root);
        if (typeof options.hmr === 'object') {
            this.hmrClient = new HMRClient(options.hmr.logger === false
                ? silentConsole
                : options.hmr.logger || console, options.hmr.connection, ({ acceptedPath, ssrInvalidates }) => {
                this.moduleCache.delete(acceptedPath);
                if (ssrInvalidates) {
                    this.invalidateFiles(ssrInvalidates);
                }
                return this.executeUrl(acceptedPath);
            });
            options.hmr.connection.onUpdate(createHMRHandler(this));
        }
        if (options.sourcemapInterceptor !== false) {
            this._resetSourceMapSupport = enableSourceMapSupport(this);
        }
    }
    /**
     * URL to execute. Accepts file path, server path or id relative to the root.
     */
    async executeUrl(url) {
        url = this.normalizeEntryUrl(url);
        const fetchedModule = await this.cachedModule(url);
        return await this.cachedRequest(url, fetchedModule);
    }
    /**
     * Entrypoint URL to execute. Accepts file path, server path or id relative to the root.
     * In the case of a full reload triggered by HMR, this is the module that will be reloaded.
     * If this method is called multiple times, all entrypoints will be reloaded one at a time.
     */
    async executeEntrypoint(url) {
        url = this.normalizeEntryUrl(url);
        const fetchedModule = await this.cachedModule(url);
        return await this.cachedRequest(url, fetchedModule, [], {
            entrypoint: true,
        });
    }
    /**
     * Clear all caches including HMR listeners.
     */
    clearCache() {
        this.moduleCache.clear();
        this.idToUrlMap.clear();
        this.entrypoints.clear();
        this.hmrClient?.clear();
    }
    /**
     * Clears all caches, removes all HMR listeners, and resets source map support.
     * This method doesn't stop the HMR connection.
     */
    async destroy() {
        this._resetSourceMapSupport?.();
        this.clearCache();
        this.hmrClient = undefined;
        this._destroyed = true;
    }
    /**
     * Returns `true` if the runtime has been destroyed by calling `destroy()` method.
     */
    isDestroyed() {
        return this._destroyed;
    }
    invalidateFiles(files) {
        files.forEach((file) => {
            const ids = this.fileToIdMap.get(file);
            if (ids) {
                ids.forEach((id) => this.moduleCache.deleteByModuleId(id));
            }
        });
    }
    // we don't use moduleCache.normalize because this URL doesn't have to follow the same rules
    // this URL is something that user passes down manually, and is later resolved by fetchModule
    // moduleCache.normalize is used on resolved "file" property
    normalizeEntryUrl(url) {
        // expect fetchModule to resolve relative module correctly
        if (url[0] === '.') {
            return url;
        }
        // file:///C:/root/id.js -> C:/root/id.js
        if (url.startsWith('file://')) {
            // 8 is the length of "file:///"
            url = url.slice(isWindows ? 8 : 7);
        }
        url = url.replace(/\\/g, '/');
        const _root = this.options.root;
        const root = _root[_root.length - 1] === '/' ? _root : `${_root}/`;
        // strip root from the URL because fetchModule prefers a public served url path
        // packages/vite/src/node/server/moduleGraph.ts:17
        if (url.startsWith(root)) {
            // /root/id.js -> /id.js
            // C:/root/id.js -> /id.js
            // 1 is to keep the leading slash
            return url.slice(root.length - 1);
        }
        // if it's a server url (starts with a slash), keep it, otherwise assume a virtual module
        // /id.js -> /id.js
        // virtual:custom -> /@id/virtual:custom
        return url[0] === '/' ? url : wrapId(url);
    }
    processImport(exports, fetchResult, metadata) {
        if (!('externalize' in fetchResult)) {
            return exports;
        }
        const { id, type } = fetchResult;
        if (type !== 'module' && type !== 'commonjs')
            return exports;
        analyzeImportedModDifference(exports, id, type, metadata);
        return proxyGuardOnlyEsm(exports, id, metadata);
    }
    async cachedRequest(id, fetchedModule, callstack = [], metadata) {
        const moduleId = fetchedModule.id;
        if (metadata?.entrypoint) {
            this.entrypoints.add(moduleId);
        }
        const mod = this.moduleCache.getByModuleId(moduleId);
        const { imports, importers } = mod;
        const importee = callstack[callstack.length - 1];
        if (importee)
            importers.add(importee);
        // check circular dependency
        if (callstack.includes(moduleId) ||
            Array.from(imports.values()).some((i) => importers.has(i))) {
            if (mod.exports)
                return this.processImport(mod.exports, fetchedModule, metadata);
        }
        let debugTimer;
        if (this.debug) {
            debugTimer = setTimeout(() => {
                const getStack = () => `stack:\n${[...callstack, moduleId]
                    .reverse()
                    .map((p) => `  - ${p}`)
                    .join('\n')}`;
                this.debug(`[vite-runtime] module ${moduleId} takes over 2s to load.\n${getStack()}`);
            }, 2000);
        }
        try {
            // cached module
            if (mod.promise)
                return this.processImport(await mod.promise, fetchedModule, metadata);
            const promise = this.directRequest(id, fetchedModule, callstack);
            mod.promise = promise;
            mod.evaluated = false;
            return this.processImport(await promise, fetchedModule, metadata);
        }
        finally {
            mod.evaluated = true;
            if (debugTimer)
                clearTimeout(debugTimer);
        }
    }
    async cachedModule(id, importer) {
        if (this._destroyed) {
            throw new Error(`[vite] Vite runtime has been destroyed.`);
        }
        const normalized = this.idToUrlMap.get(id);
        if (normalized) {
            const mod = this.moduleCache.getByModuleId(normalized);
            if (mod.meta) {
                return mod.meta;
            }
        }
        this.debug?.('[vite-runtime] fetching', id);
        // fast return for established externalized patterns
        const fetchedModule = id.startsWith('data:')
            ? ({ externalize: id, type: 'builtin' })
            : await this.options.fetchModule(id, importer);
        // base moduleId on "file" and not on id
        // if `import(variable)` is called it's possible that it doesn't have an extension for example
        // if we used id for that, it's possible to have a duplicated module
        const idQuery = id.split('?')[1];
        const query = idQuery ? `?${idQuery}` : '';
        const file = 'file' in fetchedModule ? fetchedModule.file : undefined;
        const fullFile = file ? `${file}${query}` : id;
        const moduleId = this.moduleCache.normalize(fullFile);
        const mod = this.moduleCache.getByModuleId(moduleId);
        fetchedModule.id = moduleId;
        mod.meta = fetchedModule;
        if (file) {
            const fileModules = this.fileToIdMap.get(file) || [];
            fileModules.push(moduleId);
            this.fileToIdMap.set(file, fileModules);
        }
        this.idToUrlMap.set(id, moduleId);
        this.idToUrlMap.set(unwrapId(id), moduleId);
        return fetchedModule;
    }
    // override is allowed, consider this a public API
    async directRequest(id, fetchResult, _callstack) {
        const moduleId = fetchResult.id;
        const callstack = [..._callstack, moduleId];
        const mod = this.moduleCache.getByModuleId(moduleId);
        const request = async (dep, metadata) => {
            const fetchedModule = await this.cachedModule(dep, moduleId);
            const depMod = this.moduleCache.getByModuleId(fetchedModule.id);
            depMod.importers.add(moduleId);
            mod.imports.add(fetchedModule.id);
            return this.cachedRequest(dep, fetchedModule, callstack, metadata);
        };
        const dynamicRequest = async (dep) => {
            // it's possible to provide an object with toString() method inside import()
            dep = String(dep);
            if (dep[0] === '.') {
                dep = posixResolve(posixDirname(id), dep);
            }
            return request(dep, { isDynamicImport: true });
        };
        if ('externalize' in fetchResult) {
            const { externalize } = fetchResult;
            this.debug?.('[vite-runtime] externalizing', externalize);
            const exports = await this.runner.runExternalModule(externalize);
            mod.exports = exports;
            return exports;
        }
        const { code, file } = fetchResult;
        if (code == null) {
            const importer = callstack[callstack.length - 2];
            throw new Error(`[vite-runtime] Failed to load "${id}"${importer ? ` imported from ${importer}` : ''}`);
        }
        const modulePath = cleanUrl(file || moduleId);
        // disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
        const href = posixPathToFileHref(modulePath);
        const filename = modulePath;
        const dirname = posixDirname(modulePath);
        const meta = {
            filename: isWindows ? toWindowsPath(filename) : filename,
            dirname: isWindows ? toWindowsPath(dirname) : dirname,
            url: href,
            env: this.envProxy,
            resolve(id, parent) {
                throw new Error('[vite-runtime] "import.meta.resolve" is not supported.');
            },
            // should be replaced during transformation
            glob() {
                throw new Error('[vite-runtime] "import.meta.glob" is not supported.');
            },
        };
        const exports = Object.create(null);
        Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module',
            enumerable: false,
            configurable: false,
        });
        mod.exports = exports;
        let hotContext;
        if (this.hmrClient) {
            Object.defineProperty(meta, 'hot', {
                enumerable: true,
                get: () => {
                    if (!this.hmrClient) {
                        throw new Error(`[vite-runtime] HMR client was destroyed.`);
                    }
                    this.debug?.('[vite-runtime] creating hmr context for', moduleId);
                    hotContext ||= new HMRContext(this.hmrClient, moduleId);
                    return hotContext;
                },
                set: (value) => {
                    hotContext = value;
                },
            });
        }
        const context = {
            [ssrImportKey]: request,
            [ssrDynamicImportKey]: dynamicRequest,
            [ssrModuleExportsKey]: exports,
            [ssrExportAllKey]: (obj) => exportAll(exports, obj),
            [ssrImportMetaKey]: meta,
        };
        this.debug?.('[vite-runtime] executing', href);
        await this.runner.runViteModule(context, code, id);
        return exports;
    }
}
function exportAll(exports, sourceModule) {
    // when a module exports itself it causes
    // call stack error
    if (exports === sourceModule)
        return;
    if (isPrimitive(sourceModule) ||
        Array.isArray(sourceModule) ||
        sourceModule instanceof Promise)
        return;
    for (const key in sourceModule) {
        if (key !== 'default' && key !== '__esModule') {
            try {
                Object.defineProperty(exports, key, {
                    enumerable: true,
                    configurable: true,
                    get: () => sourceModule[key],
                });
            }
            catch (_err) { }
        }
    }
}
/**
 * Vite converts `import { } from 'foo'` to `const _ = __vite_ssr_import__('foo')`.
 * Top-level imports and dynamic imports work slightly differently in Node.js.
 * This function normalizes the differences so it matches prod behaviour.
 */
function analyzeImportedModDifference(mod, rawId, moduleType, metadata) {
    // No normalization needed if the user already dynamic imports this module
    if (metadata?.isDynamicImport)
        return;
    // If file path is ESM, everything should be fine
    if (moduleType === 'module')
        return;
    // For non-ESM, named imports is done via static analysis with cjs-module-lexer in Node.js.
    // If the user named imports a specifier that can't be analyzed, error.
    if (metadata?.importedNames?.length) {
        const missingBindings = metadata.importedNames.filter((s) => !(s in mod));
        if (missingBindings.length) {
            const lastBinding = missingBindings[missingBindings.length - 1];
            // Copied from Node.js
            throw new SyntaxError(`\
[vite] Named export '${lastBinding}' not found. The requested module '${rawId}' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from '${rawId}';
const {${missingBindings.join(', ')}} = pkg;
`);
        }
    }
}
/**
 * Guard invalid named exports only, similar to how Node.js errors for top-level imports.
 * But since we transform as dynamic imports, we need to emulate the error manually.
 */
function proxyGuardOnlyEsm(mod, rawId, metadata) {
    // If the module doesn't import anything explicitly, e.g. `import 'foo'` or
    // `import * as foo from 'foo'`, we can skip the proxy guard.
    if (!metadata?.importedNames?.length)
        return mod;
    return new Proxy(mod, {
        get(mod, prop) {
            if (prop !== 'then' && !(prop in mod)) {
                throw new SyntaxError(`[vite] The requested module '${rawId}' does not provide an export named '${prop.toString()}'`);
            }
            return mod[prop];
        },
    });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = async function () { }.constructor;
class ESModulesRunner {
    async runViteModule(context, code) {
        // use AsyncFunction instead of vm module to support broader array of environments out of the box
        const initModule = new AsyncFunction(ssrModuleExportsKey, ssrImportMetaKey, ssrImportKey, ssrDynamicImportKey, ssrExportAllKey, 
        // source map should already be inlined by Vite
        '"use strict";' + code);
        await initModule(context[ssrModuleExportsKey], context[ssrImportMetaKey], context[ssrImportKey], context[ssrDynamicImportKey], context[ssrExportAllKey]);
        Object.seal(context[ssrModuleExportsKey]);
    }
    runExternalModule(filepath) {
        return import(filepath);
    }
}

export { ESModulesRunner, ModuleCacheMap, ViteRuntime, ssrDynamicImportKey, ssrExportAllKey, ssrImportKey, ssrImportMetaKey, ssrModuleExportsKey };
