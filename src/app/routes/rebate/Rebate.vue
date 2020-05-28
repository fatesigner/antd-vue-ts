<template>
  <layout class="rebate">
    <el-form label-width="95px">
      <el-form-item label="范围">
        <el-select placeholder="选择级别" readonly="readonly" v-model="form.range" style="width: 100px;">
          <el-option value="4">4</el-option>
        </el-select>
        <p class="vui-g9">选择订货返利的级别范围，默认；仅限于4级（战略服务商）</p>
      </el-form-item>
      <el-form-item label="返利区间">
        <ul class="rebate-top">
          <li style="width: 50px;">序号</li>
          <li style="width: 160px;">月度进货量(台)</li>
        </ul>
        <ul>
          <li class="rebate-item" v-for="(item, index) in form.items">
            <div class="rebate-item-order" style="width: 50px;">{{ index + 1 }}</div>
            <div class="rebate-item-order" style="width: 240px;">
              <el-input type="number" :readonly="!!item.id" v-model.number="item.minValue" style="width: 100px;" /> ~
              <el-input type="number" :readonly="!!item.id" v-model.number="item.maxValue" style="width: 100px;" /> 台
            </div>
            <div class="rebate-item-order" style="width: 120px;">
              <el-input type="number" :readonly="!!item.id" v-model.number="item.rebateAmount" style="width: 100px;" />
              元
            </div>
            <div class="rebate-item-order">
              <div class="rebate-remove" title="删除该项" @click="removeItem(item, index)">
                <i class="el-icon-remove" />
              </div>
            </div>
          </li>
        </ul>
        <div class="rebate-add" title="添加" @click="addItem">
          <i class="el-icon-plus" />
          <span>继续</span>
        </div>
        <p style="color: #999;">
          ｛战略服务商（4级）本人的月度订货量+本人直接推荐的所有代理商的月度订货量（包含直接推荐的
        </p>
        <p style="color: #999;">任意等级）｝* 对应数量的返利，则等于当前代理商进货时可抵扣的返利金额。</p>
        <p style="color: green;">利差 =（降为3级时起算的总进货量 x 3级的每台价格）-（4级每台价格 x 3级时总进货量）</p>
        <el-button class="btn-submit" type="primary" size="large" @click="submit">确定</el-button>
      </el-form-item>
    </el-form>
  </layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Layout } from '../../layout';
import { ApiService } from '../../services/api.service';

@Component({
  name: 'Rebate',
  components: {
    Layout
  }
})
export default class extends Vue {
  form = {
    range: '4',
    items: []
  };

  beforeMount() {
    this.loadData();
  }

  loadData() {
    return ApiService.rebateConfig_list().then((res: any) => {
      this.form.items = res;
    });
  }

  addItem() {
    this.form.items.push({
      minValue: null,
      maxValue: null,
      rebate: 1,
      rebateAmount: null
    });
  }

  removeItem(item, index) {
    if (item.id) {
      ApiService.rebateConfig_delete(item.id)
        .then(() => {
          this.$notify.success('删除成功!');
          this.form.items.splice(index, 1);
        })
        .catch((err) => {
          this.$notify.success(err.message);
        });
    } else {
      this.form.items.splice(index, 1);
    }
  }

  submit() {
    const items = this.form.items.filter((x) => !x.id);
    if (items.length) {
      let valid = true;
      items.every((x) => {
        if (!x.minValue || !x.maxValue || !x.rebateAmount) {
          valid = false;
          this.$notify.error('部分信息填写不完整!');
        }
        return valid;
      });
      if (!valid) {
        return;
      }
      ApiService.rebateConfig_add(items).then(() => {
        this.$notify.success('操作成功!');
        // 刷新数据
        this.loadData();
      });
    } else {
      this.$notify.error('您没有添加新的记录!');
    }
  }
}
</script>

<style lang="scss">
.rebate {
  .app-container {
    background-color: #fff;
  }
}
</style>

<style lang="scss" scoped>
.rebate-top {
  list-style: none;

  > li {
    display: inline-block;
    margin-right: 20px;
  }
}

.rebate-item {
  display: flex;
  padding: 10px 0;

  .rebate-item-order {
    margin-right: 20px;
  }
}

.rebate-add {
  color: green;
  cursor: pointer;

  i {
    font-size: 14px;
    margin-right: 2px;
  }
}

.rebate-remove {
  i {
    font-size: 16px;
    color: red;
    cursor: pointer;
  }
}

.btn-submit {
  width: 120px;
  margin-top: 20px;
}
</style>
