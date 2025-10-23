import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ランダムな暗号化キーを生成
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('🔑 Generating encryption key...');

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

console.log('✅ Encryption key generated and injected');

// 環境変数にも保存（他のスクリプトで使用可能に）
fs.writeFileSync(
  path.join(__dirname, '../.encryption-key'),
  encryptionKey
);
