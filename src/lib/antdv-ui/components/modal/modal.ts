/**
 * drawer
 */

import { BindLazyFunc } from '@fatesigner/utils';
import { IVueCompContext, IVueCompGetContext, IVueCompInstance, IVueCompOptions } from '@fatesigner/vue-lib/component';

import { IAsModalHandler, IAsModalListeners, IAsModalProps } from './interfaces';

export function CreateAsModal<TGetContext extends IVueCompGetContext<IVueCompContext>>(
  options: IVueCompOptions<TGetContext, IAsModalProps, IAsModalListeners<ReturnType<TGetContext>>>
): IVueCompInstance<IAsModalHandler, TGetContext, IAsModalProps, IAsModalListeners<ReturnType<TGetContext>>> {
  const handler: IAsModalHandler = {
    present: null,
    dismiss: null,
    toggle: null
  };

  (options as any).handler = BindLazyFunc(handler, Object.keys(handler));

  return options as any;
}
