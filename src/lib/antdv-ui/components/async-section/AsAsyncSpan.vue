<template>
  <div class="as-async-span">
    <slot v-bind="{ loading, data }" />
    <slot name="loading" v-if="loading">
      <as-loading class="vui-p20" :size="size" />
    </slot>
    <template v-else-if="error">
      <slot name="error" v-bind="{ error }" />
    </template>
    <template v-if="!loading && !error">
      <slot name="content" v-bind="{ loading, data, refresh: trigger }" />
    </template>
  </div>
</template>

<script lang="ts">
import { Alert, Button } from 'ant-design-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AsLoading } from '../../../antdv-ui/components/loading';

Vue.use(Alert);
Vue.use(Button);

@Component({
  name: 'AsAsyncSpan',
  components: {
    AsLoading
  }
})
export default class extends Vue {
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;
  @Prop({ default: null }) size: 'small' | 'large';
  @Prop({ default: false }) initialized: boolean;

  getCurrentContext() {
    return this;
  }

  initialized_ = false;

  loading = false;

  error = null;

  data = null;

  created() {
    this.trigger();
  }

  @Watch('initialized')
  onInitializedChange(val) {
    if (val !== this.initialized_) {
      this.initialized_ = val;
      if (!val) {
        this.trigger();
      }
    }
  }

  @Watch('initialized_')
  onInitializedChange_(val) {
    if (val !== this.initialized) {
      this.$emit('update:initialized', val);
    }
  }

  trigger() {
    if (this.handler) {
      this.loading = true;
      this.handler()
        .then((data) => {
          this.initialized_ = true;
          this.data = data;
        })
        .catch((err) => {
          this.error = err.message;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.as-async-span {
  position: relative;
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

.as-async-span-alert {
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
