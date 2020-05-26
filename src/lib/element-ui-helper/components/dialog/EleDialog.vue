<template>
  <el-dialog :custom-class="'ele-dialog' + customClass ? ' ' + customClass : ''" :title="title" :visible.sync="visible">
    <div class="vui-padding vui-tc" v-if="actionDialog.loading">
      <ele-loading :size="40" />
    </div>
    <slot />
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'EleDialog'
})
export default class extends Vue {
  @Prop({ default: '' }) title: string;
  @Prop({ default: '' }) customClass: string;
  @Prop({ default: '' }) visible: boolean;
}
</script>

<style lang="scss" scoped>
.ele-dialog {
  .el-dialog__wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    > .el-dialog {
      display: flex;
      flex-direction: column;
      width: auto;
      min-width: 300px;
      max-width: 91%;
      max-height: 91%;
      margin: 0 !important;
      overflow: hidden;

      > .el-dialog__header {
        border-bottom: 1px solid #ddd;
      }

      > .el-dialog__body {
        padding: 0 20px 20px;
        overflow: auto;
      }
    }

    .el-dialog__title {
      font-size: 20px;
      font-weight: bold;
    }
  }
}
</style>
