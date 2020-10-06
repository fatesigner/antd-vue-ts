<template>
  <a-popover class="as-popover" ref="popover" :placement="placement" :title="title" :trigger="trigger">
    <template v-if="$scopedSlots.hasOwnProperty('content')" slot="content">
      <a-button
        v-if="trigger === 'click'"
        class="as-popover-close dark"
        size="small"
        type="link"
        @click="dismiss"
        title="关闭"
      >
        <v-icon class="close-icon" name="times" scale=".7" />
      </a-button>
      <slot name="content" v-bind="{ dismiss: dismiss.bind(getCurrentContext()) }" />
    </template>
    <slot />
  </a-popover>
</template>

<script lang="ts">
import { Popover } from 'ant-design-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

Vue.use(Popover);

@Component({
  name: 'AsPopover'
})
export default class extends Vue {
  @Prop({ default: null }) title: string;
  @Prop({ default: 'click' }) trigger: 'hover' | 'click' | 'focus';
  @Prop({ default: 'bottomLeft' }) placement:
    | 'topLeft'
    | 'top'
    | 'topRight'
    | 'leftTop'
    | 'left'
    | 'leftBottom'
    | 'rightTop'
    | 'right'
    | 'rightBottom'
    | 'bottomLeft'
    | 'bottom'
    | 'bottomRight';

  getCurrentContext() {
    return this;
  }

  dismiss() {
    (this.$refs.popover as any)?.$refs?.tooltip?.$refs?.tooltip?.$refs?.trigger?.close();
  }
}
</script>

<style lang="scss" scoped>
.as-popover {
  min-width: 60px;

  ::v-deep {
    .ant-select {
      width: 100%;
    }
  }
}

.as-popover-close {
  position: absolute;
  top: 3px;
  right: 5px;
  height: auto;
  padding: 0;
  line-height: 1;
}

.ant-popover-placement-bottomRight {
  .as-popover-close {
    top: 13px;
  }
}

.ant-popover-placement-bottom {
  .as-popover-close {
    top: 13px;
  }
}

.ant-popover-placement-left {
  .as-popover-close {
    right: 15px;
  }
}
</style>
