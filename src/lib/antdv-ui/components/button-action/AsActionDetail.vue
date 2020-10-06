<template>
  <as-action
    ref="actionRef"
    class="as-action-edit outline primary"
    :size="size"
    :type="type"
    :handler="handler"
    title="查看"
  >
    <slot><v-icon name="info-circle" />详情</slot>
  </as-action>
</template>

<script lang="ts">
import { Button } from 'ant-design-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

// register icons
import '../../icons/info-circle';

import AsAction from './AsAction.vue';

Vue.use(Button);

@Component({
  name: 'AsActionEdit',
  components: {
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: 'small' }) size: string;
  @Prop({ default: 'default' }) type: string;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;

  trigger() {
    (this.$refs?.actionRef as any)?.trigger();
  }
}
</script>
