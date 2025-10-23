/**
 * パスワード生成アルゴリズムの定数
 * Node.jsとブラウザの両方で使用可能
 */

/**
 * Raw passwordを生成する
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @returns {string} - ハッシュ化前の文字列
 */
export function createRawPassword(lectureSlug, assignmentId) {
  return `${lectureSlug}-${assignmentId}-pass`;
}

/**
 * ハッシュから最終的なパスワードを抽出
 * @param {string} hashHex - SHA256ハッシュの16進数文字列
 * @returns {string} - 8文字の英数字大文字パスワード
 */
export function extractPassword(hashHex) {
  return hashHex.substring(0, 8).toUpperCase();
}
