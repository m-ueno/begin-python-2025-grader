import CryptoJS from 'crypto-js';

// ビルド時に生成される暗号化キー（環境変数から注入）
const ENCRYPTION_KEY = '__ENCRYPTION_KEY__';

/**
 * パスワードを難読化（暗号化）
 * @param {string} password - 平文パスワード
 * @returns {string} - 暗号化されたパスワード
 */
export function obfuscatePassword(password) {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
}

/**
 * パスワードを復号化（検証用）
 * @param {string} encryptedPassword - 暗号化されたパスワード
 * @returns {string} - 復号化されたパスワード
 */
export function deobfuscatePassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * 課題IDとテストケース結果からパスワードを生成
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @param {boolean} allPassed - 全テストケースが通ったか
 * @returns {string} - 生成されたパスワード
 */
export function generatePassword(lectureSlug, assignmentId, allPassed) {
  if (!allPassed) {
    return '';
  }

  // 課題ごとの一意なパスワードを生成
  const rawPassword = `${lectureSlug}-${assignmentId}-pass`;
  const hash = CryptoJS.SHA256(rawPassword + ENCRYPTION_KEY).toString();

  // 8文字の英数字パスワードを生成（大文字小文字混在）
  return hash.substring(0, 8).toUpperCase();
}
