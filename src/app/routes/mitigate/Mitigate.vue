<template>
  <layout class="mitigate-settings">
    <el-button class="vui-mb10" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
    <ele-table
      :data="result.data"
      :columns="columns"
      :indexed="true"
      :loading="result.loading"
      :total.sync="result.totalCount"
      :page-no.sync="query.pageNo"
      :page-size.sync="query.pageSize"
      @request="onRequest"
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
    <el-dialog
      custom-class="action-dialog"
      :title="actionDialog.form.id ? '编辑减免设置' : '新增减免设置'"
      :visible.sync="actionDialog.visible"
    >
      <ValidationObserver ref="validator">
        <el-form class="agent-type-form" label-width="80px">
          <el-form-item label="减免类型">
            <ValidationProvider name="减免类型" rules="required" v-slot="{ classes, errors }">
              <el-select
                :class="classes"
                clearable
                placeholder="选择减免类型"
                v-model="actionDialog.form.derateType"
                title=""
                style="width: 160px;"
              >
                <el-option
                  v-for="item in DerateType.arr"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                ></el-option>
              </el-select>
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
          </el-form-item>
          <el-form-item label="减免对象">
            <ValidationProvider name="减免对象" rules="required" v-slot="{ classes, errors }">
              <el-select
                :class="classes"
                clearable
                placeholder="选择减免对象"
                v-model="actionDialog.form.derateTarget"
                title=""
                style="width: 160px;"
              >
                <el-option
                  v-for="item in AgentLevel.arr"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                ></el-option>
              </el-select>
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
          </el-form-item>
          <el-form-item label="减免条件">
            <ValidationProvider name="减免条件" rules="required" v-slot="{ classes, errors }">
              <el-select
                :class="classes"
                clearable
                placeholder="选择减免条件"
                v-model="actionDialog.form.derateCondition"
                title=""
                style="width: 160px;"
              >
                <el-option
                  v-for="item in DerateCondition.arr"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                ></el-option>
              </el-select>
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
            <p class="vui-mt10 vui-g9">首次申请成为（减免对象）时，且满足当前减免时间，即可触发本次减免金额</p>
          </el-form-item>
          <el-form-item label="减免金额">
            <ValidationProvider name="减免金额" rules="required|numeric" v-slot="{ classes, errors }">
              <el-input
                :class="classes"
                class="vui-hnm vui-mr5"
                type="number"
                v-model.number="actionDialog.form.derateMoney"
                style="width: 160px;"
                title=""
              >
                <span slot="append">元</span>
              </el-input>
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
          </el-form-item>
          <el-form-item label="时间">
            <div class="vui-row vui-no-padding">
              <ValidationProvider class="vui-col-auto" name="开始时间" rules="required" v-slot="{ classes, errors }">
                <el-date-picker
                  v-model="actionDialog.form.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                >
                </el-date-picker>
                <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
              </ValidationProvider>
            </div>
            <p class="vui-mt10 vui-g9">
              开始时间必须≥当前时间，且与当前已创建的时间/对象不可重复/重叠（相同减免对象不同时间时）
            </p>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="actionDialog.uploading"
              @click="onSubmit"
              style="width: 160px;"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </ValidationObserver>
    </el-dialog>
  </layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IColumn, IRequestData } from '../../../lib/element-ui-helper/components/table';

import { Layout } from '../../layout';
import { ApiService } from '../../services/api.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import { AgentLevel, DerateCondition, DerateStatus, DerateType } from '../../global';
import { DateFormatPipe, DateFormatPipeKey } from '../../pipes/date-format.pipe';

@Component({
  name: 'Mitigate',
  components: {
    Layout,
    RadioButtons
  }
})
export default class extends Vue {
  AgentLevel = AgentLevel;
  DerateType = DerateType;
  DerateCondition = DerateCondition;

  query = {
    pageNo: 1,
    pageSize: 10
  };

  result = {
    loading: false,
    totalCount: 0,
    data: []
  };

  columns: IColumn[] = [
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
        return `${DerateStatus.desc[row.status]}`;
      }
    },
    { label: '操作', name: 'actions', width: 80, fixed: 'right' }
  ];

  actionDialog = {
    loading: false,
    uploading: false,
    visible: false,
    form: {
      id: '',
      derateType: 1,
      derateTarget: 1,
      derateCondition: 1,
      derateMoney: null,
      timeRange: null
    }
  };

  onRequest(request: IRequestData) {
    this.query.pageNo = request.params.pageNo;
    this.query.pageSize = request.params.pageSize;
    this.loadData();
  }

  created() {
    this.loadData();
  }

  add() {
    this.actionDialog.form.derateType = 1;
    this.actionDialog.form.derateTarget = 1;
    this.actionDialog.form.derateCondition = 1;
    this.actionDialog.form.derateMoney = null;
    this.actionDialog.form.timeRange = null;
    this.actionDialog.visible = true;
  }

  update(row) {
    this.actionDialog.form.id = row.id;
    this.actionDialog.form.derateType = row.derateType;
    this.actionDialog.form.derateTarget = row.derateTarget;
    this.actionDialog.form.derateCondition = row.derateCondition;
    this.actionDialog.form.derateMoney = row.derateMoney;
    this.actionDialog.form.timeRange = [new Date(row.startTime), new Date(row.endTime)];
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
        this.loadData();
      })
      .catch((err) => {
        this.$notify({
          title: 'error',
          message: err.message,
          type: 'error'
        });
      })
      .finally(() => {});
  }

  onSubmit() {
    (this.$refs.validator as any).validate().then((success) => {
      if (success) {
        this.actionDialog.uploading = true;
        const data = {
          id: this.actionDialog.form.id,
          derateType: this.actionDialog.form.derateType,
          derateTarget: this.actionDialog.form.derateTarget,
          derateCondition: this.actionDialog.form.derateCondition,
          derateMoney: this.actionDialog.form.derateMoney,
          startTime: this.$options.filters[DateFormatPipeKey](this.actionDialog.form.timeRange[0]),
          endTime: this.$options.filters[DateFormatPipeKey](this.actionDialog.form.timeRange[1])
        };
        if (data.id) {
          ApiService.derate_update(data)
            .then(() => {
              this.$notify({
                title: 'success',
                message: '更新成功！',
                type: 'success'
              });
              this.actionDialog.visible = false;
              this.loadData();
            })
            .catch((err) => {
              this.$notify({
                title: 'error',
                message: err.message,
                type: 'error'
              });
            })
            .finally(() => {
              this.actionDialog.uploading = false;
              (this.$refs.validator as any).reset();
            });
        } else {
          ApiService.derate_add(data)
            .then(() => {
              this.$notify({
                title: 'success',
                message: '添加成功！',
                type: 'success'
              });
              this.actionDialog.uploading = false;
              this.loadData();
            })
            .catch((err) => {
              this.$notify({
                title: 'error',
                message: err.message,
                type: 'error'
              });
            })
            .finally(() => {
              this.actionDialog.uploading = false;
              (this.$refs.validator as any).reset();
            });
        }
      }
    });
  }

  loadData() {
    this.result.loading = true;
    return ApiService.derate_page({
      pageNo: this.query.pageNo,
      pageSize: this.query.pageSize
    })
      .then((res: any) => {
        if (res && res.rows) {
          this.result.data = res.rows;
          this.result.totalCount = res.totalCount;
        } else {
          this.result.data = [];
          this.result.totalCount = 0;
        }
      })
      .finally(() => {
        this.result.loading = false;
      });
  }
}
</script>
