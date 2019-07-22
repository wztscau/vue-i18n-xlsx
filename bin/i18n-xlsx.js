#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const Program = require('commander')
const { exec, execSync } = require('child_process')

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
    console.error('Error: Not a node repository (or any of the parent directories): package.json')
    process.exit(1)
  })()
}

let rootPath = Program.path || pwd
let rootCwd = {cwd: rootPath}

let branchsStr = execSync('git branch -l', rootCwd).toString()
let branchs = branchsStr.split(/\n/).map(s => s.replace('*', '').trim()).filter(s => s)
console.log(`branchs`, branchs)
let currentBranch = branchsStr.match(/\*\s\b(.*)\b/m)[1]
execSync('git add . & git stash', rootCwd)
branchs.forEach(br => {
  if (br !== currentBranch) {
    let coSucc = false
    while (!coSucc) {
      try {
        execSync(`git checkout ${br}`, rootCwd)
        coSucc = true
      } catch (e) {
        // Sometimes would throw error 'Permission denied' in windows
        execSync('git reset --hard & git clean -df', rootCwd)
      }
    }
    // Collect all i18ns from different branchs into one excel
    require(path.join(__dirname, '../index.js'))(rootPath)
  }
})
execSync(`git checkout ${currentBranch} & git stash apply`, rootCwd)
