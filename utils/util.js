function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}

var errortype = require('../data/errorcode.js')
var index = require('../data/data_index.js')


function getError() {
  return errortype.errorcode;
}
function getData2(){
  return index.index;
}
module.exports.getError = getError;
module.exports.getData2 = getData2;