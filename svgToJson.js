/**
 * Created by TR0000009 on 2018/7/16.
 */
const fs = require('fs')
const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

const svgDir = resolve('src/images/stencil/')
console.log('start read svg. path: ' + svgDir)
const files = fs.readdirSync(svgDir)
files.filter(dir => /\.svg$/.test(dir)).forEach(function (dir, index, arr) {
  fs.readFile(svgDir + dir, 'utf8', function (err, data) {
    searchPath(dir.match(/(.*)\.svg$/)[1], data, arr.length)
  });
})
const result = {}
function searchPath(name, data, allLength) {
  if (result[name]) {
    console.error('repetitive svg name')
    return
  }
  const res = result[name] = {}
  data.replace(/([a-zA-Z]+?)\=\"(.*?)\"/g, function ($0, $1, $2) {
    switch ($1) {
      case 'width':
        res.width = +$2
            break
      case 'height':
        res.height = +$2
        break
      case 'viewBox':
        res.viewBox = $2
        break
      case 'transform':
        res.transform = $2
        break
      case 'd':
        res.path = $2
        break
    }
  })
  if (allLength === Object.keys(result).length) createJson()
}
function createJson() {
  fs.writeFile(svgDir + 'svg.json', JSON.stringify({
    name: Object.keys(result),
    data: result
  }), 'utf8', () => {
    console.log('svg to json complete. path: ' + svgDir + 'svg.json')
  });
}
