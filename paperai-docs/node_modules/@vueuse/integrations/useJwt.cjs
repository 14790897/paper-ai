'use strict';

var vueDemi = require('vue-demi');
var shared = require('@vueuse/shared');
var jwt_decode = require('jwt-decode');

function useJwt(encodedJwt, options = {}) {
  const {
    onError,
    fallbackValue = null
  } = options;
  const decodeWithFallback = (encodedJwt2, options2) => {
    try {
      return jwt_decode(encodedJwt2, options2);
    } catch (err) {
      onError == null ? void 0 : onError(err);
      return fallbackValue;
    }
  };
  const header = vueDemi.computed(() => decodeWithFallback(shared.toValue(encodedJwt), { header: true }));
  const payload = vueDemi.computed(() => decodeWithFallback(shared.toValue(encodedJwt)));
  return {
    header,
    payload
  };
}

exports.useJwt = useJwt;
