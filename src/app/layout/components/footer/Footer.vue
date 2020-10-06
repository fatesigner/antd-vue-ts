<template>
  <footer>
    <div class="container-fluid">
      <div class="vui-tc">{{ title }} © 2019-xxxx</div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ENV } from '../../../global';

@Component({
  name: 'Footer'
})
export default class extends Vue {
  title = ENV.VUE_APP_TITLE;
}
</script>

<style lang="scss">
footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  color: #333;
}
</style>
