/**
 * api.service
 */

import Vue from 'vue';

import { AuthService } from './auth.service';
import { Http } from '../../lib/fetch/fetch';
import { SessionService } from './session.service';
import { CommonService } from './common.service';
import { ReceiverType } from '../global';

// 为请求 添加 access-token
Http.interceptors.request.use(
  function (config) {
    config.headers['X-Access-Token'] = SessionService.user.accessToken;
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

Http.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (typeof error.message === 'string' && /token/i.test(error.message)) {
      // unauthorized 未授权 登出账户
      SessionService.logout();
      // 跳转至授权页
      Vue.prototype.$router.push({ path: AuthService.authPath });
      Vue.prototype.$notify.success('登出成功！');
    }
    return Promise.reject(error);
  }
);

export class ApiServiceStatic {
  login(params) {
    return Http.post('/sys/login', {
      ...params,
      // 加密 password
      password: CommonService.encrypt(params.password)
    });
  }

  logout() {
    Http.get('/sys/logout').catch(() => {});
    return Promise.resolve();
  }

  // 减免管理
  derate_add(params) {
    return Http.post('/derate/add', params);
  }

  derate_get(params) {
    return Http.get('/derate/get', params);
  }

  derate_update(params) {
    return Http.put('/derate/update', params);
  }

  derate_delete(id) {
    return Http.delete(`/derate/delete/${id}`);
  }

  derate_page(params) {
    return Http.get('/derate/page', {
      params
    });
  }

  read_config_content_third_category(type) {
    return Http.get(`/common/read/config/content/third/category/${type}`);
  }

  // 提现管理
  withdraw_update(params) {
    return Http.put('/withdraw/update/withdraw/flow', params);
  }

  withdraw_page(params) {
    return Http.get('/withdraw/page', {
      params
    });
  }

  withdraw_detail(id) {
    return Http.get(`/withdraw/detail/${id}`);
  }

  withdraw_statistics() {
    return Http.get('/withdraw/statistics');
  }

  /**
   * 库存
   */
  stock_page(params) {
    return Http.get('/stock/page', {
      params
    });
  }

  /**
   * 获取商品列表
   */
  product_list(params) {
    return Http.get('/product/list', {
      params
    });
  }

  /**
   * 库存新增
   */
  stock_add(data) {
    return Http.post('/stock/add', data);
  }

  /**
   * 库存删除
   */
  stock_delete(id) {
    return Http.delete(`/stock/delete/${id}`);
  }

  /**
   * 产品入库
   */
  singleProduct_add(data) {
    return Http.post('/singleProduct/add', data);
  }

  /**
   * 库存详情分页
   */
  singleProduct_page(params) {
    return Http.get('/singleProduct/page', {
      params
    });
  }

  product_page(params) {
    return Http.get('/product/page', {
      params
    });
  }

  product_add(data) {
    return Http.post('/product/add', data);
  }

  product_update(data) {
    return Http.post('/product/update', data);
  }

  product_delete(id) {
    return Http.delete(`/product/delete/${id}`);
  }

  // 数据统计
  agentAccountFlow_statistics() {
    // return Promise.resolve(require('../assets/json/agentAccountFlowstatistics.json'));
    return Http.get('/agentAccountFlow/statistics');
  }

  agentAccountFlow_page(params) {
    // return Promise.resolve(require('../assets/json/agentAccountFlowpage.json'));
    return Http.get('/agentAccountFlow/page', {
      params
    });
  }

  rebateConfig_list(params?) {
    return Http.get('/rebateConfig/list', {
      params: params
    });
  }

  rebateConfig_delete(params) {
    return Http.delete(`/rebateConfig/delete/${params}`);
  }

  rebateConfig_add(params) {
    return Http.post('/rebateConfig/add', params);
  }

  agentAccountFlow_update(params) {
    return Http.put('/agentAccountFlow/update', params);
  }

  agentAccountFlow_detail(id) {
    return Http.get(`/agentAccountFlow/detail/${id}`);
  }

  agentLevel_page(params) {
    return Http.get('/agentLevel/page', {
      params
    });
  }

  agentLevel_add(data) {
    return Http.post('/agentLevel/add', data);
  }

  agentLevel_update(data) {
    return Http.put('/agentLevel/update', data);
  }

  agentLevel_delete(id) {
    return Http.delete(`/agentLevel/delete/${id}`);
  }

  agent_page_check = (userType, params) => {
    // orderType为 1 才是申请的订单
    params.orderType = 1;
    return Http.get(userType ? `/agent/page/check/${userType}` : '/agent/page', {
      params
    }).then((res: any) => {
      res.rows.forEach((ele) => {
        // 11专员通过，12专员不通过，13财务通过，14财务不通过
        // 21 代理商通过，22 代理商不通过
        ele.isCompanyVerify = /1/.test(ele.checkStatus + ''); // 状态为 1,11,12,13,14的都是公司审核  状态为2,21,22
      });
      return res;
    });
  };

  agent_detail = (agentId, orderId) => {
    return Http.get(`/agent/detail/${agentId}/${orderId}`);
  };

  agent_level_change(data) {
    return Http.put('/agent/level/change', data);
  }

  agent_check(data) {
    return Http.post('/agent/check', data);
  }

  agent_statistics(data) {
    return Http.post('/agent/statistics', data);
  }

  order_page(data) {
    // data.receiverId = 1
    return Http.post('/order/page', data);
  }

  order_statistics(data) {
    return Http.post('/order/statistics', data);
  }

  order_update(params) {
    return Http.put('/order/update', params);
  }

  order_single = (orderId, receiveType, orderNo) => {
    return Http.get(`/order/single/${orderId}/${receiveType}`, {
      responseType: 'blob'
    }).then((res) => {
      const url = window.URL.createObjectURL(res);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', `发货单_${orderNo}_${ReceiverType.desc[receiveType]}.xls`);
      document.body.appendChild(link);
      link.click();
      // 下载完成移除元素
      document.body.removeChild(link);
      // 释放掉blob对象
      window.URL.revokeObjectURL(url);
    });
  };

  order_check_ship(file, id) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id);
    return Http.post('/order/check/ship', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  order_ship(data) {
    return Http.post('/order/ship', data);
  }

  /**
   * 零售分页
   */
  order_retail_page(data) {
    return Http.post('/order/retail/page', data);
  }

  /**
   * 零售统计
   */
  order_retail_statistics(data) {
    return Http.post('/order/retail/statistics', data);
  }

  /**
   * 代理商管理分页
   */
  agent_temp_page(params) {
    params.orderType = 1;
    return Http.get('/agent/temp/page', {
      params
    });
  }

  /**
   * 代理商管理数据统计
   */
  agent_temp_statistics(data) {
    return Http.post('/agent/temp/statistics', data);
  }

  /**
   * 代理商详情
   */
  agent_temp_detail(id, orderId) {
    return Http.get(`/agent/temp/detail/${id}/${orderId}`);
  }

  /**
   * 代理商解、封禁
   */
  agent_type_detail(id, type) {
    return Http.post(`/agent/${type}/${id}`);
  }

  getAgentList(params) {
    return Http.get('/agent/temp/page', { params });
  }

  getInfo(id) {
    return Http.get(`/agent/temp/detail/${id}`).then((res: any) => {
      if (res.subCountNodes) {
        const buf = res.subCountNodes;
        res.subLvls = Object.keys(buf)
          .map((ele) => +ele)
          .sort((a, b) => b - a)
          .filter((ele) => buf[ele].count);
      }
      res.subNodeList.forEach((ele) => {
        if (ele.subCountNodes) {
          const buf = ele.subCountNodes;
          ele.subLvls = Object.keys(buf)
            .map((ele) => +ele)
            .sort((a, b) => b - a);
        }
      });
      return res;
    });
  }

  warrant_page(params) {
    return Http.get('/warrant/page', { params });
  }

  warrant_get(id) {
    return Http.get(`/warrant/get/${id}`);
  }

  warrant_statistics() {
    return Http.get('/warrant/statistics');
  }

  warrant_update(params) {
    return Http.put('/warrant/update', params);
  }
}

export const ApiService = new ApiServiceStatic();
