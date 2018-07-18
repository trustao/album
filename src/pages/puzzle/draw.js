import {blurUint8, coordsTransform, matrix3} from './calculate'
const actions = {
  M: 'moveTo',
  C: 'bezierCurveTo',
  L: 'lineTo',
  Z: 'closePath'
}

function radiusPath (ctx, x, y, l, deg) {
  ctx.beginPath()
  if (!deg) {
    ctx.rect(x, y, l, l)
    return
  }
  const pi = Math.PI
  const ox = x + l / 2
  const oy = y + l / 2
  if (deg >= 90) {
    deg = deg > 160 ? 160 : deg
    const r = l / 2 * (1 - Math.atan(pi / 180 * (deg - 90)))
    ctx.arc(ox, oy, r, 0, pi * 2)
    return
  }
  deg = pi / 180 * deg
  const sR = (pi / 2 - deg) / 2
  const eR = (pi / 2 + deg) / 2
  const h = Math.tan(sR)
  const r = l / (2 * Math.cos(sR))
  ctx.arc(ox, oy, r, sR, eR)
  ctx.lineTo(ox - h, y + l)
  ctx.arc(ox, oy, r, pi / 2 + sR, pi / 2 + eR)
  ctx.lineTo(x, oy - h)
  ctx.arc(ox, oy, r, pi + sR, pi + eR)
  ctx.lineTo(ox + h, y)
  ctx.arc(ox, oy, r, pi * 3 / 2 + sR, pi * 3 / 2 + eR)
  ctx.lineTo(x + l, oy + h)
  ctx.closePath()
}
function getSVGPath (ctx, svg, x, y, width, height) {
  const sX = width / svg.width
  const sY = height / svg.height
  var transMatrix = matrix3(sX, 0, 0, sY, x, y)
  if (svg.transform) {
    transformStringToMatrix(svg.transform, transMatrix, sX, sY)
  }
  const pathArr = svg.path.split(/\s(?=[a-zA-Z])/g)
  return pathArr.map((p) => {
    var action = p.slice(0, 1)
    var args = p.slice(1).split(/,|\s/g)
    return {
      action: [actions[action]],
      args: coordsTransform(transMatrix, args)
    }
  })
}

function transformStringToMatrix (str, matrix, scaleX, scaleY) {
  const match = str.match(/translate\((.*?)\)/)
  if (!match) return
  const translate = match[1].split(' ')
  matrix[2] += Number(translate[0]) * scaleX
  matrix[5] += Number(translate[1] || translate[0])
}

function drawColorBackground (ctx, start, end, width, height, colors, noGradient, cb) {
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
  ctx.draw(false, cb)
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
        drawImageFromU8(blurUint8(res.data, width, height, blur), cvsId, width, height, blur)
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
    fail (er) {
      console.log('drawImageFromU8 failed', er)
    }
  })
}

class Block {
  constructor (x, y, l, weight, factor) {
    this.x = x || 0
    this.y = y || 0
    this.l = l || 0
    this.weight = weight || 0
    this.factor = factor !== undefined ? factor : 1
  }

  calcluateWeight (center) {
    this.weight += this.factor * (center.y * 2 - Math.sqrt((this.x - center.x) ** 2 + (this.y - center.y) ** 2) | 0)
    return this
  }
}

function getImageData (viewW, viewH, cvsId) {
  return new Promise((resolve, reject) => {
    wx.canvasGetImageData({
      canvasId: cvsId,
      x: 0,
      y: 0,
      width: viewW,
      height: viewH,
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        console.log('get stencil imageData failed', err)
        reject && reject(err)
      }
    })
  })
}

function getBlocks (grid, uint8Arr, viewW, areaFactor) {
  const blocks = []
  grid.forEach((item, index) => {
    let endX = ''
    let piexSum = 0
    if (item.lastOne) {
      endX = ((viewW - item.x) * 4 | 0)
    } else {
      endX = item.l * 4
    }
    for (let i = 0; i < item.l; i++) {
      const startIndex = ((item.y + i) * viewW + item.x) * 4 | 0
      piexSum += uint8Arr.slice(startIndex, startIndex + endX).filter(c => c).length
    }
    if (piexSum) {
      item.weight += piexSum * areaFactor
      blocks.push(item)
    }
  })
  return blocks
}

function createGrid (w, h, l, factor) {
  const grid = []
  for (let i = 0; i < h; i = i + l) {
    for (let j = 0; j < w; j = j + l) {
      let block = new Block(j, i, l, 0, factor)
      grid.push(block)
      if (j + l >= w) {
        block.lastOne = true
      }
    }
  }
  return grid
}

function requestAnimationFrame (callback) {
  var id = setTimeout(() => {
    callback && callback()
  }, 50)
  return id
}

export default {
  getSVGPath,
  drawColorBackground,
  drawImageBackground,
  Block,
  transformStringToMatrix,
  getImageData,
  getBlocks,
  createGrid,
  radiusPath,
  requestAnimationFrame
}
