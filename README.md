# カレンダー共有アプリ

Cloudflare Pages + KV で動作するカレンダー共有アプリです。

## 🚀 最も簡単なセットアップ（コマンド不要）

### 1. GitHubにアップロード
1. GitHub.com で新しいリポジトリを作成
2. すべてのファイルをアップロード

### 2. Cloudflare Pagesに接続
1. Cloudflare Dashboard → Pages → Connect to Git
2. GitHubリポジトリを選択してデプロイ

### 3. KVストレージを設定
1. Workers & Pages → KV → Create namespace: `CALENDAR_KV`
2. Pages → Settings → Functions → KV bindings を追加
   - Variable name: `CALENDAR_KV`
   - KV namespace: 作成したnamespaceを選択

### 4. 完了！
あなたのカレンダーアプリが `https://your-app.pages.dev` で利用可能になります。

## 📁 必要なファイル

```
├── index.html              # メインHTML
├── styles.css              # スタイル
├── script-db.js           # JavaScript
├── functions/api/events.js # API（KV使用）
├── _headers               # CORS設定
└── README.md              # このファイル
```

## 🔧 機能

- ✅ カレンダー表示（1ヶ月後まで）
- ✅ イベント作成・編集・削除
- ✅ Cloudflare KVでデータ永続化
- ✅ オフライン対応
- ✅ レスポンシブデザイン
- ✅ 20色のカラー選択

**コマンド一切不要！** ブラウザだけで完結します。