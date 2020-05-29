/**
 * interfaces
 */

import { IField } from '../../../form-renderer/field';
import { UnionType, UnRequired } from '../../../ts-helper';

export interface IEleTableAction {
  name: string;
  title: string;
}

export interface IEleTableOperationData<
  TQuery extends {
    [key in string]: any;
  } = any,
  TResult extends {
    totalCount?: number;
    data: any[];
  } = any,
  TCurrentContext = any
> {
  columns: IEleTableColumn[];
  loading?: boolean;
  query?: TQuery;
  result: TResult;
  loadData?: (currentContext: TCurrentContext) => Promise<any>;
  onRequest?: (request: IEleTableRequestData, currentContext: TCurrentContext) => void;
  onQueryChange?: (currentContext: TCurrentContext) => void;
}

export interface IEleTableColumn<T = any, T2 = any, T3 = any> {
  label: string;
  name: '__index' | UnionType<T>;
  template?: (row: { [key in string]: any }, index: number) => string | number;
  field?: UnRequired<IField<T, T2, T3>, 'name'>;
  fixed?: boolean | 'left' | 'right';
  width?: string | number;
}

export interface IEleTableRequestData<T extends readonly string[] = string[]> {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params: {
    pageNo: number;
    pageSize: number;
  };
  data?: {
    [key in T[number]]: any;
  };
}

export interface IEleTablePagination {
  sortBy: 'desc';
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}
