import { FontStyle } from './types.mjs';

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
({
    InDebugMode: (typeof process !== 'undefined' && !!process.env['VSCODE_TEXTMATE_DEBUG'])
});

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
var EncodedTokenAttributes;
(function (EncodedTokenAttributes) {
    function toBinaryStr(encodedTokenAttributes) {
        return encodedTokenAttributes.toString(2).padStart(32, "0");
    }
    EncodedTokenAttributes.toBinaryStr = toBinaryStr;
    function print(encodedTokenAttributes) {
        const languageId = EncodedTokenAttributes.getLanguageId(encodedTokenAttributes);
        const tokenType = EncodedTokenAttributes.getTokenType(encodedTokenAttributes);
        const fontStyle = EncodedTokenAttributes.getFontStyle(encodedTokenAttributes);
        const foreground = EncodedTokenAttributes.getForeground(encodedTokenAttributes);
        const background = EncodedTokenAttributes.getBackground(encodedTokenAttributes);
        console.log({
            languageId: languageId,
            tokenType: tokenType,
            fontStyle: fontStyle,
            foreground: foreground,
            background: background,
        });
    }
    EncodedTokenAttributes.print = print;
    function getLanguageId(encodedTokenAttributes) {
        return ((encodedTokenAttributes & 255 /* EncodedTokenDataConsts.LANGUAGEID_MASK */) >>>
            0 /* EncodedTokenDataConsts.LANGUAGEID_OFFSET */);
    }
    EncodedTokenAttributes.getLanguageId = getLanguageId;
    function getTokenType(encodedTokenAttributes) {
        return ((encodedTokenAttributes & 768 /* EncodedTokenDataConsts.TOKEN_TYPE_MASK */) >>>
            8 /* EncodedTokenDataConsts.TOKEN_TYPE_OFFSET */);
    }
    EncodedTokenAttributes.getTokenType = getTokenType;
    function containsBalancedBrackets(encodedTokenAttributes) {
        return (encodedTokenAttributes & 1024 /* EncodedTokenDataConsts.BALANCED_BRACKETS_MASK */) !== 0;
    }
    EncodedTokenAttributes.containsBalancedBrackets = containsBalancedBrackets;
    function getFontStyle(encodedTokenAttributes) {
        return ((encodedTokenAttributes & 30720 /* EncodedTokenDataConsts.FONT_STYLE_MASK */) >>>
            11 /* EncodedTokenDataConsts.FONT_STYLE_OFFSET */);
    }
    EncodedTokenAttributes.getFontStyle = getFontStyle;
    function getForeground(encodedTokenAttributes) {
        return ((encodedTokenAttributes & 16744448 /* EncodedTokenDataConsts.FOREGROUND_MASK */) >>>
            15 /* EncodedTokenDataConsts.FOREGROUND_OFFSET */);
    }
    EncodedTokenAttributes.getForeground = getForeground;
    function getBackground(encodedTokenAttributes) {
        return ((encodedTokenAttributes & 4278190080 /* EncodedTokenDataConsts.BACKGROUND_MASK */) >>>
            24 /* EncodedTokenDataConsts.BACKGROUND_OFFSET */);
    }
    EncodedTokenAttributes.getBackground = getBackground;
    /**
     * Updates the fields in `metadata`.
     * A value of `0`, `NotSet` or `null` indicates that the corresponding field should be left as is.
     */
    function set(encodedTokenAttributes, languageId, tokenType, containsBalancedBrackets, fontStyle, foreground, background) {
        let _languageId = EncodedTokenAttributes.getLanguageId(encodedTokenAttributes);
        let _tokenType = EncodedTokenAttributes.getTokenType(encodedTokenAttributes);
        let _containsBalancedBracketsBit = EncodedTokenAttributes.containsBalancedBrackets(encodedTokenAttributes) ? 1 : 0;
        let _fontStyle = EncodedTokenAttributes.getFontStyle(encodedTokenAttributes);
        let _foreground = EncodedTokenAttributes.getForeground(encodedTokenAttributes);
        let _background = EncodedTokenAttributes.getBackground(encodedTokenAttributes);
        if (languageId !== 0) {
            _languageId = languageId;
        }
        if (tokenType !== 8 /* OptionalStandardTokenType.NotSet */) {
            _tokenType = fromOptionalTokenType(tokenType);
        }
        if (containsBalancedBrackets !== null) {
            _containsBalancedBracketsBit = containsBalancedBrackets ? 1 : 0;
        }
        if (fontStyle !== -1 /* FontStyle.NotSet */) {
            _fontStyle = fontStyle;
        }
        if (foreground !== 0) {
            _foreground = foreground;
        }
        if (background !== 0) {
            _background = background;
        }
        return (((_languageId << 0 /* EncodedTokenDataConsts.LANGUAGEID_OFFSET */) |
            (_tokenType << 8 /* EncodedTokenDataConsts.TOKEN_TYPE_OFFSET */) |
            (_containsBalancedBracketsBit <<
                10 /* EncodedTokenDataConsts.BALANCED_BRACKETS_OFFSET */) |
            (_fontStyle << 11 /* EncodedTokenDataConsts.FONT_STYLE_OFFSET */) |
            (_foreground << 15 /* EncodedTokenDataConsts.FOREGROUND_OFFSET */) |
            (_background << 24 /* EncodedTokenDataConsts.BACKGROUND_OFFSET */)) >>>
            0);
    }
    EncodedTokenAttributes.set = set;
})(EncodedTokenAttributes || (EncodedTokenAttributes = {}));
function toOptionalTokenType(standardType) {
    return standardType;
}
function fromOptionalTokenType(standardType) {
    return standardType;
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
function createMatchers(selector, matchesName) {
    const results = [];
    const tokenizer = newTokenizer(selector);
    let token = tokenizer.next();
    while (token !== null) {
        let priority = 0;
        if (token.length === 2 && token.charAt(1) === ':') {
            switch (token.charAt(0)) {
                case 'R':
                    priority = 1;
                    break;
                case 'L':
                    priority = -1;
                    break;
                default:
                    console.log(`Unknown priority ${token} in scope selector`);
            }
            token = tokenizer.next();
        }
        let matcher = parseConjunction();
        results.push({ matcher, priority });
        if (token !== ',') {
            break;
        }
        token = tokenizer.next();
    }
    return results;
    function parseOperand() {
        if (token === '-') {
            token = tokenizer.next();
            const expressionToNegate = parseOperand();
            return matcherInput => !!expressionToNegate && !expressionToNegate(matcherInput);
        }
        if (token === '(') {
            token = tokenizer.next();
            const expressionInParents = parseInnerExpression();
            if (token === ')') {
                token = tokenizer.next();
            }
            return expressionInParents;
        }
        if (isIdentifier(token)) {
            const identifiers = [];
            do {
                identifiers.push(token);
                token = tokenizer.next();
            } while (isIdentifier(token));
            return matcherInput => matchesName(identifiers, matcherInput);
        }
        return null;
    }
    function parseConjunction() {
        const matchers = [];
        let matcher = parseOperand();
        while (matcher) {
            matchers.push(matcher);
            matcher = parseOperand();
        }
        return matcherInput => matchers.every(matcher => matcher(matcherInput)); // and
    }
    function parseInnerExpression() {
        const matchers = [];
        let matcher = parseConjunction();
        while (matcher) {
            matchers.push(matcher);
            if (token === '|' || token === ',') {
                do {
                    token = tokenizer.next();
                } while (token === '|' || token === ','); // ignore subsequent commas
            }
            else {
                break;
            }
            matcher = parseConjunction();
        }
        return matcherInput => matchers.some(matcher => matcher(matcherInput)); // or
    }
}
function isIdentifier(token) {
    return !!token && !!token.match(/[\w\.:]+/);
}
function newTokenizer(input) {
    let regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
    let match = regex.exec(input);
    return {
        next: () => {
            if (!match) {
                return null;
            }
            const res = match[0];
            match = regex.exec(input);
            return res;
        }
    };
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
function disposeOnigString(str) {
    if (typeof str.dispose === 'function') {
        str.dispose();
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
function clone(something) {
    return doClone(something);
}
function doClone(something) {
    if (Array.isArray(something)) {
        return cloneArray(something);
    }
    if (typeof something === 'object') {
        return cloneObj(something);
    }
    return something;
}
function cloneArray(arr) {
    let r = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        r[i] = doClone(arr[i]);
    }
    return r;
}
function cloneObj(obj) {
    let r = {};
    for (let key in obj) {
        r[key] = doClone(obj[key]);
    }
    return r;
}
function mergeObjects(target, ...sources) {
    sources.forEach(source => {
        for (let key in source) {
            target[key] = source[key];
        }
    });
    return target;
}
function basename(path) {
    const idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
    if (idx === 0) {
        return path;
    }
    else if (~idx === path.length - 1) {
        return basename(path.substring(0, path.length - 1));
    }
    else {
        return path.substr(~idx + 1);
    }
}
let CAPTURING_REGEX_SOURCE = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g;
class RegexSource {
    static hasCaptures(regexSource) {
        if (regexSource === null) {
            return false;
        }
        CAPTURING_REGEX_SOURCE.lastIndex = 0;
        return CAPTURING_REGEX_SOURCE.test(regexSource);
    }
    static replaceCaptures(regexSource, captureSource, captureIndices) {
        return regexSource.replace(CAPTURING_REGEX_SOURCE, (match, index, commandIndex, command) => {
            let capture = captureIndices[parseInt(index || commandIndex, 10)];
            if (capture) {
                let result = captureSource.substring(capture.start, capture.end);
                // Remove leading dots that would make the selector invalid
                while (result[0] === '.') {
                    result = result.substring(1);
                }
                switch (command) {
                    case 'downcase':
                        return result.toLowerCase();
                    case 'upcase':
                        return result.toUpperCase();
                    default:
                        return result;
                }
            }
            else {
                return match;
            }
        });
    }
}
function strcmp(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
function strArrCmp(a, b) {
    if (a === null && b === null) {
        return 0;
    }
    if (!a) {
        return -1;
    }
    if (!b) {
        return 1;
    }
    let len1 = a.length;
    let len2 = b.length;
    if (len1 === len2) {
        for (let i = 0; i < len1; i++) {
            let res = strcmp(a[i], b[i]);
            if (res !== 0) {
                return res;
            }
        }
        return 0;
    }
    return len1 - len2;
}
function isValidHexColor(hex) {
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
        // #rrggbb
        return true;
    }
    if (/^#[0-9a-f]{8}$/i.test(hex)) {
        // #rrggbbaa
        return true;
    }
    if (/^#[0-9a-f]{3}$/i.test(hex)) {
        // #rgb
        return true;
    }
    if (/^#[0-9a-f]{4}$/i.test(hex)) {
        // #rgba
        return true;
    }
    return false;
}
/**
 * Escapes regular expression characters in a given string
 */
function escapeRegExpCharacters(value) {
    return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
}
class CachedFn {
    fn;
    cache = new Map();
    constructor(fn) {
        this.fn = fn;
    }
    get(key) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const value = this.fn(key);
        this.cache.set(key, value);
        return value;
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/**
 * References the top level rule of a grammar with the given scope name.
*/
class TopLevelRuleReference {
    scopeName;
    constructor(scopeName) {
        this.scopeName = scopeName;
    }
    toKey() {
        return this.scopeName;
    }
}
/**
 * References a rule of a grammar in the top level repository section with the given name.
*/
class TopLevelRepositoryRuleReference {
    scopeName;
    ruleName;
    constructor(scopeName, ruleName) {
        this.scopeName = scopeName;
        this.ruleName = ruleName;
    }
    toKey() {
        return `${this.scopeName}#${this.ruleName}`;
    }
}
class ExternalReferenceCollector {
    _references = [];
    _seenReferenceKeys = new Set();
    get references() {
        return this._references;
    }
    visitedRule = new Set();
    add(reference) {
        const key = reference.toKey();
        if (this._seenReferenceKeys.has(key)) {
            return;
        }
        this._seenReferenceKeys.add(key);
        this._references.push(reference);
    }
}
class ScopeDependencyProcessor {
    repo;
    initialScopeName;
    seenFullScopeRequests = new Set();
    seenPartialScopeRequests = new Set();
    Q;
    constructor(repo, initialScopeName) {
        this.repo = repo;
        this.initialScopeName = initialScopeName;
        this.seenFullScopeRequests.add(this.initialScopeName);
        this.Q = [new TopLevelRuleReference(this.initialScopeName)];
    }
    processQueue() {
        const q = this.Q;
        this.Q = [];
        const deps = new ExternalReferenceCollector();
        for (const dep of q) {
            collectReferencesOfReference(dep, this.initialScopeName, this.repo, deps);
        }
        for (const dep of deps.references) {
            if (dep instanceof TopLevelRuleReference) {
                if (this.seenFullScopeRequests.has(dep.scopeName)) {
                    // already processed
                    continue;
                }
                this.seenFullScopeRequests.add(dep.scopeName);
                this.Q.push(dep);
            }
            else {
                if (this.seenFullScopeRequests.has(dep.scopeName)) {
                    // already processed in full
                    continue;
                }
                if (this.seenPartialScopeRequests.has(dep.toKey())) {
                    // already processed
                    continue;
                }
                this.seenPartialScopeRequests.add(dep.toKey());
                this.Q.push(dep);
            }
        }
    }
}
function collectReferencesOfReference(reference, baseGrammarScopeName, repo, result) {
    const selfGrammar = repo.lookup(reference.scopeName);
    if (!selfGrammar) {
        if (reference.scopeName === baseGrammarScopeName) {
            throw new Error(`No grammar provided for <${baseGrammarScopeName}>`);
        }
        return;
    }
    const baseGrammar = repo.lookup(baseGrammarScopeName);
    if (reference instanceof TopLevelRuleReference) {
        collectExternalReferencesInTopLevelRule({ baseGrammar, selfGrammar }, result);
    }
    else {
        collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, { baseGrammar, selfGrammar, repository: selfGrammar.repository }, result);
    }
    const injections = repo.injections(reference.scopeName);
    if (injections) {
        for (const injection of injections) {
            result.add(new TopLevelRuleReference(injection));
        }
    }
}
function collectExternalReferencesInTopLevelRepositoryRule(ruleName, context, result) {
    if (context.repository && context.repository[ruleName]) {
        const rule = context.repository[ruleName];
        collectExternalReferencesInRules([rule], context, result);
    }
}
function collectExternalReferencesInTopLevelRule(context, result) {
    if (context.selfGrammar.patterns && Array.isArray(context.selfGrammar.patterns)) {
        collectExternalReferencesInRules(context.selfGrammar.patterns, { ...context, repository: context.selfGrammar.repository }, result);
    }
    if (context.selfGrammar.injections) {
        collectExternalReferencesInRules(Object.values(context.selfGrammar.injections), { ...context, repository: context.selfGrammar.repository }, result);
    }
}
function collectExternalReferencesInRules(rules, context, result) {
    for (const rule of rules) {
        if (result.visitedRule.has(rule)) {
            continue;
        }
        result.visitedRule.add(rule);
        const patternRepository = rule.repository ? mergeObjects({}, context.repository, rule.repository) : context.repository;
        if (Array.isArray(rule.patterns)) {
            collectExternalReferencesInRules(rule.patterns, { ...context, repository: patternRepository }, result);
        }
        const include = rule.include;
        if (!include) {
            continue;
        }
        const reference = parseInclude(include);
        switch (reference.kind) {
            case 0 /* IncludeReferenceKind.Base */:
                collectExternalReferencesInTopLevelRule({ ...context, selfGrammar: context.baseGrammar }, result);
                break;
            case 1 /* IncludeReferenceKind.Self */:
                collectExternalReferencesInTopLevelRule(context, result);
                break;
            case 2 /* IncludeReferenceKind.RelativeReference */:
                collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, { ...context, repository: patternRepository }, result);
                break;
            case 3 /* IncludeReferenceKind.TopLevelReference */:
            case 4 /* IncludeReferenceKind.TopLevelRepositoryReference */:
                const selfGrammar = reference.scopeName === context.selfGrammar.scopeName
                    ? context.selfGrammar
                    : reference.scopeName === context.baseGrammar.scopeName
                        ? context.baseGrammar
                        : undefined;
                if (selfGrammar) {
                    const newContext = { baseGrammar: context.baseGrammar, selfGrammar, repository: patternRepository };
                    if (reference.kind === 4 /* IncludeReferenceKind.TopLevelRepositoryReference */) {
                        collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, newContext, result);
                    }
                    else {
                        collectExternalReferencesInTopLevelRule(newContext, result);
                    }
                }
                else {
                    if (reference.kind === 4 /* IncludeReferenceKind.TopLevelRepositoryReference */) {
                        result.add(new TopLevelRepositoryRuleReference(reference.scopeName, reference.ruleName));
                    }
                    else {
                        result.add(new TopLevelRuleReference(reference.scopeName));
                    }
                }
                break;
        }
    }
}
class BaseReference {
    kind = 0 /* IncludeReferenceKind.Base */;
}
class SelfReference {
    kind = 1 /* IncludeReferenceKind.Self */;
}
class RelativeReference {
    ruleName;
    kind = 2 /* IncludeReferenceKind.RelativeReference */;
    constructor(ruleName) {
        this.ruleName = ruleName;
    }
}
class TopLevelReference {
    scopeName;
    kind = 3 /* IncludeReferenceKind.TopLevelReference */;
    constructor(scopeName) {
        this.scopeName = scopeName;
    }
}
class TopLevelRepositoryReference {
    scopeName;
    ruleName;
    kind = 4 /* IncludeReferenceKind.TopLevelRepositoryReference */;
    constructor(scopeName, ruleName) {
        this.scopeName = scopeName;
        this.ruleName = ruleName;
    }
}
function parseInclude(include) {
    if (include === '$base') {
        return new BaseReference();
    }
    else if (include === '$self') {
        return new SelfReference();
    }
    const indexOfSharp = include.indexOf("#");
    if (indexOfSharp === -1) {
        return new TopLevelReference(include);
    }
    else if (indexOfSharp === 0) {
        return new RelativeReference(include.substring(1));
    }
    else {
        const scopeName = include.substring(0, indexOfSharp);
        const ruleName = include.substring(indexOfSharp + 1);
        return new TopLevelRepositoryReference(scopeName, ruleName);
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const HAS_BACK_REFERENCES = /\\(\d+)/;
const BACK_REFERENCING_END = /\\(\d+)/g;
// This is a special constant to indicate that the end regexp matched.
const endRuleId = -1;
// This is a special constant to indicate that the while regexp matched.
const whileRuleId = -2;
function ruleIdFromNumber(id) {
    return id;
}
function ruleIdToNumber(id) {
    return id;
}
class Rule {
    $location;
    id;
    _nameIsCapturing;
    _name;
    _contentNameIsCapturing;
    _contentName;
    constructor($location, id, name, contentName) {
        this.$location = $location;
        this.id = id;
        this._name = name || null;
        this._nameIsCapturing = RegexSource.hasCaptures(this._name);
        this._contentName = contentName || null;
        this._contentNameIsCapturing = RegexSource.hasCaptures(this._contentName);
    }
    get debugName() {
        const location = this.$location ? `${basename(this.$location.filename)}:${this.$location.line}` : 'unknown';
        return `${this.constructor.name}#${this.id} @ ${location}`;
    }
    getName(lineText, captureIndices) {
        if (!this._nameIsCapturing || this._name === null || lineText === null || captureIndices === null) {
            return this._name;
        }
        return RegexSource.replaceCaptures(this._name, lineText, captureIndices);
    }
    getContentName(lineText, captureIndices) {
        if (!this._contentNameIsCapturing || this._contentName === null) {
            return this._contentName;
        }
        return RegexSource.replaceCaptures(this._contentName, lineText, captureIndices);
    }
}
class CaptureRule extends Rule {
    retokenizeCapturedWithRuleId;
    constructor($location, id, name, contentName, retokenizeCapturedWithRuleId) {
        super($location, id, name, contentName);
        this.retokenizeCapturedWithRuleId = retokenizeCapturedWithRuleId;
    }
    dispose() {
        // nothing to dispose
    }
    collectPatterns(grammar, out) {
        throw new Error('Not supported!');
    }
    compile(grammar, endRegexSource) {
        throw new Error('Not supported!');
    }
    compileAG(grammar, endRegexSource, allowA, allowG) {
        throw new Error('Not supported!');
    }
}
class MatchRule extends Rule {
    _match;
    captures;
    _cachedCompiledPatterns;
    constructor($location, id, name, match, captures) {
        super($location, id, name, null);
        this._match = new RegExpSource(match, this.id);
        this.captures = captures;
        this._cachedCompiledPatterns = null;
    }
    dispose() {
        if (this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns.dispose();
            this._cachedCompiledPatterns = null;
        }
    }
    get debugMatchRegExp() {
        return `${this._match.source}`;
    }
    collectPatterns(grammar, out) {
        out.push(this._match);
    }
    compile(grammar, endRegexSource) {
        return this._getCachedCompiledPatterns(grammar).compile(grammar);
    }
    compileAG(grammar, endRegexSource, allowA, allowG) {
        return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
    }
    _getCachedCompiledPatterns(grammar) {
        if (!this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns = new RegExpSourceList();
            this.collectPatterns(grammar, this._cachedCompiledPatterns);
        }
        return this._cachedCompiledPatterns;
    }
}
class IncludeOnlyRule extends Rule {
    hasMissingPatterns;
    patterns;
    _cachedCompiledPatterns;
    constructor($location, id, name, contentName, patterns) {
        super($location, id, name, contentName);
        this.patterns = patterns.patterns;
        this.hasMissingPatterns = patterns.hasMissingPatterns;
        this._cachedCompiledPatterns = null;
    }
    dispose() {
        if (this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns.dispose();
            this._cachedCompiledPatterns = null;
        }
    }
    collectPatterns(grammar, out) {
        for (const pattern of this.patterns) {
            const rule = grammar.getRule(pattern);
            rule.collectPatterns(grammar, out);
        }
    }
    compile(grammar, endRegexSource) {
        return this._getCachedCompiledPatterns(grammar).compile(grammar);
    }
    compileAG(grammar, endRegexSource, allowA, allowG) {
        return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
    }
    _getCachedCompiledPatterns(grammar) {
        if (!this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns = new RegExpSourceList();
            this.collectPatterns(grammar, this._cachedCompiledPatterns);
        }
        return this._cachedCompiledPatterns;
    }
}
class BeginEndRule extends Rule {
    _begin;
    beginCaptures;
    _end;
    endHasBackReferences;
    endCaptures;
    applyEndPatternLast;
    hasMissingPatterns;
    patterns;
    _cachedCompiledPatterns;
    constructor($location, id, name, contentName, begin, beginCaptures, end, endCaptures, applyEndPatternLast, patterns) {
        super($location, id, name, contentName);
        this._begin = new RegExpSource(begin, this.id);
        this.beginCaptures = beginCaptures;
        this._end = new RegExpSource(end ? end : '\uFFFF', -1);
        this.endHasBackReferences = this._end.hasBackReferences;
        this.endCaptures = endCaptures;
        this.applyEndPatternLast = applyEndPatternLast || false;
        this.patterns = patterns.patterns;
        this.hasMissingPatterns = patterns.hasMissingPatterns;
        this._cachedCompiledPatterns = null;
    }
    dispose() {
        if (this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns.dispose();
            this._cachedCompiledPatterns = null;
        }
    }
    get debugBeginRegExp() {
        return `${this._begin.source}`;
    }
    get debugEndRegExp() {
        return `${this._end.source}`;
    }
    getEndWithResolvedBackReferences(lineText, captureIndices) {
        return this._end.resolveBackReferences(lineText, captureIndices);
    }
    collectPatterns(grammar, out) {
        out.push(this._begin);
    }
    compile(grammar, endRegexSource) {
        return this._getCachedCompiledPatterns(grammar, endRegexSource).compile(grammar);
    }
    compileAG(grammar, endRegexSource, allowA, allowG) {
        return this._getCachedCompiledPatterns(grammar, endRegexSource).compileAG(grammar, allowA, allowG);
    }
    _getCachedCompiledPatterns(grammar, endRegexSource) {
        if (!this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns = new RegExpSourceList();
            for (const pattern of this.patterns) {
                const rule = grammar.getRule(pattern);
                rule.collectPatterns(grammar, this._cachedCompiledPatterns);
            }
            if (this.applyEndPatternLast) {
                this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end);
            }
            else {
                this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
            }
        }
        if (this._end.hasBackReferences) {
            if (this.applyEndPatternLast) {
                this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, endRegexSource);
            }
            else {
                this._cachedCompiledPatterns.setSource(0, endRegexSource);
            }
        }
        return this._cachedCompiledPatterns;
    }
}
class BeginWhileRule extends Rule {
    _begin;
    beginCaptures;
    whileCaptures;
    _while;
    whileHasBackReferences;
    hasMissingPatterns;
    patterns;
    _cachedCompiledPatterns;
    _cachedCompiledWhilePatterns;
    constructor($location, id, name, contentName, begin, beginCaptures, _while, whileCaptures, patterns) {
        super($location, id, name, contentName);
        this._begin = new RegExpSource(begin, this.id);
        this.beginCaptures = beginCaptures;
        this.whileCaptures = whileCaptures;
        this._while = new RegExpSource(_while, whileRuleId);
        this.whileHasBackReferences = this._while.hasBackReferences;
        this.patterns = patterns.patterns;
        this.hasMissingPatterns = patterns.hasMissingPatterns;
        this._cachedCompiledPatterns = null;
        this._cachedCompiledWhilePatterns = null;
    }
    dispose() {
        if (this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns.dispose();
            this._cachedCompiledPatterns = null;
        }
        if (this._cachedCompiledWhilePatterns) {
            this._cachedCompiledWhilePatterns.dispose();
            this._cachedCompiledWhilePatterns = null;
        }
    }
    get debugBeginRegExp() {
        return `${this._begin.source}`;
    }
    get debugWhileRegExp() {
        return `${this._while.source}`;
    }
    getWhileWithResolvedBackReferences(lineText, captureIndices) {
        return this._while.resolveBackReferences(lineText, captureIndices);
    }
    collectPatterns(grammar, out) {
        out.push(this._begin);
    }
    compile(grammar, endRegexSource) {
        return this._getCachedCompiledPatterns(grammar).compile(grammar);
    }
    compileAG(grammar, endRegexSource, allowA, allowG) {
        return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
    }
    _getCachedCompiledPatterns(grammar) {
        if (!this._cachedCompiledPatterns) {
            this._cachedCompiledPatterns = new RegExpSourceList();
            for (const pattern of this.patterns) {
                const rule = grammar.getRule(pattern);
                rule.collectPatterns(grammar, this._cachedCompiledPatterns);
            }
        }
        return this._cachedCompiledPatterns;
    }
    compileWhile(grammar, endRegexSource) {
        return this._getCachedCompiledWhilePatterns(grammar, endRegexSource).compile(grammar);
    }
    compileWhileAG(grammar, endRegexSource, allowA, allowG) {
        return this._getCachedCompiledWhilePatterns(grammar, endRegexSource).compileAG(grammar, allowA, allowG);
    }
    _getCachedCompiledWhilePatterns(grammar, endRegexSource) {
        if (!this._cachedCompiledWhilePatterns) {
            this._cachedCompiledWhilePatterns = new RegExpSourceList();
            this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while);
        }
        if (this._while.hasBackReferences) {
            this._cachedCompiledWhilePatterns.setSource(0, endRegexSource ? endRegexSource : '\uFFFF');
        }
        return this._cachedCompiledWhilePatterns;
    }
}
class RuleFactory {
    static createCaptureRule(helper, $location, name, contentName, retokenizeCapturedWithRuleId) {
        return helper.registerRule((id) => {
            return new CaptureRule($location, id, name, contentName, retokenizeCapturedWithRuleId);
        });
    }
    static getCompiledRuleId(desc, helper, repository) {
        if (!desc.id) {
            helper.registerRule((id) => {
                desc.id = id;
                if (desc.match) {
                    return new MatchRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.match, RuleFactory._compileCaptures(desc.captures, helper, repository));
                }
                if (typeof desc.begin === 'undefined') {
                    if (desc.repository) {
                        repository = mergeObjects({}, repository, desc.repository);
                    }
                    let patterns = desc.patterns;
                    if (typeof patterns === 'undefined' && desc.include) {
                        patterns = [{ include: desc.include }];
                    }
                    return new IncludeOnlyRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, RuleFactory._compilePatterns(patterns, helper, repository));
                }
                if (desc.while) {
                    return new BeginWhileRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.while, RuleFactory._compileCaptures(desc.whileCaptures || desc.captures, helper, repository), RuleFactory._compilePatterns(desc.patterns, helper, repository));
                }
                return new BeginEndRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.end, RuleFactory._compileCaptures(desc.endCaptures || desc.captures, helper, repository), desc.applyEndPatternLast, RuleFactory._compilePatterns(desc.patterns, helper, repository));
            });
        }
        return desc.id;
    }
    static _compileCaptures(captures, helper, repository) {
        let r = [];
        if (captures) {
            // Find the maximum capture id
            let maximumCaptureId = 0;
            for (const captureId in captures) {
                if (captureId === '$vscodeTextmateLocation') {
                    continue;
                }
                const numericCaptureId = parseInt(captureId, 10);
                if (numericCaptureId > maximumCaptureId) {
                    maximumCaptureId = numericCaptureId;
                }
            }
            // Initialize result
            for (let i = 0; i <= maximumCaptureId; i++) {
                r[i] = null;
            }
            // Fill out result
            for (const captureId in captures) {
                if (captureId === '$vscodeTextmateLocation') {
                    continue;
                }
                const numericCaptureId = parseInt(captureId, 10);
                let retokenizeCapturedWithRuleId = 0;
                if (captures[captureId].patterns) {
                    retokenizeCapturedWithRuleId = RuleFactory.getCompiledRuleId(captures[captureId], helper, repository);
                }
                r[numericCaptureId] = RuleFactory.createCaptureRule(helper, captures[captureId].$vscodeTextmateLocation, captures[captureId].name, captures[captureId].contentName, retokenizeCapturedWithRuleId);
            }
        }
        return r;
    }
    static _compilePatterns(patterns, helper, repository) {
        let r = [];
        if (patterns) {
            for (let i = 0, len = patterns.length; i < len; i++) {
                const pattern = patterns[i];
                let ruleId = -1;
                if (pattern.include) {
                    const reference = parseInclude(pattern.include);
                    switch (reference.kind) {
                        case 0 /* IncludeReferenceKind.Base */:
                        case 1 /* IncludeReferenceKind.Self */:
                            ruleId = RuleFactory.getCompiledRuleId(repository[pattern.include], helper, repository);
                            break;
                        case 2 /* IncludeReferenceKind.RelativeReference */:
                            // Local include found in `repository`
                            let localIncludedRule = repository[reference.ruleName];
                            if (localIncludedRule) {
                                ruleId = RuleFactory.getCompiledRuleId(localIncludedRule, helper, repository);
                            }
                            break;
                        case 3 /* IncludeReferenceKind.TopLevelReference */:
                        case 4 /* IncludeReferenceKind.TopLevelRepositoryReference */:
                            const externalGrammarName = reference.scopeName;
                            const externalGrammarInclude = reference.kind === 4 /* IncludeReferenceKind.TopLevelRepositoryReference */
                                ? reference.ruleName
                                : null;
                            // External include
                            const externalGrammar = helper.getExternalGrammar(externalGrammarName, repository);
                            if (externalGrammar) {
                                if (externalGrammarInclude) {
                                    let externalIncludedRule = externalGrammar.repository[externalGrammarInclude];
                                    if (externalIncludedRule) {
                                        ruleId = RuleFactory.getCompiledRuleId(externalIncludedRule, helper, externalGrammar.repository);
                                    }
                                }
                                else {
                                    ruleId = RuleFactory.getCompiledRuleId(externalGrammar.repository.$self, helper, externalGrammar.repository);
                                }
                            }
                            break;
                    }
                }
                else {
                    ruleId = RuleFactory.getCompiledRuleId(pattern, helper, repository);
                }
                if (ruleId !== -1) {
                    const rule = helper.getRule(ruleId);
                    let skipRule = false;
                    if (rule instanceof IncludeOnlyRule || rule instanceof BeginEndRule || rule instanceof BeginWhileRule) {
                        if (rule.hasMissingPatterns && rule.patterns.length === 0) {
                            skipRule = true;
                        }
                    }
                    if (skipRule) {
                        // console.log('REMOVING RULE ENTIRELY DUE TO EMPTY PATTERNS THAT ARE MISSING');
                        continue;
                    }
                    r.push(ruleId);
                }
            }
        }
        return {
            patterns: r,
            hasMissingPatterns: ((patterns ? patterns.length : 0) !== r.length)
        };
    }
}
class RegExpSource {
    source;
    ruleId;
    hasAnchor;
    hasBackReferences;
    _anchorCache;
    constructor(regExpSource, ruleId) {
        if (regExpSource) {
            const len = regExpSource.length;
            let lastPushedPos = 0;
            let output = [];
            let hasAnchor = false;
            for (let pos = 0; pos < len; pos++) {
                const ch = regExpSource.charAt(pos);
                if (ch === '\\') {
                    if (pos + 1 < len) {
                        const nextCh = regExpSource.charAt(pos + 1);
                        if (nextCh === 'z') {
                            output.push(regExpSource.substring(lastPushedPos, pos));
                            output.push('$(?!\\n)(?<!\\n)');
                            lastPushedPos = pos + 2;
                        }
                        else if (nextCh === 'A' || nextCh === 'G') {
                            hasAnchor = true;
                        }
                        pos++;
                    }
                }
            }
            this.hasAnchor = hasAnchor;
            if (lastPushedPos === 0) {
                // No \z hit
                this.source = regExpSource;
            }
            else {
                output.push(regExpSource.substring(lastPushedPos, len));
                this.source = output.join('');
            }
        }
        else {
            this.hasAnchor = false;
            this.source = regExpSource;
        }
        if (this.hasAnchor) {
            this._anchorCache = this._buildAnchorCache();
        }
        else {
            this._anchorCache = null;
        }
        this.ruleId = ruleId;
        this.hasBackReferences = HAS_BACK_REFERENCES.test(this.source);
        // console.log('input: ' + regExpSource + ' => ' + this.source + ', ' + this.hasAnchor);
    }
    clone() {
        return new RegExpSource(this.source, this.ruleId);
    }
    setSource(newSource) {
        if (this.source === newSource) {
            return;
        }
        this.source = newSource;
        if (this.hasAnchor) {
            this._anchorCache = this._buildAnchorCache();
        }
    }
    resolveBackReferences(lineText, captureIndices) {
        let capturedValues = captureIndices.map((capture) => {
            return lineText.substring(capture.start, capture.end);
        });
        BACK_REFERENCING_END.lastIndex = 0;
        return this.source.replace(BACK_REFERENCING_END, (match, g1) => {
            return escapeRegExpCharacters(capturedValues[parseInt(g1, 10)] || '');
        });
    }
    _buildAnchorCache() {
        let A0_G0_result = [];
        let A0_G1_result = [];
        let A1_G0_result = [];
        let A1_G1_result = [];
        let pos, len, ch, nextCh;
        for (pos = 0, len = this.source.length; pos < len; pos++) {
            ch = this.source.charAt(pos);
            A0_G0_result[pos] = ch;
            A0_G1_result[pos] = ch;
            A1_G0_result[pos] = ch;
            A1_G1_result[pos] = ch;
            if (ch === '\\') {
                if (pos + 1 < len) {
                    nextCh = this.source.charAt(pos + 1);
                    if (nextCh === 'A') {
                        A0_G0_result[pos + 1] = '\uFFFF';
                        A0_G1_result[pos + 1] = '\uFFFF';
                        A1_G0_result[pos + 1] = 'A';
                        A1_G1_result[pos + 1] = 'A';
                    }
                    else if (nextCh === 'G') {
                        A0_G0_result[pos + 1] = '\uFFFF';
                        A0_G1_result[pos + 1] = 'G';
                        A1_G0_result[pos + 1] = '\uFFFF';
                        A1_G1_result[pos + 1] = 'G';
                    }
                    else {
                        A0_G0_result[pos + 1] = nextCh;
                        A0_G1_result[pos + 1] = nextCh;
                        A1_G0_result[pos + 1] = nextCh;
                        A1_G1_result[pos + 1] = nextCh;
                    }
                    pos++;
                }
            }
        }
        return {
            A0_G0: A0_G0_result.join(''),
            A0_G1: A0_G1_result.join(''),
            A1_G0: A1_G0_result.join(''),
            A1_G1: A1_G1_result.join('')
        };
    }
    resolveAnchors(allowA, allowG) {
        if (!this.hasAnchor || !this._anchorCache) {
            return this.source;
        }
        if (allowA) {
            if (allowG) {
                return this._anchorCache.A1_G1;
            }
            else {
                return this._anchorCache.A1_G0;
            }
        }
        else {
            if (allowG) {
                return this._anchorCache.A0_G1;
            }
            else {
                return this._anchorCache.A0_G0;
            }
        }
    }
}
class RegExpSourceList {
    _items;
    _hasAnchors;
    _cached;
    _anchorCache;
    constructor() {
        this._items = [];
        this._hasAnchors = false;
        this._cached = null;
        this._anchorCache = {
            A0_G0: null,
            A0_G1: null,
            A1_G0: null,
            A1_G1: null
        };
    }
    dispose() {
        this._disposeCaches();
    }
    _disposeCaches() {
        if (this._cached) {
            this._cached.dispose();
            this._cached = null;
        }
        if (this._anchorCache.A0_G0) {
            this._anchorCache.A0_G0.dispose();
            this._anchorCache.A0_G0 = null;
        }
        if (this._anchorCache.A0_G1) {
            this._anchorCache.A0_G1.dispose();
            this._anchorCache.A0_G1 = null;
        }
        if (this._anchorCache.A1_G0) {
            this._anchorCache.A1_G0.dispose();
            this._anchorCache.A1_G0 = null;
        }
        if (this._anchorCache.A1_G1) {
            this._anchorCache.A1_G1.dispose();
            this._anchorCache.A1_G1 = null;
        }
    }
    push(item) {
        this._items.push(item);
        this._hasAnchors = this._hasAnchors || item.hasAnchor;
    }
    unshift(item) {
        this._items.unshift(item);
        this._hasAnchors = this._hasAnchors || item.hasAnchor;
    }
    length() {
        return this._items.length;
    }
    setSource(index, newSource) {
        if (this._items[index].source !== newSource) {
            // bust the cache
            this._disposeCaches();
            this._items[index].setSource(newSource);
        }
    }
    compile(onigLib) {
        if (!this._cached) {
            let regExps = this._items.map(e => e.source);
            this._cached = new CompiledRule(onigLib, regExps, this._items.map(e => e.ruleId));
        }
        return this._cached;
    }
    compileAG(onigLib, allowA, allowG) {
        if (!this._hasAnchors) {
            return this.compile(onigLib);
        }
        else {
            if (allowA) {
                if (allowG) {
                    if (!this._anchorCache.A1_G1) {
                        this._anchorCache.A1_G1 = this._resolveAnchors(onigLib, allowA, allowG);
                    }
                    return this._anchorCache.A1_G1;
                }
                else {
                    if (!this._anchorCache.A1_G0) {
                        this._anchorCache.A1_G0 = this._resolveAnchors(onigLib, allowA, allowG);
                    }
                    return this._anchorCache.A1_G0;
                }
            }
            else {
                if (allowG) {
                    if (!this._anchorCache.A0_G1) {
                        this._anchorCache.A0_G1 = this._resolveAnchors(onigLib, allowA, allowG);
                    }
                    return this._anchorCache.A0_G1;
                }
                else {
                    if (!this._anchorCache.A0_G0) {
                        this._anchorCache.A0_G0 = this._resolveAnchors(onigLib, allowA, allowG);
                    }
                    return this._anchorCache.A0_G0;
                }
            }
        }
    }
    _resolveAnchors(onigLib, allowA, allowG) {
        let regExps = this._items.map(e => e.resolveAnchors(allowA, allowG));
        return new CompiledRule(onigLib, regExps, this._items.map(e => e.ruleId));
    }
}
class CompiledRule {
    regExps;
    rules;
    scanner;
    constructor(onigLib, regExps, rules) {
        this.regExps = regExps;
        this.rules = rules;
        this.scanner = onigLib.createOnigScanner(regExps);
    }
    dispose() {
        if (typeof this.scanner.dispose === "function") {
            this.scanner.dispose();
        }
    }
    toString() {
        const r = [];
        for (let i = 0, len = this.rules.length; i < len; i++) {
            r.push("   - " + this.rules[i] + ": " + this.regExps[i]);
        }
        return r.join("\n");
    }
    findNextMatchSync(string, startPosition, options) {
        const result = this.scanner.findNextMatchSync(string, startPosition, options);
        if (!result) {
            return null;
        }
        return {
            ruleId: this.rules[result.index],
            captureIndices: result.captureIndices,
        };
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
class Theme {
    _colorMap;
    _defaults;
    _root;
    static createFromRawTheme(source, colorMap) {
        return this.createFromParsedTheme(parseTheme(source), colorMap);
    }
    static createFromParsedTheme(source, colorMap) {
        return resolveParsedThemeRules(source, colorMap);
    }
    _cachedMatchRoot = new CachedFn((scopeName) => this._root.match(scopeName));
    constructor(_colorMap, _defaults, _root) {
        this._colorMap = _colorMap;
        this._defaults = _defaults;
        this._root = _root;
    }
    getColorMap() {
        return this._colorMap.getColorMap();
    }
    getDefaults() {
        return this._defaults;
    }
    match(scopePath) {
        if (scopePath === null) {
            return this._defaults;
        }
        const scopeName = scopePath.scopeName;
        const matchingTrieElements = this._cachedMatchRoot.get(scopeName);
        const effectiveRule = matchingTrieElements.find((v) => _scopePathMatchesParentScopes(scopePath.parent, v.parentScopes));
        if (!effectiveRule) {
            return null;
        }
        return new StyleAttributes(effectiveRule.fontStyle, effectiveRule.foreground, effectiveRule.background);
    }
}
class ScopeStack {
    parent;
    scopeName;
    static push(path, scopeNames) {
        for (const name of scopeNames) {
            path = new ScopeStack(path, name);
        }
        return path;
    }
    static from(...segments) {
        let result = null;
        for (let i = 0; i < segments.length; i++) {
            result = new ScopeStack(result, segments[i]);
        }
        return result;
    }
    constructor(parent, scopeName) {
        this.parent = parent;
        this.scopeName = scopeName;
    }
    push(scopeName) {
        return new ScopeStack(this, scopeName);
    }
    getSegments() {
        let item = this;
        const result = [];
        while (item) {
            result.push(item.scopeName);
            item = item.parent;
        }
        result.reverse();
        return result;
    }
    toString() {
        return this.getSegments().join(' ');
    }
    extends(other) {
        if (this === other) {
            return true;
        }
        if (this.parent === null) {
            return false;
        }
        return this.parent.extends(other);
    }
    getExtensionIfDefined(base) {
        const result = [];
        let item = this;
        while (item && item !== base) {
            result.push(item.scopeName);
            item = item.parent;
        }
        return item === base ? result.reverse() : undefined;
    }
}
function _scopePathMatchesParentScopes(scopePath, parentScopes) {
    if (parentScopes === null) {
        return true;
    }
    let index = 0;
    let scopePattern = parentScopes[index];
    while (scopePath) {
        if (_matchesScope(scopePath.scopeName, scopePattern)) {
            index++;
            if (index === parentScopes.length) {
                return true;
            }
            scopePattern = parentScopes[index];
        }
        scopePath = scopePath.parent;
    }
    return false;
}
function _matchesScope(scopeName, scopePattern) {
    return scopePattern === scopeName || (scopeName.startsWith(scopePattern) && scopeName[scopePattern.length] === '.');
}
class StyleAttributes {
    fontStyle;
    foregroundId;
    backgroundId;
    constructor(fontStyle, foregroundId, backgroundId) {
        this.fontStyle = fontStyle;
        this.foregroundId = foregroundId;
        this.backgroundId = backgroundId;
    }
}
/**
 * Parse a raw theme into rules.
 */
function parseTheme(source) {
    if (!source) {
        return [];
    }
    if (!source.settings || !Array.isArray(source.settings)) {
        return [];
    }
    let settings = source.settings;
    let result = [], resultLen = 0;
    for (let i = 0, len = settings.length; i < len; i++) {
        let entry = settings[i];
        if (!entry.settings) {
            continue;
        }
        let scopes;
        if (typeof entry.scope === 'string') {
            let _scope = entry.scope;
            // remove leading commas
            _scope = _scope.replace(/^[,]+/, '');
            // remove trailing commans
            _scope = _scope.replace(/[,]+$/, '');
            scopes = _scope.split(',');
        }
        else if (Array.isArray(entry.scope)) {
            scopes = entry.scope;
        }
        else {
            scopes = [''];
        }
        let fontStyle = -1 /* FontStyle.NotSet */;
        if (typeof entry.settings.fontStyle === 'string') {
            fontStyle = 0 /* FontStyle.None */;
            let segments = entry.settings.fontStyle.split(' ');
            for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                let segment = segments[j];
                switch (segment) {
                    case 'italic':
                        fontStyle = fontStyle | 1 /* FontStyle.Italic */;
                        break;
                    case 'bold':
                        fontStyle = fontStyle | 2 /* FontStyle.Bold */;
                        break;
                    case 'underline':
                        fontStyle = fontStyle | 4 /* FontStyle.Underline */;
                        break;
                    case 'strikethrough':
                        fontStyle = fontStyle | 8 /* FontStyle.Strikethrough */;
                        break;
                }
            }
        }
        let foreground = null;
        if (typeof entry.settings.foreground === 'string' && isValidHexColor(entry.settings.foreground)) {
            foreground = entry.settings.foreground;
        }
        let background = null;
        if (typeof entry.settings.background === 'string' && isValidHexColor(entry.settings.background)) {
            background = entry.settings.background;
        }
        for (let j = 0, lenJ = scopes.length; j < lenJ; j++) {
            let _scope = scopes[j].trim();
            let segments = _scope.split(' ');
            let scope = segments[segments.length - 1];
            let parentScopes = null;
            if (segments.length > 1) {
                parentScopes = segments.slice(0, segments.length - 1);
                parentScopes.reverse();
            }
            result[resultLen++] = new ParsedThemeRule(scope, parentScopes, i, fontStyle, foreground, background);
        }
    }
    return result;
}
class ParsedThemeRule {
    scope;
    parentScopes;
    index;
    fontStyle;
    foreground;
    background;
    constructor(scope, parentScopes, index, fontStyle, foreground, background) {
        this.scope = scope;
        this.parentScopes = parentScopes;
        this.index = index;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
}
/**
 * Resolve rules (i.e. inheritance).
 */
function resolveParsedThemeRules(parsedThemeRules, _colorMap) {
    // Sort rules lexicographically, and then by index if necessary
    parsedThemeRules.sort((a, b) => {
        let r = strcmp(a.scope, b.scope);
        if (r !== 0) {
            return r;
        }
        r = strArrCmp(a.parentScopes, b.parentScopes);
        if (r !== 0) {
            return r;
        }
        return a.index - b.index;
    });
    // Determine defaults
    let defaultFontStyle = 0 /* FontStyle.None */;
    let defaultForeground = '#000000';
    let defaultBackground = '#ffffff';
    while (parsedThemeRules.length >= 1 && parsedThemeRules[0].scope === '') {
        let incomingDefaults = parsedThemeRules.shift();
        if (incomingDefaults.fontStyle !== -1 /* FontStyle.NotSet */) {
            defaultFontStyle = incomingDefaults.fontStyle;
        }
        if (incomingDefaults.foreground !== null) {
            defaultForeground = incomingDefaults.foreground;
        }
        if (incomingDefaults.background !== null) {
            defaultBackground = incomingDefaults.background;
        }
    }
    let colorMap = new ColorMap(_colorMap);
    let defaults = new StyleAttributes(defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
    let root = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* FontStyle.NotSet */, 0, 0), []);
    for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
        let rule = parsedThemeRules[i];
        root.insert(0, rule.scope, rule.parentScopes, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
    }
    return new Theme(colorMap, defaults, root);
}
class ColorMap {
    _isFrozen;
    _lastColorId;
    _id2color;
    _color2id;
    constructor(_colorMap) {
        this._lastColorId = 0;
        this._id2color = [];
        this._color2id = Object.create(null);
        if (Array.isArray(_colorMap)) {
            this._isFrozen = true;
            for (let i = 0, len = _colorMap.length; i < len; i++) {
                this._color2id[_colorMap[i]] = i;
                this._id2color[i] = _colorMap[i];
            }
        }
        else {
            this._isFrozen = false;
        }
    }
    getId(color) {
        if (color === null) {
            return 0;
        }
        color = color.toUpperCase();
        let value = this._color2id[color];
        if (value) {
            return value;
        }
        if (this._isFrozen) {
            throw new Error(`Missing color in color map - ${color}`);
        }
        value = ++this._lastColorId;
        this._color2id[color] = value;
        this._id2color[value] = color;
        return value;
    }
    getColorMap() {
        return this._id2color.slice(0);
    }
}
class ThemeTrieElementRule {
    scopeDepth;
    parentScopes;
    fontStyle;
    foreground;
    background;
    constructor(scopeDepth, parentScopes, fontStyle, foreground, background) {
        this.scopeDepth = scopeDepth;
        this.parentScopes = parentScopes;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
    clone() {
        return new ThemeTrieElementRule(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
    }
    static cloneArr(arr) {
        let r = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            r[i] = arr[i].clone();
        }
        return r;
    }
    acceptOverwrite(scopeDepth, fontStyle, foreground, background) {
        if (this.scopeDepth > scopeDepth) {
            console.log('how did this happen?');
        }
        else {
            this.scopeDepth = scopeDepth;
        }
        // console.log('TODO -> my depth: ' + this.scopeDepth + ', overwriting depth: ' + scopeDepth);
        if (fontStyle !== -1 /* FontStyle.NotSet */) {
            this.fontStyle = fontStyle;
        }
        if (foreground !== 0) {
            this.foreground = foreground;
        }
        if (background !== 0) {
            this.background = background;
        }
    }
}
class ThemeTrieElement {
    _mainRule;
    _children;
    _rulesWithParentScopes;
    constructor(_mainRule, rulesWithParentScopes = [], _children = {}) {
        this._mainRule = _mainRule;
        this._children = _children;
        this._rulesWithParentScopes = rulesWithParentScopes;
    }
    static _sortBySpecificity(arr) {
        if (arr.length === 1) {
            return arr;
        }
        arr.sort(this._cmpBySpecificity);
        return arr;
    }
    static _cmpBySpecificity(a, b) {
        if (a.scopeDepth === b.scopeDepth) {
            const aParentScopes = a.parentScopes;
            const bParentScopes = b.parentScopes;
            let aParentScopesLen = aParentScopes === null ? 0 : aParentScopes.length;
            let bParentScopesLen = bParentScopes === null ? 0 : bParentScopes.length;
            if (aParentScopesLen === bParentScopesLen) {
                for (let i = 0; i < aParentScopesLen; i++) {
                    const aLen = aParentScopes[i].length;
                    const bLen = bParentScopes[i].length;
                    if (aLen !== bLen) {
                        return bLen - aLen;
                    }
                }
            }
            return bParentScopesLen - aParentScopesLen;
        }
        return b.scopeDepth - a.scopeDepth;
    }
    match(scope) {
        if (scope === '') {
            return ThemeTrieElement._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
        }
        let dotIndex = scope.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = scope;
            tail = '';
        }
        else {
            head = scope.substring(0, dotIndex);
            tail = scope.substring(dotIndex + 1);
        }
        if (this._children.hasOwnProperty(head)) {
            return this._children[head].match(tail);
        }
        return ThemeTrieElement._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
    }
    insert(scopeDepth, scope, parentScopes, fontStyle, foreground, background) {
        if (scope === '') {
            this._doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background);
            return;
        }
        let dotIndex = scope.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = scope;
            tail = '';
        }
        else {
            head = scope.substring(0, dotIndex);
            tail = scope.substring(dotIndex + 1);
        }
        let child;
        if (this._children.hasOwnProperty(head)) {
            child = this._children[head];
        }
        else {
            child = new ThemeTrieElement(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes));
            this._children[head] = child;
        }
        child.insert(scopeDepth + 1, tail, parentScopes, fontStyle, foreground, background);
    }
    _doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background) {
        if (parentScopes === null) {
            // Merge into the main rule
            this._mainRule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
            return;
        }
        // Try to merge into existing rule
        for (let i = 0, len = this._rulesWithParentScopes.length; i < len; i++) {
            let rule = this._rulesWithParentScopes[i];
            if (strArrCmp(rule.parentScopes, parentScopes) === 0) {
                // bingo! => we get to merge this into an existing one
                rule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
                return;
            }
        }
        // Must add a new rule
        // Inherit from main rule
        if (fontStyle === -1 /* FontStyle.NotSet */) {
            fontStyle = this._mainRule.fontStyle;
        }
        if (foreground === 0) {
            foreground = this._mainRule.foreground;
        }
        if (background === 0) {
            background = this._mainRule.background;
        }
        this._rulesWithParentScopes.push(new ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background));
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
class BasicScopeAttributes {
    languageId;
    tokenType;
    constructor(languageId, tokenType) {
        this.languageId = languageId;
        this.tokenType = tokenType;
    }
}
class BasicScopeAttributesProvider {
    _defaultAttributes;
    _embeddedLanguagesMatcher;
    constructor(initialLanguageId, embeddedLanguages) {
        this._defaultAttributes = new BasicScopeAttributes(initialLanguageId, 8 /* OptionalStandardTokenType.NotSet */);
        this._embeddedLanguagesMatcher = new ScopeMatcher(Object.entries(embeddedLanguages || {}));
    }
    getDefaultAttributes() {
        return this._defaultAttributes;
    }
    getBasicScopeAttributes(scopeName) {
        if (scopeName === null) {
            return BasicScopeAttributesProvider._NULL_SCOPE_METADATA;
        }
        return this._getBasicScopeAttributes.get(scopeName);
    }
    static _NULL_SCOPE_METADATA = new BasicScopeAttributes(0, 0);
    _getBasicScopeAttributes = new CachedFn((scopeName) => {
        const languageId = this._scopeToLanguage(scopeName);
        const standardTokenType = this._toStandardTokenType(scopeName);
        return new BasicScopeAttributes(languageId, standardTokenType);
    });
    /**
     * Given a produced TM scope, return the language that token describes or null if unknown.
     * e.g. source.html => html, source.css.embedded.html => css, punctuation.definition.tag.html => null
     */
    _scopeToLanguage(scope) {
        return this._embeddedLanguagesMatcher.match(scope) || 0;
    }
    _toStandardTokenType(scopeName) {
        const m = scopeName.match(BasicScopeAttributesProvider.STANDARD_TOKEN_TYPE_REGEXP);
        if (!m) {
            return 8 /* OptionalStandardTokenType.NotSet */;
        }
        switch (m[1]) {
            case "comment":
                return 1 /* OptionalStandardTokenType.Comment */;
            case "string":
                return 2 /* OptionalStandardTokenType.String */;
            case "regex":
                return 3 /* OptionalStandardTokenType.RegEx */;
            case "meta.embedded":
                return 0 /* OptionalStandardTokenType.Other */;
        }
        throw new Error("Unexpected match for standard token type!");
    }
    static STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
}
class ScopeMatcher {
    values;
    scopesRegExp;
    constructor(values) {
        if (values.length === 0) {
            this.values = null;
            this.scopesRegExp = null;
        }
        else {
            this.values = new Map(values);
            // create the regex
            const escapedScopes = values.map(([scopeName, value]) => escapeRegExpCharacters(scopeName));
            escapedScopes.sort();
            escapedScopes.reverse(); // Longest scope first
            this.scopesRegExp = new RegExp(`^((${escapedScopes.join(")|(")}))($|\\.)`, "");
        }
    }
    match(scope) {
        if (!this.scopesRegExp) {
            return undefined;
        }
        const m = scope.match(this.scopesRegExp);
        if (!m) {
            // no scopes matched
            return undefined;
        }
        return this.values.get(m[1]);
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
class TokenizeStringResult {
    stack;
    stoppedEarly;
    constructor(stack, stoppedEarly) {
        this.stack = stack;
        this.stoppedEarly = stoppedEarly;
    }
}
/**
 * Tokenize a string
 * @param grammar
 * @param lineText
 * @param isFirstLine
 * @param linePos
 * @param stack
 * @param lineTokens
 * @param checkWhileConditions
 * @param timeLimit Use `0` to indicate no time limit
 * @returns the StackElement or StackElement.TIME_LIMIT_REACHED if the time limit has been reached
 */
function _tokenizeString(grammar, lineText, isFirstLine, linePos, stack, lineTokens, checkWhileConditions, timeLimit) {
    const lineLength = lineText.content.length;
    let STOP = false;
    let anchorPosition = -1;
    if (checkWhileConditions) {
        const whileCheckResult = _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens);
        stack = whileCheckResult.stack;
        linePos = whileCheckResult.linePos;
        isFirstLine = whileCheckResult.isFirstLine;
        anchorPosition = whileCheckResult.anchorPosition;
    }
    const startTime = Date.now();
    while (!STOP) {
        if (timeLimit !== 0) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > timeLimit) {
                return new TokenizeStringResult(stack, true);
            }
        }
        scanNext(); // potentially modifies linePos && anchorPosition
    }
    return new TokenizeStringResult(stack, false);
    function scanNext() {
        const r = matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
        if (!r) {
            // No match
            lineTokens.produce(stack, lineLength);
            STOP = true;
            return;
        }
        const captureIndices = r.captureIndices;
        const matchedRuleId = r.matchedRuleId;
        const hasAdvanced = captureIndices && captureIndices.length > 0
            ? captureIndices[0].end > linePos
            : false;
        if (matchedRuleId === endRuleId) {
            // We matched the `end` for this rule => pop it
            const poppedRule = stack.getRule(grammar);
            lineTokens.produce(stack, captureIndices[0].start);
            stack = stack.withContentNameScopesList(stack.nameScopesList);
            handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, poppedRule.endCaptures, captureIndices);
            lineTokens.produce(stack, captureIndices[0].end);
            // pop
            const popped = stack;
            stack = stack.parent;
            anchorPosition = popped.getAnchorPos();
            if (!hasAdvanced && popped.getEnterPos() === linePos) {
                // See https://github.com/Microsoft/vscode-textmate/issues/12
                // Let's assume this was a mistake by the grammar author and the intent was to continue in this state
                stack = popped;
                lineTokens.produce(stack, lineLength);
                STOP = true;
                return;
            }
        }
        else {
            // We matched a rule!
            const _rule = grammar.getRule(matchedRuleId);
            lineTokens.produce(stack, captureIndices[0].start);
            const beforePush = stack;
            // push it on the stack rule
            const scopeName = _rule.getName(lineText.content, captureIndices);
            const nameScopesList = stack.contentNameScopesList.pushAttributed(scopeName, grammar);
            stack = stack.push(matchedRuleId, linePos, anchorPosition, captureIndices[0].end === lineLength, null, nameScopesList, nameScopesList);
            if (_rule instanceof BeginEndRule) {
                const pushedRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                anchorPosition = captureIndices[0].end;
                const contentName = pushedRule.getContentName(lineText.content, captureIndices);
                const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
                stack = stack.withContentNameScopesList(contentNameScopesList);
                if (pushedRule.endHasBackReferences) {
                    stack = stack.withEndRule(pushedRule.getEndWithResolvedBackReferences(lineText.content, captureIndices));
                }
                if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
                    stack = stack.pop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            }
            else if (_rule instanceof BeginWhileRule) {
                const pushedRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                anchorPosition = captureIndices[0].end;
                const contentName = pushedRule.getContentName(lineText.content, captureIndices);
                const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
                stack = stack.withContentNameScopesList(contentNameScopesList);
                if (pushedRule.whileHasBackReferences) {
                    stack = stack.withEndRule(pushedRule.getWhileWithResolvedBackReferences(lineText.content, captureIndices));
                }
                if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
                    stack = stack.pop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            }
            else {
                const matchingRule = _rule;
                handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, matchingRule.captures, captureIndices);
                lineTokens.produce(stack, captureIndices[0].end);
                // pop rule immediately since it is a MatchRule
                stack = stack.pop();
                if (!hasAdvanced) {
                    stack = stack.safePop();
                    lineTokens.produce(stack, lineLength);
                    STOP = true;
                    return;
                }
            }
        }
        if (captureIndices[0].end > linePos) {
            // Advance stream
            linePos = captureIndices[0].end;
            isFirstLine = false;
        }
    }
}
/**
 * Walk the stack from bottom to top, and check each while condition in this order.
 * If any fails, cut off the entire stack above the failed while condition. While conditions
 * may also advance the linePosition.
 */
function _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
    let anchorPosition = (stack.beginRuleCapturedEOL ? 0 : -1);
    const whileRules = [];
    for (let node = stack; node; node = node.pop()) {
        const nodeRule = node.getRule(grammar);
        if (nodeRule instanceof BeginWhileRule) {
            whileRules.push({
                rule: nodeRule,
                stack: node
            });
        }
    }
    for (let whileRule = whileRules.pop(); whileRule; whileRule = whileRules.pop()) {
        const { ruleScanner, findOptions } = prepareRuleWhileSearch(whileRule.rule, grammar, whileRule.stack.endRule, isFirstLine, linePos === anchorPosition);
        const r = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
        if (r) {
            const matchedRuleId = r.ruleId;
            if (matchedRuleId !== whileRuleId) {
                // we shouldn't end up here
                stack = whileRule.stack.pop();
                break;
            }
            if (r.captureIndices && r.captureIndices.length) {
                lineTokens.produce(whileRule.stack, r.captureIndices[0].start);
                handleCaptures(grammar, lineText, isFirstLine, whileRule.stack, lineTokens, whileRule.rule.whileCaptures, r.captureIndices);
                lineTokens.produce(whileRule.stack, r.captureIndices[0].end);
                anchorPosition = r.captureIndices[0].end;
                if (r.captureIndices[0].end > linePos) {
                    linePos = r.captureIndices[0].end;
                    isFirstLine = false;
                }
            }
        }
        else {
            stack = whileRule.stack.pop();
            break;
        }
    }
    return { stack: stack, linePos: linePos, anchorPosition: anchorPosition, isFirstLine: isFirstLine };
}
function matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    // Look for normal grammar rule
    const matchResult = matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    // Look for injected rules
    const injections = grammar.getInjections();
    if (injections.length === 0) {
        // No injections whatsoever => early return
        return matchResult;
    }
    const injectionResult = matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    if (!injectionResult) {
        // No injections matched => early return
        return matchResult;
    }
    if (!matchResult) {
        // Only injections matched => early return
        return injectionResult;
    }
    // Decide if `matchResult` or `injectionResult` should win
    const matchResultScore = matchResult.captureIndices[0].start;
    const injectionResultScore = injectionResult.captureIndices[0].start;
    if (injectionResultScore < matchResultScore || (injectionResult.priorityMatch && injectionResultScore === matchResultScore)) {
        // injection won!
        return injectionResult;
    }
    return matchResult;
}
function matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    const rule = stack.getRule(grammar);
    const { ruleScanner, findOptions } = prepareRuleSearch(rule, grammar, stack.endRule, isFirstLine, linePos === anchorPosition);
    const r = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
    if (r) {
        return {
            captureIndices: r.captureIndices,
            matchedRuleId: r.ruleId
        };
    }
    return null;
}
function matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
    // The lower the better
    let bestMatchRating = Number.MAX_VALUE;
    let bestMatchCaptureIndices = null;
    let bestMatchRuleId;
    let bestMatchResultPriority = 0;
    const scopes = stack.contentNameScopesList.getScopeNames();
    for (let i = 0, len = injections.length; i < len; i++) {
        const injection = injections[i];
        if (!injection.matcher(scopes)) {
            // injection selector doesn't match stack
            continue;
        }
        const rule = grammar.getRule(injection.ruleId);
        const { ruleScanner, findOptions } = prepareRuleSearch(rule, grammar, null, isFirstLine, linePos === anchorPosition);
        const matchResult = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
        if (!matchResult) {
            continue;
        }
        const matchRating = matchResult.captureIndices[0].start;
        if (matchRating >= bestMatchRating) {
            // Injections are sorted by priority, so the previous injection had a better or equal priority
            continue;
        }
        bestMatchRating = matchRating;
        bestMatchCaptureIndices = matchResult.captureIndices;
        bestMatchRuleId = matchResult.ruleId;
        bestMatchResultPriority = injection.priority;
        if (bestMatchRating === linePos) {
            // No more need to look at the rest of the injections.
            break;
        }
    }
    if (bestMatchCaptureIndices) {
        return {
            priorityMatch: bestMatchResultPriority === -1,
            captureIndices: bestMatchCaptureIndices,
            matchedRuleId: bestMatchRuleId
        };
    }
    return null;
}
function prepareRuleSearch(rule, grammar, endRegexSource, allowA, allowG) {
    const ruleScanner = rule.compileAG(grammar, endRegexSource, allowA, allowG);
    return { ruleScanner, findOptions: 0 /* FindOption.None */ };
}
function prepareRuleWhileSearch(rule, grammar, endRegexSource, allowA, allowG) {
    const ruleScanner = rule.compileWhileAG(grammar, endRegexSource, allowA, allowG);
    return { ruleScanner, findOptions: 0 /* FindOption.None */ };
}
function handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, captures, captureIndices) {
    if (captures.length === 0) {
        return;
    }
    const lineTextContent = lineText.content;
    const len = Math.min(captures.length, captureIndices.length);
    const localStack = [];
    const maxEnd = captureIndices[0].end;
    for (let i = 0; i < len; i++) {
        const captureRule = captures[i];
        if (captureRule === null) {
            // Not interested
            continue;
        }
        const captureIndex = captureIndices[i];
        if (captureIndex.length === 0) {
            // Nothing really captured
            continue;
        }
        if (captureIndex.start > maxEnd) {
            // Capture going beyond consumed string
            break;
        }
        // pop captures while needed
        while (localStack.length > 0 && localStack[localStack.length - 1].endPos <= captureIndex.start) {
            // pop!
            lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
            localStack.pop();
        }
        if (localStack.length > 0) {
            lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, captureIndex.start);
        }
        else {
            lineTokens.produce(stack, captureIndex.start);
        }
        if (captureRule.retokenizeCapturedWithRuleId) {
            // the capture requires additional matching
            const scopeName = captureRule.getName(lineTextContent, captureIndices);
            const nameScopesList = stack.contentNameScopesList.pushAttributed(scopeName, grammar);
            const contentName = captureRule.getContentName(lineTextContent, captureIndices);
            const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
            const stackClone = stack.push(captureRule.retokenizeCapturedWithRuleId, captureIndex.start, -1, false, null, nameScopesList, contentNameScopesList);
            const onigSubStr = grammar.createOnigString(lineTextContent.substring(0, captureIndex.end));
            _tokenizeString(grammar, onigSubStr, (isFirstLine && captureIndex.start === 0), captureIndex.start, stackClone, lineTokens, false, /* no time limit */ 0);
            disposeOnigString(onigSubStr);
            continue;
        }
        const captureRuleScopeName = captureRule.getName(lineTextContent, captureIndices);
        if (captureRuleScopeName !== null) {
            // push
            const base = localStack.length > 0 ? localStack[localStack.length - 1].scopes : stack.contentNameScopesList;
            const captureRuleScopesList = base.pushAttributed(captureRuleScopeName, grammar);
            localStack.push(new LocalStackElement(captureRuleScopesList, captureIndex.end));
        }
    }
    while (localStack.length > 0) {
        // pop!
        lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
        localStack.pop();
    }
}
class LocalStackElement {
    scopes;
    endPos;
    constructor(scopes, endPos) {
        this.scopes = scopes;
        this.endPos = endPos;
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
function createGrammar(scopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, onigLib) {
    return new Grammar(scopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, onigLib); //TODO
}
function collectInjections(result, selector, rule, ruleFactoryHelper, grammar) {
    const matchers = createMatchers(selector, nameMatcher);
    const ruleId = RuleFactory.getCompiledRuleId(rule, ruleFactoryHelper, grammar.repository);
    for (const matcher of matchers) {
        result.push({
            debugSelector: selector,
            matcher: matcher.matcher,
            ruleId: ruleId,
            grammar: grammar,
            priority: matcher.priority
        });
    }
}
function nameMatcher(identifers, scopes) {
    if (scopes.length < identifers.length) {
        return false;
    }
    let lastIndex = 0;
    return identifers.every(identifier => {
        for (let i = lastIndex; i < scopes.length; i++) {
            if (scopesAreMatching(scopes[i], identifier)) {
                lastIndex = i + 1;
                return true;
            }
        }
        return false;
    });
}
function scopesAreMatching(thisScopeName, scopeName) {
    if (!thisScopeName) {
        return false;
    }
    if (thisScopeName === scopeName) {
        return true;
    }
    const len = scopeName.length;
    return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === '.';
}
class Grammar {
    _rootScopeName;
    balancedBracketSelectors;
    _onigLib;
    _rootId;
    _lastRuleId;
    _ruleId2desc;
    _includedGrammars;
    _grammarRepository;
    _grammar;
    _injections;
    _basicScopeAttributesProvider;
    _tokenTypeMatchers;
    get themeProvider() { return this._grammarRepository; }
    constructor(_rootScopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, _onigLib) {
        this._rootScopeName = _rootScopeName;
        this.balancedBracketSelectors = balancedBracketSelectors;
        this._onigLib = _onigLib;
        this._basicScopeAttributesProvider = new BasicScopeAttributesProvider(initialLanguage, embeddedLanguages);
        this._rootId = -1;
        this._lastRuleId = 0;
        this._ruleId2desc = [null];
        this._includedGrammars = {};
        this._grammarRepository = grammarRepository;
        this._grammar = initGrammar(grammar, null);
        this._injections = null;
        this._tokenTypeMatchers = [];
        if (tokenTypes) {
            for (const selector of Object.keys(tokenTypes)) {
                const matchers = createMatchers(selector, nameMatcher);
                for (const matcher of matchers) {
                    this._tokenTypeMatchers.push({
                        matcher: matcher.matcher,
                        type: tokenTypes[selector],
                    });
                }
            }
        }
    }
    dispose() {
        for (const rule of this._ruleId2desc) {
            if (rule) {
                rule.dispose();
            }
        }
    }
    createOnigScanner(sources) {
        return this._onigLib.createOnigScanner(sources);
    }
    createOnigString(sources) {
        return this._onigLib.createOnigString(sources);
    }
    getMetadataForScope(scope) {
        return this._basicScopeAttributesProvider.getBasicScopeAttributes(scope);
    }
    _collectInjections() {
        const grammarRepository = {
            lookup: (scopeName) => {
                if (scopeName === this._rootScopeName) {
                    return this._grammar;
                }
                return this.getExternalGrammar(scopeName);
            },
            injections: (scopeName) => {
                return this._grammarRepository.injections(scopeName);
            },
        };
        const result = [];
        const scopeName = this._rootScopeName;
        const grammar = grammarRepository.lookup(scopeName);
        if (grammar) {
            // add injections from the current grammar
            const rawInjections = grammar.injections;
            if (rawInjections) {
                for (let expression in rawInjections) {
                    collectInjections(result, expression, rawInjections[expression], this, grammar);
                }
            }
            // add injection grammars contributed for the current scope
            const injectionScopeNames = this._grammarRepository.injections(scopeName);
            if (injectionScopeNames) {
                injectionScopeNames.forEach((injectionScopeName) => {
                    const injectionGrammar = this.getExternalGrammar(injectionScopeName);
                    if (injectionGrammar) {
                        const selector = injectionGrammar.injectionSelector;
                        if (selector) {
                            collectInjections(result, selector, injectionGrammar, this, injectionGrammar);
                        }
                    }
                });
            }
        }
        result.sort((i1, i2) => i1.priority - i2.priority); // sort by priority
        return result;
    }
    getInjections() {
        if (this._injections === null) {
            this._injections = this._collectInjections();
        }
        return this._injections;
    }
    registerRule(factory) {
        const id = ++this._lastRuleId;
        const result = factory(ruleIdFromNumber(id));
        this._ruleId2desc[id] = result;
        return result;
    }
    getRule(ruleId) {
        return this._ruleId2desc[ruleIdToNumber(ruleId)];
    }
    getExternalGrammar(scopeName, repository) {
        if (this._includedGrammars[scopeName]) {
            return this._includedGrammars[scopeName];
        }
        else if (this._grammarRepository) {
            const rawIncludedGrammar = this._grammarRepository.lookup(scopeName);
            if (rawIncludedGrammar) {
                // console.log('LOADED GRAMMAR ' + pattern.include);
                this._includedGrammars[scopeName] = initGrammar(rawIncludedGrammar, repository && repository.$base);
                return this._includedGrammars[scopeName];
            }
        }
        return undefined;
    }
    tokenizeLine(lineText, prevState, timeLimit = 0) {
        const r = this._tokenize(lineText, prevState, false, timeLimit);
        return {
            tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
            ruleStack: r.ruleStack,
            stoppedEarly: r.stoppedEarly,
        };
    }
    tokenizeLine2(lineText, prevState, timeLimit = 0) {
        const r = this._tokenize(lineText, prevState, true, timeLimit);
        return {
            tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
            ruleStack: r.ruleStack,
            stoppedEarly: r.stoppedEarly,
        };
    }
    _tokenize(lineText, prevState, emitBinaryTokens, timeLimit) {
        if (this._rootId === -1) {
            this._rootId = RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository);
            // This ensures ids are deterministic, and thus equal in renderer and webworker.
            this.getInjections();
        }
        let isFirstLine;
        if (!prevState || prevState === StateStackImpl.NULL) {
            isFirstLine = true;
            const rawDefaultMetadata = this._basicScopeAttributesProvider.getDefaultAttributes();
            const defaultStyle = this.themeProvider.getDefaults();
            const defaultMetadata = EncodedTokenAttributes.set(0, rawDefaultMetadata.languageId, rawDefaultMetadata.tokenType, null, defaultStyle.fontStyle, defaultStyle.foregroundId, defaultStyle.backgroundId);
            const rootScopeName = this.getRule(this._rootId).getName(null, null);
            let scopeList;
            if (rootScopeName) {
                scopeList = AttributedScopeStack.createRootAndLookUpScopeName(rootScopeName, defaultMetadata, this);
            }
            else {
                scopeList = AttributedScopeStack.createRoot("unknown", defaultMetadata);
            }
            prevState = new StateStackImpl(null, this._rootId, -1, -1, false, null, scopeList, scopeList);
        }
        else {
            isFirstLine = false;
            prevState.reset();
        }
        lineText = lineText + "\n";
        const onigLineText = this.createOnigString(lineText);
        const lineLength = onigLineText.content.length;
        const lineTokens = new LineTokens(emitBinaryTokens, lineText, this._tokenTypeMatchers, this.balancedBracketSelectors);
        const r = _tokenizeString(this, onigLineText, isFirstLine, 0, prevState, lineTokens, true, timeLimit);
        disposeOnigString(onigLineText);
        return {
            lineLength: lineLength,
            lineTokens: lineTokens,
            ruleStack: r.stack,
            stoppedEarly: r.stoppedEarly,
        };
    }
}
function initGrammar(grammar, base) {
    grammar = clone(grammar);
    grammar.repository = grammar.repository || {};
    grammar.repository.$self = {
        $vscodeTextmateLocation: grammar.$vscodeTextmateLocation,
        patterns: grammar.patterns,
        name: grammar.scopeName
    };
    grammar.repository.$base = base || grammar.repository.$self;
    return grammar;
}
class AttributedScopeStack {
    parent;
    scopePath;
    tokenAttributes;
    static fromExtension(namesScopeList, contentNameScopesList) {
        let current = namesScopeList;
        let scopeNames = namesScopeList?.scopePath ?? null;
        for (const frame of contentNameScopesList) {
            scopeNames = ScopeStack.push(scopeNames, frame.scopeNames);
            current = new AttributedScopeStack(current, scopeNames, frame.encodedTokenAttributes);
        }
        return current;
    }
    static createRoot(scopeName, tokenAttributes) {
        return new AttributedScopeStack(null, new ScopeStack(null, scopeName), tokenAttributes);
    }
    static createRootAndLookUpScopeName(scopeName, tokenAttributes, grammar) {
        const rawRootMetadata = grammar.getMetadataForScope(scopeName);
        const scopePath = new ScopeStack(null, scopeName);
        const rootStyle = grammar.themeProvider.themeMatch(scopePath);
        const resolvedTokenAttributes = AttributedScopeStack.mergeAttributes(tokenAttributes, rawRootMetadata, rootStyle);
        return new AttributedScopeStack(null, scopePath, resolvedTokenAttributes);
    }
    get scopeName() { return this.scopePath.scopeName; }
    /**
     * Invariant:
     * ```
     * if (parent && !scopePath.extends(parent.scopePath)) {
     * 	throw new Error();
     * }
     * ```
     */
    constructor(parent, scopePath, tokenAttributes) {
        this.parent = parent;
        this.scopePath = scopePath;
        this.tokenAttributes = tokenAttributes;
    }
    toString() {
        return this.getScopeNames().join(' ');
    }
    equals(other) {
        return AttributedScopeStack.equals(this, other);
    }
    static equals(a, b) {
        do {
            if (a === b) {
                return true;
            }
            if (!a && !b) {
                // End of list reached for both
                return true;
            }
            if (!a || !b) {
                // End of list reached only for one
                return false;
            }
            if (a.scopeName !== b.scopeName || a.tokenAttributes !== b.tokenAttributes) {
                return false;
            }
            // Go to previous pair
            a = a.parent;
            b = b.parent;
        } while (true);
    }
    static mergeAttributes(existingTokenAttributes, basicScopeAttributes, styleAttributes) {
        let fontStyle = -1 /* FontStyle.NotSet */;
        let foreground = 0;
        let background = 0;
        if (styleAttributes !== null) {
            fontStyle = styleAttributes.fontStyle;
            foreground = styleAttributes.foregroundId;
            background = styleAttributes.backgroundId;
        }
        return EncodedTokenAttributes.set(existingTokenAttributes, basicScopeAttributes.languageId, basicScopeAttributes.tokenType, null, fontStyle, foreground, background);
    }
    pushAttributed(scopePath, grammar) {
        if (scopePath === null) {
            return this;
        }
        if (scopePath.indexOf(' ') === -1) {
            // This is the common case and much faster
            return AttributedScopeStack._pushAttributed(this, scopePath, grammar);
        }
        const scopes = scopePath.split(/ /g);
        let result = this;
        for (const scope of scopes) {
            result = AttributedScopeStack._pushAttributed(result, scope, grammar);
        }
        return result;
    }
    static _pushAttributed(target, scopeName, grammar) {
        const rawMetadata = grammar.getMetadataForScope(scopeName);
        const newPath = target.scopePath.push(scopeName);
        const scopeThemeMatchResult = grammar.themeProvider.themeMatch(newPath);
        const metadata = AttributedScopeStack.mergeAttributes(target.tokenAttributes, rawMetadata, scopeThemeMatchResult);
        return new AttributedScopeStack(target, newPath, metadata);
    }
    getScopeNames() {
        return this.scopePath.getSegments();
    }
    getExtensionIfDefined(base) {
        const result = [];
        let self = this;
        while (self && self !== base) {
            result.push({
                encodedTokenAttributes: self.tokenAttributes,
                scopeNames: self.scopePath.getExtensionIfDefined(self.parent?.scopePath ?? null),
            });
            self = self.parent;
        }
        return self === base ? result.reverse() : undefined;
    }
}
/**
 * Represents a "pushed" state on the stack (as a linked list element).
 */
class StateStackImpl {
    parent;
    ruleId;
    beginRuleCapturedEOL;
    endRule;
    nameScopesList;
    contentNameScopesList;
    _stackElementBrand = undefined;
    // TODO remove me
    static NULL = new StateStackImpl(null, 0, 0, 0, false, null, null, null);
    /**
     * The position on the current line where this state was pushed.
     * This is relevant only while tokenizing a line, to detect endless loops.
     * Its value is meaningless across lines.
     */
    _enterPos;
    /**
     * The captured anchor position when this stack element was pushed.
     * This is relevant only while tokenizing a line, to restore the anchor position when popping.
     * Its value is meaningless across lines.
     */
    _anchorPos;
    /**
     * The depth of the stack.
     */
    depth;
    /**
     * Invariant:
     * ```
     * if (contentNameScopesList !== nameScopesList && contentNameScopesList?.parent !== nameScopesList) {
     * 	throw new Error();
     * }
     * if (this.parent && !nameScopesList.extends(this.parent.contentNameScopesList)) {
     * 	throw new Error();
     * }
     * ```
     */
    constructor(
    /**
     * The previous state on the stack (or null for the root state).
     */
    parent, 
    /**
     * The state (rule) that this element represents.
     */
    ruleId, enterPos, anchorPos, 
    /**
     * The state has entered and captured \n. This means that the next line should have an anchorPosition of 0.
     */
    beginRuleCapturedEOL, 
    /**
     * The "pop" (end) condition for this state in case that it was dynamically generated through captured text.
     */
    endRule, 
    /**
     * The list of scopes containing the "name" for this state.
     */
    nameScopesList, 
    /**
     * The list of scopes containing the "contentName" (besides "name") for this state.
     * This list **must** contain as an element `scopeName`.
     */
    contentNameScopesList) {
        this.parent = parent;
        this.ruleId = ruleId;
        this.beginRuleCapturedEOL = beginRuleCapturedEOL;
        this.endRule = endRule;
        this.nameScopesList = nameScopesList;
        this.contentNameScopesList = contentNameScopesList;
        this.depth = this.parent ? this.parent.depth + 1 : 1;
        this._enterPos = enterPos;
        this._anchorPos = anchorPos;
    }
    equals(other) {
        if (other === null) {
            return false;
        }
        return StateStackImpl._equals(this, other);
    }
    static _equals(a, b) {
        if (a === b) {
            return true;
        }
        if (!this._structuralEquals(a, b)) {
            return false;
        }
        return AttributedScopeStack.equals(a.contentNameScopesList, b.contentNameScopesList);
    }
    /**
     * A structural equals check. Does not take into account `scopes`.
     */
    static _structuralEquals(a, b) {
        do {
            if (a === b) {
                return true;
            }
            if (!a && !b) {
                // End of list reached for both
                return true;
            }
            if (!a || !b) {
                // End of list reached only for one
                return false;
            }
            if (a.depth !== b.depth ||
                a.ruleId !== b.ruleId ||
                a.endRule !== b.endRule) {
                return false;
            }
            // Go to previous pair
            a = a.parent;
            b = b.parent;
        } while (true);
    }
    clone() {
        return this;
    }
    static _reset(el) {
        while (el) {
            el._enterPos = -1;
            el._anchorPos = -1;
            el = el.parent;
        }
    }
    reset() {
        StateStackImpl._reset(this);
    }
    pop() {
        return this.parent;
    }
    safePop() {
        if (this.parent) {
            return this.parent;
        }
        return this;
    }
    push(ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList) {
        return new StateStackImpl(this, ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList);
    }
    getEnterPos() {
        return this._enterPos;
    }
    getAnchorPos() {
        return this._anchorPos;
    }
    getRule(grammar) {
        return grammar.getRule(this.ruleId);
    }
    toString() {
        const r = [];
        this._writeString(r, 0);
        return "[" + r.join(",") + "]";
    }
    _writeString(res, outIndex) {
        if (this.parent) {
            outIndex = this.parent._writeString(res, outIndex);
        }
        res[outIndex++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`;
        return outIndex;
    }
    withContentNameScopesList(contentNameScopeStack) {
        if (this.contentNameScopesList === contentNameScopeStack) {
            return this;
        }
        return this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, this.endRule, this.nameScopesList, contentNameScopeStack);
    }
    withEndRule(endRule) {
        if (this.endRule === endRule) {
            return this;
        }
        return new StateStackImpl(this.parent, this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, endRule, this.nameScopesList, this.contentNameScopesList);
    }
    // Used to warn of endless loops
    hasSameRuleAs(other) {
        let el = this;
        while (el && el._enterPos === other._enterPos) {
            if (el.ruleId === other.ruleId) {
                return true;
            }
            el = el.parent;
        }
        return false;
    }
    toStateStackFrame() {
        return {
            ruleId: ruleIdToNumber(this.ruleId),
            beginRuleCapturedEOL: this.beginRuleCapturedEOL,
            endRule: this.endRule,
            nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [],
            contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? [],
        };
    }
    static pushFrame(self, frame) {
        const namesScopeList = AttributedScopeStack.fromExtension(self?.nameScopesList ?? null, frame.nameScopesList);
        return new StateStackImpl(self, ruleIdFromNumber(frame.ruleId), frame.enterPos ?? -1, frame.anchorPos ?? -1, frame.beginRuleCapturedEOL, frame.endRule, namesScopeList, AttributedScopeStack.fromExtension(namesScopeList, frame.contentNameScopesList));
    }
}
class BalancedBracketSelectors {
    balancedBracketScopes;
    unbalancedBracketScopes;
    allowAny = false;
    constructor(balancedBracketScopes, unbalancedBracketScopes) {
        this.balancedBracketScopes = balancedBracketScopes.flatMap((selector) => {
            if (selector === '*') {
                this.allowAny = true;
                return [];
            }
            return createMatchers(selector, nameMatcher).map((m) => m.matcher);
        });
        this.unbalancedBracketScopes = unbalancedBracketScopes.flatMap((selector) => createMatchers(selector, nameMatcher).map((m) => m.matcher));
    }
    get matchesAlways() {
        return this.allowAny && this.unbalancedBracketScopes.length === 0;
    }
    get matchesNever() {
        return this.balancedBracketScopes.length === 0 && !this.allowAny;
    }
    match(scopes) {
        for (const excluder of this.unbalancedBracketScopes) {
            if (excluder(scopes)) {
                return false;
            }
        }
        for (const includer of this.balancedBracketScopes) {
            if (includer(scopes)) {
                return true;
            }
        }
        return this.allowAny;
    }
}
class LineTokens {
    balancedBracketSelectors;
    _emitBinaryTokens;
    /**
     * defined only if `false`.
     */
    _lineText;
    /**
     * used only if `_emitBinaryTokens` is false.
     */
    _tokens;
    /**
     * used only if `_emitBinaryTokens` is true.
     */
    _binaryTokens;
    _lastTokenEndIndex;
    _tokenTypeOverrides;
    constructor(emitBinaryTokens, lineText, tokenTypeOverrides, balancedBracketSelectors) {
        this.balancedBracketSelectors = balancedBracketSelectors;
        this._emitBinaryTokens = emitBinaryTokens;
        this._tokenTypeOverrides = tokenTypeOverrides;
        {
            this._lineText = null;
        }
        this._tokens = [];
        this._binaryTokens = [];
        this._lastTokenEndIndex = 0;
    }
    produce(stack, endIndex) {
        this.produceFromScopes(stack.contentNameScopesList, endIndex);
    }
    produceFromScopes(scopesList, endIndex) {
        if (this._lastTokenEndIndex >= endIndex) {
            return;
        }
        if (this._emitBinaryTokens) {
            let metadata = scopesList?.tokenAttributes ?? 0;
            let containsBalancedBrackets = false;
            if (this.balancedBracketSelectors?.matchesAlways) {
                containsBalancedBrackets = true;
            }
            if (this._tokenTypeOverrides.length > 0 || (this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever)) {
                // Only generate scope array when required to improve performance
                const scopes = scopesList?.getScopeNames() ?? [];
                for (const tokenType of this._tokenTypeOverrides) {
                    if (tokenType.matcher(scopes)) {
                        metadata = EncodedTokenAttributes.set(metadata, 0, toOptionalTokenType(tokenType.type), null, -1 /* FontStyle.NotSet */, 0, 0);
                    }
                }
                if (this.balancedBracketSelectors) {
                    containsBalancedBrackets = this.balancedBracketSelectors.match(scopes);
                }
            }
            if (containsBalancedBrackets) {
                metadata = EncodedTokenAttributes.set(metadata, 0, 8 /* OptionalStandardTokenType.NotSet */, containsBalancedBrackets, -1 /* FontStyle.NotSet */, 0, 0);
            }
            if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === metadata) {
                // no need to push a token with the same metadata
                this._lastTokenEndIndex = endIndex;
                return;
            }
            this._binaryTokens.push(this._lastTokenEndIndex);
            this._binaryTokens.push(metadata);
            this._lastTokenEndIndex = endIndex;
            return;
        }
        const scopes = scopesList?.getScopeNames() ?? [];
        this._tokens.push({
            startIndex: this._lastTokenEndIndex,
            endIndex: endIndex,
            // value: lineText.substring(lastTokenEndIndex, endIndex),
            scopes: scopes
        });
        this._lastTokenEndIndex = endIndex;
    }
    getResult(stack, lineLength) {
        if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === lineLength - 1) {
            // pop produced token for newline
            this._tokens.pop();
        }
        if (this._tokens.length === 0) {
            this._lastTokenEndIndex = -1;
            this.produce(stack, lineLength);
            this._tokens[this._tokens.length - 1].startIndex = 0;
        }
        return this._tokens;
    }
    getBinaryResult(stack, lineLength) {
        if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === lineLength - 1) {
            // pop produced token for newline
            this._binaryTokens.pop();
            this._binaryTokens.pop();
        }
        if (this._binaryTokens.length === 0) {
            this._lastTokenEndIndex = -1;
            this.produce(stack, lineLength);
            this._binaryTokens[this._binaryTokens.length - 2] = 0;
        }
        const result = new Uint32Array(this._binaryTokens.length);
        for (let i = 0, len = this._binaryTokens.length; i < len; i++) {
            result[i] = this._binaryTokens[i];
        }
        return result;
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
class SyncRegistry {
    _onigLibPromise;
    _grammars = new Map();
    _rawGrammars = new Map();
    _injectionGrammars = new Map();
    _theme;
    constructor(theme, _onigLibPromise) {
        this._onigLibPromise = _onigLibPromise;
        this._theme = theme;
    }
    dispose() {
        for (const grammar of this._grammars.values()) {
            grammar.dispose();
        }
    }
    setTheme(theme) {
        this._theme = theme;
    }
    getColorMap() {
        return this._theme.getColorMap();
    }
    /**
     * Add `grammar` to registry and return a list of referenced scope names
     */
    addGrammar(grammar, injectionScopeNames) {
        this._rawGrammars.set(grammar.scopeName, grammar);
        if (injectionScopeNames) {
            this._injectionGrammars.set(grammar.scopeName, injectionScopeNames);
        }
    }
    /**
     * Lookup a raw grammar.
     */
    lookup(scopeName) {
        return this._rawGrammars.get(scopeName);
    }
    /**
     * Returns the injections for the given grammar
     */
    injections(targetScope) {
        return this._injectionGrammars.get(targetScope);
    }
    /**
     * Get the default theme settings
     */
    getDefaults() {
        return this._theme.getDefaults();
    }
    /**
     * Match a scope in the theme.
     */
    themeMatch(scopePath) {
        return this._theme.match(scopePath);
    }
    /**
     * Lookup a grammar.
     */
    async grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors) {
        if (!this._grammars.has(scopeName)) {
            let rawGrammar = this._rawGrammars.get(scopeName);
            if (!rawGrammar) {
                return null;
            }
            this._grammars.set(scopeName, createGrammar(scopeName, rawGrammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, this, await this._onigLibPromise));
        }
        return this._grammars.get(scopeName);
    }
}

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/**
 * The registry that will hold all grammars.
 */
let Registry$1 = class Registry {
    _options;
    _syncRegistry;
    _ensureGrammarCache;
    constructor(options) {
        this._options = options;
        this._syncRegistry = new SyncRegistry(Theme.createFromRawTheme(options.theme, options.colorMap), options.onigLib);
        this._ensureGrammarCache = new Map();
    }
    dispose() {
        this._syncRegistry.dispose();
    }
    /**
     * Change the theme. Once called, no previous `ruleStack` should be used anymore.
     */
    setTheme(theme, colorMap) {
        this._syncRegistry.setTheme(Theme.createFromRawTheme(theme, colorMap));
    }
    /**
     * Returns a lookup array for color ids.
     */
    getColorMap() {
        return this._syncRegistry.getColorMap();
    }
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithEmbeddedLanguages(initialScopeName, initialLanguage, embeddedLanguages) {
        return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages });
    }
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithConfiguration(initialScopeName, initialLanguage, configuration) {
        return this._loadGrammar(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes, new BalancedBracketSelectors(configuration.balancedBracketSelectors || [], configuration.unbalancedBracketSelectors || []));
    }
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     */
    loadGrammar(initialScopeName) {
        return this._loadGrammar(initialScopeName, 0, null, null, null);
    }
    async _loadGrammar(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors) {
        const dependencyProcessor = new ScopeDependencyProcessor(this._syncRegistry, initialScopeName);
        while (dependencyProcessor.Q.length > 0) {
            await Promise.all(dependencyProcessor.Q.map((request) => this._loadSingleGrammar(request.scopeName)));
            dependencyProcessor.processQueue();
        }
        return this._grammarForScopeName(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors);
    }
    async _loadSingleGrammar(scopeName) {
        if (!this._ensureGrammarCache.has(scopeName)) {
            this._ensureGrammarCache.set(scopeName, this._doLoadSingleGrammar(scopeName));
        }
        return this._ensureGrammarCache.get(scopeName);
    }
    async _doLoadSingleGrammar(scopeName) {
        const grammar = await this._options.loadGrammar(scopeName);
        if (grammar) {
            const injections = typeof this._options.getInjections === "function" ? this._options.getInjections(scopeName) : undefined;
            this._syncRegistry.addGrammar(grammar, injections);
        }
    }
    /**
     * Adds a rawGrammar.
     */
    async addGrammar(rawGrammar, injections = [], initialLanguage = 0, embeddedLanguages = null) {
        this._syncRegistry.addGrammar(rawGrammar, injections);
        return (await this._grammarForScopeName(rawGrammar.scopeName, initialLanguage, embeddedLanguages));
    }
    /**
     * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `addGrammar`.
     */
    _grammarForScopeName(scopeName, initialLanguage = 0, embeddedLanguages = null, tokenTypes = null, balancedBracketSelectors = null) {
        return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors);
    }
};
const INITIAL = StateStackImpl.NULL;

/**
 * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
 * The following assumptions have been made:
 *  - languageId < 256 => needs 8 bits
 *  - unique color count < 512 => needs 9 bits
 *
 * The binary format is:
 * - -------------------------------------------
 *     3322 2222 2222 1111 1111 1100 0000 0000
 *     1098 7654 3210 9876 5432 1098 7654 3210
 * - -------------------------------------------
 *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
 *     bbbb bbbb bfff ffff ffFF FTTT LLLL LLLL
 * - -------------------------------------------
 *  - L = LanguageId (8 bits)
 *  - T = StandardTokenType (3 bits)
 *  - F = FontStyle (3 bits)
 *  - f = foreground color (9 bits)
 *  - b = background color (9 bits)
 */
const MetadataConsts = {
    LANGUAGEID_MASK: 0b00000000000000000000000011111111,
    TOKEN_TYPE_MASK: 0b00000000000000000000001100000000,
    BALANCED_BRACKETS_MASK: 0b00000000000000000000010000000000,
    FONT_STYLE_MASK: 0b00000000000000000011100000000000,
    FOREGROUND_MASK: 0b00000000011111111100000000000000,
    BACKGROUND_MASK: 0b11111111100000000000000000000000,
    LANGUAGEID_OFFSET: 0,
    TOKEN_TYPE_OFFSET: 8,
    BALANCED_BRACKETS_OFFSET: 10,
    FONT_STYLE_OFFSET: 11,
    FOREGROUND_OFFSET: 15,
    BACKGROUND_OFFSET: 24,
};
class StackElementMetadata {
    static toBinaryStr(metadata) {
        let r = metadata.toString(2);
        while (r.length < 32)
            r = `0${r}`;
        return r;
    }
    // public static printMetadata(metadata: number): void {
    //   const languageId = StackElementMetadata.getLanguageId(metadata)
    //   const tokenType = StackElementMetadata.getTokenType(metadata)
    //   const fontStyle = StackElementMetadata.getFontStyle(metadata)
    //   const foreground = StackElementMetadata.getForeground(metadata)
    //   const background = StackElementMetadata.getBackground(metadata)
    //   console.log({
    //     languageId,
    //     tokenType,
    //     fontStyle,
    //     foreground,
    //     background,
    //   })
    // }
    static getLanguageId(metadata) {
        return (metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET;
    }
    static getTokenType(metadata) {
        return (metadata & MetadataConsts.TOKEN_TYPE_MASK) >>> MetadataConsts.TOKEN_TYPE_OFFSET;
    }
    static getFontStyle(metadata) {
        return (metadata & MetadataConsts.FONT_STYLE_MASK) >>> MetadataConsts.FONT_STYLE_OFFSET;
    }
    static getForeground(metadata) {
        return (metadata & MetadataConsts.FOREGROUND_MASK) >>> MetadataConsts.FOREGROUND_OFFSET;
    }
    static getBackground(metadata) {
        return (metadata & MetadataConsts.BACKGROUND_MASK) >>> MetadataConsts.BACKGROUND_OFFSET;
    }
    static containsBalancedBrackets(metadata) {
        return (metadata & MetadataConsts.BALANCED_BRACKETS_MASK) !== 0;
    }
    static set(metadata, languageId, tokenType, fontStyle, foreground, background) {
        let _languageId = StackElementMetadata.getLanguageId(metadata);
        let _tokenType = StackElementMetadata.getTokenType(metadata);
        let _fontStyle = StackElementMetadata.getFontStyle(metadata);
        let _foreground = StackElementMetadata.getForeground(metadata);
        let _background = StackElementMetadata.getBackground(metadata);
        const _containsBalancedBracketsBit = StackElementMetadata.containsBalancedBrackets(metadata)
            ? 1
            : 0;
        if (languageId !== 0)
            _languageId = languageId;
        if (tokenType !== 0 /* TemporaryStandardTokenType.Other */) {
            _tokenType
                = tokenType === 8 /* TemporaryStandardTokenType.MetaEmbedded */ ? 0 /* StandardTokenType.Other */ : tokenType;
        }
        if (fontStyle !== FontStyle.NotSet)
            _fontStyle = fontStyle;
        if (foreground !== 0)
            _foreground = foreground;
        if (background !== 0)
            _background = background;
        return (((_languageId << MetadataConsts.LANGUAGEID_OFFSET)
            | (_tokenType << MetadataConsts.TOKEN_TYPE_OFFSET)
            | (_fontStyle << MetadataConsts.FONT_STYLE_OFFSET)
            | (_containsBalancedBracketsBit << MetadataConsts.BALANCED_BRACKETS_OFFSET)
            | (_foreground << MetadataConsts.FOREGROUND_OFFSET)
            | (_background << MetadataConsts.BACKGROUND_OFFSET))
            >>> 0);
    }
}

export { INITIAL, Registry$1 as Registry, StackElementMetadata };
