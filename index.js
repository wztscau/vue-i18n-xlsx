const path = require('path')
const Input = require('./lib/input')
const Ouput = require('./lib/output')


module.exports = function (rootPath) {
  const projectPath = rootPath ? path.resolve(__dirname, rootPath) : path.join(__dirname, '../..')

  // Read config
  let config = {}
  try {
    config = require(path.join(projectPath, 'config/index.js'))
  } catch (e) {
    console.warn('Warn: No config/index.js. Read webpack.config.js')
    try {
      config = require(path.join(projectPath, 'webpack.config.js'))
    } catch (e) {
      console.error('Error: No any config file')
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
