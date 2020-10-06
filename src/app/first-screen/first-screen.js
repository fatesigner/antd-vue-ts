/**
 * first-screen
 * 用于单页面应用首屏的 loading 动画
 */

const $el = document.querySelector('#first-screen .message dd');

if ($el) {
  $el.innerHTML = document.title;
}
