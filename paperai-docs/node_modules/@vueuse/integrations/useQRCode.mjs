import { toRef, isClient } from '@vueuse/shared';
import { ref, watch } from 'vue-demi';
import QRCode from 'qrcode';

function useQRCode(text, options) {
  const src = toRef(text);
  const result = ref("");
  watch(
    src,
    async (value) => {
      if (src.value && isClient)
        result.value = await QRCode.toDataURL(value, options);
    },
    { immediate: true }
  );
  return result;
}

export { useQRCode };
