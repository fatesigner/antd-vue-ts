<template>
  <dl :class="['navigation', !isMobile && 'navigation-pr', collapsed_ && 'navigation-collapsed']">
    <dt>
      <dl class="navigation-root">
        <dt>
          <a-tooltip placement="right" :title="title">
            <button class="btn-link logo" :title="title">
              <a href="/"><img src="../../../../assets/img/logo.png" alt="" :title="title" /></a>
            </button>
          </a-tooltip>
          <a-tooltip placement="right" title="搜索">
            <button class="btn-link search" @click="searchDrawerVisible = true">
              <v-icon name="search" />
            </button>
          </a-tooltip>
        </dt>
        <dd>
          <a-popover placement="right">
            <template slot="content">
              <a-menu class="user-menus" slot="overlay">
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
            </template>
            <button class="btn-link avatar">
              <img :src="user.avatar" alt="" title="" />
            </button>
          </a-popover>
          <a-dropdown placement="bottomRight">
            <button class="btn-link language" title="选择语言">
              <span class="vui-ell">{{ setting.language }}</span>
            </button>
            <a-menu :class="['avatar-menu']" slot="overlay" :selected-keys="[setting.language]">
              <a-menu-item v-for="item in languages.arr" :key="item.value" @click="toggleLanguage(item.value)">
                <span>{{ item.text }}</span>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </dd>
      </dl>
      <sidebar
        :style="{ visibility: collapsed_ ? 'hidden' : 'visible' }"
        :collapsed.sync="collapsed_"
        :collapsible="true"
        :collapsed-width="14"
        :theme="setting.theme"
      />
      <navigation-search :visible.sync="searchDrawerVisible" />
    </dt>
    <dd v-if="!isMobile">
      <div class="septal-line"></div>
      <div class="drag"><div class="drag-line"></div></div>
      <button class="toggle-btn" type="button" @click="toggleCollapsed" :title="collapsed ? '展开' : '收起'">
        <svg v-if="collapsed" width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">
          <path
            d="M10.294 9.698a.988.988 0 0 1 0-1.407 1.01 1.01 0 0 1 1.419 0l2.965 2.94a1.09 1.09 0 0 1 0 1.548l-2.955 2.93a1.01 1.01 0 0 1-1.42 0 .988.988 0 0 1 0-1.407l2.318-2.297-2.327-2.307z"
            fill="currentColor"
            fill-rule="evenodd"
          ></path></svg
        ><svg v-else width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">
          <path
            d="M13.706 9.698a.988.988 0 0 0 0-1.407 1.01 1.01 0 0 0-1.419 0l-2.965 2.94a1.09 1.09 0 0 0 0 1.548l2.955 2.93a1.01 1.01 0 0 0 1.42 0 .988.988 0 0 0 0-1.407l-2.318-2.297 2.327-2.307z"
            fill="currentColor"
            fill-rule="evenodd"
          ></path>
        </svg>
      </button>
    </dd>
  </dl>
</template>

<script lang="ts">
import { Dropdown, Popover } from 'ant-design-vue';
import { IsBoolean } from '@fatesigner/utils/type-check';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { CreateAsLazy } from '../../../../lib/antdv-ui/components/lazy';
import '../../../../lib/antdv-ui/icons/cog';
import '../../../../lib/antdv-ui/icons/logout';
import '../../../../lib/antdv-ui/icons/search';

import { Sidebar } from '../sidebar';
import { ENV } from '../../../global';
import { Languages } from '../../../i18n';
import { ISettingState, SystemSettingStore } from '../setting/store';
import { SessionService } from '../../../services/session.service';

import NavigationSearch from './NavigationSearch.vue';

Vue.use(Dropdown);
Vue.use(Popover);

@Component({
  name: 'Navigation',
  components: {
    NavigationSearch,
    Sidebar
  }
})
export default class extends Vue {
  @Prop({ default: false }) collapsed: boolean;
  @Prop({ default: false }) isMobile: boolean;

  user = SessionService.user;

  getContext() {
    return this;
  }

  title = ENV.VUE_APP_TITLE;

  languages = Languages;

  collapsed_ = false;

  searchDrawerVisible = false;
  searchDrawer = CreateAsLazy({
    getContext: this.getContext,
    props: {
      popover: true,
      comp: () => import('./NavigationSearch.vue'),
      visible: false,
      props: { visible: true },
      listeners: {
        'update:visible'(val: boolean) {
          this.searchDrawer.props.visible = val;
          this.searchDrawer.props.props.visible = val;
        }
      }
    },
    listeners: {
      visibleChanged(val: boolean) {
        this.searchDrawer.props.props.visible = val;
      }
    }
  });

  get setting(): ISettingState {
    return this.$store.getters[SystemSettingStore.getterKeys.setting];
  }

  @Watch('collapsed', {
    immediate: true
  })
  onCollapsedChange(val: boolean) {
    this.collapsed_ = val;
  }

  @Watch('collapsed_')
  onCollapsed_Change(val: boolean) {
    this.$emit('update:collapsed', val);
  }

  toggleCollapsed(val: boolean) {
    if (IsBoolean(val)) {
      this.collapsed_ = val;
    } else {
      this.collapsed_ = !this.collapsed_;
    }
  }

  toggleLanguage(val: string) {
    this.$store.dispatch(SystemSettingStore.actionKeys.updateLang, val);
  }

  async logout() {
    SessionService.logout();
    this.$message.warning('您已登出');
  }
}
</script>

<style lang="scss" scoped>
.navigation {
  position: relative;
  height: 100%;

  > dt {
    display: flex;
    height: 100%;
  }

  > .sidebar {
    height: 100%;
    padding-top: 20px;
  }

  > dd {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 100%;
    z-index: 3;
    width: 24px;
    transform: translateZ(0);

    .septal-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: -3px;
      width: 3px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        to left,
        rgba(0, 0, 0, 0.2) 0,
        rgba(0, 0, 0, 0.2) 1px,
        rgba(0, 0, 0, 0.1) 0,
        transparent
      );
      opacity: 0.5;
      transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
      transition-duration: 0.22s;
      transition-property: left, opacity, width;
    }

    .toggle-btn {
      position: absolute;
      top: 22px;
      width: 24px;
      height: 24px;
      padding: 0;
      color: rgb(107, 119, 140);
      cursor: pointer;
      background: 0 center white;
      border: 0;
      border-radius: 50%;
      outline: 0;
      box-shadow: rgba(9, 30, 66, 0.08) 0 0 0 1px, rgba(9, 30, 66, 0.08) 0 2px 4px 1px;
      opacity: 1;
      transition: background-color 100ms linear 0s, color 100ms linear 0s, opacity 300ms cubic-bezier(0.2, 0, 0, 1) 0s,
        transform 300ms cubic-bezier(0.2, 0, 0, 1) 0s;
      transform: translate(-50%);

      &:hover {
        color: #fff;
        background-color: rgb(76, 154, 255);
      }
    }
  }
}

.navigation-root {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 66px;
  height: 100%;
  padding: 5px;
  text-align: center;
  background: linear-gradient(135deg, #4c9efb 10%, #94beed 42%, #848ab7);

  img {
    max-width: 100%;
  }
}

.btn-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 33px;
  max-width: 100%;
  padding: 5px;
  margin: 0 auto;
  color: #fff;
  cursor: pointer;
  background-color: transparent;
  border: none;
  outline: none;
  transition: background-color 0.5s;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }

  &:active {
    background: rgba(0, 0, 0, 0.6);
  }
}

.logo {
  width: 50px;
  height: 50px;
  margin-top: 10px;
  border-radius: 50%;

  img {
    width: 40px;
    height: 40px;
  }
}

.search {
  width: 40px;
  height: 40px;
  margin-top: 10px;
  border-radius: 50%;

  svg {
    width: 20px;
    height: 20px;
  }
}

.avatar {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  border-radius: 50%;

  img {
    border-radius: 50%;
  }
}

.user-menus {
  margin: -10px;
  border: none;
}

.language {
  font-size: 12px;

  > i {
    margin-top: 2px;
    margin-right: 5px;
  }
}
</style>
