<template>
  <div class="table-warp" :class="{ 'size-adapter': sizeAdaption }">
    <div class="vui-row vui-row-wrap vui-align-items-center">
      <div class="vui-col vui-col-fluid">
        <el-button type="text" @click="onRefresh" title="刷新"><i class="el-icon-refresh"></i>&nbsp;刷新</el-button>
        <el-button type="text" @click="onAdd" title="新增"><i class="el-icon-plus"></i>&nbsp;新增</el-button>
      </div>
      <ele-pagination
        v-if="!sizeAdaption"
        background
        :total="total"
        :page-no.sync="pageNo_"
        :page-size.sync="pageSize_"
        layout="total, sizes, prev, pager, next, jumper"
        @refresh="onRefresh"
      />
    </div>
    <el-table
      ref="elTable"
      color="primary"
      :data="data_"
      :max-height="maxHeight_"
      :fit="true"
      v-loading="loading"
      :row-key="rowKey"
      :hide-bottom="true"
      :pagination="pagination_"
      stripe
      @request="onRefresh"
    >
      <el-table-column
        v-for="col in columns_"
        v-bind:fixed="col.fixed"
        :key="col.name"
        :label="col.label"
        :min-width="col.width"
      >
        <template slot-scope="scope">
          <slot v-if="$scopedSlots[col.name]" :name="col.name" v-bind="scope" />
          <div v-else v-html="col.template ? col.template(scope.row, scope.$index) : scope.row[col.name]"></div>
        </template>
      </el-table-column>
    </el-table>
    <div class="no-data" v-if="!loading && !data.length">
      <img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxpcHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3NC0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAxNS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzUgNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLjIyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuNzUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K"
        :alt="noDataLabel"
        :title="noDataLabel"
      />
      <div v-html="noDataLabel"></div>
    </div>
    <ele-pagination
      v-if="!sizeAdaption"
      background
      :total="total"
      :page-no.sync="pageNo_"
      :page-size.sync="pageSize_"
      layout="total, sizes, prev, pager, next, jumper"
      @refresh="onRefresh"
    />
    <!--<div v-model="form.visible" persistent transition-show="scale" transition-hide="scale">
      <div>
        <div>
          <div class="text-h6">新增</div>
        </div>
        <div class="scroll" style="max-width: 80vh; max-height: 80vh;">
          &lt;!&ndash;<q-form class="q-gutter-md">
            <template v-for="col in columns_">
              <div class="q-field-item"
                   v-if="col.addable && form.control[col.name]"
                   :key="col.name">
                <div class="q-field-label">{{col.label}}</div>
                <div class="q-field-content">
                  <q-input filled place dense square
                           v-if="!col.type || col.type === 'input'"
                           :placeholder="'输入' + col.label"
                           v-model="form.control[col.name].value"
                  />
                  <q-input filled place dense square autogrow
                           type="textarea"
                           v-if="col.type === 'textarea'"
                           :placeholder="'输入' + col.label"
                           v-model="form.control[col.name].value"
                  />
                </div>
              </div>
            </template>
          </q-form>&ndash;&gt;
          <form-render
            :fields="form.fields"
            :has-submit-btn="false"
            :handler.sync="form.handler"
            @submit="onFormSubmit"
          />
        </div>
        <div align="right">
          <div push label="提交" color="deep-orange" @click="submit" />
          <div flat label="关闭" color="primary" />
        </div>
      </div>
    </div>-->
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

import { ElePagination } from '../pagination';
import { IAction, IColumn, IPagination, IRequestData } from './table';
import { FormRender } from '../../../form-renderer/vue';
import { IFormRenderer } from '../../../form-renderer';
import { IField } from '../../../form-renderer/field';
import { Debounce } from '@forgleaner/utils';

@Component({
  name: 'EleTable',
  components: {
    FormRender,
    ElePagination
  }
})
export default class extends Vue {
  @Prop() data: any[];
  @Prop() actions: IAction[];
  @Prop() columns: IColumn[];
  @Prop() pageNo: number;
  @Prop() pageSize: number;
  @Prop({ default: null }) maxHeight: number | string;
  @Prop({ default: 0 }) total: number;
  @Prop({ default: false }) indexed: boolean;
  @Prop({ default: false }) loading: boolean;
  @Prop({ default: false }) sizeAdaption: boolean;
  @Prop({ default: 'id' }) rowKey: string;
  @Prop({ default: '暂无数据' }) noDataLabel: string;

  data_: any[] = [];
  actions_: IAction[] = [];
  columns_: IColumn[] = [];
  pageNo_: number = this.pageNo;
  pageSize_: number = this.pageSize;
  pagination_: IPagination = {
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 0,
    rowsNumber: 0
  };

  maxHeight_ = null;

  form: {
    visible: boolean;
    fields: IField[];
    handler: IFormRenderer;
    uploading: boolean;
  } = {
    visible: false,
    fields: [],
    handler: null,
    uploading: true
  };

  @Emit('request')
  emitRequest(request: IRequestData) {}

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    if (val) {
      this.data_ = val;
      if (this.indexed) {
        this.data_ = this.data_.map((cur, index) => ({ ...cur, __index: index }));
      }
    }
  }

  @Watch('actions', {
    immediate: true
  })
  onActionsChange(val) {
    if (val) {
      this.actions_ = val;
    }
  }

  @Watch('columns', {
    immediate: true
  })
  onColumnsChange(val) {
    if (val) {
      this.columns_ = val.map((x) => ({ ...x, field: x.name }));
    }
  }

  @Watch('pageNo')
  onPageNoChange(val) {
    this.pageNo_ = val;
  }

  @Watch('pageNo_')
  onPageNoChange_(val) {
    this.$emit('update:pageNo', val);
    this.emitRequest({
      type: 'GET',
      params: {
        pageNo: this.pageNo_,
        pageSize: this.pageSize_
      }
    });
  }

  @Watch('pageSize')
  onPageSizeChange(val) {
    this.pageSize_ = val;
  }

  @Watch('pageSize_')
  onPageSizeChange_(val) {
    this.$emit('update:pageSize', val);
    this.emitRequest({
      type: 'GET',
      params: {
        pageNo: this.pageNo_,
        pageSize: this.pageSize_
      }
    });
  }

  @Watch('maxHeight')
  onMaxHeightChange(val) {
    this.maxHeight_ = val;
  }

  onAdd() {
    this.form.fields = this.columns.reduce((prev, cur: any, index) => {
      if (cur.field) {
        if (!cur.field.name) {
          cur.field.name = cur.name;
        }
        if (!cur.field.label) {
          cur.field.label = cur.label;
        }
        prev.push(cur.field);
      }
      return prev;
    }, []);
    this.form.visible = true;
  }

  async onFormSubmit(formData) {
    if (formData) {
      // this.form.uploading = true;
      this.emitRequest({
        type: 'POST',
        params: {
          pageNo: this.pageNo_,
          pageSize: this.pageSize_
        },
        data: formData
      });
      this.form.visible = false;
    }
  }

  submit() {
    if (this.form.handler) {
      this.form.handler.submit();
    }
  }

  onRefresh() {
    this.emitRequest({
      type: 'GET',
      params: {
        pageNo: this.pageNo_,
        pageSize: this.pageSize_
      }
    });
  }

  __resizeHandler: any;

  private resizeHandler() {
    console.log('_______ resize table height');
    this.$nextTick(() => {
      this.maxHeight_ = this.$el.parentElement.offsetHeight - 66;
    });
  }

  beforeMount() {
    if (this.sizeAdaption) {
      this.__resizeHandler = Debounce(this.resizeHandler, 300, false);
      window.addEventListener('resize', this.__resizeHandler);
    }
  }

  mounted() {
    if (this.sizeAdaption) {
      this.resizeHandler();
    }
  }

  beforeDestroy() {
    if (this.__resizeHandler) {
      window.removeEventListener('resize', this.__resizeHandler);
    }
  }
}
</script>

<style lang="scss">
.table-warp {
  display: flex;
  flex-direction: column;
  background-color: #fff;

  &.size-adapter {
    max-height: 100%;
  }

  .q-table__card {
    border: 1px solid #ddd;
    border-radius: 0;
    box-shadow: none;
  }

  .el-table {
    thead {
      > tr {
        background-color: #f5f5f5;

        &:first-child th {
          top: 0;
        }

        > th {
          position: sticky;
          z-index: 1;
          font-size: 14px;
          font-weight: bold;
          color: #333;
          text-align: left;
        }
      }
    }

    tbody {
      > tr {
        > td {
          text-align: left;
        }
      }
    }
  }

  .q-table__container {
    .q-item__label--caption {
      color: #666;
    }
  }

  .no-data {
    padding: 30px 20px 30px;
    font-size: 14px;
    color: #999;
    text-align: center;
  }

  .btn-flat {
    padding: 0;

    .q-btn__wrapper {
      min-height: inherit;
      padding: 0;
      line-height: normal;
    }
  }

  .el-table__empty-block {
    display: none;
  }
}
</style>
