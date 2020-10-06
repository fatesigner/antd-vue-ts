<template>
  <div class="visited-tabs">
    <ul class="tabs" ref="tabs">
      <router-link
        v-for="tab in visitedViews"
        ref="tab"
        tag="li"
        :key="tab.path"
        :to="{ path: tab.path, query: tab.query, fullPath: tab.fullPath }"
        exact
        @click.middle.native="!isAffix(tab) ? closeSelectedTab(tab) : ''"
        @contextmenu.prevent.native="openMenu(tab, $event)"
      >
        <div class="tab">
          <span>{{ tab.name ? $t(tab.meta.label) : tab.path }}</span
          ><span
            class="cross-icon"
            v-if="!isAffix(tab)"
            @click.prevent.stop="closeSelectedTab(tab)"
            title="关闭"
          ></span>
        </div>
      </router-link>
      <li class="tab-cur" ref="tabCur" v-if="activatedIndex > -1" />
    </ul>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="context-menu">
      <!--<li @click="refreshSelectedTab(selectedTab)">
        {{ $t('tabsView.refresh') }}
      </li>-->
      <li v-if="!isAffix(selectedTab)" @click="closeSelectedTab(selectedTab)">
        {{ $t('tabsView.close') }}
      </li>
      <li v-if="visitedViews.length > 1" @click="closeOthersTabs">
        {{ $t('tabsView.closeOthers') }}
      </li>
      <li v-if="visitedViews.length > 1" @click="closeAllTabs(selectedTab)">
        {{ $t('tabsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Debounce } from '@fatesigner/utils';
import { Component, Vue, Watch } from 'vue-property-decorator';

import { i18n } from '../../../i18n';
import { Events } from '../../../event';

import { IVisitedView, VisitedTabsStore } from './store';

@Component({
  name: 'VisitedTabs'
})
export default class extends Vue {
  i18nKeys = i18n.keys;

  private visible = false;
  private top = 0;
  private left = 0;
  private selectedTab: IVisitedView = null;

  get activatedIndex() {
    return this.$store.getters[VisitedTabsStore.getterKeys.activatedIndex];
  }

  get visitedViews() {
    return this.$store.getters[VisitedTabsStore.getterKeys.visitedViews];
  }

  get routes() {
    return (this.$router as any).options.routes;
  }

  @Watch('$route')
  private onRouteChange() {
    this.addTabs();
    this.updateCSS(true);
  }

  @Watch('activatedIndex')
  private onActivatedIndexChange(val, oldVal) {
    this.updateCSS(oldVal > -1);
  }

  @Watch('visible')
  private onVisibleChange(value: boolean) {
    if (value) {
      document.body.addEventListener('click', this.closeMenu);
    } else {
      document.body.removeEventListener('click', this.closeMenu);
    }
  }

  mounted() {
    this.addTabs();
    this.updateCSS();

    // 用户注销后 清除缓存
    Events.logout.$on(() => {
      this.$store.dispatch(VisitedTabsStore.actionKeys.delAllViews);
    });

    // 监听 window resize 事件，动态更新 $tabCur 元素定位
    window.onresize = Debounce(
      () => {
        this.updateCSS(true);
      },
      100,
      true
    );

    // i18n set 事件
    i18n.hooks.afterSet.tapAsync(async (lang) => {
      this.updateCSS(true);
    });
  }

  private updateCSS(transition?: boolean) {
    this.$nextTick(() => {
      // 切换样式
      if (this.$refs.tabs) {
        const $tab: any = (this.$refs.tabs as HTMLElement).querySelectorAll('.tab')[this.activatedIndex];
        if ($tab) {
          const $tabCur: any = this.$refs.tabCur;
          if (transition) {
            if (!$tabCur.className.match(new RegExp('(\\s|^)' + 'tab-cur-transition' + '(\\s|$)'))) {
              $tabCur.className += ' tab-cur-transition';
            }
          } else {
            $tabCur.className = $tabCur.className.replace(
              new RegExp('(\\s|^)' + 'tab-cur-transition' + '(\\s|$)'),
              ' '
            );
          }
          $tabCur.style.top = $tab.offsetParent.offsetTop + 'px';
          $tabCur.style.left = $tab.offsetParent.offsetLeft + 'px';
          $tabCur.style.width = $tab.offsetParent.offsetWidth + 'px';
        }
      }
    });
  }

  private isAffix() {
    return this.visitedViews.length === 1;
  }

  private addTabs() {
    this.$store.dispatch(VisitedTabsStore.actionKeys.addView, this.$route);
  }

  // 关闭当前标签
  private closeSelectedTab(view: IVisitedView) {
    this.$store.dispatch(VisitedTabsStore.actionKeys.delView, view);
    // 如果待关闭的标签与当前路由匹配
    if (view.name == this.$route.name || (view.name && this.$route.matched.some((x) => x.name === view.name))) {
      this.toLastView();
    }
  }

  // 关闭其他标签
  private closeOthersTabs() {
    this.$store.dispatch(VisitedTabsStore.actionKeys.delOthersViews, this.selectedTab);
    // 如果待关闭的标签与当前路由不匹配
    if (
      this.selectedTab.name !== this.$route.name &&
      !this.$route.matched.some((x) => x.name === this.selectedTab.name)
    ) {
      this.$router.push(this.selectedTab.fullPath);
    }
  }

  private closeAllTabs() {
    this.$store.dispatch(VisitedTabsStore.actionKeys.delAllViews);
    if (this.visitedViews.some((tab) => tab.path === this.$route.path)) {
      return;
    }
    this.toLastView();
  }

  private toLastView() {
    let latestView;
    if (this.visitedViews && this.visitedViews.length) {
      latestView = this.visitedViews.slice(-1)[0];
    }
    if (latestView && latestView.fullPath !== undefined) {
      this.$router.push(latestView.fullPath);
    } else {
      this.$store.dispatch(VisitedTabsStore.actionKeys.delAllViews);
      this.$emit('viewCleared');
    }
  }

  private openMenu(tab: IVisitedView, e: MouseEvent) {
    const menuMinWidth = 105;
    const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
    const offsetWidth = (this.$el as HTMLElement).offsetWidth; // container width
    const maxLeft = offsetWidth - menuMinWidth; // left boundary
    const left = e.clientX - offsetLeft + 15; // 15: margin right
    if (left > maxLeft) {
      this.left = e.clientX;
    } else {
      this.left = e.clientX;
    }
    this.top = e.clientY;
    this.visible = true;
    this.selectedTab = tab;
  }

  private closeMenu() {
    this.visible = false;
  }
}
</script>

<style lang="scss" scoped>
$height: 26px;
$duration: 0.2s;

.visited-tabs {
  position: relative;
  padding: 0 10px;
}

.tab {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 13px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-radius: 2px;
  transition: color $duration ease-in-out;
}

.cross-icon {
  position: relative;
  width: 10px;
  height: 10px;
  margin-top: 2px;
  margin-right: -5px;
  margin-left: 5px;
  transition-duration: 0.5s;
  transition-property: opacity, transform;
  transform: translate3d(0, 0, 0) rotate(135deg);

  &::before,
  &::after {
    position: absolute;
    display: block;
    content: '';
    background-color: #999;
    transition-timing-function: ease;
    transition-duration: $duration;
    transition-property: background-color, transform;
  }

  &::before {
    top: 50%;
    width: 100%;
    height: 1px;
    transform: translate3d(0, -50%, 0);
  }

  &::after {
    left: 50%;
    width: 1px;
    height: 100%;
    transform: translate3d(-50%, 0, 0);
  }
}

.tabs {
  position: relative;
  display: flex;
  flex-wrap: wrap;

  > li {
    position: relative;
    z-index: 2;
    height: $height;
    padding: 3px;

    &.tab-cur {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      display: inline-block;
      background: #05abe0;
      background: linear-gradient(45deg, #64b8ff, #bc9ad9);

      &.tab-cur-transition {
        transition: all $duration ease-in-out;
      }
    }

    &.activated {
      .tab {
        color: #fff;
      }

      .cross-icon {
        &::before,
        &::after {
          background-color: #fff;
        }
      }
    }

    &:not(.activated) {
      &:hover {
        color: #000;
        background-color: #f9f9f9;
      }
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
  padding: 5px 0;
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  list-style-type: none;
  background: #fff;
  border-radius: 2px;
  box-shadow: rgba(9, 30, 66, 0.25) 0 4px 8px -2px, rgba(9, 30, 66, 0.31) 0 0 1px;

  > li {
    padding: 7px 16px;
    margin: 0;
    cursor: pointer;

    &:hover {
      background: #eee;
    }
  }
}
</style>
