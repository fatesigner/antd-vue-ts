<template>
  <ValidationObserver ref="validator">
    <el-form class="agent-type-form" label-width="80px">
      <el-form-item label="减免类型">
        <ValidationProvider name="减免类型" rules="required" v-slot="{ classes, errors }">
          <el-select
            :class="classes"
            clearable
            placeholder="选择减免类型"
            v-model="data_.derateType"
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
            v-model="data_.derateTarget"
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
            v-model="data_.derateCondition"
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
            v-model.number="data_.derateMoney"
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
              v-model="data_.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
            <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
          </ValidationProvider>
        </div>
        <p class="vui-mt10 vui-g9">
          开始时间必须≥当前时间，且与当前已创建的时间/对象不可重复/重叠（相同减免对象不同时间时）
        </p>
      </el-form-item>
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

import { AgentLevel, DerateCondition, DerateType } from '../../global';
import { ApiService } from '../../services/api.service';
import { DateFormatPipeKey } from '../../pipes/date-format.pipe';

@Component({
  name: 'AgentTypeForm'
})
export default class extends Vue {
  @Prop({
    default: () => {}
  })
  data: any;

  AgentLevel = AgentLevel;
  DerateType = DerateType;
  DerateCondition = DerateCondition;

  data_ = {
    id: null,
    derateType: 1,
    derateTarget: 1,
    derateCondition: 1,
    derateMoney: 1,
    timeRange: null
  };

  uploading = false;

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    if (val) {
      this.data_ = val;
      this.data_.timeRange = [new Date(val.startTime), new Date(val.endTime)];
    } else {
      this.data_ = {
        id: null,
        derateType: 1,
        derateTarget: 1,
        derateCondition: 1,
        derateMoney: null,
        timeRange: null
      };
    }
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
        if (data.id) {
          ApiService.derate_update(data)
            .then(() => {
              this.$notify.success('更新成功！');
              this.$emit('close');
            })
            .catch((err) => {
              this.$notify.error(err.message);
            })
            .finally(() => {
              this.uploading = false;
              (this.$refs.validator as any).reset();
            });
        } else {
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
      }
    });
  }
}
</script>
