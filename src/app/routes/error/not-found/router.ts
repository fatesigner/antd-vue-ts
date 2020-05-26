/**
 * router
 */

import { IAppRouteConfig } from '../../model';
import { I18nkeys } from '../../../i18n';

const Router: IAppRouteConfig = {
  path: '*',
  name: 'notFound',
  component: () => import('./NotFound.vue'),
  meta: {
    label: I18nkeys.route.error.notFound
  }
};

export default Router;
