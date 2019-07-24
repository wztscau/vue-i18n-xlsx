const path = require('path')
const fs = require('fs')
const Input = require('./lib/input')
const Ouput = require('./lib/output')
const chalk = require('chalk')
const Warn = console.warn
const Error = console.error

module.exports = function (rootPath) {
  let projectPath = rootPath ? path.resolve(__dirname, rootPath) : path.join(__dirname, '../..')

  ;(function () {
    while (projectPath.split(path.sep).filter(p => p).length !== 1) {
      if (fs.readdirSync(projectPath).includes('package.json')) {
        return
      }
      projectPath = path.resolve(projectPath, '..')
    }
    Error(chalk.red('Error: Not a node repository (or any of the parent directories): package.json'))
    process.exit(1)
  })()

  // Read config
  let config = {}
  try {
    config = require(path.join(projectPath, 'config/index.js'))
  } catch (e) {
    Warn(chalk.yellow(
      chalk.bgYellow.black(' WARN '),
      'No config/index.js. Read webpack.config.js'
    ))
    try {
      config = require(path.join(projectPath, 'webpack.config.js'))
    } catch (e) {
      Error(chalk.red(
        chalk.bgRed.black(' ERROR '),
        'No any config file'
      ))
    }
  }

  // Default path config
  const indexEntry = {
    entry: 'src',
    input: 'src/i18n/index.xlsx',
    output: 'src/i18n/index.js'
  }
  const {
    i18n = {
      index: indexEntry
    }
  } = config

  // Output to excel && Output to js
  Object.values(i18n).forEach(({
    entry = indexEntry.entry,
    input = indexEntry.input,
    output = indexEntry.output
  }) => {
    Input(path.join(projectPath, entry), path.join(projectPath, input), projectPath)
    Ouput(path.join(projectPath, input), path.join(projectPath, output), projectPath)
  })
}
