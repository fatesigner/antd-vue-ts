/**
 * error
 */

import Router, { Route } from 'vue-router';
import { Component } from 'vue-router/types/router';

export function AddNotFoundRoute(to: Route, router: Router, layoutComp: Component, props?: any): Router {
  router.addRoutes([
    {
      path: to.path,
      component: layoutComp,
      children: [
        {
          name: to.name,
          path: '',
          meta: to.meta,
          props: props,
          component: () => import('./NotFound.vue')
        }
      ]
    }
  ]);
  return router;
}

export function AddUnauthorizedRoute(to: Route, router: Router, layoutComp: Component, props?: any): Router {
  router.addRoutes([
    {
      path: to.path,
      component: layoutComp,
      children: [
        {
          name: to.name,
          path: '',
          meta: to.meta,
          props: props,
          component: () => import('./Unauthorized.vue')
        }
      ]
    }
  ]);
  return router;
}
