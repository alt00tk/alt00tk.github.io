---
id: BLOG-014
status: closed
type: feature
depends_on: []
---

# 記事のMarkdown原文を配信する

## 問題

記事の正本は `src/content/blog` 以下のMarkdownだが、公開サイトで読めるのは描画済みのHTMLであり、AIやテキスト処理ツールから原文を直接取得するURLがない。

## 意図

公開中の記事について、コミットされたMarkdownファイル全体をサイトから取得できるようにする。

## 受け入れ条件

- [x] 各記事に対応する安定したMarkdown URLから、その記事の原文をHTTPで取得できる。
- [x] 配信内容は元ファイル全体と一致し、YAML frontmatterとMarkdown本文を含み、HTMLページで置き換えられない。
- [x] 記事詳細ページには原文リンクを設けず、原文への導線はBLOG-017で生成する `llms.txt` に限定する。
- [x] 記事追加・修正時に原文配信のための別コピーを手作業で更新する必要がない。
- [x] 既存のHTML記事URLとcanonical URLは維持される。

## 対象外

- Markdown原文の編集画面やCMS
- AI向けの要約・変換API
- 非公開記事や下書きの配信

## 品質境界

公開対象の各Markdown記事について、生成された原文リソースが同じコミットの正本と一致することを対象とする。原文への導線はBLOG-017の `llms.txt` で扱う。HTML表示、frontmatter検証、既存の公開URLには影響させない。

## 実装メモ

- 記事は独自のAstro content loaderで読み込み、現在はファイルパスと描画結果を保存している。原文配信では既存のMarkdownを正本として参照する。
- 静的出力と `trailingSlash: "always"` の構成で、拡張子付きリソースのURLと実際の配信内容を確認する。
- frontmatterを含むファイル全体を配信する。HTTP応答がHTMLではなくテキストとして取得できることも確認する。

## 設計判断

- 原文URLを既存slugに対応する `/articles/{slug}.md` とし、HTMLの `/articles/{slug}/` と並べて静的生成する。既存のHTML URL・canonical生成処理・`trailingSlash: "always"`を変更せず、拡張子付きの実ファイルとして出力できることをビルドとHTTPで確認した。ユーザーの方針変更により記事詳細には原文リンクを設けず、原文への導線はBLOG-017の `llms.txt` に限定する。
- 公開対象はHTML詳細と同じ `getCollection("blog")` の記事だけとする。現在の入力契約には非公開・下書き状態がなく、全有効記事が公開対象である。別のglobやディレクトリ走査で原文だけの公開対象を増やす案は採用しない。
- loaderが読み込んだfrontmatterを含むUTF-8原文を、Astroの標準フィールド `body` に保持し、endpointでは変換せずに応答する。既存の `rendered` を維持し、HTML描画と原文を同じ読込結果から生成する。endpointでファイルを再読込する案より、実行時の作業ディレクトリや再読込時点へ依存せず、手動コピーも不要になる。BOM・CRLF・末尾改行なしの原文もバイト一致を確認した。

## レビュー指摘

- 独立レビュー実施済み。指摘なし。実装担当とは別のエージェントが、原文の保持と静的配信、Astroのbodyとrenderedの共存、公開対象、slug制約とURL衝突、既存HTML URL・canonicalの維持を確認した。実施済みのHTTP・特殊入力検証とコード経路が整合し、追加修正や後続Issue候補はない。
- 原文への導線をBLOG-017の `llms.txt` に限定する方針変更後も、独立レビューで指摘なし。記事詳細の原文リンクと専用CSSの撤去、原文endpointの維持、受け入れ条件・品質境界・設計判断・BLOG-017実装メモの整合を差分と関連コードで確認した。追加修正や後続Issue候補はない。

## 完了記録

- 変更: loaderに原文の保持を追加し、公開記事ごとに `/articles/{slug}.md` を静的生成するendpointを追加した。記事詳細には原文リンクを設けず、リンク追加に伴うナビゲーションのCSS変更も取り除いた。原文への導線はBLOG-017の `llms.txt` に限定する。原文が取得できない場合は空ファイルを生成せずビルドを失敗させる。独立レビューを完了し、ユーザーのマージ・push承諾を受けてclosedへ移行した。
- 検証: `npm run build` が成功し、全8記事について生成した `.md` と正本のバイト一致をNode.jsで確認した。`npm run preview -- --host 127.0.0.1 --port 4321` と一時検証スクリプト `node /tmp/blog014-verify.mjs` で、全8件の原文URLがリダイレクトなしのHTTP 200・非HTMLのテキストMIMEで応答し、応答バイトが正本と一致することを確認した。全HTML記事URLのHTTP 200、既存canonical URL、一覧へ戻るリンク、不存在slugの原文URLが404となることも確認した。HTTP検証は実行環境の制限により親エージェントで実施した。
- 検証: 一時記事を `src/content/blog/blog014 # source/blog014-original-fixture.md` に追加し、BOM・CRLF・末尾改行なしの原文がバイト単位で維持されることを確認した。正本だけを更新した再ビルドで原文出力も更新され、削除後の再ビルドでMarkdownとHTMLの両方が残留しないことを確認した。一時記事は削除済みで、最終ビルド後も全8記事の原文バイト一致を再確認した。検証スクリプトとfixtureはコミット対象に含めない。
- 検証: 原文リンク撤去後、親エージェントが `npm run build` の成功と全8記事のMarkdown・HTMLの生成を確認した。独立レビューではリンクと専用CSSの撤去、および関連Issue文書の整合を差分で確認した。
- レビュー観点: 原文がfrontmatterを含む未加工の `body` から生成されること、HTMLと原文の公開対象が一致すること、拡張子付きリソースがHTMLへ置き換わらないこと、既存HTML URL・canonical・本文描画を維持することを確認する。本番GitHub PagesのHTTP応答確認はBLOG-008の配備確認に属し、この変更の検証はローカルの静的生成とpreviewまでである。
