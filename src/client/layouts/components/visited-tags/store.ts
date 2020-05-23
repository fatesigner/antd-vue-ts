/**
 * store
 */

import { Route } from 'vue-router';

import { CreateVuexStore } from '../../../lib/vuex-helper';

export interface IVisitedView extends Partial<Route> {
  title?: string;
}

export interface IVisitedTagsState {
  visitedViews: IVisitedView[];
  cachedViews: (string | undefined)[];
}

export const VisitedTagsStore = CreateVuexStore({
  name: 'visitedTags',
  state: {
    visitedViews: [],
    cachedViews: []
  },
  actions: {
    addView(context, view: IVisitedView) {
      context.commit('ADD_VISITED_VIEW', view);
      context.commit('ADD_CACHED_VIEW', view);
    },
    addVisitedView(context, view: IVisitedView) {
      context.commit('ADD_VISITED_VIEW', view);
    },

    delView(context, view: IVisitedView) {
      context.commit('DEL_VISITED_VIEW', view);
      context.commit('DEL_CACHED_VIEW', view);
    },

    delCachedView(context, view: IVisitedView) {
      context.commit('DEL_CACHED_VIEW', view);
    },

    delOthersViews(context, view: IVisitedView) {
      context.commit('DEL_OTHERS_VISITED_VIEWS', view);
      context.commit('DEL_OTHERS_CACHED_VIEWS', view);
    },

    delAllViews(context) {
      context.commit('DEL_ALL_VISITED_VIEWS');
      context.commit('DEL_ALL_CACHED_VIEWS');
    },

    delAllCachedViews(context) {
      context.commit('DEL_ALL_CACHED_VIEWS');
    },

    updateVisitedView(context, view: IVisitedView) {
      context.commit('UPDATE_VISITED_VIEW', view);
    }
  },
  getters: {
    cachedViews: (state) => state.cachedViews,
    visitedViews: (state) => state.visitedViews
  },
  mutations: {
    ADD_VISITED_VIEW(state, view: IVisitedView) {
      if (state.visitedViews.some((v) => v.path === view.path)) {
        return;
      }
      state.visitedViews.push(
        Object.assign({}, view, {
          title: view.meta.title || 'no-name'
        })
      );
    },
    ADD_CACHED_VIEW(state, view: IVisitedView) {
      if (view.name === null) {
        return;
      }
      if (state.cachedViews.includes(view.name)) {
        return;
      }
      if (!view.meta.noCache) {
        state.cachedViews.push(view.name);
      }
    },
    DEL_VISITED_VIEW(state, view: IVisitedView) {
      for (const [i, v] of state.visitedViews.entries()) {
        if (v.path === view.path) {
          state.visitedViews.splice(i, 1);
          break;
        }
      }
    },
    DEL_CACHED_VIEW(state, view) {
      if (view.name === null) return;
      const index = state.cachedViews.indexOf(view.name);
      index > -1 && state.cachedViews.splice(index, 1);
    },

    DEL_OTHERS_VISITED_VIEWS(state, view) {
      state.visitedViews = state.visitedViews.filter((v) => {
        return v.meta.affix || v.path === view.path;
      });
    },
    DEL_OTHERS_CACHED_VIEWS(state, view) {
      if (view.name === null) return;
      const index = state.cachedViews.indexOf(view.name);
      if (index > -1) {
        state.cachedViews = state.cachedViews.slice(index, index + 1);
      } else {
        // if index = -1, there is no cached tags
        state.cachedViews = [];
      }
    },
    DEL_ALL_VISITED_VIEWS(state) {
      // keep affix tags
      state.visitedViews = state.visitedViews.filter((tag) => tag.meta.affix);
    },
    DEL_ALL_CACHED_VIEWS(state) {
      state.cachedViews = [];
    },
    UPDATE_VISITED_VIEW(state, view) {
      for (let v of state.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view);
          break;
        }
      }
    }
  }
});
