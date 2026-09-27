---
id: BLOG-001
status: active
type: feature
depends_on: []
---

# Astro基盤と記事コンテンツ契約を整える

## 問題

このリポジトリにはサイト実装がなく、Astroのビルド基盤やMarkdown記事の入力契約もない。
後続のページ生成が依存する静的出力設定と、壊れた記事をビルド時に検出する仕組みが必要である。

## 意図

Astroの静的ビルド基盤と、記事Markdownの必須メタデータおよびslugの検証を用意する。

## 受け入れ条件

- [x] クリーンなチェックアウトで依存関係を復元してAstroの静的ビルドを実行でき、再現に必要なマニフェストとロックファイルが含まれている。
- [x] site は https://alt00tk.github.io/ を指し、プロジェクト用の base パスを設定しない。
- [x] 1つのMarkdownファイルを1記事として扱い、title、description、publishedAt の不足、空値、不正値がビルドエラーになる。
- [x] publishedAt は明示的なタイムゾーンを持つ有効なISO 8601日時文字列として検証され、将来日時も有効な値として扱われる。
- [x] ファイル名をslugとして扱い、正規表現 ^[a-z0-9]+(?:-[a-z0-9]+)*$ に合わない記事名でビルドが失敗する。
- [x] 異なるディレクトリのMarkdownが同じbasename/slugを持つ場合、両方のファイルパスを示してビルドが失敗する。
- [x] 不正な記事を黙って除外せず、どの入力が無効か分かるエラーをビルド出力に示す。

## 対象外

- 記事一覧、詳細ページ、ページ送りの生成
- 記事本文のMarkdown規則を検査する独自lint
- サンプル記事や実コンテンツの追加
- CMS、下書き状態、予約公開などの記事管理機能

## 品質境界

記事Markdownを追加して静的ビルドする経路を対象に、必要な入力契約違反をすべてビルド失敗として検出する。公開状態の追加や、不正な記事の自動補正・除外、重複slugの黙認は認めない。

## 実装メモ

- 引継ぎ資料は .local/blog-mvp-codex-handoff.tar.gz 内の blog-mvp-codex-handoff/blog-mvp-codex-handoff.md を参照する。
- Astroの現行安定版と、その時点で推奨されるコンテンツAPIを使う。Astroの具体的な版やパッケージ管理方法は、既存リポジトリの制約がないため実装時に選べる。
- リポジトリ名から本番URLを https://alt00tk.github.io/ と定める。出力は静的生成とし、アプリケーションJavaScriptを追加しない。
- 正常・異常なメタデータとslugを実装時のビルド確認で試し、検証用記事をコミット成果物として残さない。

## 設計判断

- Astro 7.3.5を固定したnpm依存関係と`package-lock.json`を採用した。既存のパッケージ管理制約がなく、AstroのコンテンツAPIと推奨環境を同じ依存グラフで再現できるためである。
- `astro/loaders`の`glob()`で記事Markdownを読み、`generateId`内でbasenameをslug規則に照合してから記事IDとして返す。通常のコンテンツ同期・ビルド経路で必ず検査されるため、別の事前検査スクリプトは採用しなかった。Zodのstrict schemaで`title`、`description`、`publishedAt`の3項目だけを受け付け、独自`slug`によるID上書きも拒否する。日時はAstro同梱ZodのISO datetime検証に明示的なoffsetを許可し、将来日時を制限しない。
- パッケージ全体に`type: module`を設定しない。Astro設定は`astro.config.mjs`でESMとして読み込める一方、リポジトリのIssue CLIはCommonJSの`issues.js`であり、全体設定をするとそのCLIが起動しなくなるためである。
- `generateId`内でslugから入力パスへの対応を追跡し、別ファイルが同じbasenameを使う場合は両パスを含むエラーを同期的に投げる。Astroの全体設定でprerender衝突をエラーにする案も試したが、globの並列処理で実証ケースが成功してしまい、記事入力の判定には使えなかった。入力パスが削除済みなら記録を更新できるよう、以前のファイルの存在を確認してから重複とする。

## レビュー指摘

- **IMPL-1（対応）**: 異なるディレクトリのMarkdownが同じbasenameを使うと同じcollection IDになり、Astro既定の動作では警告だけで片方の記事を落としてビルドが成功していた。`generateId`にslugと入力パスの重複検査を置き、`src/content/blog/first/repeated.md`と`src/content/blog/second/repeated.md`の両パスを示してビルドが失敗するようにした。Astro全体のprerender衝突設定では実証ケースが並列処理のため失敗しないこと、記事collection内に別のslug生成経路がないことを確認し、この入力契約の検査を同じloader経路で維持する。

## 完了記録

- 変更: Astro 7.3.5、npmマニフェストとロックファイル、静的出力と`https://alt00tk.github.io/`を指定する設定を追加した。Markdown glob collectionで厳密な必須メタデータ、日時、ファイル名slugをビルド時に検証する。
- 検証: `npm ci --offline --cache=/tmp/blog-001-npm-cache`後の`npm run build`が成功した。使い捨てMarkdownで正常な将来日時、必須値の欠落・空値・型違い、タイムゾーン欠落、不正日付、slugフィールド混入、正規表現に反する7種のファイル名を確認した。追加で、同slugの`src/content/blog/first/repeated.md`と`src/content/blog/second/repeated.md`を置くと両パス付きエラーで失敗し、片方だけなら成功することを確認した。計25ケースが期待どおりで、検証記事は削除済み。
- レビュー観点: `src/content.config.ts`のbasenameから記事IDへの変換、異なるパスの重複slug検出と元ファイル名の表示、未定義metadataとfrontmatter `slug`の拒否を確認する。`astro.config.mjs`はbaseパスを設けず静的出力にしている。
