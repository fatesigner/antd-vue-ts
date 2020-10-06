/**
 * app
 */

import Vue from 'vue';

import AppPage from './App.vue';
import { CreateRouter } from './routes';
import { CreateStore } from './store';
import { i18n } from './i18n';

export async function CreateApp() {
  const AppStore = CreateStore();
  const AppRouter = await CreateRouter(AppStore);

  const App = new Vue({
    i18n: i18n._,
    components: { AppPage },
    router: AppRouter,
    store: AppStore,
    render: (h) => h(AppPage)
  });

  return { App, AppRouter, AppStore };
}
