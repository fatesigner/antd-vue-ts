<template>
  <as-action
    ref="actionRef"
    class="as-action-edit"
    :disabled="disabled"
    :size="size"
    :type="type"
    :handler="handler"
    title="编辑"
  >
    <v-icon name="pen" /><slot />
  </as-action>
</template>

<script lang="ts">
import { Button } from 'ant-design-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

// register icons
import '../../icons/pen';

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
  @Prop({ default: 'link' }) type: string;
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;

  trigger() {
    (this.$refs?.actionRef as any)?.trigger();
  }
}
</script>

<style lang="scss" scoped>
.as-action-edit {
  padding: 0;
  color: #4a9fca;

  &:hover,
  &:focus {
    color: rgba(#4a9fca, 0.7);
  }

  &:active,
  &.active {
    color: rgba(#4a9fca, 0.5);
  }
}
</style>
