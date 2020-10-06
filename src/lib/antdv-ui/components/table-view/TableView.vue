<template>
  <table :class="['table-view', bordered && 'bordered', 'vertical-align-' + verticalAlign, 'text-align-' + textAlign]">
    <thead>
      <tr>
        <th v-for="col in columns_" :style="{ width: col.width + 'px' }" v-if="col.visible !== false">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(record, index) in data__" v-show="!record.__expandFor || (record.__expandFor && record.__expandShow)">
        <template v-if="record.__expandFor">
          <template v-if="record && $scopedSlots.hasOwnProperty('expandedRowRender')">
            <td colspan="100%">
              <slot name="expandedRowRender" v-bind="{ record: record, index: getRowIndex(index) }" />
            </td>
          </template>
        </template>
        <template v-else v-for="col in columns_">
          <td
            v-if="getColVisible(col, record, index)"
            :rowspan="getRowspan(col, record, index)"
            :style="{ width: col.width + 'px' }"
          >
            <template v-if="record && $scopedSlots.hasOwnProperty(col.name)">
              <slot :name="col.name" v-bind="{ record: record, index: getRowIndex(index) }" />
            </template>
            <div v-else v-html="col.template ? col.template(record, index) : record[col.name]" />
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { cloneDeep, merge } from 'lodash';
import { IsNullOrUndefined } from '@fatesigner/utils/type-check';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { ITableViewColumn } from './interfaces';

@Component({
  name: 'TableView'
})
export default class extends Vue {
  @Prop({ default: () => [] }) columns: ITableViewColumn[];
  @Prop({ default: () => [] }) data: any[];
  @Prop({ default: () => [] }) parents: any[];
  @Prop({ default: false }) bordered: boolean;
  @Prop({ default: 'top' }) verticalAlign: 'top' | 'middle' | 'bottom';
  @Prop({ default: 'left' }) textAlign: 'left' | 'center' | 'right';
  @Prop({ default: false }) rowVerticalAlignTop: boolean;

  columns_: ITableViewColumn[] = [];

  data_: any[] = [];

  data__: any[] = [];

  changeable = true;

  // 标记分组信息，二维数组 [rowIndexStart, rowIndexEnd, rowspan]
  groups: Record<string, [[number, number, number]]> = {};

  @Watch('columns', {
    immediate: true,
    deep: true
  })
  onColumnsChanged(val) {
    this.columns_ = val.map((x) =>
      merge(
        {
          visible: true,
          grouped: false,
          priority: 0,
          standalone: false
        },
        x
      )
    );
  }

  @Watch('columns_', {
    deep: true
  })
  onColumnsChanged_() {
    this.parseData(this.data, true);
  }

  @Watch('data', {
    immediate: true,
    deep: true
  })
  onDataChanged(val) {
    if (this.changeable) {
      this.parseData(val, true);
    } else {
      this.changeable = true;
    }
  }

  @Watch('data_', {
    immediate: true,
    deep: true
  })
  onDataChanged_(val) {
    if (this.data !== val) {
      this.$emit('update:data', val);
    }
  }

  // 解析数据
  parseData(data, sort?: boolean) {
    this.changeable = false;

    // 确认分组优先级，筛选出待分组的字段
    const groupArr = this.columns_
      .filter((x) => x.visible && x.grouped && !x.standalone)
      .sort((a, b) => {
        const a_ = isFinite(a.priority) ? a.priority : 0;
        const b_ = isFinite(b.priority) ? b.priority : 0;
        if (a_ > b_) {
          return -1;
        } else if (a_ < b_) {
          return 1;
        }
        return 0;
      })
      .map((x) => x.name);
    const standaloneArr = this.columns_.filter((x) => x.standalone).map((x) => x.name);

    // add __expanded
    // let dataTemp = data.map((x) => ({ ...x, __expanded: x?.__expanded ?? false }));

    // 排序
    if (sort) {
      this.data_.splice(
        0,
        this.data_.length,
        ...data.sort((a, b) => {
          let result = 0;
          for (const name of groupArr) {
            const c = isFinite(a[name]);
            const d = isFinite(b[name]);
            // 只比较的两个值为同一类型的情况，即均为数字或字符串
            if (c == d) {
              if (a[name] > b[name]) {
                result = 1;
                break;
              } else if (a[name] < b[name]) {
                result = -1;
                break;
              }
            }
          }
          return result;
        })
      );
    }

    const dataTemp = [];

    // 找出 expandedKeys
    this.data_.forEach((item) => {
      let __expanded;
      const itemIndex = this.data__.findIndex((x) => x.id === item.id);
      const expandIndex = this.data__.findIndex((x) => x.__expandFor === item.id);
      if (itemIndex > -1) {
        __expanded = IsNullOrUndefined(item.__expanded) ? this.data__[itemIndex].__expanded : item.__expanded;
      } else {
        __expanded = !!item.__expanded;
      }
      item.__expanded = __expanded;
      dataTemp.push(item);
      if (expandIndex > -1) {
        dataTemp.push({
          ...this.data__[expandIndex],
          __expandShow: __expanded
        });
      } else if (item.__expanded) {
        const itemNew = cloneDeep(item);
        delete itemNew.__expanded;
        dataTemp.push({
          ...itemNew,
          id: itemNew.id + '__expand',
          __expandFor: itemNew.id,
          __expandShow: true
        });
      }
    });

    this.data__.splice(0, this.data__.length, ...dataTemp);

    const groups = this.data__.reduce(
      (prev, cur, index) => {
        groupArr.forEach((name, groupIndex) => {
          if (cur.__expandFor && !cur.__expandShow) {
            prev[name].temp.hiddenNum++;
          }

          if (
            index === 0 ||
            (cur.__expandShow && Object.prototype.hasOwnProperty.call(cur, '__expandFor')) ||
            (this.data__[index - 1].__expandShow &&
              Object.prototype.hasOwnProperty.call(this.data__[index - 1], '__expandFor')) ||
            cur[name] !== prev[name].temp.value ||
            // 判断上一层分组是否截断
            (() => {
              if (groupIndex > 0) {
                const n_ = groupArr[groupIndex - 1];
                if (prev[n_].temp.index === index) {
                  return true;
                }
              }
              return false;
            })()
          ) {
            if (index - prev[name].temp.index > 1) {
              prev[name].pos.push([
                prev[name].temp.index,
                index - 1,
                index - prev[name].temp.index - prev[name].temp.hiddenNum
              ]);
              prev[name].temp.hiddenNum = 0;
            }
            prev[name].temp.index = index;
            prev[name].temp.value = cur[name];
          }

          if (index === this.data__.length - 1) {
            if (index - prev[name].temp.index > 0) {
              prev[name].pos.push([
                prev[name].temp.index,
                index,
                index + 1 - prev[name].temp.index - prev[name].temp.hiddenNum
              ]);
            }
          }
        });
        standaloneArr.forEach((name) => {
          if (cur.__expandFor && !cur.__expandShow) {
            prev[name].temp.hiddenNum++;
          }

          if (
            index === 0 ||
            (cur.__expandShow && Object.prototype.hasOwnProperty.call(cur, '__expandFor')) ||
            (this.data__[index - 1].__expandShow &&
              Object.prototype.hasOwnProperty.call(this.data__[index - 1], '__expandFor'))
          ) {
            if (index - prev[name].temp.index > 1) {
              prev[name].pos.push([
                prev[name].temp.index,
                index - 1,
                index - prev[name].temp.index - prev[name].temp.hiddenNum
              ]);
              prev[name].temp.hiddenNum = 0;
            }
            prev[name].temp.index = index;
            prev[name].temp.value = cur[name];
          }

          if (index === this.data__.length - 1) {
            if (index - prev[name].temp.index > 0) {
              prev[name].pos.push([
                prev[name].temp.index,
                index,
                index + 1 - prev[name].temp.index - prev[name].temp.hiddenNum
              ]);
            }
          }
        });
        return prev;
      },
      [...groupArr, ...standaloneArr].reduce((prev, name) => {
        prev[name] = {
          temp: {
            hiddenNum: 0,
            index: -1,
            value: null
          },
          pos: []
        };
        return prev;
      }, {})
    );

    Object.keys(groups).forEach((name) => {
      Vue.set(this.groups, name, groups[name].pos);
    });
  }

  getColVisible(col, record, index) {
    let bool = false;

    if (col.visible) {
      bool = true;
      if (Object.prototype.hasOwnProperty.call(this.groups, col.name)) {
        // 查找是否在范围内
        for (const range of this.groups[col.name]) {
          if (range[0] === index) {
            break;
          } else if (index > range[0] && index <= range[1]) {
            bool = false;
            break;
          }
        }
      }
    }

    return bool;
    /* const s =
      (index === 0 ||
        (this.data__[index - 1].__expandFor && this.data__[index - 1].__expandShow) ||
        // eslint-disable-next-line no-prototype-builtins
        !this.groups.hasOwnProperty(col.name) ||
        // eslint-disable-next-line no-prototype-builtins
        (this.groups.hasOwnProperty(col.name) && this.groups[col.name].hasOwnProperty(index)) ||
        (!col.standalone && record[col.name] !== this.data__[index - 1][col.name])) &&
      col.visible !== false;

    if (col.name === 'deviceType' && index === 2) {
      //  console.log(`\n col：${col.name} record：${record.productName} index：${index} ${s}`);
    }

    return s; */
  }

  getRowspan(col, record, index) {
    if (Object.prototype.hasOwnProperty.call(this.groups, col.name)) {
      // 查找是否在范围内
      const _ = this.groups[col.name].find((x) => x[0] === index);
      if (_) {
        return _[2];
      }
    }
    return 1;
  }

  getRowIndex(index: number) {
    let num = 0;
    for (let i = 0; i <= index; i++) {
      if (this.data__[i].__expandFor) {
        num++;
      }
    }
    return index - num;
  }
}
</script>

<style lang="scss" scoped>
.table-view {
  border-collapse: collapse;

  &.table-row-vertical-align-top {
    > tbody > tr > td {
      vertical-align: top;
    }
  }

  &.bordered {
    > thead > tr > th,
    > tbody > tr > td {
      border: 1px solid #e8e8e8;
    }

    > thead > tr > th {
      background-color: #f5f5f5;
    }
  }

  &.vertical-align-top {
    > tbody > tr > td {
      vertical-align: top;
    }
  }

  &.vertical-align-middle {
    > tbody > tr > td {
      vertical-align: middle;
    }
  }

  &.vertical-align-bottom {
    > tbody > tr > td {
      vertical-align: bottom;
    }
  }

  &.text-align-left {
    > thead > tr > th,
    > tbody > tr > td {
      text-align: left;
    }
  }

  &.text-align-center {
    > thead > tr > th,
    > tbody > tr > td {
      text-align: center;
    }
  }

  &.text-align-right {
    > thead > tr > td,
    > tbody > tr > td {
      text-align: right;
    }
  }
}
</style>
