import html from './html.mjs';
import './javascript.mjs';
import './css.mjs';

const lang = Object.freeze({ "displayName": "HTML (Derivative)", "injections": { "R:text.html - (comment.block, text.html meta.embedded, meta.tag.*.*.html, meta.tag.*.*.*.html, meta.tag.*.*.*.*.html)": { "comment": "Uses R: to ensure this matches after any other injections.", "patterns": [{ "match": "<", "name": "invalid.illegal.bad-angle-bracket.html" }] } }, "name": "html-derivative", "patterns": [{ "include": "text.html.basic#core-minus-invalid" }, { "begin": "(</?)(\\w[^\\s>]*)(?<!/)", "beginCaptures": { "1": { "name": "punctuation.definition.tag.begin.html" }, "2": { "name": "entity.name.tag.html" } }, "end": "((?: ?/)?>)", "endCaptures": { "1": { "name": "punctuation.definition.tag.end.html" } }, "name": "meta.tag.other.unrecognized.html.derivative", "patterns": [{ "include": "text.html.basic#attribute" }] }], "scopeName": "text.html.derivative", "embeddedLangs": ["html"] });
var html_derivative = [
  ...html,
  lang
];

export { html_derivative as default };
