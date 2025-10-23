import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEncryptionKey } from './lib/password-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数から暗号化キーを取得
const encryptionKey = getEncryptionKey();

console.log('🔑 Using encryption key from environment variable');

// password.jsファイルを読み込み、プレースホルダーを置換
const passwordLibPath = path.join(__dirname, '../src/lib/password.js');
let passwordLibContent = fs.readFileSync(passwordLibPath, 'utf-8');

passwordLibContent = passwordLibContent.replace(
  '__ENCRYPTION_KEY__',
  encryptionKey
);

// 一時ファイルとして保存（ビルド後に使用）
const tempPath = path.join(__dirname, '../src/lib/password.generated.js');
fs.writeFileSync(tempPath, passwordLibContent);

console.log('✅ Encryption key injected into build');
