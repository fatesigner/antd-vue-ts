<template>
  <span class="as-action-delete-wrap">
    <a-popconfirm
      v-if="confirm"
      ok-text="确定"
      cancel-text="取消"
      iconColor="red"
      :disabled="disabled"
      title="确定删除吗？"
      @confirm="remove"
    >
      <a-button
        class="as-action-delete"
        :disabled="disabled"
        :icon="icon"
        :size="size"
        :type="type"
        :loading="loading"
        title="删除"
        ><slot><v-icon name="trash-alt" /></slot
      ></a-button>
    </a-popconfirm>
    <as-action
      v-else
      class="as-action-delete"
      :disabled="disabled"
      :icon="icon"
      :size="size"
      :type="type"
      :handler="handler_"
      title="删除"
    >
      <slot><v-icon name="trash-alt" /></slot>
    </as-action>
  </span>
</template>

<script lang="ts">
import { Button, Popconfirm } from 'ant-design-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

// register icons
import '../../icons/trash-alt';

import AsAction from './AsAction.vue';

Vue.use(Button);
Vue.use(Popconfirm);

@Component({
  name: 'AsActionDelete',
  components: {
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: null }) icon: string;
  @Prop({ default: 'small' }) size: string;
  @Prop({ default: true }) confirm: boolean;
  @Prop({ default: false }) notify: boolean;
  @Prop({ default: 'link' }) type: string;
  @Prop({ default: false }) disabled: boolean;
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

  remove() {
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
      this.remove();
    } else {
      (this.$refs?.actionRef as any)?.trigger();
    }
  }
}
</script>

<style lang="scss" scoped>
.as-action-delete-wrap {
  display: inline-block;
}

.as-action-delete {
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
