import * as vue_demi from 'vue-demi';
import { RenderableComponent } from '@vueuse/core';
import { Options } from 'focus-trap';

interface UseFocusTrapOptions extends Options {
    /**
     * Immediately activate the trap
     */
    immediate?: boolean;
}

interface ComponentUseFocusTrapOptions extends RenderableComponent {
    options?: UseFocusTrapOptions;
}
declare const UseFocusTrap: vue_demi.DefineComponent<ComponentUseFocusTrapOptions, {}, {}, {}, {}, vue_demi.ComponentOptionsMixin, vue_demi.ComponentOptionsMixin, {}, string, vue_demi.PublicProps, Readonly<ComponentUseFocusTrapOptions>, {}, {}>;

export { type ComponentUseFocusTrapOptions, UseFocusTrap };
