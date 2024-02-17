'use strict';

var core = require('@vueuse/core');
var vueDemi = require('vue-demi');
var focusTrap = require('focus-trap');

function useFocusTrap(target, options = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = options;
  const hasFocus = vueDemi.ref(false);
  const isPaused = vueDemi.ref(false);
  const activate = (opts) => trap && trap.activate(opts);
  const deactivate = (opts) => trap && trap.deactivate(opts);
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.value = true;
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.value = false;
    }
  };
  vueDemi.watch(
    () => core.unrefElement(target),
    (el) => {
      if (!el)
        return;
      trap = focusTrap.createFocusTrap(el, {
        ...focusTrapOptions,
        onActivate() {
          hasFocus.value = true;
          if (options.onActivate)
            options.onActivate();
        },
        onDeactivate() {
          hasFocus.value = false;
          if (options.onDeactivate)
            options.onDeactivate();
        }
      });
      if (immediate)
        activate();
    },
    { flush: "post" }
  );
  core.tryOnScopeDispose(() => deactivate());
  return {
    hasFocus,
    isPaused,
    activate,
    deactivate,
    pause,
    unpause
  };
}

exports.useFocusTrap = useFocusTrap;
