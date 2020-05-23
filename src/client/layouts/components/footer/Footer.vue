<template>
  <footer>
    <div class="container-fluid">
      <div class="vui-tc">{{ global.title }} © 2019-xxxx</div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Global } from '../../../../config/global';

@Component({
  name: 'Footer'
})
export default class extends Vue {
  global = Global;
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
