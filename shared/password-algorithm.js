/**
 * パスワード生成アルゴリズム
 * Node.jsとブラウザの両方で使用可能
 * assignmentのslugから決定的に50文字のパスワードを生成
 */

/**
 * assignmentのslugからパスワードを生成
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @returns {string} - 50文字の複雑なパスワード（大文字、小文字、数字、記号を含む）
 */
export function createRawPassword(lectureSlug, assignmentId) {
  return `${lectureSlug}-${assignmentId}`;
}

/**
 * ハッシュから最終的なパスワードを抽出
 * @param {string} hashHex - SHA256ハッシュの16進数文字列
 * @returns {string} - 50文字のパスワード
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
