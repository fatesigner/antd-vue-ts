<template>
  <a-config-provider :locale="locale">
    <slot />
  </a-config-provider>
</template>

<script lang="ts">
import moment from 'moment';
import { ConfigProvider } from 'ant-design-vue';
import { Component, Vue } from 'vue-property-decorator';

import { i18n } from '../../i18n';

Vue.use(ConfigProvider);

@Component({
  name: 'AntLocaleProvider'
})
export default class extends Vue {
  locale = null;

  created() {
    // 初始化 i18n 默认语言
    this.setLang(i18n._.locale);
  }

  mounted() {
    // i18n set 事件
    i18n.hooks.afterSet.tapAsync(async (lang) => {
      this.setLang(lang);
    });
  }

  async setLang(lang) {
    import(`ant-design-vue/lib/locale-provider/${lang.replace('-', '_')}`).then((res) => {
      this.locale = res.default;
    });

    // 导入 moment language，非中文环境统一使用英文
    if (lang === 'zh-CN') {
      import('moment/locale/zh-cn').then(() => {
        moment.locale(lang.toLocaleLowerCase());
      });
    } else {
      import('moment/locale/fr').then(() => {
        moment.locale(lang.toLocaleLowerCase());
      });
    }
  }
}
</script>
