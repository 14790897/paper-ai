import { ShikiTransformer, ShikiTransformerContext } from 'shiki';
import { Element } from 'hast';

interface TransformerRenderWhitespaceOptions {
    /**
     * Class for tab
     *
     * @default 'tab'
     */
    classTab?: string;
    /**
     * Class for space
     *
     * @default 'space'
     */
    classSpace?: string;
    /**
     * Position of rendered whitespace
     * @default all position
     */
    position?: 'all' | 'boundary' | 'trailing';
}
/**
 * Render whitespaces as separate tokens.
 * Apply with CSS, it can be used to render tabs and spaces visually.
 */
declare function transformerRenderWhitespace(options?: TransformerRenderWhitespaceOptions): ShikiTransformer;

/**
 * Remove line breaks between lines.
 * Useful when you override `display: block` to `.line` in CSS.
 */
declare function transformerRemoveLineBreak(): ShikiTransformer;

interface TransformerCompactLineOption {
    /**
     * 1-based line number.
     */
    line: number;
    classes?: string[];
}
/**
 * Transformer for `shiki`'s legacy `lineOptions`
 */
declare function transformerCompactLineOptions(lineOptions?: TransformerCompactLineOption[]): ShikiTransformer;

interface TransformerNotationFocusOptions {
    /**
     * Class for focused lines
     */
    classActiveLine?: string;
    /**
     * Class added to the root element when the code has focused lines
     */
    classActivePre?: string;
}
/**
 * Allow using `[!code focus]` notation in code to mark focused lines.
 */
declare function transformerNotationFocus(options?: TransformerNotationFocusOptions): ShikiTransformer;

interface TransformerNotationHighlightOptions {
    /**
     * Class for highlighted lines
     */
    classActiveLine?: string;
    /**
     * Class added to the root element when the code has highlighted lines
     */
    classActivePre?: string;
}
/**
 * Allow using `[!code highlight]` notation in code to mark highlighted lines.
 */
declare function transformerNotationHighlight(options?: TransformerNotationHighlightOptions): ShikiTransformer;

interface TransformerNotationWordHighlightOptions {
    /**
     * Class for highlighted words
     */
    classActiveWord?: string;
    /**
     * Class added to the root element when the code has highlighted words
     */
    classActivePre?: string;
}
declare function transformerNotationWordHighlight(options?: TransformerNotationWordHighlightOptions): ShikiTransformer;

declare function parseMetaHighlightWords(meta: string): string[];
interface TransformerMetaWordHighlightOptions {
    /**
     * Class for highlighted words
     *
     * @default 'highlighted-word'
     */
    className?: string;
}
/**
 * Allow using `/word/` in the code snippet meta to mark highlighted words.
 */
declare function transformerMetaWordHighlight(options?: TransformerMetaWordHighlightOptions): ShikiTransformer;

interface TransformerNotationDiffOptions {
    /**
     * Class for added lines
     */
    classLineAdd?: string;
    /**
     * Class for removed lines
     */
    classLineRemove?: string;
    /**
     * Class added to the <pre> element when the current code has diff
     */
    classActivePre?: string;
}
/**
 * Use `[!code ++]` and `[!code --]` to mark added and removed lines.
 */
declare function transformerNotationDiff(options?: TransformerNotationDiffOptions): ShikiTransformer;

interface TransformerNotationErrorLevelOptions {
    classMap?: Record<string, string | string[]>;
    /**
     * Class added to the <pre> element when the current code has diff
     */
    classActivePre?: string;
}
/**
 * Allow using `[!code error]` `[!code warning]` notation in code to mark highlighted lines.
 */
declare function transformerNotationErrorLevel(options?: TransformerNotationErrorLevelOptions): ShikiTransformer;

declare function parseMetaHighlightString(meta: string): number[] | null;
interface TransformerMetaHighlightOptions {
    /**
     * Class for highlighted lines
     *
     * @default 'highlighted'
     */
    className?: string;
}
/**
 * Allow using `{1,3-5}` in the code snippet meta to mark highlighted lines.
 */
declare function transformerMetaHighlight(options?: TransformerMetaHighlightOptions): ShikiTransformer;

declare function createCommentNotationTransformer(name: string, regex: RegExp, onMatch: (this: ShikiTransformerContext, match: string[], line: Element, commentNode: Element, lines: Element[], index: number) => boolean, removeEmptyLines?: boolean): ShikiTransformer;

export { type TransformerCompactLineOption, type TransformerMetaHighlightOptions, type TransformerMetaWordHighlightOptions, type TransformerNotationDiffOptions, type TransformerNotationErrorLevelOptions, type TransformerNotationFocusOptions, type TransformerNotationHighlightOptions, type TransformerNotationWordHighlightOptions, type TransformerRenderWhitespaceOptions, createCommentNotationTransformer, parseMetaHighlightString, parseMetaHighlightWords, transformerCompactLineOptions, transformerMetaHighlight, transformerMetaWordHighlight, transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight, transformerNotationWordHighlight, transformerRemoveLineBreak, transformerRenderWhitespace };
