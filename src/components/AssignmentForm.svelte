<script>
  import { runTests } from '../lib/grader.js';
  import { generatePassword } from '../lib/password.js';

  let { assignment, lectureSlug } = $props();

  let userCode = $state('');
  let isRunning = $state(false);
  let isLoadingPackages = $state(false);
  let testResults = $state(null);
  let password = $state('');
  let copyStatus = $state(''); // 'success' or 'error'

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      copyStatus = 'success';
      setTimeout(() => {
        copyStatus = '';
      }, 2000);
    } catch (error) {
      copyStatus = 'error';
      setTimeout(() => {
        copyStatus = '';
      }, 2000);
    }
  }

  async function handleSubmit() {
    isRunning = true;
    testResults = null;
    password = '';
    copyStatus = '';

    try {
      const packages = assignment.packages || [];

      // パッケージ読み込みが必要な場合は表示
      if (packages.length > 0) {
        isLoadingPackages = true;
      }

      const results = await runTests(userCode, assignment.tests, packages);
      isLoadingPackages = false;
      testResults = results;

      if (results.allPassed) {
        password = generatePassword(lectureSlug, assignment.id, true);
      }
    } catch (error) {
      testResults = {
        allPassed: false,
        results: [{
          testIndex: 0,
          passed: false,
          expected: '',
          actual: '',
          error: error.message
        }]
      };
    } finally {
      isRunning = false;
    }
  }
</script>

<div class="assignment-form">
  <h3>{assignment.title}</h3>

  <div class="code-editor">
    <label for="code-{assignment.id}">コードを入力:</label>
    <textarea
      id="code-{assignment.id}"
      bind:value={userCode}
      placeholder="ここにPythonコードを入力してください"
      rows="10"
      disabled={isRunning}
    ></textarea>
  </div>

  <button onclick={handleSubmit} disabled={isRunning || !userCode.trim()}>
    {isRunning ? '実行中...' : 'テスト実行'}
  </button>

  {#if isLoadingPackages}
    <div class="loading-packages">
      {#if assignment.packages && assignment.packages.length > 0}
        パッケージを読み込み中: {assignment.packages.join(', ')}... (初回は時間がかかる場合があります)
      {/if}
    </div>
  {/if}

  {#if testResults}
    <div class="test-results">
      <h4>テスト結果</h4>

      {#if testResults.allPassed}
        <div class="success">
          <p>✅ すべてのテストが合格しました！</p>
          <div class="password-container">
            <div class="password-label">
              <strong>パスワード:</strong>
            </div>
            <div class="password-box">
              <code class="password" id="password-{assignment.id}">{password}</code>
              <button
                class="copy-button {copyStatus}"
                onclick={copyPassword}
                type="button"
              >
                {#if copyStatus === 'success'}
                  ✓ コピーしました
                {:else if copyStatus === 'error'}
                  ✗ コピー失敗
                {:else}
                  📋 コピー
                {/if}
              </button>
            </div>
          </div>
          <p class="instruction">コピーボタンを使ってパスワードを確実にコピーし、提出してください。</p>
        </div>
      {:else}
        <div class="failure">
          <p>❌ 一部のテストが失敗しました。</p>
        </div>
      {/if}

      <div class="test-details">
        {#each testResults.results as result, i}
          <div class="test-case {result.passed ? 'passed' : 'failed'}">
            <h5>テストケース {i + 1}: {result.passed ? '✅ 合格' : '❌ 不合格'}</h5>

            {#if !result.passed}
              <div class="test-info">
                <div>
                  <strong>期待される出力:</strong>
                  <pre>{result.expected}</pre>
                </div>
                <div>
                  <strong>実際の出力:</strong>
                  <pre>{result.actual}</pre>
                </div>
                {#if result.error}
                  <div>
                    <strong>エラー:</strong>
                    <pre class="error">{result.error}</pre>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .assignment-form {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 8px;
    background: #f9f9f9;
  }

  h3 {
    margin-top: 0;
    color: #333;
  }

  .code-editor {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  textarea {
    width: 100%;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }

  button {
    background-color: #1a73e8;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #1557b0;
  }

  button:disabled {
    background-color: #dadce0;
    color: #80868b;
    cursor: not-allowed;
  }

  .loading-packages {
    margin-top: 15px;
    padding: 15px;
    background: #f5f5f5;
    border-left: 4px solid #1a73e8;
    color: #5f6368;
    border-radius: 4px;
  }

  .test-results {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
    background: white;
  }

  .success {
    color: #137333;
  }

  .failure {
    color: #c5221f;
  }

  .password-container {
    margin: 15px 0;
    padding: 20px;
    background: #e6f4ea;
    border: 2px solid #137333;
    border-radius: 8px;
  }

  .password-label {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .password-hint {
    font-size: 12px;
    color: #666;
    font-weight: normal;
  }

  .password-box {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .password {
    font-family: 'Courier New', 'Consolas', monospace;
    font-size: 18px;
    font-weight: bold;
    color: #137333;
    padding: 12px 16px;
    background: white;
    border: 2px solid #137333;
    border-radius: 6px;
    display: inline-block;
    letter-spacing: 1px;
    word-break: break-all;
    user-select: all;
    -webkit-user-select: all;
    -moz-user-select: all;
    -ms-user-select: all;
    flex: 1;
    min-width: 300px;
  }

  .copy-button {
    background-color: #137333;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 140px;
  }

  .copy-button:hover {
    background-color: #0d5525;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(19, 115, 51, 0.3);
  }

  .copy-button:active {
    transform: translateY(0);
  }

  .copy-button.success {
    background-color: #0d5525;
    animation: pulse 0.5s ease;
  }

  .copy-button.error {
    background-color: #c5221f;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .instruction {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
  }

  .test-details {
    margin-top: 15px;
  }

  .test-case {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 4px;
  }

  .test-case.passed {
    background: #e6f4ea;
    border-left: 4px solid #137333;
  }

  .test-case.failed {
    background: #fce8e6;
    border-left: 4px solid #c5221f;
  }

  .test-info {
    margin-top: 10px;
    font-size: 14px;
  }

  .test-info > div {
    margin-bottom: 10px;
  }

  pre {
    background: #f4f4f4;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 5px 0;
  }

  pre.error {
    background: #fce8e6;
    color: #c5221f;
    border: 1px solid #c5221f;
    font-weight: 500;
  }
</style>
