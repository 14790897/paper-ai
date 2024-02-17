import { camelCase, capitalCase, constantCase, dotCase, headerCase, noCase, paramCase, pascalCase, pathCase, sentenceCase, snakeCase, Options } from 'change-case';
import { MaybeRef, MaybeRefOrGetter } from '@vueuse/shared';
import { WritableComputedRef, ComputedRef } from 'vue-demi';

declare const changeCase_camelCase: typeof camelCase;
declare const changeCase_capitalCase: typeof capitalCase;
declare const changeCase_constantCase: typeof constantCase;
declare const changeCase_dotCase: typeof dotCase;
declare const changeCase_headerCase: typeof headerCase;
declare const changeCase_noCase: typeof noCase;
declare const changeCase_paramCase: typeof paramCase;
declare const changeCase_pascalCase: typeof pascalCase;
declare const changeCase_pathCase: typeof pathCase;
declare const changeCase_sentenceCase: typeof sentenceCase;
declare const changeCase_snakeCase: typeof snakeCase;
declare namespace changeCase {
  export { changeCase_camelCase as camelCase, changeCase_capitalCase as capitalCase, changeCase_constantCase as constantCase, changeCase_dotCase as dotCase, changeCase_headerCase as headerCase, changeCase_noCase as noCase, changeCase_paramCase as paramCase, changeCase_pascalCase as pascalCase, changeCase_pathCase as pathCase, changeCase_sentenceCase as sentenceCase, changeCase_snakeCase as snakeCase };
}

type ChangeCaseType = keyof typeof changeCase;
declare function useChangeCase(input: MaybeRef<string>, type: ChangeCaseType, options?: Options | undefined): WritableComputedRef<string>;
declare function useChangeCase(input: MaybeRefOrGetter<string>, type: ChangeCaseType, options?: Options | undefined): ComputedRef<string>;

export { type ChangeCaseType, useChangeCase };
