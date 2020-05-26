/**
 * type
 */

import { Action, Getter, Module, Mutation } from 'vuex';

export interface IVuexStore<
  TState,
  TActionKeys extends readonly string[],
  TGetterKeys extends readonly string[],
  TMutationKeys extends readonly string[],
  TRootState = any
> extends Module<TState, TRootState> {
  actions: IVuexActions<TState, TActionKeys>;
  getters: IVuexGetters<TState, TGetterKeys>;
  mutations: IVuexMutations<TState, TMutationKeys>;
}

export type IVuexKeys<
  TActionKeys extends readonly string[],
  TGetterKeys extends readonly string[],
  TMutationKeys extends readonly string[]
> = {
  actions: { [key in TActionKeys[number]]: string };
  getters: { [key in TGetterKeys[number]]: string };
  mutations: { [key in TMutationKeys[number]]: string };
};

// 定义 actions 类型
export type IVuexActions<TState = any, TKeys extends readonly string[] = any, TRootState = any> = {
  [key in TKeys[number]]: Action<TState, TRootState>;
};

// 定义 getters 类型
export type IVuexGetters<TState = any, TKeys extends readonly string[] = any, TRootState = any> = {
  [key in TKeys[number]]: Getter<TState, TRootState>;
};

// 定义 mutations 类型
export type IVuexMutations<TState = any, TKeys extends readonly string[] = any> = {
  [key in TKeys[number]]: Mutation<TState>;
};

/**
 * 预加载数据接口
 */
export interface IPrefetch<TState> {
  (state: TState): void;
}
