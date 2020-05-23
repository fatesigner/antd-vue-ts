/**
 * type
 */

export type UnionType<T> = T extends readonly string[]
  ? T[number]
  : T extends { [key in string]: any }
  ? keyof T
  : string;

export type UnRequired<T, K extends keyof T> = Partial<T> & { [P in K]+?: T[P] };
