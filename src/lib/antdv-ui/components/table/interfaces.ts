/**
 * interfaces
 */

import { UnionType } from '@fatesigner/typed';
import { IDatasource, IDatasourceModel, IDatasourceQueryParams } from '@fatesigner/typed/datasource';

export type IAsTableGetRowKey<TModel extends IDatasourceModel = any> = (row: TModel, index: number) => string | number;

export interface IAsTableExported {
  enable: boolean;
  readonly: boolean;
}

export interface IAsTableRowSelection {
  type?: 'checkbox';
  hideDefaultSelections?: boolean;
  selections?: any[];
  selectedRowKeys?: any[];
  // onChange?: (selectedRowKeys: any[], selectedRows?: any) => void;
}

export interface IAsTableColumn<T = any, T2 = any, T3 = any> {
  label: string;
  name: '__index' | UnionType<T>;
  desc?: string;
  template?: (row: { [key in string]: any }, index: number, queryParams: IDatasourceQueryParams) => string | number;
  fixed?: boolean | 'left' | 'right';
  width?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  visible?: boolean;
}

export interface IAsTableRequestData<T extends readonly string[] = string[]> {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'EXCEL';
  params: {
    pageNo: number;
    pageSize: number;
  };
  data?: {
    [key in T[number]]: any;
  };
}

export interface IAsTablePagination {
  sortBy: 'desc';
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}

export type IAsTableHandler = {
  refresh: () => Promise<any>;
  reload: () => Promise<any>;
  validate: () => Promise<boolean>;
  validateRow: (index: number) => Promise<boolean>;
  addItem: (
    record?: any,
    options?: { replace?: boolean; index?: number; editing?: boolean; prepend?: boolean }
  ) => Promise<void>;
  selectAll: () => Promise<void>;
  selectInvert: () => Promise<void>;
};

export type IAsTableProps<TModel extends IDatasourceModel, TContext> = IDatasource<TModel, TContext> & {
  data?: TModel[];
  immediate?: boolean;
  refreshable?: boolean;
  selectable?: boolean;
  exported?: IAsTableExported;
  columns: IAsTableColumn[];
  rowKey?: IAsTableGetRowKey<TModel> | string;
  expandShow?: boolean;
  expandableKeys?: (number | string)[];
  expandedRowKeys?: any[];
  rowSelection?: IAsTableRowSelection;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  pagination?: boolean;
  scroll?: {
    x?: any;
    y?: any;
  };
  size?: 'default' | 'middle' | 'small';
  spanMethod?: (options: {
    row: any;
    column: any;
    rowIndex: number;
    columnIndex: number;
  }) => {
    rowspan: number;
    colspan: number;
  };
};

export type IAsTableListeners<TModel extends IDatasourceModel, TContext> = {
  expanded?: (this: TContext, expanded: string[], record: TModel) => void;
  expandedRowsChanged?: (this: TContext, expandedRows: string[]) => void;
  rowSelectionChanged?: (this: TContext, selectedRowKeys: string[]) => void;
  mounted?: (this: TContext) => void;
  firstLoaded?: (this: TContext) => void;
  reloaded?: (this: TContext) => void;
  dataChanged?: (this: TContext, val: any[]) => void;
  dataLengthChanged?: (this: TContext, val: number) => void;
  added?: (this: TContext) => void;
  pageNoChanged?: (this: TContext, val: number) => void;
  pageSizeChanged?: (this: TContext, val: number) => void;
  updated?: (this: TContext, record: TModel) => void;
};
