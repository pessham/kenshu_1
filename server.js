const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = req.body.uploadType === 'material'
      ? 'uploads/materials/'
      : 'uploads/homework/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB制限
  },
  fileFilter: function (req, file, cb) {
    // 許可するファイル拡張子
    const allowedExts = ['.pdf', '.pptx', '.docx', '.txt', '.php', '.js', '.py', '.cs', '.vb', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('許可されていないファイル形式です'));
    }
  }
});

// データ保存先ディレクトリ
const DATA_DIR = './data';

// データディレクトリの初期化
async function initDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  // 初期ファイルの作成
  const files = [
    'materials.json',
    'homework_submissions.json',
    'feedback.json',
    'schedule.json'
  ];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    try {
      await fs.access(filePath);
    } catch {
      const initialData = file === 'schedule.json' ? { schedule: [] } :
                         file === 'materials.json' ? { materials: [] } : [];
      await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
    }
  }
}

// API: 資料一覧取得
app.get('/api/materials', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'materials.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('資料データの読み込みエラー:', error);
    res.status(500).json({ error: 'データの読み込みに失敗しました' });
  }
});

// API: 資料の追加（講師用）
app.post('/api/materials', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされませんでした' });
    }

    const material = {
      id: Date.now(),
      session: parseInt(req.body.session),
      title: req.body.title,
      type: req.body.type,
      format: path.extname(req.file.originalname).substring(1),
      size: (req.file.size / 1024).toFixed(0) + 'KB',
      url: '/uploads/materials/' + req.file.filename,
      description: req.body.description || '',
      uploadedAt: new Date().toISOString()
    };

    const filePath = path.join(DATA_DIR, 'materials.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

    if (!data.materials) {
      data.materials = [];
    }

    data.materials.push(material);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    res.json({ success: true, material });
  } catch (error) {
    console.error('資料アップロードエラー:', error);
    res.status(500).json({ error: 'アップロードに失敗しました' });
  }
});

// API: 宿題提出
app.post('/api/homework/submit', async (req, res) => {
  try {
    const submission = {
      ...req.body,
      id: Date.now(),
      submittedAt: new Date().toISOString()
    };

    const filePath = path.join(DATA_DIR, 'homework_submissions.json');
    let submissions = [];

    try {
      const data = await fs.readFile(filePath, 'utf8');
      submissions = JSON.parse(data);
    } catch (e) {
      // ファイルが存在しない場合は空配列
    }

    submissions.push(submission);
    await fs.writeFile(filePath, JSON.stringify(submissions, null, 2));

    // テキストファイルとしても保存
    const textFilePath = path.join(DATA_DIR, `homework_${submission.homeworkId}_${submission.id}.txt`);
    let textContent = `=================================================\n`;
    textContent += `宿題提出: 第${submission.homeworkId}回\n`;
    textContent += `提出日時: ${new Date(submission.submittedAt).toLocaleString('ja-JP')}\n`;
    textContent += `=================================================\n\n`;

    if (submission.data) {
      Object.entries(submission.data).forEach(([key, value]) => {
        if (value && typeof value === 'string' && key !== 'hasFile') {
          textContent += `[${key}]\n${value}\n\n`;
        }
      });
    }

    await fs.writeFile(textFilePath, textContent, 'utf8');

    res.json({ success: true, message: '提出が完了しました', submission });
  } catch (error) {
    console.error('宿題提出エラー:', error);
    res.status(500).json({ error: '提出に失敗しました' });
  }
});

// API: ファイルアップロード（宿題用）
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされませんでした' });
    }

    res.json({
      success: true,
      url: '/uploads/homework/' + req.file.filename,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    res.status(500).json({ error: 'アップロードに失敗しました' });
  }
});

// API: フィードバック送信
app.post('/api/feedback/submit', async (req, res) => {
  try {
    const feedback = {
      ...req.body,
      id: Date.now(),
      submittedAt: new Date().toISOString()
    };

    const filePath = path.join(DATA_DIR, 'feedback.json');
    let feedbacks = [];

    try {
      const data = await fs.readFile(filePath, 'utf8');
      feedbacks = JSON.parse(data);
    } catch (e) {
      // ファイルが存在しない場合は空配列
    }

    feedbacks.push(feedback);
    await fs.writeFile(filePath, JSON.stringify(feedbacks, null, 2));

    // テキストファイルとしても保存
    const textFilePath = path.join(DATA_DIR, `feedback_session${feedback.sessionId}_${feedback.id}.txt`);
    let textContent = `=================================================\n`;
    textContent += `研修フィードバック: 第${feedback.sessionId}回\n`;
    textContent += `提出日時: ${new Date(feedback.submittedAt).toLocaleString('ja-JP')}\n`;
    textContent += `氏名: ${feedback.name || '未記入'}\n`;
    textContent += `=================================================\n\n`;

    // 星評価
    textContent += `【評価】\n`;
    if (feedback.ratings) {
      textContent += `内容の理解しやすさ: ${'★'.repeat(feedback.ratings.understanding)}${'☆'.repeat(5 - feedback.ratings.understanding)} (${feedback.ratings.understanding}/5)\n`;
      textContent += `実務への活用度: ${'★'.repeat(feedback.ratings.usefulness)}${'☆'.repeat(5 - feedback.ratings.usefulness)} (${feedback.ratings.usefulness}/5)\n`;
      textContent += `時間配分の適切さ: ${'★'.repeat(feedback.ratings.time)}${'☆'.repeat(5 - feedback.ratings.time)} (${feedback.ratings.time}/5)\n`;
      textContent += `講師の説明の分かりやすさ: ${'★'.repeat(feedback.ratings.instructor)}${'☆'.repeat(5 - feedback.ratings.instructor)} (${feedback.ratings.instructor}/5)\n`;
    }
    textContent += `\n`;

    // コメント
    if (feedback.comments) {
      if (feedback.comments.positive) {
        textContent += `【良かった点】\n${feedback.comments.positive}\n\n`;
      }
      if (feedback.comments.improvement) {
        textContent += `【改善してほしい点】\n${feedback.comments.improvement}\n\n`;
      }
      if (feedback.comments.requests) {
        textContent += `【次回以降で学びたいこと】\n${feedback.comments.requests}\n\n`;
      }
      if (feedback.comments.other) {
        textContent += `【その他のご意見】\n${feedback.comments.other}\n\n`;
      }
    }

    await fs.writeFile(textFilePath, textContent, 'utf8');

    res.json({ success: true, message: 'フィードバックを受け付けました' });
  } catch (error) {
    console.error('フィードバック送信エラー:', error);
    res.status(500).json({ error: 'フィードバックの送信に失敗しました' });
  }
});

// API: フィードバック一覧取得（講師用）
app.get('/api/feedback', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'feedback.json'), 'utf8');
    const feedbacks = JSON.parse(data);

    // 匿名フィードバックの処理
    const processedFeedbacks = feedbacks.map(fb => {
      if (fb.anonymous) {
        return { ...fb, userId: '匿名' };
      }
      return fb;
    });

    res.json(processedFeedbacks);
  } catch (error) {
    console.error('フィードバック取得エラー:', error);
    res.status(500).json({ error: 'データの読み込みに失敗しました' });
  }
});

// API: 宿題提出一覧取得（講師用）
app.get('/api/homework/submissions', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'homework_submissions.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('提出データ取得エラー:', error);
    res.status(500).json({ error: 'データの読み込みに失敗しました' });
  }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('エラー:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます（最大10MB）' });
    }
  }

  res.status(500).json({
    error: err.message || 'サーバーエラーが発生しました'
  });
});

// サーバー起動
async function startServer() {
  try {
    // データディレクトリの初期化
    await initDataDir();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 AI活用研修ポータル サーバー起動                          ║
║                                                                ║
║   URL: http://localhost:${PORT}                                  ║
║                                                                ║
║   利用可能なページ:                                            ║
║   - http://localhost:${PORT}/index.html (トップページ)           ║
║   - http://localhost:${PORT}/materials.html (資料)              ║
║   - http://localhost:${PORT}/meta-prompt.html (メタプロンプト)   ║
║   - http://localhost:${PORT}/homework.html (宿題)               ║
║   - http://localhost:${PORT}/feedback.html (感想)               ║
║                                                                ║
║   API エンドポイント:                                          ║
║   - GET  /api/materials                                        ║
║   - POST /api/homework/submit                                  ║
║   - POST /api/feedback/submit                                  ║
║   - POST /api/upload                                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

startServer();
