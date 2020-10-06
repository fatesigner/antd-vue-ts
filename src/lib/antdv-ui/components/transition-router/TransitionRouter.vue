<template>
  <transition name="fade-transform" mode="out-in">
    <slot />
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'TransitionRouter'
})
export default class extends Vue {
  @Prop({ default: 'down' }) direction: 'up' | 'right' | 'down' | 'left';
}
</script>

<style lang="scss" scoped>
.fade-transform-leave-active {
  transition-timing-function: ease-in;
  transition-duration: 0.2s;
  transition-property: opacity, transform;
}

.fade-transform-enter-active {
  transition-timing-function: ease-out;
  transition-duration: 0.3s;
  transition-property: opacity, transform;
}

.fade-transform-enter,
.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-transform-enter-to,
.fade-transform-leave {
  opacity: 1;
  transform: translateY(0);
}
</style>
