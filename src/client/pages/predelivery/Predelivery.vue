<template>
  <Layout>
    <radio-buttons
      v-for="item in radioButtons"
      :key="item.title"
      :title.sync="item.title"
      :model.sync="item.value"
      :options="item.options"
      @update:model="onRadioButtonsChange"
    />
    <ele-table
      :data="result.items"
      :columns="columns"
      :indexed="true"
      :loading="result.loading"
      :total.sync="result.totalCount"
      :page-no.sync="query.pageNo"
      :page-size.sync="query.pageSize"
      @request="onRequest"
    ></ele-table>
  </Layout>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

import { ApiService } from '../../api/api';
import { RadioButtons } from '../../components/radio-buttons';
import { DateFormatPipe, DateFormatPipeKey } from '../../pipes/date-format.pipe';
import { EleTable } from '../../lib/element-ui-helper/components/table';
import Layout from '../../layouts/Layout.vue';

@Component({
  name: 'Predelivery',
  components: {
    Layout,
    RadioButtons,
    EleTable
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
      field: '__index',
      name: 'id',
      template: (row, index) => {
        return `${this.query.pageSize * (this.query.pageNo - 1) + 1 + index}`;
      }
    },
    {
      label: '单号/日期',
      field: 'rechargeNo',
      name: 'rechargeNo',
      template: (row, index) => {
        return `<div class="my-table-details">
              ${row.rechargeNo}<br/>
              ${row.createTime}
            </div>`;
      }
    },
    { label: '提交人', field: 'agentName', name: 'agentName' },
    { label: '充值方式', field: 'type', name: 'type' },
    { label: '充值金额', field: 'amount', name: 'amount' },
    { label: '充值状态', field: 'status', name: 'status' },
    { label: '当前审核状态', field: 'checkStatus', name: 'checkStatus' },
    { label: '操作', field: 'id', name: '7' },
    { label: '审核备注', field: 'id', name: '8' }
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
    return ApiService.agentAccountFlowPage({
      pageNo: this.query.pageNo,
      pageSize: this.query.pageSize,
      rechargeNo: this.query.keyword,
      ...params
    })
      .then((res: any) => {
        if (res && res.data.data.rows) {
          // 添加序号
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
    // 获取 radio 选项
    ApiService.agentAccountFlowStatistics().then(res => {
      if (res && res.data) {
        this.radioButtons.forEach(item => {
          if (Object.prototype.hasOwnProperty.call(res.data.data, item.name)) {
            res.data.data[item.name].forEach(item2 => {
              const _index = item.options.findIndex(x => x.value == item2.code);
              if (_index > -1) {
                const _item = item.options[_index];
                _item.count = item2.count;
                Vue.set(item.options, _index, _item);
              }
            });
          }
        });
      }
    });
  }
}
</script>

<style lang="scss">
h2 {
  margin: 30px;
  font-size: 20px;
  text-align: center;
}
</style>
