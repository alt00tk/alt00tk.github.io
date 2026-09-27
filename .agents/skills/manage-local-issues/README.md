# manage-local-issues

## このスキルは何か

リポジトリ内の `docs/issues` を正本にして、Issue と作業ブランチ、ローカルマージを小さく管理するためのポータブルなスキルです。

Issue の一覧表示、状態検証、着手可能な Issue の確認、状態遷移を CLI として含みます。GitHub Issues やプロジェクト固有の npm script、lint、テストランナーには依存しません。

## 使いどころ

- 作業を 1 Issue・1 意図・1 ローカルマージに対応づけたい
- Issue の状態と受け入れ条件をリポジトリ内で追跡したい
- 個人開発や小規模プロジェクトへ、同じ Issue 運用を簡単に持ち込みたい
- Issue 運用 CLI の検証をアプリケーションのテスト設定から分離したい

## 含まれるもの

- `SKILL.md`: エージェント向けの選択・実装・完了・マージ手順
- `references/issue-workflow.md`: 人間向けの運用規約と CLI リファレンス
- `scripts/issues.js`: `docs/issues` を操作する Node.js CLI
- `scripts/issues.test.js`: CLI 単体の自己完結したテスト
- `templates/issue.md`: Issue 本文のテンプレート

## 導入

このディレクトリをプロジェクトの `.agents/skills/manage-local-issues` へコピーし、プロジェクトルートで次を実行します。

```sh
node .agents/skills/manage-local-issues/scripts/issues.js init PROJECT
node .agents/skills/manage-local-issues/scripts/issues.js list
```

`init` は `docs/issues/config.json` と `draft/`、`active/`、`closed/` を作成します。プロジェクトごとの違いは `config.json` の `id_prefix` だけです。

スキル自身の確認はプロジェクトの npm script へ登録せず、次を直接実行します。

```sh
node --check .agents/skills/manage-local-issues/scripts/issues.js
node .agents/skills/manage-local-issues/scripts/issues.test.js
```
