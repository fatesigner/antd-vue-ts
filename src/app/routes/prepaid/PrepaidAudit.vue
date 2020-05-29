<template>
  <div class="vui-row vui-justify-content-center">
    <div class="vui-padding vui-tc" v-if="loading">
      <ele-loading :size="40" />
    </div>
    <template v-else>
      <div class="vui-col-auto">
        <el-form class="vui-col" style="width: 320px;">
          <div class="top">
            <h2 class="top-title">当前状态：{{ CheckedStatus.desc[data_.checkStatus] }}</h2>
            <p>订单号：{{ data_.rechargeNo }}</p>
            <p>时间：{{ data_.createTime | dateFormat }}</p>
          </div>
          <h2>充值信息</h2>
          <el-form-item label="提交人"> {{ data_.agentName }}&nbsp;&nbsp;&nbsp;{{ data_.phone }} </el-form-item>
          <el-form-item label="充值方式">
            {{ PaymentType.desc[data_.payType] }}
          </el-form-item>
          <el-form-item label="充值金额">
            {{ data_.handleAmount | currency }}
          </el-form-item>
          <el-form-item label="应付金额">
            {{ data_.handleAmount | currency }}
          </el-form-item>
          <el-form-item label="实付金额">
            <el-input
              v-if="financial"
              v-model.number="actuallyAmount"
              placeholder="输入实付金额"
              style="width: 150px;"
              title=""
            />
            <div class="vui-orange" v-else>{{ data_.actualAmount | currency }}</div>
            <!--<p>在2020年5月31日前成为战略服务商可一次性享受19880元创业金</p>
            <p>成为校长级或者升级为校长级可一次性享有6680元创业金</p>-->
          </el-form-item>
          <el-form-item label="当前余额" v-if="data_.amount">
            {{ (data_.amount.amount + data_.amount.rebateAmount) | currency }}
          </el-form-item>
          <el-form-item label="充值后余额">
            {{ data_.rechargeRearAmount | currency }}
          </el-form-item>
          <h2>上级关系</h2>
          <el-form-item label="当前上级">
            {{ data_.parentName }}
          </el-form-item>
          <el-form-item label="电话">
            {{ data_.parentPhone }}
          </el-form-item>
          <h2>
            推荐关系
            <p>(邀请当前提交人申请本次服务商的用户)</p>
          </h2>
          <el-form-item label="推荐人">
            {{ data_.parentName }}
          </el-form-item>
          <el-form-item label="电话">
            {{ data_.parentPhone }}
          </el-form-item>
          <el-form-item label="推荐人上级" v-if="data_.recommender">
            <div v-if="data_.recommender.parentAgentName">姓名：{{ data_.recommender.parentAgentName }}</div>
            <div v-if="!data_.recommender.parentAgentLevel">内部销售没有上级</div>
            <div v-else>级别：{{ data_.recommender.parentAgentLevel }}级</div>
          </el-form-item>
          <el-form-item label="电话">
            {{ data_.parentPhone }}
          </el-form-item>
          <template v-if="data_.picture && data_.picture.length">
            <h2>支付凭证</h2>
            <div class="img-item" v-for="item in data_.picture" :key="item.fileKey">
              <img :src="item.url" alt="" title="" />
            </div>
          </template>
          <template v-if="data_.positivePicUrl">
            <h2>身份证正面</h2>
            <div class="img-item">
              <img :src="data_.positivePicUrl" alt="" title="" />
            </div>
          </template>
          <template v-if="data_.reversePicUrl">
            <h2>身份证反面</h2>
            <div class="img-item">
              <img :src="data_.reversePicUrl" alt="" title="" />
            </div>
          </template>
          <template v-if="data_.licensePicUrl">
            <h2>营业执照</h2>
            <div class="img-item">
              <img :src="data_.licensePicUrl" alt="" title="" />
            </div>
          </template>
        </el-form>
      </div>
      <div class="vui-col-auto" v-if="records.length" style="width: 300px;">
        <el-form class="vui-col" label-width="80px">
          <template v-for="record in records">
            <div class="vui-mt10" v-if="!!record.id">
              {{ record.title }}
              <p class="vui-g9">{{ record.createTime | dateFormat }}</p>
            </div>
            <div class="vui-mt10" v-else>
              <el-checkbox v-model="record.checked">{{ record.title }}</el-checkbox>
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
            <div v-if="record.id">
              <div class="img-item" v-for="item in record.approvalImage" :key="item.fileKey">
                <img :src="item.url" alt="" title="" />
              </div>
            </div>
            <template v-else>
              <ele-uploader
                class="vui-mt10"
                :files="record.approvalImage"
                :width="uploader.width"
                :multiple="uploader.multiple"
                :max-count="uploader.maxCount"
                :max-size="uploader.maxSize"
                :immediate="uploader.immediate"
                :action="onUploadStart"
                @failed="onUploaderFailed($event)"
              />
              <p class="vui-mt10 vui-g9">最多上传三张，单张10M之内</p>
              <p class="vui-mt10 vui-orange">{{ record.desc }}</p>
              <div class="vui-mt10">
                <el-button type="primary" @click="handle(record, record.checkStatus1, 1)">提交</el-button>
                <el-button type="text" @click="handle(record, record.checkStatus2, 2)">取消本次订单</el-button>
              </div>
            </template>
          </template>
        </el-form>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IEleUploaderOptions } from '../../../lib/element-ui-helper/components/uploader';

import { CheckedStatus, PaymentType } from '../../global';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { QiniuService } from '../../../lib/qiniu';

@Component({
  name: 'PrepaidAudit'
})
export default class extends Vue {
  @Prop({ default: null }) data: any;
  @Prop({ default: null }) audioStatus: number;

  CheckedStatus = CheckedStatus;
  PaymentType = PaymentType;

  data_: any;
  loading = true;
  title = '';
  remarkLengthLimit = 100;
  records = [];
  actuallyAmount = null;
  financial = false;

  uploader: IEleUploaderOptions = {
    width: 100,
    maxCount: 3,
    // 图片尺寸限制 10mb 以下
    maxSize: 10 * 1024,
    multiple: true,
    immediate: true
  };

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    this.data_ = val;
    this.loading = true;
    // 获取详情
    ApiService.agentAccountFlow_detail(this.data_.id)
      .then((data: any) => {
        Object.assign(this.data_, {
          amount: data.amount,
          picture: data.picture,
          recommender: data.recommender
        });
        this.actuallyAmount = data.actualAmount;

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
          this.financial = true;
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

  // 图片准备上传
  onUploadStart(file) {
    return QiniuService.uploadOne(file, 1).then((res) => {
      file.data.fileKey = res.key;
      file.data.url = res.url;
    });
  }

  // 图片上传失败回调
  onUploaderFailed(err) {
    this.$notify.error(err.message);
  }

  // 审核、取消操作
  async handle(record, status, approvalOpinion) {
    if (!record.checked) {
      this.$notify.warning('请确认并勾选您当前的角色');
      return;
    }
    if (!record.remark) {
      this.$notify.warning('请输入备注信息');
      return;
    }
    if (record.remark.length > this.remarkLengthLimit) {
      this.$notify.warning(`备注超出字数，允许的字符长度为${this.remarkLengthLimit}`);
      return;
    }
    let actuallyAmount = this.data_.actualAmount;
    if (this.financial && !this.actuallyAmount) {
      this.$notify.warning('请输入实付金额');
      return;
    } else if (this.actuallyAmount < 0) {
      this.$notify.warning('实付金额不得小于0');
      return;
    } else {
      actuallyAmount = this.actuallyAmount;
    }
    ApiService.agentAccountFlow_update({
      id: this.data_.id,
      checkStatus: status,
      actuallyAmount: actuallyAmount,
      flow: {
        ifFinishCheck: 1,
        approvalOpinion: approvalOpinion,
        remark: record.remark,
        title: record.title
      },
      approvalImage: record.approvalImage.map((file) => ({
        url: file.data.url,
        fileKey: file.data.fileKey
      }))
    })
      .then(() => {
        this.$notify.success('操作成功!');
        this.$emit('close');
      })
      .catch((err) => {
        this.$notify.error(err.message);
        this.$emit('close');
      });
  }
}
</script>

<style lang="scss" scoped>
.top {
  text-align: center;
}

.top-title {
  font-size: 20px;
  color: green;
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
</style>
