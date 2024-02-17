import { ThemeRegistration } from '@shikijs/core';

interface CssVariablesThemeOptions {
    /**
     * Theme name. Need to unique if multiple css variables themes are created
     *
     * @default 'css-variables'
     */
    name?: string;
    /**
     * Prefix for css variables
     *
     * @default '--shiki-'
     */
    variablePrefix?: string;
    /**
     * Default value for css variables, the key is without the prefix
     *
     * @example `{ 'token-comment': '#888' }` will generate `var(--shiki-token-comment, #888)` for comments
     */
    variableDefaults?: Record<string, string>;
    /**
     * Enable font style
     *
     * @default true
     */
    fontStyle?: boolean;
}
/**
 * A factory function to create a css-variable-based theme
 *
 * @experimental This API is experimental and may change without following semver
 * @see https://shiki.style/guide/theme-colors#css-variables-theme
 */
declare function createCssVariablesTheme(options?: CssVariablesThemeOptions): ThemeRegistration;

export { type CssVariablesThemeOptions, createCssVariablesTheme };
