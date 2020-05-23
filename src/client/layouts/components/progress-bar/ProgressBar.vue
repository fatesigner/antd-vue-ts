<template>
  <div
    class="progress"
    :style="{
      width: percent + '%',
      height: height,
      'background-color': canSuccess ? color : failedColor,
      opacity: show ? 1 : 0
    }"
  ></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ProgressBarStore } from './store';

@Component({
  name: 'ProgressBar',
  components: {}
})
export default class extends Vue {
  get percent() {
    return this.$store.getters[ProgressBarStore.getterKeys.percent];
  }

  get show() {
    return this.$store.getters[ProgressBarStore.getterKeys.show];
  }

  get canSuccess() {
    return this.$store.getters[ProgressBarStore.getterKeys.canSuccess];
  }

  get height() {
    return this.$store.getters[ProgressBarStore.getterKeys.height];
  }

  get duration() {
    return this.$store.getters[ProgressBarStore.getterKeys.duration];
  }

  get color() {
    return this.$store.getters[ProgressBarStore.getterKeys.color];
  }

  get failedColor() {
    return this.$store.getters[ProgressBarStore.getterKeys.failedColor];
  }
}
</script>

<style lang="scss">
.progress {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999999;
  width: 0;
  height: 2px;
  background-color: darkorange;
  opacity: 1;
  transition: width 0.2s, opacity 0.4s;
}
</style>
