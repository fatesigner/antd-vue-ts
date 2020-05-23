/**
 * app
 */

import Vue from 'vue';

import AppPage from './App.vue';
import { CreateRouter } from './router';
import { CreateStore } from './store';
import { i18n } from './locale';

export function CreateApp(context?: any) {
  const AppRouter = CreateRouter();
  const AppStore = CreateStore();

  const App = new Vue({
    i18n,
    components: { AppPage },
    router: AppRouter,
    store: AppStore,
    render: (h) => h(AppPage)
  });

  return { App, AppRouter, AppStore };
}

interface Interface {}
