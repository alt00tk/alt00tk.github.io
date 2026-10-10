---
id: BLOG-009
status: active
type: feature
depends_on: []
---

# 一覧で記事タイトルとdescriptionから詳細へ移動できるようにする

## 問題

記事一覧の各記事は、タイトルだけが記事詳細へのリンクになっている。descriptionを読んでその記事を選んだ場合も、タイトルのリンクまで操作位置を移す必要がある。

## 意図

一覧の記事タイトルとdescriptionのどちらからも、その記事の詳細ページへ移動できるようにする。

## 受け入れ条件

- [x] `/` と `/articles/page/{page}/` の各記事で、タイトルとdescriptionのどちらを選んでも対応する `/articles/{slug}/` を開く。
- [x] タイトルとdescriptionからの移動は通常のキーボード操作可能なリンクとして動作し、既存の可視フォーカス表示を保つ。
- [x] タイトルとdescriptionを単一のリンクにまとめ、記事ごとのTab停止を1回にする。日付はリンクの外に置く。
- [x] リンク名は可視タイトルのみとし、descriptionはアクセシビリティツリーに通常のコンテンツとして残す。`aria-describedby`は付けない。
- [x] 日付とページ送りのリンク動作は変わらず、記事一覧の静的リンクはJavaScript無効時にも動作する。

## 対象外

- 日付からの記事詳細への遷移
- 日付や列間の余白を含む記事行全体をリンクにする変更やカード風の装飾。ただし、タイトルとdescriptionの間の余白がリンク領域となることは許容する。
- ページ送り、記事順序、記事詳細ページの変更

## 品質境界

対象は`ArticleList.astro`が表示する記事タイトルとdescriptionから同じ記事詳細へ移動する経路である。日付とページ送りの意味・操作、および記事一覧の静的リンクとしての動作を保つ。

## 実装メモ

- `src/components/ArticleList.astro`は`/`と`/articles/page/[page].astro`から利用されるため、先頭ページと後続ページの両方で確認する。
- タイトルとdescriptionが同じ単一リンク内にあること、リンクのアクセシブルな名前、descriptionの読み取り可能性、フォーカス表示を確認する。

## 設計判断

- タイトルとdescriptionを単一の通常の`a`要素で囲み、記事ごとのTab停止を1回にする。独立した2リンクはTab停止と同じ詳細への遷移先が重複するため採用しない。タイトルとdescriptionの間の余白が操作領域になることはユーザーが明示的に許容した。日付はリンクの外に置く。
- `aria-labelledby`で可視`h2`のみをリンク名にする。参照IDは`article-title-${article.id}`とし、既存loaderで一意性を保証するslugを使う。descriptionは通常の`p`としてアクセシビリティツリーに残し、リンクへフォーカスした際の追加説明にしないため`aria-describedby`を付けない。Chromeのアクセシビリティ情報でタイトルのみのリンク名とdescriptionのStaticTextを確認した。
- リンクを`display: block`にし、タイトルとdescription全体へ既存の可視フォーカスを適用する。既存のタイトルhover色のセレクターを新構造へ合わせる。desktopと390px幅のフォーカス画像で、日付を囲まず表示することを確認した。

## レビュー指摘

- 指摘なし。追加変更の独立レビューで、単一のネイティブリンクによる記事ごとのTab停止1回、可視タイトルへの`aria-labelledby`参照、通常コンテンツとしてのdescription、日付とページ送りの境界を確認した。loaderのslug制約・重複拒否、CSS差分、ブラウザ検証スクリプトと結果、アクセシビリティツリー、desktop・390px幅のフォーカス画像は整合している。合意した振る舞いを満たす最小変更であり、追加修正と後続Issue候補は不要。

## 完了記録

- 変更: `ArticleList.astro`のタイトルとdescriptionを単一の静的リンクにまとめ、`/articles/{slug}/`へ移動できるようにした。可視タイトルを参照する`aria-labelledby`でリンク名を定め、日付は外に残す。CSSでリンクをblock表示にし、既存タイトルのhover色のセレクターを更新した。
- 検証: `npm run build`が既存6記事で成功。一時記事15件を追加した21記事のビルドも成功し、`/`、`/articles/page/2/`、`/articles/page/3/`の3一覧をローカルChromeで確認した。全21記事の単一リンクと詳細ページHTTP 200、参照IDの一意性・一致、`aria-describedby`がないこと、日付の非リンクと表示形式、ページ送りの遷移先と先頭・末尾の無効状態、生成HTMLにscriptがないことを確認した。
- 検証: JavaScript無効のChromeで、各一覧の全記事をTabで順にたどり、記事ごとに停止1回、既存の`:focus-visible`・2px solid・offset 4pxを確認した。各一覧の先頭記事でEnter、タイトル・description・間の余白のクリックから対応詳細へ移動し、ページ送りの全有効リンクもクリックで遷移した。Chromeのアクセシビリティツリーで、全21記事のリンク名がタイトルのみ、追加説明なし、descriptionがリンク内の非ignoredなStaticTextとして残ることを確認した。desktopと390px幅のフォーカス画像を目視確認した。
- 検証証拠: `/tmp/blog009-single-browser.mjs`、`/tmp/blog009-single-browser-results.json`、`/tmp/blog009-single-ax-tree.json`、`/tmp/blog009-single-focus-{home,2,3,mobile}.png`。スクリーンリーダー実機の読み上げと複数ブラウザは未確認。アクセシビリティツリーはリンク名とdescriptionが読み取り可能な構造の証拠であり、実機の読み上げ順・挙動の確認は代替しない。
- 検証: 一時記事15件をすべて削除して既存6記事の`npm run build`を再実行し、7ページのビルド成功を確認した。`git diff --check`と`node .agents/skills/manage-local-issues/scripts/issues.js list`も成功した。
- レビュー観点: 追加変更の独立レビューで、責務・境界、実装整合性、セキュリティ、検証の信頼性、保守性を確認し、指摘なし。単一リンクによる記事ごとのTab停止1回、`aria-labelledby`の参照整合性とタイトルのみのリンク名、descriptionの読み取り可能な構造、日付とページ送りの境界、CSS適用範囲と可視フォーカスを確認した。ビルドとブラウザ操作は既存証拠をレビューし、再実行していない。スクリーンリーダー実機と複数ブラウザの未確認という制約を維持する。マージ承諾前のためIssueはactiveに留める。
