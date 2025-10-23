let pyodide = null;

/**
 * エラーメッセージから主要なエラー行を抽出
 * @param {string} errorMessage - 完全なエラーメッセージ
 * @returns {Object} - { summary: 主要エラー行, full: 完全なエラーメッセージ }
 */
export function extractErrorSummary(errorMessage) {
  if (!errorMessage) {
    return { summary: '', full: '' };
  }

  const lines = errorMessage.split('\n');

  // 最後の非空行を取得（通常はここにSyntaxError等のメインエラーがある）
  let summaryLine = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line) {
      summaryLine = line;
      break;
    }
  }

  return {
    summary: summaryLine,
    full: errorMessage
  };
}

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
      // Pythonのエラーメッセージを取得
      let errorMessage = '';

      // Pyodideのエラーには複数のプロパティがある可能性がある
      // error.message, error.toString(), errorオブジェクト全体を確認
      console.error('Caught error:', error);
      console.error('Error message:', error.message);
      console.error('Error type:', typeof error);

      // まずerror.messageを使用
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = String(error);
      }

      // stderrも取得を試みる（Pythonのトレースバックはstderrに出力される）
      try {
        const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');
        if (stderr && stderr.trim()) {
          // stderrに内容があればそれを優先
          errorMessage = stderr.trim();
        }
      } catch (e) {
        // stderr取得に失敗しても続行
        console.error('Failed to get stderr:', e);
      }

      results.push({
        testIndex: i,
        passed: false,
        expected: test.expected.trim(),
        actual: '',
        error: errorMessage || 'エラーが発生しました（詳細不明）'
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
