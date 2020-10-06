<template>
  <as-action ref="actionRef" class="outline secondary" :size="size" type="default" :handler="handler">
    <slot><v-icon name="ban" scale=".9" />取消</slot>
  </as-action>
</template>

<script lang="ts">
import { Button } from 'ant-design-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

// register icons
import '../../icons/ban';

import AsAction from './AsAction.vue';

Vue.use(Button);

@Component({
  name: 'AsActionCancel',
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
