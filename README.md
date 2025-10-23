# Python Auto Grader Client

大学のMOOC課題提出を補完する、初学者向けのPythonプログラム自動採点サイトです。

## 特徴

- クライアントサイド完結（Pyodide使用）
- テストケースが通るとパスワードを表示
- パスワードは難読化（AES暗号化）
- GitHub Pagesで自動デプロイ
- YAMLで課題を簡単に管理

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 課題の追加

`assignments/` ディレクトリに新しいYAMLファイルを作成します。

### YAML形式

```yaml
lectureNumber: 1
slug: lecture01-intro
title: 第1回：Python入門

assignments:
  - id: hello-world
    title: Hello Worldを出力する
    tests:
      - preCode: ""
        postCode: ""
        expected: "Hello, World!"

  - id: if-statement
    title: if文を使う
    tests:
      - preCode: "x = 10"
        postCode: ""
        expected: "positive"
      - preCode: "x = -5"
        postCode: ""
        expected: "negative"

  # NumPyやPandasが必要な課題の例
  - id: numpy-example
    title: NumPy配列の操作
    packages: ["numpy"]  # 必要なパッケージを指定
    tests:
      - preCode: |
          import numpy as np
          arr = np.array([1, 2, 3, 4, 5])
        postCode: "print(result)"
        expected: "3.0"
```

### フィールド説明

- `lectureNumber`: 講義番号
- `slug`: URL用のslug（例: `/lecture01-intro`）
- `title`: 講義タイトル
- `assignments`: 課題の配列
  - `id`: 課題の一意なID
  - `title`: 課題タイトル
  - `packages`: (オプション) 必要なPythonパッケージのリスト（例: `["numpy", "pandas"]`）
  - `tests`: テストケースの配列
    - `preCode`: 学生コードの前に実行するコード
    - `postCode`: 学生コードの後に実行するコード
    - `expected`: 期待される標準出力

### 対応パッケージ

Pyodideが対応している主要なパッケージ：
- `numpy` - 数値計算
- `pandas` - データ分析
- `matplotlib` - グラフ描画
- `scipy` - 科学計算
- `scikit-learn` - 機械学習

**注意**: パッケージの初回読み込みには時間がかかる場合があります（特にnumpyやpandasは数MB〜数十MBあるため）。

## ビルド

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## デプロイ

GitHub Pagesへの自動デプロイが設定されています。

1. GitHubリポジトリを作成
2. コードをpush
3. リポジトリの Settings > Pages で Source を "GitHub Actions" に設定
4. `main` ブランチにpushすると自動デプロイされます

### ベースパスの設定

`vite.config.js` の `base` をリポジトリ名に合わせて変更してください：

```javascript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
});
```

## URL構造

- `/lecture01-intro` - 第1回の課題ページ
- `/lecture02-functions` - 第2回の課題ページ
- など

各ページには、その回の全課題が列挙されます。

## 対応している機能

- 標準出力のチェック
- ファイル入出力（仮想ファイルシステム）
- NumPy, Pandas などの科学計算ライブラリ
- 複数テストケース

## 技術スタック

- **フロントエンド**: Svelte
- **ビルドツール**: Vite
- **Python実行**: Pyodide (WebAssembly)
- **暗号化**: CryptoJS
- **課題管理**: YAML
- **デプロイ**: GitHub Pages + GitHub Actions
