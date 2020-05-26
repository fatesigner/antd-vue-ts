/**
 * app
 */

import Vue from 'vue';

import AppPage from './App.vue';
import { CreateRouter } from './routes';
import { CreateStore } from './store';
import { i18n } from './i18n';

export function CreateApp() {
  const AppStore = CreateStore();
  const AppRouter = CreateRouter(AppStore);

  const App = new Vue({
    i18n,
    components: { AppPage },
    router: AppRouter,
    store: AppStore,
    render: (h) => h(AppPage)
  });

  return { App, AppRouter, AppStore };
}
