/**
 * async-section
 */

import { BindLazyFunc } from '@fatesigner/utils';
import { IVueCompContext, IVueCompGetContext, IVueCompInstance, IVueCompOptions } from '@fatesigner/vue-lib/component';

import { IAsAsyncSectionHandler, IAsAsyncSectionListeners, IAsAsyncSectionProps } from './interfaces';

export function CreateAsAsyncSection<TData, TGetContext extends IVueCompGetContext<IVueCompContext>>(
  options: IVueCompOptions<
    TGetContext,
    IAsAsyncSectionProps<TData, ReturnType<TGetContext>>,
    IAsAsyncSectionListeners<TData, ReturnType<TGetContext>>
  >
): IVueCompInstance<
  IAsAsyncSectionHandler<TData>,
  TGetContext,
  IAsAsyncSectionProps<TData, ReturnType<TGetContext>>,
  IAsAsyncSectionListeners<TData, ReturnType<TGetContext>>
> {
  const handler: IAsAsyncSectionHandler<TData> = {
    refresh: null
  };

  (options as any).handler = BindLazyFunc(handler, Object.keys(handler));

  return options as any;
}
