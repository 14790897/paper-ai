'use strict';

var shared = require('@vueuse/shared');
var vueDemi = require('vue-demi');
var changeCase$1 = require('change-case');

var changeCase = /*#__PURE__*/Object.freeze({
  __proto__: null,
  camelCase: changeCase$1.camelCase,
  capitalCase: changeCase$1.capitalCase,
  constantCase: changeCase$1.constantCase,
  dotCase: changeCase$1.dotCase,
  headerCase: changeCase$1.headerCase,
  noCase: changeCase$1.noCase,
  paramCase: changeCase$1.paramCase,
  pascalCase: changeCase$1.pascalCase,
  pathCase: changeCase$1.pathCase,
  sentenceCase: changeCase$1.sentenceCase,
  snakeCase: changeCase$1.snakeCase
});

function useChangeCase(input, type, options) {
  if (typeof input === "function")
    return vueDemi.computed(() => changeCase[type](shared.toValue(input), options));
  const text = vueDemi.ref(input);
  return vueDemi.computed({
    get() {
      return changeCase[type](text.value, options);
    },
    set(value) {
      text.value = value;
    }
  });
}

exports.useChangeCase = useChangeCase;
