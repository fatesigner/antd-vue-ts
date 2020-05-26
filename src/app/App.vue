<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import './shared/icons/components';

import '../styles/reset.scss';
import '../styles/vui.import.scss';
import '../styles/element-ui.override.scss';
import '../styles/common.scss';

import './providers/element-ui';
import './providers/vue-svgicon';
import './providers/vee-validate';

import { CurrencyPipe, CurrencyPipeKey } from './pipes/currency.pipe';
import { DateFormatPipe, DateFormatPipeKey } from './pipes/date-format.pipe';

Vue.filter(CurrencyPipeKey, CurrencyPipe);
Vue.filter(DateFormatPipeKey, DateFormatPipe);

@Component({
  name: 'AppPage'
})
export default class extends Vue {}
</script>

<style lang="scss">
[v-cloak] {
  display: none !important;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
    Helvetica Neue, sans-serif;
  font-size: 15px;
  background-color: #edecec;
}

img {
  max-width: 100%;
  max-height: 100%;
}

.view {
  position: relative;
  min-height: 100vh;
  background-color: #fff;
}

.view-padding {
  padding: 10px;
}
</style>
