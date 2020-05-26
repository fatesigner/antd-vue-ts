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
          <p class="vui-g9">{{ row.createTime | dateFormat }}</p>
          <p class="vui-g9">单号：{{ row.rechargeNo }}</p>
        </div>
      </template>
      <template v-slot:parentLevelName="{ row }">
        级别：{{ row.levelName }}<br />
        姓名：{{ row.parentName }}<br />
        电话：{{ row.parentPhone }}
      </template>
      <template v-slot:checkStatus="{ row }">
        <div :class="{ completed: row.checkStatus === CheckedStatus.enum.completed }">
          {{ CheckedStatus.desc[row.checkStatus] }}
        </div>
        <div v-if="row.updateBy">
          <div v-if="row.checkStatus === CheckedStatus.enum.completed">审核人；{{ row.updateBy }}</div>
          <div v-if="row.checkStatus === CheckedStatus.enum.canceled">取消人；{{ row.updateBy }}</div>
        </div>
        <div v-if="row.updateTime">{{ row.updateTime | dateFormat }}</div>
      </template>
      <template v-slot:actions="{ row }">
        <el-link v-if="getAuditStatus(row)" type="warning" icon="el-icon-edit-outline" @click="onLook(row)"
          >审核</el-link
        >
        <el-link v-else type="primary" @click="onLook(row)">查看</el-link>
      </template>
    </ele-table>
    <ele-lazy-dialog
      class="action-dialog"
      :title="actionDialog.title"
      :visible.sync="actionDialog.visible"
      :comp="actionDialog.comp"
    />
    <!--<ele-dialog custom-class="action-dialog" :title="actionDialog.title" :visible.sync="actionDialog.visible">
      <div class="vui-padding vui-tc" v-if="actionDialog.loading">
        <ele-loading :size="40" />
      </div>
      <div v-else class="vui-row">
        <div class="vui-col-auto">
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
              {{ PaymentType.desc[actionDialog.data.payType] }}
            </el-form-item>
            <el-form-item label="充值金额">
              {{ actionDialog.data.handleAmount | currency }}
            </el-form-item>
            <el-form-item label="应付金额">
              {{ actionDialog.data.handleAmount | currency }}
            </el-form-item>
            <el-form-item label="实付金额">
              <el-input
                v-if="actionDialog.___financial"
                v-model.number="actionDialog.___actuallyAmount"
                placeholder="输入实付金额"
                style="width: 15em;"
                title=""
              />
              <div class="vui-orange" v-else>{{ actionDialog.data.actualAmount | currency }}</div>
              &lt;!&ndash;<p>在2020年5月31日前成为战略服务商可一次性享受19880元创业金</p>
              <p>成为校长级或者升级为校长级可一次性享有6680元创业金</p>&ndash;&gt;
            </el-form-item>
            <el-form-item label="当前余额" v-if="actionDialog.data.amount">
              {{ (actionDialog.data.amount.amount + actionDialog.data.amount.rebateAmount) | currency }}
            </el-form-item>
            <el-form-item label="充值后余额">
              {{ actionDialog.data.rechargeRearAmount | currency }}
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
        <div class="vui-col-auto" v-if="actionDialog.records.length">
          <el-form class="vui-col" label-width="80px">
            <template v-for="record in actionDialog.records">
              <div class="vui-mt10" v-if="!!record.id">
                {{ record.title }}
                <p class="vui-g9">{{ record.createTime | dateFormat }}</p>
              </div>
              <div class="vui-mt10" v-else>
                <Checkbox v-model="record.checked">{{ record.title }}</Checkbox>
              </div>
              <div class="vui-mt10" v-if="!!record.id">
                <el-input type="textarea" :disabled="!!record.id" v-model="record.remark" title="" />
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
                <ImgSelect class="vui-mt10" :imgList="record.approvalImage" :hasPlace="false" :maxLength="3" />
                <p>最多上传三张，单张10M之内</p>
                <p class="vui-orange">{{ record.desc }}</p>
                <div class="vui-mt10">
                  <ele-button type="primary" @click="handle(record, record.checkStatus1, 1)">提交</ele-button>
                  <ele-button type="text" @click="handle(record, record.checkStatus2, 2)">取消本次订单</ele-button>
                </div>
              </template>
            </template>
          </el-form>
        </div>
      </div>
    </ele-dialog>-->
  </layout>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IsNullOrUndefined, IsNumber } from '@forgleaner/utils/type-check';

import { Layout } from '../../layout';
import { SessionService } from '../../services/session.service';
import { ApiService } from '../../services/api.service';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { RadioButtons } from '../../shared/radio-buttons';
import { AgentLevel, AgentType, CheckedStatus, PaidStatus, PaymentType, RechargeType, Role } from '../../global';
import { IColumn, IRequestData } from '../../../lib/element-ui-helper/components/table';

@Component({
  name: 'Prepaid',
  components: {
    Layout,
    RadioButtons
  }
})
export default class extends Vue {
  CheckedStatus = CheckedStatus;
  PaymentType = PaymentType;

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
      options: AgentType.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
    },
    {
      label: '级别',
      name: 'agentLevel',
      value: null,
      options: AgentLevel.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
    },
    {
      label: '状态',
      name: 'status',
      value: null,
      options: PaidStatus.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
    },
    {
      label: '充值类型',
      name: 'rechargeType',
      value: null,
      options: RechargeType.arr.map((x) => ({ label: x.text, value: x.value, count: 0 }))
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
        return `${PaymentType.desc[row.payType]}`;
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
      fixed: 'right',
      template: (row) => {
        return `${PaidStatus.desc[row.status]}`;
      }
    },
    { label: '操作', name: 'actions', width: 80, fixed: 'right' }
  ];

  actionDialog = {
    comp: () => import('./PrepaidAudit.vue'),
    loading: false,
    visible: false,
    title: '',
    remarkLengthLimit: 100,
    data: {},
    records: [],
    currentStatus: '',
    ___actuallyAmount: null,
    ___financial: false
  };

  @Watch('radioButtons')
  onRadioButtonsChange() {
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

  // 点击查看
  onLook(row) {
    this.actionDialog.title = '查看详情';
    this.actionDialog.visible = true;
    this.actionDialog.loading = true;
    this.actionDialog.data = row;
    // 获取详情
    ApiService.agentAccountFlow_detail(row.id)
      .then((data: any) => {
        (this.actionDialog.data as any).amount = data.amount;
        (this.actionDialog.data as any).picture = data.picture;
        (this.actionDialog.data as any).recommender = data.recommender;
        this.actionDialog.___actuallyAmount = data.actualAmount;
        const record = {
          title: '',
          desc: '',
          checked: false,
          checkStatus1: null,
          checkStatus2: null,
          remark: '',
          approvalImage: []
        };
        const isd = this.getAuditStatus(row);
        if (row.checkStatus == CheckedStatus.enum.completed || row.checkStatus == CheckedStatus.enum.财务审核不通过) {
          this.actionDialog.currentStatus = '等待专员审核';
        } else if (row.checkStatus == CheckedStatus.enum.专员审核通过) {
          this.actionDialog.currentStatus = '等待财务审核';
        } else {
          this.actionDialog.currentStatus = CheckedStatus.desc[row.checkStatus];
        }
        if (isd === 1) {
          record.checkStatus1 = CheckedStatus.enum.专员审核通过;
          record.checkStatus2 = CheckedStatus.enum.专员审核不通过;
          record.title = '专员审核 ' + SessionService.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入财务审核';
        } else if (isd === 2) {
          record.checkStatus1 = CheckedStatus.enum.财务审核通过;
          record.checkStatus2 = CheckedStatus.enum.财务审核不通过;
          record.title = '财务审核 ' + SessionService.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入仓储“待发货”';
          this.actionDialog.___financial = true;
        }
        this.actionDialog.records = [...data.approvalFlows];
        if (record.title) {
          this.actionDialog.records.push(record);
        }
      })
      .finally(() => {
        this.actionDialog.loading = false;
      });
  }

  // 判断指定订单的状态是否为专员或者财务待审核
  getAuditStatus(row) {
    if (
      SessionService.user.roles.indexOf(Role.enum.sale_commissioner) > -1 &&
      (row.checkStatus == 1 || row.checkStatus == 14) &&
      row.status == 2 &&
      row.receiverId == 1
    ) {
      return 1;
    } else if (
      SessionService.user.roles.indexOf(Role.enum.sale_financial) > -1 &&
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

<style lang="scss" scoped>
.action-dialog {
  .top {
    text-align: center;

    .h2 {
      font-size: 20px;
      color: green;
    }
  }

  .el-form-item {
    padding: 5px 10px;
    margin: 10px 0;
    background-color: #eee;
    border-radius: 4px;
  }

  h2 {
    padding: 10px 5px;
    font-size: 14px;
  }
}
</style>
