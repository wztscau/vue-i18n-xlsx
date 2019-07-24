const Excel = require('node-xlsx').default
const fs = require('fs')
const path = require('path')
const os = require('os')
const mergeSort = require('./utils').mergeSort
const mkdirsSync = require('./utils').mkdirsSync
const chalk = require('chalk')
const Log = console.log
const Warn = console.warn
const Error = console.error

/**
 * traversingDirectory
 * @param {string} rootPath 
 * @param {function} fileCb 
 * @returns {array} files
 */
function traversingDirectory (rootPath, fileCb) {
  let files = fs.readdirSync(rootPath)
  let fileArr = global._fileArr || []
  files.forEach(function (fileName) {
    // Filter node_modules
    if (fileName === 'node_modules') {
      return
    }
    let fileDir = path.join(rootPath, fileName)
    let stats = fs.statSync(fileDir)
    let isFile = stats.isFile()
    let isDir = stats.isDirectory()
    if (isFile) {
      typeof fileCb === 'function' && fileCb(fs.readFileSync(fileDir, 'utf-8'), fileName, fileDir)
      fileArr.push({fileName, fileDir})
      global._fileArr = fileArr
    } else if (isDir) {
      traversingDirectory(fileDir, fileCb)
    }
  })

  global.fileArr = []
  return fileArr
}

module.exports = function (rootPath, filePath, projectPath) {
  ///////// START /////////
  let startTime = Date.now()
  // Input file name same as node file name. Return
  let invalidFileNames = traversingDirectory(__dirname).map(({fileName}) => fileName)
  if (invalidFileNames.includes(filePath)) {
    console.error('Error: Invalid file name. Terminate')
    return
  }
  // File path must end with .xlsx
  filePath = filePath.endsWith('.xlsx') ? filePath : filePath + '.xlsx'
  // Init directory
  !fs.existsSync(rootPath) && mkdirsSync(rootPath)
  !fs.existsSync(filePath) && mkdirsSync(path.dirname(filePath))
  /*
   * Read stage
   */
  // Read from excel. Get head and data
  let inputData = []
  try {
    let tmpFilePath = path.join(os.tmpdir(), 'vue-i18n-xlsx', path.basename(projectPath), path.basename(filePath))
    inputData = Excel.parse(tmpFilePath)[0].data
  } catch (e) {
    try {
      inputData = Excel.parse(filePath)[0].data
    } catch (e) {
      Warn(chalk.yellow(
        chalk.bgYellow.black(' WARN '),
        'Excel file not exist'
      ))
      mkdirsSync(path.dirname(filePath))
      fs.writeFileSync(filePath, Excel.build([{name: path.basename(filePath, '.xlsx'), data: null}]))
    }
  }
  console.log(`> Length of i18n before reading from project:`, inputData.length)
  // zh keys
  let i18ns = inputData.map(row => row[0]).filter(col => col !== 'index')
  const i18nReg = /\$t\(['"`](.*?)['"`](?:\s*,.*?)?\)/
  // Get all i18ns from project
  traversingDirectory(rootPath, function (fileContent, filePath, fileDir) {
    if (/\.(vue|js)$/.test(filePath)) {
      let matchList = fileContent.match(RegExp(i18nReg, 'gm'))
      if (matchList) {
        i18ns = i18ns.concat(matchList.map(item => item.replace(i18nReg, '$1')))
      }
    }
  })
  // unique & sort
  i18ns = mergeSort(Array.from(new Set(i18ns)), (a, b) => a.length <= b.length)

  /*
   * Write stage
   */
  let header = inputData[0] || ['index', 'zh', 'en', 'gb']
  let outputData = [header]
  // Generate excel data
  i18ns.forEach(zh => {
    let colsLen = outputData[0].length
    let row = []
    for (let i = 0; i < colsLen; i++) {
      // index
      if (i === 0) {
        row.push(zh)
      // zh
      } else if (i === 1) {
        let inputRow = inputData.find(row => row.includes(zh))
        row.push(inputRow ? inputRow[i] : zh)
      // others
      } else {
        let inputRow = inputData.find(row => row.includes(zh))
        row.push(inputRow ? inputRow[i] : null)
      }
    }
    outputData.push(row)
  })
  console.log(`> Length of i18n after reading from project and excel itself:`, outputData.length,
    outputData.length === inputData.length ? '\033[40;36m (no changed) \033[0m' : '')
  // Build
  let buffer = Excel.build([{name: path.basename(filePath, '.xlsx'), data: outputData}])
  fs.writeFileSync(filePath, buffer)
  ///////// END /////////
  Log(chalk.green(
    chalk.bgGreen.black(' DONE '),
    `Generate excel successfully in ${Date.now()-startTime} ms`
  ))
  // Tmp
  let tmpProject = path.join(os.tmpdir(), 'vue-i18n-xlsx', path.basename(projectPath))
  !fs.existsSync(tmpProject) && mkdirsSync(tmpProject)
  fs.writeFileSync(path.join(tmpProject, path.basename(filePath)), buffer)
}