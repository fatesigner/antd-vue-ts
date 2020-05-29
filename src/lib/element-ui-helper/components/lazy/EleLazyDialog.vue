<template>
  <el-dialog
    :title="title"
    :visible.sync="visible_"
    :width="width"
    :max-width="maxWidth"
    :close-on-click-modal="closeOnClickModal"
  >
    <ele-lazy-comp
      :class="[className]"
      :comp="comp_"
      :events="events"
      :props="props"
      :keepAlive="keepAlive"
      :transition="false"
      :delay="delay"
      :width="width_"
      :height="height_"
      :timeout="timeout"
      :viewport="viewport"
      v-dynamic-events="events"
      @loaded="onLoaded"
    />
  </el-dialog>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

import EleLazyComp from './EleLazyComp.vue';

@Component({
  name: 'EleLazyDialog',
  components: { EleLazyComp }
})
export default class extends Vue {
  @Prop({ default: '' }) title: string;
  @Prop({ default: false }) visible: boolean;
  @Prop({ default: undefined, type: [Function] }) comp: () => Promise<any>;
  @Prop({ default: undefined }) events: any[];
  @Prop({ default: undefined, type: Object }) props: object;
  @Prop({ default: false }) keepAlive: boolean;
  @Prop({ default: true }) closeOnClickModal: boolean;
  @Prop({ default: 20 }) delay: number;
  @Prop({ default: 2000 }) timeout: number;
  @Prop({ default: 'auto', type: [String, Number] }) width: string | number;
  @Prop({ default: 'auto', type: [String, Number] }) height: string | number;
  @Prop({ default: undefined, type: [Number] }) maxWidth: number;
  @Prop({ default: '', type: [String] }) className: string;
  @Prop({ default: undefined }) viewport: HTMLElement;

  comp_ = null;
  visible_ = false;
  width_: string | number = '';
  height_: string | number = '';

  @Watch('visible', {
    immediate: true
  })
  onVisibleChange(val) {
    if (val !== this.visible_) {
      this.visible_ = val;
      if (val && !this.comp_) {
        this.comp_ = this.comp;
      }
    }
  }

  @Watch('visible_')
  onVisible_Change(val) {
    if (val !== this.visible) {
      this.emitVisibleChange(val);
    }
  }

  @Watch('width', {
    immediate: true
  })
  onWidthChange(val) {
    this.width_ = val;
  }

  @Watch('height', {
    immediate: true
  })
  onHeightChange(val) {
    this.height_ = val;
  }

  @Emit('update:visible')
  emitVisibleChange(val) {}

  onLoaded() {
    setTimeout(() => {
      this.width_ = '';
      this.height_ = '';
    }, 1000);
  }
}
</script>
