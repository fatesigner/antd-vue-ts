<template>
  <div class="app-wrapper layout-empty">
    <div class="app-container">
      <slot />
    </div>
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
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }
}
</style>
