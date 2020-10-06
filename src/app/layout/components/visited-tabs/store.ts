/**
 * store
 */

import { Route } from 'vue-router';
import { CreateVuexStore } from '@fatesigner/vue-lib/vuex';
import { LocalStorage } from '@fatesigner/utils/local-storage';

const key = 'visited-tabs';

export type IVisitedView = Pick<Route, 'name' | 'meta' | 'path' | 'fullPath'>;

// 从 storage 中获取
const visitedViews: IVisitedView[] = LocalStorage.get(key) || [];

// 保存指定 route 至 localstorage
const saveVisitedViews = function (visitedViews: IVisitedView[]) {
  LocalStorage.set(
    key,
    visitedViews.map((x) => {
      const view: IVisitedView = {
        name: x.name,
        meta: x.meta,
        path: x.path,
        fullPath: x.fullPath
      };
      return view;
    })
  );
};

export const VisitedTabsStore = CreateVuexStore({
  name: 'visitedTabs',
  state: {
    activatedIndex: -1,
    visitedViews: visitedViews
  },
  actions: {
    addView(context, view: Route) {
      context.commit('ADD_VISITED_VIEW', view);
    },

    delView(context, view: Route) {
      context.commit('DEL_VISITED_VIEW', view);
    },

    delOthersViews(context, view: Route) {
      context.commit('DEL_OTHERS_VISITED_VIEWS', view);
    },

    delAllViews(context) {
      context.commit('DEL_ALL_VISITED_VIEWS');
    },

    updateVisitedView(context, view: Route) {
      context.commit('UPDATE_VISITED_VIEW', view);
    }
  },
  getters: {
    activatedIndex: (state) => state.activatedIndex,
    visitedViews: (state) => state.visitedViews
  },
  mutations: {
    ADD_VISITED_VIEW(state, view: Route) {
      let index = -1;
      if (view.name) {
        index = state.visitedViews.findIndex((v) => v.name === view.name);
      }

      if (index < 0) {
        index = state.visitedViews.findIndex((v) => v.path === view.path);
      }

      if (index > -1) {
        state.activatedIndex = index;
        return;
      }

      // 判断父路由是否存在
      const _i = state.visitedViews.findIndex((v) => {
        return v.name && view.matched && !!view.matched.some((x) => x.name === v.name);
      });

      if (_i > -1) {
        const _m = state.visitedViews[_i];
        _m.meta = view.meta;
        _m.path = view.path;
        _m.fullPath = view.fullPath;
        state.visitedViews.splice(_i, 1, _m);
        state.activatedIndex = _i;
        return;
      }

      // 添加其父路由信息
      const _view = view.matched.find((x) => !!x.name);
      state.visitedViews.push(
        Object.assign({}, view, {
          name: _view?.name
        })
      );

      state.activatedIndex = state.visitedViews.length - 1;

      saveVisitedViews(state.visitedViews);
    },

    DEL_VISITED_VIEW(state, view: Route) {
      for (const [i, v] of state.visitedViews.entries()) {
        if (v.name === view.name) {
          state.visitedViews.splice(i, 1);
          if (i < state.activatedIndex) {
            state.activatedIndex = state.activatedIndex - 1;
          }
          break;
        }
      }

      saveVisitedViews(state.visitedViews);
    },

    DEL_OTHERS_VISITED_VIEWS(state, view) {
      state.visitedViews = state.visitedViews.filter((v) => {
        return v.meta.affix || v.path === view.path;
      });
      state.activatedIndex = 0;

      saveVisitedViews(state.visitedViews);
    },

    DEL_ALL_VISITED_VIEWS(state) {
      state.visitedViews = [];
      state.activatedIndex = -1;

      saveVisitedViews(state.visitedViews);
    },

    UPDATE_VISITED_VIEW(state, view) {
      for (let v of state.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view);
          break;
        }
      }

      saveVisitedViews(state.visitedViews);
    }
  }
});
