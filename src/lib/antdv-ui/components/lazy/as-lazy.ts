/**
 * as-lazy
 */

import { BindLazyFunc } from '@fatesigner/utils';
import { IVueCompContext, IVueCompGetContext, IVueCompInstance, IVueCompOptions } from '@fatesigner/vue-lib/component';

import {
  IAsLazyCompListenners,
  IAsLazyCompProps,
  IAsLazyHandler,
  IAsLazyListeners,
  IAsLazyProps,
  IAsyncComponentOptions
} from './interfaces';

import AsLazyError from './AsLazyError.vue';
import AsLazyLoading from './AsLazyLoading.vue';

export function CreateAsLazy<
  TGetContext extends IVueCompGetContext<IVueCompContext>,
  TCompProps extends IAsLazyCompProps,
  TCompListenners extends IAsLazyCompListenners<ReturnType<TGetContext>>
>(
  options: IVueCompOptions<
    TGetContext,
    IAsLazyProps<ReturnType<TGetContext>, TCompProps, TCompListenners>,
    IAsLazyListeners<ReturnType<TGetContext>>
  >
): IVueCompInstance<
  IAsLazyHandler,
  TGetContext,
  IAsLazyProps<ReturnType<TGetContext>, TCompProps, TCompListenners>,
  IAsLazyListeners<ReturnType<TGetContext>>
> {
  const handler: IAsLazyHandler = {
    present: null,
    dismiss: null
  };

  (options as any).handler = BindLazyFunc(handler, Object.keys(handler));

  return options as any;
}

const defaultOptions: IAsyncComponentOptions = {
  component: null,
  keepAlive: true,
  delay: 300,
  timeout: 120000,
  errorComp: AsLazyError,
  loadingComp: AsLazyLoading
};

/**
 * 延迟加载组件
 * @param options
 * @constructor
 */
export function LazyLoadComp(options: IAsyncComponentOptions) {
  options = Object.assign(defaultOptions, options);
  const AsyncHandler = () => ({
    // 需要加载的组件。应当是一个 Promise
    component: options.component,
    // 加载中应当渲染的组件
    loading: options.loadingComp,
    // 出错时渲染的组件
    error: options.errorComp,
    // 渲染加载中组件前的等待时间。默认：200ms。
    delay: options.delay,
    // 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
    timeout: options.timeout
  });

  return Promise.resolve({
    functional: true,
    render(h: any, { data, children }: any) {
      // Transparently pass any props or children
      // to the view component.
      return h(AsyncHandler, data, children);
    }
  });
}

/**
 * 延迟加载视图
 * @param comp
 * @constructor
 */
export function LazyLoadPage(comp: any) {
  return LazyLoadComp({
    component: comp,
    delay: 200
  });
}
