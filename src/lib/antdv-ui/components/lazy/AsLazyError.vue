<template>
  <div class="lazy-component-error">
    <p>加载失败</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'AsLazyLoadError'
})
export default class extends Vue {}
</script>
