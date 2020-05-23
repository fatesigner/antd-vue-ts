/**
 * store
 */

import { CreateVuexStore } from '../../../lib/vuex-helper';

export const SidebarStore = CreateVuexStore({
  name: 'sidebar',
  state: {
    visible: false,
    animation: false
  },
  actions: {
    open(context, animation = true) {
      context.commit('update', {
        visible: true,
        animation: animation
      });
    },
    close(context, animation = true) {
      context.commit('update', {
        visible: false,
        animation: animation
      });
    },
    toggle(context, animation = true) {
      context.commit('update', {
        visible: !context.state.visible,
        animation: animation
      });
    }
  },
  getters: {
    visible: (state) => state.visible,
    animation: (state) => state.animation
  },
  mutations: {
    update(state, playload) {
      state = Object.assign(state, playload);
    }
  }
});
