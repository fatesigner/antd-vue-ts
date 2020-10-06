/**
 * antdv
 */

import Vue from 'vue';
import { Alert, Col, Divider, Empty, message, notification, Popover, Tooltip } from 'ant-design-vue';
// 因为涉及到样式覆盖，所以这里不做懒加载，直接导入所有样式
import 'ant-design-vue/dist/antd.less';
import '../../../lib/antdv-ui/theme/ant-theme-classic.scss';

Vue.use(Alert);
Vue.use(Col);
Vue.use(Divider);
Vue.use(Empty);
Vue.use(Tooltip);
Vue.use(Popover);

notification.config({
  duration: 2,
  placement: 'topRight',
  bottom: '50px'
});

message.config({
  duration: 2,
  top: '26px',
  maxCount: 5
});

// 注册全局服务
Vue.prototype.$notification = notification;
Vue.prototype.$message = message;

// 导入 ant-design 主题
const classes = document.body.className.split(' ');
classes.push('ant-theme-classic');
document.body.className = classes.filter((x: any) => !!x).join(' ');
