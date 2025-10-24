/**
 * パスワード生成アルゴリズム
 * Web Crypto APIを使用してNode.jsとブラウザの両方で動作
 */

/**
 * SHA256ハッシュの16進数文字列からパスワードを生成
 * @param {string} hashHex - SHA256ハッシュの16進数文字列
 * @returns {string} - パスワード
 */
function extractPassword(hashHex) {
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

/**
 * 講義slugと課題IDからパスワードを生成
 * Web Crypto APIを使用（Node.js 18+とブラウザの両方で動作）
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @returns {Promise<string>} - 生成されたパスワード
 */
export async function generatePassword(lectureSlug, assignmentId) {
  const rawPassword = `${lectureSlug}-${assignmentId}`;

  // Web Crypto APIを使用してSHA-256ハッシュを計算
  const encoder = new TextEncoder();
  const data = encoder.encode(rawPassword);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);

  // ArrayBufferを16進数文字列に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return extractPassword(hashHex);
}
