# クイックスタートガイド

AI活用研修ポータルサイトをすぐに使い始めるための手順です。

## 🚀 3ステップで起動

### 1. 依存パッケージをインストール

```bash
npm install
```

### 2. サーバーを起動

```bash
npm start
```

### 3. ブラウザでアクセス

```
http://localhost:3000
```

## 📱 主な機能の使い方

### メタプロンプト生成ツール

1. [http://localhost:3000/meta-prompt.html](http://localhost:3000/meta-prompt.html) にアクセス
2. テンプレートを選ぶか、11の質問に回答
3. 「メタプロンプトを生成」をクリック
4. 「クリップボードにコピー」してChatGPT/Claudeに貼り付け

### 宿題の提出

1. [http://localhost:3000/homework.html](http://localhost:3000/homework.html) にアクセス
2. 該当する研修回のフォームに入力
3. 「提出する」をクリック

### フィードバック送信

1. [http://localhost:3000/feedback.html](http://localhost:3000/feedback.html) にアクセス
2. 研修回を選択
3. 星評価と感想を入力
4. 「フィードバックを送信」をクリック

## 🛠️ トラブルシューティング

### ポート3000が使用中の場合

環境変数でポートを変更:

```bash
PORT=8080 npm start
```

### Node.jsがインストールされていない

[Node.js公式サイト](https://nodejs.org/)からダウンロードしてインストール

## 📋 推奨環境

- Node.js: v18以上
- ブラウザ: Chrome, Firefox, Safari, Edge（最新版）
- 画面解像度: 1024x768以上（スマートフォンでも動作します）

## 💡 開発モード

ファイル変更時に自動リロード:

```bash
npm run dev
```

※ 事前に `npm install -D nodemon` が必要

## 📞 サポート

問題が発生した場合は、研修担当者までご連絡ください。
