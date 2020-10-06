<template>
  <div class="as-async-section">
    <slot v-bind="{ loading, data, refresh }" />
    <slot name="loading" v-if="loading">
      <as-loading class="vui-p20" :size="props.size" />
    </slot>
    <template v-else-if="error">
      <slot name="error" v-bind="{ error, refresh }">
        <a-alert class="as-async-section-alert" type="error" show-icon>
          <template #description>
            {{ error.message }}
            <a-button v-if="loading" class="btn-refresh" type="link">
              <v-icon name="redo" scale=".9" spin />
            </a-button>
            <a-button v-else class="btn-refresh" type="link" @click="refresh" title="刷新">
              <v-icon name="redo" scale=".9" />
            </a-button>
          </template>
        </a-alert>
      </slot>
    </template>
    <template v-if="!loading && !error">
      <a-button v-if="props.refreshable" class="btn-reload" type="link" @click="refresh" title="刷新">
        <v-icon name="sync" scale=".9" :spin="reloading" />
      </a-button>
      <slot name="content" v-bind="{ loading, data, refresh }" />
    </template>
  </div>
</template>

<script lang="ts">
import { Alert, Button } from 'ant-design-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BindPromiseQueue, MergeHandlers, MergeVueProps } from '@fatesigner/utils';
import { IVueCompGetContext, IVueCompMethods } from '@fatesigner/vue-lib/component';
import { AsLoading } from '../../../antdv-ui/components/loading';
import '../../../antdv-ui/icons/redo';

import { IAsAsyncSectionHandler, IAsAsyncSectionListeners, IAsAsyncSectionProps } from './interfaces';

Vue.use(Alert);
Vue.use(Button);

@Component({
  name: 'AsAsyncSection',
  components: {
    AsLoading
  }
})
export default class extends Vue {
  @Prop({ default: null }) getContext: IVueCompGetContext<any>;
  @Prop({ default: () => ({}) }) props: IAsAsyncSectionProps<any, any>;
  @Prop({ default: () => {} }) listeners: IAsAsyncSectionListeners<any, any>;
  @Prop({ default: () => {} }) handler: IAsAsyncSectionHandler<any>;
  @Prop({ default: () => {} }) methods: IVueCompMethods<any>;

  getCurrentContext() {
    return this;
  }

  defaultProps: IAsAsyncSectionProps<any, any> = {
    size: null,
    refreshable: false,
    immediate: true,
    error: null,
    data: null,
    initialized: false,
    initialize: null
  };

  data = this.defaultProps.data;
  error = this.defaultProps.error;
  initialized = this.defaultProps.initialized;

  loading = false;

  reloading = false;

  created() {
    // set props
    MergeVueProps(Vue, this.defaultProps, this.props);

    // set handler
    MergeHandlers(this.handler, {
      refresh: this.refresh
    });

    // set methods
    if (this.methods) {
      Object.keys(this.methods).forEach((key) => {
        this.methods[key] = this.methods[key].bind(this.getContext());
      });
    }
  }

  mounted() {
    if (this.props.immediate) {
      this.refresh();
    }
  }

  @Watch('props.data', {
    immediate: true
  })
  onDataChange(val: any) {
    if (this.data !== val) {
      this.data = val;
      // 执行勾子
      if (this.listeners?.dataChanged) {
        this.listeners.dataChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('data')
  onDataChange_(val: any) {
    if (this.props.data !== val) {
      this.props.data = val;
      // 执行勾子
      if (this.listeners?.dataChanged) {
        this.listeners.dataChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('props.error', {
    immediate: true
  })
  onErrorChange(val: Error) {
    if (this.error !== val) {
      this.error = val;
      // 执行勾子
      if (this.listeners?.errorChanged) {
        this.listeners.errorChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('error')
  onErrorChange_(val: Error) {
    if (this.props.error !== val) {
      this.props.error = val;
      // 执行勾子
      if (this.listeners?.errorChanged) {
        this.listeners.errorChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('props.initialized', {
    immediate: true
  })
  onInitializedChange(val: boolean) {
    if (this.initialized !== val) {
      this.initialized = val;
      this.loading = !val;
    }
  }

  @Watch('initialized')
  onInitializedChange_(val: boolean) {
    if (this.props.initialized !== val) {
      this.props.initialized = val;
    }
  }

  reload() {
    this.reloading = true;
    this.refresh().finally(() => {
      setTimeout(() => {
        this.reloading = false;
      }, 500);
    });
  }

  refresh = BindPromiseQueue(() => {
    return async function (this: any) {
      const currentContext = this.getCurrentContext();
      currentContext.loading = true;
      currentContext.initialized = false;
      return currentContext.props.initialize
        .call(currentContext.getContext())
        .then((res: any) => {
          currentContext.data = res;
          currentContext.error = null;
          currentContext.initialized = true;
          return res;
        })
        .catch((err: Error) => {
          currentContext.error = err;
          currentContext.initialized = false;
        })
        .finally(() => {
          setTimeout(() => {
            currentContext.loading = false;
          }, 300);
        });
    }.call(this.getCurrentContext());
  }, true);
}
</script>

<style lang="scss" scoped>
.as-async-section {
  padding: 0;

  .btn-refresh {
    padding: 0 5px;
  }

  .btn-reload {
    position: absolute;
    right: 0;
    z-index: 1;
    width: 32px;
    padding: 0;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 50%;
  }
}

.as-async-section-alert {
  display: inline-block;
  max-width: 100%;
  padding: 12px 40px 10px 64px;

  ::v-deep .ant-alert-message {
    display: none;
  }

  ::v-deep .ant-alert-description {
    font-weight: 500;
  }
}
</style>
