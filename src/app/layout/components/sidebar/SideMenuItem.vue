<template>
  <div class="menu-item">
    <template v-for="menu in menus">
      <template v-if="menu.children && menu.children.length">
        <template v-if="menu.url">
          <router-link :to="menu.url || {}" v-slot="{ href, route, navigate, isActive, isExactActive }" exact>
            <el-submenu
              :class="[isActive && linkActiveClass, isExactActive && linkExactActiveClass]"
              tag="a"
              icon=""
              :default-opened="defaultOpened ? true : parents.indexOf(menu.id) > -1"
              :group="accordion ? group : undefined"
              :key="menu.id"
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
            </el-submenu>
          </router-link>
        </template>
        <template v-else>
          <el-submenu
            tag="a"
            icon=""
            :default-opened="defaultOpened ? true : parents.indexOf(menu.id) > -1"
            :group="accordion ? group : undefined"
            :key="menu.id"
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
          </el-submenu>
        </template>
      </template>
      <template v-else>
        <template v-if="menu.url">
          <router-link :to="menu.url" v-slot="{ href, route, navigate, isActive, isExactActive }" exact>
            <a
              :href="isAbsurl(menu.url) ? menu.url : prefix + menu.url"
              :target="menu.target || '_self'"
              :key="menu.id"
            >
              <el-menu-item
                class="menu-item"
                :class="[isActive && linkActiveClass, isExactActive && linkExactActiveClass]"
                :index="menu.id"
              >
                <i :class="menu.icon" v-if="menu.icon"></i>
                <span slot="title">{{ menu.label }}</span>
              </el-menu-item>
            </a>
          </router-link>
        </template>
        <template v-else>
          <el-menu-item
            class="menu-item"
            tag="a"
            icon=""
            :key="menu.id"
            :index="menu.id"
            :href="isAbsurl(menu.url) ? menu.url : prefix + menu.url"
            :target="menu.target || '_self'"
            clickable
          >
            <i :class="menu.icon" v-if="menu.icon"></i>
            <span slot="title">{{ menu.label }}</span>
          </el-menu-item>
        </template>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { IMenu } from '../../../interfaces/memu';

@Component({
  name: 'SideMenuItem'
})
export default class extends Vue {
  @Prop({ default: () => [] }) menus: IMenu[];
  @Prop({ default: () => [] }) parents: string[];
  @Prop({ default: false }) accordion: boolean;
  @Prop({ default: true }) defaultOpened: boolean;
  @Prop({ default: null }) group: string;
  @Prop({ default: 0 }) level: number;
  @Prop({ default: null }) cur: string;
  @Prop({ default: '' }) prefix: string;
  @Prop({ default: '' }) linkActiveClass: string;
  @Prop({ default: '' }) linkExactActiveClass: string;

  isAbsurl(url) {
    if (url) {
      return /^(?:[a-z]+:)?\/\//i.test(url);
    }
    return false;
  }
}
</script>

<style lang="scss">
.menu-item {
  .el-submenu__title:focus,
  .el-submenu__title:hover {
    background-color: #eee;
    outline: 0;
  }

  .el-submenu.is-active .el-submenu__title {
    border-bottom: 1px solid #efefef;
  }

  .el-menu--inline {
    background-color: #f9f9f9;
    border-bottom: 1px solid #efefef;
  }

  .el-submenu__title {
    border-bottom: 1px solid #efefef;
  }

  .el-menu-item {
    padding: 0;

    &:not(.activated):focus,
    &:not(.activated):hover {
      background-color: #eee;
      outline: 0;
    }

    &.activated {
      font-size: 14px;
      font-weight: 600;
      color: #1976d2;
      background-color: #e0edf9;
    }
  }

  a {
    display: block;
  }
}
</style>
