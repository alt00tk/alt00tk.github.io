# 条件付きレンダリング

## v-if
  * 単一要素を条件に応じてレンダリングしたい場合
    * ```html
      <h1 v-if="awesome">Vue is awesome!</h1>
      <h1 v-else>Oh no</h1>
      ```
  * 複数のまとまった要素を条件に応じてレンダリングしたい場合
    * ```html
      <template v-if="isShow">
        <h1>Title</h1>
        <p>Paragraph 1</p>
      </template>
      ```
      * このとき `<template>` 要素はレンダリングされない
  * `v-else` 要素と `v-else-if` 要素
    * ```html
      <div v-if="type === 'A">A</div>
      <div v-else-if="type === 'B'">B</div>
      <div v-else-if="type === 'C'">C</div>
      <div v-else>Not A/B/C</div>
      ```
      * `v-else` 要素は `v-if` または `v-else-if` 要素の直後でなければならない
      * `v-else-if` 要素は `v-if` または `v-else-if` 要素の直後でなければならない


## v-show
  * ```html
    <h1 v-show="isShow">Hello!!</h1>
    ```
    * 条件に応じて要素の表示/非表示を制御できる
    * このとき `h1` 要素は DOM としてレンダリングされる_
    * CSS の `display` プロパティを切り替えている（`display: none;`）


## v-if vs v-show
  * `v-if`
    * **遅延レンダリング(lazy)** 
    * 初期条件が false の場合はなにもレンダリングされない
    * 条件が ture になったタイミングでレンダリングされる
    * 切り替えコストが高い
  * `v-show`
    * 初期条件に関わらず常にレンダリングされる
    * CSSベースの切り替え_
    * 初期レンダリングのコストが高い
  * 使い分け
    * 条件が実行時に変更されることがほとんどない場合は `v-if`
    * 条件によって頻繁に表示/非表示を切り替える場合は `v-show`


## v-if と v-for
  * `v-if` と `v-for` を同じ要素に使ってはいけない（`v-if` が先に評価されるため）
  * ケース１
    * 問題
      * リストのアイテムをフィルタリングしたい_
      * `v-if` が先に評価され、`user` が存在しないためエラーとなる
      * ```html
        <li v-for="user in users" v-if="user.isActive">...</li>
        ```
    * 解決案
      * `users` をフィルタリングしたリストを返す算出プロパティ（例えば `activeUsers`）に置き換える_
      * ```js
        computed: {
          activeUsers() { return this.users.filter(user => user.isActive) }
        }
        ```
      * ```html
        <li v-for="users in activeUsers">...</li>
        ```
  * ケース２
    * 問題
      * リストを非表示にするために…
      * ```html
        <li v-for="user in users" v-if="shouldShowUsers">...</li>
        ```
    * 解決案
      * `v-if` をコンテナ要素（`ul`, `ol`）に移動する
      * ```html
        <ul v-if="shouldShowUsers">
          <li v-for="user in users"></li>
        </ul>
        ```