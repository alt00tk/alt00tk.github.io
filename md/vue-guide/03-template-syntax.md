# テンプレート構文


## 展開
### テキスト
  * Mustanche構文 (二重中括弧) を利用したテキスト展開
  * 対応するコンポーネントインスタンスから `msg` プロパティの値に置き換えられる_
  * `msg` プロパティの変更がリアルタイムに反映される_
  * ```html
    <span>Message: {{ msg }}</span>
    ```
  * `v-once` ディレクティブ_
    * 一度だけ展開する、データ変更時の更新は行われない
    * 同じノードの他のバインディグにも影響が及ぶので注意_
    * ```html
      <span v-once>This will never change: {{ msg }}</span>
      ```

### 生のHTML
  * HTMLとして出力したいときは `v-html` ディレクティブを使う_
  * 以下 `span` のコンテンツは `rawHtml` プロパティの値に置き換えられる
  * XSS脆弱性の危険もあるので、ユーザーから提供されたコンテンツに対しては使わないこと_
  * 例：
    * ```html
      <!-- ① 以下のようなテンプレート定義で、 -->
      <p>Using v-html directive: <span v-html="rawHtml"></span></p>
      ```
    * ```html
      <!-- ② rawHtmlプロパティが以下の定義の場合、 -->
      <script> rawHtml: '<span style="color: red;">This should be red.</span>'</script>
      ```
    * ```html
      <!-- ③ 最終的には以下 HTML がレンダリングされる -->
      <p>Using v-html directive: <span style="color: red;">This should be red.</span></p>
      ```

### 属性
  * Mustanche構文は HTML属性では使えない
  * `v-bind` ディレクティブを使って、値をバインドする_
  * バインドされた値が `null` や `undefined` の場合、その属性はレンダリングされた要素から省略される
  * ```html
    <div v-bind:id="dynamicId"></div>
    <button v-bind:disabled="isButtonDisabled">Button</button>
    ```

### JavaScript 式の使用
  * データバインディング内部で JavaScript式を使える_
  * ただし、単一式だけ
  * ```html
    <!-- 動く例 -->
    <span>{{ number + 1 }}</span>
    <span>{{ isOk ? 'Yes' : 'No' }}</span>
    <span>{{ message.split('').reverse().join('') }}</span>
    <div v-bind:id="'list-' + id"></div>
    ```
  * 文や if文などのフロー制御は使えない
  * ```html
    <!-- 動かない例 -->
    <span>{{ var a = 1; }}</span>
    <span>{{ if (isOk) { return message;} }}</span>
    ```


## ディレクティブ
  * `v-` から始まる特別な属性
  * 単一の JavaScript式を期待する (`v-for` と `v-on` は例外)
  * 属性値の式が変化したとき、リアクティブに副作用を DOM に適用する
    * リアクティブ (reactive)
    * 外部からの入力や時間経過によってデータが変化したときに、変化した値を自動的に反映する

### 引数
  * 引数を取るディレクティブがある
  * その場合は、ディレクティブ名のあとにコロンで表記する
  * ```html
    <!-- 式:url の評価値を href属性へバインドする -->
    <a v-bind:href="url">何らかのリンク</a>
    ```
  * ```html
    <!-- clickイベントが発火したとき, doSomething のイベントハンドラーを実行 -->
    <a v-on:click="doSomething">何らかのリンク</a>
    ```

### 動的引数
  * JavaScript式をディレクティブの引数に使うこともできる_
  * その場合は角括弧で囲む
  * 動的引数にはいくつか制約があるので注意
  * ```html
    <!-- attributeName は JavaScript式として動的に評価される -->
    <!-- attributeName = "href" の場合は v-bind:href と等しくなる -->
    <a v-bind:[attributeName]="url">何らかのリンク</a>
    ```

### 修飾子
  * ドットで表記される特別な接尾語
  * ディレクティブが特別な方法でバインドされることを示す_
  * `.prevent`修飾子が `v-on`ディレクティブに付いている場合、`event.preventDefault()` が呼ばれる_
  * ```html
    <form v-on:submit.prevent="onSubmit">...</form>
    ```


## 省略記法
  * 最もよく使われるディレクティブ `v-bind` と `v-on` には省略記法がある_

### `v-bind` 省略記法
  * ```html
    <!-- 完全な構文 -->
    <a v-bind:href="url">なんらかのリンク</a>
    ```
  * ```html
    <!-- 省略記法 -->
    <a :href="url">なんらかのリンク</a>
    ```
  * ```html
    <!-- 動的引数の省略記法 -->
    <a :[key]="url">なんらかのリンク</a>
    ```

### `v-on` 省略記法
  * ```html
    <!-- 完全な構文 -->
    <a v-on:click="doSomething"></a>
    ```
  * ```html
    <!-- 省略記法 -->
    <a @click="doSomething"></a>
    ```
  * ```html
    <!-- 動的引数の省略記法 -->
    <a @[event]="doSomething"></a>
    ```

### 注意事項
#### 動的引数の値の制約
  * String に評価されることが想定されている (nullは例外)
  * null値の場合はバインディングが削除される、属性指定が省略される_
  * String 以外の値は警告

#### 動的引数の式の制約
  * 構文上の制約がある
  * スペースや引用符のような一部の文字は HTML の属性名として使えないため_
  * 複雑な式は算出プロパティで置き換える
  * 引数に指定するプロパティには大文字は使わないこと (ブラウザが強制的に属性名を小文字に変換するため)
  * ```html
    <!-- 以下はコンパイル時にエラーとなる -->
    <a v-bind:['foo' + bar]="value">なんらかのリンク</a>
    ```

#### JavaScript式の制約
  * テンプレート式はサンドボックス化されている
  * `Math` や `Date` といったグローバルホワイトリストに定義されているものだけ使える_
    * [グローバルホワイトリスト](https://github.com/vuejs/core/blob/main/packages/shared/src/globalsWhitelist.ts#L3)
  * ユーザーが定義したグローバルオブジェクトにはアクセスしてはいけない_