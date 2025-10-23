import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { generatePassword } from './lib/password-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
