<template>
  <div class="as-combobox" :class="[showSearch && 'as-combobox-searchable', disabled && 'as-combobox-binding']">
    <a-select
      v-model="binds.value"
      :showSearch="showSearch"
      :showArrow="true"
      :autoClearSearchValue="mode === 'tags'"
      :disabled="readonly"
      :mode="mode"
      :filter-option="false"
      :allowClear="allowClear"
      :placeholder="placeholder"
      @focus="onFoucs"
      @search="onSearch"
      @change="onChange"
      @dropdownVisibleChange="onDropdownVisibleChange"
    >
      <template slot="notFoundContent">
        <a-spin v-if="loading" size="small" />
        <a-empty v-else :image="simpleImage" />
      </template>
      <a-select-option
        v-for="(option, index) in binds.options"
        :key="rowKey ? option[rowKey] : index"
        :value="option[displayValue] || option"
      >
        <slot name="option" v-bind="{ option }">
          {{ option[displayText] || option }}
        </slot>
      </a-select-option>
    </a-select>
    <!--<input class="input-hidden" v-model="value_" alt="" title="" />-->
  </div>
</template>

<script lang="ts">
import { Empty, Select, Spin } from 'ant-design-vue';
import { Debounce } from '@fatesigner/utils';
import { isNull, isUndefined } from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

Vue.use(Empty);
Vue.use(Select);
Vue.use(Spin);

@Component({
  name: 'AsCombobox'
})
export default class extends Vue {
  @Prop({ default: null }) value: string;
  @Prop({ default: (): any[] => [] }) options: any[];
  @Prop({ default: 50 }) pageSize: number;
  @Prop({ default: null }) rowKey: string;
  @Prop({ default: 'value' }) displayValue: string;
  @Prop({ default: 'text' }) displayText: string;
  @Prop({ default: null }) placeholder: string;
  @Prop({ default: false }) allowClear: boolean;
  @Prop({ default: false }) showSearch: boolean;
  @Prop({ default: true }) autoBind: boolean;
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: true }) cached: boolean;
  @Prop({ default: null, type: [Object, Promise, Function] }) loadData: (keywords: string) => Promise<any[]>;
  @Prop({ default: 'default' }) mode: 'default' | 'multiple' | 'tags' | 'combobox';

  getCurrentContext() {
    return this;
  }

  binds: any = {
    value: undefined,
    options: []
  };

  defaultValue: any = undefined;

  loading = false;

  initialized = false;

  disabled = false;

  simpleImage = (Empty as any).PRESENTED_IMAGE_SIMPLE;

  @Watch('value', {
    immediate: true
  })
  onValueChange(val: any) {
    if (this.binds.value !== val) {
      if (isUndefined(val) || isNull(val)) {
        // 对于 null 的值，一律转换成 undefined，以解决无法显示 placholder 的 bug
        this.binds.value = undefined;
      } else {
        this.binds.value = val;
      }
    }
  }

  @Watch('binds.value')
  onValueChange_(val: any) {
    if (this.value !== val) {
      this.$emit('input', val);
    }
  }

  @Watch('options', {
    immediate: true
  })
  onOptionsChange(val: any) {
    if (this.binds.options !== val) {
      this.binds.options = val;
    }
  }

  @Watch('showSearch')
  onShowSearchChange(val: any) {
    if (!val) {
      // 设置非搜索模式下的 input 元素为只读
      if (this.$el) {
        const $el = this.$el.querySelector('.ant-select-search input');
        if ($el) {
          $el.setAttribute('readonly', 'readonly');
        }
      }
    }
  }

  created() {
    if (!this.readonly && this.autoBind) {
      this.disabled = true;
      this.refresh();
    }
  }

  mounted() {
    this.onShowSearchChange(this.showSearch);
  }

  refresh = Debounce(
    async (keywords?) => {
      return async function (this: any) {
        if (this.loadData) {
          this.loading = true;
          this.binds.options = [];
          await this.loadData(keywords || '')
            .then((options) => {
              // 为提高控件性能，只显示指定的 pageSize 数量的数据
              this.options.splice(0, this.options.length, ...options.slice(0, this.pageSize));
            })
            .catch((err) => {
              this.$notification.error({ message: '', description: err.message });
            });
          this.loading = false;
        }
        this.initialized = true;
        this.disabled = false;
      }.call(this.getCurrentContext());
    },
    300,
    true
  );

  onFoucs(e: any) {
    if (!this.cached || !this.initialized) {
      this.refresh();
    }
    this.$emit('focus', e);
  }

  onDropdownVisibleChange(open: any) {
    this.$emit('dropdownVisibleChange', open);
  }

  onChange(value: any, option: any) {
    this.$emit('change', value, option);
  }

  onSearch(value: any) {
    this.refresh(value);
    this.$emit('search', value);
  }
}
</script>

<style lang="scss" scoped>
.as-combobox {
  display: inline-block;
  min-width: 60px;

  ::v-deep .ant-select {
    width: 100%;
  }

  &:not(.as-combobox-searchable) {
    ::v-deep .ant-select-selection--multiple {
      cursor: pointer;
    }

    ::v-deep .ant-select-search {
      opacity: 0;
    }

    input {
      user-select: none;
    }
  }

  &.as-combobox-binding {
    ::v-deep .ant-select-selection__rendered {
      opacity: 0.3;
      user-select: none;
    }
  }
}

.input-hidden {
  height: 0;
  opacity: 0;
}
</style>
