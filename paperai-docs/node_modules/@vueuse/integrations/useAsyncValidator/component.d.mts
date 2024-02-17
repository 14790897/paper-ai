import * as vue_demi from 'vue-demi';
import { PropType } from 'vue-demi';
import { Rules } from 'async-validator';

declare const UseAsyncValidator: vue_demi.DefineComponent<{
    form: {
        type: PropType<Record<string, any>>;
        required: true;
    };
    rules: {
        type: PropType<Rules>;
        required: true;
    };
}, () => vue_demi.VNode<vue_demi.RendererNode, vue_demi.RendererElement, {
    [key: string]: any;
}>[] | undefined, unknown, {}, {}, vue_demi.ComponentOptionsMixin, vue_demi.ComponentOptionsMixin, {}, string, vue_demi.PublicProps, Readonly<vue_demi.ExtractPropTypes<{
    form: {
        type: PropType<Record<string, any>>;
        required: true;
    };
    rules: {
        type: PropType<Rules>;
        required: true;
    };
}>>, {}, {}>;

export { UseAsyncValidator };
