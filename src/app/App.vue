<template>
  <AntLocaleProvider><router-view /></AntLocaleProvider>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import './providers/local-storage';
import './providers/antdv';
import './providers/vee-validate';
import './providers/vue-awesome';
import './providers/file-chooser';
import './providers/img-viewer';
import './providers/quick-layout';

import './styles/reset.scss';

import { CurrencyPipe, CurrencyPipeKey } from './pipes/currency.pipe';
import { DateFormatPipe, DateFormatPipeKey } from './pipes/date-format.pipe';
import AntLocaleProvider from './providers/antdv/AntLocaleProvider.vue';
import { TimeAgoPipe, TimeAgoPipeKey } from './pipes/time-ago.pipe';

// 全局注册 pipes
Vue.filter(CurrencyPipeKey, CurrencyPipe);
Vue.filter(DateFormatPipeKey, DateFormatPipe);
Vue.filter(TimeAgoPipeKey, TimeAgoPipe);

// 监控全局异常并弹出通知栏
window.addEventListener('unhandledrejection', function (event) {
  Vue.prototype.$notification.error({
    duration: 2,
    message: event.reason.message,
    description: event.reason.stack
  });
});

@Component({
  name: 'AppPage',
  components: { AntLocaleProvider }
})
export default class extends Vue {}
</script>

<style lang="scss">
[v-cloak] {
  display: none !important;
}

#app {
  height: 100%;
}

.view {
  position: relative;
  min-height: 100vh;
  background-color: #fff;
}

.view-padding {
  padding: 10px;
}

.toolbar {
  padding: 10px;
  background-color: #fff;
}

.content {
  padding: 20px;
  background-color: #fff;
}
</style>
