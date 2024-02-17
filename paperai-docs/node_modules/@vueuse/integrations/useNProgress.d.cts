import * as vue_demi from 'vue-demi';
import nprogress, { NProgressOptions } from 'nprogress';
import { MaybeRefOrGetter } from '@vueuse/shared';

type UseNProgressOptions = Partial<NProgressOptions>;
/**
 * Reactive progress bar.
 *
 * @see https://vueuse.org/useNProgress
 */
declare function useNProgress(currentProgress?: MaybeRefOrGetter<number | null | undefined>, options?: UseNProgressOptions): {
    isLoading: vue_demi.WritableComputedRef<boolean>;
    progress: vue_demi.Ref<number | (() => number | null | undefined) | null | undefined>;
    start: () => nprogress.NProgress;
    done: (force?: boolean | undefined) => nprogress.NProgress;
    remove: () => void;
};
type UseNProgressReturn = ReturnType<typeof useNProgress>;

export { type UseNProgressOptions, type UseNProgressReturn, useNProgress };
