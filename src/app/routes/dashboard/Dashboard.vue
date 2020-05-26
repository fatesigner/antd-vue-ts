<template>
  <layout></layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Layout from '../../layout/Layout.vue';

@Component({
  name: 'HomePage',
  components: { Layout }
})
export default class extends Vue {}
</script>

<style lang="scss"></style>
