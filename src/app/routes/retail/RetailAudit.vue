<template>
  <div class="prepaid-audit">
    <div class="vui-padding vui-tc" v-if="loading">
      <ele-loading :size="40" />
    </div>
    <div v-else class="vui-row">
      <div class="vui-col-auto">
        <el-form class="vui-col" label-width="80px">
          <div class="top">
            <h2 class="top-title">当前状态：{{ CheckedStatus.desc[data.checkStatus] }}</h2>
            <p>订单号：{{ data.rechargeNo }}</p>
            <p>时间：{{ data.createTime | dateFormat }}</p>
          </div>
          <h2>订货信息</h2>
          <ele-table :columns="table1.columns" :data="table1.result.data" />
          <h2>收货信息</h2>
          <ele-table :columns="table2.columns" :data="table2.result.data">
            <template v-slot:receiveInfo="{ row }">
              <div v-if="row.legalName">法人：{{ row.legalName }}</div>
              <div>电话：{{ row.receiverPhone }}</div>
              <div>
                地址：{{ row.receiverProvice + row.receiverCity + row.receiverRegion + row.receiverDetailAddress }}
              </div>
              <div v-if="row.companyName">公司：{{ row.companyName }}</div>
            </template>
          </ele-table>
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
            <div v-if="record.pictures">
              <div class="img-item" v-for="item in record.pictures" :key="item.fileKey">
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
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IEleUploaderOptions } from '../../../lib/element-ui-helper/components/uploader';

import { AgentLevel, CheckedStatus, PaymentType } from '../../global';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { QiniuService } from '../../../lib/qiniu';
import { IEleTableOperationData } from '../../../lib/element-ui-helper/components/table';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  name: 'RetailAudit'
})
export default class extends Vue {
  @Prop({ default: null }) data: Record<string, any>;

  CheckedStatus = CheckedStatus;

  data_: any;
  loading = true;
  title = '';
  remarkLengthLimit = 100;
  records = [];

  table1: IEleTableOperationData = {
    columns: [
      { label: '订货产品', name: 'productName', width: 120 },
      { label: '数量', name: 'number', width: 120 },
      { label: '单价', name: 'productPrice', width: 120 },
      { label: '总价', name: 'totalAmount', width: 120 }
    ],
    result: {
      data: []
    }
  };

  table2: IEleTableOperationData = {
    columns: [
      { label: '收货人', name: 'receiverName', width: 120 },
      { label: '收货信息', name: 'receiveInfo', width: 220 }
    ],
    result: {
      data: []
    }
  };

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    this.data_ = val;
    this.loading = true;
    // 获取详情
    ApiService.agent_detail(this.data_.agentId, this.data_.orderId)
      .then((data: any) => {
        this.table1.result.data = data.orderItemAdminDTOS;
        this.table2.result.data = [data];

        this.data_.amount = data.amount;
        this.data_.picture = data.picture;
        this.data_.recommender = data.recommender;

        const record = {
          title: '',
          desc: '',
          checked: false,
          checkStatus1: null,
          checkStatus2: null,
          remark: '',
          approvalImage: []
        };

        /* if (this.audioStatus === 1) {
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
        } */
        this.records = [];
        // this.records = [...data.approvalFlows];
        if (record.title) {
          this.records.push(record);
        }
      })
      .finally(() => {
        this.loading = false;
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
    await QiniuService.uploadMutiple(
      record.approvalImage.filter((ele) => ele.file),
      1,
      (res, ele) => {
        ele.fileKey = ele.key;
      }
    );
    ApiService.agentAccountFlow_update({
      id: this.data.id,
      checkStatus: status,
      actuallyAmount: actuallyAmount,
      flow: {
        ifFinishCheck: 1,
        approvalOpinion: approvalOpinion,
        remark: record.remark,
        title: record.title
      },
      approvalImage: record.approvalImage.map((x) => ({
        url: x.url,
        fileKey: x.fileKey
      }))
    }).then(() => {
      this.$notify.success('操作成功!');
      this.$emit('close');
    });
  }
}
</script>

<style lang="scss" scoped>
.prepaid-audit {
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
}
</style>
