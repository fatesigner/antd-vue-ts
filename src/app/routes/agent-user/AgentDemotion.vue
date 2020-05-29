<template>
  <ValidationObserver ref="validator">
    <el-form label-width="80px">
      <el-form-item label="当前上级：">{{ data_.parentAgentName }}</el-form-item>
      <el-form-item label="当前级别：">{{ data_.agentLevel }}</el-form-item>
      <el-form-item label="代理类型：">{{ data_.agentType }}</el-form-item>
      <p class="vui-p10 vui-orange">当前已是最高级别，只能降级</p>
      <el-form-item label="升降级：">
        <el-radio>降级</el-radio>
        <span>下一级别：(校长)</span>
      </el-form-item>
      <p class="vui-p10 vui-orange">
        顶级代理只能降级，顶级以下代理可升级（升降级每次仅限调级一个等级）降级后，上级继续为公司，原下级存在同级的，自动变更公司为新上级，其余保持不变。（升级可恢复）
      </p>
      <el-form-item>
        <el-button type="primary" size="large" :loading="uploading" @click="onSubmit" style="width: 160px;"
          >提交
        </el-button>
      </el-form-item>
    </el-form>
  </ValidationObserver>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { ApiService } from '../../services/api.service';
import { DateFormatPipeKey } from '../../pipes/date-format.pipe';

@Component({
  name: 'AgentDemotion'
})
export default class extends Vue {
  @Prop({
    default: () => {}
  })
  data: any;

  data_: any = {};

  uploading = false;

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    this.data_ = val;
  }

  onSubmit() {
    (this.$refs.validator as any).validate().then((success) => {
      if (success) {
        this.uploading = true;
        const data = {
          id: this.data_.id,
          derateType: this.data_.derateType,
          derateTarget: this.data_.derateTarget,
          derateCondition: this.data_.derateCondition,
          derateMoney: this.data_.derateMoney,
          startTime: this.$options.filters[DateFormatPipeKey](this.data_.timeRange[0]),
          endTime: this.$options.filters[DateFormatPipeKey](this.data_.timeRange[1])
        };
        ApiService.derate_add(data)
          .then(() => {
            this.$notify.success('添加成功！');
            this.$emit('close');
          })
          .catch((err) => {
            this.$notify.error(err.message);
          })
          .finally(() => {
            this.uploading = false;
            (this.$refs.validator as any).reset();
          });
      }
    });
  }
}
</script>
