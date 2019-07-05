const Excel = require('node-xlsx').default
const fs = require('fs')
const path = require('path')
const mergeSort = require('./utils').mergeSort
const mkdirsSync = require('./utils').mkdirsSync

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
  console.time('> Done! Generate excel time: ')
  // Input file name same as node file name. Return
  let invalidFileNames = traversingDirectory(__dirname).map(({fileName}) => fileName)
  if (invalidFileNames.includes(filePath)) {
    console.error('Error: Invalid file name. Terminate')
    return
  }
  // File path must end with .xlsx
  filePath = filePath.endsWith('.xlsx') ? filePath : filePath + '.xlsx'
  /*
   * Read stage
   */
  // Read from excel. Get head and data
  let inputData = []
  try {
    inputData = Excel.parse(filePath)[0].data
  } catch (e) {
    console.warn('Warn: Excel file not exist')
    mkdirsSync(path.dirname(filePath))
    fs.writeFileSync(filePath, Excel.build([{name: path.basename(filePath, '.xlsx'), data: null}]))
  }
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
  console.log(`> Length of i18n`, i18ns.length)

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
  // Build
  let buffer = Excel.build([{name: path.basename(filePath, '.xlsx'), data: outputData}])
  fs.writeFileSync(filePath, buffer)
  ///////// END /////////
  console.timeEnd('> Done! Generate excel time: ')
}