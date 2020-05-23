<template>
  <layout>
  </layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Global } from '../../../config/global';
import Layout from '../../layouts/Layout.vue';

@Component({
  name: 'HomePage',
  components: { Layout }
})
export default class extends Vue {
  global = Global;
}
</script>

<style lang="scss">

</style>
