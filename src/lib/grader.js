let pyodide = null;

/**
 * Pyodideを初期化
 */
export async function initPyodide() {
  if (pyodide) return pyodide;

  // CDNからPyodideを読み込み
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js';
  document.head.appendChild(script);

  await new Promise((resolve) => {
    script.onload = resolve;
  });

  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/'
  });

  return pyodide;
}

/**
 * Pythonコードを実行してテストする
 * @param {string} userCode - ユーザーが書いたコード
 * @param {Array} tests - テストケースの配列
 * @param {Array<string>} packages - 必要なパッケージのリスト
 * @returns {Promise<Object>} - テスト結果
 */
export async function runTests(userCode, tests, packages = []) {
  if (!pyodide) {
    await initPyodide();
  }

  // 必要なパッケージをロード
  if (packages && packages.length > 0) {
    await loadPackages(packages);
  }

  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    try {
      // Pyodideの環境をリセット
      pyodide.globals.clear();

      // 標準出力をキャプチャするための設定
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // ファイルシステムの簡易セットアップ
      // Pyodideはデフォルトで/home/pyodideを作業ディレクトリとして持っている

      // preCode, userCode, postCodeを順に実行
      const fullCode = `${test.preCode}\n${userCode}\n${test.postCode}`;

      await pyodide.runPythonAsync(fullCode);

      // 標準出力を取得
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

      // 出力を正規化（末尾の改行を削除）
      const actualOutput = stdout.trim();
      const expectedOutput = test.expected.trim();

      const passed = actualOutput === expectedOutput;

      results.push({
        testIndex: i,
        passed,
        expected: expectedOutput,
        actual: actualOutput,
        error: stderr || null
      });

    } catch (error) {
      results.push({
        testIndex: i,
        passed: false,
        expected: test.expected.trim(),
        actual: '',
        error: error.message
      });
    }
  }

  const allPassed = results.every(r => r.passed);

  return {
    allPassed,
    results
  };
}

/**
 * 必要なPythonパッケージをロード
 * @param {Array<string>} packages - パッケージ名の配列
 */
export async function loadPackages(packages) {
  if (!pyodide) {
    await initPyodide();
  }

  await pyodide.loadPackage(packages);
}
