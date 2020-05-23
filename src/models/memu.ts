/**
 * memu 菜单接口
 */

export interface IMenuLink {
  id: string;
  label: string;
  name?: string;
  url?: string;
  icon?: string;
  target?: '_blank' | '_system';
  comp?: boolean;
}

export interface IMenu extends IMenuLink {
  children?: IMenu[] | IMenuLink[];
  disabled?: boolean;
  readonly?: boolean;
}
