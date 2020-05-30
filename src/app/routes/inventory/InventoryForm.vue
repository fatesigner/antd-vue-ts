<template>
  <ValidationObserver ref="validator">
    <el-form class="agent-type-form" label-width="80px">
      <el-form-item label="入库产品">
        <ValidationProvider name="入库产品" rules="required" v-slot="{ classes, errors }">
          <el-select
            :class="classes"
            clearable
            placeholder="选择入库产品"
            v-model="data_.productId"
            title=""
            style="width: 160px;"
          >
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.productName"
              :value="item.id"
            ></el-option>
          </el-select>
          <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
        </ValidationProvider>
      </el-form-item>
      <el-form-item label="入库批次">
        <ValidationProvider name="入库批次" rules="required|numeric" v-slot="{ classes, errors }">
          <el-input
            :class="classes"
            class="vui-hnm vui-mr5"
            type="number"
            v-model.number="data_.produceBatch"
            style="width: 160px;"
            title=""
          />
          <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
        </ValidationProvider>
      </el-form-item>
      <el-form-item label="生产数">
        <ValidationProvider name="生产数" rules="required|numeric" v-slot="{ classes, errors }">
          <el-input
            :class="classes"
            class="vui-hnm vui-mr5"
            type="number"
            v-model.number="data_.produceNum"
            style="width: 160px;"
            title=""
          >
            <span slot="append">台</span>
          </el-input>
          <p class="invalid-message" v-if="errors.length">{{ errors[0] }}</p>
        </ValidationProvider>
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
  name: 'InventoryForm'
})
export default class extends Vue {
  @Prop({ default: () => {} }) data: any;

  AgentLevel = AgentLevel;

  productList = [];

  data_ = {
    produceBatch: null,
    produceNum: null,
    productId: null,
    type: 1
  };

  loading = false;
  uploading = false;

  @Watch('data', {
    immediate: true
  })
  onDataChange(val) {
    this.loading = true;
    if (val) {
      this.data_ = val;
    } else {
      this.resetData();
    }

    // 获取产品列表
    ApiService.product_list()
      .then((res: any) => {
        this.productList = res;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onSubmit() {
    (this.$refs.validator as any).validate().then((success) => {
      if (success) {
        this.uploading = true;
        ApiService.stock_add(this.data_)
          .then(() => {
            this.$notify.success('添加成功！');
            this.$emit('close');
          })
          .catch((err) => {
            this.$notify.error(err.message);
          })
          .finally(() => {
            this.uploading = false;
            this.resetData();
          });
      }
    });
  }

  resetData() {
    this.data_ = {
      produceBatch: null,
      produceNum: null,
      productId: null,
      type: 1
    };
    if (this.$refs.validator) {
      (this.$refs.validator as any).reset();
    }
  }
}
</script>
