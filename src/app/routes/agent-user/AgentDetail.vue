<template>
  <div class="vui-row vui-justify-content-center">
    <div class="vui-padding vui-tc" v-if="loading">
      <ele-loading :size="40" />
    </div>
    <div class="vui-col-fluid" v-else>
      <h2>当前代理商状态：正常</h2>
      <ele-table :columns="table1.columns" :data="table1.result.data" />
      <ele-table :columns="table2.columns" :data="table2.result.data" />
      <ele-table :columns="table3.columns" :data="table3.result.data" />
      <ele-table :columns="table4.columns" :data="table4.result.data" />
      <div class="vui-row vui-flex-direction-column vui-tc">
        <figure class="vui-col">
          <figcaption>身份证正面</figcaption>
          <img :src="result.positivePicUrl" alt="" />
        </figure>
        <figure class="vui-col">
          <figcaption>身份证反面</figcaption>
          <img :src="result.reversePicUrl" alt="" />
        </figure>
        <figure class="vui-col">
          <figcaption>营业执照</figcaption>
          <img :src="result.licensePicUrl" alt="" />
        </figure>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IEleUploaderOptions } from '../../../lib/element-ui-helper/components/uploader';

import { AgentLevel, AgentType, CheckedStatus, PaymentType } from '../../global';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { QiniuService } from '../../../lib/qiniu';
import { IEleTableOperationData } from '../../../lib/element-ui-helper/components/table';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

@Component({
  name: 'AgentDetail'
})
export default class extends Vue {
  @Prop({ default: null }) data: any;
  @Prop({ default: null }) audioStatus: number;

  CheckedStatus = CheckedStatus;

  data_: any;
  loading = true;
  result: any = {};

  table1: IEleTableOperationData = {
    columns: [
      {
        label: '申请',
        name: 'application',
        width: 150,
        template: (row) => {
          return `申请：${row.agentLevel}级<br/>姓名：${row.agentName ? row.agentName : row.legalName}<br/>类型：${
            AgentLevel.desc[row.agentLevel]
          }级<br/>`;
        }
      },
      {
        label: '推荐人/级别',
        name: 'recommend',
        width: 150,
        template: (row) => {
          return `姓名：${row.agentLevel}级<br/>级别：${row.agentName ? row.agentName : row.legalName}<br/>类型：${
            AgentLevel.desc[row.agentLevel]
          }级<br/>`;
        }
      },
      {
        label: '推荐人/上级',
        name: 'recommendSuperior',
        width: 150,
        template: (row) => {
          let str = '';
          if (row.recommender.parentAgentName) {
            str += `姓名：${row.recommender.parentAgentName}<br/>`;
          }
          if (row.recommender.parentAgentLevel) {
            str += `级别：${row.recommender.parentAgentLevel}级`;
          } else {
            str += '内部销售没有上级';
          }
          return str;
        }
      },
      {
        label: '当前上级',
        name: 'currentSuperior',
        width: 150,
        template: (row) => {
          let str = '';
          if (row.parentAgentLevel != 9) {
            str += `姓名：${row.parentAgentName}<br/>`;
            str += `级别：${row.parentAgentLevel}级<br/>`;
          } else {
            str += '内部销售没有上级';
          }
          return str;
        }
      }
    ],
    result: {
      data: []
    }
  };

  table2: IEleTableOperationData = {
    columns: [
      { label: '总订货产品', name: 'productName', width: 120 },
      { label: '数量', name: 'incomeNumTotal', width: 120 },
      {
        label: '单价',
        name: 'orderPrice',
        width: 120,
        template: (row) => {
          return `${CurrencyPipe(row.orderPrice)}`;
        }
      },
      {
        label: '总订货额',
        name: 'totalAmount',
        width: 120,
        template: (row) => {
          return `${CurrencyPipe(row.orderPrice * row.incomeNumTotal)}`;
        }
      }
    ],
    result: {
      data: []
    }
  };

  table3: IEleTableOperationData = {
    columns: [
      { label: '总出货产品', name: 'productName' },
      { label: '数量', name: 'outNumTotal' },
      {
        label: '单价',
        name: 'orderPrice',
        template: (row) => {
          return `${CurrencyPipe(row.orderPrice)}`;
        }
      },
      {
        label: '总出货额',
        name: 'totalAmount',
        template: (row) => {
          return `${CurrencyPipe(row.orderPrice * row.outNumTotal)}`;
        }
      }
    ],
    result: {
      data: []
    }
  };

  table4: IEleTableOperationData = {
    columns: [
      { label: '收货人', name: 'receiverName' },
      {
        label: '收货信息',
        name: 'receiveInfo',
        template: (row) => {
          let str = '';
          if (row.legalName) {
            str += `法人：${row.legalName}<br/>`;
          }
          str += `电话：${row.receiverPhone}<br/>`;
          str += `地址：${
            row.receiverProvice + row.receiverCity + row.receiverRegion + row.receiverDetailAddress
          }<br/>`;
          if (row.companyName) {
            str += `公司：${row.companyName}`;
          }
          return str;
        }
      }
    ],
    result: {
      data: []
    }
  };

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    this.data_ = val;
    this.loading = true;
    // 获取详情
    ApiService.agent_temp_detail(this.data_.id, this.data_.orderId)
      .then((res: any) => {
        this.result = res;
        this.table1.result.data = [res];
        this.table2.result.data = res.purchaseList;
        this.table3.result.data = res.shipmentsList;
        this.table4.result.data = [res];
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
h2 {
  padding: 10px 5px;
  font-size: 14px;
}
</style>
