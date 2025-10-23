# クイックスタートガイド

## 初回セットアップ（5分）

### 1. リポジトリをクローン

```bash
git clone <your-repo-url>
cd python-grader-client
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. パスワード一覧を確認

```bash
npm run show-passwords
```

表示されたパスワードをMOOCシステムに登録してください。

**注**: パスワードはassignmentのslugから自動生成されます。環境変数の設定は不要です。

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:5173/python-grader-client/ にアクセス

## 課題の追加

`assignments/` ディレクトリに新しいYAMLファイルを作成：

```yaml
lectureNumber: 5
slug: lecture05-new-topic
title: 第5回：新しいトピック

assignments:
  - id: new-task
    title: 新しい課題
    packages: []  # 必要なパッケージがあれば指定（例: ["numpy"]）
    tests:
      - preCode: ""
        postCode: ""
        expected: "Expected Output"
```

## GitHub Pagesにデプロイ

### 1. GitHub Pagesを有効化

1. Settings > Pages
2. Source を "GitHub Actions" に設定

### 2. デプロイ

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

自動的にビルド・デプロイされます！

## よくある質問

**Q: パスワードはどのように生成されますか？**
A: パスワードは各assignmentの `lectureSlug` と `assignmentId` から決定的に生成されます（30文字、大文字小文字数字記号を含む）。同じslugからは常に同じパスワードが生成されます。

**Q: 新しい課題を追加した**
A: `npm run show-passwords` で新しい課題のパスワードを確認し、MOOCに登録してください。

**Q: パスワードを変更したい**
A: assignmentの `slug` または `id` を変更すると、パスワードが変わります。変更後は必ず `npm run show-passwords` で新しいパスワードを確認し、MOOCに再登録してください。
