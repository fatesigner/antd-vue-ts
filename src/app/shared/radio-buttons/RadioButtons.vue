<template>
  <el-form label-width="80px">
    <ele-loading v-if="loading" size="36" />
    <el-form-item v-for="item in data_" :label="item.label">
      <el-radio-group v-model="item.model" class="vui-mr5">
        <el-radio-button :label="null">全部</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="item.model">
        <el-radio-button v-for="option in item.options" :label="option.value" :disabled="!option.count">{{
          option.label
        }}</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IRadioButtons } from './model';

@Component({
  name: 'RadioButtons'
})
export default class extends Vue {
  @Prop({ default: () => [] }) data: IRadioButtons[];

  data_: IRadioButtons[] = [];

  loading = true;

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    if (val) {
      console.log(' watch data');
      let count = 0;
      this.data_ = val.map((x) => {
        const options = x.options.map((x2) => {
          count += parseInt(x2.count);
          return {
            label: x2.label + `(${x2.count})`,
            value: x2.value,
            count: x2.count
          };
        });
        return {
          label: x.label,
          model: null,
          options
        };
      });
      this.$nextTick(() => {
        this.loading = false;
      });
    }
  }
}
</script>
