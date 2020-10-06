<template>
  <as-action ref="actionRef" class="outline primary" icon="edit" :size="size" type="default" :handler="handler">
    <slot>确认</slot>
  </as-action>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Button } from 'ant-design-vue';

import AsAction from './AsAction.vue';

Vue.use(Button);

@Component({
  name: 'AsActionConfirm',
  components: {
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: 'small' }) size: string;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;

  trigger() {
    (this.$refs?.actionRef as any)?.trigger();
  }
}
</script>
