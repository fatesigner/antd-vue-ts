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
      :data="result.data"
      :columns="columns"
      :indexed="true"
      :loading="result.loading"
      :total.sync="result.totalCount"
      :page-no.sync="query.pageNo"
      :page-size.sync="query.pageSize"
      @request="onRequest"
    >
      <template v-slot:agentName="{ row }">
        <div class="vui-pt10 vui-pb10">
          {{ row.agentName }}&nbsp;&nbsp;&nbsp;&nbsp;{{ row.levelName }}<br />
          {{ row.phone }}<br />
          <p style="color: #999;">{{ row.createTime | dateFormat }}</p>
          <p style="color: #999;">单号：{{ row.rechargeNo }}</p>
        </div>
      </template>
      <template v-slot:parentLevelName="{ row }">
        级别：{{ row.levelName }}<br />
        姓名：{{ row.parentName }}<br />
        电话：{{ row.parentPhone }}
      </template>
      <template v-slot:checkStatus="{ row }">
        <div :class="{ completed: row.checkStatus === models.checkedStatusEnum.completed }">
          {{ models.checkedStatusDesc[row.checkStatus] }}
        </div>
        <div v-if="row.updateBy">
          <div v-if="row.checkStatus === models.checkedStatusEnum.completed">审核人；{{ row.updateBy }}</div>
          <div v-if="row.checkStatus === models.checkedStatusEnum.canceled">取消人；{{ row.updateBy }}</div>
        </div>
        <div v-if="row.updateTime">{{ row.updateTime | dateFormat }}</div>
      </template>
      <template v-slot:actions="{ row }">
        <el-link v-if="getAuditStatus(row)" type="warning" icon="el-icon-edit-outline" @click="onAudit(row)"
        >审核</el-link
        >
        <el-link v-else type="primary" @click="onLook(row)">查看</el-link>
      </template>
    </ele-table>
    <template slot="append">
      <el-dialog custom-class="action-dialog" :title="actionDialog.title" :visible.sync="actionDialog.visible">
        <div class="vui-row">
          <div class="vui-col-auto" style="width: 360px;">
            <el-form class="vui-col" label-width="80px">
              <div class="top">
                <h2>当前状态：{{ actionDialog.currentStatus }}</h2>
                <p>订单号：{{ actionDialog.data.rechargeNo }}</p>
                <p>时间：{{ actionDialog.data.createTime | dateFormat }}</p>
              </div>
              <h2>充值信息</h2>
              <el-form-item label="提交人">
                {{ actionDialog.data.agentName }}&nbsp;&nbsp;&nbsp;{{ actionDialog.data.phone }}
              </el-form-item>
              <el-form-item label="充值方式">
                {{ models.paymentTypeDesc[actionDialog.data.payType] }}
              </el-form-item>
              <el-form-item label="充值金额">
                {{ actionDialog.data.actualAmount | currency }}
              </el-form-item>
              <el-form-item label="应付金额">
                {{ actionDialog.data.actualAmount | currency }}
              </el-form-item>
              <el-form-item label="实付金额">
                <el-input
                  v-if="true"
                  v-model.number="actionDialog.___actuallyAmount"
                  placeholder="输入实付金额"
                  style="width: 15em;"
                  title=""
                />
                <div style="color: darkorange;" v-else>{{ actionDialog.data.actualAmount | currency }}</div>
                <!--<p>在2020年5月31日前成为战略服务商可一次性享受19880元创业金</p>
                <p>成为校长级或者升级为校长级可一次性享有6680元创业金</p>-->
              </el-form-item>
              <el-form-item label="当前余额" v-if="actionDialog.data.amount">
                {{ (actionDialog.data.amount.amount + actionDialog.data.amount.rebateAmount) | currency }}
              </el-form-item>
              <el-form-item label="充值后余额" v-if="actionDialog.data.amount">
                {{
                  (actionDialog.data.amount.amount +
                    actionDialog.data.amount.rebateAmount +
                    actionDialog.data.handleAmount)
                    | currency
                }}
              </el-form-item>
              <h2>上级关系</h2>
              <el-form-item label="当前上级">
                {{ actionDialog.data.parentName }}
              </el-form-item>
              <el-form-item label="电话">
                {{ actionDialog.data.parentPhone }}
              </el-form-item>
              <h2>
                推荐关系
                <p>(邀请当前提交人申请本次服务商的用户)</p>
              </h2>
              <el-form-item label="推荐人">
                {{ actionDialog.data.parentName }}
              </el-form-item>
              <el-form-item label="电话">
                {{ actionDialog.data.parentPhone }}
              </el-form-item>
              <el-form-item label="推荐人上级" v-if="actionDialog.data.recommender">
                <div v-if="actionDialog.data.recommender.parentAgentName">
                  姓名：{{ actionDialog.data.recommender.parentAgentName }}
                </div>
                <div v-if="!actionDialog.data.recommender.parentAgentLevel">内部销售没有上级</div>
                <div v-else>级别：{{ actionDialog.data.recommender.parentAgentLevel }}级</div>
              </el-form-item>
              <el-form-item label="电话">
                {{ actionDialog.data.parentPhone }}
              </el-form-item>
              <template v-if="actionDialog.data.picture && actionDialog.data.picture.length">
                <h2>支付凭证</h2>
                <div class="img-item" v-for="item in actionDialog.data.picture" :key="item.fileKey">
                  <img :src="item.url" alt="" title="" />
                </div>
              </template>
              <template v-if="actionDialog.data.positivePicUrl">
                <h2>身份证正面</h2>
                <div class="img-item">
                  <img :src="actionDialog.data.positivePicUrl" alt="" title="" />
                </div>
              </template>
              <template v-if="actionDialog.data.reversePicUrl">
                <h2>身份证反面</h2>
                <div class="img-item">
                  <img :src="actionDialog.data.reversePicUrl" alt="" title="" />
                </div>
              </template>
              <template v-if="actionDialog.data.licensePicUrl">
                <h2>营业执照</h2>
                <div class="img-item">
                  <img :src="actionDialog.data.licensePicUrl" alt="" title="" />
                </div>
              </template>
            </el-form>
          </div>
          <div class="vui-col-auto" v-if="actionDialog.records.length" style="width: 360px;">
            <el-form class="vui-col" label-width="80px">
              <template v-for="record in actionDialog.records">
                <div class="vui-mt10" v-if="!!record.id">
                  {{ record.title }}
                  <p style="color: #999;">{{ record.createTime | dateFormat }}</p>
                </div>
                <div class="vui-mt10" v-else>
                  <Checkbox v-model="record.checked">{{ record.title }}</Checkbox>
                </div>
                <div class="vui-mt10" v-if="!!record.id">
                  <el-input
                    type="textarea"
                    :disabled="!!record.id"
                    v-model="record.remark"
                    style="width: 300px;"
                    title=""
                  />
                </div>
                <div class="vui-mt10" v-else>
                  <el-input
                    type="textarea"
                    :disabled="!!record.id"
                    v-model="record.remark"
                    :maxlength="actionDialog.remarkLengthLimit"
                    show-word-limit
                    :autosize="{ minRows: 3 }"
                    placeholder="输入审核备注..."
                    style="width: 300px;"
                  />
                </div>
                <div v-if="record.pictures">
                  <div class="img-item" v-for="item in record.pictures" :key="item.fileKey">
                    <img :src="item.url" alt="" title="" />
                  </div>
                </div>
                <template v-else>
                  <ImgSelect
                    style="margin-top: 10px;"
                    :imgList="record.approvalImage"
                    :hasPlace="false"
                    :maxLength="3"
                  />
                  <p>最多上传三张，单张10M之内</p>
                  <p style="color: green;">{{ record.desc }}</p>
                  <div style="margin-top: 10px;">
                    <Button type="primary" @click="handle(record, record.checkStatus1, 1)">提交</Button>
                    <Button type="text" @click="handle(record, record.checkStatus2, 2)">取消本次订单</Button>
                  </div>
                </template>
              </template>
            </el-form>
          </div>
        </div>
      </el-dialog>
    </template>
  </layout>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';
import { EleTable, IColumn, IRequestData } from '../../lib/element-ui-helper/components/table';

import { ApiService } from '../../api/api';
import { Session } from '../../session';
import { Layout } from '../../layouts';
import { RoleEnum } from '../../../config/role';
import { RechargeTypeItems } from '../../../config/recharge-type';
import { AgentLevelItems } from '../../../config/agent-level';
import { AgentTypeItems } from '../../../config/agent-type';
import { PaidStatusDesc, PaidStatusItems } from '../../../config/paid-status';
import { PaymentTypeDesc, PaymentTypeEnum } from '../../../config/payment-type';
import { CheckedStatusDesc, CheckedStatusEnum } from '../../../config/checked-status';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../components/radio-buttons';

@Component({
  name: 'Prepaid',
  components: {
    Layout,
    RadioButtons,
    EleTable
  }
})
export default class extends Vue {
  models = {
    checkedStatusEnum: CheckedStatusEnum,
    checkedStatusDesc: CheckedStatusDesc,
    paymentTypeEnum: PaymentTypeEnum,
    paymentTypeDesc: PaymentTypeDesc,
    paidStatusDesc: PaidStatusDesc
  };

  query = {
    keyword: null,
    orderNo: null,
    pageNo: 1,
    pageSize: 10
  };

  result = {
    loading: false,
    totalCount: 0,
    data: []
  };

  radioButtons = [
    {
      label: '用户类型',
      name: 'agentType',
      value: null,
      options: AgentTypeItems.map((x) => ({ label: x.text, value: x.value, count: 0 }))
    },
    {
      label: '级别',
      name: 'agentLevel',
      value: null,
      options: AgentLevelItems.map((x) => ({ label: x.text, value: x.value, count: 0 }))
    },
    {
      label: '状态',
      name: 'status',
      value: null,
      options: PaidStatusItems.map((x) => ({ label: x.text, value: x.value, count: 0 }))
    },
    {
      label: '充值类型',
      name: 'rechargeType',
      value: null,
      options: RechargeTypeItems.map((x) => ({ label: x.text, value: x.value, count: 0 }))
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
        return `${PaymentTypeDesc[row.payType]}`;
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
      template: (row) => {
        return `${PaidStatusDesc[row.status]}`;
      }
    },
    { label: '操作', name: 'actions', width: 80, fixed: 'right' }
  ];

  actionDialog = {
    visible: false,
    title: '',
    remarkLengthLimit: 100,
    data: {},
    records: [],
    currentStatus: '',
    ___actuallyAmount: null
  };

  @Watch('radioButtons')
  onRadioButtonsChange(val) {
    this.query.pageNo = 1;
    this.loadData();
  }

  onRequest(request: IRequestData) {
    this.query.pageNo = request.params.pageNo;
    this.query.pageSize = request.params.pageSize;
    this.loadData();
  }

  created() {
    this.loadData();
    // 获取 radio 选项
    ApiService.agentAccountFlow_statistics().then((res) => {
      if (res) {
        this.radioButtons.forEach((item) => {
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

  // 点击审核
  onAudit() {
    this.actionDialog.title = '审核';
    this.actionDialog.visible = true;
  }

  // 点击查看
  onLook(row) {
    this.actionDialog.title = '查看详情';
    this.actionDialog.visible = true;
    // 获取详情
    ApiService.agentAccountFlow_detail(row.id).then((data: any) => {
      this.$nextTick(() => {
        this.actionDialog.data = data;
        const record = {
          title: '',
          desc: '',
          checkStatus1: 0,
          checkStatus2: 0,
          checked: false,
          remark: '',
          approvalImage: []
        };
        const isd = this.getAuditStatus(row);
        if (row.checkStatus == 1 || row.checkStatus == 14) {
          this.actionDialog.currentStatus = '等待专员审核';
        } else if (row.checkStatus == 11) {
          this.actionDialog.currentStatus = '等待财务审核';
        } else {
          this.actionDialog.currentStatus = this.models.checkedStatusDesc[row.checkStatus];
        }
        if (isd === 1) {
          record.checkStatus1 = 11;
          record.checkStatus2 = 12;
          record.title = '专员审核 ' + Session.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入财务审核';
        } else if (isd === 2) {
          record.checkStatus1 = 13;
          record.checkStatus2 = 14;
          record.title = '财务审核 ' + Session.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入仓储“待发货”';
        }
        this.actionDialog.records = [...data.approvalFlows];
        if (record.title) {
          this.actionDialog.records.push(record);
        }
      });
    });
  }

  // 判断指定订单的状态是否为专员或者财务待审核
  getAuditStatus(row) {
    if (
      Session.user.roles.indexOf(RoleEnum.sale_commissioner) > -1 &&
      (row.checkStatus == 1 || row.checkStatus == 14) &&
      row.status == 2 &&
      row.receiverId == 1
    ) {
      return 1;
    } else if (
      Session.user.roles.indexOf(RoleEnum.sale_financial) > -1 &&
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
    if (!IsNullOrUndefined(this.query.keyword)) {
      if (IsNumber(this.query.keyword)) {
        params.phone = this.query.keyword;
      } else {
        params.agentName = this.query.keyword || null;
      }
    }
    params = this.radioButtons.reduce((prev, cur) => {
      prev[cur.name] = cur.value;
      return prev;
    }, params);
    this.result.loading = true;
    return ApiService.agentAccountFlow_page({
      pageNo: this.query.pageNo,
      pageSize: this.query.pageSize,
      rechargeNo: this.query.keyword,
      ...params
    })
      .then((res: any) => {
        if (res && res.rows) {
          // 添加序号
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

<style lang="scss">
.action-dialog {
  max-width: 80%;
  margin-top: 20px;

  .el-dialog__header {
    text-align: center;
  }

  .el-dialog__title {
    font-size: 20px;
    font-weight: bold;
  }

  .el-dialog__body {
    padding-top: 0;
  }

  .top {
    text-align: center;
    .h2 {
      color: green;
      font-size: 20px;
    }
  }

  .el-form-item {
    margin: 10px 0;
    padding: 5px 10px;
    border-radius: 4px;
    background-color: #eee;
  }

  h2 {
    padding: 10px 5px;
    font-size: 14px;
  }
}
</style>
