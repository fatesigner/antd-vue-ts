<template>
  <a-drawer
    class="as-drawer"
    :class="[props.padding ? 'as-drawer-padding' : '']"
    :closable="props.closeable"
    :placement="props.direction"
    :mask="props.backdrop"
    :width="props.width"
    :height="props.height"
    :z-index="props.zIndex"
    :keyboard="props.keyboard"
    :visible.sync="visible"
    :after-visible-change="onAfterVisibleChange"
    @close="onClose"
  >
    <template #title v-if="props.title">
      <slot name="title"
        ><div class="as-drawer-title">{{ props.title }}</div></slot
      >
    </template>
    <div class="as-drawer-container">
      <div class="as-drawer-body">
        <slot />
      </div>
      <div class="as-drawer-footer" v-if="$scopedSlots.hasOwnProperty('footer')">
        <slot name="footer" />
      </div>
    </div>
  </a-drawer>
</template>

<script lang="ts">
import { Drawer } from 'ant-design-vue';
import { IsBoolean } from '@fatesigner/utils/type-check';
import { MergeHandlers, MergeVueProps } from '@fatesigner/utils';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { IVueCompGetContext, IVueCompMethods } from '@fatesigner/vue-lib/component';

import { AsLoading } from '../loading';
import { IAsDrawerHandler, IAsDrawerListeners, IAsDrawerProps } from './interfaces';

Vue.use(Drawer);

@Component({
  name: 'AsDrawer',
  components: {
    AsLoading
  }
})
export default class extends Vue {
  @Prop({ default: null }) getContext: IVueCompGetContext<any>;
  @Prop({ default: () => ({}) }) props: IAsDrawerProps;
  @Prop({ default: () => {} }) listeners: IAsDrawerListeners<any>;
  @Prop({ default: () => {} }) handler: IAsDrawerHandler;
  @Prop({ default: () => {} }) methods: IVueCompMethods<any>;

  defaultProps: IAsDrawerProps = {
    title: '',
    visible: false,
    closeable: true,
    backdrop: true,
    keyboard: false,
    zIndex: 1000,
    padding: true,
    direction: 'right'
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

  mounted() {
    // 初始化时，onAfterVisibleChange 并不会触发，所以在此手动触发
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
      if (this.listeners?.presented) {
        this.listeners.presented.call(this.getContext());
      }
      this.$emit('presented');
    }
  }

  onClose(...args) {
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

  async toggle(val) {
    if (IsBoolean(val)) {
      this.visible = val;
    } else {
      this.visible = !this.visible;
    }
  }
}
</script>

<style lang="scss" scoped>
.as-drawer-body {
  max-height: 100%;
  overflow: hidden;
}

.as-drawer {
  ::v-deep .ant-drawer-header {
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

  ::v-deep .ant-drawer-body {
    padding: 0;
  }

  .as-drawer-body {
    height: 100%;
    overflow: auto;
  }

  &.as-drawer-padding {
    .as-drawer-body {
      padding: 15px 20px 20px 20px;
    }
  }
}

.as-drawer-title {
  font-weight: 600;
}

.as-drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.as-drawer-loading {
  text-align: center;
}

.as-drawer-footer {
  position: relative;
  padding: 10px 16px;
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
