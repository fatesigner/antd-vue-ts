<template>
  <component
    v-if="props.popover && comp"
    :is="comp"
    v-bind="props.props"
    v-dynamic-events="{ events: listenerKyes, listener: listener }"
  />
  <a-modal
    v-else-if="props.popover && !comp"
    :title="props.title"
    :visible.sync="props.visible"
    :close-on-click-modal="false"
    :footer="null"
    @cancel="props.visible_ = false"
  >
    <transition-group tag="div" class="lazy-component-wrapper" :name="props.transitional ? 'lazy-component' : ''">
      <div class="lazy-component-skeleton" key="skeleton" v-if="loading">
        <slot name="skeleton" v-if="$slots.skeleton" />
        <as-lazy-loading v-else />
      </div>
      <div class="lazy-component-slot" key="slot" v-if="initialized">
        <slot :initialized="initialized" />
      </div>
    </transition-group>
  </a-modal>
  <transition-group v-else tag="div" class="lazy-component-wrapper" :name="props.transitional ? 'lazy-component' : ''">
    <div class="lazy-component-skeleton" key="skeleton" v-if="loading">
      <slot name="skeleton" v-if="$slots.skeleton" />
      <as-lazy-loading v-else />
    </div>
    <div class="lazy-component-comp" key="comp" v-if="compLoaded">
      <component :is="comp" v-bind="props.props" v-dynamic-events="{ events: listenerKyes, listener: listener }" />
    </div>
    <div class="lazy-component-slot" key="slot" v-if="initialized">
      <slot :initialized="initialized" />
    </div>
  </transition-group>
</template>

<script lang="ts">
import { Modal } from 'ant-design-vue';
import { IsBoolean } from '@fatesigner/utils/type-check';
import { MergeHandlers, MergeVueProps } from '@fatesigner/utils';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DynamicEvents } from '@fatesigner/vue-lib/directives/dynamic-events';
import { IVueCompGetContext, IVueCompMethods } from '@fatesigner/vue-lib/component';

import AsLazyError from './AsLazyError.vue';
import AsLazyLoading from './AsLazyLoading.vue';
import { IAsLazyHandler, IAsLazyListeners, IAsLazyProps } from './interfaces';

Vue.use(Modal);
Vue.use(DynamicEvents);

@Component({
  name: 'AsLazy',
  components: {
    AsLazyError,
    AsLazyLoading
  }
})
export default class extends Vue {
  @Prop({ default: null }) getContext: IVueCompGetContext<any>;
  @Prop({ default: () => ({}) }) props: IAsLazyProps<any, any, any>;
  @Prop({ default: () => {} }) listeners: IAsLazyListeners<any>;
  @Prop({ default: () => {} }) handler: IAsLazyHandler;
  @Prop({ default: () => {} }) methods: IVueCompMethods<any>;

  defaultProps: IAsLazyProps<any, any, any> = {
    comp: null,
    visible: false,
    transitional: false,
    popover: false,
    props: {},
    listeners: {}
  };

  comp: any = null;
  visible = this.defaultProps.visible;

  loading = false;
  initialized = false;
  compLoaded = false;

  get listenerKyes() {
    return Object.keys(this.props?.listeners);
  }

  async created() {
    // set props
    MergeVueProps(Vue, this.defaultProps, this.props);

    // set handler
    MergeHandlers(this.handler, {
      present: this.present,
      dismiss: this.dismiss
    });

    // set methods
    if (this.methods) {
      Object.keys(this.methods).forEach((key) => {
        this.methods[key] = this.methods[key].bind(this.getContext());
      });
    }
  }

  @Watch('props.comp', {
    immediate: true
  })
  onCompChange(val: any) {
    if (val) {
      this.initialized = false;
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
        if (!this.initialized) {
          this.loadComp();
        }
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

  async loadComp() {
    this.loading = true;
    if (this.props.comp) {
      await this.props.comp().then((res) => {
        this.$nextTick(() => {
          const self = this;
          this.comp = {
            functional: true,
            render(h: any, { data, children }: any) {
              self.$nextTick(() => {
                self.$emit('loaded');
              });
              return h(res.default, data, children);
            }
          };
          this.compLoaded = true;
        });
      });
    }
    this.initialized = true;
    this.loading = false;
  }

  // 监听动态组件事件
  listener(eventName: string, ...args: any[]) {
    if (this?.props?.listeners) {
      if (Object.prototype.hasOwnProperty.call(this?.props?.listeners, eventName)) {
        this?.props?.listeners[eventName].call(this.getContext(), ...args);
      }
    }
  }

  onClose() {
    this.props.visible = false;
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
  max-width: 100%;
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
