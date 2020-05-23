/**
 * element-ui
 */

import Vue from 'vue';
import ElementUI, { Notification } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import { AppStore } from '../store';
import { i18n } from '../locale';

// 注册 Notification
Vue.prototype.$notify = Notification;

Vue.use(ElementUI, {
  size: AppStore.store.state.size,
  i18n: (key: string, value: string) => i18n.t(key, value)
});
