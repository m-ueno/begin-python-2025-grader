import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assignmentsDir = path.join(__dirname, '../assignments');
const outputPath = path.join(__dirname, '../public/assignments.json');

console.log('📚 Building assignments from YAML files...');

// assignmentsディレクトリ内のすべてのYAMLファイルを読み込む
const yamlFiles = fs.readdirSync(assignmentsDir)
  .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
  .sort();

const lectures = [];

for (const file of yamlFiles) {
  const filePath = path.join(assignmentsDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  try {
    const lecture = yaml.load(fileContent);

    // 各課題のテストケースを検証
    for (const assignment of lecture.assignments) {
      if (!assignment.tests || assignment.tests.length === 0) {
        console.warn(`⚠️  Warning: Assignment "${assignment.id}" in ${file} has no tests`);
      }

      // preCode, postCode, expectedが存在することを確認
      for (const test of assignment.tests) {
        if (test.preCode === undefined) test.preCode = '';
        if (test.postCode === undefined) test.postCode = '';
        if (!test.expected) {
          console.error(`❌ Error: Test in assignment "${assignment.id}" has no expected output`);
          process.exit(1);
        }
      }
    }

    lectures.push(lecture);
    console.log(`✅ Loaded: ${lecture.title} (${lecture.assignments.length} assignments)`);

  } catch (error) {
    console.error(`❌ Error parsing ${file}:`, error.message);
    process.exit(1);
  }
}

// JSONとして出力
fs.writeFileSync(outputPath, JSON.stringify(lectures, null, 2));

console.log(`\n✅ Successfully built ${lectures.length} lectures`);
console.log(`📝 Output: ${outputPath}`);
