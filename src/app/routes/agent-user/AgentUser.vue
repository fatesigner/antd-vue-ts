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
          <div class="vui-row vui-row-wrap vui-row-offset">
            <div class="vui-col-auto">
              <el-date-picker
                v-model="table.query.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="table.onQueryChange(currentContext)"
              />
            </div>
            <div class="vui-col-auto">
              <el-input
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
                v-model="table.query.keyword"
                placeholder="输入关键字..."
                style="width: 200px;"
                title=""
                clearable
                @change="table.onQueryChange(currentContext)"
              /><br />
            </div>
            <div class="vui-col-auto">
              <el-button type="primary" @click="table.onQueryChange(currentContext)">搜索</el-button>
            </div>
            <div class="vui-col-auto">
              <el-button type="primary" @click="exportExcel">导出Excel</el-button>
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
      <template slot="receive" slot-scope="{ row }">
        <div>级别：{{ row.agentLevel }}级</div>
        <div>姓名：{{ row.receiverName }}</div>
        <div>电话：{{ row.receiverPhone }}</div>
        <div>地址：{{ row.receiverProvice + row.receiverCity + row.receiverRegion + row.receiverDetailAddress }}</div>
        <div v-if="row.companyName">公司：{{ row.companyName }}</div>
      </template>
      <template v-slot:recommend="{ row }">
        姓名：{{ row.recommAgentName }}<br />
        姓名：{{ row.recommAgentLevel }}级<br />
        类型：{{ AgentType.desc[row.applySource] }}
      </template>
      <template v-slot:recommends="{ row }">
        <div v-if="row.parentAgentLevel != 9">
          <div>姓名：{{ row.parentAgentName }}</div>
          <div>级别：{{ row.parentAgentLevel }}级</div>
          <div>类型：{{ AgentType.desc[row.applySource] }}</div>
        </div>
        <div v-else>内部销售没有上级</div>
      </template>
      <template v-slot:status="{ row }">
        <div>{{ row.statusName }}</div>
        <div v-if="row.status == 2" style="color: #598416;">
          {{ row.assessTotalDays - row.agoDays }}/{{ row.assessTotalDays }}天
        </div>
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
        <el-link type="primary" @click="onLook(row)">查看详情</el-link>
        <el-link
          v-if="row.status !== 9 && row.agentLevel == 4"
          type="warning"
          icon="el-icon-edit-outline"
          @click="onDemotion(row)"
          >降级</el-link
        >
      </template>
    </ele-table>
    <ele-lazy-dialog
      :visible.sync="detailDialog.visible"
      :title="detailDialog.title"
      :comp="detailDialog.comp"
      :events="detailDialog.events"
      :close-on-click-modal="detailDialog.closeOnClickModal"
      :props="{ data: detailDialog.data }"
      @close="detailDialog.onClose(currentContext)"
    />
    <ele-lazy-dialog
      :visible.sync="demotionDialog.visible"
      :title="demotionDialog.title"
      :comp="demotionDialog.comp"
      :events="demotionDialog.events"
      :close-on-click-modal="demotionDialog.closeOnClickModal"
      :props="{ data: demotionDialog.data }"
      @close="demotionDialog.onClose(currentContext)"
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
import { DateFormatPipe, DateFormatPipeKey } from '../../pipes/date-format.pipe';

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

  AgentType = AgentType;
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
      { label: '代理商', name: 'receive', width: '200' },
      {
        label: '账户余额',
        name: 'currentAmount',
        width: '150',
        template: (row) => {
          return `${CurrencyPipe(row.currentAmount)}`;
        }
      },
      {
        label: '返利余额',
        name: 'currentRebateAmount',
        width: '150',
        template: (row) => {
          return `${CurrencyPipe(row.monthRebateAmount)}<br/>月度返利<br/>${CurrencyPipe(
            row.recommendRebateAmount
          )}<br/>推荐返利`;
        }
      },
      {
        label: '总返利',
        name: 'rebateAmount',
        width: 100,
        template: (row) => {
          return `${CurrencyPipe(row.rebateAmount)}<br />共${row.rebateNumbers}次`;
        }
      },
      {
        label: '总提现',
        name: 'pickAmount',
        width: 100,
        template: (row) => {
          return `${CurrencyPipe(row.pickAmount)}<br />共${row.pickNumbers}次`;
        }
      },
      {
        label: '总充值',
        name: 'rechargeAmount',
        width: 100,
        template: (row) => {
          return `${CurrencyPipe(row.rechargeAmount)}<br />共${row.rechargeNumbers}次`;
        }
      },
      { label: '总推荐', name: 'recommendCountNumbers', width: '100' },
      { label: '总进货', name: 'incomeNum', width: '100' },
      { label: '总出货', name: 'outNum', width: '100' },
      {
        label: '总销售额',
        name: 'totalSales',
        width: '100',
        template: (row) => {
          return `${CurrencyPipe(row.totalSales)}`;
        }
      },
      { label: '下级', name: 'totalSubs', width: '100' },
      { label: '推荐人/级别', name: 'recommend', width: '120' },
      { label: '当前上级/级别', name: 'recommends', width: '120' },
      { label: '当前状态', name: 'status', width: 120 },
      { label: '操作', name: 'actions', width: 120, fixed: 'right' }
    ],
    query: {
      radioButtons: {
        rows: [
          {
            label: '代理商类型',
            name: 'agentType',
            value: null,
            options: AgentType.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
          },
          {
            label: '代理商级别',
            name: 'agentLevel',
            value: null,
            options: AgentLevel.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
          },
          {
            label: '代理状态',
            name: 'status',
            value: null,
            options: [
              { label: '正常', value: 5, count: 0 },
              { label: '免考期', value: 1, count: 0 },
              { label: '考核期', value: 6, count: 0 },
              { label: '预警', value: 3, count: 0 },
              { label: '未完成', value: 4, count: 0 }
            ]
          },
          {
            label: '申请来源',
            name: 'source',
            value: null,
            options: [
              { label: '公司', value: 1, count: 0 },
              { label: '代理商', value: 2, count: 0 }
            ]
          }
        ],
        data: null,
        result: null
      },
      keyword: null,
      rechargeNo: null,
      timeRange: null,
      pageNo: 1,
      pageSize: 10
    },
    result: {
      totalCount: 0,
      data: []
    },
    onQueryChange() {
      this.query.pageNo = 1;
      this.loadData();
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
        startTime: this.query.timeRange && this.query.timeRange.length ? DateFormatPipe(this.query.timeRange[0]) : null,
        endTime:
          this.query.timeRange && this.query.timeRange.length > 1 ? DateFormatPipe(this.query.timeRange[1]) : null,
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
      return ApiService.agent_temp_page(params)
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

  detailDialog = {
    comp: () => import('./AgentDetail.vue'),
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

  demotionDialog = {
    comp: () => import('./AgentDemotion.vue'),
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
    ApiService.agent_temp_statistics([]).then((res) => {
      this.table.query.radioButtons.data = res;
    });
  }

  onRadioButtonsChange(res) {
    this.table.query.pageNo = 1;
    this.table.query.radioButtons.result = res;
    this.table.loadData(this);
  }

  // 点击查看详情
  onLook(row) {
    this.detailDialog.title = '查看详情';
    this.detailDialog.visible = true;
    this.detailDialog.data = row;
    this.detailDialog.auditStatus = this.getAuditStatus(row);
  }

  onDemotion(row) {
    this.demotionDialog.title = '降级';
    this.demotionDialog.visible = true;
    this.demotionDialog.data = row;
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

  exportExcel() {}
}
</script>
