/**
 * dynamic-events
 * 用于 component 的自定义事件分发
 */

export function DynamicEvents(_Vue) {
  _Vue.directive('dynamicEvents', {
    bind(el, binding, vnode) {
      const allEvents = binding.value;
      allEvents.forEach((event) => {
        // register handler in the dynamic component
        vnode.componentInstance.$on(event, (eventData) => {
          vnode.context.$emit(event, eventData);
        });
      });
    },
    unbind(el, binding, vnode) {
      vnode.componentInstance.$off();
    }
  });
}
