/**
 * validate
 */

import Vue from 'vue';
import { configure, extend, localize, ValidationObserver, ValidationProvider } from 'vee-validate';
// @ts-ignore
import zh_CN from 'vee-validate/dist/locale/zh_CN.json';
import * as rules from 'vee-validate/dist/rules';
import './vee-validate.scss';

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});

localize('zh_CN', zh_CN);

Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

configure({
  classes: {
    valid: 'valid',
    invalid: 'invalid'
  }
});
