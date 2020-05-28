/**
 * interfaces
 */

export interface IRadioButtons {
  label: string;
  name: string;
  value: string;
  options: IRadioButtonOption[];
}

export interface IRadioButtonOption {
  label: string;
  value: string;
  count: number;
}
