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

### 3. 環境変数を設定

```bash
cp .env.example .env
```

`.env` ファイルを開いて、暗号化キーを設定：

```env
GRADER_ENCRYPTION_KEY=my-unique-secret-key-2024
```

**重要**: このキーは変更しないでください！パスワードがこのキーから生成されます。

### 4. パスワード一覧を確認

```bash
npm run show-passwords
```

表示されたパスワードをMOOCシステムに登録してください。

### 5. 開発サーバーを起動

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

### 1. GitHub Secretsに暗号化キーを設定

1. GitHubリポジトリの Settings > Secrets and variables > Actions
2. "New repository secret" をクリック
3. 名前: `GRADER_ENCRYPTION_KEY`
4. 値: `.env` ファイルと同じ値を入力

### 2. GitHub Pagesを有効化

1. Settings > Pages
2. Source を "GitHub Actions" に設定

### 3. デプロイ

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

自動的にビルド・デプロイされます！

## よくある質問

**Q: パスワードを変更したい**
A: 暗号化キーを変更すると、すべてのパスワードが変わります。変更後は必ず `npm run show-passwords` で新しいパスワードを確認し、MOOCに再登録してください。

**Q: 新しい課題を追加した**
A: `npm run show-passwords` で新しい課題のパスワードを確認し、MOOCに登録してください。

**Q: ビルドエラーが出る**
A: `GRADER_ENCRYPTION_KEY` 環境変数が設定されているか確認してください。GitHub Actionsの場合は、Secretsに登録されているか確認してください。
