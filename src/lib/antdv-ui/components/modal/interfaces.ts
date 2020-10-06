/**
 * interfaces
 */

export type IAsModalHandler = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
  toggle: (val: boolean) => Promise<void>;
};

export type IAsModalProps = {
  title?: string;
  visible?: boolean;
  closeable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  width?: string | number;
  height?: string | number;
  footer?: boolean;
  zIndex?: number;
  padding?: boolean;
};

export type IAsModalListeners<TContext> = {
  visibleChanged?: (this: TContext, visible: boolean) => void;
  presented?: (this: TContext) => void;
  dissmissed?: (this: TContext) => void;
};
