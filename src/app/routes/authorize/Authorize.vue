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
            @change="table.onQueryChange(currentContext)"
          />
          <el-input
            class="vui-mr10"
            v-model="table.query.keyword"
            placeholder="输入关键字..."
            style="width: 200px;"
            title=""
            clearable
            @change="table.onQueryChange(currentContext)"
          />
          <el-button type="primary" @click="table.onQueryChange(currentContext)">搜索</el-button>
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
          {{ row.agentName }} {{ row.levelName }}<br />
          {{ row.phone }}<br />
          <p class="vui-g9">{{ row.createTime | dateFormat }}</p>
        </div>
      </template>
      <template v-slot:parentLevelName="{ row }">
        级别：{{ row.paramAgentName }}<br />
        姓名：{{ row.paramLevelName }}<br />
        电话：{{ row.paramPhone }}
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
        <el-link v-if="true || getAuditStatus(row)" type="warning" icon="el-icon-edit-outline" @click="onLook(row)"
          >审核
        </el-link>
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
import { AgentLevel, AgentType, CheckedStatus, PaidStatus, ReceiverType, Role, ShipType } from '../../global';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

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
      { label: '申请人', name: 'agentName', width: 180 },
      { label: '当前级别', name: 'levelName', width: 120 },
      { label: '当前审核人/上级', name: 'parentLevelName', width: 180 },
      {
        label: '上次授权时间',
        name: 'authorizedTime',
        width: 150,
        template: (row) => {
          return `${row.authorizedTime ? DateFormatPipe(row.authorizedTime) : ''}`;
        }
      },
      {
        label: '状态',
        name: 'checkStatus',
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
            label: '状态',
            name: 'checkStatus',
            value: null,
            options: [
              { label: '待审核', value: 1, count: 0 },
              { label: '已完成', value: 11, count: 0 },
              { label: '已取消', value: 12, count: 0 }
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
        orderNo: this.query.orderNo,
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
      return ApiService.warrant_page(params)
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
    comp: () => import('./AuthorizeAudit.vue'),
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
    ApiService.warrant_statistics().then((res) => {
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

  // 判断指定订单的状态是否需要审核
  getAuditStatus(row) {
    return (
      SessionService.user.roles.indexOf(Role.enum.sale_commissioner) > -1 &&
      (row.orderStatus == 0 || row.orderStatus == 1)
    );
  }
}
</script>
