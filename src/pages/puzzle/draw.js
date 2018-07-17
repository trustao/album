import {blurUint8, coordsTransform, matrix3} from './calculate'
const actions = {
  M: 'moveTo',
  C: 'bezierCurveTo',
  L: 'lineTo',
  Z: 'closePath'
}

function drawSVGPath (ctx, svg, x, y, width, height, isFill) {
  const sX = width / svg.width
  const sY = height / svg.height
  var transMatrix = matrix3(sX, 0, 0, sY, x, y)
  if (svg.transform) {
    transfromStringToMatrix(svg.transform, transMatrix, sX, sY)
  }
  ctx.beginPath()
  const pathArr = svg.path.split(/\s(?=[a-zA-Z])/g)
  pathArr.forEach((p) => {
    var action = p.slice(0, 1)
    var args = p.slice(1).split(/,|\s/g)
    ctx[actions[action]].apply(ctx, coordsTransform(transMatrix, args))
    // console.log('ctx.' + actions[action] + '(' + args.toString() + ')')
  })
  if (isFill) {
    ctx.setFillStyle('#fff')
    ctx.fill()
  } else {
    ctx.setStrokeStyle('#fff')
    ctx.stroke()
  }
}

function transfromStringToMatrix (str, matrix, scaleX, scaleY) {
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
export default {
  drawSVGPath,
  drawColorBackground,
  drawImageBackground,
  Block,
  transfromStringToMatrix,
  getImageData,
  getBlocks,
  createGrid
}
