<template>
  <div
    :class="[
      'as-table',
      'vertical-align-' + props.verticalAlign,
      'text-align-' + props.textAlign,
      !props.expandShow && 'hide-row-expand'
    ]"
  >
    <dl
      class="table-actions"
      v-if="
        $scopedSlots.hasOwnProperty('toolbar') ||
        props.refreshable ||
        props.selectable ||
        (props.total && props.pagination) ||
        (props.exported && props.exported.enable)
      "
    >
      <dt>
        <template v-if="props.selectable">
          <a-button size="small" :disabled="!props.data || !props.data.length" @click="selectAll">全选</a-button>
          <a-button class="vui-ml10" size="small" :disabled="!props.data || !props.data.length" @click="selectInvert"
            >反选</a-button
          >
        </template>
        <slot name="toolbar" />
        <template v-if="props.refreshable">
          <a-button v-if="loading" class="btn-refresh" size="small" type="link">
            <v-icon name="sync" spin />
          </a-button>
          <a-button v-else class="btn-refresh" size="small" type="link" @click="refresh" title="刷新">
            <v-icon name="redo" />
          </a-button>
        </template>
        <a-button
          class="btn-export vui-ml10"
          v-if="props.exported && props.exported.enable"
          :readonly="props.exported && props.exported.readonly"
          type="link"
          title="导出到Excel"
          @click="onExported"
        >
          <v-icon name="file-excel" scale="1.1" />导出到Excel
        </a-button>
      </dt>
      <dd>
        <as-pagination
          v-if="props.total && props.pagination"
          :total="props.total"
          :page-no.sync="pageNo"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          @pageNoChange="refresh"
          @pageSizeChange="reload"
        />
      </dd>
    </dl>
    <a-table
      ref="tableRef"
      :data-source="data"
      :pagination="false"
      :loading="loading"
      :row-key="getRowKey"
      :row-selection="
        props.selectable
          ? {
              type: props.rowSelection.type,
              hideDefaultSelections: props.rowSelection.hideDefaultSelections,
              selections: props.rowSelection.selections,
              selectedRowKeys: props.rowSelection.selectedRowKeys,
              onChange: onRowSelectionChange.bind(getCurrentContext)
            }
          : null
      "
      :expanded-row-keys="expandedRowKeys"
      :scroll="props.scroll"
      :size="props.size"
      :expand-icon="expandIcon.bind(getCurrentContext())"
      @request="refresh"
      @expand="onExpand"
      @expandedRowsChange="onExpandedRowsChange"
    >
      <template
        :slot="$scopedSlots.hasOwnProperty('expandedRowRender') ? 'expandedRowRender' : null"
        slot-scope="record, index"
      >
        <slot
          v-if="record && record.__editing"
          name="expandedRowRender"
          v-bind="{ index: index, record: record.__editingData }"
        />
        <slot v-else name="expandedRowRender" v-bind="{ index: index, record: record }" />
      </template>
      <a-table-column
        v-for="col in columns"
        v-if="col.visible"
        :key="col.name"
        :width="col.width"
        v-bind:fixed="col.fixed"
      >
        <template #title>
          <div class="table-cell" :style="{ 'text-align': props.textAlign !== col.textAlign ? col.textAlign : '' }">
            <span v-html="col.label" />
            <span class="thead-desc" v-if="col.desc">{{ col.desc }}</span>
          </div>
        </template>
        <template slot-scope="text, record, index">
          <div class="table-cell" :style="{ 'text-align': col.textAlign }">
            <validation-observer
              :ref="getValidateRef(col, index)"
              v-if="record && record.__editing && $scopedSlots.hasOwnProperty(col.name + '.editing')"
            >
              <slot
                :name="col.name + '.editing'"
                v-bind="{
                  text: text,
                  record: record.__editingData,
                  index: index,
                  submitEditAction: submitEditAction.bind(
                    getCurrentContext(),
                    record.__editingData,
                    index,
                    record.__adding
                  ),
                  cancelEditAction: cancelEditAction.bind(getCurrentContext(), record, index),
                  validate: validateRow.bind(getCurrentContext(), index)
                }"
              />
            </validation-observer>
            <slot
              v-else-if="$scopedSlots[col.name]"
              :name="col.name"
              v-bind="{
                text: text,
                record: record,
                index: index,
                toggleExpand: toggleExpand.bind(getCurrentContext(), record, index),
                editAction: startInlineEdit.bind(getCurrentContext(), record, index),
                deleteAction: deleteAction.bind(getCurrentContext(), record, index)
              }"
            />
            <div
              v-else
              v-html="
                col.template
                  ? col.template(record, index, {
                      pageNo: props.pageNo,
                      pageSize: props.pageSize
                    })
                  : record[col.name]
              "
            />
          </div>
        </template>
      </a-table-column>
    </a-table>
    <div
      class="vui-row vui-row-wrap vui-align-items-center vui-justify-content-end"
      v-if="props.total && props.pagination"
    >
      <div class="vui-col-auto">
        <as-pagination
          v-if="props.total && props.pagination"
          :total="props.total"
          :page-no.sync="pageNo"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          @pageNoChange="refresh"
          @pageSizeChange="reload"
        />
      </div>
    </div>
  </div>
</template>

<script lang="tsx">
import to from 'await-to-js';
import { cloneDeep } from 'lodash';
import { GetGUID } from '@fatesigner/utils/random';
import { Checkbox, Spin, Table } from 'ant-design-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { IVueCompGetContext, IVueCompMethods } from '@fatesigner/vue-lib/component';
import { BindPromiseQueue, Debounce, MergeHandlers, MergeVueProps } from '@fatesigner/utils';

import { AsLoading } from '../loading';
import { AsPagination } from '../pagination';
import { AsActionCancel, AsActionConfirm } from '../button-action';
import {
  IAsTableColumn,
  IAsTableGetRowKey,
  IAsTableHandler,
  IAsTableListeners,
  IAsTablePagination,
  IAsTableProps,
  IAsTableRowSelection
} from './interfaces';

// register icons
import '../../icons/angle-double-down';
import '../../icons/angle-double-up';
import '../../icons/file-excel';
import '../../icons/redo';
import '../../icons/sync';

Vue.use(Checkbox);
Vue.use(Spin);
Vue.use(Table);

@Component({
  name: 'AsTable',
  components: {
    AsLoading,
    AsPagination,
    AsActionCancel,
    AsActionConfirm
  }
})
export default class extends Vue {
  @Prop({ default: null }) getContext: IVueCompGetContext<any>;
  @Prop({ default: () => {} }) listeners: IAsTableListeners<any, any>;
  @Prop({ default: () => {} }) handler: IAsTableHandler;
  @Prop({ default: () => ({}) }) props: IAsTableProps<any, any>;
  @Prop({ default: () => {} }) methods: IVueCompMethods<any>;

  getCurrentContext() {
    return this;
  }

  defaultProps: IAsTableProps<any, any> = {
    columns: [],
    data: [],
    pageNo: 1,
    pageSize: 10,
    total: 0,
    pagination: true,
    size: null,
    scroll: {
      x: true
    },
    rowKey: (record, index) => index,
    verticalAlign: 'middle',
    textAlign: 'left',
    immediate: true,
    expandShow: true,
    expandableKeys: [],
    expandedRowKeys: [],
    exported: {
      enable: false,
      readonly: false
    },
    rowSelection: {
      type: 'checkbox',
      hideDefaultSelections: true,
      selectedRowKeys: [],
      selections: [
        {
          key: 'select-all',
          text: '全选',
          onSelect: this.selectAll
        },
        {
          key: 'select-invert',
          text: '反选',
          onSelect: this.selectInvert
        }
      ]
    }
  };

  data: any[] = [];
  columns: IAsTableColumn[] = [];
  pageNo: number = this.defaultProps.pageNo;
  pageSize: number = this.defaultProps.pageSize;
  rowKey: IAsTableGetRowKey | string = (record, index) => index;

  expandedRowKeys: any[] = [];

  id = '';
  loading = false;
  firstLoaded = false;

  page: IAsTablePagination = {
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 0,
    rowsNumber: 0
  };

  created() {
    this.firstLoaded = true;

    // 生成当前表格的key
    this.id = GetGUID(12).toLowerCase();

    // set props
    MergeVueProps(Vue, this.defaultProps, this.props);

    // set handler
    MergeHandlers(this.handler, {
      refresh: this.refresh,
      reload: this.reload,
      validate: this.validate,
      validateRow: this.validateRow,
      addItem: this.addItem,
      selectAll: this.selectAll,
      selectInvert: this.selectInvert
    });

    // set methods
    if (this.methods) {
      Object.keys(this.methods).forEach((key) => {
        this.methods[key] = this.methods[key].bind(this.getContext());
      });
    }
  }

  mounted() {
    if (this.props.immediate) {
      this.reload();
    }

    // 执行勾子
    if (this.listeners?.mounted) {
      this.$nextTick(() => {
        this.listeners.mounted.call(this.getContext());
      });
    }
  }

  activated() {
    // 激活时，重绘行高
    this.resizeFixedRows();
  }

  @Watch('props.expandableKeys')
  onExpandableKeysChange() {
    this.refreshExpand();
  }

  @Watch('props.columns', {
    immediate: true
  })
  onColumnsChange(val: IAsTableColumn[]) {
    if (val) {
      this.columns = val.map((x: any) => ({
        ...x,
        field: x.name,
        visible: x.visible ?? true,
        textAlign: x.textAlign ?? 'left'
      }));
    }
  }

  @Watch('props.data', {
    immediate: true
  })
  onDataChange(val: any[]) {
    if (this.data !== val) {
      this.data = val;
      // 执行勾子
      if (this.listeners?.dataChanged) {
        this.listeners.dataChanged.call(this.getContext(), this.handler, val);
      }
    }
  }

  @Watch('data')
  onDataChange_(val: any[]) {
    if (this.props.data !== val) {
      this.props.data = val;
      // 执行勾子
      if (this.listeners?.dataChanged) {
        this.listeners.dataChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('data.length')
  onDataLengthChange_(val: number) {
    // 执行勾子
    if (this.listeners?.dataLengthChanged) {
      this.$nextTick(() => {
        this.listeners.dataLengthChanged.call(this.getContext(), val);
      });
    }
  }

  @Watch('props.pageNo', {
    immediate: true
  })
  onPageNoChange(val: number) {
    if (this.pageNo !== val) {
      this.pageNo = val;
      // 执行勾子
      if (this.listeners?.pageNoChanged) {
        this.listeners.pageNoChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('pageNo')
  onPageNoChange_(val: number) {
    if (this.props.pageNo !== val) {
      this.props.pageNo = val;
      // 执行勾子
      if (this.listeners?.pageNoChanged) {
        this.listeners.pageNoChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('props.pageSize', {
    immediate: true
  })
  onPageSizeChange(val: number) {
    if (this.pageSize !== val) {
      this.pageSize = val;
      // 执行勾子
      if (this.listeners?.pageSizeChanged) {
        this.listeners.pageSizeChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('pageSize')
  onPageSizeChange_(val: number) {
    if (this.props.pageSize !== val) {
      this.props.pageSize = val;
      // 执行勾子
      if (this.listeners?.pageSizeChanged) {
        this.listeners.pageSizeChanged.call(this.getContext(), val);
      }
    }
  }

  @Watch('props.expandedRowKeys', {
    immediate: true
  })
  onExpandedRowKeysChange(val: any[]) {
    if (this.expandedRowKeys !== val) {
      this.expandedRowKeys = val;
    }
  }

  @Watch('expandedRowKeys')
  onExpandedRowKeysChange_(val: any[]) {
    if (this.props.expandedRowKeys !== val) {
      this.props.expandedRowKeys = val;
    }
  }

  getRowKey(record: Record<string, any>, index: number): string | number {
    if (Object.prototype.toString.call(this.props.rowKey) === '[object Function]') {
      return (this.props.rowKey as any)(record, index);
    } else if (Object.prototype.hasOwnProperty.call(record, this.props.rowKey)) {
      return record[this.props.rowKey as string];
    } else {
      return index;
    }
  }

  getValidateRef(col: any, index: number) {
    return `table_${this.id}_${index}_${col.name}_validate_ref`;
  }

  // 刷新当前数据，重置页码为 1
  reload() {
    this.props.pageNo = 1;
    return this.refresh();
  }

  // 刷新
  refresh = BindPromiseQueue(() => {
    return async function (this: any) {
      this.loading = true;

      if (this.props.transport?.get) {
        const query = {
          pageNo: this.props.pageNo,
          pageSize: this.props.pageSize
        };

        let dataMap = {
          query: query
        };

        if (this.props.transport?.parameterMap) {
          dataMap = this.props.transport.parameterMap.call(this.getContext(), dataMap, 'GET');
        }

        let [err, res] = await to<any>(
          this.props.transport.get.call(this.getContext(), {
            query: dataMap.query
          })
        );

        if (err) {
          this.$notification.error({ message: '', description: err.message });
        } else {
          res = res ?? [];
          if (this.props.schema && this.props.schema.parse) {
            res = this.props.schema.parse.call(this.getContext(), res);
          }
          if (this.props.schema && this.props.schema.data) {
            // this.data = this.schema.data(res);
            this.data.splice(0, this.data.length, ...this.props.schema.data(res));
          } else {
            // this.data = res.data;
            this.data.splice(0, this.data.length, ...res.data);
          }
          if (this.props.schema && this.props.schema.total) {
            this.props.total = this.props.schema.total.call(this.getContext(), res);
          } else {
            this.props.total = res.total;
          }
        }
      }

      // 执行勾子
      if (this.firstLoaded) {
        if (this.listeners?.firstLoaded) {
          this.$nextTick(() => {
            this.listeners.firstLoaded.call(this.getContext(), this);
          });
        }
        this.firstLoaded = false;

        this.$nextTick(() => {
          // 等待渲染完成
          setTimeout(() => {
            this.resizeFixedRows();
          }, 100);
        });
      }

      if (this.listeners?.reloaded) {
        this.$nextTick(() => {
          this.listeners.reloaded.call(this.getContext(), this);
          this.refreshExpand();
        });
      }
      // this.$emit('update:data', this.data);

      this.loading = false;

      return this.data;
    }.call(this.getCurrentContext());
  }, true);

  // 验证
  async validate() {
    let valid = true;
    for (let index = 0, l = this.data.length; index < l; index++) {
      for (const col of this.columns) {
        const refName = this.getValidateRef(col, index);
        if (Object.prototype.hasOwnProperty.call(this.$refs, refName)) {
          let ref: any = this.$refs[refName];
          if (ref.length) {
            ref = ref[0];
          }
          const v = await ref?.validate();
          if (!v) {
            valid = false;
          }
        }
      }
    }
    return valid;
  }

  // 验证指定行的数据
  async validateRow(index: number) {
    let valid = true;
    for (const col of this.columns) {
      const refName = this.getValidateRef(col, index);
      if (Object.prototype.hasOwnProperty.call(this.$refs, refName)) {
        let ref: any = this.$refs[refName];
        if (ref.length) {
          ref = ref[0];
        }
        const v = await ref?.validate();
        if (!v) {
          valid = false;
        }
      }
    }

    this.resizeFixedRows();

    return valid;
  }

  // 往后添加新记录
  async addItem(record?: any, options?: { replace?: boolean; index?: number; editing?: boolean; prepend?: boolean }) {
    if (!record) {
      if (this.props.schema?.addingMap) {
        record = this.props.schema.addingMap.call(this.getContext(), this);
      } else {
        throw new Error('AsTable Comp: the schema?.addingMap is undefined, please check it');
      }
    }

    if (options?.editing) {
      record.__editingData = this.props.schema.addingMap.call(this.getContext(), this);
      record.__adding = true;
      record.__editing = true;
    }

    if (options?.index > -2) {
      if (options?.replace) {
        this.data.splice(options.index, 1, record);
      } else {
        this.data.splice(options.index, 0, record);
      }
    } else if (options?.prepend) {
      this.data.unshift(record);
    } else {
      this.data.push(record);
    }
  }

  // 开始编辑状态
  async startInlineEdit(record: any, index: number) {
    if (this.props.schema?.editingMap) {
      record.__editingData = this.props.schema.editingMap.call(this.getContext(), record, index);
    } else {
      // 若无指定 map 函数，则默认返回一个克隆对象
      record.__editingData = cloneDeep(record);
    }
    record.__editing = true;
    this.$set(this.props.data, index, record);
  }

  async deleteAction(record: any, index: number) {
    if (this.props.transport?.delete) {
      const data = cloneDeep(record);
      delete data.__editing;
      delete data.__editingData;

      let dataMap = {
        query: {
          pageNo: this.props.pageNo,
          pageSize: this.props.pageSize
        },
        record: data
      };
      if (this.props.transport.parameterMap) {
        dataMap = this.props.transport.parameterMap.call(this.getContext(), dataMap, 'DELETE');
      }
      const [err] = await to(
        this.props.transport.delete.call(this.getContext(), {
          query: {
            pageNo: this.props.pageNo,
            pageSize: this.props.pageSize
          },
          record: dataMap.record
        })
      );

      if (err) {
        throw err;
      }
    }

    // 删除当前行
    this.data.splice(index, 1);

    return this.refresh();
  }

  // 提交更新
  async submitEditAction(record: any, index: number, adding: boolean) {
    const valid = await this.validateRow(index);
    if (!valid) {
      return;
    }
    const data = cloneDeep(record);
    delete data.__editing;
    delete data.__editingData;
    if (adding) {
      let dataMap = {
        query: {
          pageNo: this.props.pageNo,
          pageSize: this.props.pageSize
        },
        record: data
      };
      if (this.props.transport?.parameterMap) {
        dataMap = this.props.transport.parameterMap.call(this.getContext(), dataMap, 'POST');
      }
      let postable = true;
      if (this.props.transport?.post) {
        const [err, res] = await to(
          this.props.transport.post.call(this.getContext(), {
            query: {
              pageNo: this.props.pageNo,
              pageSize: this.props.pageSize
            },
            record: dataMap.record
          })
        );
        if (err) {
          postable = false;
          throw err;
        } else {
          dataMap.record = res;
        }
      }
      if (postable) {
        record.__editing = false;
        record.__editingData = null;
        delete record.__editing;
        delete record.__editingData;
        this.data.splice(index, 1, dataMap.record);
        if (this.listeners?.added) {
          this.$nextTick(() => {
            this.listeners.added.call(this.getContext());
          });
        }
        // this.$emit('update:data', this.data);
        // this.$notification.success({ message: '', description: '新增成功！' });
      }
    } else {
      let dataMap = {
        query: {
          pageNo: this.props.pageNo,
          pageSize: this.props.pageSize
        },
        record: data
      };
      if (this.props.transport?.parameterMap) {
        dataMap = this.props.transport.parameterMap.call(this.getContext(), dataMap, 'PUT');
      }
      let putable = true;
      if (this.props.transport?.put) {
        const [err, res] = await to(
          this.props.transport.put.call(this.getContext(), {
            query: {
              pageNo: this.props.pageNo,
              pageSize: this.props.pageSize
            },
            record: dataMap.record
          })
        );
        if (err) {
          putable = false;
          throw err;
        } else {
          dataMap.record = res;
        }
      }
      if (putable) {
        record.__editing = false;
        record.__editingData = null;
        delete record.__editing;
        delete record.__editingData;
        this.data.splice(index, 1, dataMap.record);
        if (this.listeners?.updated) {
          this.$nextTick(() => {
            this.listeners.updated.call(this.getContext(), dataMap.record);
          });
        }
        // this.$emit('update:data', this.data);
        // this.$notification.success({ message: '', description: '更新成功！' });
      }
    }
  }

  // 取消编辑状态
  async cancelEditAction(record: any, index: number) {
    // 对于新增的取消，直接删除该行记录
    if (record.__adding) {
      this.data.splice(index, 1);
    } else {
      record.__editing = false;
      record.__editingData = null;
      delete record.__editing;
      delete record.__editingData;
      this.$set(this.props.data, index, record);
    }

    this.resizeFixedRows();
  }

  // 导出到 excel
  private onExported() {
    if (this.props.transport?.downloadExcel) {
      this.props.transport.downloadExcel
        .call(this.getContext(), {
          query: {
            pageNo: this.props.pageNo,
            pageSize: this.props.pageSize
          }
        })
        .catch((err: Error) => {
          this.$notification.error({ message: '', description: err.message });
        });
    }
  }

  // 全选
  async selectAll() {
    this.props.rowSelection.selectedRowKeys = this.data.map((record, index) => this.getRowKey(record, index));
  }

  // 反选
  async selectInvert() {
    this.props.rowSelection.selectedRowKeys = this.data
      .map((record, index) => this.getRowKey(record, index))
      .filter((key) => this.props.rowSelection.selectedRowKeys.indexOf(key) < 0);
  }

  // row checkbox change
  onRowSelectionChange(selectedRowKeys: any[]) {
    this.props.rowSelection.selectedRowKeys = selectedRowKeys;
    if (this.listeners?.rowSelectionChanged) {
      this.listeners.rowSelectionChanged.call(this.getContext(), selectedRowKeys);
    }
  }

  // 切换显示拓展行
  async toggleExpand(record: any, index: number) {
    const rowKey = this.getRowKey(record, index);
    const idx = this.props.expandedRowKeys.indexOf(rowKey);
    if (idx > -1) {
      this.expandedRowKeys.splice(idx, 1);
    } else {
      this.expandedRowKeys.splice(this.expandedRowKeys.length, 0, rowKey);
    }
  }

  onExpand(expanded: any, record: any) {
    if (this.listeners?.expanded) {
      this.listeners.expanded.call(this.getContext(), expanded, record);
    }
    // this.$emit('expand', expanded, record);
  }

  onExpandedRowsChange(expandedRows: any) {
    this.expandedRowKeys = expandedRows;
    if (this.listeners?.expandedRowsChanged) {
      this.listeners.expandedRowsChanged.call(this.getContext(), expandedRows);
    }
    // this.$emit('update:expandedRowKeys', expandedRows);
    // this.$emit('expanded-rows-change', expandedRows);
  }

  // 重绘 fixed 行高度，以解决 fixed 错位的渲染问题
  resizeFixedRows = Debounce(() => {
    return function (this: any) {
      // const rf = this.$el.offsetHeight;
      // this.$refs.tableRef.saveRowRef();
      this.$nextTick(() => {
        const main = Array.from(this.$el.querySelectorAll('.ant-table-body .ant-table-row')).map(
          (el: HTMLElement) => el.offsetHeight
        );

        const fixedL = Array.from(this.$el.querySelectorAll('.ant-table-fixed-left .ant-table-row'));
        const fixedR = Array.from(this.$el.querySelectorAll('.ant-table-fixed-right .ant-table-row'));

        // 将 styles 一次性重绘
        window.requestAnimationFrame(() => {
          fixedL.forEach((el: HTMLElement, index) => {
            el.style.height = main[index] + 'px';
          });
          fixedR.forEach((el: HTMLElement, index) => {
            el.style.height = main[index] + 'px';
          });
        });
      });
    }.call(this.getCurrentContext());
  }, 500);

  // 控制 expand 的显示
  refreshExpand = Debounce(() => {
    return function (this: any) {
      if (this.props.expandableKeys && this.props.expandableKeys.length) {
        const $trs = this.$el.querySelectorAll('.ant-table-tbody > .ant-table-row');
        this.props.expandableKeys.forEach((key) => {
          $trs.forEach(($tr) => {
            if ($tr.getAttribute('data-row-key') === key) {
              const s = $tr.querySelector('.ant-table-row-collapsed');
              if (s) {
                s.style.display = 'block';
              }
            }
          });
        });
      }
    }.call(this.getCurrentContext());
  }, 500);

  expandIcon(props) {
    const { expandable, prefixCls, onExpand, needIndentSpaced, expanded, record } = props;
    if (expandable) {
      if (expanded) {
        return (
          <span class='ant-table-row-collapsed as-table-expend-icon' onClick={onExpand}>
            <v-icon name='angle-double-up' />
          </span>
        );
        // return <a-icon type='up' onClick={onExpand} />;
      } else {
        return (
          <span class='ant-table-row-collapsed as-table-expend-icon' onClick={onExpand}>
            <v-icon name='angle-double-down' />
          </span>
        );
      }
    }
  }
}
</script>

<style lang="scss">
.table-col-text-align-center {
  .ant-table {
    .ant-table-thead {
      > tr {
        > th {
          text-align: center;
        }
      }
    }

    .ant-table-tbody {
      > tr {
        > td {
          text-align: center;
        }
      }
    }
  }
}

.as-table {
  .ant-table {
    .ant-table-thead {
      > tr {
        background-color: #f5f5f5;

        > th {
          position: sticky;
          z-index: 1;
          font-weight: bold;
          color: #333;
          text-align: left;

          .ant-table-header-column {
            display: block;
          }
        }

        &:first-child th {
          top: 0;
        }
      }
    }

    .ant-table-tbody {
      > tr {
        > td {
          text-align: left;
        }
      }
    }

    .a-table__empty-block {
      display: none;
    }
  }

  .ant-table-placeholder {
    border-bottom: none;
  }

  &.text-align-left {
    .ant-table {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        text-align: left;
      }
    }
  }

  &.text-align-center {
    .ant-table {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        text-align: center;
      }
    }
  }

  &.text-align-right {
    .ant-table {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        text-align: right;
      }
    }
  }

  &.vertical-align-top {
    .ant-table {
      .ant-table-tbody > tr > td {
        vertical-align: top;
      }
    }
  }

  &.vertical-align-middle {
    .ant-table {
      .ant-table-tbody > tr > td {
        vertical-align: middle;
      }
    }
  }

  &.vertical-align-bottom {
    .ant-table {
      .ant-table-tbody > tr > td {
        vertical-align: bottom;
      }
    }
  }
}

.as-table-expend-icon {
  width: 100%;
  padding: 5px;
  color: #999;
  text-align: center;
  cursor: pointer;
  background: transparent;
  transition: color 0.3s;

  &:hover {
    color: #666;
  }
}
</style>

<style lang="scss" scoped>
.as-table {
  display: flex;
  flex-direction: column;
  background-color: #fff;

  ::v-deep .ant-table-wrapper {
    .ant-table {
      border: 1px solid #e8e8e8;
      border-radius: 2px;
    }

    .ant-table-content .ant-table-row:last-child > td {
      border-bottom: 0;
    }

    .ant-table-row-collapsed {
      display: none;

      &::after {
        display: none;
        content: '';
      }
    }

    &.auto-scroll-y {
      .ant-table,
      .ant-spin-nested-loading,
      .ant-spin-container,
      .ant-table-scroll,
      .ant-table-body-inner,
      .ant-table-fixed-left,
      .ant-table-fixed-right,
      .ant-table-content {
        height: 100%;
      }

      .ant-table-scroll,
      .ant-table-fixed-left,
      .ant-table-fixed-right {
        display: flex;
        flex-direction: column;
      }

      .ant-table-content {
        position: relative;
      }

      .ant-table-body,
      .ant-table-body-inner {
        overflow-y: auto !important;
      }

      .ant-table-header {
        overflow: initial !important;
      }

      .ant-table-body-outer {
        overflow: hidden;
      }

      .ant-table-body-inner {
        overflow-x: hidden;
      }
    }

    .thead-desc {
      margin-left: 5px;
      font-size: 12px;
      font-weight: normal;
      color: #999;
    }
  }

  &.hide-row-expand {
    ::v-deep .ant-table-row-expand-icon-cell,
    ::v-deep .ant-table-expand-icon-th {
      display: none;
      width: 0;
      border-right: 0 !important;
    }

    ::v-deep .ant-table-row-collapsed {
      &::after {
        display: none;
        content: '';
      }
    }

    ::v-deep .ant-table-expanded-row {
      > td:first-child {
        display: none;
      }
    }
  }
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 0 0 5px;
  margin: 0 -5px;

  > dt {
    flex: 1;
    padding: 0 5px 5px;
    white-space: nowrap;
  }

  > dd {
    padding: 0 5px 5px;
    margin-right: 5px;
  }
}

.loading,
.btn-refresh {
  width: 24px;
  padding-right: 0;
  padding-left: 0;
}

.btn-export {
  padding-right: 0;
  padding-left: 0;
}

.loading {
  font-size: 18px;
  line-height: 20px;
  vertical-align: middle;
}

.no-data {
  padding: 30px 20px 30px;
  color: #999;
  text-align: center;
}

.btn-flat {
  padding: 0;
}
</style>
