/**
 * validate
 */

import Vue from 'vue';
import { configure, extend, localize, setInteractionMode, ValidationObserver, ValidationProvider } from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';

import { i18n } from '../../i18n';

import './rules/decimal';
import './vee-validate.scss';

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});

/* extend('required', {
  ...rules.required,
  message: '{_field_}必填'
}); */

extend('confirmed', {
  params: ['target'],
  validate(value, { target }: any) {
    return value === target;
  },
  message(field) {
    return `${field}前后不一致`;
  }
});

// 注册 i18n 勾子，每当有语言包加载之后，将会执行
i18n.hooks.afterSet.tapAsync(async (lang, locale) => {
  if (lang.indexOf('en') > -1) {
    lang = 'en';
  }
  import(`./locale/${lang.replace('-', '_')}.json`).then((res) => {
    localize(res.default.code, res.default);
  });
});

Vue.component('validation-observer', ValidationObserver);
Vue.component('validation-provider', ValidationProvider);

setInteractionMode('custom', ({ errors }) => {
  if (errors.length) {
    return {
      on: ['input'],
      debounce: 350
    };
  }

  // validate immediately after leaving the field.
  return {
    on: ['change'],
    debounce: 0
  };
});

configure({
  classes: {
    valid: 'valid',
    invalid: 'invalid'
  },
  bails: true,
  skipOptional: true,
  // Aggressive: Triggered when the user presses a key (on input).
  // Passive: Triggered when the form is submitted.
  // Lazy: Triggered when the user leaves the input (on blur or change).
  // Eager: Is a combination of aggressive and lazy, as it first validates
  // when the user leaves the input (on blur or change) then
  // if the input is invalid it will behave aggressively
  // until the input is valid again and it will go back to being lazy.
  mode: 'custom',
  useConstraintAttrs: true
});
