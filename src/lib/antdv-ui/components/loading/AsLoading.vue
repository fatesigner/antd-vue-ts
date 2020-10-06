<template>
  <div class="loading-wrap">
    <a-spin :size="size" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Spin } from 'ant-design-vue';

Vue.use(Spin);

@Component({
  name: 'AsLoading'
})
export default class extends Vue {
  @Prop({ default: null }) color: string;
  @Prop({ default: null }) size: 'small' | 'large';
}
</script>

<style lang="scss" scoped>
.loading-wrap {
  display: inline-block;
  padding: 5px;
  line-height: 1;
  text-align: center;

  ::v-deep {
    .ant-spin {
      line-height: 1;
    }

    .ant-spin-dot-spin {
      vertical-align: top;
    }
  }
}
</style>
