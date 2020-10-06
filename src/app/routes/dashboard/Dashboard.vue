<template>
  <div class="dashboard">
    <h2>{{ title }}</h2>
    <h3>欢迎您，{{ user.realname }}</h3>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ENV } from '../../global';
import { SessionService } from '../../services/session.service';

@Component({
  name: 'Dashboard'
})
export default class extends Vue {
  getContext() {
    return this;
  }

  title = ENV.VUE_APP_TITLE;

  user = SessionService.user;
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100%;
  padding: 60px;
  background-color: #fff;

  h2 {
    margin-bottom: 50px;
    font-size: 32px;
    font-weight: 500;
    text-align: center;
  }

  h3 {
    text-align: center;
  }
}
</style>
