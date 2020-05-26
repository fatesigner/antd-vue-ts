<template>
  <Layout class="menus">
    <div class="vui-mb10">
      <q-btn push color="primary" @click="importJsonFile"> <q-icon name="cloud_upload" />&nbsp;&nbsp;导入 </q-btn>
      <q-btn push color="white" text-color="primary" @click="exportJsonFile">
        <q-icon name="cloud_download" />&nbsp;&nbsp;导出
      </q-btn>
    </div>
    <div class="vui-mb10">
      <h6>当前未绑定到菜单的界面</h6>
      <q-badge
        class="vui-m5 vui-f14"
        v-for="page in unbindPages"
        :key="page.id"
        text-color="primary"
        outline
        color="primary"
      >
        {{ page.label }}
        <div class="vui-ml2 text-secondary">（{{ page.url }}）</div>
      </q-badge>
      <p class="vui-dib vui-ml10 vui-f12 vui-g9" v-if="!unbindPages.length">暂无数据</p>
    </div>
    <q-tree
      class="tree-nodes col-12 col-sm-6"
      ref="tree"
      :nodes.sync="tree.nodes"
      node-key="id"
      label-key="label"
      :selected.sync="tree.selected"
      :ticked.sync="tree.ticked"
      :expanded.sync="tree.expanded"
      :noTick="true"
      :lazy="false"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-icon v-if="prop.node.icon" :name="prop.node.icon" color="orange" size="24px" class="q-mr-sm" />
          <q-icon v-if="!prop.node.icon && prop.node.url" name="link" color="orange" size="24px" class="q-mr-sm" />
          <q-icon v-if="!prop.node.icon && !prop.node.url" name="folder" color="orange" size="24px" class="q-mr-sm" />
          <div class="text-dark">{{ prop.node.label }}</div>
          <a
            class="tree-btn-edit vui-ml5 doc-link vui-f12"
            title="添加"
            v-if="!prop.node.disabled"
            @click.stop="form.present(currentContext, '添加菜单', prop.node)"
          >
            <q-icon name="add" style="font-size: 14px;"></q-icon>
            添加
          </a>
          <a
            class="tree-btn-edit vui-ml5 doc-link vui-f12"
            title="编辑"
            v-if="!prop.node.disabled && !prop.node.readonly"
            @click.stop="form.present(currentContext, '编辑菜单', null, prop.node)"
          >
            <q-icon name="edit" style="font-size: 14px;"></q-icon>
            编辑
          </a>
          <a
            class="tree-btn-up vui-ml5 doc-link vui-f12"
            title="上移"
            v-if="!prop.node.disabled && !prop.node.readonly"
            @click.stop="strutree.moveForward(tree.nodes, prop.node.id)"
          >
            <q-icon name="keyboard_arrow_up" style="font-size: 14px;"></q-icon>
            上移
          </a>
          <a
            class="tree-btn-up vui-ml5 doc-link vui-f12"
            title="下移"
            v-if="!prop.node.disabled && !prop.node.readonly"
            @click.stop="strutree.moveBack(tree.nodes, prop.node.id)"
          >
            <q-icon name="keyboard_arrow_down" style="font-size: 14px;"></q-icon>
            下移
          </a>
          <a
            class="tree-btn-edit vui-ml5 doc-link vui-f12"
            title="删除"
            v-if="!prop.node.disabled && !prop.node.readonly"
            @click.stop="form.remove(prop.node)"
          >
            <q-icon name="close" style="font-size: 14px;"></q-icon>
            删除
          </a>
        </div>
      </template>
      <template v-slot:default-body="prop">
        <div class="tree-body" v-if="prop.node.url"><span>路径：</span>{{ prop.node.url }}</div>
      </template>
    </q-tree>
    <q-dialog v-model="form.visible">
      <q-card style="width: 320px;">
        <q-card-section>
          <div class="text-subtitle2">{{ form.title }}</div>
        </q-card-section>
        <q-card-section>
          <form-render
            :fields="form.fields"
            :handler.sync="form.handler"
            @submit="form.onSubmit(currentContext, $event)"
          ></form-render>
          <div class="q-field-item">
            <div class="q-field-label"></div>
            <div class="q-field-content">
              <q-btn label="确认" color="primary" @click.stop="form.submit" />
              <q-btn flat label="取消" color="primary" v-close-popup />
            </div>
          </div>
        </q-card-section>
        <q-separator dark />
      </q-card>
    </q-dialog>
    <q-dialog v-model="form.removeDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">确认删除该节点？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确认" color="primary" v-close-popup @click.stop="form.onRemove(currentContext)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--<div class="col-12 col-sm-6 q-gutter-sm">

      <q-separator spaced/>

      <div class="text-h6">已勾选</div>
      <div>
        <div v-for="tick in ticked" :key="`ticked-${tick}`">
          {{ tick }}
        </div>
      </div>

      <q-separator spaced/>

      <div class="text-h6">已展开</div>
      <div>
        <div v-for="expand in expanded" :key="`expanded-${expand}`">
          {{ expand }}
        </div>
      </div>
    </div>-->
  </Layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Strutree } from '../../../../lib/strutree';
import { FormRender } from '../../../../lib/form-renderer/vue';
import { IFormRenderer } from '../../../../lib/form-renderer';
import { EleTable } from '../../../../lib/element-ui-helper/components/table';
import {
  FieldNumber,
  FieldRadio,
  FieldRuleRequired,
  FieldSelect,
  FieldText,
  IField
} from '../../../../lib/form-renderer/field';

import { IMenu } from '../../../interfaces/memu';
import Layout from '../../../layout/Layout.vue';
import { CommonService } from '../../../services/common.service';

@Component({
  name: 'MenusPage',
  components: {
    Layout,
    EleTable,
    FormRender
  }
})
export default class extends Vue {
  strutree: Strutree<IMenu>;

  get currentContext() {
    return this;
  }

  get unbindPages() {
    if (this.tree.nodes) {
      const unbindPages = CommonService.getVueRegistedRouters(this.$router);
      this.strutree.every(this.tree.nodes, (node) => {
        const idx = unbindPages.findIndex((x) => x.url === node.url);
        if (idx > -1) {
          unbindPages.splice(idx, 1);
        }
        return true;
      });
      return unbindPages;
    }
    return [];
  }

  tree: {
    nodes: IMenu[];
    selected: any[];
    ticked: any[];
    expanded: any[];
  } = {
    nodes: [],
    selected: null,
    ticked: [],
    expanded: []
  };

  form: {
    title: string;
    visible: boolean;
    uploading: boolean;
    fields: IField[];
    handler: IFormRenderer;
    parentNode: IMenu;
    nodeIndex: number;
    currentNode: IMenu;
    present: (currentContext: Vue, title, parentNode: IMenu, currentNode: IMenu) => void;
    onSubmit: Function;
    submit: Function;
    remove: Function;
    onRemove: Function;
    removeDialog: boolean;
  } = {
    title: '',
    visible: false,
    uploading: true,
    fields: [],
    handler: null,
    parentNode: null,
    nodeIndex: 0,
    currentNode: null,
    removeDialog: false,
    present(currentContext: any, title, parentNode: IMenu, currentNode: IMenu) {
      if (!currentNode) {
        currentNode = {} as any;
      }
      this.title = title;
      if (parentNode) {
        this.parentNode = parentNode;
        this.nodeIndex = parentNode.children.length;
      } else {
        const res = currentContext.strutree.find(currentContext.tree.nodes, (x) => x.id === currentNode.id);
        if (res) {
          this.parentNode = res.parentNodes[res.parentNodes.length - 1];
          this.nodeIndex = res.index;
        }
      }
      this.currentNode = currentNode;
      this.fields = [
        new FieldRadio({
          name: 'type',
          label: '类型',
          // 判断是否包含 url 属性，且值不为空
          value: currentNode.url ? '2' : '1',
          options: [
            {
              value: '1',
              label: '层级菜单'
            },
            {
              value: '2',
              label: '链接菜单'
            }
          ],
          rules: [new FieldRuleRequired()],
          watcher: {
            handler(newVal, oldVal, controls) {
              if (newVal) {
                console.log(this);
                controls.url.visible = newVal === '2';
                controls.url.submitable = newVal === '2';
                controls.target.visible = newVal === '2';
                controls.target.submitable = newVal === '2';
                controls.page.visible = newVal === '2';
                controls.page.submitable = newVal === '2';
              }
            },
            immediate: true
          }
        }),
        new FieldSelect({
          name: 'page',
          label: '页面',
          displayValue: 'id',
          displayText: 'label',
          placeholder: '选择未绑定的页面',
          options: currentContext.unbindPages,
          visible: false,
          rules: [],
          watcher(newVal, oldVal, controls) {
            if (newVal) {
              const option = this.options.find((x) => x.id === newVal);
              if (option) {
                controls.label.value = option.label;
                controls.url.value = option.url;
              }
            } else {
              controls.url.value = '';
            }
          },
          filter: async (keyword, options) => {
            // await timer(500).toPromise();
            // 获取当前已注册组件
            options = options.filter((x) => {
              return x.label.indexOf(keyword) > -1;
            });
            return Promise.resolve(options);
          }
        }),
        new FieldText({
          name: 'label',
          label: '标题',
          value: currentNode.label,
          rules: [new FieldRuleRequired()]
        }),
        new FieldText({
          name: 'url',
          label: '路径',
          visible: false,
          value: currentNode.url,
          rules: [new FieldRuleRequired()]
        }),
        new FieldSelect({
          name: 'target',
          label: '打开方式',
          displayValue: 'id',
          displayText: 'label',
          value: currentNode.target || '_self',
          options: [
            {
              id: '_self',
              label: '当前窗口'
            },
            {
              id: '_blank',
              label: '新窗口'
            }
          ],
          visible: false,
          rules: [new FieldRuleRequired()]
        }),
        new FieldNumber({
          name: 'order',
          label: '序号',
          value: this.nodeIndex + 1,
          min: 1,
          max: this.parentNode.children.length + 1,
          suffix: `/${this.parentNode.children.length + 1}`,
          rules: [new FieldRuleRequired()]
        })
      ];
      this.visible = true;
    },
    onSubmit(currentContext: any, formData) {
      if (this.currentNode && this.currentNode.id) {
        // 编辑
        this.currentNode.label = formData.label;
        this.currentNode.url = formData.url;
        this.currentNode.target = formData.target;
        if (this.nodeIndex !== formData.order) {
          this.parentNode.children.splice(this.nodeIndex, 1);
          this.parentNode.children.splice(formData.order - 1, 0, this.currentNode);
        }
        this.visible = false;
      } else {
        // 新增
        const newNode = currentContext.strutree.addNode({
          label: formData.label,
          url: formData.url,
          target: formData.target
        });
        this.parentNode.children.splice(formData.order - 1, 0, newNode);
        this.visible = false;
        currentContext.$nextTick(() => {
          (currentContext.$refs.tree as any).setExpanded(this.parentNode.id, true);
        });
      }
    },
    submit() {
      if (this.handler) {
        this.handler.submit();
      }
    },
    remove(currentNode: IMenu) {
      this.currentNode = currentNode;
      this.removeDialog = true;
    },
    onRemove(currentContext: any) {
      const res = currentContext.strutree.find(currentContext.tree.nodes, (x) => x.id === this.currentNode.id);
      if (res) {
        res.parentNodes[res.parentNodes.length - 1].children.splice(res.index, 1);
      }
    }
  };

  // 导入json文件
  importJsonFile() {
    CommonService.importStreamFile('.json').then((data: any) => {
      /* const d = [];
        const strutree = new Strutree({
          labelKey: 'title'
        });
        strutree.map(data.result, (node) => {
          node = {
            id: node.id,
            label: node.title,
            children: node.children
          };
          return node;
        });
        console.log(data.result); */
      this.tree.nodes[0].children = this.strutree.parseNode(data);
      this.expandRoot();
    });
  }

  // 导出json文件
  exportJsonFile() {
    CommonService.exportStreamFile('system-menus.json', JSON.stringify(this.tree.nodes[0].children, null, 2));
  }

  expandRoot() {
    this.$nextTick(() => {
      (this.$refs.tree as any).lazy = {};
      // (this.$refs.tree as any).expandRoot();
      (this.$refs.tree as any).setExpanded('_', true);
    });
  }

  created() {
    this.strutree = new Strutree<IMenu>({
      applyFunc(items, index, item) {
        Vue.set(items, index, item);
      }
    });

    this.tree.nodes = [
      {
        id: '_',
        label: '根目录',
        readonly: true,
        url: null,
        icon: 'dashboard',
        children: require('../../../../assets/json/system-menus.json')
      }
    ];
    /* this.tree.nodes = this.strutree.parseNode([
      {
        id: '_',
        label: '根目录',
        readonly: true,
        url: null,
        icon: 'dashboard',
        children: require('../../../../config/system-menus.json')
      }
    ]); */

    // 分析节点

    this.expandRoot();
  }

  mounted() {
    console.log('mounted');
  }
}
</script>

<style lang="scss">
.tree-nodes {
  font-size: 14px;

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
}
</style>
