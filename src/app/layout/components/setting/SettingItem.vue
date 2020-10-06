<template>
  <div class="setting-item">
    <h3 class="setting-item-title">
      <slot name="title" />
    </h3>
    <div class="setting-item-content">
      <slot></slot>
    </div>
    <a-divider v-if="divider" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Divider } from 'ant-design-vue';

Vue.use(Divider);

@Component({
  name: 'SettingItem'
})
export default class extends Vue {
  @Prop({ default: false }) divider: boolean;
}
</script>

<style lang="scss" scoped>
.setting-item {
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
}

.setting-item-title {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
}

.setting-item-content {
  overflow: hidden;
}
</style>
