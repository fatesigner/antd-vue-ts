<template>
  <layout>
    <el-button class="vui-mb10" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
    <ele-table
      :columns="table.columns"
      :data="table.result.data"
      :loading="table.loading"
      :total.sync="table.result.totalCount"
      :page-no.sync="table.query.pageNo"
      :page-size.sync="table.query.pageSize"
      @request="table.onRequest($event, currentContext)"
    >
      <template v-slot:actions="{ row }">
        <el-link type="primary" icon="el-icon-edit-outline" @click="update(row)">编辑</el-link>
        <el-popconfirm
          confirmButtonText="好的"
          cancelButtonText="不用了"
          icon="el-icon-info"
          iconColor="red"
          title="确定删除吗？"
          @onConfirm="remove(row)"
        >
          <el-link type="warning" icon="el-icon-delete" slot="reference">删除</el-link>
        </el-popconfirm>
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
import { IEleTableOperationData } from '../../../lib/element-ui-helper/components/table';

import { Layout } from '../../layout';
import { DerateCondition, DerateStatus, DerateType, PaidStatus } from '../../global';
import { ApiService } from '../../services/api.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  name: 'Mitigate',
  components: {
    Layout,
    RadioButtons
  }
})
export default class extends Vue {
  get currentContext() {
    return this;
  }

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
      {
        label: '减免类型',
        name: 'derateType',
        width: 100,
        template: (row) => {
          return `${DerateType.desc[row.derateType]}`;
        }
      },
      {
        label: '减免条件',
        name: 'derateCondition',
        width: 100,
        template: (row) => {
          return `${DerateCondition.desc[row.derateCondition]}`;
        }
      },
      {
        label: '减免金额',
        name: 'derateMoney',
        width: 150,
        template: (row) => {
          return `${CurrencyPipe(row.derateMoney)}`;
        }
      },
      {
        label: '开始时间',
        name: 'startTime',
        width: 180,
        template: (row) => {
          return `${DateFormatPipe(row.startTime)}`;
        }
      },
      {
        label: '截止时间',
        name: 'endTime',
        width: 180,
        template: (row) => {
          return `${DateFormatPipe(row.endTime)}`;
        }
      },
      {
        label: '状态',
        name: 'status',
        width: 150,
        fixed: 'right',
        template: (row) => {
          return `${row.status ? DerateStatus.desc[row.status] : ''}`;
        }
      },
      { label: '操作', name: 'actions', width: 80, fixed: 'right' }
    ],
    query: {
      pageNo: 1,
      pageSize: 10
    },
    result: {
      totalCount: 0,
      data: []
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
        pageSize: this.query.pageSize
      };
      this.loading = true;
      return ApiService.derate_page(params)
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
    comp: () => import('./MitigateForm.vue'),
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
  }

  add() {
    this.actionDialog.title = '新增减免设置';
    this.actionDialog.data = null;
    this.actionDialog.visible = true;
  }

  update(row) {
    this.actionDialog.title = '编辑减免设置';
    this.actionDialog.data = row;
    this.actionDialog.visible = true;
  }

  remove(row) {
    ApiService.derate_delete(row.id)
      .then(() => {
        this.$notify({
          title: 'success',
          message: '删除成功！',
          type: 'success'
        });
        this.table.loadData(this);
      })
      .catch((err) => {
        this.$notify.error(err.message);
      })
      .finally(() => {});
  }
}
</script>
