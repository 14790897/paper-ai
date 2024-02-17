import * as vue_demi from 'vue-demi';
import { PropType } from 'vue-demi';
import { ConfigurableDocument } from '@vueuse/core';
import { Options } from 'sortablejs';

type UseSortableOptions = Options & ConfigurableDocument;

declare const UseSortable: vue_demi.DefineComponent<{
    modelValue: {
        type: PropType<any[]>;
        required: true;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    options: {
        type: PropType<UseSortableOptions>;
        required: true;
    };
}, () => vue_demi.VNode<vue_demi.RendererNode, vue_demi.RendererElement, {
    [key: string]: any;
}> | undefined, unknown, {}, {}, vue_demi.ComponentOptionsMixin, vue_demi.ComponentOptionsMixin, {}, string, vue_demi.PublicProps, Readonly<vue_demi.ExtractPropTypes<{
    modelValue: {
        type: PropType<any[]>;
        required: true;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    options: {
        type: PropType<UseSortableOptions>;
        required: true;
    };
}>>, {
    tag: string;
}, {}>;

export { UseSortable };
