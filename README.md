# vue-i18n-xlsx
## 简介
基于webpack2.x，一个把 vue 项目中的翻译提取到 excel 以及输出到 js 文件的命令行工具

## 特点
1. 将整个项目的$t(xxx)或者Vue.t(yyy)的所有内容提取出来，然后将内容按照文本长度顺序导入进excel里面
2. 将excel的翻译导入进项目的指定目录里面，按照vue-i18n的翻译格式生成js文件
3. 可以将除了该分支下的别的分支的翻译一并合在一起

## 用法
1. i18n-xlsx -p, --path [value] 指定要收集翻译的项目路径
2. i18n-xlsx -b, --branch [value] 指定哪些分支可以收集翻译
3. i18n-xlsx -i, --ignore-branch [value] 忽略哪些分支，不收集翻译
4. i18n-xlsx -c, --current-branch 只收集当前分支的翻译
5. i18n-xlsx -a, --all-branch 收集所有分支的翻译

## 结果
### Excel文件
| index | zh | en | gb |
| ----- | -- | -- | -- |
| 中国 | 中国 | China | 中國 |
| 你好 | 你好 | Hello | 你好 |
| ... | ... | ... | ... |
### js文件
```js
/**
 *  Generate by vue-i18n-xlsx
 *  Do not modify this file manually
 */
export const zh = {...}
export const en = {...}
export const gb = {...}
```

### .eslintignore
\[path\]/\[filename\].js

## 其他配置
也可以将path配置在项目的config/index.js中，只要加上以下配置即可
```js
export default {
  ...,
  i18n: {
    entry1: {
      entry: 'src/entries/entry1',
      input: 'src/i18n/entry1.xlsx',
      output: 'src/i18n/entry1/index.js'
    },
    entry2: {
      entry: 'src/entries/entry2',
      input: 'src/i18n/entry2.xlsx',
      output: 'src/i18n/entry2/index.js'
    }
  }
}
```
