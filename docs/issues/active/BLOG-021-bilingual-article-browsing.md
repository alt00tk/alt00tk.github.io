---
id: BLOG-021
status: active
type: feature
depends_on: []
---

# 日本語URLを維持して英語記事を閲覧できるようにする

## 問題

現行loaderは再帰的にMarkdownを読み、ファイル名だけをIDにするため、blog/enに日本語と同名ファイルを配置すると重複する。記事・一覧・検索・復帰処理とメタ情報は日本語URLまたは表示に固定されている。

## 意図

日本語の既存URLを維持し、同名の英語記事を/en/以下で閲覧・切替できるようにする。

## 受け入れ条件

- [x] 日本語をsrc/content/blog/{slug}.md、英語をsrc/content/blog/en/{slug}.mdから読み、同名でも衝突しない。言語は配置、slugはファイル名から決まり、同一言語内の重複と既存の不正形式はビルドエラーになる。
- [x] 既存の日本語記事URL・一覧URL・Markdown URLを維持し、英語の/en/、/en/articles/{slug}/、/en/articles/page/{page}/、/en/articles/{slug}.mdを静的生成する。
- [x] 記事のJP/EN切替は同じslugの対応版へ移動し、一覧の切替は切替先言語の先頭へ移動する。表示はJP/EN、言語コードはja/enとする。
- [x] 各言語の一覧・ページ数・タイトルと概要の全記事検索・検索結果表示・記事から一覧への復帰がその言語内で成立し、別言語の状態と混同しない。
- [x] 英語記事のタイトル・概要の後、本文の前に、次の注釈をテンプレートで表示する: This article was translated from Japanese using AI and may contain translation errors. Please refer to the [original Japanese version] for the author's intended meaning. original Japanese versionは同slugの日本語記事へのリンクとし、日本語記事には表示しない。
- [x] 共通UIの説明・アクセシブルなラベル・検索メッセージを表示言語に合わせる。html lang、OGP言語・タイトル・概要・URL・画像説明、canonicalを言語別に設定し、存在する対応版を相互のhreflangで案内する。共通OGP画像は維持する。
- [x] 移行途中で英語記事が0件でも既存日本語サイトをビルドできる。対応版がない切替先への壊れたリンクを生成しない。この互換状態はBLOG-024適用前の移行用である。
- [x] 日本語のみ、日英同名、英語複数ページの入力でビルド成果物とMarkdownを確認し、検索・切替・復帰をブラウザで確認する。後続Issue未実装でも有効なリンクとメタ情報だけを公開する。

## 対象外

- 全記事の翻訳とChatGPTによる品質レビュー
- 全記事の日英ペア必須化と本文リンク検査（BLOG-024）
- 英語RSS・llms.txtの整備（BLOG-022）
- 翻訳API、言語の自動判定・自動転送、言語別OGP画像の制作

## 品質境界

既存日本語の公開経路と、英語ファイルがある記事の閲覧経路を守る。英語0件でも配備可能とし、後続Issueで表示不具合を直す前提にしない。

## 実装メモ

loader、content schema、全ページのarticle.id利用、BaseLayout、ArticleList、article-list-contextを確認する。ページ本体の重複を避け、同じslugと言語をURL生成に渡す案を検討する。英語RSS未提供時に存在しない英語フィードへ案内しない。ロールバックはIssueの差分単位で行い、英語ファイルを旧loaderに残さないよう内容変更も確認する。

- このJP/EN対応では、一時的な `develop` を統合先とする。Issueブランチは最新の `develop` から作成し、Issue IDを含める。各Issueは承認後にclosedの記録を含めて `develop` へ `--no-ff` で統合する。通常運用のmain向け統合規則に対する、今回のユーザー承認済み例外である。
- mainでは日本語記事の執筆・公開を続ける。必要時および最終統合前にmainをdevelopへ取り込み、記事を失わない。Issueの完了はdevelopへの統合を意味し、本番配備済みとは扱わない。
- BLOG-021〜BLOG-024がすべてclosedとなり、最新mainを取り込んだ全記事の日英対応とビルドを再確認してから、人間の明示承認を得てdevelopをmainへ `--no-ff` で統合する。承認済みなのは今回の起案内容のmainへの直接コミットまでで、将来の統合・push承認を含まない。
- 本Issueは依存と記載の前提が満たされれば後続Issueなしでビルド・配備できる状態にする。実際の本番公開は全Issue完了後とし、main向けの既存配備workflowは維持する。

## 設計判断

- collection IDを `ja/{slug}` と `en/{slug}` にし、厳格なfront matter検証は維持する。公開URLは共通ヘルパーで生成し、日本語URLを変更しない。記事と一覧は共通コンポーネントで描画し、各言語のrouteは静的パスの列挙だけを担当する。
- 一覧への復帰状態は言語別のsessionStorageキーで保持し、保存URLも現在の言語に限定して検証する。
- UIの言語切替は対応記事または先頭一覧へ向ける。一覧のhreflangは記事がある先頭一覧同士だけに出力し、記事のhreflangは対応版が存在する場合だけ出力する。英語0件の一覧と2ページ目以降への非相互参照を避ける。
- RSSとllms.txtはBLOG-022まで日本語に限定する。英語ページでは英語フィードのautodiscoveryを出さず、既存日本語リソースへのアイコンには日本語用であることを英語ラベルで明示する。

## レビュー指摘

- 独立レビューで、一覧のUI切替先とhreflangを共用すると2ページ目および英語0件時に相互参照が成立しないことを確認した。UIとメタ情報の出力条件を分離し、記事がある先頭一覧同士だけを相互参照させた。記事側も確認し、欠落ペアでは出力されないことを検証した。`scripts/test-bilingual.mjs` に英語0件・両言語2ページ目のhreflang不在と先頭一覧の相互リンクを検査する回帰チェックを追加した。
- 独立レビュー最終結果: Looks acceptable。構造・境界、実装整合性、セキュリティ、検証の信頼性、保守性と、日本語URL互換・言語状態分離・欠落ペアを確認し、未解決指摘なし。

## 完了記録

- 変更: 言語別の記事識別、日英の一覧・記事・Markdown静的生成、対応版のJP/EN切替、英語翻訳注釈、UIとメタ情報の言語対応、言語別検索・一覧復帰を実装。既存日本語のRSS・llms.txtを維持した。
- 検証: `npm run build` 成功。`PLAYWRIGHT_MODULE=/home/tome/likedPicsViewer/node_modules/playwright/index.mjs node scripts/test-bilingual.mjs` 成功。既存日本語のみ、同slug日英、英語11記事の2ページ、Markdown原文、canonical/OGP/hreflang、欠落ペア、同一言語重複・不正slug・空descriptionのビルドエラーを検査した。Chromiumで全記事検索・0件表示・クリア・ページ2から記事への遷移と検索状態の復帰・一覧切替での先頭復帰と言語状態分離・記事のJP/EN切替と原文リンクを確認した。fixtureを削除して日本語のみの最終ビルドも成功。`git diff --check` とIssue一覧検証も成功。
- レビュー観点: 言語とslugから生成する公開URL、共有UI、復帰状態、移行中の欠落ペアと相互hreflang。実記事の翻訳は対象外。検証スクリプトはenディレクトリがない隔離checkoutで実行し、既存翻訳がある場合は開始前に停止する。
- 統合状態: コミット後もactiveに留め、developへの統合承認を待つ。mainへの統合・push・本番配備は未実施。
