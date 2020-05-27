<template>
  <div class="prepaid-audit">
    <div class="vui-padding vui-tc" v-if="loading">
      <ele-loading :size="40" />
    </div>
    <div v-else class="vui-row">
      <div class="vui-col-auto">
        <el-form class="vui-col" label-width="80px">
          <div class="top">
            <h2>当前状态：{{ currentStatus }}</h2>
            <p>订单号：{{ data.rechargeNo }}</p>
            <p>时间：{{ data.createTime | dateFormat }}</p>
          </div>
          <h2>充值信息</h2>
          <el-form-item label="提交人"> {{ data.agentName }}&nbsp;&nbsp;&nbsp;{{ data.phone }} </el-form-item>
          <el-form-item label="充值方式">
            {{ PaymentType.desc[data.payType] }}
          </el-form-item>
          <el-form-item label="充值金额">
            {{ data.handleAmount | currency }}
          </el-form-item>
          <el-form-item label="应付金额">
            {{ data.handleAmount | currency }}
          </el-form-item>
          <el-form-item label="实付金额">
            <el-input
              v-if="___financial"
              v-model.number="___actuallyAmount"
              placeholder="输入实付金额"
              style="width: 15em;"
              title=""
            />
            <div class="vui-orange" v-else>{{ data.actualAmount | currency }}</div>
            &lt;!&ndash;
            <p>在2020年5月31日前成为战略服务商可一次性享受19880元创业金</p>
            <p>成为校长级或者升级为校长级可一次性享有6680元创业金</p>
            &ndash;&gt;
          </el-form-item>
          <el-form-item label="当前余额" v-if="data.amount">
            {{ (data.amount.amount + data.amount.rebateAmount) | currency }}
          </el-form-item>
          <el-form-item label="充值后余额">
            {{ data.rechargeRearAmount | currency }}
          </el-form-item>
          <h2>上级关系</h2>
          <el-form-item label="当前上级">
            {{ data.parentName }}
          </el-form-item>
          <el-form-item label="电话">
            {{ data.parentPhone }}
          </el-form-item>
          <h2>
            推荐关系
            <p>(邀请当前提交人申请本次服务商的用户)</p>
          </h2>
          <el-form-item label="推荐人">
            {{ data.parentName }}
          </el-form-item>
          <el-form-item label="电话">
            {{ data.parentPhone }}
          </el-form-item>
          <el-form-item label="推荐人上级" v-if="data.recommender">
            <div v-if="data.recommender.parentAgentName">姓名：{{ data.recommender.parentAgentName }}</div>
            <div v-if="!data.recommender.parentAgentLevel">内部销售没有上级</div>
            <div v-else>级别：{{ data.recommender.parentAgentLevel }}级</div>
          </el-form-item>
          <el-form-item label="电话">
            {{ data.parentPhone }}
          </el-form-item>
          <template v-if="data.picture && data.picture.length">
            <h2>支付凭证</h2>
            <div class="img-item" v-for="item in data.picture" :key="item.fileKey">
              <img :src="item.url" alt="" title="" />
            </div>
          </template>
          <template v-if="data.positivePicUrl">
            <h2>身份证正面</h2>
            <div class="img-item">
              <img :src="data.positivePicUrl" alt="" title="" />
            </div>
          </template>
          <template v-if="data.reversePicUrl">
            <h2>身份证反面</h2>
            <div class="img-item">
              <img :src="data.reversePicUrl" alt="" title="" />
            </div>
          </template>
          <template v-if="data.licensePicUrl">
            <h2>营业执照</h2>
            <div class="img-item">
              <img :src="data.licensePicUrl" alt="" title="" />
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
                :maxlength="remarkLengthLimit"
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
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { CheckedStatus } from '../../global';

@Component({
  name: 'PrepaidAudit'
})
export default class extends Vue {
  @Prop({ default: null }) data: any;
  @Prop({ default: null }) audioStatus: number;

  data_: any = {};
  loading = true;
  title = '';
  remarkLengthLimit = 100;
  records = [];
  currentStatus = '';
  ___actuallyAmount = null;
  ___financial = false;

  @Watch('data')
  onDataChange(val) {
    this.data_ = val;
  }

  mounted() {
    // 获取详情
    ApiService.agentAccountFlow_detail(this.data_.id)
      .then((data: any) => {
        this.data_.amount = data.amount;
        this.data_.picture = data.picture;
        this.data_.recommender = data.recommender;
        this.___actuallyAmount = data.actualAmount;

        if (
          this.data_.checkStatus == CheckedStatus.enum.completed ||
          this.data_.checkStatus == CheckedStatus.enum.财务审核不通过
        ) {
          this.currentStatus = '等待专员审核';
        } else if (this.data_.checkStatus == CheckedStatus.enum.专员审核通过) {
          this.currentStatus = '等待财务审核';
        } else {
          this.currentStatus = CheckedStatus.desc[this.data_.checkStatus];
        }

        const record = {
          title: '',
          desc: '',
          checked: false,
          checkStatus1: null,
          checkStatus2: null,
          remark: '',
          approvalImage: []
        };

        if (this.audioStatus === 1) {
          record.checkStatus1 = CheckedStatus.enum.专员审核通过;
          record.checkStatus2 = CheckedStatus.enum.专员审核不通过;
          record.title = '专员审核 ' + SessionService.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入财务审核';
        } else if (this.audioStatus === 2) {
          record.checkStatus1 = CheckedStatus.enum.财务审核通过;
          record.checkStatus2 = CheckedStatus.enum.财务审核不通过;
          record.title = '财务审核 ' + SessionService.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入仓储“待发货”';
          this.___financial = true;
        }
        this.records = [...data.approvalFlows];
        if (record.title) {
          this.records.push(record);
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
.prepaid-audit {
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
