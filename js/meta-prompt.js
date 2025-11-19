// メタプロンプト生成ロジック

// メタプロンプト生成関数
function generateMetaPrompt(formData) {
  const template = `# ${formData.role || 'エンジニア'}専用アシスタント設定

## あなたの役割
あなたは${formData.language || 'プログラミング'}に精通した${formData.role || 'エンジニア'}のアシスタントです。
${formData.goal ? formData.goal + 'をサポートします。' : ''}

## 私の業務コンテクスト

### 技術環境
${formData.language ? '- 言語/フレームワーク: ' + formData.language : ''}
${formData.database ? '- データベース/インフラ: ' + formData.database : ''}
${formData.tools ? '- 開発ツール: ' + formData.tools : ''}

### 制約条件
${formData.coding_rules ? '- コーディング規約: ' + formData.coding_rules : ''}
${formData.security ? '- セキュリティ/パフォーマンス要件: ' + formData.security : ''}
${formData.legacy ? '- 既存システムとの連携: ' + formData.legacy : ''}

### 業務スタイル
${formData.frequent_tasks ? '- よく依頼する作業: ' + formData.frequent_tasks : ''}
${formData.past_issues ? '- 過去の困りごと: ' + formData.past_issues : ''}
${formData.output_style ? '- 希望する回答スタイル: ' + formData.output_style : ''}

## 回答時の原則

1. **具体的で実用的な回答**
   - そのまま使えるコードを提供
   - エッジケースやエラー処理を含める
   - 実装可能な具体的な手順を示す

2. **品質とセキュリティ**
   - セキュリティリスクは必ず指摘
   - パフォーマンスを考慮した実装
   - ベストプラクティスに従う

3. **説明の充実**
   ${formData.output_style ? '- ' + formData.output_style : ''}
   - 実装の意図や理由を説明
   - 代替案がある場合は提示
   - トレードオフを明確に

## 出力形式

### コード提供時
\`\`\`
// 【処理の概要】
// 実装の意図や変更理由を説明

// コード本体
\`\`\`

### 説明時
1. 概要（何を解決するか）
2. 実装方法（具体的な手順）
3. 注意点・リスク
4. テスト方法

---

上記の設定を常に参照し、私の業務をサポートしてください。
  `.trim();

  // 空行を削除
  return template.split('\n').filter(line => {
    return line.trim() !== '' || line.includes('---');
  }).join('\n');
}

// テンプレートデータ
const templates = {
  'web-developer': {
    role: 'Webアプリケーション開発者',
    goal: '開発スピード向上、コード品質改善',
    language: 'PHP (Laravel 10)',
    database: 'MySQL 8.0',
    tools: 'Visual Studio Code, Git',
    coding_rules: 'PSR-12準拠、命名規則はキャメルケース',
    security: 'SQLインジェクション対策必須、XSS対策必須、CSRF対策',
    legacy: 'レガシーPHPシステムとAPI連携あり',
    frequent_tasks: 'バリデーション実装、エラーハンドリング、API設計',
    past_issues: '一般的すぎる回答、セキュリティ考慮が不足',
    output_style: 'コードには必ずコメント、変更理由を説明、段階的な実装手順'
  },
  'system-maintenance': {
    role: 'システム保守・仕様書作成担当',
    goal: '仕様の整理と言語化、ドキュメント作成効率化',
    language: 'VB.NET (.NET 8)',
    database: 'SQL Server',
    tools: 'Visual Studio 2022',
    coding_rules: '社内命名規則（パスカルケース）、ハンガリアン記法',
    security: '既存システムとの互換性維持、データ移行時の整合性',
    legacy: 'VB6システムとの連携あり、COM+コンポーネント使用',
    frequent_tasks: '既存コードの解析、仕様書作成、リファクタリング提案',
    past_issues: '古い技術の知識不足、複雑な仕様の整理方法',
    output_style: '段階的な説明、図解での理解サポート、初心者にも分かりやすく'
  },
  'data-analyst': {
    role: 'データアナリスト',
    goal: 'データ分析の効率化、レポート作成の自動化',
    language: 'Python (pandas, numpy), SQL',
    database: 'PostgreSQL, BigQuery',
    tools: 'Jupyter Notebook, VS Code',
    coding_rules: 'PEP 8準拠、型ヒント使用',
    security: '個人情報の取り扱い、データマスキング',
    legacy: 'Excelマクロとの連携、既存BIツールとの統合',
    frequent_tasks: 'データクレンジング、統計分析、可視化、レポート生成',
    past_issues: 'パフォーマンス問題、メモリ不足、データ品質',
    output_style: '分析結果の解釈、ビジネス視点での説明、再現可能なコード'
  }
};

// テンプレート読み込み
function loadTemplate(templateName) {
  const data = templates[templateName];
  if (!data) return;

  Object.keys(data).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      element.value = data[key];
    }
  });

  showToast('テンプレートを読み込みました');
}

// フォーム送信処理
function handleGenerate(event) {
  if (event) event.preventDefault();

  const form = document.getElementById('meta-prompt-form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // 必須項目チェック（言語/フレームワークは推奨）
  if (!data.language) {
    if (!confirm('言語/フレームワークが未入力です。このまま生成しますか？')) {
      return;
    }
  }

  const metaPrompt = generateMetaPrompt(data);

  // プレビュー表示
  document.getElementById('preview-text').textContent = metaPrompt;
  document.getElementById('preview-section').style.display = 'block';

  // スクロール
  document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });

  showToast('メタプロンプトを生成しました！');
}

// クリップボードにコピー
function copyToClipboard() {
  const text = document.getElementById('preview-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('クリップボードにコピーしました！');
  }).catch(err => {
    console.error('コピーに失敗しました:', err);
    showToast('コピーに失敗しました', 'warning');
  });
}

// テキストファイルでダウンロード
function downloadAsText() {
  const text = document.getElementById('preview-text').textContent;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'メタプロンプト.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('ダウンロードを開始しました');
}

// 編集モードに戻る
function editAgain() {
  document.getElementById('preview-section').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 下書き保存
function saveDraft() {
  const form = document.getElementById('meta-prompt-form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  storage.set('metaPromptDraft', data);
  storage.set('metaPromptDraftDate', new Date().toISOString());

  showToast('下書きを保存しました');
}

// 下書き読み込み
function loadDraft() {
  const draft = storage.get('metaPromptDraft');
  const draftDate = storage.get('metaPromptDraftDate');

  if (!draft) {
    showToast('保存された下書きがありません', 'warning');
    return;
  }

  const dateStr = draftDate ? formatDate(draftDate) : '不明';
  if (!confirm(`下書き（保存日時: ${dateStr}）を読み込みますか？\n現在の入力内容は上書きされます。`)) {
    return;
  }

  Object.keys(draft).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      element.value = draft[key];
    }
  });

  showToast('下書きを読み込みました');
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  // テンプレートボタンのイベント設定
  document.querySelectorAll('.btn-template').forEach(btn => {
    btn.addEventListener('click', function() {
      const template = this.dataset.template;
      loadTemplate(template);
    });
  });

  // フォーム送信
  document.getElementById('generate-btn').addEventListener('click', handleGenerate);

  // プレビューアクション
  document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
  document.getElementById('download-txt-btn').addEventListener('click', downloadAsText);
  document.getElementById('edit-btn').addEventListener('click', editAgain);

  // 下書き機能
  document.getElementById('save-draft-btn').addEventListener('click', saveDraft);
  document.getElementById('load-draft-btn').addEventListener('click', loadDraft);
});
