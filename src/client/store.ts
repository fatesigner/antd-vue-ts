/**
 * store
 */

import Vuex from 'vuex';

import { CreateVuexStore } from './lib/vuex-helper';
import { ProgressBarStore } from './layouts/components/progress-bar';
import { SidebarStore } from './layouts/components/sidebar/store';
import { VisitedTagsStore } from './layouts/components/visited-tags/store';
import { DeviceType } from '../models/device';

export const AppStore = CreateVuexStore({
  modules: {
    [ProgressBarStore.name]: ProgressBarStore.store,
    [SidebarStore.name]: SidebarStore.store,
    [VisitedTagsStore.name]: VisitedTagsStore.store
  },
  state: {
    device: DeviceType.desktop,
    language: '',
    size: 'medium'
  },
  actions: {
    toggleDevice(context, device) {
      context.state.device = device;
    },
    setLanguage(context, language) {
      context.state.language = language;
    }
  },
  getters: {
    device: (state) => state.device
  }
});

export function CreateStore() {
  return new Vuex.Store(AppStore.store);
}
