<template>
  <div class="vui-row">
    <div class="vui-padding vui-tc" v-if="loading">
      <ele-loading :size="40" />
    </div>
    <template v-else>
      <div class="vui-col-auto">
        <el-form class="vui-col" style="width: 320px;">
          <div class="top">
            <h2 class="top-title">当前状态：{{ CheckedStatus.desc[data.checkStatus] }}</h2>
            <p>时间：{{ data.createTime | dateFormat }}</p>
          </div>
          <h2>申请信息</h2>
          <el-form-item label="提交人"> {{ data.agentName }}&nbsp;&nbsp;&nbsp;{{ data.phone }} </el-form-item>
          <h2>当前上级</h2>
          <el-form-item label="级别">{{ data.paramAgentName }}</el-form-item>
          <el-form-item label="姓名">{{ data.paramLevelName }}</el-form-item>
          <el-form-item label="电话">{{ data.paramPhone }}</el-form-item>
          <el-form-item label="状态">
            {{ CheckedStatus.desc[data.checkStatus] }}
          </el-form-item>
          <template v-if="data.pictures && data.pictures.length">
            <h2>支付凭证</h2>
            <div class="img-item" v-for="item in data.pictures" :key="item.fileKey">
              <img :src="item.url" alt="" title="" />
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
                @failed="onUploaderFailed($event)"
              />
              <p class="vui-mt10 vui-g9">最多上传三张，单张10M之内</p>
              <p class="vui-mt10 vui-orange">{{ record.desc }}</p>
              <div class="vui-mt10">
                <el-button type="primary" @click="handle(record, record.checkStatus1, 1)">提交</el-button>
                <el-button type="text" @click="handle(record, record.checkStatus2, 2)">取消本次申请</el-button>
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

import { QiniuService } from '../../../lib/qiniu';
import { IEleUploaderOptions } from '../../../lib/element-ui-helper/components/uploader';

import { CheckedStatus } from '../../global';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  name: 'AuthorizeAudit'
})
export default class extends Vue {
  @Prop({ default: null }) data: any;
  @Prop({ default: null }) audioStatus: number;

  CheckedStatus = CheckedStatus;
  data_: any;
  loading = true;
  title = '';
  remarkLengthLimit = 100;
  records = [];
  currentStatus = '';
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
    ApiService.warrant_get(this.data_.id)
      .then((data: any) => {
        this.data_.amount = data.amount;
        this.data_.pictures = data.pictures;
        this.data_.recommender = data.recommender;
        this.actuallyAmount = data.actualAmount;

        if (this.data_.checkStatus == CheckedStatus.enum.completed) {
          this.currentStatus = '等待专员审核';
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

        if (this.data_.checkStatus == CheckedStatus.enum.completed) {
          record.checkStatus1 = CheckedStatus.enum.专员审核通过;
          record.checkStatus2 = CheckedStatus.enum.专员审核不通过;
          record.title = '专员审核 ' + SessionService.user.realname;
          record.desc = '提示；提交将视为已确认支付，进入仓储“待发货”';
        }
        this.records = [...data.approvalFlowAdmins];
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
    ApiService.warrant_update({
      id: this.data.id,
      checkStatus: status,
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
