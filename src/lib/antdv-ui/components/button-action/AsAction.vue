<template>
  <a-button
    :disabled="disabled"
    :icon="icon"
    :size="size"
    :type="type"
    :loading="loading"
    @click="trigger"
    :title="title"
  >
    <slot></slot>
  </a-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Button } from 'ant-design-vue';

Vue.use(Button);

@Component({
  name: 'AsAction'
})
export default class extends Vue {
  @Prop({ default: null }) icon: string;
  @Prop({ default: 'default' }) size: string;
  @Prop({ default: 'default' }) type: string;
  @Prop({ default: '' }) title: string;
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;

  loading = false;

  trigger() {
    if (this.handler) {
      this.loading = true;
      this.handler()
        .catch((err) => {
          this.$notification.error({ message: '', description: err.message });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
}
</script>
