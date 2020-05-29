<template>
  <layout class="mitigate-settings">
    <el-button class="vui-mb10" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
    <ele-table
      :columns="table.columns"
      :data="table.result.data"
      :loading="table.result.loading"
      :total.sync="table.result.totalCount"
      :page-no.sync="table.query.pageNo"
      :page-size.sync="table.query.pageSize"
      :refresher="true"
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
      :props="{ data: actionDialog.data }"
      @close="actionDialog.onClose(context)"
    />
  </layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IEleTableOperationData } from '../../../lib/element-ui-helper/components/table';

import { Layout } from '../../layout';
import { ApiService } from '../../services/api.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  name: 'Production',
  components: {
    Layout
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
      { label: '产品名', name: 'productName', width: 160 },
      { label: '产品版本', name: 'productVersion', width: 160 },
      {
        label: '产品价格',
        name: 'salesPrice',
        width: 160,
        template: (row) => {
          return `${CurrencyPipe(row.salesPrice)}`;
        }
      },
      { label: '操作', name: 'actions', width: 160, fixed: 'right' }
    ],
    query: {
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
        pageSize: this.query.pageSize
      };
      this.loading = true;
      return ApiService.product_page(params)
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
    comp: () => import('./ProductionForm.vue'),
    visible: false,
    title: '',
    data: null,
    auditStatus: null,
    events: ['close'],
    closeOnClickModal: false,
    onClose(context) {
      this.visible = false;
      context.loadData();
    }
  };

  created() {
    this.table.loadData(this);
  }

  add() {
    this.actionDialog.visible = true;
  }

  update(row) {
    this.actionDialog.data = row;
    this.actionDialog.visible = true;
  }

  remove(row) {
    ApiService.product_delete(row.id)
      .then(() => {
        this.$notify.success('删除成功！');
        this.table.loadData(this);
      })
      .catch((err) => {
        this.$notify.error(err.message);
      })
      .finally(() => {});
  }
}
</script>
