/**
 * store
 */

import Vuex from 'vuex';

import { CreateVuexStore } from '../lib/vuex-helper';

import { DeviceType } from './interfaces/device';
import { ProgressBarStore } from './layout/components/progress-bar';
import { SidebarStore } from './layout/components/sidebar/store';
import { VisitedTagsStore } from './layout/components/visited-tags/store';

export const AppStore = CreateVuexStore({
  modules: {
    [ProgressBarStore.name]: ProgressBarStore.store,
    [SidebarStore.name]: SidebarStore.store,
    [VisitedTagsStore.name]: VisitedTagsStore.store
  },
  state: {
    device: DeviceType.desktop,
    language: '',
    size: 'medium',
    error: {
      code: null
    }
  },
  actions: {
    toggleDevice(context, device) {
      context.state.device = device;
    },
    setLanguage(context, language) {
      context.state.language = language;
    },
    setErrorCode(context, errorCode: 400 | 401 | 404) {
      context.state.error.code = errorCode;
    }
  },
  getters: {
    device: (state) => state.device,
    errorCode: (state) => state.error.code
  }
});

export function CreateStore() {
  return new Vuex.Store(AppStore.store);
}
