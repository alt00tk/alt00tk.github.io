---
id: BLOG-008
status: draft
type: task
depends_on: [BLOG-005]
---

# GitHub Pagesへの本番配備を確認する

## 問題

BLOG-005で配備workflowを実装し、ローカルビルドと独立レビューを確認したが、GitHub Actions上のビルド・配備と公開結果は未確認である。
workflowはmainへのpushで起動するため、mainへの統合後に確認する必要がある。

## 意図

mainに反映されたworkflowによるGitHub Pagesへの本番配備と公開結果を確認し、証拠を記録する。

## 受け入れ条件

- [ ] GitHub上の既定ブランチとPagesの公開元設定を確認し、main更新からGitHub Actionsで配備する構成であることを記録する。
- [ ] 承認されたmainへのpush後、対象commitのGitHub Actionsでbuildとdeployが成功したことを実行URLとともに記録する。
- [ ] https://alt00tk.github.io/ のトップページと記事ページが表示され、CSS・画像・ページ間リンクがルートURLで動作することを確認する。
- [ ] 実行や公開に問題があれば原因を特定して配備に必要な修正を行い、成功後の確認結果を記録する。

## 対象外

- サイト内容や見た目の変更
- 別ホスティング先、カスタムドメイン、プレビュー配備
- 追加の監視・分析機能

## 品質境界

BLOG-005のworkflowによるmainの静的成果物の公開を対象とする。
実際のGitHub Actions実行とUser siteの公開結果を証拠にし、ローカルビルドのみで配備成功と扱わない。

## 実装メモ

- `.github/workflows/deploy.yml`とBLOG-005の検証記録を参照する。
- 着手時にremote、認証、GitHub Pagesの公開元設定を確認する。
- mainへのpushや外部設定変更は、その時点のユーザー承認を確認して実施する。

## 設計判断

## レビュー指摘

- 未レビュー

## 完了記録

- 変更: 未着手
- 検証: 未着手
