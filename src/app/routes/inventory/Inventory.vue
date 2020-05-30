<template>
  <layout>
    <el-button class="vui-mb10" type="primary" icon="el-icon-plus" @click="add">新增批次</el-button>
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
      <template v-slot:actions="{ row }">
        <el-upload ref="upload" action="#" :show-file-list="false" :before-upload="importExcel(row)">
          <el-link type="primary" icon="el-icon-upload">扫码入库</el-link>
        </el-upload>
        <el-link type="success" @click="detail(row)">库存详情</el-link>
        <el-popconfirm
          confirmButtonText="好的"
          cancelButtonText="不用了"
          icon="el-icon-info"
          iconColor="red"
          title="确定删除吗？"
          @onConfirm="remove(row)"
        >
          <el-link type="danger" icon="el-icon-delete" slot="reference">删除</el-link>
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
import { ApiService } from '../../services/api.service';
import { RadioButtons } from '../../shared/radio-buttons';

@Component({
  name: 'Inventory',
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
      { label: '产品', name: 'productName', width: 150 },
      { label: '批次', name: 'produceBatch', width: 150 },
      { label: '生产数（台）', name: 'produceNum', width: 150 },
      { label: '入库数（台）', name: 'incomeNum', width: 150 },
      { label: '出库数（台）', name: 'outNum', width: 150 },
      { label: '当前库存（台）', name: 'currentNum', width: 150 },
      { label: '当前出库中（台）', name: 'outNumIng', width: 150 },
      { label: '操作', name: 'actions', width: 120, fixed: 'right' }
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
      return ApiService.stock_page(params)
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
    comp: () => import('./InventoryForm.vue'),
    visible: false,
    title: '新增批次',
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

  detail() {}

  update(row) {
    this.actionDialog.title = '编辑减免设置';
    this.actionDialog.data = row;
    this.actionDialog.visible = true;
  }

  // 扫码入库
  importExcel(row) {
    return (file) => {
      ApiService.singleProduct_add({
        produceBatch: row.produceBatch,
        produceBatchId: row.produceBatchId,
        productId: row.productId,
        vos: file
      })
        .then((res: any) => {
          if (!res.errorSet.length) {
            this.$notify.success('数据导入成功');
          }
        })
        .catch((err) => {
          this.$notify.error(err.message);
        });
      return false;
    };
  }
}
</script>
