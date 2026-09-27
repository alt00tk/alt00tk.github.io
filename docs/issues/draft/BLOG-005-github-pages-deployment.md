---
id: BLOG-005
status: draft
type: feature
depends_on: [BLOG-004]
---

# GitHub Pagesへの静的配備を設定する

## 問題

サイトをローカルで静的生成できても、既定ブランチからGitHub Pagesへ自動配備する経路がなければ、公開サイトを更新できない。

## 意図

既定ブランチの更新から静的サイトをビルドし、GitHub Pagesへ配備するGitHub Actionsワークフローを用意する。

## 受け入れ条件

- [ ] GitHub Actionsが既定ブランチの更新で起動し、依存関係を再現可能な方法で復元してAstroの静的ビルドを実行する。
- [ ] ビルド成果物をGitHub Pagesへ配備する公式にサポートされたActions経路を使う。
- [ ] リポジトリのGitHub Pages User siteで公開でき、サイトのURLは https://alt00tk.github.io/、プロジェクト用のサブパスを必要としない。
- [ ] Pages配備に必要な最小権限とGitHub Pages用environmentをワークフローに設定する。
- [ ] ワークフローの構成を確認し、GitHub Actions上でビルドと配備が成功することを受け入れ確認として記録する。

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

## レビュー指摘

- 未レビュー

## 完了記録

- 変更: 未着手
- 検証: 未着手
