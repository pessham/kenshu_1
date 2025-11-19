# デプロイメントガイド

AI活用研修ポータルを本番環境にデプロイする方法です。

## 🚀 デプロイ先の選択肢

### オプション1: Heroku（推奨・無料プランあり）

**メリット:**
- 簡単なデプロイ
- 無料プランあり
- SSL/HTTPSが自動

**手順:**

1. Herokuアカウント作成
   ```bash
   # Heroku CLIのインストール
   brew install heroku/brew/heroku  # macOS
   # または https://devcenter.heroku.com/articles/heroku-cli
   ```

2. ログインとアプリ作成
   ```bash
   heroku login
   heroku create ai-training-portal
   ```

3. Procfileの作成
   ```bash
   echo "web: node server.js" > Procfile
   ```

4. デプロイ
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

5. アクセス
   ```
   https://ai-training-portal.herokuapp.com
   ```

### オプション2: Vercel（フロントエンド特化）

**メリット:**
- 超高速デプロイ
- 自動HTTPS
- GitHubと連携

**注意:** バックエンド機能が制限されるため、Serverless Functions化が必要

**手順:**

1. Vercelアカウント作成: https://vercel.com

2. Vercel CLIインストール
   ```bash
   npm install -g vercel
   ```

3. デプロイ
   ```bash
   vercel
   ```

### オプション3: AWS（本格運用）

**メリット:**
- スケーラビリティ
- 細かい制御

**推奨構成:**
- EC2インスタンス（t2.micro - 無料枠あり）
- RDS（本番データベース）
- S3（ファイルストレージ）

**手順:**

1. EC2インスタンス起動（Ubuntu Server）

2. SSHでログイン
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. Node.jsインストール
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. プロジェクトデプロイ
   ```bash
   git clone your-repository
   cd ai-training-portal
   npm install
   npm start
   ```

5. PM2でプロセス管理（推奨）
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "ai-portal"
   pm2 startup
   pm2 save
   ```

## 🔧 環境変数の設定

本番環境では環境変数を使用:

**.env ファイル作成:**
```env
PORT=3000
NODE_ENV=production
UPLOAD_DIR=./uploads
DATA_DIR=./data
MAX_FILE_SIZE=10485760
```

**server.js の修正:**
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

## 🔒 本番環境のセキュリティ強化

### 1. HTTPS の有効化

**Heroku**: 自動的に有効
**Vercel**: 自動的に有効
**AWS/自前サーバー**: Let's Encrypt を使用

```bash
# Certbotのインストール
sudo apt-get install certbot
sudo certbot --nginx -d your-domain.com
```

### 2. 環境変数でシークレットを管理

```javascript
// パスワード認証の追加例
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
  users: {
    [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD
  },
  challenge: true
}));
```

### 3. レート制限の追加

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 100リクエスト/15分
});

app.use('/api/', limiter);
```

### 4. ヘルメットでセキュリティヘッダー追加

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 📊 データベースへの移行（オプション）

現在はJSONファイルを使用していますが、本番環境ではデータベースを推奨:

### PostgreSQL への移行

1. **パッケージインストール**
   ```bash
   npm install pg
   ```

2. **データベース接続**
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

3. **テーブル作成**
   ```sql
   CREATE TABLE homework_submissions (
     id SERIAL PRIMARY KEY,
     homework_id INTEGER,
     user_id VARCHAR(100),
     submitted_at TIMESTAMP,
     data JSONB
   );

   CREATE TABLE feedback (
     id SERIAL PRIMARY KEY,
     session_id INTEGER,
     ratings JSONB,
     comments JSONB,
     anonymous BOOLEAN,
     submitted_at TIMESTAMP
   );
   ```

## 🔄 継続的デプロイ（CI/CD）

### GitHub Actionsの設定

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "ai-training-portal"
          heroku_email: "your-email@example.com"
```

## 📈 モニタリング

### 1. ログ管理

**Heroku:**
```bash
heroku logs --tail
```

**PM2:**
```bash
pm2 logs ai-portal
```

### 2. エラートラッキング

Sentryの導入:
```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### 3. アップタイム監視

- UptimeRobot（無料）: https://uptimerobot.com
- Pingdom
- StatusCake

## 🎯 チェックリスト

デプロイ前の確認事項:

- [ ] 環境変数の設定
- [ ] データベース接続テスト（使用する場合）
- [ ] ファイルアップロードディレクトリの権限確認
- [ ] HTTPS の有効化
- [ ] セキュリティヘッダーの設定
- [ ] エラーハンドリングの確認
- [ ] ログ設定
- [ ] バックアップ体制の構築

## 🔧 トラブルシューティング

### アップロードファイルが保存されない

**原因:** ディレクトリの権限不足

**解決:**
```bash
chmod 755 uploads/materials
chmod 755 uploads/homework
```

### ポート関連のエラー

**原因:** 環境変数 PORT が設定されていない

**解決:**
```javascript
const PORT = process.env.PORT || 3000;
```

### メモリ不足エラー

**原因:** ファイルサイズが大きすぎる

**解決:**
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

## 📞 サポート

デプロイで問題が発生した場合:
1. ログを確認
2. エラーメッセージを検索
3. 公式ドキュメントを参照
4. コミュニティフォーラムで質問

---

**デプロイの成功を祈っています！** 🚀
