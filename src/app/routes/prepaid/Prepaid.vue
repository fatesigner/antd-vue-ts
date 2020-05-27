<template>
  <layout>
    <template slot="toolbar">
      <radio-buttons
        v-for="item in radioButtons"
        :key="item.name"
        :label.sync="item.label"
        :model.sync="item.value"
        :options="item.options"
        @update:model="onRadioButtonsChange"
      />
    </template>
    <ele-table
      :columns="table.columns"
      :data="table.result.data"
      :indexed="true"
      :loading="table.result.loading"
      :total.sync="table.result.totalCount"
      :page-no.sync="table.query.pageNo"
      :page-size.sync="table.query.pageSize"
      @request="table.onRequest"
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
      class="action-dialog"
      :title="actionDialog.title"
      :visible.sync="actionDialog.visible"
      :props="{ data: actionDialog.data }"
      :comp="actionDialog.comp"
    />
  </layout>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

import { Layout } from '../../layout';
import { SessionService } from '../../services/session.service';
import { ApiService } from '../../services/api.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import { AgentLevel, AgentType, CheckedStatus, PaidStatus, PaymentType, RechargeType, Role } from '../../global';
import { ITable } from '../../../lib/element-ui-helper/components/table';

@Component({
  name: 'Prepaid',
  components: {
    Layout,
    RadioButtons
  }
})
export default class extends Vue {
  CheckedStatus = CheckedStatus;

  table: ITable = {
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
      radioButtons: [
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
      keyword: null,
      orderNo: null,
      pageNo: 1,
      pageSize: 10
    },
    result: {
      loading: false,
      totalCount: 0,
      data: []
    },
    onRequest(requestData) {
      if (requestData.type === 'GET') {
        this.table.query.pageNo = requestData.type.pageNo;
        this.table.query.pageSize = requestData.params.pageSize;
        this.loadData();
      }
    },
    loadData() {

    }
  };

  actionDialog = {
    comp: () => import('./PrepaidAudit.vue'),
    visible: false,
    title: '',
    data: null,
    auditStatus: null
  };

  @Watch('radioButtons')
  onRadioButtonsChange() {
    this.table.query.pageNo = 1;
    this.loadData();
  }

  onRequest(request) {
  }

  created() {
    this.loadData();
    // 获取 radio 选项
    ApiService.agentAccountFlow_statistics().then((res) => {
      if (res) {
        this.table.query.radioButtons.forEach((item) => {
          if (Object.prototype.hasOwnProperty.call(res, item.name)) {
            res[item.name].forEach((item2) => {
              const _index = item.options.findIndex((x) => x.value == item2.code);
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

  // 点击查看
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

  loadData() {
    let params: any = {};
    if (!IsNullOrUndefined(this.table.query.keyword)) {
      if (IsNumber(this.table.query.keyword)) {
        params.phone = this.table.query.keyword;
      } else {
        params.agentName = this.table.query.keyword || null;
      }
    }
    params = this.table.query.radioButtons.reduce((prev, cur) => {
      prev[cur.name] = cur.value;
      return prev;
    }, params);
    this.table.result.loading = true;
    return ApiService.agentAccountFlow_page({
      pageNo: this.table.query.pageNo,
      pageSize: this.table.query.pageSize,
      rechargeNo: this.table.query.keyword,
      ...params
    })
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
