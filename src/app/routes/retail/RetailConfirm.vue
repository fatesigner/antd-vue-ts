<template>
  <div>
    <div class="vui-row vui-justify-content-center">
      <dl class="errors" v-if="errors.length">
        <dt>当前发货单存在如下错误</dt>
        <dd v-for="(item, index) in errors">({{ index + 1 }}) {{ item }}</dd>
      </dl>
    </div>
    <div class="vui-row vui-justify-content-center vui-mt20">
      <div class="vui-col-auto">
        <el-button type="primary" @click="confirm">确 定</el-button>
      </div>
      <div class="vui-col-auto">
        <el-button type="text" @click="close">取消</el-button>
      </div>
    </div>
    <ele-table :columns="table.columns" :data="items" :refresher="false">
      <template v-slot:logisticsCompany="{ row }">
        <div :style="{ color: row['logisticsCompanyError'] ? 'red' : '' }">{{ row.logisticsCompany }}</div>
      </template>
      <template v-slot:serialNumber="{ row }">
        <div :style="{ color: row['serialNumberError'] ? 'red' : '' }">{{ row.serialNumber }}</div>
      </template>
      <template v-slot:logisticsNumber="{ row }">
        <div :style="{ color: row['logisticsNumberError'] ? 'red' : '' }">{{ row.logisticsNumber }}</div>
      </template>
    </ele-table>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IEleTableOperationData } from '../../../lib/element-ui-helper/components/table';

import { ApiService } from '../../services/api.service';
import { ReceiveType } from '../../global';

@Component({
  name: 'RetailConfirm'
})
export default class extends Vue {
  @Prop({ default: () => {} }) data: { [key in string]: any };
  @Prop({ default: () => [] }) items: any[];
  @Prop({ default: () => [] }) errors: any[];

  data_: any = {};

  table: IEleTableOperationData = {
    columns: [
      { label: '订单号', name: 'orderNo', width: 220 },
      { label: '收货人', name: 'receiverName', width: 80 },
      { label: '电话', name: 'receiverPhone', width: 120 },
      { label: '收货地址', name: 'receiverAddress', width: 150 },
      { label: '发货产品', name: 'productName', width: 120 },
      { label: '设备码', name: 'serialNumber', width: 120, fixed: 'right' },
      { label: '快递公司', name: 'logisticsCompany', width: 120, fixed: 'right' },
      { label: '物流单号', name: 'logisticsNumber', width: 120, fixed: 'right' }
    ],
    result: {
      data: []
    }
  };

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    if (val) {
      if (ReceiveType.enum.自取 === val.receiveType) {
        this.table.columns = [
          { label: '订单号', name: 'orderNo', width: 220 },
          { label: '收货人', name: 'receiverName', width: 80 },
          { label: '电话', name: 'receiverPhone', width: 120 },
          { label: '收货地址', name: 'receiverAddress', width: 150 },
          { label: '发货产品', name: 'productName', width: 120 },
          { label: '设备码', name: 'serialNumber', width: 120, fixed: 'right' }
        ];
      } else {
        this.table.columns = [
          { label: '订单号', name: 'orderNo', width: 220 },
          { label: '收货人', name: 'receiverName', width: 80 },
          { label: '电话', name: 'receiverPhone', width: 120 },
          { label: '收货地址', name: 'receiverAddress', width: 150 },
          { label: '发货产品', name: 'productName', width: 120 },
          { label: '设备码', name: 'serialNumber', width: 120, fixed: 'right' },
          { label: '快递公司', name: 'logisticsCompany', width: 120, fixed: 'right' },
          { label: '物流单号', name: 'logisticsNumber', width: 120, fixed: 'right' }
        ];
      }
    }
  }

  confirm() {
    ApiService.order_ship({
      id: this.data.id,
      logisticsCode: this.items[0].logisticsCode,
      logisticsCompany: this.items[0].logisticsCompany,
      logisticsNumber: this.items[0].logisticsNumber,
      serialNumbers: this.items.map((ele) => ele.serialNumber)
    })
      .then(() => {
        this.$emit('done');
      })
      .catch((err) => {
        this.$notify.error(err.message);
      });
  }

  close() {
    this.$emit('close');
  }
}
</script>

<style lang="scss" scoped>
.errors {
  dt {
    margin-bottom: 5px;
    font-size: 14px;
  }

  dd {
    margin-bottom: 5px;
    color: red;
  }
}
</style>
