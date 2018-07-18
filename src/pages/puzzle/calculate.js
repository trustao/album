// 输入 Uint8ClampedArray
// 返回 Uint8ClampedArray
function blurUint8 (sourceU8, width, height, blur) {
  const source = {
    r: [],
    g: [],
    b: [],
    a: []
  }
  const target = {
    r: [],
    g: [],
    b: [],
    a: []
  }
  const res = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < sourceU8.length; i++) {
    switch (i % 4) {
      case 0:
        source.r.push(sourceU8[i])
        break
      case 1:
        source.g.push(sourceU8[i])
        break
      case 2:
        source.b.push(sourceU8[i])
        break
      case 3:
        source.a.push(sourceU8[i])
        break
    }
  }
  for (let key in source) {
    gaussBlur(source[key], target[key], width, height, blur)
  }
  for (let i = 0; i < target.r.length; i++) {
    res[i * 4] = target.r[i]
    res[i * 4 + 1] = target.g[i]
    res[i * 4 + 2] = target.b[i]
    res[i * 4 + 3] = target.a[i]
  }
  return res
}

// 三次均值模糊代替高斯模糊
function gaussBlur (scl, tcl, w, h, r) {
  var bxs = boxesForGauss(r, 3)
  boxBlur(scl, tcl, w, h, (bxs[0] - 1) / 2)
  boxBlur(tcl, scl, w, h, (bxs[1] - 1) / 2)
  boxBlur(scl, tcl, w, h, (bxs[2] - 1) / 2)
}

function boxesForGauss (sigma, n) {
  var wIdeal = Math.sqrt((12 * sigma * sigma / n) + 1)
  var wl = Math.floor(wIdeal)
  if (wl % 2 === 0) wl--
  var wu = wl + 2

  var mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4)
  var m = Math.round(mIdeal)

  var sizes = []
  for (var i = 0; i < n; i++) sizes.push(i < m ? wl : wu)
  return sizes
}

function boxBlur (scl, tcl, w, h, r) {
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var val = 0
      for (var iy = i - r; iy < i + r + 1; iy++) {
        for (var ix = j - r; ix < j + r + 1; ix++) {
          var x = Math.min(w - 1, Math.max(0, ix))
          var y = Math.min(h - 1, Math.max(0, iy))
          val += scl[y * w + x]
        }
      }
      tcl[i * w + j] = val / ((r + r + 1) * (r + r + 1))
    }
  }
}

function matrix3Multiply (matrix3, matrixCoord) {
  const res = []
  for (var i = 0; i < 3; i++) {
    res.push(matrix3[i * 3] * matrixCoord[0] + matrix3[i * 3 + 1] * matrixCoord[1] + matrix3[i * 3 + 2] * matrixCoord[2])
  }
  return res
}

function coordsTransform (matrix3, coordArr) {
  if (coordArr.length % 2 === 1) {
    return
  }
  let res = []
  for (var i = 0; i < coordArr.length; i = i + 2) {
    res = res.concat(new Coord(coordArr.slice(i, i + 2)).transform(matrix3).toArray())
  }
  return res
}

function matrix3 (a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
  return [
    a, b, e,
    c, d, f,
    0, 0, 1
  ]
}

function matrixCoord (x, y) {
  return [x, y, 1]
}

class Coord {
  constructor (x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
      this.x = x || 0
      this.y = y || 0
    } else if (Array.isArray(x) && x.length === 2) {
      this.x = x[0] || 0
      this.y = x[1] || 0
    }
  }
  translate (x, y) {
    this.transform(matrix3(1, 0, 0, 1, x, y))
    return this
  }
  scale (sx, sy) {
    this.transform(matrix3(sx, 0, 0, sy, 0, 0))
    return this
  }
  roate (deg) {
    const r = Math.PI / 180 * deg
    this.transform(matrix3(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0))
    return this
  }
  skew (x, y) {
    const rX = Math.PI / 180 * x
    const rY = Math.PI / 180 * y
    this.transform(matrix3(1, Math.tan(rY), Math.tan(rX), 1, 0, 0))
    return this
  }
  transform (matrix3) {
    var res = matrix3Multiply(matrix3, matrixCoord(this.x, this.y))
    this.x = res[0]
    this.y = res[1]
    return this
  }
  toArray () {
    return [this.x, this.y]
  }
}

export {
  coordsTransform,
  blurUint8,
  matrix3,
  Coord
}