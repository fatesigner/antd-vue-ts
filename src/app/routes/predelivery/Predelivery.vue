<template>
  <layout>
    <template slot="toolbar">
      <el-form label-width="80px">
        <radio-buttons
          :rows="table.query.radioButtons.rows"
          :data="table.query.radioButtons.data"
          @change="onRadioButtonsChange"
        />
        <el-form-item label="筛选">
          <el-input
            class="vui-mr10"
            v-model="table.query.orderNo"
            placeholder="输入充值单号..."
            style="width: 200px;"
            title=""
            clearable
            @change="onQueryChange"
          />
          <el-input
            class="vui-mr10"
            v-model="table.query.keyword"
            placeholder="输入关键字..."
            style="width: 200px;"
            title=""
            clearable
            @change="onQueryChange"
          />
          <el-button type="primary" @click="onQueryChange">搜索</el-button>
        </el-form-item>
      </el-form>
    </template>
    <ele-table
      :columns="table.columns"
      :data="table.result.data"
      :indexed="true"
      :loading="table.result.loading"
      :total.sync="table.result.totalCount"
      :page-no.sync="table.query.pageNo"
      :page-size.sync="table.query.pageSize"
      @request="onRequest"
    >
      <template v-slot:agentName="{ row }">
        <div class="vui-pt10 vui-pb10">
          {{ row.agentName }}&nbsp;&nbsp;&nbsp;&nbsp;{{ row.levelName }}<br />
          {{ row.phone }}<br />
          <p class="vui-g9">{{ row.createTime | dateFormat }}</p>
          <p class="vui-g9">单号：{{ row.orderNo }}</p>
        </div>
      </template>
      <template v-slot:order="{ row }">
        订单号：{{ row.orderNo }}<br />
        申请时间：{{ row.createTime }}<br />
        发货类型：{{ ShipType.desc[row.shipType] }}<br />
        收货类型：{{ ReceiverType.desc[row.receiverType] }}<br />
      </template>
      <template v-slot:checkStatus="{ row }">
        <div :class="{ completed: row.checkStatus === CheckedStatus.enum.completed }">
          {{ CheckedStatus.desc[row.checkStatus] }}
        </div>
        <div v-if="row.updateBy">
          <div v-if="row.checkStatus === CheckedStatus.enum.completed">审核人；{{ row.updateBy }}</div>
          <div v-if="row.checkStatus === CheckedStatus.enum.canceled">取消人；{{ row.updateBy }}</div>
        </div>
        <div v-if="row.updateTime">{{ row.updateTime | dateFormat }}</div>
      </template>
      <template v-slot:actions="{ row }">
        <el-link v-if="getAuditStatus(row)" type="warning" icon="el-icon-edit-outline" @click="onLook(row)"
          >审核
        </el-link>
        <el-link v-else type="primary" @click="onLook(row)">查看</el-link>
      </template>
    </ele-table>
    <ele-lazy-dialog
      class="action-dialog"
      :title="actionDialog.title"
      :visible.sync="actionDialog.visible"
      :props="{ data: actionDialog.data, audioStatus: actionDialog.auditStatus }"
      :comp="actionDialog.comp"
      :close-on-click-modal="false"
      :events="{ close: onDialogClose }"
    />
  </layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

import { ITableOperationData } from '../../../lib/element-ui-helper/components/table';

import { Layout } from '../../layout';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import {
  AgentLevel,
  AgentType,
  CheckedStatus,
  PaidStatus,
  PaymentType,
  ReceiverType,
  Role,
  ShipType
} from '../../global';

@Component({
  name: 'Prepaid',
  components: {
    Layout,
    RadioButtons
  }
})
export default class extends Vue {
  CheckedStatus = CheckedStatus;
  ShipType = ShipType;
  ReceiverType = ReceiverType;

  table: ITableOperationData = {
    columns: [
      {
        label: '序号',
        name: 'id',
        width: 50,
        fixed: true,
        template: (row, index) => {
          return index + 1;
        }
      },
      { label: '订单', name: 'order', width: 220 },
      {
        label: '订购产品',
        name: 'productName',
        width: 120,
        template: (row) => {
          return `${row.itemDTOS.length ? row.itemDTOS[0].productName : ''}`;
        }
      },
      {
        label: '数量（台）',
        name: 'number',
        width: 120,
        template: (row) => {
          return `x${row.itemDTOS.length ? row.itemDTOS[0].number : ''}`;
        }
      },
      {
        label: '单价',
        name: 'price',
        width: 120,
        template: (row) => {
          return `${CurrencyPipe(row.itemDTOS.length ? row.itemDTOS[0].productPrice : '')}`;
        }
      },
      {
        label: '总价',
        name: 'totalAmount',
        width: 150,
        template: (row) => {
          return `${CurrencyPipe(row.itemDTOS.length ? row.itemDTOS[0].totalAmount : '')}`;
        }
      },
      {
        label: '订货人/收货信息',
        name: 'parentLevelName',
        width: 180
      },
      {
        label: '发货方式',
        name: 'shipType',
        width: 150,
        fixed: 'right',
        template: (row) => {
          return `${ShipType.desc[row.shipType]}`;
        }
      },
      {
        label: '订单状态',
        name: 'checkStatusName',
        width: 150,
        fixed: 'right'
      },
      { label: '操作', name: 'actions', width: 80, fixed: 'right' }
    ],
    query: {
      radioButtons: {
        rows: [
          {
            label: '类型',
            name: 'agentType',
            value: null,
            options: AgentType.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
          },
          {
            label: '级别',
            name: 'agentLevel',
            value: null,
            options: AgentLevel.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
          },
          {
            label: '状态',
            name: 'orderStatus',
            value: null,
            options: [
              { label: '专审', value: 1, count: 0 },
              { label: '公审', value: 2, count: 0 },
              { label: '仓储', value: 3, count: 0 },
              { label: '物流', value: 4, count: 0 },
              { label: '已完成', value: 5, count: 0 },
              { label: '已取消', value: 6, count: 0 }
            ]
          }
        ],
        data: null,
        result: null
      },
      keyword: null,
      orderNo: null,
      pageNo: 1,
      pageSize: 10
    },
    result: {
      loading: false,
      totalCount: 0,
      data: []
    }
  };

  actionDialog = {
    comp: () => import('./PrepaidAudit.vue'),
    visible: false,
    title: '',
    data: null,
    auditStatus: null
  };

  onDialogClose() {
    this.loadData();
    this.actionDialog.visible = false;
  }

  onQueryChange() {
    this.table.query.pageNo = 1;
    this.loadData();
  }

  onRadioButtonsChange(res) {
    this.table.query.pageNo = 1;
    this.table.query.radioButtons.result = res;
    this.loadData();
  }

  onRequest(requestData) {
    if (requestData.type === 'GET') {
      this.table.query.pageNo = requestData.params.pageNo;
      this.table.query.pageSize = requestData.params.pageSize;
      this.loadData();
    }
  }

  async created() {
    this.loadData();
    // 获取 radio 选项
    this.table.query.radioButtons.data = await ApiService.order_statistics(this.getListOrderStatus());
  }

  // 点击查看
  onLook(row) {
    this.actionDialog.title = '查看详情';
    this.actionDialog.visible = true;
    this.actionDialog.data = row;
    this.actionDialog.auditStatus = this.getAuditStatus(row);
  }

  getListOrderStatus() {
    let listOrderStatus = [1, 2, 3, 4, 5, 6];
    if (SessionService.user.roles.indexOf(Role.enum.sale_commissioner) > -1) {
      listOrderStatus = [1, 4, 5, 6];
    } else if (SessionService.user.roles.indexOf(Role.enum.sale_financial) > -1) {
      listOrderStatus = [2, 4, 5, 6];
    } else if (SessionService.user.roles.indexOf(Role.enum.sale_warehouse) > -1) {
      listOrderStatus = [3, 4, 5, 6];
    }
    return listOrderStatus;
  }

  // 判断指定订单的状态是否为专员或者财务待审核
  getAuditStatus(row) {
    if (
      SessionService.user.roles.indexOf(Role.enum.sale_commissioner) > -1 &&
      (row.checkStatus == 1 || row.checkStatus == 14) &&
      row.status == 2 &&
      row.receiverId == 1
    ) {
      return 1;
    } else if (
      SessionService.user.roles.indexOf(Role.enum.sale_financial) > -1 &&
      row.checkStatus == 11 &&
      row.status == 2 &&
      row.receiverId == 1
    ) {
      return 2;
    }
    return 2;
  }

  loadData() {
    const params: any = {
      pageNo: this.table.query.pageNo,
      pageSize: this.table.query.pageSize,
      orderNo: this.table.query.orderNo,
      listOrderStatus: [1, 2, 3, 4, 5, 6],
      ...this.table.query.radioButtons.result
    };
    if (!IsNullOrUndefined(this.table.query.keyword)) {
      if (IsNumber(this.table.query.keyword)) {
        params.phone = this.table.query.keyword;
      } else {
        params.agentName = this.table.query.keyword || null;
      }
    }
    this.table.result.loading = true;
    return ApiService.order_page(params)
      .then((res: any) => {
        if (res && res.rows) {
          this.table.result.data = res.rows;
          this.table.result.totalCount = res.totalCount;
        } else {
          this.table.result.data = [];
          this.table.result.totalCount = 0;
        }
      })
      .finally(() => {
        this.table.result.loading = false;
      });
  }
}
</script>

<style lang="scss" scoped></style>
