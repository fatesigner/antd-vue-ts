/**
 * main
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { Component } from 'vue-property-decorator';

import { CreateApp } from './app';
import { ProgressBarStore } from './app/layout/components/progress-bar';

Component.registerHooks(['asyncData']);

Vue.use(Vuex);

const { App, AppRouter, AppStore } = CreateApp();

Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { asyncData } = this.$options;
    if (asyncData) {
      asyncData({
        AppStore: this.$store,
        route: to
      })
        .then(next)
        .catch(next);
    } else {
      next();
    }
  }
});

if (window.__INITIAL_STATE__) {
  AppStore.replaceState(window.__INITIAL_STATE__);
}

AppRouter.onReady(() => {
  AppRouter.beforeResolve((to, from, next) => {
    const matched = AppRouter.getMatchedComponents(to);
    const prevMatched = AppRouter.getMatchedComponents(from);

    // 只需关心非预渲染的组件
    // 对比找出两个匹配列表的差异组件
    let diffed = false;
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c);
    });

    if (!activated.length) {
      return next();
    }
    AppStore.dispatch(ProgressBarStore.actionKeys.present);
    Promise.all(
      activated.map((Component) => {
        if (Component && (Component as any).extendOptions.asyncData) {
          return (Component as any).extendOptions.asyncData({
            store: AppStore,
            route: to
          });
        }
      })
    )
      .then(() => {
        AppStore.dispatch(ProgressBarStore.actionKeys.dismiss);
        next();
      })
      .catch(next);
  });

  App.$mount('#app');
});
