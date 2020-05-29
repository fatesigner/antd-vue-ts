/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../interfaces';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/agent-user',
  name: 'agentUser',
  component: () => import('./AgentUser.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner],
    label: I18nkeys.route.agentUser,
    keepAlive: true
  }
};

export default Router;
