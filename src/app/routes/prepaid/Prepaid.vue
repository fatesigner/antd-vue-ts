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
                v-model="table.query.rechargeNo"
                placeholder="输入充值单号..."
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
          <p class="vui-g9">单号：{{ row.rechargeNo }}</p>
        </div>
      </template>
      <template v-slot:parentLevelName="{ row }">
        级别：{{ row.levelName }}<br />
        姓名：{{ row.parentName }}<br />
        电话：{{ row.parentPhone }}
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
      :visible.sync="actionDialog.visible"
      :title="actionDialog.title"
      :comp="actionDialog.comp"
      :events="actionDialog.events"
      :close-on-click-modal="actionDialog.closeOnClickModal"
      :props="{ data: actionDialog.data, audioStatus: actionDialog.auditStatus }"
      @close="actionDialog.onClose(currentContext)"
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
import { AgentLevel, AgentType, CheckedStatus, PaidStatus, PaymentType, RechargeType, Role } from '../../global';

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
      { label: '提交人', name: 'agentName', width: 200 },
      { label: '充值项', name: 'title', width: 150 },
      {
        label: '充值金额',
        name: 'actualAmount',
        width: 150,
        template: (row) => {
          return `${CurrencyPipe(row.actualAmount)}`;
        }
      },
      {
        label: '充值方式',
        name: 'payType',
        width: 100,
        template: (row) => {
          return `${PaymentType.desc[row.payType]}`;
        }
      },
      {
        label: '充值后可用金额',
        name: 'handleAmount',
        width: 150,
        template: (row) => {
          return `${CurrencyPipe(row.handleAmount)}`;
        }
      },
      {
        label: '当前审核人/上级',
        name: 'parentLevelName',
        width: 180
      },
      {
        label: '订单状态',
        name: 'checkStatus',
        width: 150,
        fixed: 'right',
        template: (row) => {
          return `${PaidStatus.desc[row.status]}`;
        }
      },
      { label: '操作', name: 'actions', width: 80, fixed: 'right' }
    ],
    query: {
      radioButtons: {
        rows: [
          {
            label: '用户类型',
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
            name: 'status',
            value: null,
            options: PaidStatus.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
          },
          {
            label: '充值类型',
            name: 'rechargeType',
            value: null,
            options: RechargeType.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
          }
        ],
        data: null,
        result: null
      },
      keyword: null,
      rechargeNo: null,
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
        rechargeNo: this.query.rechargeNo,
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
      return ApiService.agentAccountFlow_page(params)
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

  actionDialog = {
    comp: () => import('./PrepaidAudit.vue'),
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

  created() {
    this.table.loadData(this);
    // 获取 radio 选项
    ApiService.agentAccountFlow_statistics().then((res) => {
      this.table.query.radioButtons.data = res;
    });
  }

  onRadioButtonsChange(res) {
    this.table.query.pageNo = 1;
    this.table.query.radioButtons.result = res;
    this.table.loadData(this);
  }

  // 点击审核、查看
  onLook(row) {
    this.actionDialog.title = '查看详情';
    this.actionDialog.visible = true;
    this.actionDialog.data = row;
    this.actionDialog.auditStatus = this.getAuditStatus(row);
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
    return null;
  }
}
</script>
