/**
 * file-chooser.directive
 */

import { FileChooserService } from '../file-chooser';
import { IFileChooserOptions } from '../model';

export interface IVueFileChooserOptions {}

export function FileChooserDirectiveForVue(_Vue, opts: IVueFileChooserOptions) {
  const DefaultOptions: IFileChooserOptions = {
    width: '100%',
    height: '100%',
    multiple: false,
    fileTypeLimits: [],
    minSize: 0,
    maxSize: 0,
    clickable: true
  };
  _Vue.directive('file-chooser', {
    bind(el, binding, vnode) {
      const options = Object.assign(
        {},
        DefaultOptions,
        {
          targetEl: el
        },
        binding.value
      );

      el.chooser = FileChooserService.createFileChooser(
        options,
        (res) => {
          // vnode.context.$emit('fileChooserChange', res);
          if (vnode.componentInstance) {
            vnode.componentInstance.$emit('fileChooserChange', res); // use {detail:} to be uniform
          } else {
            vnode.elm.dispatchEvent(new Event('fileChooserChange', res as any));
          }
        },
        (reason) => {
          vnode.context.$emit('fileChooserError', reason);
        }
      );
    },
    unbind(el) {
      if (el.chooser) {
        el.chooser.destroy();
      }
    }
  });
}
