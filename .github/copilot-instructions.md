# Copilot / AI エージェント向け — プロジェクト要点

このファイルは、リポジトリに新しく入るAI支援エージェント（Copilot 系）が素早く生産的になるための、プロジェクト固有の実装メモを示します。行動は「発見可能な事実」のみに基づきます。

**概要**
- **目的**: AI活用研修ポータル（静的フロント + 小さな Express API）。フロントはHTML/CSS/JS、サーバーは`server.js`でデータはローカルの`data/*.json`に保存されます。
- **起動コマンド**: `npm install` → `npm start`（本番） / `npm run dev`（開発、`nodemon`使用）。Node.js >= 18 が必要です（`package.json`参照）。

**重要ファイル・場所**
- **`server.js`**: Express エントリ。主要なAPIエンドポイント（`/api/materials`, `/api/homework/submit`, `/api/feedback/submit`, `/api/upload`, `/api/health`）とファイルアップロードロジックを実装。
- **`data/`**: JSONベースの永続化。例: `materials.json`, `homework_submissions.json`, `feedback.json`, `schedule.json`.
- **`uploads/`**: 実ファイル保存。`uploads/materials/` と `uploads/homework/` を使う。
- **`js/`**: フロントロジック。共通コードは `js/main.js`、メタプロンプトは `js/meta-prompt.js`（UI側の振る舞いを確認する際に参照）。
- **HTMLページ**: ルートに静的な `index.html`, `materials.html`, `meta-prompt.html`, `homework.html`, `feedback.html` がある。

**実装上の重要ポイント / パターン**
- **ローカルJSONを単一ソース**: DBはなく、`server.js` が `fs.readFile` / `fs.writeFile` で JSON ファイルを直接更新する。変更を加える際はファイルの存在チェックと配列初期化ロジックに注意。
- **アップロード先はリクエストに依存**: `multer.diskStorage` の `destination` は `req.body.uploadType === 'material'` をチェックするため、フロント側フォームの `uploadType` を壊さないこと。
- **ファイル制約**: 許可拡張子は `server.js` 内の `allowedExts` に列挙（注: `.php`, `.js` 等も許可されている）。ファイルサイズ上限は 10MB。これらはセキュリティや整合性に関係するため、変更時は理由を明記する。
- **テキスト出力の副作用**: 宿題/フィードバック受信時に、サーバーは `data/` に JSON を追加するだけでなく、テキストファイル（例: `homework_<id>.txt`）も生成する。変更するとログ/保存結果に影響。
- **静的配信**: `app.use(express.static('.'))` によりリポジトリルートが静的コンテンツとして提供される。HTML ルートのパスはそのまま URL になる。

**作業時の推奨フロー（AIがコードを書くとき）**
- **小さく、可逆的に変更**: まず `server.js` のコピーやローカルでのテストを推奨。既存 JSON を壊すと手元で観察しづらくなる。
- **既存エンドポイントに合わせる**: フロントから呼ばれている API の型を変える場合、対応する HTML/JS 側（`meta-prompt.js`、フォーム）も同時に更新する。
- **起動して動作確認**: `npm run dev` で変更の影響を実際にブラウザから検証。API のテストは `curl` や Postman で行う。

**よくある変更箇所と注意**
- **新しいファイル種別のアップロードを許可する**: `allowedExts` と `fileFilter` を更新する必要あり。セキュリティ観点の説明をコミットメッセージに含めること。
- **JSON スキーマの変更**: 既存の配列構造（例: `data.materials`）を壊すとフロントが誤動作するため、マイグレーション手順をREADMEに書くか、互換レイヤを作る。
- **パスの取り扱い**: `url` フィールドは `/uploads/...` の相対URLを返す。フロントではこれをそのままリンクに使っている。

**チェックリスト（PR作成時）**
- **動作確認**: `npm run dev` でサーバー起動 → フロントページを開き主要機能（資料一覧、宿題提出、フィードバック）を簡易確認。
- **データ整合性**: `data/*.json` に新規エントリが追加されることを確認。既存配列が壊れていないか確認。
- **静的ファイル動作**: 画像やアップロードファイルが `uploads/` から直接配信されることを確認。

---
もしこのファイルのどの点が不明瞭か、または追加で含めてほしい具体的な作業フロー（例: ローカルテストのcurlコマンド、CI手順など）があれば教えてください。更新してマージします。
