<template>
  <div class="pagination" v-if="total">
    <el-pagination
      :background="background"
      v-model="pageNo_"
      :total="total"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :pager-count="pageMax"
      :layout="layout"
      :hide-on-single-page="false"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'ElePagination'
})
export default class extends Vue {
  @Prop({ default: 0 }) total: number;
  @Prop({ default: 1 }) pageNo: number;
  @Prop({ default: 20 }) pageSize: number;
  @Prop({ default: false }) background: boolean;
  @Prop({ default: 'prev, pager, next' }) layout: string;
  @Prop({
    default: () => {
      return [10, 20, 30, 50, 100, 200, 300];
    }
  })
  pageSizes: number[];

  @Prop({ default: 5 }) pageMax: number;

  pageNo_: number = this.pageNo;
  pageSize_: number = this.pageSize;

  @Watch('pageNo')
  onPageNoChange(val) {
    this.pageNo_ = val;
  }

  @Watch('pageNo_')
  onPageNoChange_(val) {
    this.$emit('update:pageNo', val);
  }

  @Watch('pageSize')
  onPageSizeChange(val) {
    this.pageSize_ = val;
  }

  @Watch('pageSize_')
  onPageSizeChange_(val) {
    this.$emit('update:pageSize', val);
  }

  onCurrentChange(e) {
    this.pageNo_ = e;
  }

  onSizeChange(e) {
    this.pageSize_ = e;
  }
}
</script>

<style lang="scss">
.pagination {
  padding: 10px;
  text-align: right;
  overflow: hidden;
}
</style>
