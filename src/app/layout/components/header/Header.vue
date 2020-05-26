<template>
  <header class="header">
    <dl class="inner">
      <dt>
        <sidebar-toggler :is-active="sidebarVisible" @toggleClick="toggleSidebar">
          <svg-icon name="hamburger" width="20" height="20" />
        </sidebar-toggler>
        <router-link class="logo" to="/" exact>
          <img src="../../../../assets/img/logo.jpg" alt="" title="" />
          <h1 class="title">{{ title }}</h1>
        </router-link>
      </dt>
      <dd>
        <el-tag size="mini" type="warning">{{ role }}</el-tag>
        <div class="user-status">{{ user.username }}</div>
        <el-button class="glossy vui-ml10" type="text" @click="logout" title="注销当前账户">退出</el-button>
      </dd>
    </dl>
  </header>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { SessionService } from '../../../services/session.service';
import { AuthService } from '../../../services/auth.service';
import { SidebarToggler } from '../sidebar';
import { SidebarStore } from '../sidebar/store';
import { Role, Title } from '../../../global';

@Component({
  name: 'Header',
  components: { SidebarToggler }
})
export default class extends Vue {
  user = SessionService.user;

  title = Title;

  get role() {
    const roles = this.user.roles.map((x) => Role.desc[x]);
    if (roles.length) {
      return roles[0];
    }
    return '';
  }

  get sidebarVisible() {
    return this.$store.getters[SidebarStore.getterKeys.visible];
  }

  toggleSidebar() {
    this.$store.dispatch(SidebarStore.actionKeys.toggle);
  }

  logout() {
    SessionService.logout();
    this.$router.push({ path: AuthService.authPath, query: { redirect: this.$route.fullPath } });
    this.$notify({
      title: 'warning',
      message: '您已登出',
      type: 'warning'
    });
  }

  mounted() {
    this.user = SessionService.user;
  }
}
</script>

<style lang="scss">
@import '../../../../theme/default.theme';

$headerHeight: 50px;

.header {
  min-height: $headerHeight;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

  .btn-light {
    display: flex;
    align-items: center;
    justify-content: center;
    width: $headerHeight;
    height: $headerHeight;
    text-align: center;
  }

  .inner {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    height: 100%;

    > dt,
    > dd {
      display: flex;
      align-items: center;
    }

    > dd {
      flex: 1;
      justify-content: flex-end;
      margin: 0 20px;
    }
  }

  .logo {
    display: flex;
    align-items: center;
    margin-right: 5px;
    vertical-align: middle;

    img {
      width: 36px;
    }
  }

  h1 {
    display: inline-block;
    margin-left: 5px;
    font-size: 16px;
    color: #333;
  }

  .github {
    margin: 0;
    font-size: 0.9em;
    color: #fff;
  }
}

.header-fixed {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
}

.user-status {
  display: flex;
  align-items: center;
  height: 100%;
  margin-top: -2px;
  margin-right: 10px;
  margin-left: 10px;

  .el-avatar {
    width: 28px;
    height: 28px;
    line-height: 28px;
    margin-right: 10px;
    i {
      font-size: 16px;
    }
  }

  .username {
    margin-left: 5px;
    font-size: 14px;
    color: #333;
  }
}

.logout {
  float: right;
  margin-right: 10px;
  color: map-get($colors, primary);

  &:hover {
    color: map-get($colors, primary);
  }
}

.q-toolbar__title a {
  font-size: 18px;
  color: #fff;
}

@media (max-width: 860px) {
  .header .inner {
  }
}

@media (max-width: 600px) {
  .header .inner {
  }

  .header a {
    margin-right: 1em;
  }

  .header .github {
    display: none !important;
  }
}
</style>
