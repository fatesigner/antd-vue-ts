/**
 * dynamic-events
 * 用于 component 的事件分发
 */

export function DynamicEvents(_Vue) {
  _Vue.directive('dynamicEvents', {
    bind(el, binding, vnode) {
      const allEvents = binding.value;
      Object.keys(allEvents).forEach((event) => {
        // register handler in the dynamic component
        vnode.componentInstance.$on(event, (eventData) => {
          const targetEvent = allEvents[event];
          vnode.context[targetEvent](eventData);
          // DispatchEvent(vnode, event, eventData);
        });
      });
      /* allEvents.forEach((event) => {
        // register handler in the dynamic component
        vnode.componentInstance.$on(event, (eventData) => {
          // when the event is fired, the proxyEvent function is going to be called
          vnode.context.proxyEvent(event, eventData);
        });
      }); */
    },
    update(el, binding, vnode) {
      const allEvents = binding.value;
      Object.keys(allEvents).forEach((event) => {
        // register handler in the dynamic component
        vnode.componentInstance.$on(event, (eventData) => {
          const targetEvent = allEvents[event];
          vnode.context[targetEvent](eventData);
          // DispatchEvent(vnode, event, eventData);
        });
      });
    },
    unbind(el, binding, vnode) {
      vnode.componentInstance.$off();
    }
  });
}
