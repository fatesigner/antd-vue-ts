/**
 * highlight
 */

import { Vue } from 'vue-property-decorator';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

Vue.directive('highlight', function (el) {
  const highlight = el.querySelectorAll('pre code');
  highlight.forEach((block) => {
    hljs.highlightBlock(block as any);
  });
});
