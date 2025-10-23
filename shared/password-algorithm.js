/**
 * パスワード生成アルゴリズム
 * Node.jsとブラウザの両方で使用可能
 */

/**
 * assignmentのslugからパスワードを生成
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @returns {string} - パスワード
 */
export function createRawPassword(lectureSlug, assignmentId) {
  return `${lectureSlug}-${assignmentId}`;
}

/**
 * ハッシュから最終的なパスワードを抽出
 * @param {string} hashHex - SHA256ハッシュの16進数文字列
 * @returns {string} - パスワード
 */
export function extractPassword(hashHex) {
  // 使用する文字セット（視認性の悪い文字は除外）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*+=?';

  let password = '';
  for (let i = 0; i < 50; i++) {
    const byteIndex = (i * 2) % (hashHex.length - 1);
    const byteValue = parseInt(hashHex.substring(byteIndex, byteIndex + 2), 16);
    password += chars[byteValue % chars.length];
  }

  return password;
}
