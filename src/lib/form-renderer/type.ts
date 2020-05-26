/**
 * form-render.type
 */

import { IField } from './field';
import { UnionType } from '../ts-helper';

export type IFormCompileAction<TFieldKeys> = (
  controls: IFormRenderControls<TFieldKeys>,
  template: string
) => Promise<{
  controls: IFormRenderControls<TFieldKeys>;
  submit: () => void;
}>;

export interface IFormRenderer<TFieldKeys = any, TFieldTypes = any, TFieldRules = any> {
  readonly controls: IFormRenderControls<TFieldKeys>;
  render: (compileAction: IFormCompileAction<TFieldKeys>) => Promise<void>;
  submit: () => void;
  validate: () => boolean;
  getData: () => { [key in UnionType<TFieldKeys>]: any };
  reset: (fieldName?: string) => void;
  clear: () => void;
}

export interface IFormValidateHandler<T = any> {
  controls: { [K in keyof T]: T[K] };
  getData: () => {
    [key: string]: any;
  };
  validate: () => boolean;
  clear: () => void;
  reset: () => void;
  submit: () => void;
}

export interface IFormValidateItemHandler {
  getData: () => any;
  validate: () => boolean;
  clear: () => void;
}

export type IGenerateContainer = (template: string) => string;

export type IFormRenderControls<TFieldKeys = any> = { [key in UnionType<TFieldKeys>]: any };

export interface IGenerateFieldResponse {
  control: { [key: string]: any };
  template: string;
}

export type IGenerateField<TFieldKeys = any, TFieldTypes = any, TFieldRules = any> = (
  control: IField<TFieldKeys, TFieldTypes, TFieldRules>
) => Promise<IGenerateFieldResponse>;

export interface IFormRendererProvider<TFieldKeys = any, TFieldTypes = any, TFieldRules = any> {
  containerRender: IGenerateContainer;
  fieldRender: IGenerateField<TFieldKeys, TFieldTypes, TFieldRules>;
}
