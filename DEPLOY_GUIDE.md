# デプロイガイド

## 🚀 Renderでのデプロイ（推奨・無料）

### 手順

1. **Renderにアクセス**
   - https://render.com にアクセス
   - GitHubアカウントでサインアップ/ログイン

2. **新しいWebサービスを作成**
   - ダッシュボードで「New +」→「Web Service」をクリック
   - GitHubリポジトリ `pessham/kenshu_1` を選択

3. **設定**
   - **Name**: `ai-training-portal`（または任意の名前）
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **デプロイ**
   - 「Create Web Service」をクリック
   - 自動的にデプロイが開始されます
   - 数分でデプロイ完了

5. **アクセス**
   - デプロイ完了後、`https://ai-training-portal.onrender.com` のようなURLが発行されます

## 📝 Herokuでのデプロイ

### 手順

1. **Heroku CLIのインストール**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **ログイン**
   ```bash
   heroku login
   ```

3. **アプリ作成**
   ```bash
   heroku create ai-training-portal
   ```

4. **デプロイ**
   ```bash
   git push heroku main
   ```

5. **アクセス**
   ```bash
   heroku open
   ```

## ⚙️ Vercelでのデプロイ（フロントエンド向け）

**注意**: Vercelはサーバーレス環境のため、ファイルアップロード機能に制限があります。

1. **Vercel CLIのインストール**
   ```bash
   npm install -g vercel
   ```

2. **デプロイ**
   ```bash
   vercel
   ```

## 🔧 環境変数（必要に応じて設定）

デプロイ先で以下の環境変数を設定できます：

- `PORT`: ポート番号（デフォルト: 3000）
- `NODE_ENV`: 環境（production）

## 📊 デプロイ後の確認

デプロイ完了後、以下をチェック：

1. ✅ トップページが表示される
2. ✅ 資料ページで第1回のPDFが表示される
3. ✅ メタプロンプト生成ツールが動作する
4. ✅ 宿題提出フォームが表示される
5. ✅ フィードバックフォームが表示される

## 🐛 トラブルシューティング

### ポートエラー
```
Error: Port already in use
```
→ 環境変数 `PORT` が正しく設定されているか確認

### ファイルアップロードエラー
```
Error: ENOENT: no such file or directory
```
→ `uploads/` ディレクトリの権限を確認

### モジュールエラー
```
Error: Cannot find module 'express'
```
→ `npm install` が正しく実行されたか確認

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください：
https://github.com/pessham/kenshu_1/issues
