// Web Worker instance
let worker = null;
let messageId = 0;
let pendingMessages = new Map();

// タイムアウト時間（ミリ秒）
const TIMEOUT_MS = 10000; // 10秒

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
 * Web Workerを初期化
 */
function initWorker() {
  if (worker) return worker;

  // 通常のWorkerとして初期化（importScriptsを使用するため）
  worker = new Worker(new URL('./pyodide.worker.js', import.meta.url));

  // Workerからのメッセージを処理
  worker.onmessage = (event) => {
    const { id, success, result, error } = event.data;

    if (pendingMessages.has(id)) {
      const { resolve, reject, timeoutId } = pendingMessages.get(id);
      clearTimeout(timeoutId);
      pendingMessages.delete(id);

      if (success) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
    }
  };

  worker.onerror = (error) => {
    console.error('Worker error:', error);
  };

  return worker;
}

/**
 * Workerにメッセージを送信し、タイムアウト付きで応答を待つ
 */
function sendWorkerMessage(type, data, timeout = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    const currentWorker = initWorker();

    // タイムアウトタイマーを設定
    const timeoutId = setTimeout(() => {
      if (pendingMessages.has(id)) {
        pendingMessages.delete(id);

        // Workerを終了して再作成
        if (worker) {
          worker.terminate();
          worker = null;
        }

        reject(new Error('実行がタイムアウトしました（10秒）。無限ループや重い処理が含まれている可能性があります。'));
      }
    }, timeout);

    pendingMessages.set(id, { resolve, reject, timeoutId });
    currentWorker.postMessage({ id, type, data });
  });
}

/**
 * Pyodideを初期化
 */
export async function initPyodide() {
  try {
    await sendWorkerMessage('init', {}, 30000); // 初期化は30秒のタイムアウト
  } catch (error) {
    console.error('Failed to initialize Pyodide:', error);
    throw error;
  }
}

/**
 * Pythonコードを実行してテストする
 * @param {string} userCode - ユーザーが書いたコード
 * @param {Array} tests - テストケースの配列
 * @param {Array<string>} packages - 必要なパッケージのリスト
 * @returns {Promise<Object>} - テスト結果
 */
export async function runTests(userCode, tests, packages = []) {
  // 必要なパッケージをロード
  if (packages && packages.length > 0) {
    await loadPackages(packages);
  }

  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    try {
      // testオブジェクトをシリアライズ可能な形式に変換（Proxyオブジェクトを回避）
      const serializedTest = {
        preCode: String(test.preCode || ''),
        postCode: String(test.postCode || ''),
        expected: String(test.expected || '')
      };

      const result = await sendWorkerMessage('runTest', {
        userCode: String(userCode),
        test: serializedTest
      });

      results.push({
        testIndex: i,
        ...result
      });

    } catch (error) {
      console.error('Test execution error:', error);

      results.push({
        testIndex: i,
        passed: false,
        expected: String(test.expected || '').trim(),
        actual: '',
        error: error.message || 'エラーが発生しました（詳細不明）'
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
  try {
    // packagesをシリアライズ可能な配列に変換
    const serializedPackages = Array.isArray(packages)
      ? packages.map(pkg => String(pkg))
      : [];

    await sendWorkerMessage('loadPackages', { packages: serializedPackages }, 30000); // パッケージロードは30秒のタイムアウト
  } catch (error) {
    console.error('Failed to load packages:', error);
    throw error;
  }
}
