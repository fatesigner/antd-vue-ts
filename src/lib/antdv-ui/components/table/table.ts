/**
 * table
 */

import { BindLazyFunc } from '@fatesigner/utils';
import { IDatasourceModel } from '@fatesigner/typed/datasource';
import { IVueCompContext, IVueCompGetContext, IVueCompInstance, IVueCompOptions } from '@fatesigner/vue-lib/component';

import { IAsTableHandler, IAsTableListeners, IAsTableProps } from './interfaces';

export function CreateAsTable<TModel extends IDatasourceModel, TGetContext extends IVueCompGetContext<IVueCompContext>>(
  options: IVueCompOptions<
    TGetContext,
    IAsTableProps<TModel, ReturnType<TGetContext>>,
    IAsTableListeners<TModel, ReturnType<TGetContext>>
  >
): IVueCompInstance<
  IAsTableHandler,
  TGetContext,
  IAsTableProps<TModel, ReturnType<TGetContext>>,
  IAsTableListeners<TModel, ReturnType<TGetContext>>
> {
  const handler: IAsTableHandler = {
    refresh: null,
    reload: null,
    validate: null,
    validateRow: null,
    addItem: null,
    selectAll: null,
    selectInvert: null
  };

  (options as any).handler = BindLazyFunc(handler, Object.keys(handler));

  return options as any;
}
