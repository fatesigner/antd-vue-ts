<template>
  <as-drawer v-bind="drawer">
    <dl class="container">
      <dt>
        <button class="btn-search" @click="drawer.props.visible = false">
          <v-icon name="arrow-left" />
        </button>
      </dt>
      <dd>
        <div class="input-search">
          <a-input ref="searchInputRef" v-model.trim="searchInput" placeholder="搜索菜单、其他内容..." />
          <button class="close-icon" title="移除" @click="searchInput = ''">
            <a-spin v-if="loading" />
            <v-icon name="times" v-else-if="searchInput" />
          </button>
        </div>
        <dl class="result" v-if="searchMenus.length">
          <dt>菜单</dt>
          <dd v-for="item in searchMenus">
            <router-link
              :to="item.url || {}"
              v-slot="{ href, route, navigate, isActive, isExactActive }"
              v-bind:exact="item.url === '/'"
            >
              <a :class="[isActive && 'activated', isExactActive && 'activated']" @click="menuClick(item)">
                <a-icon :type="item.icon" v-if="item.icon" />
                {{ $t(item.label) }}
              </a>
            </router-link>
          </dd>
        </dl>
      </dd>
    </dl>
  </as-drawer>
</template>

<script lang="ts">
import { Debounce } from '@fatesigner/utils';
import { StructureTree } from '@fatesigner/utils/structure-tree';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AsDrawer, CreateAsDrawer } from '../../../../lib/antdv-ui/components/drawer';
import '../../../../lib/antdv-ui/icons/arrow-left';
import '../../../../lib/antdv-ui/icons/times';

import { IMenu } from '../../../interfaces/menu';

import Navigation from './Navigation.vue';
import { SessionService } from '../../../services/session.service';

const strutree = new StructureTree<IMenu>();

@Component({
  name: 'NavigationSearch',
  components: {
    AsDrawer,
    Navigation
  }
})
export default class extends Vue {
  @Prop({ default: false }) visible: boolean;

  getContext() {
    return this;
  }

  loading = false;
  searchInput = '';

  menus: IMenu[] = [];
  searchMenus: IMenu[] = [];

  drawer = CreateAsDrawer({
    getContext: this.getContext,
    props: {
      padding: false,
      closeable: false,
      direction: 'left',
      visible: false
    },
    listeners: {
      visibleChanged(val: boolean) {
        if (val !== this.visible) {
          this.$emit('update:visible', val);
        }
      },
      presented() {
        (this.$refs?.searchInputRef as any)?.$el.focus();
      }
    }
  });

  @Watch('visible', {
    immediate: true
  })
  onCollapsedChange(val: boolean) {
    if (val !== this.drawer.props.visible) {
      this.drawer.props.visible = val;
    }
  }

  @Watch('searchInput')
  onSearchInputChange = Debounce(
    () => {
      return function (this: any) {
        if (this.searchInput) {
          this.searchMenus = strutree.reduce(
            this.menus,
            (prev, cur) => {
              if (cur.url && this.$t(cur.label).indexOf(this.searchInput) > -1) {
                prev.push(cur);
              }
              return prev;
            },
            []
          );
        } else {
          this.searchMenus = [];
        }
        this.loading = false;
      }.call(this.getContext());
    },
    500,
    false,
    () => {
      (function (this: any) {
        this.loading = true;
      }.call(this.getContext()));
    }
  );

  created() {
    this.menus = strutree.filter(SessionService.user.menus, (cur) => {
      return cur.name !== 'Auth' && cur.name !== 'Menus';
    });
  }

  menuClick(item: any) {
    if (this.$route.name !== item.name) {
      this.$router.push(item.url);
    }
    this.drawer.props.visible = false;
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  width: 460px;
  padding: 20px 20px 20px 0;

  > dt {
    width: 64px;
  }

  > dd {
    flex: 1;
  }
}

.btn-search {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 5px;
  margin: auto;
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  outline: none;
  transition: background-color 0.5s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: rgba(0, 0, 0, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.input-search {
  display: flex;
  align-items: center;
  padding-bottom: 2px;
  border-bottom: 2px solid rgb(38, 132, 255);

  .ant-input {
    height: 36px;
    padding-left: 0;
    font-size: 20px;
    line-height: 36px;
    border: none;
    outline: none;
    box-shadow: none;
  }

  .close-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 5px;
    margin: auto;
    cursor: pointer;
    background-color: transparent;
    border: none;
    border-radius: 50%;
    outline: none;

    svg {
      width: 22px;
      height: 22px;
    }
  }
}

.result {
  margin-top: 16px;

  > dt {
    padding: 5px 0;
    color: rgb(107, 119, 140);
  }

  > dd {
    &:not(:last-child) {
      margin-bottom: 10px;
    }

    a {
      display: block;
      padding: 8px 10px;
      font-size: 16px;
      line-height: 24px;
      color: #333;
      border-radius: 3px;
      transition: background-color 0.2s;

      &.activated {
        font-weight: 700;
        color: #1976d2;
        background-color: #cedbe6;
      }

      &:not(.activated):focus,
      &:not(.activated):hover {
        color: #333;
        background-color: #e0e4e6;
      }
    }
  }
}
</style>
