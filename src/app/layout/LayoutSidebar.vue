<template>
  <a-layout class="layout-wrapper layout-fixed" :has-sider="true">
    <template v-if="status.code === 404">
      <not-found :title="status.message" />
    </template>
    <template v-else>
      <navigation v-show="!isMobile" :collapsed.sync="sidebarCollapsed" />
      <navigation-modal v-show="isMobile" :collapsed.sync="sidebarCollapsed" />
      <a-layout class="layout-container">
        <div class="layout-header">
          <app-header :showCollapsed="true" :theme="setting.theme" />
          <visited-tabs @viewCleared="onVisitedViewCleared" />
        </div>
        <a-layout-content class="layout-content">
          <transition-router v-if="status.code === 403">
            <unauthorized />
          </transition-router>
          <template v-else>
            <transition-router v-if="$route.meta && $route.meta.keepAlive">
              <keep-alive>
                <router-view />
              </keep-alive>
            </transition-router>
            <transition-router v-else>
              <router-view />
            </transition-router>
          </template>
        </a-layout-content>
      </a-layout>
      <setting />
    </template>
    <progress-bar />
  </a-layout>
</template>
<script lang="ts">
import enquireJs from 'enquire.js';
import { Layout } from 'ant-design-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { TransitionRouter } from '../../lib/antdv-ui/components/transition-router';

import { AppStore } from '../store';
import { DeviceType } from '../interfaces/device';
import { AppHeader } from './components/header';
import { Sidebar } from './components/sidebar';
import { AppFooter } from './components/footer';
import { Setting } from './components/setting';
import { ProgressBar } from './components/progress-bar';
import { VisitedTabs } from './components/visited-tabs';
import { NotFound, Unauthorized } from './components/error';
import { Navigation, NavigationModal } from './components/navigation';
import { ISettingState, SystemSettingStore } from './components/setting/store';

Vue.use(Layout);

@Component({
  name: 'LayoutSidebar',
  components: {
    Navigation,
    NavigationModal,
    Setting,
    VisitedTabs,
    AppFooter,
    Sidebar,
    AppHeader,
    ProgressBar,
    NotFound,
    Unauthorized,
    TransitionRouter
  }
})
export default class extends Vue {
  getContext() {
    return this;
  }

  get isMobile() {
    return this.$store.getters[AppStore.getterKeys.device] === DeviceType.mobile;
  }

  get setting(): ISettingState {
    return this.$store.getters[SystemSettingStore.getterKeys.setting];
  }

  get status() {
    return this.$store.getters[AppStore.getterKeys.status];
  }

  get sidebarCollapsed() {
    return this.$store.getters[AppStore.getterKeys.navigationCollapsed];
  }

  set sidebarCollapsed(val) {
    if (val !== this.sidebarCollapsed) {
      this.$store.dispatch(AppStore.actionKeys.toggleNavigationCollapsed, val);
    }
  }

  @Watch('$route')
  onRouteChange() {
    // 移动端切换路由后，关闭侧边菜单
    if (this.isMobile) {
      this.sidebarCollapsed = false;
    }
  }

  @Watch('sidebarCollapsed')
  onSidebarCollapsedChanged(val) {
    if (this.isMobile) {
      this.sidebarCollapsed = val;
    }
  }

  created() {
    // 媒体查询
    enquireJs.register('only screen and (max-width: 767.99px)', {
      match: () => {
        this.$store.dispatch(AppStore.actionKeys.toggleDevice, DeviceType.mobile);
      },
      unmatch: () => {
        this.$store.dispatch(AppStore.actionKeys.toggleDevice, DeviceType.desktop);
      }
    });
  }

  onVisitedViewCleared() {
    this.$router.push('/');
  }
}
</script>

<style lang="scss" scoped>
@import '../theme/default.theme';

.layout-wrapper {
  &.layout-fixed {
    height: 100%;
    overflow: hidden;
  }
}

.layout-container {
  overflow: hidden;
  background: #fff;
}

.layout-header {
  position: relative;

  &::after {
    position: absolute;
    right: 0;
    bottom: -3px;
    left: 0;
    z-index: 3;
    height: 3px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0,
      rgba(0, 0, 0, 0.2) 1px,
      rgba(0, 0, 0, 0.1) 0,
      transparent
    );
    opacity: 0.6;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    transition-duration: 0.22s;
    transition-property: left, opacity, width;
  }
}

.layout-content {
  overflow: auto;
}

.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 210px;
  overflow-x: hidden;
  overflow-y: auto;

  &.sidebar-hidden {
    margin-left: 0;

    .sidebar {
      width: 0 !important;
    }
  }

  &.animation {
    transition: margin-left 0.28s;

    .sidebar {
      transition: width 0.28s;
    }
  }

  &.mobile {
    margin-left: 0;
  }
}

.container {
  position: relative;
}
</style>
