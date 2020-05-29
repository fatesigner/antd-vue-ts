<template>
  <layout>
    <ele-table
      :data="result.items"
      :columns="columns"
      :loading="result.loading"
      :total.sync="result.totalCount"
      :page-no.sync="query.pageNo"
      :page-size.sync="query.pageSize"
      @request="onRequest"
    ></ele-table>
  </layout>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

import { ApiService } from '../../services/api.service';
import { RadioButtons } from '../../shared/radio-buttons';
import { DateFormatPipe, DateFormatPipeKey } from '../../pipes/date-format.pipe';
import { EleTable } from '../../../lib/element-ui-helper/components/table';
import Layout from '../../layout/Layout.vue';

@Component({
  name: 'Inventory.vue',
  components: {
    Layout,
    EleTable,
    RadioButtons
  },
  filters: {
    [DateFormatPipeKey]: DateFormatPipe
  }
})
export default class extends Vue {
  query = {
    keyword: null,
    orderNo: null,
    pageNo: 1,
    pageSize: 10
  };

  result = {
    loading: false,
    items: [],
    totalCount: 0
  };

  radioButtons = [
    {
      title: '审核状态',
      name: 'checkStatus',
      value: null,
      options: [
        { title: '待审', value: 1, count: 0 },
        { title: '完成', value: 2, count: 0 }
      ]
    },
    {
      title: '充值状态',
      name: 'status',
      value: null,
      options: [
        { title: '完成', value: 1, count: 0 },
        { title: '待审', value: 2, count: 0 },
        { title: '取消', value: 3, count: 0 }
      ]
    },
    {
      title: '支付方式',
      name: 'type',
      value: null,
      options: [
        { title: '微信', value: 1, count: 0 },
        { title: '转账', value: 2, count: 0 }
      ]
    }
  ];

  columns = [
    {
      label: '序号',
      name: '__index',
      template: (row, index) => {
        return `${this.query.pageSize * (this.query.pageNo - 1) + 1 + index}`;
      }
    },
    { label: '产品', name: 'productName' },
    { label: '批次', name: 'produceBatch' },
    { label: '生产数（台）', name: 'produceNum' },
    { label: '入库数（台）', name: 'incomeNum' },
    { label: '出库数（台）', name: 'outNum' },
    { label: '当前库存（台）', name: 'currentNum' },
    { label: '当前出库中（台）', name: 'outNumIng' }
  ];

  @Watch('radioButtons')
  onRadioButtonsChange(val) {
    console.log(val);
    this.query.pageNo = 1;
    this.loadData();
  }

  onRequest({ pageNo }) {
    this.query.pageNo = pageNo;
    this.loadData();
  }

  loadData() {
    let params: any = {};
    if (!IsNullOrUndefined(this.query.keyword)) {
      if (IsNumber(this.query.keyword)) {
        params.phone = this.query.keyword;
      } else {
        params.agentName = this.query.keyword || null;
      }
    }
    params = this.radioButtons.reduce((prev, cur) => {
      prev[cur.name] = cur.value;
      return prev;
    }, params);
    this.result.loading = true;
    return ApiService.stock_page({
      pageNo: this.query.pageNo,
      pageSize: this.query.pageSize,
      rechargeNo: this.query.keyword,
      ...params
    })
      .then((res: any) => {
        if (res && res.data.data.rows) {
          this.result.items = res.data.data.rows;
          this.result.totalCount = res.data.data.totalCount;
        } else {
          this.result.items = [];
          this.result.totalCount = 0;
        }
      })
      .finally(() => {
        this.result.loading = false;
      });
  }

  created() {
    this.loadData();
  }
}
</script>

<style lang="scss"></style>
