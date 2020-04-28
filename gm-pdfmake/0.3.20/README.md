# pdfmake

Client/server side PDF printing in pure JavaScript

Check out [the playground](http://bpampuch.github.io/pdfmake/playground.html) and [examples](https://github.com/bpampuch/pdfmake/tree/master/examples).


### 使用中文
pdfmake原文档有说明如何使用自定义字体[Custom Fonts client side](https://github.com/bpampuch/pdfmake/wiki/Custom-Fonts---client-side)

通过看文档和gulpfile.js之后发现，主要3个点实现自定义字体：
1. 把字体文件base64之后得到的字符串赋值给`pdfMake.vfs`；
```js
pdfMake.vfs = {
  "fontFile.ttf": "xxxxx",
  "fontFile2.ttf": "xxxxx",
  "fontFile3.ttf": "xxxxx",
  "fontFile4.ttf": "xxxxx"
}
```
2. 在`pdfMake.fonts`中声明要用到的字体；
```js
pdfMake.fonts = {
   yourFontName: {
     normal: 'fontFile.ttf',
     bold: 'fontFile2.ttf',
     italics: 'fontFile3.ttf',
     bolditalics: 'fontFile4.ttf'
   }
}
```
3. 在PDF文档结构中指定使用的字体名称
```js
var docDefinition = {
  content: (...),
  defaultStyle: {
    font: 'yourFontName'
  }
}
```

### 优化
由于字体文件太大，电脑上copy过来的字体大小在10~20M，不适合直接拿来用。这里我们在2个方向做了优化。
1. 精减字体，提取7000常用汉字；
使用`font-spider`对字体做精简，具体可参考[font-min-cut](https://github.com/gmfe/font-min-cut)
2. 分切base64之后的字符串，并行加载，然后在客户端拼接；
在`gulpfile.json`中，我添加了`splitFonts`task，`gulp splitFonts`之后会在`build/splits`目录下生成分切后的js文件。


### Note
1. 由于`font-spider`存在无法提取空格的bug，所以需要使用[fontcreator](http://www.high-logic.com/font-editor/fontcreator.html)进行字体编辑，添加空格，only windows版本。
2. `./examples/fonts`中的`regular.ttf`、`bold.ttf`已经添加了空格，但是在观麦的配送单模块中，时常会出现某些客户的sku名称存在生僻字不在我们的7000常用字当中，这时需要我们提取这些生僻字，然后通过`fontcreator软件`把提取出来的生僻字添加到`regular.ttf`、`bold.ttf`中，然后重新`gulp splitFonts`。

