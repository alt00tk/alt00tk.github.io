# リストレンダリング

## v-for で配列に要素をマッピングする
  * `v-for` ディレクティブ_
    * 配列要素をリスト形式にレンダリングできる
      * ```html
        <ul id="array-rendering">
          <li v-for="item in items">
            {{ item.message }}
          </li>
        </ul>
        ```
      * ```js
        Vue.createApp({
          data() {
            return {
              items: [{ message: 'Foo' }, { message: 'Bar' }]
            }
          }
        }).mount('#array-rendering')
        ```
    * 現在の要素に対応する配列のインデックスを引数として受け取ることもできる
      * ```html
        <ul id="array-with-index">
          <li v-for="(item, index) in items">
            {{ parentMessage }} - {{ index }} - {{ item.message }}
          </li>
        </ul>
        ```
    * JavaScript のイテレータ構文に近い記述もできる
      * ```html
        <div v-for="item of items">...</div>
        ```


## オブジェクトの v-for
  * オブジェクトのプロパティに対して `v-for` を使った反復処理もできる_
    * ```html
      <ul id="v-for-object">
        <li v-for="value in myObject">
          {{ value }}
        </li>
      </ul>
      ```
    * ```js
      Vue.createApp({
        data() {
          return {
            myObject: {
              title: 'How to do lists in Vue',
              author: 'Jana Doe',
              publishedAt: '2016-04-10'
            }
          }
        }
      }).mount('#v-for-object')
      ```
    * ```planetext
      ・ How to do lists in Vue
      ・ Jana Doe
      ・ 2016-04-10
      ```
  * 2つ目の引数としてプロパティ名も受け取ることができる
    * ```html
      <li v-for="(value, name) in myObject">
        {{ name }} : {{ value }}
      </li>
      ```
  * さらにインデックスも受け取ることができる
    * ```html
      <li v-for="(value, name, index) in myObject">
        {{ index }}. {{ name }} : {{ value }}
      </li>
      ```
    * オブジェクトを反復するときの順序は `Object.keys()` の列挙順に基づく
    * すべての JavaScriptエンジンの実装で一貫性は保証されていない_


## 状態の維持
## 配列の変化を検出
### 変更メソッド
### 配列の置き換え
## フィルタ/ソートされた結果の表示
## 範囲付き v-for
## template での v-for
## コンポーネントと v-for
