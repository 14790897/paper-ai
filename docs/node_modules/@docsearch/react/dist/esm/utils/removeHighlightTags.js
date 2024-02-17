var regexHighlightTags = /(<mark>|<\/mark>)/g;
var regexHasHighlightTags = RegExp(regexHighlightTags.source);
export function removeHighlightTags(hit) {
  var _internalDocSearchHit, _hit$_highlightResult;

  var internalDocSearchHit = hit;

  if (!internalDocSearchHit.__docsearch_parent && !hit._highlightResult) {
    return hit.hierarchy.lvl0;
  }

  var _ref = (internalDocSearchHit.__docsearch_parent ? (_internalDocSearchHit = internalDocSearchHit.__docsearch_parent) === null || _internalDocSearchHit === void 0 || (_internalDocSearchHit = _internalDocSearchHit._highlightResult) === null || _internalDocSearchHit === void 0 || (_internalDocSearchHit = _internalDocSearchHit.hierarchy) === null || _internalDocSearchHit === void 0 ? void 0 : _internalDocSearchHit.lvl0 : (_hit$_highlightResult = hit._highlightResult) === null || _hit$_highlightResult === void 0 || (_hit$_highlightResult = _hit$_highlightResult.hierarchy) === null || _hit$_highlightResult === void 0 ? void 0 : _hit$_highlightResult.lvl0) || {},
      value = _ref.value;

  return value && regexHasHighlightTags.test(value) ? value.replace(regexHighlightTags, '') : value;
}