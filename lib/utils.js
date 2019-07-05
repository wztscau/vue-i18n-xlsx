const fs = require('fs')
const path = require('path')

function mergeSort(arr, fn) {  //采用自上而下的递归方法
    if (typeof fn !== 'function') {
      throw Error('fn parameter required')
    }
    var len = arr.length;
    if(len < 2) {
        return arr;
    }
    var middle = Math.floor(len / 2),
        left = arr.slice(0, middle),
        right = arr.slice(middle);
    return merge(mergeSort(left, fn), mergeSort(right, fn), fn);
}

function merge(left, right, fn)
{
    var result = [];

    while (left.length>0 && right.length>0) {
        if (fn(left[0], right[0])) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

exports.mergeSort = mergeSort
exports.mkdirsSync = mkdirsSync