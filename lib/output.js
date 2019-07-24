const Excel = require('node-xlsx').default
const fs = require('fs')
const path = require('path')
const mkdirsSync = require('./utils').mkdirsSync
const chalk = require('chalk')
const Log = console.log
const Warn = console.warn
const Error = console.error

module.exports = function (excelPath, jsPath, projectPath) {
  ///////// START /////////
  let startTime = Date.now()
  // File path must end with .xlsx
  excelPath = excelPath.endsWith('.xlsx') ? excelPath : excelPath + '.xlsx'
  // Read from excel
  let inputData = []
  try {
    inputData = Excel.parse(excelPath)[0].data
  } catch (e) {
    Warn(chalk.yellow(
      chalk.bgYellow.black(' WARN '),
      'Excel file not exist'
    ))
    return
  }
  // Generate json
  let head = inputData[0]
  let data = {}
  for (let i = 1; i < inputData.length; i++) {
    let row = inputData[i]
    for (let j = 1; j < head.length; j++) {
      let col = row[j]
      let lang = data[head[j]] = data[head[j]] || {}
      lang[row[0]] = col || ''
    }
  }
  // Build
  if (!fs.existsSync(jsPath)) {
    mkdirsSync(path.dirname(jsPath))
  }
  fs.writeFileSync(jsPath,
  `
    /**
     *  Generate by vue-i18n-xlsx
     *  Do not modify this file manually
     */
    export default ${JSON.stringify(data, null, 8)}
  `
  )
  // Add jspath into .eslintignore
  let eslintignore = path.join(projectPath, '.eslintignore')
  let eslint = ''
  try {
    eslint = fs.readFileSync(eslintignore, 'utf-8')
  } catch (e) {
    Warn(chalk.yellow(
      chalk.bgYellow.black(' WARN '),
      '.eslintignore not found'
    ))
    fs.writeFileSync(eslintignore, '', {encoding: 'utf-8'})
    eslint = ''
  }
  let esPaths = eslint.split(/\r?\n/).filter(e => e)
  if (!esPaths.some(esPath => path.join(projectPath, esPath) === jsPath)) {
    fs.writeFileSync(
      eslintignore,
      `\n${jsPath.replace(projectPath + path.sep, '').replace(/\\/g, '/')}\n`,
      { flag: 'a+' }
    )
  }
  ///////// END /////////
  Log(chalk.green(
    chalk.bgGreen.black(' DONE '),
    `Generate js successfully in ${Date.now()-startTime} ms`
  ))
}