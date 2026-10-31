---
id: BLOG-026
status: active
type: enhancement
depends_on: [BLOG-024, BLOG-025]
---

# 日英公開契約に合わせて移行用のテストと表示分岐を整理する

## 問題

test-bilingual.mjsは英語原稿があると停止し、英語原稿を除いても日英ペア必須の契約と衝突する。画面には契約検査後には成立しない対応版欠落の分岐が残っている。

## 意図

日英同時公開を前提に、回帰検証と表示を必要十分な構造にそろえる。

## 受け入れ条件

- [x] 既存原稿・成果物を変更せず、隔離した日英ペアfixtureで回帰テストを実行できる。
- [x] 検索・言語切替・一覧復帰・RSS・llms.txt・Markdown・メタ情報とloader異常系を検証する。
- [x] 対応版欠落の探索・表示分岐を削除し、同slugの反対言語URLを生成する。一覧2ページ目以降のhreflang抑制を維持する。
- [x] ビルド、公開契約19ケース、日英回帰テスト、独立レビューを実施してコミットする。

## 対象外

- 翻訳本文・公開契約の変更
- develop/mainへのマージ、push、配備

## 品質境界

既存URL、言語内検索・復帰、同slug切替、翻訳注釈と原文リンクを維持する。欠落ペアは公開契約テストで拒否を確認し、画面テストに移行モードを追加しない。

## 実装メモ

ユーザー指示によりdevelop起点。コミットまで承認済み。Issueはマージ承認までactiveに留める。

## 設計判断

- 対応版の存在保証をloaderの公開契約検査へ集約し、表示側は同slug・反対言語からURLを生成する。BaseLayoutのalternateを必須にし、無効な切替表示も削除した。一覧のページ別hreflang条件は維持する。
- 回帰テストは一時ディレクトリへソースを複製し、日英11組へ置き換える。元checkoutを一時変更して復元する案より、失敗時にも原稿・distを保護できる境界を優先した。
- プレビューはAstroを直接起動して自動割当ポートを取得する。初回の固定ポート検証で検索件数が0となり、別プレビューを参照する可能性を排除するために変更した。修正後の回帰検証は成功した。

## レビュー指摘

- 独立review-orchestratorレビューは Looks acceptable、Blocking/Warning/Noteすべて0。公開契約境界、BaseLayoutの全呼び出し、同slug切替、ページ別hreflang、テストの隔離と検証経路を確認した。
- 専用ポート化の追加差分も独立レビューで指摘なし。起動失敗・タイムアウトの伝播とcleanupを確認し、ブラウザ回帰の再実行成功をもって完了とした。

## 完了記録

- 変更: 日英ペア前提の隔離回帰fixture、専用プレビュー、対応版探索・欠落表示分岐の削除、回帰確認手順の追記。
- 検証: npm run build成功（26ページ）。node scripts/test-publication-contract.mjs 全19ケース成功。PLAYWRIGHT_MODULE=/home/tome/likedPicsViewer/node_modules/playwright/index.mjs node scripts/test-bilingual.mjs成功（ビルド、検索・0件・クリア、切替・原文リンク、一覧復帰・言語状態分離、RSS、llms.txt、Markdown、メタ情報、loader異常系）。子プロセス・Chromiumの実行はsandbox外で実施。git diff --checkとIssue一覧検証成功。
- レビュー観点: 日英同時公開の保証と表示責務、既存原稿・distの保護、ブラウザが検証対象プレビューへ接続すること。独立レビュー完了、未解決指摘なし。
- 統合状態: コミットまで承認済み。developへのマージ承認待ちのためactiveに留める。
