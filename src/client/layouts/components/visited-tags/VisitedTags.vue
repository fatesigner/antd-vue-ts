<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroller ref="scrollPane" class="tags-view-wrapper">
      <router-link
        class="tags-view-item"
        v-for="tag in visitedViews"
        ref="tag"
        tag="span"
        :key="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        @click.middle.native="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent.native="openMenu(tag, $event)"
      >
        {{ $t('route.' + tag.meta.label) }}
        <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" title="关闭" />
      </router-link>
    </scroller>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        {{ $t('tagsView.refresh') }}
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        {{ $t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">
        {{ $t('tagsView.closeOthers') }}
      </li>
      <li @click="closeAllTags(selectedTag)">
        {{ $t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import path from 'path';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';

import { IVisitedView, VisitedTagsStore } from './store';

import { Scroller } from '../../../components/scroller';

@Component({
  name: 'VisitedTags',
  components: {
    Scroller
  }
})
export default class extends Vue {
  private visible = false;
  private top = 0;
  private left = 0;
  private selectedTag: IVisitedView = {};
  private affixTags: IVisitedView[] = [];

  get visitedViews() {
    return this.$store.getters[VisitedTagsStore.getterKeys.visitedViews];
  }

  get routes() {
    return (this.$router as any).options.routes;
  }

  @Watch('$route')
  private onRouteChange() {
    this.addTags();
    this.moveToCurrentTag();
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
    this.initTags();
    this.addTags();
  }

  private isActive(route: IVisitedView) {
    return route.path === this.$route.path;
  }

  private isAffix(tag: IVisitedView) {
    return tag.meta && tag.meta.affix;
  }

  private filterAffixTags(routes: RouteConfig[], basePath = '/') {
    let tags: IVisitedView[] = [];
    routes.forEach((route) => {
      if (route.meta && route.meta.affix) {
        const tagPath = path.resolve(basePath, route.path);
        tags.push({
          fullPath: tagPath,
          path: tagPath,
          name: route.name,
          meta: { ...route.meta }
        });
      }
      if (route.children) {
        const childTags = this.filterAffixTags(route.children, route.path);
        if (childTags.length >= 1) {
          tags = [...tags, ...childTags];
        }
      }
    });
    return tags;
  }

  private initTags() {
    this.affixTags = this.filterAffixTags(this.routes);
    for (const tag of this.affixTags) {
      // Must have tag name
      if (tag.name) {
        this.$store.dispatch(VisitedTagsStore.actionKeys.addVisitedView, tag);
      }
    }
  }

  private addTags() {
    const { name } = this.$route;
    if (name) {
      this.$store.dispatch(VisitedTagsStore.actionKeys.addView, this.$route);
    }
    return false;
  }

  private moveToCurrentTag() {
    const tags = this.$refs.tag as any[]; // TODO: better typescript support for router-link
    this.$nextTick(() => {
      for (const tag of tags) {
        if ((tag.to as IVisitedView).path === this.$route.path) {
          (this.$refs.scrollPane as any).moveToTarget(tag as any);
          // When query is different then update
          if ((tag.to as IVisitedView).fullPath !== this.$route.fullPath) {
            this.$store.dispatch(VisitedTagsStore.actionKeys.updateVisitedView, this.$route);
          }
          break;
        }
      }
    });
  }

  private refreshSelectedTag(view: IVisitedView) {
    this.$store.dispatch(VisitedTagsStore.actionKeys.delCachedView, view);
    const { fullPath } = view;
    this.$nextTick(() => {
      this.$router.replace({
        path: '/redirect' + fullPath
      });
    });
  }

  private closeSelectedTag(view: IVisitedView) {
    this.$store.dispatch(VisitedTagsStore.actionKeys.delView, view);
    if (this.isActive(view)) {
      this.toLastView(this.$store.getters[VisitedTagsStore.getterKeys.visitedViews], view);
    }
  }

  private closeOthersTags() {
    if (this.selectedTag.fullPath !== undefined) {
      this.$router.push(this.selectedTag.fullPath);
    }
    this.$store.dispatch(VisitedTagsStore.actionKeys.delOthersViews, this.selectedTag);
    this.moveToCurrentTag();
  }

  private closeAllTags(view: IVisitedView) {
    this.$store.dispatch(VisitedTagsStore.actionKeys.delAllViews);
    if (this.affixTags.some((tag) => tag.path === this.$route.path)) {
      return;
    }
    this.toLastView(this.$store.getters[VisitedTagsStore.getterKeys.visitedViews], view);
  }

  private toLastView(visitedViews: IVisitedView[], view: IVisitedView) {
    const latestView = visitedViews.slice(-1)[0];
    if (latestView !== undefined && latestView.fullPath !== undefined) {
      this.$router.push(latestView.fullPath);
    } else {
      // Default redirect to the dashboard page if there is no tags-view, adjust it if you want
      if (view.name === 'Dashboard') {
        // to reload dashboard page
        this.$router.replace({ path: '/redirect' + view.fullPath });
      } else {
        this.$router.push('/');
      }
    }
  }

  private openMenu(tag: IVisitedView, e: MouseEvent) {
    const menuMinWidth = 105;
    const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
    const offsetWidth = (this.$el as HTMLElement).offsetWidth; // container width
    const maxLeft = offsetWidth - menuMinWidth; // left boundary
    const left = e.clientX - offsetLeft + 15; // 15: margin right
    if (left > maxLeft) {
      this.left = maxLeft;
    } else {
      this.left = left;
    }
    this.top = e.clientY;
    this.visible = true;
    this.selectedTag = tag;
  }

  private closeMenu() {
    this.visible = false;
  }
}
</script>

<style lang="scss">
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;

      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }

      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
