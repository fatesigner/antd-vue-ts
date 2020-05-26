<template>
  <div class="btn-light" :class="[{ 'is-active': isActive }]" @click="toggleClick">
    <svg-icon name="hamburger" width="20" height="20" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'SidebarToggler'
})
export default class extends Vue {
  @Prop({ default: false }) private isActive!: boolean;

  private toggleClick() {
    this.$emit('toggleClick');
  }
}
</script>

<style lang="scss" scoped>
.btn-light {
  .svg-icon {
    transition: transform 0.2s ease;
  }
}

.is-active {
  .svg-icon {
    transform: rotate(180deg);
  }
}
</style>
