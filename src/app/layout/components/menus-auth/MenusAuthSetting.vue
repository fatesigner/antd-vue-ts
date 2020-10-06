<template>
  <section class="menus">
    <as-async-section v-bind="asyncData">
      <template #loading>
        <div class="loading-wrap">
          <as-loading size="large" />
        </div>
      </template>
      <template #content>
        <a-form>
          <a-form-item label="角色">
            <a-select placeholder="选择角色" v-model="role" @change="onRoleChange" style="width: 165px;">
              <a-select-option v-for="item in roles" :key="item.id" :value="item.id">{{ item.desc }} </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="操作">
            <div class="vui-row vui-offset vui-row-wrap">
              <!--<div class="vui-col-auto">
                <a-button icon="import" type="primary" @click="importJsonFile">导入</a-button>
              </div>-->
              <div class="vui-col-auto">
                <a-button class="outline primary" type="warning" :loading="loading" @click="save"
                  ><v-icon name="save" />保存
                </a-button>
              </div>
            </div>
            <p class="vui-f12 vui-g9">注：节点可以拖拽排序，但不允许越级。</p>
          </a-form-item>
        </a-form>
        <a-tree
          :disabled="loading"
          class="tree-nodes"
          ref="tree"
          :tree-data="tree.nodes"
          :replace-fields="{ children: 'children', title: 'label', key: 'id' }"
          :show-line="true"
          :show-icon="false"
          :selected.sync="tree.selected"
          :ticked.sync="tree.ticked"
          :expanded.sync="tree.expanded"
          :default-checked-keys="defaultCheckedKeys"
          :default-expand-all="false"
          :default-expanded-keys="tree.defaultExpandedKeys"
          v-model="checkedKeys"
          @drop="onDrop"
          checkable
          draggable
        >
          <dl class="tree-node" slot="title" slot-scope="data">
            <dt>
              <div class="vui-row vui-offset">
                <div class="vui-col-auto">
                  <a-icon type="home" />
                  <a-icon :type="data.icon" v-if="data.icon" />
                  <a-icon type="folder" v-else-if="(data.children && data.children.length) || !data.url" />&nbsp;
                </div>
                <div class="vui-col-auto">
                  {{ $t(data.label) }}
                  <p class="vui-f12 vui-g9">{{ data.url }}</p>
                </div>
              </div>
            </dt>
            <dd>
              <a-button
                icon="plus"
                size="small"
                type="link"
                :disabled="loading"
                @click.stop="actionDialog.present(getContext(), '添加菜单', data, null)"
                title="添加"
              ></a-button>
              <a-button
                icon="edit"
                size="small"
                type="link"
                :disabled="loading"
                v-if="!data.disabled && !data.readonly"
                @click.stop="actionDialog.present(getContext(), '编辑菜单', null, data)"
                title="编辑"
              ></a-button>
              <a-popconfirm
                v-if="!data.disabled && !data.readonly"
                ok-text="确定"
                cancel-text="取消"
                iconColor="red"
                title="确定删除吗？"
                @confirm="onRemove(data)"
              >
                <a-button icon="delete" :disabled="loading" size="small" type="link" title="删除"></a-button>
              </a-popconfirm>
            </dd>
          </dl>
        </a-tree>
        <p v-if="error">{{ error }}</p>
      </template>
    </as-async-section>
    <a-modal :visible.sync="actionDialog.visible" @cancel="actionDialog.onClose()" :footer="null">
      <validation-observer ref="validator">
        <a-form class="form">
          <a-form-item label="类型">
            <validation-provider name="类型" rules="required" v-slot="{ classes, errors }">
              <a-radio-group v-model="actionDialog.form.type" button-style="solid">
                <a-radio value="1">层级菜单</a-radio>
                <a-radio value="2">链接菜单</a-radio>
              </a-radio-group>
              <transition-collapse>
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-collapse>
            </validation-provider>
          </a-form-item>
          <a-form-item label="图标">
            <a-select
              v-model="actionDialog.form.icon"
              allowClear
              showSearch
              placeholder="选择图标"
              style="width: 150px;"
            >
              <a-select-option v-for="item in icons" :key="item" :value="item">
                <a-icon :type="item"></a-icon>&nbsp;{{ item }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="页面" v-if="actionDialog.form.type === '2'">
            <validation-provider name="页面" v-slot="{ classes, errors }">
              <a-select
                v-model="actionDialog.form.name"
                allowClear
                showSearch
                placeholder="选择已有的一个页面"
                @change="actionDialog.onNameChange(getContext(), $event)"
              >
                <a-select-option v-for="item in pages" :key="item.id" :value="item.name">
                  <div class="vui-dib" :style="{ width: 10 * (item.level - 1) + 'px' }"></div>
                  {{ $t(item.label) }} {{ item.url }}
                </a-select-option>
              </a-select>
              <transition-collapse>
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-collapse>
            </validation-provider>
          </a-form-item>
          <a-form-item label="标题">
            <validation-provider name="标题" rules="required" v-slot="{ classes, errors }">
              <a-input
                v-if="actionDialog.form.name"
                :value="$t(actionDialog.form.label)"
                :disabled="!!actionDialog.form.name"
              />
              <a-input v-else :class="classes" v-model="actionDialog.form.label" />
              <transition-collapse>
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-collapse>
            </validation-provider>
          </a-form-item>
          <a-form-item label="路径" v-if="actionDialog.form.type === '2'">
            <validation-provider name="路径" rules="required" v-slot="{ classes, errors }">
              <a-input :class="classes" v-model="actionDialog.form.url" :disabled="!!actionDialog.form.name" />
              <transition-collapse>
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-collapse>
            </validation-provider>
          </a-form-item>
          <a-form-item label="打开方式" v-if="actionDialog.form.type === '2'">
            <validation-provider name="打开方式" rules="required" v-slot="{ classes, errors }">
              <a-select v-model="actionDialog.form.target" placeholder="选择打开方式" style="width: 150px;">
                <a-select-option label="当前窗口" value="_self">当前窗口</a-select-option>
                <a-select-option label="新窗口" value="_blank">新窗口</a-select-option>
              </a-select>
              <transition-collapse>
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-collapse>
              <p class="vui-f12 vui-g9">打开界面的方式，当前窗口或新窗口</p>
            </validation-provider>
          </a-form-item>
          <a-form-item>
            <template #label></template>
            <a-button
              block
              type="primary"
              size="large"
              :loading="actionDialog.uploading"
              @click="actionDialog.onSubmit(getContext())"
              >提交
            </a-button>
          </a-form-item>
        </a-form>
      </validation-observer>
    </a-modal>
  </section>
</template>
<script lang="ts">
import to from 'await-to-js';
import { GetGUID } from '@fatesigner/utils/random';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StructureTree } from '@fatesigner/utils/structure-tree';
import { TransitionCollapse } from '@fatesigner/vue-lib/components/transition';
import AsAsyncSection from '../../../../lib/antdv-ui/components/async-section/AsAsyncSection.vue';
import { CreateAsAsyncSection } from '../../../../lib/antdv-ui/components/async-section';
import { Button, Form, Modal, Popconfirm, Radio, Tree } from 'ant-design-vue';
import { AsLoading } from '../../../../lib/antdv-ui/components/loading';
import { GetMenusFromRoutes } from '../../../../lib/vue-helper';
import { AsTable } from '../../../../lib/antdv-ui/components/table';
import '../../../../lib/antdv-ui/icons/save';

import { IMenu } from '../../../interfaces/menu';
import { RichRoutes } from '../../../routes/config';
import { CommonService } from '../../../services/common.service';

const strutreeMenus: StructureTree<IMenu> = new StructureTree<IMenu>();

Vue.use(Button);
Vue.use(Radio);
Vue.use(Form);
Vue.use(Popconfirm);
Vue.use(Tree);
Vue.use(Modal);

@Component({
  name: 'MenusAuthSetting',
  components: {
    AsTable,
    AsLoading,
    AsAsyncSection,
    TransitionCollapse
  }
})
export default class extends Vue {
  @Prop({ default: null, type: [Object, Promise, Function] }) getRoles: () => Promise<
    { value: string; text: string }[]
  >;

  @Prop({ default: null, type: [Object, Promise, Function] }) read: (role?: string) => Promise<IMenu[]>;
  @Prop({ default: null, type: [Object, Promise, Function] }) add: (role: string, menus: IMenu[]) => Promise<void>;
  // 需要排除的角色组
  @Prop({ default: [] }) excludedRoles: string[];

  getContext() {
    return this;
  }

  loading = false;

  error = '';

  pages: IMenu[] = [];

  icons: string[] = require('../../../../lib/antdv-ui/icons/antdv-icons');

  roles: any[] = [];

  role: string = null;

  defaultCheckedKeys: string[] = [];

  checkedKeys: string[] = [];

  get unbindPages() {
    if (this.tree.nodes) {
      const names = strutreeMenus.reduce(
        this.tree.nodes,
        (prev, cur) => {
          if (cur.name) {
            prev.push(cur.name);
          }
          return prev;
        },
        []
      );
      return this.pages.filter((x: any) => names.indexOf(x.name) < 0);
    }
    return [];
  }

  actionDialog: any = {
    visible: false,
    title: '',
    uploading: false,
    form: {
      type: '2',
      label: null,
      order: 0,
      page: null,
      url: null,
      icon: null,
      target: '_self'
    },
    nodeIndex: 0,
    present(currentContext: any, title: string, parentNode: IMenu, currentNode: IMenu) {
      if (!currentNode) {
        currentNode = {} as any;
      }
      this.title = title;
      if (parentNode) {
        this.parentNode = parentNode;
        this.nodeIndex = parentNode.children.length;
      } else {
        const res = strutreeMenus.find(currentContext.tree.nodes, (x) => x.id === currentNode.id);
        if (res) {
          this.parentNode = res.parentNodes[res.parentNodes.length - 1];
          this.nodeIndex = res.index;
        }
      }
      this.currentNode = currentNode;
      this.form.type = currentNode.url ? '2' : '1';
      this.form.label = currentNode.label;
      this.form.url = currentNode.url;
      this.form.name = currentNode.name;
      this.form.target = currentNode.target || '_self';
      this.form.icon = currentNode.icon;
      this.form.order = this.nodeIndex + 1;
      currentContext.actionDialog.visible = true;
    },
    onSubmit(currentContext: any) {
      (currentContext.$refs.validator as any).validate().then((success: boolean) => {
        if (success) {
          if (this.currentNode && this.currentNode.id) {
            // 编辑
            this.currentNode.label = this.form.label;
            this.currentNode.icon = this.form.icon;
            if (this.form.type === '1') {
              this.currentNode.name = null;
              this.currentNode.url = null;
              this.currentNode.target = null;
            } else {
              this.currentNode.name = this.form.name;
              this.currentNode.url = this.form.url;
              this.currentNode.target = this.form.target;
            }
            if (this.nodeIndex !== this.form.order) {
              this.parentNode.children.splice(this.nodeIndex, 1);
              this.parentNode.children.splice(this.form.order - 1, 0, this.currentNode);
            }
            this.visible = false;
          } else {
            // 新增
            const newNode: IMenu = currentContext.nodeMap({
              id: GetGUID(12).toLowerCase(),
              label: this.form.label,
              name: null,
              url: null,
              target: null,
              icon: this.form.icon,
              children: []
            });
            if (this.form.type === '2') {
              newNode.name = this.form.name;
              newNode.url = this.form.url;
              newNode.target = this.form.target;
            }
            this.visible = false;
            /* const cur = strutreeMenus.find(currentContext.tree.nodes, (node) => node.id === this.parentNode.id);
            if (cur) {
              cur.node.children.push(newNode);
            } */
            this.parentNode.children.push(newNode);
            currentContext.$nextTick(() => {
              // (currentContext.$refs.tree as any).append(newNode, this.parentNode.id);
              // (currentContext.$refs.tree as any).store.nodesMap[this.parentNode.id].expanded = true;
            });
          }
        }
      });
    },
    onNameChange(currentContext: any, val: string) {
      const option = currentContext.pages.find((x: any) => x.name === val);
      if (option) {
        this.form.label = option.label;
        this.form.url = option.url;
      } else {
        this.form.label = null;
        this.form.url = null;
      }
    },
    onClose() {
      this.visible = false;
    }
  };

  tree: {
    key: string;
    nodes: IMenu[];
    selected: any[];
    ticked: any[];
    expanded: any[];
    defaultExpandedKeys: string[];
  } = {
    key: '',
    nodes: [],
    selected: null,
    ticked: [],
    expanded: [],
    defaultExpandedKeys: []
  };

  // 当前数据
  asyncData = CreateAsAsyncSection({
    getContext: this.getContext,
    props: {
      size: 'large',
      initialized: false,
      async initialize() {
        // 获取 menus
        if (this.read) {
          this.loading = true;
          this.read()
            .then((menus) => {
              this.tree.nodes = [
                this.nodeMap({
                  id: '_',
                  label: '根目录',
                  readonly: true,
                  url: null,
                  children: strutreeMenus.map(menus, (node) => this.nodeMap(node))
                })
              ];
              this.expandRoot();
            })
            .catch((err) => {
              this.error = err.message;
            })
            .finally(() => {
              this.loading = false;
            });
        }

        if (this.getRoles) {
          const roles = await this.getRoles();
          if (roles && roles.length) {
            // 排除指定角色组
            this.roles = roles.filter((x: any) => !this.excludedRoles.includes(x.id));
            // 默认设置第一个角色
            if (this.roles.length > 0) {
              this.role = this.roles[0].id;
              await this.onRoleChange(this.role);
            }
          }
        }
      }
    }
  });

  nodeMap(node: any) {
    return {
      ...node,
      scopedSlots: { title: 'title', icon: 'icon' }
    };
  }

  // 导入json文件
  importJsonFile() {
    CommonService.importStreamFile('.json').then((menus: any) => {
      this.tree.nodes = [
        this.nodeMap({
          id: '_',
          label: '根目录',
          readonly: true,
          url: null,
          icon: 'dashboard',
          children: strutreeMenus.map(menus, (node) => this.nodeMap(node))
        })
      ];
      this.expandRoot();
    });
  }

  // 保存
  async save() {
    if (this.add) {
      this.loading = true;

      const data = strutreeMenus.map(this.tree.nodes[0].children, (node) => {
        return {
          id: node.id,
          label: node.label,
          name: node.name,
          url: node.url,
          target: node.target,
          icon: node.icon,
          children: node.children
        };
      });

      // return CommonService.exportStreamFile(JSON.stringify(data), 'menus.json');

      const menus = await this.getCurrentMenus();

      const [err] = await to(Promise.all([this.add(null, data), this.add(this.role, menus)]));

      if (err) {
        this.$notification.error({ message: '', description: err.message });
      }

      this.loading = false;
    }
  }

  expandRoot() {
    this.tree.defaultExpandedKeys = this.tree.nodes.map((x: any) => x.id);
  }

  allowDrop(draggingNode: any, dropNode: any, type: any) {
    if (draggingNode.level === dropNode.level) {
      if (draggingNode.parent.id === dropNode.parent.id) {
        return type === 'prev';
      }
    } else {
      // 不响应越级操作
      return false;
    }
  }

  onRemove(currentNode: IMenu) {
    const cur = strutreeMenus.find(this.tree.nodes, (x) => x.id === currentNode.id);
    if (cur.parentNodes.length) {
      cur.parentNodes[cur.parentNodes.length - 1].children.splice(cur.index, 1);
    }
  }

  async created() {
    // 解析路由表
    this.pages = GetMenusFromRoutes(RichRoutes);
  }

  // 切换角色
  async onRoleChange(val: string) {
    // 获取对应的 menus
    if (this.read) {
      this.loading = true;

      const [err, menus] = await to(this.read(val));

      if (err) {
        this.error = err.message;
      } else {
        // 遍历节点，获取 checked arr
        const checkedKeys = strutreeMenus.reduce(
          menus,
          (prev, cur) => {
            prev.push(cur.id);
            return prev;
          },
          []
        );

        // 移除未全部选中的父节点
        strutreeMenus.every(this.tree.nodes, (cur) => {
          if (cur.children.some((x) => checkedKeys.indexOf(x.id) < 0)) {
            const idx = checkedKeys.indexOf(cur.id);
            if (idx > -1) {
              checkedKeys.splice(idx, 1);
            }
          }
          return true;
        });

        this.checkedKeys = checkedKeys;
      }

      this.loading = false;
    }
  }

  async getCurrentMenus() {
    const checkedKeys = this.checkedKeys.map((x: any) => x);

    strutreeMenus.every(this.tree.nodes, (cur, index, parentNodes) => {
      if (checkedKeys.indexOf(cur.id) > -1) {
        // 将其所有父级的 id 均添加至 checkedKeys
        parentNodes
          .map((x: any) => x.id)
          .filter((x: any) => checkedKeys.indexOf(x) < 0)
          .forEach((x) => {
            checkedKeys.push(x);
          });
      }
      return true;
    });

    const nodesNew = strutreeMenus.filter(this.tree.nodes, (cur) => {
      return checkedKeys.indexOf(cur.id) > -1;
    });

    if (nodesNew.length) {
      return nodesNew[0].children;
    }

    return nodesNew;
  }

  onDrop(info) {
    const dropPos = info.node.pos.split('-');
    if (dropPos.length >= 3) {
      const node = strutreeMenus.find(this.tree.nodes, (x) => x.id === info.node.eventKey);
      if (node) {
        const parentNode = node.parentNodes[node.parentNodes.length - 1];
        const spliceNode = strutreeMenus.find(this.tree.nodes, (x) => x.id === info.dragNode.eventKey);
        if (spliceNode) {
          const parentSpliceNode = spliceNode.parentNodes[spliceNode.parentNodes.length - 1];
          parentSpliceNode.children.splice(spliceNode.index, 1);
        }
        parentNode.children.splice(info.dropPosition + 1, 0, spliceNode.node);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-wrap {
  padding-top: 20px;
  padding-left: 30px;
}

.tree-node {
  display: flex;
  align-items: center;

  dt {
    margin-right: 10px;
  }

  dd {
    .ant-btn {
      margin-left: 2px;
    }
  }

  .a-link {
    margin: 5px;
  }

  [class^='anticon'] {
    font-size: 16px;
    color: orange;
  }

  .a-icon-folder {
    color: orange;
  }

  .a-icon-link {
    color: #1976d2;
  }
}

.tree-nodes {
  font-size: 14px;

  ::v-deep .ant-tree-treenode-switcher-close {
    height: auto;
  }

  ::v-deep .ant-tree-node-content-wrapper {
    height: auto;
  }

  ::v-deep .ant-tree-switcher-line-icon {
    &.anticon-minus-square,
    &.anticon-plus-square {
      color: #ff946c;
    }
  }

  .q-tree__node--selected {
    background-color: #eee;
  }

  .q-tree__node-header,
  .q-tree__node--child {
    .tree-btn-edit {
      display: none;
    }

    .tree-btn-up {
      display: none;
    }

    &:hover {
      cursor: pointer;
      background-color: #eee;

      .tree-btn-edit,
      .tree-btn-up {
        display: block;
      }
    }
  }

  .q-tree__node-body {
    padding-bottom: 0 !important;
  }

  .tree-body {
    padding-left: 5px;
    margin-top: -5px;
    font-size: 12px;
  }

  .treeitem {
    margin-bottom: 2px;
  }
}

::v-deep .ant-form-item-label {
  width: 80px;
}

.form {
  width: 420px;
  margin-right: 50px;

  ::v-deep .ant-form-item-label {
    width: 80px;
  }
}
</style>
