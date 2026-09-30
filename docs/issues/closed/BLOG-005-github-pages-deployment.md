---
id: BLOG-005
status: closed
type: feature
depends_on: [BLOG-004]
---

# GitHub Pagesへの静的配備を設定する

## 問題

サイトをローカルで静的生成できても、既定ブランチからGitHub Pagesへ自動配備する経路がなければ、公開サイトを更新できない。

## 意図

既定ブランチの更新から静的サイトをビルドし、GitHub Pagesへ配備するGitHub Actionsワークフローを用意する。

## 受け入れ条件

- [x] GitHub Actionsが既定ブランチの更新で起動し、依存関係を再現可能な方法で復元してAstroの静的ビルドを実行する。
- [x] ビルド成果物をGitHub Pagesへ配備する公式にサポートされたActions経路を使う。
- [x] リポジトリのGitHub Pages User siteで公開でき、サイトのURLは https://alt00tk.github.io/、プロジェクト用のサブパスを必要としない。
- [x] Pages配備に必要な最小権限とGitHub Pages用environmentをワークフローに設定する。
- [x] ワークフローの構成、ローカルの静的ビルド、独立レビューの結果を記録する。mainへの反映後に必要となるGitHub Actions上のビルド・本番配備の確認は、後続Issue BLOG-008で追跡する。

## 対象外

- Cloudflareなど別ホスティング先への配備
- 手動のリリース承認、複数環境、プレビュー配備
- 分析、監視、カスタムドメインなどの追加運用機能
- サイト内容や見た目の変更（BLOG-001〜BLOG-004で扱う）

## 品質境界

既定ブランチ上の静的成果物だけをGitHub Pagesへ公開し、不要な書き込み権限やサーバー実行時機能を要求しない。User siteのルートURLで配備できることを確認する。

## 実装メモ

- 引継ぎ資料は .local/blog-mvp-codex-handoff.tar.gz 内の blog-mvp-codex-handoff/blog-mvp-codex-handoff.md を参照する。
- ワークフロー作成時点のAstro公式GitHub Pages配備手順とサポート中のAction版を確認する。
- 実際のGitHub Actions上の実行結果確認にはリポジトリへのpushが必要になる。ローカルで確認できるワークフロー構造とビルド確認も実施し、未実行の外部確認は完了記録で区別する。

## 設計判断

- 決定: `main`へのpushだけを配備workflowの起動条件にし、buildとdeployを別jobに分けた。依存復元とビルドにはNode.js 24、`package-lock.json`に対する`npm ci`を使い、deploy jobには`pages: write`と`id-token: write`だけを与え、`github-pages` environmentを指定した。
- 理由・根拠: 2026-09-30時点の[Astro公式GitHub Pages手順](https://docs.astro.build/en/guides/deploy/github/)と[GitHub Pages公式workflow資料](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Astro公式Action](https://github.com/withastro/action)の現行構成を確認した。`actions/checkout@v7`、`actions/setup-node@v7`、`actions/upload-pages-artifact@v5`、`actions/deploy-pages@v5`を使い、lockfileを復元して書き込み権限を配備jobだけに限定できる。
- 却下した選択肢:
  - 選択肢: Astro公式の`withastro/action@v6`を一つのbuild jobで使う。公式推奨の経路だが、現行actionは`npm install`を行い、buildとartifact uploadも同じjobにまとめるため、`npm ci`とjob単位の権限分離を明示する今回の要件には個別の公式Actions構成が合う。
- 再検討条件: Node.js要件、lockfile/package manager、またはAstro/GitHub Pagesの公式Action契約が変わった場合。実GitHub Actionsの実行時に失敗した場合は、実行結果に基づき再検討する。
## レビュー指摘

- 独立レビュー結果: Looks acceptable。設計・境界、実装、権限、検証記録、保守性の5領域と外部Action・配備環境を確認し、Blocking/Warning指摘はなかった。
- 公式Actionの可動タグは配布元で参照先が変わるため、完全なcommit SHAへの固定が任意の強化案として挙がった（Note）。通常経路の欠陥は確認されず、公式手順に沿う現在のタグ参照を採用するため今回の変更は不要と判断した。workflow内の全Action参照が同じ方式であることを確認し、後続Issueは作成しない。

## 完了記録

- 変更: `.github/workflows/deploy.yml`を追加し、`main`更新時の`npm ci`・Astro静的build・Pages artifact upload・GitHub Pages deployを構成した。build jobは`contents: read`のみ、deploy jobは`pages: write`と`id-token: write`のみを与え、`github-pages` environmentを指定した。既存のAstro設定は`https://alt00tk.github.io/`をsiteに設定し、`base`を定義していない。
- 検証: `npm run build`が成功し、`/`と記事2件の静的ページを生成した。workflowをYAMLとして読み込み、設定したtrigger、権限、job依存、action参照を確認した。pushを伴うGitHub Actions実行とGitHub Pagesの公開元設定は未確認のため、実配備の確認は後続Issue BLOG-008へ移した。
- レビュー観点: 別担当が独立レビューを実施し、Looks acceptable（Blocking/Warningなし、任意のSHA固定についてNote 1件）。`main`からの起動条件、jobごとの最小権限、Pages artifactからdeployへの依存、User siteのルートURL、公式Actionの対応状況と未確認事項の記録を確認した。GitHub上の既定ブランチ、公開元設定、実配備結果は未確認。

- 完了条件の変更: ユーザーの指示により、main更新で初めて起動するworkflowの実配備成功をマージ前の完了条件から分離した。BLOG-005は構成・ローカルビルド・独立レビューまでを対象とし、未確認のGitHub Actions実行と公開結果はBLOG-008で追跡する。
