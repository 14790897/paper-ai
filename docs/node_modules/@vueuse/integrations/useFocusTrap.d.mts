import { Fn, MaybeElementRef } from '@vueuse/core';
import { Ref } from 'vue-demi';
import { Options, ActivateOptions, DeactivateOptions } from 'focus-trap';

interface UseFocusTrapOptions extends Options {
    /**
     * Immediately activate the trap
     */
    immediate?: boolean;
}
interface UseFocusTrapReturn {
    /**
     * Indicates if the focus trap is currently active
     */
    hasFocus: Ref<boolean>;
    /**
     * Indicates if the focus trap is currently paused
     */
    isPaused: Ref<boolean>;
    /**
     * Activate the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trapactivateactivateoptions
     * @param opts Activate focus trap options
     */
    activate: (opts?: ActivateOptions) => void;
    /**
     * Deactivate the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trapdeactivatedeactivateoptions
     * @param opts Deactivate focus trap options
     */
    deactivate: (opts?: DeactivateOptions) => void;
    /**
     * Pause the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trappause
     */
    pause: Fn;
    /**
     * Unpauses the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trapunpause
     */
    unpause: Fn;
}
/**
 * Reactive focus-trap
 *
 * @see https://vueuse.org/useFocusTrap
 */
declare function useFocusTrap(target: MaybeElementRef, options?: UseFocusTrapOptions): UseFocusTrapReturn;

export { type UseFocusTrapOptions, type UseFocusTrapReturn, useFocusTrap };
