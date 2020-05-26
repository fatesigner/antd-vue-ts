<template>
  <div class="lazy-component-loading">
    <ele-loading :size="26" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { EleLoading } from '../loading';

@Component({
  name: 'EleLazyLoading',
  components: { EleLoading }
})
export default class extends Vue {}
</script>
