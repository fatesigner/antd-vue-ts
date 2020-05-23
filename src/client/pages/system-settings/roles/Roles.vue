<template>
  <Layout class="view-padding roles">
    <ele-table
      :data="result.data"
      :actions="actions"
      :columns="columns"
      :indexed="true"
      :loading="result.loading"
      :total="result.totalCount"
      :page-no.sync="query.pageNo"
      :page-size="query.pageSize"
      @request="onRequest"
    >
      <template v-slot:checkStatus="props">
        <div :class="{ completed: props.row.checkStatus === models.checkedStatusEnum.completed }">
          {{ models.checkedStatusDesc[props.row.checkStatus] }}
        </div>
        <div v-if="props.row.updateBy">
          <div v-if="props.row.checkStatus === models.checkedStatusEnum.completed">
            审核人；{{ props.row.updateBy }}
          </div>
          <div v-if="props.row.checkStatus === models.checkedStatusEnum.canceled">取消人；{{ props.row.updateBy }}</div>
        </div>
        <div v-if="props.row.updateTime">{{ props.row.updateTime | dateFormat }}</div>
      </template>
    </ele-table>
  </Layout>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ApiService } from '../../../api/api';
import { EleTable } from '../../../lib/element-ui-helper/components/table';
import { IColumn, IRequestData } from '../../../lib/element-ui-helper/components/table/table';
import { FieldRuleRequired, FieldText } from '../../../lib/form-renderer/field';
import Layout from '../../../layouts/Layout.vue';

// 定义该表格的所有字段
const columnsKey = ['agentName', 'name', 'describe', 'createTime'] as const;

@Component({
  name: 'RolesPage',
  components: {
    Layout,
    EleTable
  }
})
export default class extends Vue {
  query = {
    keyword: null,
    pageNo: 1,
    pageSize: 20
  };

  result = {
    loading: false,
    totalCount: 0,
    data: []
  };

  actions = [
    {
      type: 'add',
      title: '新增'
    }
  ];

  columns: IColumn<typeof columnsKey>[] = [
    { label: '序号', name: '__index' },
    {
      label: '角色名称',
      name: 'agentName',
      field: new FieldText({
        name: 'agentName',
        rules: [new FieldRuleRequired()]
      })
    },
    {
      label: '角色编码',
      name: 'name',
      field: new FieldText({
        name: 'name',
        rules: [new FieldRuleRequired()]
      })
    },
    {
      label: '描述',
      name: 'describe',
      field: new FieldText({
        name: 'describe',
        rules: [new FieldRuleRequired()]
      })
    },
    { label: '创建时间', name: 'createTime' }
  ];

  created() {
    this.loadData();
  }

  add() {}

  onRequest(req: IRequestData<typeof columnsKey>) {
    console.log(req.data);
    if (req.type === 'GET') {
      this.loadData();
    } else if (req.type === 'POST') {
      this.result.data.push(req.data);
    }
  }

  loadData() {
    const params: any = {};
    this.result.loading = true;
    return ApiService.agentAccountFlowPage({
      pageNo: this.query.pageNo,
      pageSize: this.query.pageSize,
      keyword: this.query.keyword,
      ...params
    })
      .then((res: any) => {
        if (res && res.data.data.rows) {
          this.result.data = [];
          this.result.totalCount = 0;
        } else {
          this.result.data = [];
          this.result.totalCount = 0;
        }
      })
      .finally(() => {
        this.result.loading = false;
      });
  }
}
</script>

<style lang="scss">
</style>
