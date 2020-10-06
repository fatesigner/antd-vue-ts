/**
 * store
 */

import Vuex from 'vuex';
import { CreateVuexStore } from '@fatesigner/vue-lib/vuex';
import { LocalStorage } from '@fatesigner/utils/local-storage';

import { DeviceType } from './interfaces/device';
import { ProgressBarStore } from './layout/components/progress-bar';
import { VisitedTabsStore } from './layout/components/visited-tabs/store';
import { SystemSettingStore } from './layout/components/setting/store';

export type IAppState = {
  device: DeviceType;
  navigationCollapsed: boolean;
  status: {
    code: number;
    message: string;
  };
};

const localStorageKey = 'app';

// 获取已缓存信息
const appStateCache: IAppState = LocalStorage.get(localStorageKey);

const appState: IAppState = {
  device: DeviceType.desktop,
  navigationCollapsed: appStateCache?.navigationCollapsed ?? false,
  status: {
    code: 200,
    message: ''
  }
};

export const AppStore = CreateVuexStore({
  modules: {
    [ProgressBarStore.name]: ProgressBarStore.store,
    [VisitedTabsStore.name]: VisitedTabsStore.store,
    [SystemSettingStore.name]: SystemSettingStore.store
  },
  state: appState,
  actions: {
    toggleDevice(context, device) {
      context.state.device = device;
    },
    setStatus(context, error) {
      context.state.status = Object.assign(context.state.status, error);
    },
    toggleNavigationCollapsed(context, navigationCollapsed) {
      context.state.navigationCollapsed = navigationCollapsed;
      // 缓存到 local storage
      LocalStorage.set(localStorageKey, {
        navigationCollapsed: context.state.navigationCollapsed
      });
    }
  },
  getters: {
    device: (state) => state.device,
    status: (state) => state.status,
    navigationCollapsed: (state) => state.navigationCollapsed
  }
});

export function CreateStore() {
  return new Vuex.Store(AppStore.store);
}
