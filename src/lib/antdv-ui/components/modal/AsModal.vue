<template>
  <a-modal
    class="as-modal"
    :class="[props.padding ? 'as-modal-padding' : '']"
    :title="props.title"
    :width="props.width"
    :z-index="props.zIndex"
    :maskClosable="props.maskClosable"
    :keyboard="props.keyboard"
    v-model="visible"
    :footer="null"
    @ok="onOk"
    @cancel="onCancel"
  >
    <template #closeIcon>
      <v-icon class="close-icon" name="times" scale=".8" />
    </template>
    <div class="as-modal-container">
      <div class="as-modal-body">
        <slot />
      </div>
      <div class="as-modal-footer" v-if="$scopedSlots.hasOwnProperty('footer')">
        <slot name="footer" />
      </div>
    </div>
  </a-modal>
</template>

<script lang="tsx">
import { Modal } from 'ant-design-vue';
import { IsBoolean } from '@fatesigner/utils/type-check';
import { MergeHandlers, MergeVueProps } from '@fatesigner/utils';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { IVueCompGetContext, IVueCompMethods } from '@fatesigner/vue-lib/component';

import { IAsModalHandler, IAsModalListeners, IAsModalProps } from './interfaces';

// register icons
import '../../icons/times';

Vue.use(Modal);

@Component({
  name: 'AsModal'
})
export default class extends Vue {
  @Prop({ default: null }) getContext: IVueCompGetContext<any>;
  @Prop({ default: () => ({}) }) props: IAsModalProps;
  @Prop({ default: () => {} }) listeners: IAsModalListeners<any>;
  @Prop({ default: () => {} }) handler: IAsModalHandler;
  @Prop({ default: () => {} }) methods: IVueCompMethods<any>;

  getCurrentContext() {
    return this;
  }

  defaultProps: IAsModalProps = {
    title: '',
    visible: false,
    closeable: true,
    maskClosable: true,
    keyboard: false,
    zIndex: 1000,
    padding: true
  };

  visible = this.defaultProps.visible;

  created() {
    // set props
    MergeVueProps(Vue, this.defaultProps, this.props);

    // set handler
    MergeHandlers(this.handler, {
      present: this.present,
      dismiss: this.dismiss,
      toggle: this.toggle
    });

    // set methods
    if (this.methods) {
      Object.keys(this.methods).forEach((key) => {
        this.methods[key] = this.methods[key].bind(this.getContext());
      });
    }
  }

  @Emit('presented')
  emitPresented() {
    if (this.listeners?.presented) {
      this.$nextTick(() => {
        this.listeners.presented.call(this.getContext(), this.visible);
      });
    }
  }

  @Watch('props.visible', {
    immediate: true
  })
  onVisibleChange(val: boolean) {
    if (this.visible !== val) {
      this.visible = val;
      // 执行勾子
      if (this.listeners?.visibleChanged) {
        this.listeners.visibleChanged.call(this.getContext(), val);
      }
      if (val) {
        // 因 antdv 组件未提供 presented 事件，这里使用延时模拟
        setTimeout(() => {
          this.emitPresented();
        });
      }
    }
  }

  @Watch('visible')
  onVisibleChange_(val: boolean) {
    if (this.props.visible !== val) {
      this.props.visible = val;
      // 执行勾子
      if (this.listeners?.visibleChanged) {
        this.listeners.visibleChanged.call(this.getContext(), val);
      }
    }
  }

  // 当抽屉显示动画结束后触发
  onAfterVisibleChange(visible) {
    if (visible) {
      this.emitPresented();
    }
  }

  onClose(...args: any[]) {
    this.visible = false;
    if (this.listeners?.dissmissed) {
      this.$nextTick(() => {
        this.listeners.dissmissed.call(this.getContext());
      });
    }
    this.$emit('dissmissed', ...args);
  }

  async present() {
    this.visible = true;
  }

  async dismiss() {
    this.visible = false;
  }

  async toggle(val: boolean) {
    if (IsBoolean(val)) {
      this.visible = val;
    } else {
      this.visible = !this.visible;
    }
  }

  onCancel(...e: any[]) {
    this.$emit('cancel', ...e);
  }

  onOk(...e: any[]) {
    this.$emit('ok', ...e);
  }

  ok() {
    this.props.footer = false;
  }
}
</script>

<style lang="scss" scoped>
.as-modal-body {
  max-height: 100%;
  overflow: hidden;
}

.as-modal {
  ::v-deep .ant-modal-header {
    position: relative;
    border-bottom: 0;

    &::after {
      position: absolute;
      right: 0;
      bottom: -3px;
      left: 0;
      z-index: 3;
      height: 3px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2) 0,
        rgba(0, 0, 0, 0.2) 1px,
        rgba(0, 0, 0, 0.1) 0,
        transparent
      );
      opacity: 0.6;
      transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
      transition-duration: 0.22s;
      transition-property: left, opacity, width;
    }
  }

  ::v-deep .ant-modal-close-x {
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
      margin-top: -2px;
    }
  }

  ::v-deep .ant-modal-body {
    padding: 0;
  }

  .as-modal-body {
    height: 100%;
    overflow: auto;
  }

  &.as-modal-padding {
    .as-modal-body {
      padding: 15px 20px 20px 20px;
    }
  }
}

.as-modal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.as-modal-loading {
  text-align: center;
}

.as-modal-footer {
  position: relative;
  padding: 10px 20px;
  text-align: right;

  &::after {
    position: absolute;
    top: -3px;
    right: 0;
    left: 0;
    z-index: 3;
    height: 3px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.2) 0,
      rgba(0, 0, 0, 0.2) 1px,
      rgba(0, 0, 0, 0.1) 0,
      transparent
    );
    opacity: 0.5;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    transition-duration: 0.22s;
    transition-property: left, opacity, width;
  }
}
</style>
