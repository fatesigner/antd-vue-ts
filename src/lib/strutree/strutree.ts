/**
 * strutree
 */

import { GetGUID } from '@forgleaner/utils/random';

export interface IStrutreeConfig<T> {
  idKey?: string;
  labelKey?: string;
  childrenKey?: string;
  urlKey?: string;
  iconKey?: string;
  applyFunc?: (items: T[], index: number, item: T) => void;
}

export class Strutree<
  T extends {
    [key in string]?: any;
  }
> {
  config: IStrutreeConfig<T>;

  constructor(config?: IStrutreeConfig<T>) {
    this.config = Object.assign(
      {
        idKey: 'id',
        labelKey: 'label',
        childrenKey: 'children',
        urlKey: 'url',
        iconKey: 'icon',
        applyFunc(items, index, item) {
          items[index] = item;
        }
      },
      config
    );
  }

  // 解析数据
  parseNode(nodes: T[]): T[] {
    return this.map(nodes, (node: T) => {
      return {
        [this.config.idKey]: '',
        [this.config.labelKey]: '',
        [this.config.childrenKey]: [],
        [this.config.urlKey]: null,
        [this.config.iconKey]: '',
        ...node
      };
    });
  }

  addNode(node: T): T {
    return {
      [this.config.idKey]: GetGUID(12).toLowerCase(),
      [this.config.labelKey]: '',
      [this.config.childrenKey]: [],
      [this.config.urlKey]: null,
      [this.config.iconKey]: '',
      ...node
    };
  }

  /**
   * 遍历节点
   * @todo 遍历逻辑待优化.
   */
  forEach2(nodes: T[], callback: (node: T, index: number, parentNodes: T[]) => boolean) {
    // 采用递归深度遍历
    const forEach = (node: T, index: number, parentNodes: T[]): boolean => {
      if (callback(node, index, parentNodes)) {
        const childrenNodes = node[this.config.childrenKey] as T[];
        for (const [index, childNode] of childrenNodes.entries()) {
          const _parentNodes = [...parentNodes, node];
          console.log('__ test foreach ' + node[this.config.labelKey]);
          if (callback(childNode, index, _parentNodes)) {
            forEach(childNode, index, _parentNodes);
          } else {
            break;
          }
        }
      } else {
        // 结束此次循环
        return false;
      }
    };
    for (const [index, childNode] of nodes.entries()) {
      if (!forEach(childNode, index, [])) {
        break;
      }
    }
  }

  /**
   * 遍历节点
   * 回调函数 return false 的时候，中止循环
   * @param nodes
   * @param callback
   */
  every(nodes: T[], callback: (node: T, index: number, parentNodes: T[]) => boolean) {
    // 采用递归深度遍历
    const every = (nodes: T[], parentNodes: T[]): boolean => {
      let continued = true;
      for (const [index, childNode] of nodes.entries()) {
        console.log('_______'.repeat(parentNodes.length) + childNode[this.config.labelKey]);
        continued = callback(childNode, index, parentNodes);
        if (continued) {
          const childrenNodes = childNode[this.config.childrenKey] as T[];
          continued = every(childrenNodes, [...parentNodes, childNode]);
          if (!continued) {
            break;
          }
        } else {
          break;
        }
      }
      return continued;
    };

    every(nodes, []);
  }

  map(nodes: T[], callback: (cur: T, index: number, nodes: T[]) => T) {
    this.every(nodes, (childNode, index, parentNodes) => {
      let _nodes = nodes;
      if (parentNodes && parentNodes.length && parentNodes[parentNodes.length - 1].children) {
        _nodes = parentNodes[parentNodes.length - 1].children;
      }
      this.config.applyFunc(_nodes, index, callback(childNode, index, nodes));
      return true;
    });
    return nodes;
  }

  reduce<TPrev = any>(
    nodes: T[],
    callback: (prev: TPrev, cur: T, index: number, nodes: T[]) => TPrev,
    prev: TPrev
  ): TPrev {
    this.every(nodes, (node, index, parentNode) => {
      prev = callback(prev, node, index, nodes);
      return true;
    });
    return prev;
  }

  // 查找指定节点
  find(
    nodes: T[],
    callback: (node: T) => boolean
  ): {
    node: T;
    index: number;
    parentNodes: T[];
  } {
    let res: {
      node: T;
      index: number;
      parentNodes: T[];
    };
    this.every(nodes, (node, index, parentNodes) => {
      const idx = callback(node);
      if (idx) {
        res = {
          node,
          index,
          parentNodes
        };
      }
      return !idx;
    });

    return res;
  }

  // 指定节点向前移动
  moveForward(nodes: T[], id: string) {
    const node = this.find(nodes, (x) => x.id === id);
    console.log(JSON.stringify(node.parentNodes));
    if (node.index > 0) {
      const temp = node.parentNodes[node.parentNodes.length - 1].children[node.index];
      this.config.applyFunc(
        node.parentNodes[node.parentNodes.length - 1].children,
        node.index,
        node.parentNodes[node.parentNodes.length - 1].children[node.index - 1]
      );
      this.config.applyFunc(node.parentNodes[node.parentNodes.length - 1].children, node.index - 1, temp);
    }
  }

  // 向后移动
  moveBack(nodes: T[], id: string) {
    const node = this.find(nodes, (x) => x.id === id);
    if (node.index < node.parentNodes[node.parentNodes.length - 1].children.length - 1) {
      const temp = node.parentNodes[node.parentNodes.length - 1].children[node.index];
      this.config.applyFunc(
        node.parentNodes[node.parentNodes.length - 1].children,
        node.index,
        node.parentNodes[node.parentNodes.length - 1].children[node.index + 1]
      );
      this.config.applyFunc(node.parentNodes[node.parentNodes.length - 1].children, node.index + 1, temp);
    }
  }
}
