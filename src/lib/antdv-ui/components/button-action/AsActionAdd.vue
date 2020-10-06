<template>
  <as-action ref="actionRef" :icon="icon" :size="size" :type="type" :handler="handler">
    <slot>新增</slot>
  </as-action>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Button } from 'ant-design-vue';

import AsAction from './AsAction.vue';

Vue.use(Button);

@Component({
  name: 'AsActionAdd',
  components: {
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: 'plus' }) icon: string;
  @Prop({ default: 'default' }) size: string;
  @Prop({ default: 'primary' }) type: string;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;

  trigger() {
    (this.$refs?.actionRef as any)?.trigger();
  }
}
</script>
