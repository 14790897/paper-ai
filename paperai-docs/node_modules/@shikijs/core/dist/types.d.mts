import { T as ThemeInput, q as SpecialTheme, L as LanguageInput, p as SpecialLanguage, z as ThemeRegistrationAny, t as ThemeRegistrationResolved, J as LanguageRegistration, c as IGrammar, C as CodeToHastOptions, G as ResolveBundleKey, h as Root, i as CodeToTokensOptions, j as TokensResult, l as CodeToTokensBaseOptions, m as ThemedToken, n as CodeToTokensWithThemesOptions, o as ThemedTokenWithVariants } from './chunk-tokens.mjs';
export { D as AnsiLanguage, a7 as Awaitable, B as BundledHighlighterOptions, K as BundledLanguageInfo, a0 as BundledThemeInfo, X as CodeOptionsMeta, U as CodeOptionsMultipleThemes, Q as CodeOptionsSingleTheme, V as CodeOptionsThemes, W as CodeToHastOptionsCommon, w as CodeToHastRenderOptions, Y as CodeToHastRenderOptionsCommon, ac as DecorationItem, ab as DecorationOptions, ae as DecorationTransformType, O as DynamicImportLanguageRegistration, $ as DynamicImportThemeRegistration, F as FontStyle, H as HighlighterCoreOptions, M as MaybeArray, a8 as MaybeGetter, a9 as MaybeModule, af as Offset, ag as OffsetOrPosition, P as PlainTextLanguage, s as Position, b as RawGrammar, a as RawTheme, g as RawThemeSetting, k as RequireKeys, ad as ResolvedDecorationItem, ah as ResolvedPosition, A as ShikiTransformer, a6 as ShikiTransformerContext, v as ShikiTransformerContextCommon, a5 as ShikiTransformerContextMeta, x as ShikiTransformerContextSource, aa as StringLiteralUnion, _ as ThemeRegistration, Z as ThemeRegistrationRaw, a2 as ThemedTokenExplanation, a1 as ThemedTokenScopeExplanation, a3 as TokenBase, r as TokenStyles, u as TokenizeWithThemeOptions, a4 as TransformerOptions } from './chunk-tokens.mjs';
import './chunk-index.mjs';

/**
 * Internal context of Shiki, core textmate logic
 */
interface ShikiInternal<BundledLangKeys extends string = never, BundledThemeKeys extends string = never> {
    /**
     * Load a theme to the highlighter, so later it can be used synchronously.
     */
    loadTheme: (...themes: (ThemeInput | BundledThemeKeys | SpecialTheme)[]) => Promise<void>;
    /**
     * Load a language to the highlighter, so later it can be used synchronously.
     */
    loadLanguage: (...langs: (LanguageInput | BundledLangKeys | SpecialLanguage)[]) => Promise<void>;
    /**
     * Get the registered theme object
     */
    getTheme: (name: string | ThemeRegistrationAny) => ThemeRegistrationResolved;
    /**
     * Get the registered language object
     */
    getLanguage: (name: string | LanguageRegistration) => IGrammar;
    /**
     * Set the current theme and get the resolved theme object and color map.
     * @internal
     */
    setTheme: (themeName: string | ThemeRegistrationAny) => {
        theme: ThemeRegistrationResolved;
        colorMap: string[];
    };
    /**
     * Get the names of loaded languages
     *
     * Special-handled languages like `text`, `plain` and `ansi` are not included.
     */
    getLoadedLanguages: () => string[];
    /**
     * Get the names of loaded themes
     *
     * Special-handled themes like `none` are not included.
     */
    getLoadedThemes: () => string[];
}
/**
 * Generic instance interface of Shiki
 */
interface HighlighterGeneric<BundledLangKeys extends string, BundledThemeKeys extends string> extends ShikiInternal<BundledLangKeys, BundledThemeKeys> {
    /**
     * Get highlighted code in HTML string
     */
    codeToHtml: (code: string, options: CodeToHastOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => string;
    /**
     * Get highlighted code in HAST.
     * @see https://github.com/syntax-tree/hast
     */
    codeToHast: (code: string, options: CodeToHastOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => Root;
    /**
     * Get highlighted code in tokens. Uses `codeToTokensWithThemes` or `codeToTokensBase` based on the options.
     */
    codeToTokens: (code: string, options: CodeToTokensOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => TokensResult;
    /**
     * Get highlighted code in tokens with a single theme.
     * @returns A 2D array of tokens, first dimension is lines, second dimension is tokens in a line.
     */
    codeToTokensBase: (code: string, options: CodeToTokensBaseOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => ThemedToken[][];
    /**
     * Get highlighted code in tokens with multiple themes.
     *
     * Different from `codeToTokensBase`, each token will have a `variants` property consisting of an object of color name to token styles.
     *
     * @returns A 2D array of tokens, first dimension is lines, second dimension is tokens in a line.
     */
    codeToTokensWithThemes: (code: string, options: CodeToTokensWithThemesOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => ThemedTokenWithVariants[][];
    /**
     * Get internal context object
     * @internal
     * @deprecated
     */
    getInternalContext: () => ShikiInternal;
}
/**
 * The fine-grained core Shiki highlighter instance.
 */
type HighlighterCore = HighlighterGeneric<never, never>;

export { CodeToHastOptions, CodeToTokensBaseOptions, CodeToTokensOptions, CodeToTokensWithThemesOptions, IGrammar as Grammar, type HighlighterCore, type HighlighterGeneric, LanguageInput, LanguageRegistration, ResolveBundleKey, type ShikiInternal, SpecialLanguage, SpecialTheme, ThemeInput, ThemeRegistrationAny, ThemeRegistrationResolved, ThemedToken, ThemedTokenWithVariants, TokensResult };
