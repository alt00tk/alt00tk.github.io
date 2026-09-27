---
id: BLOG-001
status: closed
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
- [x] `src/content/blog`以下のMarkdownを再帰的に読み、URL特殊文字を含むパスも処理する。読込・解析に失敗した場合はそのファイルパスを示してビルドが失敗する。
- [x] 不正な記事を黙って除外せず、どの入力が無効か分かるエラーをビルド出力に示す。

## 対象外

- 記事一覧、詳細ページ、ページ送りの生成
- 記事本文のMarkdown規則を検査する独自lint
- サンプル記事や実コンテンツの追加
- CMS、下書き状態、予約公開などの記事管理機能

## 品質境界

`src/content/blog`以下のMarkdownを静的ビルドする経路を対象に、必要な入力契約違反をすべてビルド失敗として検出する。パス文字列やloader内の競合で入力を黙って除外すること、公開状態の追加、不正な記事の自動補正、重複slugの黙認は認めない。

## 実装メモ

- 引継ぎ資料は .local/blog-mvp-codex-handoff.tar.gz 内の blog-mvp-codex-handoff/blog-mvp-codex-handoff.md を参照する。
- Astroの現行安定版と、その時点で推奨されるコンテンツAPIを使う。Astroの具体的な版やパッケージ管理方法は、既存リポジトリの制約がないため実装時に選べる。
- リポジトリ名から本番URLを https://alt00tk.github.io/ と定める。出力は静的生成とし、アプリケーションJavaScriptを追加しない。
- 正常・異常なメタデータとslugを実装時のビルド確認で試し、検証用記事をコミット成果物として残さない。

## 設計判断

- Astro 7.3.5を固定したnpm依存関係と`package-lock.json`を採用した。既存のパッケージ管理制約がなく、AstroのコンテンツAPIと推奨環境を同じ依存グラフで再現できるためである。
- `src/content/blog-loader.ts`のbuild-time LoaderでMarkdownを再帰列挙し、通常のファイルシステムパスで読み込む。Astroの`renderMarkdown`と`parseData`で本文を描画しschemaを検証し、`pathToFileURL`で特殊文字を含むファイルパスも正しく扱う。slugはbasenameから作り、重複は記事をstoreへ反映する前に両パス付きで失敗させる。Zodのstrict schemaは`title`、`description`、`publishedAt`だけを受け付け、日時に明示的なtimezoneを要求し、将来日時は制限しない。
- パッケージ全体に`type: module`を設定しない。Astro設定は`astro.config.mjs`でESMとして読み込める一方、リポジトリのIssue CLIはCommonJSの`issues.js`であり、全体設定をするとそのCLIが起動しなくなるためである。
- Astroの`glob()` loaderはファイルパスをURL化する段階で`#`をfragmentとして扱い、対象Markdownを警告だけで読み飛ばすことがあった。また、重複slugは並列読込の競合で警告に留まる場合があった。標準loaderへの追加設定に依存せず、記事一覧をファイルシステムから列挙してから検査・読込する方が品質境界を直接守れるため、独自loaderを採用した。

## レビュー指摘

- **IMPL-1（対応）**: 同basenameのMarkdownはAstro `glob()` loaderの並列読込で警告だけになり、片方が落ちてビルド成功する場合があった。さらに`src/content/blog/a#x/repeated.md`では`#`がURL fragmentとして扱われ、slug検査前に読み飛ばされていた。`src/content/blog-loader.ts`へ再帰列挙・ファイルシステム読込・安全なfile URL生成を集約し、`src/content/blog/a#x/repeated.md`と`src/content/blog/b/repeated.md`の重複、通常の重複、読込不能ファイルを入力パス付きで失敗させた。ブログ記事collectionの入力経路を確認し、別のglob loaderや記事slug生成経路がないことを確かめた。

## 完了記録

- 変更: Astro 7.3.5、npmマニフェストとロックファイル、静的出力と`https://alt00tk.github.io/`を指定する設定を追加した。専用build-time LoaderがMarkdownを再帰的に読み込み、必須metadata、日時、basename slugの一意性をビルド時に検証する。
- 検証: `npm ci --offline --cache=/tmp/blog-001-npm-cache`後の`npm run build`が成功した。正常日時、metadata欠落・空値・型違い、不正日時、slugフィールド混入、7種の不正slug、通常と`#`入りパスの重複、重複解消後の再ビルド、読込不能Markdownを使い、計29ケースを確認した。重複と読込失敗は関係する両パスまたは該当パスを含むエラーとなり、単独記事と空のサイトはビルド成功した。検証記事は削除済み。
- レビュー観点: `src/content/blog-loader.ts`の再帰列挙、特殊文字を含むパスの読み込み、全Markdownの読込・解析エラー、重複basename slugの両パス診断を確認する。`src/content.config.ts`は必須metadataのstrict schemaを保ち、`astro.config.mjs`はbaseパスなしの静的出力を指定する。
