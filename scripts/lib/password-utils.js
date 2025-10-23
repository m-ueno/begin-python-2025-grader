import crypto from 'crypto';
import { createRawPassword, extractPassword } from '../../shared/password-algorithm.js';

/**
 * 環境変数から暗号化キーを取得（設定されていなければエラー）
 */
export function getEncryptionKey() {
  const encryptionKey = process.env.GRADER_ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error('❌ Error: GRADER_ENCRYPTION_KEY environment variable is not set.');
    console.error('');
    console.error('Please set it in one of the following ways:');
    console.error('  1. Create a .env file: cp .env.example .env');
    console.error('  2. Set it in your shell: export GRADER_ENCRYPTION_KEY="your-key"');
    console.error('  3. Run with inline env: GRADER_ENCRYPTION_KEY="your-key" npm run <command>');
    console.error('');
    process.exit(1);
  }

  return encryptionKey;
}

/**
 * 課題IDからパスワードを生成（Node.js環境用）
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @param {string} encryptionKey - 暗号化キー
 * @returns {string} - 生成されたパスワード（8文字の英数字大文字）
 */
export function generatePassword(lectureSlug, assignmentId, encryptionKey) {
  const rawPassword = createRawPassword(lectureSlug, assignmentId);
  const hashHex = crypto.createHash('sha256').update(rawPassword + encryptionKey).digest('hex');
  return extractPassword(hashHex);
}
