<template>
  <a-layout-header class="header" :theme="theme" :class="[setting.fixedHeader ? 'header-fixed' : '']">
    <dl class="header-inner">
      <dt>
        <button v-if="showCollapsed && isMobile" class="sidebar-toggler" @click="toggleCollapsed">
          <v-icon name="bars" />
        </button>
        <router-link class="logo" to="/" exact>
          <h1 class="title" :title="title">{{ title }}</h1>
        </router-link>
      </dt>
      <dd>
        <slot name="center" />
      </dd>
      <dd v-if="user">
        <a-dropdown placement="bottomRight">
          <div class="dropdown-item">
            <a-tag color="green" size="mini" v-if="apiHostName">{{ apiHostName }}环境</a-tag>
            <a-tag color="blue">{{ user.job || role }}</a-tag>
            <div class="username">{{ user.realname }}</div>
          </div>
          <a-menu slot="overlay">
            <a-menu-item @click="showUpdatePassword">
              <v-icon name="unlock-alt" />
              <span>修改密码</span>
            </a-menu-item>
            <a-menu-item @click="setting.visible = true">
              <v-icon name="cog" />
              <span>个性化</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="logout">
              <v-icon name="logout" />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </dd>
    </dl>
    <as-lazy v-bind="updatePwdDialog" />
  </a-layout-header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Dropdown, Icon, Layout, Menu } from 'ant-design-vue';
import { AsLazy, CreateAsLazy } from '../../../../lib/antdv-ui/components/lazy';
import '../../../../lib/antdv-ui/icons/bars';
import '../../../../lib/antdv-ui/icons/cog';
import '../../../../lib/antdv-ui/icons/logout';
import '../../../../lib/antdv-ui/icons/unlock-alt';

import { Events } from '../../../event';
import { AppStore } from '../../../store';
import { ApiHostCollection, ENV, RoleCollection } from '../../../global';
import { IUserSession, SessionService } from '../../../services/session.service';
import { ISettingState, SystemSettingStore } from '../setting/store';
import { ApiService } from '../../../services/api.service';
import { DeviceType } from '../../../interfaces/device';

Vue.use(Layout);
Vue.use(Dropdown);
Vue.use(Menu);
Vue.use(Icon);

@Component({
  name: 'Header',
  components: {
    AsLazy
  }
})
export default class extends Vue {
  @Prop({ default: null }) theme: string;
  @Prop({ default: false }) showCollapsed: boolean;

  getContext() {
    return this;
  }

  get setting(): ISettingState {
    return this.$store.getters[SystemSettingStore.getterKeys.setting];
  }

  get role() {
    const roles = this.user.roles.map((x: any) => RoleCollection.desc[x]);
    if (roles.length) {
      return roles[0];
    }
    return '';
  }

  get isMobile() {
    return this.$store.getters[AppStore.getterKeys.device] === DeviceType.mobile;
  }

  get sidebarCollapsed() {
    return this.$store.getters[AppStore.getterKeys.navigationCollapsed];
  }

  title = ENV.VUE_APP_TITLE;

  apiHostName = '';

  user: IUserSession = null;

  // 定义修改密码弹出层
  updatePwdDialog = CreateAsLazy({
    getContext: this.getContext,
    props: {
      popover: true,
      comp: () => import('../../../shared/update-pwd/UpdatePwdModal.vue'),
      visible: false,
      props: { visible: true, username: null },
      listeners: {
        'update:visible'(val) {
          this.updatePwdDialog.props.visible = val;
          this.updatePwdDialog.props.props.visible = val;
        },
        done() {
          // 密码修改成功后，注销当前账户
          this.logout();
        }
      }
    },
    listeners: {
      visibleChanged(val) {
        this.updatePwdDialog.props.props.visible = val;
      }
    }
  });

  mounted() {
    // 开发模式下，显示当前应用所访问的服务端环境
    if (process.env.VUE_APP_MODE === 'development') {
      const item = ApiHostCollection.arr.find((x) => x.name === ApiService.apiHost);
      if (item) {
        this.apiHostName = item.text;
      }
    }

    Events.login.$on((user) => {
      this.user = user;
    });

    Events.logout.$on(() => {
      this.user = null;
    });
  }

  toggleCollapsed() {
    this.$store.dispatch(AppStore.actionKeys.toggleNavigationCollapsed, !this.sidebarCollapsed);
  }

  showUpdatePassword() {
    this.updatePwdDialog.props.props.username = SessionService.user.username;
    this.updatePwdDialog.props.visible = true;
  }

  async logout() {
    SessionService.logout();
    this.$message.warning('您已登出');
  }
}
</script>

<style lang="scss" scoped>
@import '../../../theme/default.theme';

$headerHeight: 52px;

.header {
  height: initial;
  padding: 0 10px;
  margin-bottom: 5px;
  line-height: $headerHeight;
  background-color: #fff;

  &.header-fixed {
    position: fixed;
    top: 0;
  }
}

.header-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  min-height: 100%;
  margin: -5px;

  > dt,
  > dd {
    display: flex;
    align-items: center;
    margin: 5px;
  }

  > dd {
    flex: 1;
    justify-content: flex-end;
  }
}

.logo {
  display: flex;
  align-items: center;
  margin-left: 10px;
  vertical-align: middle;

  img {
    width: 36px;
  }
}

.title {
  display: inline-block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-shadow: 1px 1px #e6e6e6;
}

.dropdown-item {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  margin-top: -2px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.025);
  }

  .ant-tag {
    margin-right: 10px;
  }
}

.username {
  overflow: hidden;
  font-size: 12px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.language {
  width: 40px;

  .title {
    margin-left: 5px;
    font-size: 12px;
    color: #333;
  }
}

.sidebar-toggler {
  max-width: 100%;
  max-height: 100%;
  padding: 0;
  margin: 0 5px 0;
  color: #666;
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
  transition: color 0.3s;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
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

@media (max-width: 600px) {
  .header {
    line-height: 32px;

    .sidebar-toggler {
      line-height: 32px;

      i {
        font-size: 16px;
        vertical-align: initial;
      }
    }

    .logo {
      h1 {
        font-size: 13px;
      }
    }
  }
}

@media (max-width: 420px) {
  .header {
    .logo {
      h1 {
        display: none;
      }
    }
  }
}
</style>
