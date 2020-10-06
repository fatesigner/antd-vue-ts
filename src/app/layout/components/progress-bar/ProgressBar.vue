<template>
  <div
    class="progress"
    :style="{
      width: percent + '%',
      height: height,
      'background-color': color,
      opacity: show ? 1 : 0
    }"
  ></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ProgressBarStore } from './store';

@Component({
  name: 'ProgressBar'
})
export default class extends Vue {
  get percent() {
    return this.$store.getters[ProgressBarStore.getterKeys.percent];
  }

  get show() {
    return this.$store.getters[ProgressBarStore.getterKeys.show];
  }

  get height() {
    return this.$store.getters[ProgressBarStore.getterKeys.height];
  }

  get color() {
    return this.$store.getters[ProgressBarStore.getterKeys.color];
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
  background-color: orangered;
  border-radius: 2px;
  opacity: 1;
  transition: width 0.2s, opacity 0.4s;
}
</style>
