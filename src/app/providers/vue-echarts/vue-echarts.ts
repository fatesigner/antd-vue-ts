/**
 * vue-echarts
 */

import { merge } from 'lodash';
import { Vue } from 'vue-property-decorator';
import VueECharts from 'vue-echarts';

import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/custom';
import 'echarts/lib/component/polar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/dataZoom';

Vue.component('v-chart', VueECharts);

export { VueECharts };

const DefaultOptions = {
  grid: {
    top: '10',
    right: '0',
    bottom: '10',
    left: '0',
    containLabel: true
  },
  axisLabel: {
    interval: 0,
    rotate: 40,
    color: '#333'
  },
  xAxis: {
    axisLabel: {
      margin: 20,
      fontSize: 14
    },
    axisLine: {
      lineStyle: {
        color: '#ccc'
      }
    },
    type: 'category',
    data: []
  },
  yAxis: {
    axisLine: {
      lineStyle: {
        color: '#ccc'
      }
    },
    splitLine: {
      // 默认隐藏网格线
      show: false
    },
    type: 'value',
    boundaryGap: [0, 1]
  },
  series: []
};

/**
 * 获取指定数字往上取整的相同位数的数值，例如 3680 => 4000，9999 => 10000
 * @param value
 * @constructor
 */
export function GetCeilNumber(value) {
  const len = value.toString().length - 1;
  const pow = Math.pow(10, len);
  const num = parseFloat(value.toString()[0]);
  return (num + 1) * pow;
}

// 获取 chart 间隔数量
export function GetVueEchartsSplit(max, splitNumber, decimal = 0) {
  const res = {
    max: max,
    interval: 0,
    splitNumber: 0
  };

  // 尝试分割
  res.interval = max / splitNumber;

  // 获取分割的值的小数位数
  const dig = res.interval.toString().split('.');
  if (dig.length > 1) {
    const dec = dig[1];
    const decLen = dec.length;
    if (decLen > decimal) {
      // 进一位
      if (decimal > 0) {
        res.interval = parseFloat(dig[0] + '.' + parseInt(dec.substr(0, decimal)) + 1);
      } else {
        res.interval = parseInt(dig[0]) + 1;
      }
    }
  }

  if (splitNumber > 0 && res.interval > 0) {
    const num = max / res.interval;
    res.splitNumber = Math.floor(num);
    const remainder = num - Math.trunc(num);
    if (remainder > 0.5) {
      res.max = res.interval * (res.splitNumber + 2);
    } else {
      res.max = res.interval * (res.splitNumber + 1);
    }
  } else {
    res.splitNumber = 1;
    res.interval = res.max = 5;
  }

  return res;
}

/**
 * 获取 vue-echarts 默认配置
 * @param options
 * @param config
 * @constructor
 */
export function GetVueEchartsOptions(
  options: any,
  config?: {
    // 是否显示缩放滚动条
    dataZoom?: boolean;
  }
) {
  const args = [{}, DefaultOptions];

  if (config?.dataZoom) {
    args.push({
      grid: {
        top: '5%',
        right: '0',
        bottom: '12%',
        left: '0',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          startValue: 0,
          endValue: 10,
          zoomLock: true
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          startValue: 0,
          endValue: 10,
          zoomLock: true,
          zoomOnMouseWheel: false,
          moveOnMouseMove: false
        },
        /* {
        type: 'slider',
        show: true,
        yAxisIndex: [0],
        start: 0,
        zoomLock: true,
        left: '96%'
      }, */
        {
          type: 'inside',
          yAxisIndex: [0],
          start: 0,
          zoomLock: true
        }
      ]
    });
  }

  args.push(options);

  return merge.apply(this, args);
}
