# 算出プロパティとウォッチャー

## 算出プロパティ
  * テンプレート内での JavaScript 式はシンプルな操作のために使う
  * リアクティブなデータを含む複雑なロジックは算出プロパティを使うべき

### 基本的な例
  * ```html
    <div id="#computed-basic">
      <span>{{ publishedBooksMessage }}</span>
    </div>
    ```
  * ```js
    Vue.createApp({
      data() { return { ... } },
      computed: {
        publishedBooksMessage() {
          return this.author.book.length > 0 ? 'Yes' : 'No'
        }
      }
    }).mount('#computed-basic')
    ```
  * `publishedBooksMessage` という算出プロパティを宣言している
  * 算出 getter関数とも言う
  * `vm.author.book` が変更されると、`vm.publishedBooksMessage` も更新される
  * 依存関係を宣言的に作成できる
    * 宣言的とは？
      * [引用元](https://qiita.com/Hiroyuki_OSAKI/items/f3f88ae535550e95389d#%E7%A7%81%E3%81%8C%E4%B8%80%E7%95%AA%E7%90%86%E8%A7%A3%E3%81%A7%E3%81%8D%E3%81%9F%E8%AA%AC%E6%98%8E)
      * ```plaintext
        Declarativeなプログラムの場合、「コーヒー頂戴」と言うだけです。
        コーヒーの作り方は言わないで、「コーヒー頂戴」と一言で済ます。
        「目的を一言（一文）で表す 」
        ```
  * 算出 getter関数には副作用がないのでテストが書きやすい
    * 副作用とは？
      * [引用元](https://ja.wikipedia.org/wiki/%E5%89%AF%E4%BD%9C%E7%94%A8_(%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0))
      * ```plaintext
        プログラミングにおける副作用とは、
        ある機能がコンピュータの (論理的な) 状態を変化させ、
        それ以降で得られる結果に影響を与えることをいう。
        代表的な例は変数への値の代入である。
        ```

### 算出プロパティ vs. メソッド
  * 上記の `publishedBooksMessage` はメソッドとしても定義できる
    * ```html
      <p>{{ calculateBooksMessage() }}</p>
      ```
    * ```js
      methods: {
        calculateBooksMessage() {
          return this.author.books.length > 0 ? 'Yes' : 'No'
        }
      }
      ```
  * どういう違いがあるのか？
    * 算出プロパティはキャッシュされる
      * リアクティブな依存関係の一部が更新された場合のみ再評価される
      * `author.books` が変更されなければ、算出プロパティの `publishedBooksMessage` はキャッシュされた値が返される
    * メソッドは再レンダリングが起こる度に再計算される

### 算出 Setter関数
  * 算出プロパティはデフォルトでは getter関数のみだが、setter関数も宣言できる
  * 例：
    * ```js
      computed: {
        fullName: {
          // 算出 getter関数
          get() { return ... },
          // 算出 setter関数
          set(newValue) {
            const names = newValue.split(' ')
            this.firstName = names[0]
            this.lastName = names[names.length - 1]
          }
        }
      }
      ```
      * `console.log(vm.fullName)` とすると getter関数が呼ばれる
      * `vm.fullName = 'John Doe'` とすると setter関数が呼ばれる


## ウォッチャー
  * 多くの場合は `watch`オプションより算出プロパティが適切だが…
  * 非同期処理は重い処理を実行したい場合に便利
  * ajaxライブラリや汎用ユーティリティメソッドのコレクションなどと組み合わせて使われる_
  * 例：
    * ```js
      Vue.createApp({
        data() { return ... },
        watch: {
          question(newQuestion, oldQuestion) {
            if (newQuestion.indexOf('?') > -1) {
              this.getAnswer()
            }
          }
        },
        methods: {
          getAnswer() {
            this.answer = 'Thinking...'
            axios.get('...')
              .then(response => {...})
              .catch(error => {...})
          }
        }
      }).mount('#watch-example')
      ```
      * `watch` オプションを使うことで…
        * 非同期処理 (APIアクセス) の実行
        * その処理を実行する条件の設定を実現できている
    * 命令的なインスタンスメソッド `vm.$watch` もある
      * `deep` オプション
      * `immediate` オプション
      * `flush` オプション

### 算出プロパティ vs. 監視プロパティ
  * 多くの場合は、監視プロパティ (`watch` オプション) より、算出プロパティがベター_
  * 以下の例の場合、監視プロパティの方だと命令的で冗長だが、算出プロパティの方は意図が読み取りやすい
  * 例：
    * ```js
      // 監視プロパティのパターン
      const vm = Vue.createApp({
        data() { return { firstNmae: 'Foo', lastName: 'Bar', fullName: 'Foo Bar' }},
        watch: {
          firstName(val) { this.fullName = val + ' ' + this.lastName },
          lastName(val) { this.fullName = this.firstName + ' ' + val }
        }
      }).mount('#app')
      ```
    * ```js
      // 算出プロパティで書き換えたパターン
      const vm = Vue.createApp({
        data() { return { firstName: 'Foo', lastName: 'Bar' } },
        computed: {
          fullName() { return this.firstName + ' ' + this.lastName }
        }
      }).mount('#app')
      ```