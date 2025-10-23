import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRawPassword, extractPassword } from '../shared/password-algorithm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 課題IDからパスワードを生成
 * @param {string} lectureSlug - 講義のslug
 * @param {string} assignmentId - 課題ID
 * @returns {string} - 生成されたパスワード（50文字）
 */
function generatePassword(lectureSlug, assignmentId) {
  const rawPassword = createRawPassword(lectureSlug, assignmentId);
  const hashHex = crypto.createHash('sha256').update(rawPassword).digest('hex');
  return extractPassword(hashHex);
}

// assignmentsディレクトリ内のすべてのYAMLファイルを読み込む
const assignmentsDir = path.join(__dirname, '../assignments');
const yamlFiles = fs.readdirSync(assignmentsDir)
  .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
  .sort();

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  講師用パスワード一覧 (MOOC登録用)');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const allPasswords = [];

for (const file of yamlFiles) {
  const filePath = path.join(assignmentsDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lecture = yaml.load(fileContent);

  console.log(`【${lecture.title}】 (${lecture.slug})`);
  console.log('─────────────────────────────────────────────────────────');

  for (const assignment of lecture.assignments) {
    const password = generatePassword(lecture.slug, assignment.id);

    console.log(`  ${assignment.id.padEnd(25)} → ${password}`);

    allPasswords.push({
      lecture: lecture.title,
      lectureSlug: lecture.slug,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      password: password
    });
  }

  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
console.log(`  合計: ${allPasswords.length} 課題`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');
