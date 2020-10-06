<template>
  <div class="lazy-component-loading">
    <as-loading size="large" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { AsLoading } from '../loading';

@Component({
  name: 'AsLazyLoading',
  components: { AsLoading }
})
export default class extends Vue {}
</script>
