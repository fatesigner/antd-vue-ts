/**
 * interfaces
 */

export interface IAsyncComponentOptions {
  component: any;
  keepAlive?: boolean;
  delay?: number;
  timeout?: number;
  loadingComp?: any;
  errorComp?: any;
}

export type IAsLazyHandler = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

export type IAsLazyCompProps = Record<string, any>;

export type IAsLazyCompListenners<TContext> = Record<string, (this: TContext, ...args) => any>;

export type IAsLazyProps<
  TContext,
  TCompProps extends IAsLazyCompProps,
  TCompListenners extends IAsLazyCompListenners<TContext>
> = {
  popover?: boolean;
  title?: string;
  transitional?: boolean;
  visible?: boolean;
  comp: () => Promise<any>;
  props?: TCompProps;
  listeners?: TCompListenners;
};

export type IAsLazyListeners<TContext> = {
  visibleChanged?: (this: TContext, visible: boolean) => void;
  presented?: (this: TContext) => void;
  dissmissed?: (this: TContext) => void;
};
