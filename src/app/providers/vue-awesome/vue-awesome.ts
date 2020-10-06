/**
 * fort-awesome
 */

import Vue from 'vue';
import VueIcon from 'vue-awesome/components/Icon.vue';

// 仅引入用到的图标以减小打包体积
import 'vue-awesome/icons/plus-circle';

import './vue-awesome.scss';

Vue.component('v-icon', VueIcon);
