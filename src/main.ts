/**
 * main
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { Component } from 'vue-property-decorator';

import { CreateApp } from './app';
import { ProgressBarStore } from './app/layout/components/progress-bar';

// initial window env
window.__INITIAL_ENV__ = {};

Vue.use(Vuex);

Component.registerHooks(['asyncData']);

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

async function MountApp() {
  const { App, AppRouter, AppStore } = await CreateApp();

  if (window.__INITIAL_STATE__) {
    AppStore.replaceState(window.__INITIAL_STATE__);
  }

  AppRouter.onReady(() => {
    AppRouter.beforeEach((to: any, from: any, next: any) => {
      AppStore.dispatch(ProgressBarStore.actionKeys.present);
      return next();
    });
    AppRouter.beforeResolve((to: any, from: any, next: any) => {
      const matched = AppRouter.getMatchedComponents(to);
      const prevMatched = AppRouter.getMatchedComponents(from);

      // 只需关心非预渲染的组件
      // 对比找出两个匹配列表的差异组件
      let diffed = false;
      const activated = matched.filter((c: any, i: number) => {
        return diffed || (diffed = prevMatched[i] !== c);
      });

      if (!activated.length) {
        AppStore.dispatch(ProgressBarStore.actionKeys.dismiss);
        return next();
      }
      Promise.all(
        activated.map((Component: any) => {
          if (Component && (Component as any).extendOptions.asyncData) {
            return (Component as any).extendOptions.asyncData({
              store: AppStore,
              route: to
            });
          }
        })
      )
        .then(() => {
          next();
        })
        .catch(next)
        .finally(() => {
          AppStore.dispatch(ProgressBarStore.actionKeys.dismiss);
        });
    });

    // 清空 body 内的 element 元素
    document.body.childNodes.forEach((node: any) => {
      if (node.nodeType == 1 && node.tagName !== 'LINK' && node.tagName !== 'SCRIPT') {
        node.remove();
      }
    });

    // 动态添加用于挂载实例的元素
    const div = document.createElement('div');
    div.id = 'app';
    document.body.prepend(div);
    App.$mount('#app');
  });
}

MountApp();
