/// <reference types="node" />
import * as vite from 'vite';
import { BuildOptions, Logger, UserConfig as UserConfig$1, ConfigEnv, ServerOptions } from 'vite';
export { Plugin, loadEnv } from 'vite';
import { Awaitable, SiteData, PageData, HeadConfig, LocaleSpecificConfig, LocaleConfig, SSGContext, DefaultTheme } from '../../types/shared.js';
export { DefaultTheme, HeadConfig, Header, SiteData } from '../../types/shared.js';
import { Options as Options$2 } from '@vitejs/plugin-vue';
import { UseDarkOptions } from '@vueuse/core';
import { TransformOptions } from 'stream';
import { ThemeRegistrationAny, BuiltinTheme, LanguageInput, ShikiTransformer, Highlighter } from 'shiki';
import glob from 'fast-glob';
import { Root } from 'postcss';
import { IncomingMessage, ServerResponse } from 'http';
import { Server, ListenOptions } from 'net';

declare function build(root?: string, buildOptions?: BuildOptions & {
    base?: string;
    mpa?: string;
}): Promise<void>;

/**
 * How frequently the page is likely to change. This value provides general
 * information to search engines and may not correlate exactly to how often they crawl the page. Please note that the
 * value of this tag is considered a hint and not a command. See
 * <https://www.sitemaps.org/protocol.html#xmlTagDefinitions> for the acceptable
 * values
 */
declare enum EnumChangefreq {
    DAILY = "daily",
    MONTHLY = "monthly",
    ALWAYS = "always",
    HOURLY = "hourly",
    WEEKLY = "weekly",
    YEARLY = "yearly",
    NEVER = "never"
}
/**
 * https://support.google.com/webmasters/answer/74288?hl=en&ref_topic=4581190
 */
interface NewsItem {
    access?: 'Registration' | 'Subscription';
    publication: {
        name: string;
        /**
         * The `<language>` is the language of your publication. Use an ISO 639
         * language code (2 or 3 letters).
         */
        language: string;
    };
    /**
     * @example 'PressRelease, Blog'
     */
    genres?: string;
    /**
     * Article publication date in W3C format, using either the "complete date" (YYYY-MM-DD) format or the "complete date
     * plus hours, minutes, and seconds"
     */
    publication_date: string;
    /**
     * The title of the news article
     * @example 'Companies A, B in Merger Talks'
     */
    title: string;
    /**
     * @example 'business, merger, acquisition'
     */
    keywords?: string;
    /**
     * @example 'NASDAQ:A, NASDAQ:B'
     */
    stock_tickers?: string;
}
/**
 * Sitemap Image
 * https://support.google.com/webmasters/answer/178636?hl=en&ref_topic=4581190
 */
interface Img {
    /**
     * The URL of the image
     * @example 'https://example.com/image.jpg'
     */
    url: string;
    /**
     * The caption of the image
     * @example 'Thanksgiving dinner'
     */
    caption?: string;
    /**
     * The title of the image
     * @example 'Star Wars EP IV'
     */
    title?: string;
    /**
     * The geographic location of the image.
     * @example 'Limerick, Ireland'
     */
    geoLocation?: string;
    /**
     * A URL to the license of the image.
     * @example 'https://example.com/license.txt'
     */
    license?: string;
}
/**
 * https://support.google.com/webmasters/answer/189077
 */
interface LinkItem {
    /**
     * @example 'en'
     */
    lang: string;
    /**
     * @example 'en-us'
     */
    hreflang?: string;
    url: string;
}
/**
 * How to handle errors in passed in urls
 */
declare enum ErrorLevel {
    /**
     * Validation will be skipped and nothing logged or thrown.
     */
    SILENT = "silent",
    /**
     * If an invalid value is encountered, a console.warn will be called with details
     */
    WARN = "warn",
    /**
     * An Error will be thrown on encountering invalid data.
     */
    THROW = "throw"
}
declare type ErrorHandler = (error: Error, level: ErrorLevel) => void;

interface NSArgs {
    news: boolean;
    video: boolean;
    xhtml: boolean;
    image: boolean;
    custom?: string[];
}
interface SitemapStreamOptions extends TransformOptions {
    hostname?: string;
    level?: ErrorLevel;
    lastmodDateOnly?: boolean;
    xmlns?: NSArgs;
    xslUrl?: string;
    errorHandler?: ErrorHandler;
}

interface SitemapItem {
    lastmod?: string | number | Date;
    changefreq?: `${EnumChangefreq}`;
    fullPrecisionPriority?: boolean;
    priority?: number;
    news?: NewsItem;
    expires?: string;
    androidLink?: string;
    ampLink?: string;
    url: string;
    video?: any;
    img?: string | Img | (string | Img)[];
    links?: LinkItem[];
    lastmodfile?: string | Buffer | URL;
    lastmodISO?: string;
    lastmodrealtime?: boolean;
}

declare namespace Token {
    type Nesting = 1 | 0 | -1;
}

/**
 * Create new token and fill passed properties.
 */
declare class Token {
    constructor(type: string, tag: string, nesting: Token.Nesting);

    /**
     * Type of the token, e.g. "paragraph_open"
     */
    type: string;

    /**
     * HTML tag name, e.g. "p"
     */
    tag: string;

    /**
     * HTML attributes. Format: `[[name1, value1], [name2, value2]]`
     */
    attrs: Array<[string, string]> | null;

    /**
     * Source map info. Format: `[line_begin, line_end]`
     */
    map: [number, number] | null;

    /**
     * Level change (number in {-1, 0, 1} set), where:
     *
     * - `1` means the tag is opening
     * - `0` means the tag is self-closing
     * - `-1` means the tag is closing
     */
    nesting: 1 | 0 | -1;

    /**
     * nesting level, the same as `state.level`
     */
    level: number;

    /**
     * An array of child nodes (inline and img tokens)
     */
    children: Token[] | null;

    /**
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     */
    content: string;

    /**
     * '*' or '_' for emphasis, fence string for fence, etc.
     */
    markup: string;

    /**
     * Fence info string
     */
    info: string;

    /**
     * A place for plugins to store an arbitrary data
     */
    meta: any;

    /**
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks
     */
    block: boolean;

    /**
     * If it's true, ignore this element when rendering. Used for tight lists
     * to hide paragraphs.
     */
    hidden: boolean;

    /**
     * Search attribute index by name.
     */
    attrIndex(name: string): number;

    /**
     * Add `[name, value]` attribute to list. Init attrs if necessary
     */
    attrPush(attrData: [string, string]): void;

    /**
     * Set `name` attribute to `value`. Override old value if exists.
     */
    attrSet(name: string, value: string): void;

    /**
     * Get the value of attribute `name`, or null if it does not exist.
     */
    attrGet(name: string): string | null;

    /**
     * Join value to existing attribute via space. Or create new attribute if not
     * exists. Useful to operate with token classes.
     */
    attrJoin(name: string, value: string): void;
}

declare namespace __token {
  export { Token as default };
}

declare const LinkifyIt: {
    (
        schemas?: LinkifyIt.SchemaRules | LinkifyIt.Options,
        options?: LinkifyIt.Options,
    ): LinkifyIt.LinkifyIt;
    new(
        schemas?: LinkifyIt.SchemaRules | LinkifyIt.Options,
        options?: LinkifyIt.Options,
    ): LinkifyIt.LinkifyIt;
};

declare namespace LinkifyIt {
    type Validate = (text: string, pos: number, self: LinkifyIt) => number | boolean;

    interface FullRule {
        validate: string | RegExp | Validate;
        normalize?: ((match: Match) => void) | undefined;
    }

    type Rule = string | FullRule;

    interface SchemaRules {
        [schema: string]: Rule;
    }

    interface Options {
        fuzzyLink?: boolean | undefined;
        fuzzyIP?: boolean | undefined;
        fuzzyEmail?: boolean | undefined;
    }

    interface Match {
        index: number;
        lastIndex: number;
        raw: string;
        schema: string;
        text: string;
        url: string;
    }

    interface LinkifyIt {
        // Use overloads to provide contextual typing to `FullRule.normalize`, which is ambiguous with string.normalize
        // This appears unneeded to the unified-signatures lint rule.
        add(schema: string, rule: string): LinkifyIt;
        // tslint:disable-next-line: unified-signatures
        add(schema: string, rule: FullRule | null): LinkifyIt;
        match(text: string): Match[] | null;
        normalize(raw: string): string;
        pretest(text: string): boolean;
        set(options: Options): LinkifyIt;
        test(text: string): boolean;
        testSchemaAt(text: string, schemaName: string, pos: number): number;
        tlds(list: string | string[], keepOld?: boolean): LinkifyIt;
        re: {
            [key: string]: RegExp;
        };
    }
}

declare namespace encode {
    const defaultChars: string;
    const componentChars: string;
}
declare function encode(str: string, exclude?: string, keepEscaped?: boolean): string;

declare namespace decode {
    const defaultChars: string;
    const componentChars: string;
}
declare function decode(input: string, exclude?: string): string;

declare function parse(input: string, slashesDenoteHost?: boolean): Url;

declare function format(url: Url): string;

interface Url {
    protocol: string;
    slashes: string;
    auth: string;
    port: string;
    hostname: string;
    hash: string;
    search: string;
    pathname: string;
}

type mdurl_Url = Url;
declare const mdurl_decode: typeof decode;
declare const mdurl_encode: typeof encode;
declare const mdurl_format: typeof format;
declare const mdurl_parse: typeof parse;
declare namespace mdurl {
  export { type mdurl_Url as Url, mdurl_decode as decode, mdurl_encode as encode, mdurl_format as format, mdurl_parse as parse };
}

// import ucmicro from 'uc.micro';

interface Utils {
    lib: {
        mdurl: typeof mdurl;
    };

    /**
     * Merge objects
     */
    assign(target: any, ...sources: any[]): any;

    /**
     * Check if the type is string or not
     */
    isString(obj: any): obj is string;

    /**
     * has own property
     */
    has(obj: any, key: keyof any): boolean;

    unescapeMd(str: string): string;
    unescapeAll(str: string): string;

    isValidEntityCode(code: number): boolean;
    fromCodePoint(code: number): string;
    escapeHtml(str: string): string;

    /**
     * Remove element from array and put another array at those position.
     * Useful for some operations with tokens.
     * Return a new array.
     */
    arrayReplaceAt<T>(src: T[], pos: number, newElements: T[]): T[];

    isSpace(code: number): boolean;

    /**
     * Zs (unicode class) || [\t\f\v\r\n]
     */
    isWhiteSpace(code: number): boolean;

    /**
     * Markdown ASCII punctuation characters.
     *
     * !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
     * http://spec.commonmark.org/0.15/#ascii-punctuation-character
     *
     * Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
     */
    isMdAsciiPunct(code: number): boolean;

    /**
     * Currently without astral characters support.
     */
    isPunctChar(ch: string): boolean;

    escapeRE(str: string): string;

    /**
     * Hepler to unify [reference labels].
     */
    normalizeReference(str: string): string;
}

declare const utils: Utils;

declare namespace StateInline {
    interface Scanned {
        can_open: boolean;
        can_close: boolean;
        length: number;
    }

    interface Delimiter {
        marker: number;
        length: number;
        jump: number;
        token: number;
        end: number;
        open: boolean;
        close: boolean;
    }

    interface TokenMata {
        delimiters: Delimiter[];
    }
}

declare class StateInline {
    constructor(src: string, md: MarkdownIt, env: any, outTokens: Token[]);

    src: string;
    env: any;
    md: MarkdownIt;
    tokens: Token[];
    tokens_meta: Array<StateInline.TokenMata | null>;

    pos: number;
    posMax: number;
    level: number;
    pending: string;
    pendingLevel: number;

    /**
     * Stores { start: end } pairs. Useful for backtrack
     * optimization of pairs parse (emphasis, strikes).
     */
    cache: any;

    /**
     * List of emphasis-like delimiters for current tag
     */
    delimiters: StateInline.Delimiter[];

    // Stack of delimiter lists for upper level tags
    // _prev_delimiters: StateInline.Delimiter[][];

    /**
     * Flush pending text
     */
    pushPending(): Token;

    /**
     * Push new token to "stream".
     * If pending text exists - flush it as text token
     */
    push(type: string, tag: string, nesting: Token.Nesting): Token;

    /**
     * Scan a sequence of emphasis-like markers, and determine whether
     * it can start an emphasis sequence or end an emphasis sequence.
     *
     * @param start position to scan from (it should point at a valid marker);
     * @param canSplitWord determine if these markers can be found inside a word
     */
    scanDelims(start: number, canSplitWord: boolean): StateInline.Scanned;

    Token: typeof Token;
}

declare function parseLinkLabel(state: StateInline, start: number, disableNested?: boolean): number;

declare namespace parseLinkDestination {
    interface ParseResult {
        ok: boolean;
        pos: number;
        lines: number;
        str: string;
    }
}

declare function parseLinkDestination(str: string, pos: number, max: number): parseLinkDestination.ParseResult;

declare function parseLinkTitle(str: string, pos: number, max: number): parseLinkDestination.ParseResult;

interface Helpers {
    parseLinkLabel: typeof parseLinkLabel;
    parseLinkDestination: typeof parseLinkDestination;
    parseLinkTitle: typeof parseLinkTitle;
}

declare const helpers: Helpers;

declare namespace Ruler {
    interface RuleOptions {
        /**
         * array with names of "alternate" chains.
         */
        alt: string[];
    }
}

/**
 * class Ruler
 *
 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - cacheing lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
 * [[MarkdownIt.use]].
 */
declare class Ruler<T> {
    /**
     * Replace rule by name with new function & options. Throws error if name not
     * found.
     *
     * ##### Example
     *
     * Replace existing typographer replacement rule with new one:
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.core.ruler.at('replacements', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @param name rule name to replace.
     * @param fn new rule function.
     * @param options new rule options (not mandatory).
     */
    at(name: string, fn: T, options?: Ruler.RuleOptions): void;

    /**
     * Add new rule to chain before one with given name. See also
     * [[Ruler.after]], [[Ruler.push]].
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @param beforeName new rule will be added before this one.
     * @param ruleName name of added rule.
     * @param fn rule function.
     * @param options rule options (not mandatory).
     */
    before(beforeName: string, ruleName: string, fn: T, options?: Ruler.RuleOptions): void;

    /**
     * Add new rule to chain after one with given name. See also
     * [[Ruler.before]], [[Ruler.push]].
     *
     * ##### Options:
     *
     * - __alt__ - array with names of "alternate" chains.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.inline.ruler.after('text', 'my_rule', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @param afterName new rule will be added after this one.
     * @param ruleName name of added rule.
     * @param fn rule function.
     * @param options rule options (not mandatory).
     */
    after(afterName: string, ruleName: string, fn: T, options?: Ruler.RuleOptions): void;

    /**
     * Push new rule to the end of chain. See also
     * [[Ruler.before]], [[Ruler.after]].
     *
     * ##### Options:
     *
     * - __alt__ - array with names of "alternate" chains.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.core.ruler.push('my_rule', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @param ruleName name of added rule.
     * @param fn rule function.
     * @param options rule options (not mandatory).
     */
    push(ruleName: string, fn: T, options?: Ruler.RuleOptions): void;

    /**
     * Enable rules with given names. If any rule name not found - throw Error.
     * Errors can be disabled by second param.
     *
     * Returns list of found rule names (if no exception happened).
     *
     * See also [[Ruler.disable]], [[Ruler.enableOnly]].
     *
     * @param list list of rule names to enable.
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    enable(list: string | string[], ignoreInvalid?: boolean): string[];

    /**
     * Enable rules with given names, and disable everything else. If any rule name
     * not found - throw Error. Errors can be disabled by second param.
     *
     * See also [[Ruler.disable]], [[Ruler.enable]].
     *
     * @param list list of rule names to enable (whitelist).
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    enableOnly(list: string | string[], ignoreInvalid?: boolean): string[];

    /**
     * Disable rules with given names. If any rule name not found - throw Error.
     * Errors can be disabled by second param.
     *
     * Returns list of found rule names (if no exception happened).
     *
     * See also [[Ruler.enable]], [[Ruler.enableOnly]].
     *
     * @param list list of rule names to disable.
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    disable(list: string | string[], ignoreInvalid?: boolean): string[];

    /**
     * Return array of active functions (rules) for given chain name. It analyzes
     * rules configuration, compiles caches if not exists and returns result.
     *
     * Default chain name is `''` (empty string). It can't be skipped. That's
     * done intentionally, to keep signature monomorphic for high speed.
     */
    getRules(chainName: string): T[];
}

declare namespace StateBlock {
    type ParentType = "blockquote" | "list" | "root" | "paragraph" | "reference";
}

declare class StateBlock {
    constructor(src: string, md: MarkdownIt, env: any, tokens: Token[]);

    src: string;

    /**
     * link to parser instance
     */
    md: MarkdownIt;

    env: any;

    //
    // Internal state vartiables
    //

    tokens: Token[];

    /**
     * line begin offsets for fast jumps
     */
    bMarks: number[];
    /**
     * line end offsets for fast jumps
     */
    eMarks: number[];
    /**
     * offsets of the first non-space characters (tabs not expanded)
     */
    tShift: number[];
    /**
     * indents for each line (tabs expanded)
     */
    sCount: number[];

    /**
     * An amount of virtual spaces (tabs expanded) between beginning
     * of each line (bMarks) and real beginning of that line.
     *
     * It exists only as a hack because blockquotes override bMarks
     * losing information in the process.
     *
     * It's used only when expanding tabs, you can think about it as
     * an initial tab length, e.g. bsCount=21 applied to string `\t123`
     * means first tab should be expanded to 4-21%4 === 3 spaces.
     */
    bsCount: number[];

    // block parser variables

    /**
     * required block content indent (for example, if we are
     * inside a list, it would be positioned after list marker)
     */
    blkIndent: number;
    /**
     * line index in src
     */
    line: number;
    /**
     * lines count
     */
    lineMax: number;
    /**
     * loose/tight mode for lists
     */
    tight: boolean;
    /**
     * indent of the current dd block (-1 if there isn't any)
     */
    ddIndent: number;
    /**
     * indent of the current list block (-1 if there isn't any)
     */
    listIndent: number;

    /**
     * can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
     * used in lists to determine if they interrupt a paragraph
     */
    parentType: StateBlock.ParentType;

    level: number;

    /**
     * renderer
     */
    result: string;

    /**
     * Push new token to "stream".
     */
    push(type: string, tag: string, nesting: Token.Nesting): Token;

    isEmpty(line: number): boolean;

    skipEmptyLines(from: number): number;

    /**
     * Skip spaces from given position.
     */
    skipSpaces(pos: number): number;

    /**
     * Skip spaces from given position in reverse.
     */
    skipSpacesBack(pos: number, min: number): number;

    /**
     * Skip char codes from given position
     */
    skipChars(pos: number, code: number): number;

    /**
     * Skip char codes reverse from given position - 1
     */
    skipCharsBack(pos: number, code: number, min: number): number;

    /**
     * cut lines range from source.
     */
    getLines(begin: number, end: number, indent: number, keepLastLF: boolean): string;

    Token: typeof Token;
}

declare namespace ParserBlock {
    type RuleBlock = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;
}

declare class ParserBlock {
    /**
     * [[Ruler]] instance. Keep configuration of block rules.
     */
    ruler: Ruler<ParserBlock.RuleBlock>;

    /**
     * Generate tokens for input range
     */
    tokenize(state: StateBlock, startLine: number, endLine: number): void;

    /**
     * Process input string and push block tokens into `outTokens`
     */
    parse(str: string, md: MarkdownIt, env: any, outTokens: Token[]): void;

    State: typeof StateBlock;
}

declare class StateCore {
    constructor(src: string, md: MarkdownIt, env: any);

    src: string;
    env: any;
    tokens: Token[];
    inlineMode: boolean;

    /**
     * link to parser instance
     */
    md: MarkdownIt;

    Token: typeof Token;
}

declare namespace Core {
    type RuleCore = (state: StateCore) => void;
}

declare class Core {
    ruler: Ruler<Core.RuleCore>;

    /**
     * Executes core chain rules.
     */
    process(state: StateCore): void;

    State: typeof StateCore;
}

declare namespace ParserInline {
    type RuleInline = (state: StateInline, silent: boolean) => boolean;
    type RuleInline2 = (state: StateInline) => boolean;
}

declare class ParserInline {
    /**
     * [[Ruler]] instance. Keep configuration of inline rules.
     */
    ruler: Ruler<ParserInline.RuleInline>;

    /**
     * [[Ruler]] instance. Second ruler used for post-processing
     * (e.g. in emphasis-like rules).
     */
    ruler2: Ruler<ParserInline.RuleInline2>;

    /**
     * Skip single token by running all rules in validation mode;
     * returns `true` if any rule reported success
     */
    skipToken(state: StateInline): void;

    /**
     * Generate tokens for input range
     */
    tokenize(state: StateInline): void;

    /**
     * Process input string and push inline tokens into `outTokens`
     */
    parse(str: string, md: MarkdownIt, env: any, outTokens: Token[]): void;

    State: typeof StateInline;
}

declare namespace Renderer {
    type RenderRule = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) => string;

    interface RenderRuleRecord {
        [type: string]: RenderRule | undefined;
        code_inline?: RenderRule | undefined;
        code_block?: RenderRule | undefined;
        fence?: RenderRule | undefined;
        image?: RenderRule | undefined;
        hardbreak?: RenderRule | undefined;
        softbreak?: RenderRule | undefined;
        text?: RenderRule | undefined;
        html_block?: RenderRule | undefined;
        html_inline?: RenderRule | undefined;
    }
}

declare class Renderer {
    /**
     * Contains render rules for tokens. Can be updated and extended.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.renderer.rules.strong_open  = function () { return '<b>'; };
     * md.renderer.rules.strong_close = function () { return '</b>'; };
     *
     * var result = md.renderInline(...);
     * ```
     *
     * Each rule is called as independent static function with fixed signature:
     *
     * ```javascript
     * function my_token_render(tokens, idx, options, env, renderer) {
     *   // ...
     *   return renderedHTML;
     * }
     * ```
     *
     * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
     * for more details and examples.
     */
    rules: Renderer.RenderRuleRecord;

    /**
     * Render token attributes to string.
     */
    renderAttrs(token: Token): string;

    /**
     * Default token renderer. Can be overriden by custom function
     * in [[Renderer#rules]].
     *
     * @param tokens list of tokens
     * @param idx token index to render
     * @param options params of parser instance
     */
    renderToken(tokens: Token[], idx: number, options: MarkdownIt.Options): string;

    /**
     * The same as [[Renderer.render]], but for single token of `inline` type.
     *
     * @param tokens list on block tokens to renter
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    renderInline(tokens: Token[], options: MarkdownIt.Options, env: any): string;

    /**
     * Special kludge for image `alt` attributes to conform CommonMark spec.
     * Don't try to use it! Spec requires to show `alt` content with stripped markup,
     * instead of simple escaping.
     *
     * @param tokens list on block tokens to renter
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    renderInlineAsText(tokens: Token[], options: MarkdownIt.Options, env: any): string;

    /**
     * Takes token stream and generates HTML. Probably, you will never need to call
     * this method directly.
     *
     * @param tokens list on block tokens to renter
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    render(tokens: Token[], options: MarkdownIt.Options, env: any): string;
}

interface MarkdownItConstructor {
    new(): MarkdownIt;
    new(presetName: MarkdownIt.PresetName, options?: MarkdownIt.Options): MarkdownIt;
    new(options: MarkdownIt.Options): MarkdownIt;
    (): MarkdownIt;
    (presetName: MarkdownIt.PresetName, options?: MarkdownIt.Options): MarkdownIt;
    (options: MarkdownIt.Options): MarkdownIt;
}

declare namespace MarkdownIt {
    type Token = __token;

    /**
     * MarkdownIt provides named presets as a convenience to quickly
     * enable/disable active syntax rules and options for common use cases.
     *
     * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
     *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
     * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
     *   similar to GFM, used when no preset name given. Enables all available rules,
     *   but still without html, typographer & autolinker.
     * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
     *   all rules disabled. Useful to quickly setup your config via `.enable()`.
     *   For example, when you need only `bold` and `italic` markup and nothing else.
     */
    type PresetName = "default" | "zero" | "commonmark";

    interface Options {
        /**
         * Set `true` to enable HTML tags in source. Be careful!
         * That's not safe! You may need external sanitizer to protect output from XSS.
         * It's better to extend features via plugins, instead of enabling HTML.
         * @default false
         */
        html?: boolean | undefined;

        /**
         * Set `true` to add '/' when closing single tags
         * (`<br />`). This is needed only for full CommonMark compatibility. In real
         * world you will need HTML output.
         * @default false
         */
        xhtmlOut?: boolean | undefined;

        /**
         * Set `true` to convert `\n` in paragraphs into `<br>`.
         * @default false
         */
        breaks?: boolean | undefined;

        /**
         * CSS language class prefix for fenced blocks.
         * Can be useful for external highlighters.
         * @default 'language-'
         */
        langPrefix?: string | undefined;

        /**
         * Set `true` to autoconvert URL-like text to links.
         * @default false
         */
        linkify?: boolean | undefined;

        /**
         * Set `true` to enable [some language-neutral replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
         * quotes beautification (smartquotes).
         * @default false
         */
        typographer?: boolean | undefined;

        /**
         * Double + single quotes replacement
         * pairs, when typographer enabled and smartquotes on. For example, you can
         * use `'«»„“'` for Russian, `'„“‚‘'` for German, and
         * `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
         * @default '“”‘’'
         */
        quotes?: string | string[];

        /**
         * Highlighter function for fenced code blocks.
         * Highlighter `function (str, lang, attrs)` should return escaped HTML. It can
         * also return empty string if the source was not changed and should be escaped
         * externally. If result starts with <pre... internal wrapper is skipped.
         * @default null
         */
        highlight?: ((str: string, lang: string, attrs: string) => string) | null | undefined;
    }

    type PluginSimple = (md: MarkdownIt) => void;
    type PluginWithOptions<T = any> = (md: MarkdownIt, options?: T) => void;
    type PluginWithParams = (md: MarkdownIt, ...params: any[]) => void;
}

interface MarkdownIt {
    /**
     * Instance of [[ParserInline]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     */
    readonly inline: ParserInline;

    /**
     * Instance of [[ParserBlock]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     */
    readonly block: ParserBlock;

    /**
     * Instance of [[Core]] chain executor. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     */
    readonly core: Core;

    /**
     * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
     * rules for new token types, generated by plugins.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * function myToken(tokens, idx, options, env, self) {
     *   //...
     *   return result;
     * };
     *
     * md.renderer.rules['my_token'] = myToken
     * ```
     *
     * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
     */
    readonly renderer: Renderer;

    /**
     * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
     * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
     * rule.
     */
    readonly linkify: LinkifyIt.LinkifyIt;

    /**
     * Link validation function. CommonMark allows too much in links. By default
     * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
     * except some embedded image types.
     *
     * You can change this behaviour:
     *
     * ```javascript
     * var md = require('markdown-it')();
     * // enable everything
     * md.validateLink = function () { return true; }
     * ```
     */
    validateLink(url: string): boolean;

    /**
     * Function used to encode link url to a machine-readable format,
     * which includes url-encoding, punycode, etc.
     */
    normalizeLink(url: string): string;

    /**
     * Function used to decode link url to a human-readable format`
     */
    normalizeLinkText(url: string): string;

    readonly utils: typeof utils;

    readonly helpers: typeof helpers;

    readonly options: MarkdownIt.Options;

    /**
     * *chainable*
     *
     * Set parser options (in the same format as in constructor). Probably, you
     * will never need it, but you can change options after constructor call.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')()
     *             .set({ html: true, breaks: true })
     *             .set({ typographer: true });
     * ```
     *
     * __Note:__ To achieve the best possible performance, don't modify a
     * `markdown-it` instance options on the fly. If you need multiple configurations
     * it's best to create multiple instances and initialize each with separate
     * config.
     */
    set(options: MarkdownIt.Options): this;

    /**
     * *chainable*, *internal*
     *
     * Batch load of all options and compenent settings. This is internal method,
     * and you probably will not need it. But if you with - see available presets
     * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
     *
     * We strongly recommend to use presets instead of direct config loads. That
     * will give better compatibility with next versions.
     */
    configure(presets: MarkdownIt.PresetName): this;

    /**
     * *chainable*
     *
     * Enable list or rules. It will automatically find appropriate components,
     * containing rules with given names. If rule not found, and `ignoreInvalid`
     * not set - throws exception.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')()
     *             .enable(['sub', 'sup'])
     *             .disable('smartquotes');
     * ```
     *
     * @param list rule name or list of rule names to enable
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    enable(list: string | string[], ignoreInvalid?: boolean): this;

    /**
     * *chainable*
     *
     * The same as [[MarkdownIt.enable]], but turn specified rules off.
     *
     * @param list rule name or list of rule names to disable.
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    disable(list: string | string[], ignoreInvalid?: boolean): this;

    /**
     * *chainable*
     *
     * Load specified plugin with given params into current parser instance.
     * It's just a sugar to call `plugin(md, params)` with curring.
     *
     * ##### Example
     *
     * ```javascript
     * var iterator = require('markdown-it-for-inline');
     * var md = require('markdown-it')()
     *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
     *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
     *             });
     * ```
     */
    use(plugin: MarkdownIt.PluginSimple): this;
    use<T = any>(plugin: MarkdownIt.PluginWithOptions<T>, options?: T): this;
    use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this;

    /**
     * *internal*
     *
     * Parse input string and returns list of block tokens (special token type
     * "inline" will contain list of inline tokens). You should not call this
     * method directly, until you write custom renderer (for example, to produce
     * AST).
     *
     * `env` is used to pass data between "distributed" rules and return additional
     * metadata like reference info, needed for the renderer. It also can be used to
     * inject data in specific cases. Usually, you will be ok to pass `{}`,
     * and then pass updated object to renderer.
     *
     * @param src source string
     * @param env environment sandbox
     */
    parse(src: string, env: any): Token[];

    /**
     * Render markdown string into html. It does all magic for you :).
     *
     * `env` can be used to inject additional metadata (`{}` by default).
     * But you will not need it with high probability. See also comment
     * in [[MarkdownIt.parse]].
     *
     * @param src source string
     * @param env environment sandbox
     */
    render(src: string, env?: any): string;

    /**
     * *internal*
     *
     * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
     * block tokens list with the single `inline` element, containing parsed inline
     * tokens in `children` property. Also updates `env` object.
     *
     * @param src source string
     * @param env environment sandbox
     */
    parseInline(src: string, env: any): Token[];

    /**
     * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
     * will NOT be wrapped into `<p>` tags.
     *
     * @param src source string
     * @param env environment sandbox
     */
    renderInline(src: string, env?: any): string;
}

/**
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 *
 * ##### Example
 *
 * ```javascript
 * // commonmark mode
 * var md = require('markdown-it')('commonmark');
 *
 * // default mode
 * var md = require('markdown-it')();
 *
 * // enable everything
 * var md = require('markdown-it')({
 *   html: true,
 *   linkify: true,
 *   typographer: true
 * });
 * ```
 *
 * ##### Syntax highlighting
 *
 * ```js
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return hljs.highlight(lang, str, true).value;
 *       } catch (__) {}
 *     }
 *
 *     return ''; // use external default escaping
 *   }
 * });
 * ```
 *
 * Or with full wrapper override (if you need assign class to `<pre>`):
 *
 * ```javascript
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * // Actual default values
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return '<pre class="hljs"><code>' +
 *                hljs.highlight(lang, str, true).value +
 *                '</code></pre>';
 *       } catch (__) {}
 *     }
 *
 *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
 *   }
 * });
 * ```
 */
declare const MarkdownIt: MarkdownItConstructor;

/**
 * Options of @mdit-vue/plugin-component
 */
interface ComponentPluginOptions {
    /**
     * Extra tags to be treated as block tags.
     *
     * @default []
     */
    blockTags?: string[];
    /**
     * Extra tags to be treated as inline tags.
     *
     * @default []
     */
    inlineTags?: string[];
}

/**
 * Takes a string or object with `content` property, extracts
 * and parses front-matter from the string, then returns an object
 * with `data`, `content` and other [useful properties](#returned-object).
 *
 * ```js
 * var matter = require('gray-matter');
 * console.log(matter('---\ntitle: Home\n---\nOther stuff'));
 * //=> { data: { title: 'Home'}, content: 'Other stuff' }
 * ```
 * @param {Object|String} `input` String, or object with `content` string
 * @param {Object} `options`
 * @return {Object}
 * @api public
 */
declare function matter<
  I extends matter.Input,
  O extends matter.GrayMatterOption<I, O>
>(input: I | { content: I }, options?: O): matter.GrayMatterFile<I>

declare namespace matter {
  type Input = string | Buffer
  interface GrayMatterOption<
    I extends Input,
    O extends GrayMatterOption<I, O>
  > {
    parser?: () => void
    eval?: boolean
    excerpt?: boolean | ((input: I, options: O) => string)
    excerpt_separator?: string
    engines?: {
      [index: string]:
        | ((input: string) => object)
        | { parse: (input: string) => object; stringify?: (data: object) => string }
    }
    language?: string
    delimiters?: string | [string, string]
  }
  interface GrayMatterFile<I extends Input> {
    data: { [key: string]: any }
    content: string
    excerpt?: string
    orig: Buffer | I
    language: string
    matter: string
    stringify(lang: string): string
  }
  
  /**
   * Stringify an object to YAML or the specified language, and
   * append it to the given string. By default, only YAML and JSON
   * can be stringified. See the [engines](#engines) section to learn
   * how to stringify other languages.
   *
   * ```js
   * console.log(matter.stringify('foo bar baz', {title: 'Home'}));
   * // results in:
   * // ---
   * // title: Home
   * // ---
   * // foo bar baz
   * ```
   * @param {String|Object} `file` The content string to append to stringified front-matter, or a file object with `file.content` string.
   * @param {Object} `data` Front matter to stringify.
   * @param {Object} `options` [Options](#options) to pass to gray-matter and [js-yaml].
   * @return {String} Returns a string created by wrapping stringified yaml with delimiters, and appending that to the given string.
   */
  export function stringify<O extends GrayMatterOption<string, O>>(
    file: string | { content: string },
    data: object,
    options?: GrayMatterOption<string, O>
  ): string

  /**
   * Synchronously read a file from the file system and parse
   * front matter. Returns the same object as the [main function](#matter).
   *
   * ```js
   * var file = matter.read('./content/blog-post.md');
   * ```
   * @param {String} `filepath` file path of the file to read.
   * @param {Object} `options` [Options](#options) to pass to gray-matter.
   * @return {Object} Returns [an object](#returned-object) with `data` and `content`
   */
  export function read<O extends GrayMatterOption<string, O>>(
    fp: string,
    options?: GrayMatterOption<string, O>
  ): matter.GrayMatterFile<string>

  /**
   * Returns true if the given `string` has front matter.
   * @param  {String} `string`
   * @param  {Object} `options`
   * @return {Boolean} True if front matter exists.
   */
  export function test<O extends matter.GrayMatterOption<string, O>>(
    str: string,
    options?: GrayMatterOption<string, O>
  ): boolean

  /**
   * Detect the language to use, if one is defined after the
   * first front-matter delimiter.
   * @param  {String} `string`
   * @param  {Object} `options`
   * @return {Object} Object with `raw` (actual language string), and `name`, the language with whitespace trimmed
   */
  export function language<O extends matter.GrayMatterOption<string, O>>(
    str: string,
    options?: GrayMatterOption<string, O>
  ): { name: string; raw: string }
}

type GrayMatterOptions = matter.GrayMatterOption<string, GrayMatterOptions>;
/**
 * Options of @mdit-vue/plugin-frontmatter
 */
interface FrontmatterPluginOptions {
    /**
     * Options of gray-matter
     *
     * @see https://github.com/jonschlinkert/gray-matter#options
     */
    grayMatterOptions?: GrayMatterOptions;
    /**
     * Render the excerpt or not
     *
     * @default true
     */
    renderExcerpt?: boolean;
}
declare module '@mdit-vue/types' {
    interface MarkdownItEnv {
        /**
         * The raw Markdown content without frontmatter
         */
        content?: string;
        /**
         * The excerpt that extracted by `@mdit-vue/plugin-frontmatter`
         *
         * - Would be the rendered HTML when `renderExcerpt` is enabled
         * - Would be the raw Markdown when `renderExcerpt` is disabled
         */
        excerpt?: string;
        /**
         * The frontmatter that extracted by `@mdit-vue/plugin-frontmatter`
         */
        frontmatter?: Record<string, unknown>;
    }
}

interface MarkdownItHeader {
    /**
     * The level of the header
     *
     * `1` to `6` for `<h1>` to `<h6>`
     */
    level: number;
    /**
     * The title of the header
     */
    title: string;
    /**
     * The slug of the header
     *
     * Typically the `id` attr of the header anchor
     */
    slug: string;
    /**
     * Link of the header
     *
     * Typically using `#${slug}` as the anchor hash
     */
    link: string;
    /**
     * The children of the header
     */
    children: MarkdownItHeader[];
}

/**
 * Options of @mdit-vue/plugin-headers
 */
interface HeadersPluginOptions {
    /**
     * A custom slugification function
     *
     * Should use the same slugify function with markdown-it-anchor
     * to ensure the link is matched
     */
    slugify?: (str: string) => string;
    /**
     * A function for formatting header title
     */
    format?: (str: string) => string;
    /**
     * Heading level that going to be extracted
     *
     * Should be a subset of markdown-it-anchor's `level` option
     * to ensure the slug is existed
     *
     * @default [2,3]
     */
    level?: number[];
    /**
     * Should allow headers inside nested blocks or not
     *
     * If set to `true`, headers inside blockquote, list, etc. would also be extracted.
     *
     * @default false
     */
    shouldAllowNested?: boolean;
}
declare module '@mdit-vue/types' {
    interface MarkdownItEnv {
        /**
         * The headers that extracted by `@mdit-vue/plugin-headers`
         */
        headers?: MarkdownItHeader[];
    }
}

/**
 * Options of @mdit-vue/plugin-sfc
 */
interface SfcPluginOptions {
    /**
     * Custom blocks to be extracted
     *
     * @default []
     */
    customBlocks?: string[];
}
/**
 * SFC block that extracted from markdown
 */
interface SfcBlock {
    /**
     * The type of the block
     */
    type: string;
    /**
     * The content, including open-tag and close-tag
     */
    content: string;
    /**
     * The content that stripped open-tag and close-tag off
     */
    contentStripped: string;
    /**
     * The open-tag
     */
    tagOpen: string;
    /**
     * The close-tag
     */
    tagClose: string;
}
interface MarkdownSfcBlocks {
    /**
     * The `<template>` block
     */
    template: SfcBlock | null;
    /**
     * The common `<script>` block
     */
    script: SfcBlock | null;
    /**
     * The `<script setup>` block
     */
    scriptSetup: SfcBlock | null;
    /**
     * All `<script>` blocks.
     *
     * By default, SFC only allows one `<script>` block and one `<script setup>` block.
     * However, some tools may support different types of `<script>`s, so we keep all of them here.
     */
    scripts: SfcBlock[];
    /**
     * All `<style>` blocks.
     */
    styles: SfcBlock[];
    /**
     * All custom blocks.
     */
    customBlocks: SfcBlock[];
}
declare module '@mdit-vue/types' {
    interface MarkdownItEnv {
        /**
         * SFC blocks that extracted by `@mdit-vue/plugin-sfc`
         */
        sfcBlocks?: MarkdownSfcBlocks;
    }
}

/**
 * Options of @mdit-vue/plugin-toc
 */
interface TocPluginOptions {
    /**
     * The pattern serving as the TOC placeholder in your markdown
     *
     * @default /^\[\[toc\]\]$/i
     */
    pattern?: RegExp;
    /**
     * A custom slugification function
     *
     * Should use the same slugify function with markdown-it-anchor
     * to ensure the link is matched
     */
    slugify?: (str: string) => string;
    /**
     * A function for formatting headings
     */
    format?: (str: string) => string;
    /**
     * Heading level that going to be included in the TOC
     *
     * Should be a subset of markdown-it-anchor's `level` option
     * to ensure the link is existed
     *
     * @default [2,3]
     */
    level?: number[];
    /**
     * Should allow headers inside nested blocks or not
     *
     * If set to `true`, headers inside blockquote, list, etc. would also be included.
     *
     * @default false
     */
    shouldAllowNested?: boolean;
    /**
     * HTML tag of the TOC container
     *
     * @default 'nav'
     */
    containerTag?: string;
    /**
     * The class for the TOC container
     *
     * @default 'table-of-contents'
     */
    containerClass?: string;
    /**
     * HTML tag of the TOC list
     *
     * @default 'ul'
     */
    listTag?: 'ul' | 'ol';
    /**
     * The class for the TOC list
     *
     * @default ''
     */
    listClass?: string;
    /**
     * The class for the `<li>` tag
     *
     * @default ''
     */
    itemClass?: string;
    /**
     * The tag of the link inside `<li>` tag
     *
     * @default 'a'
     */
    linkTag?: 'a' | 'router-link';
    /**
     * The class for the link inside the `<li>` tag
     *
     * @default ''
     */
    linkClass?: string;
}

declare namespace anchor {
  export type RenderHref = (slug: string, state: StateCore) => string;
  export type RenderAttrs = (slug: string, state: StateCore) => Record<string, string | number>;

  export interface PermalinkOptions {
    class?: string,
    symbol?: string,
    renderHref?: RenderHref,
    renderAttrs?: RenderAttrs
  }

  export interface HeaderLinkPermalinkOptions extends PermalinkOptions {
    safariReaderFix?: boolean;
  }

  export interface LinkAfterHeaderPermalinkOptions extends PermalinkOptions {
    style?: 'visually-hidden' | 'aria-label' | 'aria-describedby' | 'aria-labelledby',
    assistiveText?: (title: string) => string,
    visuallyHiddenClass?: string,
    space?: boolean | string,
    placement?: 'before' | 'after'
    wrapper?: [string, string] | null
  }

  export interface LinkInsideHeaderPermalinkOptions extends PermalinkOptions {
    space?: boolean | string,
    placement?: 'before' | 'after',
    ariaHidden?: boolean
  }

  export interface AriaHiddenPermalinkOptions extends PermalinkOptions {
    space?: boolean | string,
    placement?: 'before' | 'after'
  }

  export type PermalinkGenerator = (slug: string, opts: PermalinkOptions, state: StateCore, index: number) => void;

  export interface AnchorInfo {
    slug: string;
    title: string;
  }

  export interface AnchorOptions {
    level?: number | number[];

    slugify?(str: string): string;
    getTokensText?(tokens: Token[]): string;

    uniqueSlugStartIndex?: number;
    permalink?: PermalinkGenerator;

    callback?(token: Token, anchor_info: AnchorInfo): void;

    tabIndex?: number | false;
  }

  export const permalink: {
    headerLink: (opts?: HeaderLinkPermalinkOptions) => PermalinkGenerator
    linkAfterHeader: (opts?: LinkAfterHeaderPermalinkOptions) => PermalinkGenerator
    linkInsideHeader: (opts?: LinkInsideHeaderPermalinkOptions) => PermalinkGenerator
    ariaHidden: (opts?: AriaHiddenPermalinkOptions) => PermalinkGenerator
  };
}

declare function anchor(md: MarkdownIt, opts?: anchor.AnchorOptions): void;

interface ContainerOptions {
    infoLabel?: string;
    noteLabel?: string;
    tipLabel?: string;
    warningLabel?: string;
    dangerLabel?: string;
    detailsLabel?: string;
    importantLabel?: string;
    cautionLabel?: string;
}

interface Options$1 {
    /**
     * Support native lazy loading for the `<img>` tag.
     * @default false
     */
    lazyLoading?: boolean;
}

type ThemeOptions = ThemeRegistrationAny | BuiltinTheme | {
    light: ThemeRegistrationAny | BuiltinTheme;
    dark: ThemeRegistrationAny | BuiltinTheme;
};
interface MarkdownOptions extends MarkdownIt.Options {
    /**
     * Setup markdown-it instance before applying plugins
     */
    preConfig?: (md: MarkdownIt) => void;
    /**
     * Setup markdown-it instance
     */
    config?: (md: MarkdownIt) => void;
    /**
     * Disable cache (experimental)
     */
    cache?: boolean;
    externalLinks?: Record<string, string>;
    /**
     * Custom theme for syntax highlighting.
     *
     * You can also pass an object with `light` and `dark` themes to support dual themes.
     *
     * @example { theme: 'github-dark' }
     * @example { theme: { light: 'github-light', dark: 'github-dark' } }
     *
     * You can use an existing theme.
     * @see https://shiki.style/themes
     * Or add your own theme.
     * @see https://shiki.style/guide/load-theme
     */
    theme?: ThemeOptions;
    /**
     * Languages for syntax highlighting.
     * @see https://shiki.style/languages
     */
    languages?: LanguageInput[];
    /**
     * Custom language aliases.
     *
     * @example { 'my-lang': 'js' }
     * @see https://shiki.style/guide/load-lang#custom-language-aliases
     */
    languageAlias?: Record<string, string>;
    /**
     * Show line numbers in code blocks
     * @default false
     */
    lineNumbers?: boolean;
    /**
     * Fallback language when the specified language is not available.
     */
    defaultHighlightLang?: string;
    /**
     * Transformers applied to code blocks
     * @see https://shiki.style/guide/transformers
     */
    codeTransformers?: ShikiTransformer[];
    /**
     * Setup Shiki instance
     */
    shikiSetup?: (shiki: Highlighter) => void | Promise<void>;
    /**
     * Options for `markdown-it-anchor`
     * @see https://github.com/valeriangalliat/markdown-it-anchor
     */
    anchor?: anchor.AnchorOptions;
    /**
     * Options for `markdown-it-attrs`
     * @see https://github.com/arve0/markdown-it-attrs
     */
    attrs?: {
        leftDelimiter?: string;
        rightDelimiter?: string;
        allowedAttributes?: Array<string | RegExp>;
        disable?: boolean;
    };
    /**
     * Options for `markdown-it-emoji`
     * @see https://github.com/markdown-it/markdown-it-emoji
     */
    emoji?: {
        defs?: Record<string, string>;
        enabled?: string[];
        shortcuts?: Record<string, string | string[]>;
    };
    /**
     * Options for `@mdit-vue/plugin-frontmatter`
     * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-frontmatter
     */
    frontmatter?: FrontmatterPluginOptions;
    /**
     * Options for `@mdit-vue/plugin-headers`
     * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers
     */
    headers?: HeadersPluginOptions | boolean;
    /**
     * Options for `@mdit-vue/plugin-sfc`
     * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-sfc
     */
    sfc?: SfcPluginOptions;
    /**
     * Options for `@mdit-vue/plugin-toc`
     * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc
     */
    toc?: TocPluginOptions;
    /**
     * Options for `@mdit-vue/plugin-component`
     * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-component
     */
    component?: ComponentPluginOptions;
    /**
     * Options for `markdown-it-container`
     * @see https://github.com/markdown-it/markdown-it-container
     */
    container?: ContainerOptions;
    /**
     * Math support (experimental)
     *
     * You need to install `markdown-it-mathjax3` and set `math` to `true` to enable it.
     * You can also pass options to `markdown-it-mathjax3` here.
     * @default false
     * @see https://vitepress.dev/guide/markdown#math-equations
     */
    math?: boolean | any;
    image?: Options$1;
    /**
     * Allows disabling the github alerts plugin
     * @default true
     * @see https://vitepress.dev/guide/markdown#github-flavored-alerts
     */
    gfmAlerts?: boolean;
}
type MarkdownRenderer = MarkdownIt;
declare const createMarkdownRenderer: (srcDir: string, options?: MarkdownOptions, base?: string, logger?: Pick<Logger, 'warn'>) => Promise<MarkdownRenderer>;

type RawConfigExports<ThemeConfig = any> = Awaitable<UserConfig<ThemeConfig>> | (() => Awaitable<UserConfig<ThemeConfig>>);
interface TransformContext {
    page: string;
    siteConfig: SiteConfig;
    siteData: SiteData;
    pageData: PageData;
    title: string;
    description: string;
    head: HeadConfig[];
    content: string;
    assets: string[];
}
interface UserRouteConfig {
    params: Record<string, string>;
    content?: string;
}
type ResolvedRouteConfig = UserRouteConfig & {
    /**
     * the raw route (relative to src root), e.g. foo/[bar].md
     */
    route: string;
    /**
     * the actual path with params resolved (relative to src root), e.g. foo/1.md
     */
    path: string;
    /**
     * absolute fs path
     */
    fullPath: string;
};
interface TransformPageContext {
    siteConfig: SiteConfig;
}
interface UserConfig<ThemeConfig = any> extends LocaleSpecificConfig<ThemeConfig> {
    extends?: RawConfigExports<ThemeConfig>;
    base?: string;
    srcDir?: string;
    srcExclude?: string[];
    outDir?: string;
    assetsDir?: string;
    cacheDir?: string;
    shouldPreload?: (link: string, page: string) => boolean;
    locales?: LocaleConfig<ThemeConfig>;
    router?: {
        prefetchLinks?: boolean;
    };
    appearance?: boolean | 'dark' | 'force-dark' | (Omit<UseDarkOptions, 'initialValue'> & {
        initialValue?: 'dark';
    });
    lastUpdated?: boolean;
    contentProps?: Record<string, any>;
    /**
     * MarkdownIt options
     */
    markdown?: MarkdownOptions;
    /**
     * Options to pass on to `@vitejs/plugin-vue`
     */
    vue?: Options$2;
    /**
     * Vite config
     */
    vite?: UserConfig$1 & {
        configFile?: string | false;
    };
    /**
     * Configure the scroll offset when the theme has a sticky header.
     * Can be a number or a selector element to get the offset from.
     * Can also be an array of selectors in case some elements will be
     * invisible due to responsive layout. VitePress will fallback to the next
     * selector if a selector fails to match, or the matched element is not
     * currently visible in viewport.
     */
    scrollOffset?: number | string | string[] | {
        selector: string | string[];
        padding: number;
    };
    /**
     * Enable MPA / zero-JS mode.
     * @experimental
     */
    mpa?: boolean;
    /**
     * Extracts metadata to a separate chunk.
     * @experimental
     */
    metaChunk?: boolean;
    /**
     * Don't fail builds due to dead links.
     *
     * @default false
     */
    ignoreDeadLinks?: boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[];
    /**
     * Don't force `.html` on URLs.
     *
     * @default false
     */
    cleanUrls?: boolean;
    /**
     * Use web fonts instead of emitting font files to dist.
     * The used theme should import a file named `fonts.(s)css` for this to work.
     * If you are a theme author, to support this, place your web font import
     * between `webfont-marker-begin` and `webfont-marker-end` comments.
     *
     * @default true in webcontainers, else false
     */
    useWebFonts?: boolean;
    /**
     * This option allows you to configure the concurrency of the build.
     * A lower number will reduce the memory usage but will increase the build time.
     *
     * @experimental
     * @default 64
     */
    buildConcurrency?: number;
    /**
     * @experimental
     *
     * source -> destination
     */
    rewrites?: Record<string, string>;
    /**
     * @experimental
     */
    sitemap?: SitemapStreamOptions & {
        hostname: string;
        transformItems?: (items: SitemapItem[]) => Awaitable<SitemapItem[]>;
    };
    /**
     * Build end hook: called when SSG finish.
     * @param siteConfig The resolved configuration.
     */
    buildEnd?: (siteConfig: SiteConfig) => Awaitable<void>;
    /**
     * Render end hook: called when SSR rendering is done.
     */
    postRender?: (context: SSGContext) => Awaitable<SSGContext | void>;
    /**
     * Head transform hook: runs before writing HTML to dist.
     *
     * This build hook will allow you to modify the head adding new entries that cannot be statically added.
     */
    transformHead?: (context: TransformContext) => Awaitable<HeadConfig[] | void>;
    /**
     * HTML transform hook: runs before writing HTML to dist.
     */
    transformHtml?: (code: string, id: string, ctx: TransformContext) => Awaitable<string | void>;
    /**
     * PageData transform hook: runs when rendering markdown to vue
     */
    transformPageData?: (pageData: PageData, ctx: TransformPageContext) => Awaitable<Partial<PageData> | {
        [key: string]: any;
    } | void>;
}
interface SiteConfig<ThemeConfig = any> extends Pick<UserConfig, 'markdown' | 'vue' | 'vite' | 'shouldPreload' | 'router' | 'mpa' | 'metaChunk' | 'lastUpdated' | 'ignoreDeadLinks' | 'cleanUrls' | 'useWebFonts' | 'postRender' | 'buildEnd' | 'transformHead' | 'transformHtml' | 'transformPageData' | 'sitemap'> {
    root: string;
    srcDir: string;
    site: SiteData<ThemeConfig>;
    configPath: string | undefined;
    configDeps: string[];
    themeDir: string;
    outDir: string;
    assetsDir: string;
    cacheDir: string;
    tempDir: string;
    pages: string[];
    dynamicRoutes: {
        routes: ResolvedRouteConfig[];
        fileToModulesMap: Record<string, Set<string>>;
    };
    rewrites: {
        map: Record<string, string | undefined>;
        inv: Record<string, string | undefined>;
    };
    logger: Logger;
    userConfig: UserConfig;
    buildConcurrency: number;
}

declare function resolvePages(srcDir: string, userConfig: UserConfig, logger: Logger): Promise<{
    pages: string[];
    dynamicRoutes: {
        routes: ResolvedRouteConfig[];
        fileToModulesMap: Record<string, Set<string>>;
    };
    rewrites: {
        map: Record<string, string>;
        inv: Record<string, string>;
    };
}>;

type UserConfigFn<ThemeConfig> = (env: ConfigEnv) => UserConfig<ThemeConfig> | Promise<UserConfig<ThemeConfig>>;
type UserConfigExport<ThemeConfig> = UserConfig<ThemeConfig> | Promise<UserConfig<ThemeConfig>> | UserConfigFn<ThemeConfig>;
/**
 * Type config helper
 */
declare function defineConfig(config: UserConfig<DefaultTheme.Config>): UserConfig<DefaultTheme.Config>;
/**
 * Type config helper for custom theme config
 */
declare function defineConfigWithTheme<ThemeConfig>(config: UserConfig<ThemeConfig>): UserConfig<ThemeConfig>;
declare function resolveConfig(root?: string, command?: 'serve' | 'build', mode?: string): Promise<SiteConfig>;
declare function resolveUserConfig(root: string, command: 'serve' | 'build', mode: string): Promise<[UserConfig, string | undefined, string[]]>;
declare function mergeConfig(a: UserConfig, b: UserConfig, isRoot?: boolean): Record<string, any>;
declare function resolveSiteData(root: string, userConfig?: UserConfig, command?: 'serve' | 'build', mode?: string): Promise<SiteData>;

interface ContentOptions<T = ContentData[]> {
    /**
     * Include src?
     * @default false
     */
    includeSrc?: boolean;
    /**
     * Render src to HTML and include in data?
     * @default false
     */
    render?: boolean;
    /**
     * If `boolean`, whether to parse and include excerpt? (rendered as HTML)
     *
     * If `function`, control how the excerpt is extracted from the content.
     *
     * If `string`, define a custom separator to be used for extracting the
     * excerpt. Default separator is `---` if `excerpt` is `true`.
     *
     * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
     * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
     *
     * @default false
     */
    excerpt?: boolean | ((file: {
        data: {
            [key: string]: any;
        };
        content: string;
        excerpt?: string;
    }, options?: any) => void) | string;
    /**
     * Transform the data. Note the data will be inlined as JSON in the client
     * bundle if imported from components or markdown files.
     */
    transform?: (data: ContentData[]) => T | Promise<T>;
    /**
     * Options to pass to `fast-glob`.
     * You'll need to manually specify `node_modules` and `dist` in
     * `globOptions.ignore` if you've overridden it.
     */
    globOptions?: glob.Options;
}
interface ContentData {
    url: string;
    src: string | undefined;
    html: string | undefined;
    frontmatter: Record<string, any>;
    excerpt: string | undefined;
}
/**
 * Create a loader object that can be directly used as the default export
 * of a data loader file.
 */
declare function createContentLoader<T = ContentData[]>(
/**
 * files to glob / watch - relative to <project root>
 */
pattern: string | string[], { includeSrc, render, excerpt: renderExcerpt, transform, globOptions }?: ContentOptions<T>): {
    watch: string | string[];
    load: () => Promise<T>;
};

declare enum ScaffoldThemeType {
    Default = "default theme",
    DefaultCustom = "default theme + customization",
    Custom = "custom theme"
}
interface ScaffoldOptions {
    root: string;
    title?: string;
    description?: string;
    theme: ScaffoldThemeType;
    useTs: boolean;
    injectNpmScripts: boolean;
}
declare function init(): Promise<void>;
declare function scaffold({ root, title, description, theme, useTs, injectNpmScripts }: ScaffoldOptions): string;

interface LoaderModule {
    watch?: string[] | string;
    load: (watchedFiles: string[]) => any;
}
/**
 * Helper for defining loaders with type inference
 */
declare function defineLoader(loader: LoaderModule): LoaderModule;

interface Options {
    prefix?: string | undefined;
    exclude?: ReadonlyArray<string | RegExp> | undefined;
    ignoreFiles?: ReadonlyArray<string | RegExp> | undefined;
    includeFiles?: ReadonlyArray<string | RegExp> | undefined;
    transform?:
        | ((
            prefix: Readonly<string>,
            selector: Readonly<string>,
            prefixedSelector: Readonly<string>,
            file: Readonly<string>,
        ) => string)
        | undefined;
}

declare function postcssPrefixSelector(options: Readonly<Options>): (root: Root) => void;

declare function postcssIsolateStyles(options?: Parameters<typeof postcssPrefixSelector>[0]): ReturnType<typeof postcssPrefixSelector>;

interface ParsedURL {
	pathname: string;
	search: string;
	query: Record<string, string | string[]> | void;
	raw: string;
}

// Thank you: @fwilkerson, @stahlstift
// ---

/** @type {import('http').METHODS} */
type Methods = 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' |'M-SEARCH' | 'MERGE' | 'MKACTIVITY' |'MKCALENDAR' | 'MKCOL' | 'MOVE' |'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PRI' | 'PROPFIND' |  'PROPPATCH' |  'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE';

type Pattern = RegExp | string;

declare class Trouter<T = Function> {
	find(method: Methods, url: string): {
		params: Record<string, string>;
		handlers: T[];
	};
	add(method: Methods, pattern: Pattern, ...handlers: T[]): this;
	use(pattern: Pattern, ...handlers: T[]): this;
	all(pattern: Pattern, ...handlers: T[]): this;
	get(pattern: Pattern, ...handlers: T[]): this;
	head(pattern: Pattern, ...handlers: T[]): this;
	patch(pattern: Pattern, ...handlers: T[]): this;
	options(pattern: Pattern, ...handlers: T[]): this;
	connect(pattern: Pattern, ...handlers: T[]): this;
	delete(pattern: Pattern, ...handlers: T[]): this;
	trace(pattern: Pattern, ...handlers: T[]): this;
	post(pattern: Pattern, ...handlers: T[]): this;
	put(pattern: Pattern, ...handlers: T[]): this;
}

type Promisable<T> = Promise<T> | T;
type ListenCallback = () => Promisable<void>;

declare namespace polka {
	export interface IError extends Error {
		code?: number;
		status?: number;
		details?: any;
	}

	export type NextHandler = (err?: string | IError) => Promisable<void>;
	export type ErrorHandler<T extends Request = Request> = (err: string | IError, req: T, res: Response, next: NextHandler) => Promisable<void>;
	export type Middleware<T extends IncomingMessage = Request> = (req: T & Request, res: Response, next: NextHandler) => Promisable<void>;

	export interface IOptions<T extends Request = Request> {
		server?: Server;
		onNoMatch?: Middleware<T>;
		onError?: ErrorHandler<T>;
	}

	export type Response = ServerResponse;

	export interface Request extends IncomingMessage {
		url: string;
		method: string;
		originalUrl: string;
		params: Record<string, string>;
		path: string;
		search: string;
		query: Record<string,string>;
		body?: any;
		_decoded?: true;
		_parsedUrl: ParsedURL;
	}

	export interface Polka<T extends Request = Request> extends Trouter<Middleware<T>> {
		readonly server: Server;
		readonly wares: Middleware<T>[];

		readonly onError: ErrorHandler<T>;
		readonly onNoMatch: Middleware<T>;

		readonly handler: Middleware<T>;
		parse: (req: IncomingMessage) => ParsedURL;

		use(pattern: RegExp|string, ...handlers: (Polka<T> | Middleware<T>)[]): this;
		use(...handlers: (Polka<T> | Middleware<T>)[]): this;

		listen(port?: number, hostname?: string, backlog?: number, callback?: ListenCallback): this;
		listen(port?: number, hostname?: string, callback?: ListenCallback): this;
		listen(port?: number, backlog?: number, callback?: ListenCallback): this;
		listen(port?: number, callback?: ListenCallback): this;
		listen(path: string, backlog?: number, callback?: ListenCallback): this;
		listen(path: string, callback?: ListenCallback): this;
		listen(options: ListenOptions, callback?: ListenCallback): this;
		listen(handle: any, backlog?: number, callback?: ListenCallback): this;
		listen(handle: any, callback?: ListenCallback): this;
	}
}

declare function polka<T extends polka.Request = polka.Request>(
	options?: polka.IOptions<T>
): polka.Polka<T>;

interface ServeOptions {
    base?: string;
    root?: string;
    port?: number;
}
declare function serve(options?: ServeOptions): Promise<polka.Polka<polka.Request>>;

declare function createServer(root?: string, serverOptions?: ServerOptions & {
    base?: string;
}, recreateServer?: () => Promise<void>): Promise<vite.ViteDevServer>;

export { type ContentData, type ContentOptions, type LoaderModule, type MarkdownOptions, type MarkdownRenderer, type RawConfigExports, type ResolvedRouteConfig, type ScaffoldOptions, ScaffoldThemeType, type ServeOptions, type SiteConfig, type ThemeOptions, type TransformContext, type TransformPageContext, type UserConfig, type UserConfigExport, type UserConfigFn, build, createContentLoader, createMarkdownRenderer, createServer, defineConfig, defineConfigWithTheme, defineLoader, init, mergeConfig, postcssIsolateStyles, resolveConfig, resolvePages, resolveSiteData, resolveUserConfig, scaffold, serve };
