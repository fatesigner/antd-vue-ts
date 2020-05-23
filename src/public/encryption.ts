/**
 * AES加密 ：字符串 key iv  返回base64
 */

import CryptoJS from 'crypto-js';

export function Encrypt(word, keyStr, ivStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(ivStr);

  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  });
  // console.log("-=-=-=-", encrypted.ciphertext)
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}
