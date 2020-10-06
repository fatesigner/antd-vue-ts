/**
 * index
 */

export enum RootRouterLayoutName {
  Exception = 'Exception',
  Empty = 'Empty',
  Sidebar = 'Sidebar',
  Main = 'Main'
}

export function GetLayout(name: RootRouterLayoutName) {
  return () => import(`./Layout${name}`);
}
