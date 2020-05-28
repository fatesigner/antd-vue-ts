<template>
  <div class="radio-buttons">
    <ele-loading v-if="loading" size="36" />
    <el-form-item v-for="row in rows_" :key="row.name" :label="row.label">
      <el-button
        v-for="option in row.options"
        :key="option.value"
        :type="option.value === row.value ? 'primary' : ''"
        :disabled="!option.count"
        size="small"
        @click="itemClick(option, row)"
        >{{ option.label }}</el-button
      >
    </el-form-item>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

import { IRadioButtons } from './interfaces';

@Component({
  name: 'RadioButtons'
})
export default class extends Vue {
  @Prop({ default: () => [] }) rows: IRadioButtons[];
  @Prop({ default: () => {} }) data: { [key: string]: any[] };

  rows_: IRadioButtons[] = [];

  loading = true;

  @Watch('rows', {
    immediate: true
  })
  onRowsChange(val) {
    if (val) {
      console.log(' watch rows');
      // this.rows_ = val;
      this.convertData();
    }
  }

  @Watch('data')
  onDataChange(val) {
    if (val) {
      console.log(' watch data');
      this.convertData();
    }
  }

  @Emit('change')
  emitChange() {
    return this.rows_.reduce((prev, cur) => {
      prev[cur.name] = cur.value;
      return prev;
    }, {});
  }

  convertData() {
    this.rows_ = [];
    this.rows.forEach((row) => {
      let countTotal = 0;
      const options = row.options.map((option) => {
        let count = 0;
        if (this.data && Object.prototype.hasOwnProperty.call(this.data, row.name)) {
          const _item = this.data[row.name].find((x) => x.code == option.value);
          if (_item) {
            count += parseInt(_item.count);
          }
        }
        countTotal += count;
        return {
          label: option.label + `(${count})`,
          value: option.value,
          count: count
        };
      });
      options.unshift({
        label: `全部(${countTotal})`,
        value: null,
        count: countTotal
      });
      this.rows_.push({
        label: row.label,
        name: row.name,
        value: null,
        options
      });
    });
    this.loading = false;
  }

  itemClick(option, row) {
    row.value = option.value;
    this.emitChange();
  }
}
</script>

<style lang="scss" scoped>
.radio-buttons {
  .el-button {
    margin: 2px;
  }
}
</style>
