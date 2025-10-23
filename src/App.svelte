<script>
  import { onMount } from 'svelte';
  import AssignmentForm from './components/AssignmentForm.svelte';
  import { initPyodide } from './lib/grader.js';

  let lectures = $state([]);
  let currentLecture = $state(null);
  let isLoading = $state(true);
  let pyodideReady = $state(false);

  onMount(async () => {
    // 講義データを読み込み（ビルド時に生成されたJSON）
    try {
      const response = await fetch('/assignments.json');
      lectures = await response.json();

      // URLから講義slugを取得
      const path = window.location.pathname;
      const slug = path.split('/').filter(Boolean).pop() || 'lecture01-intro';

      currentLecture = lectures.find(l => l.slug === slug);

      if (!currentLecture && lectures.length > 0) {
        currentLecture = lectures[0];
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

  function navigateToLecture(slug) {
    window.history.pushState({}, '', `/${slug}`);
    currentLecture = lectures.find(l => l.slug === slug);
  }
</script>

<main>
  <header>
    <h1>Python Auto Grader</h1>
    <p>Jupyter Notebookで作成したコードを提出して自動採点</p>
  </header>

  {#if isLoading}
    <div class="loading">読み込み中...</div>
  {:else if !currentLecture}
    <div class="error">講義が見つかりません。</div>
  {:else}
    <nav class="lecture-nav">
      <h2>講義一覧</h2>
      <ul>
        {#each lectures as lecture}
          <li>
            <button
              class:active={lecture.slug === currentLecture.slug}
              onclick={() => navigateToLecture(lecture.slug)}
            >
              第{lecture.lectureNumber}回: {lecture.title}
            </button>
          </li>
        {/each}
      </ul>
    </nav>

    <section class="lecture-content">
      <h2>{currentLecture.title}</h2>

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
    padding: 30px;
    border-radius: 8px;
    margin-bottom: 30px;
    text-align: center;
  }

  header h1 {
    margin: 0 0 10px 0;
    font-size: 2.5em;
  }

  header p {
    margin: 0;
    font-size: 1.1em;
    opacity: 0.9;
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

  .lecture-nav {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .lecture-nav h2 {
    margin-top: 0;
  }

  .lecture-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .lecture-nav button {
    padding: 10px 20px;
    border: 2px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .lecture-nav button:hover {
    border-color: #667eea;
    color: #667eea;
  }

  .lecture-nav button.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .lecture-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .lecture-content h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #667eea;
    padding-bottom: 10px;
  }

  .assignments {
    margin-top: 30px;
  }
</style>
