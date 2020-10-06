<template>
  <span>
    <a-popconfirm
      v-if="confirm"
      ok-text="确定"
      cancel-text="取消"
      :iconColor="color"
      :title="title"
      @confirm="onConfirm"
    >
      <slot />
    </a-popconfirm>
    <slot v-else />
  </span>
</template>

<script lang="ts">
import { Button, Popconfirm } from 'ant-design-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import AsAction from './AsAction.vue';

Vue.use(Button);
Vue.use(Popconfirm);

@Component({
  name: 'AsActionConfirm',
  components: {
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: null }) icon: string;
  @Prop({ default: 'red' }) color: string;
  @Prop({ default: 'small' }) size: string;
  @Prop({ default: true }) confirm: boolean;
  @Prop({ default: false }) notify: boolean;
  @Prop({ default: 'link' }) type: string;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: Promise<void>;

  handler_: any = null;

  loading = false;

  @Watch('handler', {
    immediate: true
  })
  onHandlerWatch(val: any) {
    if (val) {
      this.handler_ = () => {
        return val().then(() => {
          if (this.notify) {
            this.$notification.success({
              message: '',
              description: '删除成功！'
            });
          }
        });
      };
    }
  }

  onConfirm() {
    if (this.handler_) {
      this.loading = true;
      this.handler_()
        .catch((err: Error) => {
          this.$notification.error({ message: '', description: err.message });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  trigger() {
    if (this.confirm) {
      this.onConfirm();
    } else {
      (this.$refs?.actionRef as any)?.trigger();
    }
  }
}
</script>

<style lang="scss" scoped>
.as-action-popconfirm {
  padding: 0;
  color: #a78892;

  &:hover,
  &:focus {
    color: rgba(#a78892, 0.7);
  }

  &:active,
  &.active {
    color: rgba(#a78892, 0.5);
  }
}
</style>
