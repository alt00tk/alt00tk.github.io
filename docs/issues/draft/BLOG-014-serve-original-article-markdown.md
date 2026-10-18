---
id: BLOG-014
status: draft
type: feature
depends_on: []
---

# 記事のMarkdown原文を配信する

## 問題

記事の正本は `src/content/blog` 以下のMarkdownだが、公開サイトで読めるのは描画済みのHTMLであり、AIやテキスト処理ツールから原文を直接取得するURLがない。

## 意図

公開中の記事について、コミットされたMarkdownファイル全体をサイトから取得できるようにする。

## 受け入れ条件

- [ ] 各記事に対応する安定したMarkdown URLから、その記事の原文をHTTPで取得できる。
- [ ] 配信内容は元ファイル全体と一致し、YAML frontmatterとMarkdown本文を含み、HTMLページで置き換えられない。
- [ ] 記事詳細ページから対応する原文URLへ移動できる。
- [ ] 記事追加・修正時に原文配信のための別コピーを手作業で更新する必要がない。
- [ ] 既存のHTML記事URLとcanonical URLは維持される。

## 対象外

- Markdown原文の編集画面やCMS
- AI向けの要約・変換API
- 非公開記事や下書きの配信

## 品質境界

公開対象の各Markdown記事について、生成された原文リソースが同じコミットの正本と一致し、記事URLから発見できることを対象とする。HTML表示、frontmatter検証、既存の公開URLには影響させない。

## 実装メモ

- 記事は独自のAstro content loaderで読み込み、現在はファイルパスと描画結果を保存している。原文配信では既存のMarkdownを正本として参照する。
- 静的出力と `trailingSlash: "always"` の構成で、拡張子付きリソースのURLと実際の配信内容を確認する。
- frontmatterを含むファイル全体を配信する。HTTP応答がHTMLではなくテキストとして取得できることも確認する。

## 設計判断

## レビュー指摘

- 未レビュー

## 完了記録

- 変更: 未着手
- 検証: 未着手
