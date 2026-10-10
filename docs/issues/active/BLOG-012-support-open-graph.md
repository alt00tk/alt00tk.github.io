---
id: BLOG-012
status: active
type: feature
depends_on: []
---

# 全ページにOGPを設定する

## 問題

生成されるHTMLには共有用のOGPがなく、作成済みのOGP画像も公開されていない。
記事を共有した際に記事固有のタイトル、説明、URLを共有サービスへ伝えられない。

## 意図

本サイトの全ページで、共通画像とページ固有の情報をOGPとして共有サービスへ伝えられるようにする。

## 受け入れ条件

- [x] トップ、記事一覧の各ページ、各記事にOGPのtitle/type/image/url、description/site_name/locale（ja_JP）を静的HTMLで出力する。
- [x] canonicalとog:urlはAstroのsite設定に基づくページ固有の絶対URLで、trailingSlashの設定と一致する。
- [x] 記事にはog:type=articleと既存publishedAtによるarticle:published_timeを出力し、トップと一覧はwebsiteとする。
- [x] 共通画像にog:image:alt/width/height/typeを設定する。
- [x] X Cards専用のtwitter:*メタタグを出力しない。
- [x] フォント修正版PNGをpublic/ogp.pngとして公開し、1200×630の実画像とメタ値が一致する。編集用とパス化済みSVG、フォントライセンスを保守用に保存する。
- [x] ビルドと生成HTMLのメタデータ・画像参照の検証を通し、通常は未生成の記事一覧2ページ目も検証する。
- [x] 独立レビューを実施し、範囲内の指摘を解消する。

## 対象外

- X Cards対応、記事別画像の生成、UI変更、SEO全般の拡張、本番配備、共有サービスのキャッシュ更新。

## 品質境界

既存のトップ、ページ番号付き記事一覧、記事の全静的経路について、共有クローラーがHTMLだけでOGPメタデータと公開画像を取得できることを保証する。
共有サービス側の表示やキャッシュは配備後の外部動作であり、このIssueの検証は生成成果物までとする。

## 実装メモ

- siteとtrailingSlashは既存Astro設定を参照する。記事のtitle/description/publishedAtは既存データを使う。
- トップと一覧の説明は技術・設計・AIと判断の記録を表す。
- 元画像は.local/notes-ogp-font-fixed/にある。既存のsrc/content/blog/.gitkeep削除はユーザー変更として保持する。
- 仕様の確認先: https://ogp.me/

## 設計判断

- 決定: 共通BaseLayoutがOGPとcanonicalを出力し、descriptionの既定値をサイトの説明とする。記事ページだけが既存のpublishedAtを渡し、その有無でarticleとwebsiteを区別する。
- 理由・根拠: 全3経路が同じLayoutを使い、記事固有の説明はすでにLayoutへ渡されている。記事種別と公開日時の条件を一つにすることで、不整合な組み合わせを避ける。全生成HTMLと一覧2ページ目の検証で値と出力数を確認した。
- 却下した選択肢: 各ページへメタタグを直接記載すると、同じOGPと画像情報を重複管理することになる。種別を別propとして渡す方法は、今回の2種類のページでは公開日時との整合を別途管理する必要がある。
- 決定: ユーザー指定によりX Cardsは対象外とし、twitter:*メタタグを出力しない。OGPによる共有情報の出力を対応範囲とする。
- 理由・根拠: X Cards対応をしないという範囲指定に従う。生成HTML全7ページにtwitter:*がなく、OGPとcanonicalの値が保持されていることを確認した。
- 決定: canonicalはAstro.urlのpathnameとAstro.siteから作成し、画像URLはAstro.siteと公開パスから作成する。
- 理由・根拠: 配備先の既存設定を正本とし、クエリやフラグメントを含めず、AstroがtrailingSlash=alwaysで生成した経路と一致させる。全ページの絶対URLと末尾スラッシュを検証した。
- 決定: 公開PNGはpublic/ogp.pngへ、編集原本・パス化SVG・OFLと説明はassets/ogp/へ保存する。
- 理由・根拠: 共有クローラー向けにはフォントに依存しない既存PNGを使い、保守用原本を公開成果物へ混ぜずにGitで管理する。フォント本体は追加しない。

## レビュー指摘

- 指摘なし。X Cards除外後の差分を、実装担当とは別の6.1 Sol Mediumエージェントが独立レビューした。twitter:*の不在、OGPの維持、Issueとの整合、検証内容を確認し、範囲内の問題がないことを確認した。

## 完了記録

- 変更: BaseLayoutにOGP、canonical、サイト説明の既定値を追加した。ユーザー指定によりX Cards対応を対象外とし、twitter:*メタタグ5項目を削除した。記事は既存publishedAtを渡してarticle:published_timeを設定する。フォント修正版の公開PNGと保守用SVG・OFLを配置した。
- 検証: X Cards除外後にnpm run build成功（通常7ページ）。一時Python HTMLParserで全7ページにtwitter:*メタタグがないことを確認した。OGPとcanonical、記事の公開日時、画像情報の検査も成功した。
- 検証（除外前）: npm run build成功（通常7ページ）。一時Python HTMLParserによる全生成HTML検査で各メタデータの一意性、既存記事データとの一致、ページ固有絶対URLと末尾スラッシュ、画像URLと代替文の一致を確認した。PNGヘッダーの1200×630と公開成果物・元PNGのバイト一致を確認した。
- 検証（除外前）: 一時記事5件を追加してnpm run buildを実行し、一覧2ページ目を含む13ページで同じ検査を通した。タイトルと説明に&および<を含め、HTMLのエスケープ後も正しい値として読めることを確認した。一時記事をfinallyで除去し、通常7ページへ再ビルドして同じ検査を通した。
- 検証: package.jsonにcheckスクリプトは存在しないため、新しい検証依存は導入していない。公開サービス側のカード表示とキャッシュは未確認。
- レビュー観点: 全3経路でのOGPメタ値、Astro設定によるURL生成、記事種別と日時、公開PNGと保守原本の整合、X Cards専用タグの不在。X Cards除外後の独立レビュー実施済み、指摘なし。

- 状態: X Cards除外後の実装・検証・独立レビュー完了。マージ承諾前のためactiveを維持する。
