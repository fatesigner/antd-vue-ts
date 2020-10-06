<template>
  <div class="wrapper">
    <template v-if="status.code === 404">
      <not-found :title="status.message" />
    </template>
    <template v-else>
      <keep-alive v-if="$route.meta && $route.meta.keepAlive">
        <router-view />
      </keep-alive>
      <router-view v-else />
      <progress-bar />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { NotFound } from './components/error';
import { ProgressBar } from './components/progress-bar';
import { AppStore } from '../store';

@Component({
  name: 'LayoutEmpty',
  components: {
    ProgressBar,
    NotFound
  }
})
export default class extends Vue {
  get status() {
    return this.$store.getters[AppStore.getterKeys.status];
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
}
</style>
