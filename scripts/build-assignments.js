import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assignmentsDir = path.join(__dirname, '../assignments');
const outputPath = path.join(__dirname, '../public/assignments.json');

// スキーマ定義
const TestSchema = z.object({
  preCode: z.string().optional(),
  preCodes: z.array(z.string()).optional(),
  postCode: z.string().optional(),
  expected: z.string()
});

const AssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  packages: z.array(z.string()).optional(),
  tests: z.array(TestSchema).min(1)
});

const LectureSchema = z.object({
  lectureNumber: z.number(),
  slug: z.string(),
  title: z.string(),
  assignments: z.array(AssignmentSchema).min(1)
}).passthrough(); // アンカー用の_anchorsなど余分なフィールドを許可

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

    // スキーマバリデーション
    const validatedLecture = LectureSchema.parse(lecture);

    // preCodesを処理
    for (const assignment of validatedLecture.assignments) {
      for (const test of assignment.tests) {
        // preCodesが配列の場合は結合してpreCodeに変換
        if (test.preCodes && Array.isArray(test.preCodes)) {
          test.preCode = test.preCodes.join('\n');
          delete test.preCodes;
        }
        // デフォルト値設定
        if (test.preCode === undefined) test.preCode = '';
        if (test.postCode === undefined) test.postCode = '';
      }
    }

    // _anchorsなどの内部フィールドを削除
    delete validatedLecture._anchors;

    lectures.push(validatedLecture);
    console.log(`✅ Loaded: ${validatedLecture.title} (${validatedLecture.assignments.length} assignments)`);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`❌ Schema validation error in ${file}:`);
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
      } else {
        console.error(error.message);
      }
    } else {
      console.error(`❌ Error parsing ${file}:`, error.message);
    }
    process.exit(1);
  }
}

// JSONとして出力（ディレクトリが存在しない場合は作成）
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(outputPath, JSON.stringify(lectures, null, 2));

console.log(`\n✅ Successfully built ${lectures.length} lectures`);
console.log(`📝 Output: ${outputPath}`);
