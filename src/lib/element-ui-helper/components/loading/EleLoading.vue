<template>
  <span class="loading-wrap" :style="{ color: color ? color : '', 'font-size': size ? size + 'px' : '' }">
    <i class="el-icon-loading"></i>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'EleLoading'
})
export default class extends Vue {
  @Prop({ default: null }) color: string;
  @Prop({ default: null }) size: number;
}
</script>

<style lang="scss" scoped>
.loading-wrap {
  padding: 10px;
  overflow: hidden;
  text-align: right;
}
</style>
