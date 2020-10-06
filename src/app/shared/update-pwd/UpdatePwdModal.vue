<template>
  <as-modal v-bind="modal">
    <div class="container">
      <update-pwd :username="username" :token="token" @done="onDone" />
    </div>
  </as-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AsModal, CreateAsModal } from '../../../lib/antdv-ui/components/modal';

import UpdatePwd from './UpdatePwd.vue';

@Component({
  name: 'UpdatePwdModal',
  components: {
    UpdatePwd,
    AsModal
  }
})
export default class extends Vue {
  @Prop({ default: true }) visible: boolean;
  @Prop({ default: null }) username: string;
  @Prop({ default: null }) token: string;

  getContext() {
    return this;
  }

  done = false;

  modal = CreateAsModal({
    getContext: this.getContext,
    props: {
      title: '修改密码',
      visible: false
    },
    listeners: {
      visibleChanged(val) {
        if (val !== this.visible) {
          this.$emit('update:visible', val);
          if (this.done) {
            this.$emit('done');
            this.done = false;
          }
        }
      }
    }
  });

  @Watch('visible', {
    immediate: true
  })
  onVisibleChange(val) {
    if (val !== this.modal.props.visible) {
      this.modal.props.visible = val;
    }
  }

  close() {
    this.modal.props.visible = false;
  }

  onDone() {
    this.done = true;
    this.modal.props.visible = false;
  }
}
</script>

<style lang="scss" scoped>
.container {
  > * {
    margin: 0 auto;
  }
}
</style>
