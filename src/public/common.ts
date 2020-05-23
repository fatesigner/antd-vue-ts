/**
 * common 有业务有关的一些通用函数
 */

import VueRouter from 'vue-router';
import { GetGUID } from '@forgleaner/utils/random';

import { RoleData } from '../config/role';
import { IMenuLink } from '../models/memu';

// 动态添加角色选择控件，用于 develop 模式
export function AppendRoleRadios(container, targetEl, callback) {
  // 动态添加角色 radio 选择器
  let htmlStr = '';
  // 默认选中第一项
  const cur = 0;
  RoleData.forEach((role, index) => {
    htmlStr += `<label class="roles-radios" style="margin-right: 5px; cursor: pointer;"><input name="role" type="radio" value="${index}" ${
      index === cur ? 'checked' : ''
    }/>&nbsp;${role.text}</label>&nbsp;`;
  });
  htmlStr = `<div style="margin-bottom: 10px">${htmlStr}</div>`;
  const element = document.createElement('div');
  element.innerHTML = htmlStr;
  container.insertBefore(element.children[0], targetEl || container.firstChild);
  // 绑定 radio change 事件
  container.querySelectorAll('.roles-radios input').forEach(($radio) => {
    $radio.onclick = (e) => {
      callback(RoleData[e.target.value]);
    };
  });
  callback(RoleData[cur]);
}

// 获取当前已注册的 vue routers
export function GetVueRegistedRouters($router: VueRouter): IMenuLink[] {
  const menuLinks: IMenuLink[] = [];

  for (const route of ($router as any).options.routes) {
    let label = '';
    if (route.meta && route.meta.label) {
      label = route.meta.label;
    }
    menuLinks.push({
      id: GetGUID().toLowerCase(),
      url: route.path,
      label
    });
    console.log(
      JSON.stringify({
        name: route.name,
        path: route.path,
        meta: route.meta
      })
    );
  }

  return menuLinks;
}
