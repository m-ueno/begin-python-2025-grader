import CryptoJS from 'crypto-js';
import { createRawPassword, extractPassword } from '../../shared/password-algorithm.js';

/**
 * 課題IDとテストケース結果からパスワードを生成（ブラウザ環境用）
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @param {boolean} allPassed - 全テストケースが通ったか
 * @returns {string} - 生成されたパスワード
 */
export function generatePassword(lectureSlug, assignmentId, allPassed) {
  if (!allPassed) {
    return '';
  }

  // slugから決定的にパスワード生成
  const rawPassword = createRawPassword(lectureSlug, assignmentId);
  const hashHex = CryptoJS.SHA256(rawPassword).toString();
  return extractPassword(hashHex);
}
