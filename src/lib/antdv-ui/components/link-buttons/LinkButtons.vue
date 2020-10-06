<template>
  <div class="link-buttons">
    <a-radio-group v-model="currentPath" button-style="solid">
      <a-radio-button v-for="link in links" :key="link.path" :value="link.path"
        >{{ link.label }}
        <router-link class="link-a" tag="a" :to="{ path: link.path }" />
      </a-radio-button>
    </a-radio-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Button, Radio } from 'ant-design-vue';

import { ILinkButton } from './interfaces';

Vue.use(Button);
Vue.use(Radio);

@Component({
  name: 'LinkButtons'
})
export default class extends Vue {
  @Prop({ default: (): ILinkButton[] => [] }) links: ILinkButton[];
  @Prop({ default: null }) value: string;

  value_: string;

  currentPath = '';

  linkActiveClass = '';
  linkExactActiveClass = '';

  @Watch('value', {
    immediate: true
  })
  onDataChange(val: string) {
    if (val) {
      this.value_ = val;
    }
  }

  @Watch('$route')
  onRouteChange(val: any) {
    this.currentPath = val.path;
  }

  created() {
    this.linkActiveClass = (this.$router as any).options.linkActiveClass;
    this.linkExactActiveClass = (this.$router as any).options.linkExactActiveClass;
  }

  mounted() {
    this.currentPath = this.$route.path;
  }
}
</script>

<style lang="scss" scoped>
.link-buttons {
  .el-radio-button {
    a,
    a:hover,
    a:focus,
    a:focus-within,
    a:active,
    a:visited {
      color: inherit;
    }
  }

  .el-radio-button__inner {
    position: relative;
  }

  .link-a {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
