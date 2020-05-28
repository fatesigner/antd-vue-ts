/**
 * interfaces
 */

import { IField } from '../../../form-renderer/field';
import { UnionType, UnRequired } from '../../../ts-helper';

export interface IAction {
  name: string;
  title: string;
}

export interface ITableOperationData<
  TQuery extends {
    [key in string]: any;
  } = any,
  TResult extends {
    loading: boolean;
    totalCount?: number;
    data: any[];
  } = any
> {
  columns: IColumn[];
  query?: TQuery;
  result: TResult;
  loadData?: () => Promise<any[]>;
  onRequest?: (request: IRequestData) => void;
}

export interface IColumn<T = any, T2 = any, T3 = any> {
  label: string;
  name: '__index' | UnionType<T>;
  template?: (row: { [key in string]: any }, index: number) => string | number;
  field?: UnRequired<IField<T, T2, T3>, 'name'>;
  fixed?: boolean | 'left' | 'right';
  width?: string | number;
}

export interface IRequestData<T extends readonly string[] = string[]> {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params: {
    pageNo: number;
    pageSize: number;
  };
  data?: {
    [key in T[number]]: any;
  };
}

export interface IPagination {
  sortBy: 'desc';
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}
