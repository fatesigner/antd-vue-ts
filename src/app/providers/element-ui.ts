/**
 * element-ui
 */

import Vue from 'vue';
import ElementUI, { Notification } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import { AppStore } from '../store';
import { i18n } from '../i18n';

import { EleLoading } from '../../lib/element-ui-helper/components/loading';
import { ElePagination } from '../../lib/element-ui-helper/components/pagination';
import { EleTable } from '../../lib/element-ui-helper/components/table';
import { EleDialog } from '../../lib/element-ui-helper/components/dialog';
import { EleLazyDialog } from '../../lib/element-ui-helper/components/lazy';
import { EleUploader } from '../../lib/element-ui-helper/components/uploader';

// 注册 Notification
Vue.prototype.$notify = Notification;

Vue.use(ElementUI, {
  size: AppStore.store.state.size,
  i18n: (key: string, value: string) => i18n.t(key, value)
});

Vue.component('EleLoading', EleLoading);
Vue.component('ElePagination', ElePagination);
Vue.component('EleTable', EleTable);
Vue.component('EleDialog', EleDialog);
Vue.component('EleLazyDialog', EleLazyDialog);
Vue.component('EleUploader', EleUploader);
