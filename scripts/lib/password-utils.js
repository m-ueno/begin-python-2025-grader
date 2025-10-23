import crypto from 'crypto';
import { createRawPassword, extractPassword } from '../../shared/password-algorithm.js';

/**
 * 課題IDからパスワードを生成（Node.js環境用）
 * assignmentのslugから決定的にパスワードを生成
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @returns {string} - 生成されたパスワード（30文字）
 */
export function generatePassword(lectureSlug, assignmentId) {
  const rawPassword = createRawPassword(lectureSlug, assignmentId);
  const hashHex = crypto.createHash('sha256').update(rawPassword).digest('hex');
  return extractPassword(hashHex);
}
