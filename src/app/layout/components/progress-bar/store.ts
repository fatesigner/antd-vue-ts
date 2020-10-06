/**
 * store
 */

import { CreateVuexStore } from '@fatesigner/vue-lib/vuex';

const _dampingCoefficient = 0.9066;
const _duration = 1000;
const _intervalTime = 100;
let _speed: number;
let _interval: any;
let _timeout: any;

export const ProgressBarStore = CreateVuexStore({
  name: 'progressBar',
  state: {
    percent: 0,
    show: false,
    height: '4px',
    color: 'darkorange'
  },
  actions: {
    present(context) {
      if (_timeout) {
        clearTimeout(_timeout);
        _timeout = null;
      }
      _timeout = setTimeout(() => {
        context.state.show = true;
        if (_interval) {
          clearInterval(_interval);
          context.state.percent = 0;
        }
        _speed = 100 / (_duration / _intervalTime);
        _interval = setInterval(() => {
          _speed = parseFloat((_speed * _dampingCoefficient).toFixed(6));
          context.state.percent = context.state.percent + _speed;
          if (context.state.percent >= 100) {
            return context.dispatch('dismiss');
          }
        }, _intervalTime);
      }, 100);
    },
    dismiss(context) {
      if (context.state.show) {
        if (_interval) {
          clearInterval(_interval);
          _interval = null;
        }
        // 立即设置进度到完成
        context.state.percent = 100;
        setTimeout(() => {
          context.state.show = false;
          setTimeout(() => {
            context.state.percent = 0;
          }, 200);
        }, 200);
      } else {
        if (_timeout) {
          clearTimeout(_timeout);
          _timeout = null;
        }
      }
    },
    update(context, data) {
      context.commit('update', data);
    }
  },
  getters: {
    percent: (state) => state.percent,
    show: (state) => state.show,
    height: (state) => state.height,
    color: (state) => state.color
  },
  mutations: {
    update(state, payload) {
      state = Object.assign(state, payload);
    }
  }
});
