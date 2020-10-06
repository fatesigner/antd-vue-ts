/**
 * interfaces
 */

export type IAsDrawerDirection = 'top' | 'right' | 'bottom' | 'left';

export type IAsDrawerHandler = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
  toggle: (val: boolean) => Promise<void>;
};

export type IAsDrawerProps = {
  title?: string;
  visible?: boolean;
  closeable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  width?: string | number;
  height?: string | number;
  zIndex?: number;
  padding?: boolean;
  direction?: IAsDrawerDirection;
};

export type IAsDrawerListeners<TContext> = {
  visibleChanged?: (this: TContext, visible: boolean) => void;
  presented?: (this: TContext) => void;
  dissmissed?: (this: TContext) => void;
};
