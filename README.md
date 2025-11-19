# AI活用研修ポータル

全5回のAI活用研修シリーズ用のWebポータルサイトです。
研修資料の配布、宿題の提出、メタプロンプト生成ツール、感想フォームなど、研修に関わるすべての機能を一元管理できます。

## 📋 機能一覧

### 受講者向け機能
- **トップページ**: 研修スケジュール一覧、進捗状況の可視化
- **資料ダウンロード**: 各回のスライド、台本、補足資料のダウンロード
- **メタプロンプト生成ツール**: 11の質問に答えて自分専用のメタプロンプトを自動生成
- **宿題提出**: 各回の課題をオンラインで提出
- **感想フォーム**: 星評価と自由記述でフィードバックを送信

### 講師向け機能（API経由）
- 資料のアップロード
- 宿題提出の確認
- フィードバックの閲覧

## 🚀 セットアップ

### 必要な環境
- Node.js v18以上
- npm または yarn

### インストール手順

1. **依存パッケージのインストール**
   ```bash
   npm install
   ```

2. **サーバーの起動**
   ```bash
   npm start
   ```

   または開発モード（自動リロード）:
   ```bash
   npm run dev
   ```

3. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

## 📁 プロジェクト構成

```
/
├── index.html              # トップページ
├── materials.html          # 資料ダウンロードページ
├── meta-prompt.html        # メタプロンプト生成ツール
├── homework.html           # 宿題提出ページ
├── feedback.html           # 感想フォームページ
├── server.js              # Express.jsサーバー
├── package.json           # Node.js設定
├── css/
│   ├── style.css          # 共通スタイル
│   └── components.css     # コンポーネントスタイル
├── js/
│   ├── main.js            # 共通JavaScript
│   └── meta-prompt.js     # メタプロンプト生成ロジック
├── data/
│   ├── materials.json     # 資料データ
│   ├── schedule.json      # 研修スケジュール
│   ├── homework_submissions.json  # 宿題提出データ
│   └── feedback.json      # フィードバックデータ
└── uploads/
    ├── materials/         # 研修資料ファイル
    └── homework/          # 宿題提出ファイル
```

## 🎯 利用可能なページ

- **トップページ**: http://localhost:3000/index.html
- **資料ダウンロード**: http://localhost:3000/materials.html
- **メタプロンプト生成**: http://localhost:3000/meta-prompt.html
- **宿題提出**: http://localhost:3000/homework.html
- **感想フォーム**: http://localhost:3000/feedback.html

## 🔌 API エンドポイント

### 資料管理
- `GET /api/materials` - 資料一覧の取得
- `POST /api/materials` - 資料のアップロード（講師用）

### 宿題管理
- `POST /api/homework/submit` - 宿題の提出
- `GET /api/homework/submissions` - 提出一覧の取得（講師用）

### フィードバック
- `POST /api/feedback/submit` - フィードバックの送信
- `GET /api/feedback` - フィードバック一覧の取得（講師用）

### その他
- `POST /api/upload` - ファイルアップロード
- `GET /api/health` - ヘルスチェック

## 💡 使い方

### メタプロンプト生成ツールの使い方

1. テンプレートを選択するか、11の質問に回答
2. 「メタプロンプトを生成」ボタンをクリック
3. 生成されたメタプロンプトをクリップボードにコピー
4. ChatGPTやClaudeに貼り付けて使用

### 宿題の提出

1. 該当する研修回の宿題セクションを開く
2. フォームに必要事項を入力
3. 「提出する」ボタンをクリック

### フィードバックの送信

1. 研修回を選択
2. 星評価と自由記述を入力
3. 匿名/記名を選択して送信

## 🎨 カスタマイズ

### カラーパレットの変更

`css/style.css`の`:root`セクションでカラー変数を変更できます:

```css
:root {
  --color-primary: #2C5F8D;
  --color-secondary: #F5A623;
  --color-success: #38A169;
  --color-warning: #E53E3E;
  /* ... */
}
```

### 研修スケジュールの更新

`data/schedule.json`を編集してスケジュールを更新できます。

## 📱 レスポンシブ対応

PC、タブレット、スマートフォンに対応しています。
ブレークポイント: 768px

## 🔒 セキュリティ

- ファイルアップロードは許可された拡張子のみ
- ファイルサイズ制限: 10MB
- XSS対策のため入力値のサニタイズを実施

## 🐛 トラブルシューティング

### サーバーが起動しない
- Node.jsのバージョンを確認: `node --version`
- ポート3000が既に使用されていないか確認

### ファイルアップロードができない
- `uploads/materials`と`uploads/homework`ディレクトリが存在するか確認
- ファイルサイズが10MB以下か確認

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

バグ報告や機能要望は、Issueでお知らせください。

## 📧 お問い合わせ

質問や不明点がある場合は、研修担当者までご連絡ください。
