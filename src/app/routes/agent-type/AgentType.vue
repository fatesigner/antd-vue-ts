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
      <template v-slot:orderProductList="{ row }">
        <div class="vui-row" v-for="item in row.orderProductList" :key="item.id">
          <div class="vui-col-auto">{{ getProductName(item.productId) }}</div>
          <div class="vui-col-auto">{{ item.firstOrderNum }}台</div>
          <div class="vui-col-auto">￥{{ item.orderPrice }}(台)</div>
        </div>
      </template>
      <template v-slot:purchaseCondition="{ row }">
        <div class="vui-row" v-for="item in row.orderProductList" :key="item.id">
          <div class="vui-col-auto">{{ getProductName(item.productId) }}</div>
          <div class="vui-col-auto">{{ item.firstOrderNum }}台</div>
          <div class="vui-col-auto">￥{{ item.orderPrice }}(台)</div>
        </div>
      </template>
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
          <el-form-item label="代理名称">
            <ValidationProvider name="代理名称" rules="required" v-slot="{ classes, errors }">
              <el-input
                :class="classes"
                class="vui-hnm vui-mr5"
                v-model="actionDialog.form.name"
                style="width: 160px;"
                title=""
              />
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
          </el-form-item>
          <el-form-item label="代理等级">
            <ValidationProvider name="代理等级" rules="required" v-slot="{ classes, errors }">
              <el-select
                :class="classes"
                clearable
                placeholder="选择等级"
                v-model="actionDialog.form.level"
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
          <el-form-item label="订货数量">
            <ValidationProvider name="订货数量" rules="required" v-slot="{ classes, errors }">
              <ele-table
                :data="result.product"
                :columns="productColumns"
                :indexed="true"
                :loading="result.loading"
                :total.sync="result.totalCount"
                :page-no.sync="query.pageNo"
                :page-size.sync="query.pageSize"
                :refresher="false"
                :pagination="false"
                @request="onRequest"
              >
              </ele-table>
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
          </el-form-item>
          <el-form-item label="推荐奖励">
            <ValidationProvider name="推荐奖励" rules="required|numeric" v-slot="{ classes, errors }">
              <el-select
                :class="classes"
                clearable
                placeholder="选择推荐奖励"
                v-model="actionDialog.form.recommType"
                title=""
                style="width: 160px;"
              >
                <el-option
                  v-for="item in RewardType.arr"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                ></el-option>
              </el-select>
              <el-input
                :class="classes"
                class="vui-hnm vui-ml5"
                type="number"
                v-model.number="actionDialog.form.derateMoney"
                style="width: 160px;"
                title=""
              >
                <span slot="append">元</span>
              </el-input>
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
            <p class="vui-mt10 vui-g3">总则：推荐奖励为一次性奖励，推荐人奖励由被推荐方上级约定支付。</p>
            <p class="vui-g9">按每台奖励：推荐当前级别代理订货数（每台）奖励</p>
          </el-form-item>
          <el-form-item label="考核期">
            <p class="vui-mt10 vui-g9">
              已成为当前代理级别起开始计时，免考期内无要求，考核期内需满足总进货量要求，否则不足台数进入预警列表/提醒（所有产品版本）
            </p>
            <p class="vui-green">（当前仅有4级代理商具备考核设置）</p>
          </el-form-item>
          <el-form-item label="备注">
            <ValidationProvider name="备注" rules="required" v-slot="{ classes, errors }">
              <el-input
                :class="classes"
                type="textarea"
                v-model="actionDialog.form.remark"
                :rows="2"
                style="width: 320px;"
                title=""
              />
              <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
            </ValidationProvider>
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
import { AgentLevel, DerateCondition, DerateStatus, DerateType, RewardType } from '../../global';
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
  RewardType = RewardType;

  query = {
    pageNo: 1,
    pageSize: 10
  };

  result = {
    loading: false,
    totalCount: 0,
    data: [],
    product: []
  };

  productColumns: IColumn[] = [
    {
      label: '#',
      name: 'select',
      width: 35
    },
    {
      label: '产品名称',
      name: 'productName'
    },
    {
      label: '首次申请量（台）',
      name: 'firstOrderNum',
      width: 150
    },
    {
      label: '进货量（台）',
      name: 'orderNum',
      width: 150
    },
    {
      label: '订货价格(￥)',
      name: 'orderPrice',
      width: 150
    }
  ];

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
      label: '代理名称',
      name: 'name',
      width: 100,
      template: (row) => {
        return `${row.name}<br/>等级：${row.level}`;
      }
    },
    {
      label: '首次申请/订货量',
      name: 'orderProductList',
      width: 260
    },
    {
      label: '进货起订量',
      name: 'purchaseCondition',
      width: 260
    },
    {
      label: '推荐奖金',
      name: 'recommValue',
      width: 180,
      template: (row) => {
        return `${CurrencyPipe(row.recommValue)}/台`;
      }
    },
    {
      label: '备注',
      name: 'remark',
      width: 180
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

  getProductName(productId) {
    const item = this.result.product.find((x) => x.id === productId);
    if (item) {
      return item.productName;
    }
    return '未知名称';
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
    return Promise.all([
      ApiService.product_list({ pageNo: 1, pageSize: 10000 }),
      ApiService.agentLevel_page({ pageNo: this.query.pageNo, pageSize: this.query.pageSize })
    ])
      .then((res: any) => {
        const [data1, data2] = res;
        this.result.product = data1;
        if (data2 && data2.rows) {
          this.result.data = data2.rows;
          this.result.totalCount = data2.totalCount;
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

<style lang="scss"></style>
