# クラスとスタイルのバインディング_

## HTMLクラスのバインディング_
### オブジェクト構文
  * ```html
    <div :class="{ active: isActive }"></div>
    ```
    * `:class` にオブジェクト `{...}` を渡すことで動的にクラスを切り替えられる_
    * `active` クラスの有無が、データプロパティ `isActive` の真偽値に依って決まる_
  * ```html
    <div
      class="static"
      :class="{ active: isActive, 'text-danger': hasError }"
    ></div>
    ```
    * `:class` に渡すオブジェクトのフィールドは複数でもよい_
    * `:class` ディレクティブは、プレーンな `class` 属性と共存できる_
    * ```js
      // 以下のようなデータ定義の場合：
      data() { return { isActive: true, hasError: false }}
      ```
    * ```html
      <!-- 以下のようにレンダリングされる： -->
      <div class="static active"></div>
      ```
  * ```html
    <div :class="classObject"></div>
    ```
    * ```js
      // オブジェクトをインラインで書かずに `data()` で束縛することもできる
      data() { return { classObject: { active: true, 'text-danger': false }}}
      ```
    * ```js
      // オブジェクトを返す算出プロパティで束縛することもできる
      data() { return {　isActive: true, error: null　}},
      computed: {
        classObject() {
          return {
            active: this.isActive && !this.error,
            'text-danger': this.error && this.error.type === 'fatal'
          }
        }
      }
      ```

### 配列構文
  * ```html
    <div :class="[activeClass, errorClass]">
    ```
    * `:class` ディレクティブに配列を渡してクラスのリストを適用することもできる_
    * ```js
      // 以下のようなデータ定義の場合：
      data() { return { activeClass: 'active', errorClass: 'text-danger' }}
      ```
    * ```html
      <!-- 以下のようにレンダリングされる -->
      <div class="active text-danger"></div>
      ```
  * リスト内のクラスを条件に応じて切り替えたい場合
    * ```html
      <div :class="[isActive ? activeClass : '', errorClass]"></div>
      ```
    * ```html
      <div :class="[{ active: isActive }, errorClass]"></div>
      ```

### コンポーネントにおいて
  * 単一のルート要素を持つカスタムコンポーネントの場合
    * ```js
      // こういうコンポーネントがあったとして
      app.component('my-component', {
        template: `<p class="foo bar">Hi!</p>`
      })
      ```
    * ```html
      <!-- 使うときにクラスを追加すると・・・ -->
      <my-component class="baz boo"></my-component>
      ```
    * ```html
      <!-- 以下のようなレンダリングされる -->
      <p class="foo bar baz boo">Hi!</p>
      ```
  * 複数のルート要素をもつカスタムコンポーネントの場合
    * `$attrs` コンポーネントプロパティを使って、どの要素がクラスを受け取るか定義する必要がある_
    * ```html
      <my-component class="baz"></my-component>
      ```
    * ```js
      app.component('my-component', {
        template: `
          <p :class="$attrs.class">Hi!</p>
          <span>this is a child component</span>
        `
      })
      ```


## インラインスタイルのバインディング_
### オブジェクト構文
  * HTMLクラスのバインディングと考え方は同じ_
  * `style` 属性に直接オブジェクトを渡すパターン_
    * ``` html
      <div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
      ```
    * ``` js
      data() { 
        return { activeColor: 'red', fontSize: 30 }
      }
      ```
  * データプロパティでオブジェクトを束縛するパターン_
    * ```html
      <div :style="styleObject"></div>
      ```
    * ```js
      data() {
        return {
          styleObject: { color: 'red', fontSize: '13px' }
        }
      }
      ```

### 配列構文
  * 同じ要素に複数のスタイルオブジェクトを適用できる
  * ```html
    <div :style="[baseStyle, overridingStyles]"></div>
    ```

### 自動プレフィックス
### 複数の値
