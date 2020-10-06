/**
 * drawer
 */

import { BindLazyFunc } from '@fatesigner/utils';
import { IVueCompContext, IVueCompGetContext, IVueCompInstance, IVueCompOptions } from '@fatesigner/vue-lib/component';

import { IAsDrawerHandler, IAsDrawerListeners, IAsDrawerProps } from './interfaces';

export function CreateAsDrawer<TGetContext extends IVueCompGetContext<IVueCompContext>>(
  options: IVueCompOptions<TGetContext, IAsDrawerProps, IAsDrawerListeners<ReturnType<TGetContext>>>
): IVueCompInstance<IAsDrawerHandler, TGetContext, IAsDrawerProps, IAsDrawerListeners<ReturnType<TGetContext>>> {
  const handler: IAsDrawerHandler = {
    present: null,
    dismiss: null,
    toggle: null
  };

  (options as any).handler = BindLazyFunc(handler, Object.keys(handler));

  return options as any;
}
