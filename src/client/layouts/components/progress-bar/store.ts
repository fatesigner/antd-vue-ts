/**
 * store
 */

import { CreateVuexStore } from '../../../lib/vuex-helper';

let _cut;
let _timer;
const increase = function (num) {
  this.percent = this.percent + Math.floor(num);
  return this;
};
const hide = function () {
  clearInterval(_timer);
  _timer = null;
  setTimeout(() => {
    this.show = false;
    setTimeout(() => {
      this.percent = 0;
    }, 200);
  }, 500);
  return this;
};
const finish = function () {
  this.percent = 100;
  hide.call(this);
  return this;
};

export const ProgressBarStore = CreateVuexStore({
  name: 'progressBar',
  state: {
    percent: 0,
    show: false,
    canSuccess: true,
    duration: 3000,
    height: '2px',
    color: 'darkorange',
    failedColor: '#ff0000'
  },
  actions: {
    present(context, payload) {
      context.rootGetters.color = true;
      context.state.show = true;
      context.state.canSuccess = true;
      if (_timer) {
        clearInterval(_timer);
        context.state.percent = 0;
      }
      _cut = 10000 / Math.floor(context.state.duration);
      _timer = setInterval(() => {
        increase.call(context.state, _cut * Math.random());
        if (context.state.percent > 95) {
          finish.call(context.state);
        }
      }, 100);
    },
    dismiss(context) {
      clearInterval(_timer);
      _timer = null;
      setTimeout(() => {
        context.state.show = false;
        setTimeout(() => {
          context.state.percent = 0;
        }, 200);
      }, 500);
    },
    update(context, data) {
      context.commit('update', data);
    }
  },
  getters: {
    percent: (state) => state.percent,
    show: (state) => state.show,
    canSuccess: (state) => state.canSuccess,
    duration: (state) => state.duration,
    height: (state) => state.height,
    color: (state) => state.color,
    failedColor: (state) => state.failedColor,
    fs(s): boolean {
      return false;
    }
  },
  mutations: {
    update(state, playload) {
      state = Object.assign(state, playload);
    }
  }
});
