<template>
  <div class="content">
    <div class="title">表格（行内编辑）</div>
    <as-table v-bind="table">
      <template #toolbar>
        <a-button class="vui-mr10" type="primary" @click="addItem">添加</a-button>
      </template>
      <template v-slot:ydczje.editing="{ record }">
        <div class="vui-row">
          <div class="vui-col-auto">
            <validation-provider vid="minValue" rules="required" v-slot="{ classes, errors }">
              <a-input
                :class="classes"
                class="vui-hnm"
                type="number"
                v-model.number="record.minValue"
                style="width: 140px;"
                ><template slot="addonAfter">元</template></a-input
              >
              <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
            </validation-provider>
          </div>
          <div class="vui-col-auto">~</div>
          <div class="vui-col-auto">
            <validation-provider vid="maxValue" rules="required" v-slot="{ classes, errors }">
              <a-input
                :class="classes"
                class="vui-hnm"
                type="number"
                v-model.number="record.maxValue"
                style="width: 140px;"
                ><template slot="addonAfter">元</template></a-input
              >
              <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
            </validation-provider>
          </div>
        </div>
      </template>
      <template v-slot:rebateRatio.editing="{ record }">
        <validation-provider vid="rebateRatio" rules="required|decimal:1|max_value:100" v-slot="{ classes, errors }">
          <a-input
            :class="classes"
            class="vui-hnm"
            type="number"
            v-model.number="record.rebateRatio"
            style="width: 120px;"
          >
            <template slot="addonAfter">%</template>
          </a-input>
          <transition-collapse>
            <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
          </transition-collapse>
        </validation-provider>
      </template>
      <template v-slot:actions="{ editAction, deleteAction }">
        <as-action-edit :handler="editAction" />
        <a-divider type="vertical" />
        <as-action-delete :handler="deleteAction" />
      </template>
      <template v-slot:actions="{ editAction, deleteAction }">
        <as-action-edit :handler="editAction" />
        <a-divider type="vertical" />
        <as-action-delete :handler="deleteAction" />
      </template>
      <template v-slot:actions.editing="{ submitEditAction, cancelEditAction }">
        <as-action-confirm :handler="submitEditAction" />
        <a-divider type="vertical" />
        <as-action-cancel :handler="cancelEditAction" />
      </template>
    </as-table>

    <div class="title">代码</div>
    <div v-html="sourceCode" v-highlight></div>
  </div>
</template>
<script lang="ts">
import { cloneDeep, merge } from 'lodash';
import { Button } from 'ant-design-vue';
import { Component, Vue } from 'vue-property-decorator';
import { IsNullOrUndefined } from '@fatesigner/utils/type-check';
import { TransitionCollapse } from '@fatesigner/vue-lib/components/transition';
import { AsTable, CreateAsTable } from '../../../lib/antdv-ui/components/table';
import {
  AsActionCancel,
  AsActionConfirm,
  AsActionDelete,
  AsActionEdit
} from '../../../lib/antdv-ui/components/button-action';

import '../../providers/highlight';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { ApiService } from '../../services/api.service';

Vue.use(Button);

@Component({
  name: 'Table',
  components: {
    AsTable,
    AsActionCancel,
    AsActionConfirm,
    AsActionEdit,
    AsActionDelete,
    TransitionCollapse
  }
})
export default class extends Vue {
  getContext() {
    return this;
  }

  table = CreateAsTable({
    getContext: this.getContext,
    props: {
      refreshable: true,
      columns: [
        {
          label: '序号',
          name: 'id',
          width: 80,
          fixed: true,
          template(record, index, query) {
            return `${(query.pageNo - 1) * query.pageSize + index + 1}`;
          }
        },
        {
          label: '月度充值金额',
          name: 'ydczje',
          width: 200,
          template(record: any) {
            return `${CurrencyPipe(record.minValue)} ~ ${CurrencyPipe(record.maxValue)}`;
          }
        },
        {
          label: '返利比例',
          name: 'rebateRatio',
          width: 150,
          template(record: any) {
            return `${record.rebateRatio !== null ? (record.rebateRatio * 100).toFixed() : ''}`;
          }
        },
        { label: '操作', name: 'actions', width: 200, fixed: 'right', textAlign: 'center' }
      ],
      schema: {
        addingMap() {
          return {
            id: null,
            minValue: null,
            maxValue: null,
            rebateRatio: null
          };
        },
        editingMap(record) {
          const data_ = cloneDeep(record);
          // 返利金额字段，小数转换为百分比整数
          if (!IsNullOrUndefined(data_.rebateRatio)) {
            data_.rebateRatio = (data_.rebateRatio * 100).toFixed() as any;
          }
          return data_;
        }
      },
      transport: {
        parameterMap(options, type) {
          if (type === 'PUT' || type === 'POST') {
            options.record = merge({}, options.record, {
              // 返利金额字段，转换为小数
              rebateRatio: (options.record.rebateRatio / 100).toFixed(3)
            });
          }
          return options;
        },
        get(options) {
          return ApiService.getRebate(options.query).then((res: any) => {
            return {
              data: res?.rows ?? [],
              total: res?.totalCount ?? 0
            };
          });
        },
        post(options) {
          return ApiService.addRebate(options.record).then(() => {
            return options.record;
          });
        },
        put(options) {
          return ApiService.updateRebate(options.record).then(() => {
            return options.record;
          });
        },
        delete(options) {
          return ApiService.deleteRebate(options.record.id);
        }
      }
    },
    listeners: {
      added() {
        // 行内新增后，刷新数据
        this.table.handler.refresh();
      }
    }
  });

  sourceCode = require('raw-loader!./sourcecode.html').default;

  async addItem() {
    await this.table.handler.addItem(null, {
      editing: true,
      prepend: true
    });
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 10px;
}
</style>
