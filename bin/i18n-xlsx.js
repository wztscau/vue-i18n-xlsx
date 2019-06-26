#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const Program = require('commander')

Program
  .version('1.0.0')
  .usage('[options] [value ...]') 
  .option('-p, --path [value]', '', '')
  .parse(process.argv)

let pwd = process.cwd()
if (!Program.path) {
  ;(function () {
    while (pwd.split(path.sep).filter(p => p).length !== 1) {
      if (fs.readdirSync(pwd).includes('package.json')) {
        return
      }
      pwd = path.resolve(pwd, '..')
    }
    throw new Error('Error: Not a node repository (or any of the parent directories): package.json')
  })()
}

let rootPath = Program.path || pwd
require(path.join(__dirname, '../index.js'))(rootPath)
