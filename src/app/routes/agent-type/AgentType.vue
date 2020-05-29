<template>
  <layout class="mitigate-settings">
    <el-button class="vui-mb10" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
    <ele-table
      :data="table.result.data"
      :columns="table.columns"
      :loading="table.result.loading"
      :total.sync="table.result.totalCount"
      :page-no.sync="table.query.pageNo"
      :page-size.sync="table.query.pageSize"
      :refresher="true"
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
            <ele-table
              style="margin-top: -10px;"
              :data="tableProduct.result.data"
              :columns="tableProduct.columns"
              size="mini"
            >
              <template v-slot:check="{ row, $index }">
                <el-checkbox v-model="actionDialog.form.productList[$index].checked" />
              </template>
              <template v-slot:firstOrderNum="{ row, $index }">
                <el-input
                  class="vui-hnm"
                  v-if="actionDialog.form.productList[$index].checked"
                  type="number"
                  size="mini"
                  v-model.number="actionDialog.form.productList[$index].firstOrderNum"
                  title=""
                />
              </template>
              <template v-slot:orderNum="{ row, $index }">
                <el-input
                  class="vui-hnm"
                  v-if="actionDialog.form.productList[$index].checked"
                  type="number"
                  size="mini"
                  v-model.number="actionDialog.form.productList[$index].orderNum"
                  title=""
                />
              </template>
              <template v-slot:orderPrice="{ row, $index }">
                <el-input
                  class="vui-hnm"
                  v-if="actionDialog.form.productList[$index].checked"
                  type="number"
                  size="mini"
                  v-model.number="actionDialog.form.productList[$index].orderPrice"
                  title=""
                />
              </template>
            </ele-table>
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
                v-model.number="actionDialog.form.recommValue"
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
            <ele-table
              style="margin-top: -10px;"
              :data="tableKhq.result.data"
              :columns="tableKhq.columns"
              :loading="tableKhq.result.loading"
              :total.sync="tableKhq.result.totalCount"
              :page-no.sync="tableKhq.query.pageNo"
              :page-size.sync="tableKhq.query.pageSize"
              size="mini"
              @request="onRequest"
            >
              <template v-slot:exemption="{ row }">
                <ValidationProvider name="免考期" rules="required" v-slot="{ classes, errors }">
                  <el-input class="vui-hnm" type="number" size="mini" v-model.number="row.exemption" title=""
                    ><template slot="append">天</template></el-input
                  >
                  <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
                </ValidationProvider>
              </template>
              <template v-slot:examine="{ row }">
                <ValidationProvider name="考核期" rules="required" v-slot="{ classes, errors }">
                  <el-input class="vui-hnm vui-mb10" type="number" size="mini" v-model.number="row.examine" title=""
                    ><template slot="append">天</template></el-input
                  >
                  <el-input class="vui-hnm" type="number" size="mini" v-model.number="row.examineNum" title=""
                    ><template slot="append">台</template></el-input
                  >
                  <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
                </ValidationProvider>
              </template>
              <template v-slot:purchase="{ row }">
                <ValidationProvider name="预警器" rules="required" v-slot="{ classes, errors }">
                  <el-input class="vui-hnm vui-mb10" type="number" size="mini" v-model.number="row.purchase" title=""
                    ><template slot="append">天</template></el-input
                  >
                  <el-input class="vui-hnm" type="number" size="mini" v-model.number="row.purchaseNum" title=""
                    ><template slot="append">台</template></el-input
                  >
                  <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
                </ValidationProvider>
              </template>
            </ele-table>
            <p class="vui-g9">
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
                :rows="3"
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
import {
  IEleTableColumn,
  IEleTableOperationData,
  IEleTableRequestData
} from '../../../lib/element-ui-helper/components/table';

import { Layout } from '../../layout';
import { ApiService } from '../../services/api.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import {
  AgentLevel,
  AgentType,
  DerateCondition,
  DerateStatus,
  DerateType,
  PaidStatus,
  PaymentType,
  RechargeType,
  RewardType
} from '../../global';
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

  table: IEleTableOperationData = {
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
    ],
    query: {
      pageNo: 1,
      pageSize: 10
    },
    result: {
      loading: false,
      totalCount: 0,
      data: []
    }
  };

  tableProduct: IEleTableOperationData = {
    columns: [
      {
        label: '#',
        name: 'check',
        width: 35
      },
      {
        label: '产品名称',
        name: 'productName'
      },
      {
        label: '首次申请量（台）',
        name: 'firstOrderNum',
        width: 120
      },
      {
        label: '进货量（台）',
        name: 'orderNum',
        width: 120
      },
      {
        label: '订货价格(￥)',
        name: 'orderPrice',
        width: 120
      }
    ],
    query: {
      pageNo: 1,
      pageSize: 10
    },
    result: {
      data: []
    }
  };

  tableKhq: IEleTableOperationData = {
    columns: [
      {
        label: '免考期',
        name: 'exemption',
        width: 120
      },
      {
        label: '考核期',
        name: 'examine',
        width: 120
      },
      {
        label: '预警期',
        name: 'purchase',
        width: 120
      }
    ],
    query: {
      pageNo: 1,
      pageSize: 10
    },
    result: {
      data: [
        {
          exemption: null,
          examine: null,
          examineNum: null,
          purchase: null,
          purchaseNum: null
        }
      ]
    }
  };

  actionDialog = {
    loading: false,
    uploading: false,
    visible: false,
    form: {
      id: '',
      productList: []
    }
  };

  onRequest(request: IEleTableRequestData) {
    this.table.query.pageNo = request.params.pageNo;
    this.table.query.pageSize = request.params.pageSize;
    this.loadData();
  }

  getProductName(productId) {
    const item = this.tableProduct.result.data.find((x) => x.id === productId);
    if (item) {
      return item.productName;
    }
    return '未知名称';
  }

  created() {
    this.loadData();
  }

  add() {
    this.actionDialog.visible = true;
    this.actionDialog.form.productList = this.tableProduct.result.data.map((x) => ({
      id: x.id,
      checked: false,
      firstOrderNum: '',
      orderNum: '',
      orderPrice: ''
    }));
  }

  update(row) {
    this.actionDialog.form.id = row.id;
    this.actionDialog.form.productList = this.tableProduct.result.data.map((x) => ({
      id: x.id,
      checked: false,
      firstOrderNum: '',
      orderNum: '',
      orderPrice: ''
    }));
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
        const data: any = this.actionDialog.form;
        data.orderProductList = this.actionDialog.form.productList.filter((x) => x.checked);
        if (!data.orderProductList.length) {
          return this.$notify.error('请至少选择一个产品！');
        }
        this.actionDialog.uploading = true;
        if (data.id) {
          ApiService.agentLevel_update(data)
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
          ApiService.agentLevel_add(data)
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
    this.table.result.loading = true;
    return Promise.all([
      ApiService.product_list({ pageNo: 1, pageSize: 10000 }),
      ApiService.agentLevel_page({ pageNo: this.table.query.pageNo, pageSize: this.table.query.pageSize })
    ])
      .then((res: any) => {
        const [data1, data2] = res;
        this.tableProduct.result.data = data1;
        if (data2 && data2.rows) {
          this.table.result.data = data2.rows;
          this.table.result.totalCount = data2.totalCount;
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
