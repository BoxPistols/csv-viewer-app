# CSV Viewer 📊

CSVファイルを美しく表示・分析するための無料Webアプリケーション

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BoxPistols/csv-viewer-app)

---

## ✨ 特徴

- 🔒 **完全クライアントサイド** - データはブラウザ内のみで処理、外部送信なし
- 🚀 **高速** - ローカル処理のため応答が速い
- 🎨 **モダンUI** - Tailwind CSSによる美しいデザイン
- 🌙 **ダークモード対応** - 目に優しいダークテーマ、自動システム設定検出
- 🧩 **モジュラーアーキテクチャ** - 9つの再利用可能なUIコンポーネント
- ⌨️ **キーボードショートカット** - パワーユーザー向けの効率的な操作
- ♿ **アクセシブル** - ARIA対応、スクリーンリーダー対応
- 📱 **レスポンシブ** - PC、タブレットで快適に使用可能
- 🧪 **テスト済み** - 13個の自動テストで品質保証
- ⚡ **パフォーマンス最適化** - React.memo、useMemo、useCallbackによる最適化

---

## 🚀 クイックスタート

### オンラインで使用

👉 **[https://csv-viewer-app.vercel.app](https://csv-viewer-app.vercel.app)**

### ローカルで起動

```bash
# リポジトリのクローン
git clone https://github.com/BoxPistols/csv-viewer-app.git
cd csv-viewer-app

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

開発サーバーは http://localhost:5173 で起動します。

---

## 📖 ドキュメント

### 📘 [ユーザーガイド](./USER_GUIDE.md)
エンドユーザー向けの使い方マニュアル
- CSVファイルのアップロード方法
- 基本機能の使い方
- キーボードショートカット
- よくある質問 (FAQ)
- トラブルシューティング

### 🛠️ [開発者ガイド](./DEVELOPER_GUIDE.md)
開発者向けの技術ドキュメント
- セットアップ手順
- アーキテクチャ解説
- 主要機能の実装詳細
- テスト戦略
- デプロイ方法

---

## 🎯 主な機能

### データ表示
- ✅ **テーブルビュー** - スプレッドシート風の表示
- ✅ **JSONビュー** - JSON形式で表示
- ✅ **フルスクリーンモード** - 全画面表示

### データ操作
- 🔍 **検索** - 全列または特定列での検索
- 🔄 **ソート** - 昇順/降順でソート
- 📄 **ページネーション** - 大量データも快適に閲覧
- 🎛️ **列管理** - 表示/非表示、並べ替え、幅調整

### エクスポート
- 💾 **JSON保存** - JSON形式でエクスポート
- 💾 **CSV保存** - CSV形式でエクスポート
- 📋 **クリップボードコピー** - JSONデータをコピー

### ユーザビリティ
- ⌨️ **キーボードショートカット** - 7種類のショートカット
- 🖱️ **ドラッグ&ドロップ** - ファイルをドラッグして読み込み
- 💡 **ツールチップ** - セルの内容全体を表示
- 🎨 **カスタマイズ** - 列幅、表示件数など
- 🌙 **ダークモード** - ライト/ダーク自動切替、設定永続化

---

## 🔧 技術スタック

### コア技術
- **React 19** - UIライブラリ
- **Vite 6** - ビルドツール
- **Tailwind CSS 3** - CSSフレームワーク（ダークモード対応）
- **PapaParse 5** - CSV解析

### 開発ツール
- **Vitest 4** - テストフレームワーク
- **React Testing Library** - コンポーネントテスト
- **ESLint 9** - コード品質管理

### アーキテクチャパターン
- **カスタムHooks** - useCSVParser, useDarkMode, useKeyboardShortcuts など
- **Context API** - ThemeContext によるグローバル状態管理
- **コンポーネント分割** - 9つのUIコンポーネント
- **パフォーマンス最適化** - React.memo, useMemo, useCallback

---

## 🧪 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルドのプレビュー
npm run preview

# テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# リンター実行
npm run lint
```

---

## 📊 テスト状況

```
✅ 13/13 tests passing
✅ Build successful
✅ Linter clean (0 errors)
```

### テストカバレッジ
- 基本レンダリング: 10 tests
- ファイルバリデーション: 1 test
- アクセシビリティ: 2 tests

---

## ⌨️ キーボードショートカット

| ショートカット | 機能 |
|---------------|------|
| `Ctrl/Cmd + O` | ファイルを開く |
| `Ctrl/Cmd + F` | 検索ボックスにフォーカス |
| `Ctrl/Cmd + E` | JSONエクスポート |
| `Ctrl/Cmd + S` | CSVエクスポート |
| `Ctrl/Cmd + K` | サンプルデータ表示 |
| `← →` | ページ移動 |
| `Esc` | エラーメッセージを閉じる |

---

## 📋 ファイル要件

| 項目 | 要件 |
|------|------|
| **ファイル形式** | `.csv` のみ |
| **最大サイズ** | 50MB |
| **文字コード** | UTF-8 (推奨) |
| **最大行数** | 5,000行 (それ以上は最初の5,000行のみ) |

---

## 🛡️ セキュリティ

### データの取り扱い
- ✅ すべての処理がブラウザ内で完結
- ✅ ファイルが外部サーバーに送信されることはありません
- ✅ データはローカルストレージに設定のみ保存

### エラーハンドリング
- ✅ ファイルサイズバリデーション (50MB)
- ✅ ファイルタイプチェック (.csv)
- ✅ 空ファイル検出
- ✅ CSV解析エラーの詳細表示
- ✅ FileReaderエラーハンドリング

---

## 🤝 コントリビューション

コントリビューションを歓迎します！

### 手順
1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

### 開発ガイドライン
- テストを書く（新機能には必須）
- ESLintルールに従う
- コミットメッセージは明確に
- ドキュメントを更新

詳細は [開発者ガイド](./DEVELOPER_GUIDE.md) を参照してください。

---

## 🐛 バグ報告・機能リクエスト

問題を発見した場合や新機能のリクエストは、[GitHub Issues](https://github.com/BoxPistols/csv-viewer-app/issues) でお知らせください。

### バグ報告に含める情報
- 使用ブラウザとバージョン
- エラーメッセージ（スクリーンショット推奨）
- 再現手順
- 期待される動作

---

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](./LICENSE) ファイルを参照してください。

---

## 👥 作者

- **BoxPistols** - [GitHub](https://github.com/BoxPistols)

---

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PapaParse](https://www.papaparse.com/)
- [Vitest](https://vitest.dev/)

---

## 📸 スクリーンショット

### テーブルビュー
![Table View](./docs/images/table-view.png)

### JSONビュー
![JSON View](./docs/images/json-view.png)

### キーボードショートカット案内
![Keyboard Shortcuts](./docs/images/keyboard-shortcuts.png)

---

## 🔗 関連リンク

- [デモサイト](https://csv-viewer-app.vercel.app)
- [ユーザーガイド](./USER_GUIDE.md)
- [開発者ガイド](./DEVELOPER_GUIDE.md)
- [GitHub Issues](https://github.com/BoxPistols/csv-viewer-app/issues)
- [GitHub Discussions](https://github.com/BoxPistols/csv-viewer-app/discussions)

---

**Made with ❤️ by BoxPistols**
