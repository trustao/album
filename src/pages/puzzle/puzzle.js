const actions = {
  M: "moveTo",
  C: "bezierCurveTo",
  L: "lineTo",
  Z: "closePath"
}

function drawSVGPath (ctx, path, isFill) {
  ctx.beginPath()
  const pathArr = path.split(/\s(?=[a-zA-Z])/g)
  pathArr.forEach((p) => {
    var action = p.slice(0, 1)
    var args = p.slice(1).split(/,|\s/g)
    ctx[actions[action]].apply(ctx, args)
  })
  if (isFill) {
    ctx.fill()
  } else {
    ctx.storke()
  }
}

function drawColorBackground (ctx, colors = [], start, end, width, height, noGradient) {
  colors = colors.length || ["#ffa7a6", "#fea9ac", "#feacae", "#fdb7b5", "#fdbeb9", "#fbcac0", "#f9cdc2"]
  var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y)
  if (noGradient) {
    colors.forEach((color, i) => {
      grd.addColorStop(i / colors.length, color)
      grd.addColorStop((i + 1) / colors.length, color)
    })
  } else {
    colors.forEach((color, i) => {
      grd.addColorStop(i / (colors.length - 1), color)
    })
  }
  // Fill with gradient
  ctx.setFillStyle(grd)
  ctx.fillRect(0, 0, width, height)
  ctx.draw()
}

function drawImageBackground (ctx, path, cvsId, blur, width, height) {
  ctx.drawImage(path, 0, 0, width, height)
  ctx.draw(() => {
    wx.canvasGetImageData({
      canvasId: cvsId,
      x: 0,
      y: 0,
      width: width,
      height: height,
      success: (res) => {
        ctx.clearRect(0, 0, width, height)
        console.log(res.data instanceof Uint8ClampedArray) // true
        const sourceU8 = res.data
        res.data = blurImage(sourceU8)
        drawImageFromU8(res, cvsId, width, height, blur)
      }
    })
  })
}

function drawImageFromU8 (imgData, cvsId, width, height) {
  wx.canvasPutImageData({
    canvasId: cvsId,
    x: 0,
    y: 0,
    width: width,
    height: height,
    data: imgData,
    success (res) {
    },
    fail () {
      console.log('drawImageFromU8 failed')
    }
  })
}

function blurImage (sourceU8, width, height, blur) {
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
  const res = []
  for (let i = 0; i < sourceU8.length; i++) {
    switch (i % 4) {
      case 0:
        source.r.push(source[i])
        break
      case 1:
        source.g.push(source[i])
        break
      case 2:
        source.b.push(source[i])
        break
      case 3:
        source.a.push(source[i])
        break
    }
  }
  for (let key in source) {
    gaussBlur(source[key], target[key], width, height, blur)
  }
  for (let i = 0; i < target.r.length; i++) {
    res.push(target.r)
    res.push(target.g)
    res.push(target.b)
    res.push(target.a)
  }
  return new Uint8ClampedArray(res)
}

function gaussBlur (scl, tcl, w, h, r) {
  var bxs = boxesForGauss(r, 3)
  boxBlur(scl, tcl, w, h, (bxs[0] - 1) / 2)
  boxBlur(tcl, scl, w, h, (bxs[1] - 1) / 2)
  boxBlur(scl, tcl, w, h, (bxs[2] - 1) / 2)
}

function boxesForGauss (sigma, n) {
  var wIdeal = Math.sqrt((12 * sigma * sigma / n) + 1)
  var wl = Math.floor(wIdeal)
  if (wl % 2 == 0) wl--
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

export default {
  drawSVGPath,
  drawColorBackground,
  drawImageBackground
}
