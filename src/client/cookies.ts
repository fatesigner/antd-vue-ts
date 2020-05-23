/**
 * cookies
 */

import Cookies from 'js-cookie';

const appKey = 'sales-manage';

// App
const sidebarStatusKey = appKey + 'sidebar_status';
export const getSidebarStatus = () => Cookies.get(sidebarStatusKey);
export const setSidebarStatus = (sidebarStatus: string) => Cookies.set(sidebarStatusKey, sidebarStatus);

const languageKey = appKey + 'language';
export const getLanguage = () => Cookies.get(languageKey);
export const setLanguage = (language: string) => Cookies.set(languageKey, language);

const sizeKey = appKey + 'size';
export const getSize = () => Cookies.get(sizeKey);
export const setSize = (size: string) => Cookies.set(sizeKey, size);
