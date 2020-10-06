/**
 * interfaces
 */

export interface ITableViewColumn {
  label: string;
  name: string;
  grouped?: boolean;
  priority?: number;
  standalone?: boolean;
  visible?: boolean;
  template?: (row: { [key in string]: any }, index: number) => string | number;
  width?: string | number;
}
