const actions = {
  M: 'moveTo',
  C: 'bezierCurveTo',
  L: 'lineTo',
  Z: 'closePath'
}

function drawSVGPath (ctx, path, isFill) {
  ctx.beginPath()
  const pathArr = path.split(/\s(?=[a-zA-Z])/g)
  pathArr.forEach((p) => {
    var action = p.slice(0, 1)
    var args = p.slice(1).split(/,|\s/g)
    ctx[actions[action]].apply(ctx, args)
    console.log('ctx.' + actions[action] + '(' + args.toString() + ')')
  })
  if (isFill) {
    ctx.fill()
  } else {
    ctx.storke()
  }
  ctx.draw()
}

function drawColorBackground (ctx, start, end, width, height, colors, noGradient) {
  colors = colors || ['#ffa7a6', '#fea9ac', '#feacae', '#fdb7b5', '#fdbeb9', '#fbcac0', '#f9cdc2']
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
  ctx.draw(true, function () {
    if (!blur) return
    wx.canvasGetImageData({
      canvasId: cvsId,
      x: 0,
      y: 0,
      width: width,
      height: height,
      success: (res) => {
        ctx.clearRect(0, 0, width, height)
        drawImageFromU8(blurImage(res.data, width, height, blur), cvsId, width, height, blur)
      }
    })
  })
}

function drawImageFromU8 (imgData, cvsId, width, height) {
  console.log(imgData)
  wx.canvasPutImageData({
    canvasId: cvsId,
    x: 0,
    y: 0,
    width: width,
    height: height,
    data: imgData,
    success (res) {
    },
    fail (er) {
      console.log('drawImageFromU8 failed', er)
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

export default {
  drawSVGPath,
  drawColorBackground,
  drawImageBackground
}
