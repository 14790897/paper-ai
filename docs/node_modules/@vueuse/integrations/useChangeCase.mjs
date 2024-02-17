import { toValue } from '@vueuse/shared';
import { computed, ref } from 'vue-demi';
import { camelCase, capitalCase, constantCase, dotCase, headerCase, noCase, paramCase, pascalCase, pathCase, sentenceCase, snakeCase } from 'change-case';

var changeCase = /*#__PURE__*/Object.freeze({
  __proto__: null,
  camelCase: camelCase,
  capitalCase: capitalCase,
  constantCase: constantCase,
  dotCase: dotCase,
  headerCase: headerCase,
  noCase: noCase,
  paramCase: paramCase,
  pascalCase: pascalCase,
  pathCase: pathCase,
  sentenceCase: sentenceCase,
  snakeCase: snakeCase
});

function useChangeCase(input, type, options) {
  if (typeof input === "function")
    return computed(() => changeCase[type](toValue(input), options));
  const text = ref(input);
  return computed({
    get() {
      return changeCase[type](text.value, options);
    },
    set(value) {
      text.value = value;
    }
  });
}

export { useChangeCase };
