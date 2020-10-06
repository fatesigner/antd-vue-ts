<template>
  <div class="pagination">
    <a-pagination
      show-size-changer
      show-quick-jumper
      v-model="pageNo_"
      :page-size.sync="pageSize_"
      :page-size-options="pageSizes"
      :hide-on-single-page="false"
      :show-total="(total, range) => `${range[0]}-${range[1]} / ${total}`"
      :size="size"
      :total="total"
      :default-current="1"
      :default-page-size="10"
      @change="onCurrentChange"
    />
  </div>
</template>

<script lang="ts">
import { Pagination } from 'ant-design-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

Vue.use(Pagination);

@Component({
  name: 'AsPagination'
})
export default class extends Vue {
  @Prop({ default: 0 }) total: number;
  @Prop({ default: 1 }) pageNo: number;
  @Prop({ default: 20 }) pageSize: number;
  @Prop({ default: 'small' }) size: string;
  @Prop({ default: false }) background: boolean;
  @Prop({ default: 'prev, pager, next' }) layout: string;
  @Prop({
    default: () => {
      return ['10', '20', '30', '50', '100', '200', '300'];
    }
  })
  pageSizes: string[];

  @Prop({ default: 5 }) pageMax: number;

  pageNo_: number = 1;
  pageSize_: number = 20;

  @Watch('pageNo', {
    immediate: true
  })
  onPageNoChange(val: number) {
    this.pageNo_ = val;
  }

  @Watch('pageNo_')
  onPageNoChange_(val: number) {
    if (this.pageNo !== val) {
      this.$emit('update:pageNo', val);
      this.$nextTick(() => {
        this.$emit('pageNoChange', val);
      });
    }
  }

  @Watch('pageSize', {
    immediate: true
  })
  onPageSizeChange(val: number) {
    this.pageSize_ = val;
  }

  @Watch('pageSize_')
  onPageSizeChange_(val: number) {
    if (this.pageSize !== val) {
      this.$emit('update:pageSize', val);
      this.$nextTick(() => {
        this.$emit('pageSizeChange', val);
      });
    }
  }

  onCurrentChange(e: any) {
    this.pageNo_ = e;
  }
}
</script>

<style lang="scss">
.pagination {
  overflow: hidden;
  text-align: right;

  .el-pagination {
    padding: 0;
    white-space: normal;

    > * {
      margin-top: 4px !important;
      margin-bottom: 4px !important;
    }
  }
}
</style>
