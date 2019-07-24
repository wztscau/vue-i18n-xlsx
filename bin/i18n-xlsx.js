#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const Program = require('commander')
const chalk = require('chalk')
const Log = console.log
const { exec, execSync } = require('child_process')

Program
  .version('1.0.0')
  .usage('[options] [value ...]') 
  .option('-p, --path [value]', '', '')
  .option('-b, --ignorebranch [value]', '', '')
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
    Log(chalk.red('Error: Not a node repository (or any of the parent directories): package.json'))
    process.exit(1)
  })()
}

let rootPath = Program.path || pwd
let ignoreBranch = Program.ignorebranch.split(',')
let rootCwd = {cwd: rootPath}


    require(path.join(__dirname, '../index.js'))(rootPath)

// let branchsStr = execSync('git branch -l', rootCwd).toString()
// let branchs = branchsStr.split(/\n/).map(s => s.replace('*', '').trim()).filter(s => s)
// let currentBranch = branchsStr.match(/\*\s\b(.*)\b/m)[1]
// execSync('git add . & git stash', rootCwd)
// for (let br of branchs) {
//   if (br === currentBranch || ignoreBranch.includes(br)) {
//     continue
//   }
//   let coSucc = false
//   while (!coSucc) {
//     try {
//       execSync(`git checkout ${br}`, rootCwd)
//       coSucc = true
//     } catch (e) {
//       // Sometimes occurs 'Permission denied' in windows
//       execSync('git reset --hard & git clean -df', rootCwd)
//     }
//   }
//   // Collect all i18ns from different branchs into one excel
//   require(path.join(__dirname, '../index.js'))(rootPath)
//   execSync('git reset --hard & git clean -df', rootCwd)
// }
// execSync(`git checkout ${currentBranch} & git stash apply`, rootCwd)
