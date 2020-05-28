<template>
  <transition-group
    tag="div"
    class="lazy-component-wrapper"
    :name="transition ? 'lazy-component' : ''"
    :style="{ width: width_, height: height_ }"
  >
    <div class="lazy-component-skeleton" key="skeleton" v-if="loading">
      <slot name="skeleton" v-if="$slots.skeleton" />
      <ele-lazy-loading v-else />
    </div>
    <div
      class="lazy-component-comp"
      key="comp"
      v-if="compLoaded"
      :style="{ 'max-width': width_, 'max-height': height_ }"
    >
      <component :is="comp_" v-dynamic-events="events_" v-bind="props" />
    </div>
    <div class="lazy-component-slot" key="slot" v-if="initialized">
      <slot :initialized="initialized" />
    </div>
  </transition-group>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { IsNumber } from '@forgleaner/utils/type-check';

import { DynamicEvents } from '../../../vue-common/directives/dynamic-events';

import EleLazyError from './EleLazyError.vue';
import EleLazyLoading from './EleLazyLoading.vue';

Vue.use(DynamicEvents);

@Component({
  name: 'EleLazyComp',
  components: {
    EleLazyError,
    EleLazyLoading
  }
})
export default class extends Vue {
  @Prop({ default: undefined, type: [Function] }) comp: () => Promise<any>;
  @Prop({ default: undefined }) events: any[];
  @Prop({ default: undefined, type: Object }) props: object;
  @Prop({ default: false }) keepAlive: boolean;
  @Prop({ default: 20 }) delay: number;
  @Prop({ default: 2000 }) timeout: number;
  @Prop({ default: undefined }) viewport: HTMLElement;
  @Prop({ default: true }) transition: boolean;
  @Prop({ default: '', type: [String, Number] }) width: string | number;
  @Prop({ default: '', type: [String, Number] }) height: number | string;

  loading = true;
  initialized = false;
  compLoaded = false;
  comp_: any = null;
  events_: any = [];
  width_: string | number = '';
  height_: string | number = '';

  @Watch('comp')
  onCompChange() {
    this.loadComp();
  }

  @Watch('events', {
    immediate: true
  })
  onEventsChange(val) {
    if (val && val.length) {
      val.forEach((event) => {
        this.events_[event] = 'ON' + event;
        this[this.events_[event]] = (data) => {
          this.$emit(event, data);
        };
      });
    }
  }

  @Watch('width', {
    immediate: true
  })
  onWidthChange(val) {
    if (IsNumber(val)) {
      this.width_ = val + 'px';
    } else {
      this.width_ = '';
    }
  }

  @Watch('height', {
    immediate: true
  })
  onHeightChange(val) {
    if (IsNumber(val)) {
      this.height_ = val + 'px';
    } else {
      this.height_ = '';
    }
  }

  @Emit('loaded')
  emitLoaded() {}

  created() {
    this.initialized = true;
    if (this.comp) {
      this.loadComp();
    }
  }

  loadComp() {
    if (this.comp) {
      this.comp()
        .then((res) => {
          this.$nextTick(() => {
            const self = this;
            this.comp_ = {
              functional: true,
              render(h, { data, children }) {
                self.$nextTick(() => {
                  self.emitLoaded();
                });
                return h(res.default, data, children);
              }
            };
          });
        })
        .finally(() => {
          this.compLoaded = true;
          this.loading = false;
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.lazy-component-wapper {
  position: relative;
  max-width: 100%;
  max-height: inherit;
  overflow: hidden;
}

.lazy-component-enter-active {
  opacity: 0;
  transition: opacity 0.3s;
}

.lazy-component-enter-to {
  opacity: 1;
}

.lazy-component-leave-active {
  position: absolute;
  top: 0;
  width: 100%;
  opacity: 1;
}

.lazy-component-leave-to {
  opacity: 0;
}

.lazy-component-loading,
.lazy-component-error,
.lazy-component-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-component-wrapper,
.lazy-component-loading,
.lazy-component-error,
.lazy-component-skeleton,
.lazy-component-comp,
.lazy-component-slot {
  width: 100%;
  height: 100%;

  > svg {
    width: 100%;
    height: 100%;
  }
}

.lazy-component-slot {
  overflow-y: auto;
}
</style>
