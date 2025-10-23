<script>
  import { onMount } from 'svelte';
  import AssignmentForm from './components/AssignmentForm.svelte';
  import { initPyodide } from './lib/grader.js';

  let lectures = $state([]);
  let currentLecture = $state(null);
  let isLoading = $state(true);
  let pyodideReady = $state(false);

  const BASE_PATH = '/begin-python-2025-grader';

  onMount(async () => {
    // 講義データを読み込み（ビルド時に生成されたJSON）
    try {
      const response = await fetch(`${BASE_PATH}/assignments.json`);
      lectures = await response.json();

      // URLから講義slugを取得
      const path = window.location.pathname;
      const pathParts = path.replace(BASE_PATH, '').split('/').filter(Boolean);

      // 特定の講義ページの場合のみcurrentLectureを設定
      if (pathParts.length > 0 && pathParts[0] !== 'lectures') {
        const slug = pathParts[pathParts.length - 1];
        currentLecture = lectures.find(l => l.slug === slug);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      isLoading = false;
    }

    // Pyodideを初期化
    try {
      await initPyodide();
      pyodideReady = true;
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
    }
  });
</script>

<main>
  {#if isLoading}
    <header>
      <h1>Python自動採点システム</h1>
    </header>
    <div class="loading">読み込み中...</div>
  {:else if !currentLecture}
    <header class="header-narrow">
      <h1>Python自動採点システム</h1>
    </header>
    <section class="lecture-list">
      <h2>講義一覧</h2>
      <ul>
        {#each lectures as lecture}
          <li>
            <a href="{BASE_PATH}/{lecture.slug}">
              第{lecture.lectureNumber}回: {lecture.title}
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {:else}
    <header>
      <h1>Python自動採点システム</h1>
    </header>
    <section class="lecture-content">
      <div class="lecture-header">
        <h2>第{currentLecture.lectureNumber}回：{currentLecture.title}</h2>
      </div>

      {#if !pyodideReady}
        <div class="warning">
          Python実行環境を初期化中... (初回は時間がかかる場合があります)
        </div>
      {/if}

      <div class="assignments">
        {#each currentLecture.assignments as assignment}
          <AssignmentForm
            {assignment}
            lectureSlug={currentLecture.slug}
          />
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #f5f5f5;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  header h1 {
    margin: 0;
    font-size: 1.8em;
    font-weight: 600;
  }

  header.header-narrow {
    max-width: 600px;
    margin: 0 auto 30px;
  }

  .loading, .error, .warning {
    text-align: center;
    padding: 20px;
    border-radius: 4px;
    margin: 20px 0;
  }

  .loading {
    background: #e3f2fd;
    color: #1976d2;
  }

  .error {
    background: #ffebee;
    color: #c62828;
  }

  .warning {
    background: #fff3e0;
    color: #e65100;
  }

  .lecture-list {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    max-width: 600px;
    margin: 0 auto;
  }

  .lecture-list h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 1.3em;
  }

  .lecture-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .lecture-list li {
    margin-bottom: 10px;
  }

  .lecture-list a {
    display: block;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 4px;
    text-decoration: none;
    color: #333;
    transition: all 0.2s;
    border-left: 3px solid transparent;
  }

  .lecture-list a:hover {
    background: #e9ecef;
    border-left-color: #667eea;
    transform: translateX(4px);
  }

  .lecture-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .lecture-header {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #667eea;
  }

  .lecture-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.8em;
  }

  .assignments {
    margin-top: 30px;
  }
</style>
