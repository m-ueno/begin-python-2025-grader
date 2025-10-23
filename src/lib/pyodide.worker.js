// Web Worker for Pyodide execution (Classic Worker)
let pyodide = null;

/**
 * Pyodideを初期化
 */
async function initPyodide() {
  if (pyodide) return pyodide;

  // importScriptsでPyodideをロード
  self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js');

  pyodide = await self.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/'
  });

  return pyodide;
}

/**
 * メインスレッドからのメッセージを処理
 */
self.onmessage = async (event) => {
  const { id, type, data } = event.data;

  try {
    switch (type) {
      case 'init':
        await initPyodide();
        self.postMessage({ id, type: 'init', success: true });
        break;

      case 'loadPackages':
        if (!pyodide) {
          await initPyodide();
        }
        await pyodide.loadPackage(data.packages);
        self.postMessage({ id, type: 'loadPackages', success: true });
        break;

      case 'runTest':
        if (!pyodide) {
          await initPyodide();
        }
        const result = await runSingleTest(data.userCode, data.test);
        self.postMessage({ id, type: 'runTest', success: true, result });
        break;

      default:
        self.postMessage({
          id,
          type,
          success: false,
          error: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    self.postMessage({
      id,
      type,
      success: false,
      error: error.message || String(error)
    });
  }
};

/**
 * 単一のテストを実行
 */
async function runSingleTest(userCode, test) {
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

    // preCode, userCode, postCodeを順に実行
    const fullCode = `${test.preCode}\n${userCode}\n${test.postCode}`;

    await pyodide.runPythonAsync(fullCode);

    // 標準出力を取得（Proxyオブジェクトを文字列に変換）
    const stdoutProxy = await pyodide.runPythonAsync('sys.stdout.getvalue()');
    const stderrProxy = await pyodide.runPythonAsync('sys.stderr.getvalue()');

    // ProxyオブジェクトをJavaScriptの文字列に変換
    const stdout = String(stdoutProxy);
    const stderr = String(stderrProxy);

    // 出力を正規化（末尾の改行を削除）
    const actualOutput = stdout.trim();
    const expectedOutput = test.expected.trim();

    const passed = actualOutput === expectedOutput;

    return {
      passed,
      expected: expectedOutput,
      actual: actualOutput,
      error: stderr || null
    };

  } catch (error) {
    // Pythonのエラーメッセージを取得
    let errorMessage = '';

    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = String(error);
    }

    // stdoutとstderrも取得を試みる（エラー発生前の出力をキャプチャ）
    let actualOutput = '';
    try {
      const stdoutProxy = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stdout = String(stdoutProxy);
      actualOutput = stdout.trim();
    } catch (e) {
      // stdout取得に失敗しても続行
    }

    // stderrも取得を試みる
    try {
      const stderrProxy = await pyodide.runPythonAsync('sys.stderr.getvalue()');
      const stderr = String(stderrProxy);
      if (stderr && stderr.trim()) {
        errorMessage = stderr.trim();
      }
    } catch (e) {
      // stderr取得に失敗しても続行
    }

    return {
      passed: false,
      expected: test.expected.trim(),
      actual: actualOutput,
      error: errorMessage || 'エラーが発生しました（詳細不明）'
    };
  }
}
