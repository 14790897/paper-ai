import { F as FontStyle } from './chunk-tokens.mjs';
export { c as IGrammar, d as IGrammarConfiguration, I as INITIAL, e as IOnigLib, b as IRawGrammar, a as IRawTheme, g as IRawThemeSetting, R as Registry, f as RegistryOptions, S as StateStack } from './chunk-tokens.mjs';
import './chunk-index.mjs';

declare const enum TemporaryStandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 4,
    MetaEmbedded = 8
}
declare const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 4
}
declare class StackElementMetadata {
    static toBinaryStr(metadata: number): string;
    static getLanguageId(metadata: number): number;
    static getTokenType(metadata: number): number;
    static getFontStyle(metadata: number): number;
    static getForeground(metadata: number): number;
    static getBackground(metadata: number): number;
    static containsBalancedBrackets(metadata: number): boolean;
    static set(metadata: number, languageId: number, tokenType: TemporaryStandardTokenType, fontStyle: FontStyle, foreground: number, background: number): number;
}

export { StackElementMetadata, StandardTokenType, TemporaryStandardTokenType };
