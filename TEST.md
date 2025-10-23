# テスト手順

開発サーバーが起動しました！

## アクセス

ブラウザで以下のURLにアクセスしてください：
http://localhost:5173/python-grader-client/

## テスト項目

### 1. Hello World（パッケージ不要）

**URL**: http://localhost:5173/python-grader-client/lecture01-intro

**テストコード**:
```python
print("Hello, World!")
```

**期待される動作**:
- テスト実行ボタンを押す
- "✅ すべてのテストが合格しました！"と表示される
- パスワードが表示される（8文字の英数字）

### 2. if文（複数テストケース）

**URL**: http://localhost:5173/python-grader-client/lecture01-intro

**テストコード**:
```python
if x > 0:
    print("positive")
elif x < 0:
    print("negative")
else:
    print("zero")
```

**期待される動作**:
- 3つのテストケースすべてが合格
- パスワードが表示される

### 3. NumPy（パッケージ読み込みあり）

**URL**: http://localhost:5173/python-grader-client/lecture03-data-analysis

**テストコード**:
```python
import numpy as np
result = np.std(data)
```

**期待される動作**:
- "パッケージを読み込み中: numpy..." と表示される
- 初回は10-30秒程度かかる（numpyのダウンロード）
- テスト合格後、パスワードが表示される

### 4. Pandas（パッケージ読み込みあり）

**URL**: http://localhost:5173/python-grader-client/lecture04-visualization

**テストコード**:
```python
import pandas as pd
result = df['A'].mean()
```

**期待される動作**:
- "パッケージを読み込み中: pandas, numpy..." と表示される
- 初回は30-60秒程度かかる（pandasのダウンロード）
- テスト合格後、パスワードが表示される

## 確認ポイント

- [ ] 講義ナビゲーションが正しく表示される
- [ ] 各講義に課題フォームが表示される
- [ ] コードエディタにコードを入力できる
- [ ] テスト実行ボタンが機能する
- [ ] パッケージ不要な課題は高速に動作する
- [ ] パッケージ読み込み中の表示が出る
- [ ] テスト結果が正しく表示される
- [ ] すべてのテストが合格するとパスワードが表示される
- [ ] 失敗したテストケースの詳細が表示される

## デバッグ

もしエラーが発生した場合は、ブラウザの開発者ツール（F12）のConsoleタブを確認してください。
