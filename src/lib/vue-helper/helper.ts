/**
 * helper
 */

import { StructureTree } from '@fatesigner/utils/structure-tree';

import { IMenu, IRouteConfig } from './interface';

/**
 * 从当前 vue router 中获取 Menu 菜单
 * @param routes
 * @param filter
 */
export function GetMenusFromRoutes(routes: any, filter?: (router: any) => boolean) {
  const strutreeRouters: StructureTree<IRouteConfig> = new StructureTree<IRouteConfig>();
  // 解析路由表
  return strutreeRouters.reduce(
    routes,
    (prev, cur, index, parentNodes) => {
      if (cur.name) {
        const menu: IMenu = {
          id: cur.name,
          name: cur.name,
          label: cur.meta.label,
          url: parentNodes.map((x: any) => x.path).join('/') + cur.path,
          level: parentNodes.length
        };
        if (!filter || filter(cur)) {
          prev.push(menu);
        }
      }

      return prev;
    },
    []
  );
}
