import CryptoJS from 'crypto-js';
import { createRawPassword, extractPassword } from '../../shared/password-algorithm.js';

// ビルド時に生成される暗号化キー（環境変数から注入）
const ENCRYPTION_KEY = '__ENCRYPTION_KEY__';

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

  // 共通アルゴリズムを使用してパスワード生成
  const rawPassword = createRawPassword(lectureSlug, assignmentId);
  const hashHex = CryptoJS.SHA256(rawPassword + ENCRYPTION_KEY).toString();
  return extractPassword(hashHex);
}
