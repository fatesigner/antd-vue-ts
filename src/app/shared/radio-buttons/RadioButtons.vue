<template>
  <el-form label-width="80px">
    <el-form-item :label="label">
      <el-radio-group v-model="model_" class="vui-mr5">
        <el-radio-button :label="null">全部</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="model_">
        <el-radio-button v-for="option in options_" :label="option.value" :disabled="!option.count">{{ option.label }}</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IRadioButtonOption } from './model';

@Component({
  name: 'RadioButtons'
})
export default class extends Vue {
  @Prop({ default: '' }) label: string;
  @Prop({ default: null }) model: string;
  @Prop({ default: () => [] }) options: IRadioButtonOption[];

  model_ = null;
  options_: IRadioButtonOption[] = [];

  @Watch('model', {
    immediate: true
  })
  onModelChange(val) {
    if (val) {
      console.log(' watch model ');
      this.model_ = val;
    }
  }

  @Watch('model_')
  onModel_Change(val) {
    this.$emit('update:model', val);
  }

  @Watch('options', {
    immediate: true
  })
  onOptionsChange(val) {
    if (val) {
      let count = 0;
      this.options_ = val.map((x) => {
        count += parseInt(x.count);
        return {
          label: x.label + `(${x.count})`,
          value: x.value,
          count: x.count
        };
      });
    }
  }

  reset() {
    this.model = null;
  }
}
</script>
