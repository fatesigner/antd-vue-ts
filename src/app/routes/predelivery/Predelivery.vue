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
          <div class="vui-row vui-row-offset vui-row-wrap">
            <div class="vui-col-auto">
              <el-input
                class="vui-mr10"
                v-model="table.query.orderNo"
                placeholder="输入单号..."
                style="width: 200px;"
                title=""
                clearable
                @change="table.onQueryChange(currentContext)"
              />
            </div>
            <div class="vui-col-auto">
              <el-input
                class="vui-mr10"
                v-model="table.query.keyword"
                placeholder="输入关键字..."
                style="width: 200px;"
                title=""
                clearable
                @change="table.onQueryChange(currentContext)"
              />
            </div>
            <div class="vui-col-auto">
              <el-button type="primary" @click="table.onQueryChange(currentContext)">搜索</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </template>
    <ele-table
      :columns="table.columns"
      :data="table.result.data"
      :loading="table.loading"
      :total.sync="table.result.totalCount"
      :page-no.sync="table.query.pageNo"
      :page-size.sync="table.query.pageSize"
      :refresher="true"
      @request="table.onRequest($event, currentContext)"
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
      <template v-slot:parentLevelName="{ row }">
        <div v-if="row.agentLevel">级别：{{ row.agentLevel }}级</div>
        <div>姓名：{{ row.receiverName }}</div>
        <div>电话：{{ row.receiverPhone }}</div>
        <div>地址：{{ row.receiverProvice + row.receiverCity + row.receiverRegion + row.receiverDetailAddress }}</div>
        <div v-if="row.companyName">公司：{{ row.companyName }}</div>
      </template>
      <template v-slot:actions="{ row }">
        <el-link v-if="getAuditStatus(row)" type="warning" icon="el-icon-edit-outline" @click="onLook(row)"
          >审核
        </el-link>
        <template v-if="getIsExport(row)">
          <el-link type="success" icon="el-icon-download" @click="exportExcel(row)">导出发货单</el-link>
          <el-upload
            ref="upload"
            action="#"
            accept="application/vnd.ms-excel"
            :show-file-list="false"
            :before-upload="importExcel(row)"
          >
            <el-link slot="trigger" type="primary" icon="el-icon-upload">导入发货单</el-link>
          </el-upload>
        </template>
      </template>
    </ele-table>
    <ele-lazy-dialog
      :visible.sync="auditDialog.visible"
      :title="auditDialog.title"
      :comp="auditDialog.comp"
      :events="auditDialog.events"
      :close-on-click-modal="auditDialog.closeOnClickModal"
      :props="{ data: auditDialog.data, audioStatus: auditDialog.auditStatus }"
      @close="auditDialog.onClose(currentContext)"
    />
    <ele-lazy-dialog
      :visible.sync="deliveryDialog.visible"
      :title="deliveryDialog.title"
      :comp="deliveryDialog.comp"
      :events="deliveryDialog.events"
      :close-on-click-modal="deliveryDialog.closeOnClickModal"
      :props="{ data: deliveryDialog.data, items: deliveryDialog.items, errors: deliveryDialog.errors }"
      @close="deliveryDialog.onClose(currentContext)"
      @done="deliveryDialog.onDone(currentContext)"
    />
  </layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

import { IEleTableOperationData } from '../../../lib/element-ui-helper/components/table';

import { Layout } from '../../layout';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import { AgentLevel, AgentType, CheckedStatus, ReceiverType, Role, ShipType } from '../../global';

@Component({
  name: 'Prepaid',
  components: {
    Layout,
    RadioButtons
  }
})
export default class extends Vue {
  get currentContext() {
    return this;
  }

  CheckedStatus = CheckedStatus;
  ShipType = ShipType;
  ReceiverType = ReceiverType;

  table: IEleTableOperationData = {
    loading: false,
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
        width: 260
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
      { label: '操作', name: 'actions', width: 120, fixed: 'right' }
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
      totalCount: 0,
      data: []
    },
    onQueryChange(currentContext) {
      this.query.pageNo = 1;
      this.loadData(currentContext);
    },
    onRequest(requestData, currentContext) {
      if (requestData.type === 'GET') {
        this.query.pageNo = requestData.params.pageNo;
        this.query.pageSize = requestData.params.pageSize;
        this.loadData(currentContext);
      }
    },
    loadData(currentContext) {
      const params: any = {
        pageNo: this.query.pageNo,
        pageSize: this.query.pageSize,
        orderNo: this.query.orderNo,
        listOrderStatus: [1, 2, 3, 4, 5, 6],
        ...this.query.radioButtons.result
      };
      if (!IsNullOrUndefined(this.query.keyword)) {
        if (IsNumber(this.query.keyword)) {
          params.phone = this.query.keyword;
        } else {
          params.agentName = this.query.keyword || null;
        }
      }
      this.loading = true;
      return ApiService.order_page(params)
        .then((res: any) => {
          if (res && res.rows) {
            this.result.data = res.rows;
            this.result.totalCount = res.totalCount;
          } else {
            this.result.data = [];
            this.result.totalCount = 0;
          }
        })
        .catch((err) => {
          currentContext.$notify.error(err.message);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  };

  auditDialog = {
    comp: () => import('./PredeliveryAudit.vue'),
    visible: false,
    title: '',
    data: null,
    auditStatus: null,
    events: ['close'],
    closeOnClickModal: false,
    onClose(currentContext) {
      this.visible = false;
      currentContext.table.loadData();
    }
  };

  deliveryDialog = {
    comp: () => import('./PredeliveryConfirm.vue'),
    visible: false,
    title: '发货确认',
    data: null,
    items: [],
    errors: [],
    auditStatus: null,
    events: ['close'],
    closeOnClickModal: false,
    onClose(currentContext) {
      this.visible = false;
      currentContext.table.loadData();
    },
    onDone() {}
  };

  created() {
    this.table.loadData(this);
    // 获取 radio 选项
    ApiService.order_statistics(this.getListOrderStatus()).then((res) => {
      this.table.query.radioButtons.data = res;
    });
  }

  onRadioButtonsChange(res) {
    this.table.query.pageNo = 1;
    this.table.query.radioButtons.result = res;
    this.table.loadData(this);
  }

  // 点击查看
  onLook(row) {
    this.auditDialog.title = '查看详情';
    this.auditDialog.visible = true;
    this.auditDialog.data = row;
    this.auditDialog.auditStatus = this.getAuditStatus(row);
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

  // 判断指定订单的状态是否需要审核
  getAuditStatus(row) {
    return (
      (SessionService.user.roles.indexOf(Role.enum.sale_commissioner) > -1 &&
        (row.orderStatus == 0 || row.orderStatus == 1)) ||
      (SessionService.user.roles.indexOf(Role.enum.sale_financial) > -1 && row.orderStatus == 2) ||
      // || (this.userType === 'warehouse' && row.orderStatus == 3)
      (SessionService.user.roles.indexOf(Role.enum.sale_operate) > -1 &&
        (row.orderStatus == 1 || row.orderStatus == 2 || row.orderStatus == 3))
    );
  }

  // 判断是否有发货权限
  getIsExport(row) {
    return (
      SessionService.user.roles.indexOf(Role.enum.sale_warehouse) > -1 && row.checkStatus == 13 && row.orderStatus == 3
    );
  }

  // 导入发货单
  importExcel(row) {
    return (file) => {
      ApiService.order_check_ship(file, row.id)
        .then((res: any) => {
          if (!res.errorSet.length) {
            this.$notify.success('发货单校验成功');
          }
          this.deliveryDialog.data = row;
          this.deliveryDialog.items = res.orderDtos;
          this.deliveryDialog.errors = res.errorSet;
          this.deliveryDialog.visible = true;
        })
        .catch((err) => {
          this.$notify.error(err.message);
        });
      return false;
    };
  }

  // 导出发货单
  exportExcel(row) {
    ApiService.order_single(row.id, row.receiveType, row.orderNo).catch((err) => {
      this.$notify.error(err.message);
    });
  }
}
</script>
