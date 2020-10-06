<template>
  <div
    class="menu-item"
    :class="{ 'menu-item-line': level > 0 }"
    :style="{ 'margin-left': (level / level) * 20 + 'px' }"
  >
    <template v-for="(menu, index) in menus">
      <template v-if="menu.children && menu.children.length">
        <template v-if="menu.url">
          <router-link
            :to="{ path: menu.url }"
            v-slot="{ href, route, navigate, isActive, isExactActive }"
            v-bind:exact="menu.url === '/'"
          >
            <as-submenu
              :class="[isActive && linkActiveClass, isExactActive && linkExactActiveClass]"
              tag="a"
              icon=""
              :group="accordion ? group : undefined"
              :index="menu.id"
              :href="isAbsurl(menu.url) ? menu.url : prefix + menu.url"
              :target="menu.target || '_self'"
              caption=""
              expand-separator
            >
              <template v-slot:title>
                <i :class="menu.icon" v-if="menu.icon"></i>
                <span>{{ $t(menu.label) }}</span>
              </template>
              <side-menu-item
                :menus="menu.children"
                :parents="parents"
                :accordion="accordion"
                :default-opened="defaultOpened"
                :group="menu.id"
                :level="level + 1"
                :prefix="prefix"
                :link-active-class="linkActiveClass"
                :link-exact-active-class="linkExactActiveClass"
              />
            </as-submenu>
          </router-link>
        </template>
        <template v-else>
          <as-submenu
            tag="a"
            icon=""
            :group="accordion ? group : undefined"
            :index="menu.id"
            :href="isAbsurl(menu.url) ? menu.url : prefix + menu.url"
            :target="menu.target || '_self'"
            caption=""
            expand-separator
          >
            <template v-slot:title>
              <i :class="menu.icon" v-if="menu.icon"></i>
              <span>{{ menu.label }}</span>
            </template>
            <side-menu-item
              :menus="menu.children"
              :parents="parents"
              :accordion="accordion"
              :default-opened="defaultOpened"
              :group="menu.id"
              :level="level + 1"
              :prefix="prefix"
              :link-active-class="linkActiveClass"
              :link-exact-active-class="linkExactActiveClass"
            />
          </as-submenu>
        </template>
      </template>
      <template v-else>
        <template v-if="menu.url">
          <router-link
            tag="a"
            :key="menu.id"
            :to="{ path: menu.url }"
            :target="menu.target || '_self'"
            v-bind:exact="menu.url === '/'"
          >
            <as-menu-item class="menu-item" :index="menu.id">
              <i :class="menu.icon" v-if="menu.icon"></i>
              <span slot="title">{{ $t(menu.label) }}</span>
            </as-menu-item>
          </router-link>
        </template>
        <template v-else>
          <as-menu-item
            class="menu-item"
            tag="a"
            icon=""
            :key="menu.id"
            :index="index.toString()"
            :href="isAbsurl(menu.url) ? menu.url : prefix + menu.url"
            :target="menu.target || '_self'"
            clickable
          >
            <i :class="menu.icon" v-if="menu.icon"></i>
            <span slot="title">{{ $t(menu.label) }}</span>
          </as-menu-item>
        </template>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AsMenu, AsMenuItem, AsSubmenu } from '../../../../lib/antdv-ui/components/menu';

import { IMenu } from '../../../interfaces/menu';

@Component({
  name: 'SideMenuItem',
  components: { AsMenu, AsMenuItem, AsSubmenu }
})
export default class extends Vue {
  @Prop({ default: (): IMenu[] => [] }) menus: IMenu[];
  @Prop({ default: (): string[] => [] }) parents: string[];
  @Prop({ default: false }) accordion: boolean;
  @Prop({ default: true }) defaultOpened: boolean;
  @Prop({ default: null }) group: string;
  @Prop({ default: null }) cur: string;
  @Prop({ default: 0 }) level: number;
  @Prop({ default: '' }) prefix: string;
  @Prop({ default: '' }) linkActiveClass: string;
  @Prop({ default: '' }) linkExactActiveClass: string;

  isAbsurl(url: string) {
    if (url) {
      return /^(?:[a-z]+:)?\/\//i.test(url);
    }
    return false;
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .as-menu-item {
    display: flex;
    align-items: center;
    min-width: inherit;
    height: 32px;
    padding: 0 10px !important;
    margin: 5px 0;
    border-radius: 3px;

    &.is-active {
      color: #303133;
    }
  }

  .as-submenu__title {
    display: flex;
    align-items: center;
    min-width: inherit;
    height: auto;
    min-height: 32px;
    padding: 0 30px 0 10px !important;
    margin: 5px 0;
    line-height: 22px;
    border-radius: 3px;

    > span {
      white-space: normal;
    }

    &:focus,
    &:hover {
      background: #e2e2e2;
    }
  }

  .as-submenu {
    &.is-opened {
      > .as-submenu__title {
        font-weight: bold;
      }
    }
  }
}

.menu-item {
  height: auto;
  min-height: 32px;
  line-height: 22px;

  > span {
    white-space: normal;
  }

  &.menu-item-line {
    padding-left: 10px;

    &::before {
      position: absolute;
      top: 0;
      left: 20px;
      width: 3px;
      height: 100%;
      content: '';
      background-color: #e0e4e6;
      border-radius: 15px;
      opacity: 1;
    }
  }

  > a {
    display: block;
    border-radius: 5px;

    &:not(.activated):focus,
    &:not(.activated):hover {
      .as-menu-item {
        background-color: #e0e4e6;
      }
    }

    &.activated {
      .as-menu-item {
        font-size: 14px;
        color: #1976d2;
        background-color: #cedbe6;
      }
    }
  }
}
</style>
