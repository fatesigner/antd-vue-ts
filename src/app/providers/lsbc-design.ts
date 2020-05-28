/**
 * lsbc-design
 */

import Vue from 'vue';
import LSBCUI from 'lsbc-design';
import { UploadService } from 'lsbc-design/dist/service';

import { SessionService } from '../services/session.service';

Vue.use(LSBCUI);
Vue.prototype.$uploadService = new UploadService(() => {
  return SessionService.user.accessToken;
}, '/salesSystem');
