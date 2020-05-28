<template>
  <div class="app-wrapper">
    <slot />
    <slot name="append" />
    <progress-bar />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ProgressBar } from './components/progress-bar';

@Component({
  name: 'LayoutEmpty',
  components: {
    ProgressBar
  }
})
export default class extends Vue {}
</script>

<style lang="scss">
@import '../../theme/default.theme';

.layout-empty {
  &.app-wrapper {
    height: 100%;
  }
}
</style>
