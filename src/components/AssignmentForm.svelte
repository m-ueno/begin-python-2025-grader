<script>
  import { runTests } from '../lib/grader.js';
  import { generatePassword } from '../lib/password.js';

  let { assignment, lectureSlug } = $props();

  let userCode = $state('');
  let isRunning = $state(false);
  let isLoadingPackages = $state(false);
  let testResults = $state(null);
  let password = $state('');

  async function handleSubmit() {
    isRunning = true;
    testResults = null;
    password = '';

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
          <div class="password-display">
            <strong>パスワード:</strong>
            <code class="password">{password}</code>
          </div>
          <p class="instruction">このパスワードをMOOCに提出してください。</p>
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
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .loading-packages {
    margin-top: 15px;
    padding: 15px;
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    color: #856404;
    border-radius: 4px;
  }

  .test-results {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
    background: white;
  }

  .success {
    color: #28a745;
  }

  .failure {
    color: #dc3545;
  }

  .password-display {
    margin: 15px 0;
    padding: 15px;
    background: #e7f3ff;
    border-left: 4px solid #007bff;
  }

  .password {
    font-size: 24px;
    font-weight: bold;
    color: #007bff;
    padding: 5px 10px;
    background: white;
    border: 2px solid #007bff;
    border-radius: 4px;
    display: inline-block;
    margin-left: 10px;
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
    background: #d4edda;
    border-left: 4px solid #28a745;
  }

  .test-case.failed {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
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
    background: #ffe6e6;
    color: #d8000c;
  }
</style>
