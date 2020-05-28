<template>
  <layout>
    <div class="home">
      <h2>欢迎使用{{ title }}</h2>
    </div>
  </layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Layout from '../../layout/Layout.vue';
import { Title } from '../../global';

@Component({
  name: 'HomePage',
  components: { Layout }
})
export default class extends Vue {
  title = Title;
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100%;
  padding-top: 60px;
  background-color: #fff;

  h2 {
    font-size: 32px;
    font-weight: 500;
    text-align: center;
  }
}
</style>
