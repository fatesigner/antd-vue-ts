<template>
  <div class="prepaid-audit">
    <div class="vui-padding vui-tc" v-if="loading">
      <ele-loading :size="40" />
    </div>
    <div v-else class="vui-row">
      <div class="vui-col-auto"></div>
      <div class="vui-col-auto" style="width: 300px;"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IEleUploaderOptions } from '../../../lib/element-ui-helper/components/uploader';

@Component({
  name: 'ProductionForm'
})
export default class extends Vue {
  @Prop({ default: null }) data: any;

  data_: any;
  loading = true;
  title = '';
  remarkLengthLimit = 100;
  records = [];
  currentStatus = '';
  actuallyAmount = null;
  financial = false;

  uploader: IEleUploaderOptions = {
    width: 100,
    maxCount: 3,
    // 图片尺寸限制 10mb 以下
    maxSize: 10 * 1024,
    multiple: true,
    immediate: true
  };

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    this.data_ = val;
    this.loading = true;
  }
}
</script>

<style lang="scss" scoped>
.prepaid-audit {
}
</style>
