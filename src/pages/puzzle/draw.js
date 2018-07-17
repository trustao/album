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
    ctx.fill()
  } else {
    ctx.storke()
  }
}

function transfromStringToMatrix (str, matrix, scaleX, scaleY) {
  const match = str.match(/translate\((.*?)\)/)
  if (!match) return
  const translate = match[1].split(' ')
  matrix[2] += Number(translate[0]) * scaleX
  matrix[5] += Number(translate[1] || translate[0])
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
    this.weight += this.factor * Math.sqrt((this.x - center.x) ** 2 + (this.y - center.y) ** 2) | 0
    return this
  }
}

function getBlocks (viewW, viewH, cvsId, l, distanceFactor = 1, areaFactor = 0.2) {
  return new Promise((resolve, reject) => {
    const grid = createGrid(viewW, viewH, l, distanceFactor)
    const blocks = []
    wx.canvasGetImageData({
      canvasId: cvsId,
      x: 0,
      y: 0,
      width: viewW,
      height: viewH,
      success (res) {
        grid.forEach((item, index) => {
          var endX = ''
          if (item.lastOne) {
            // 不全块
            endX = ((viewW - item.x) * 4 | 0)
          } else {
            endX = item.l * 4
          }
          for (var i = 0; i < item.l; i++) {
            var startIndex = ((item.y + i) * viewW + item.x) * 4 | 0
            var piexSum = res.data.slice(startIndex, startIndex + endX).filter(c => c).length / 4
            if (piexSum) {
              item.calcluateWeight({x: viewW / 2, y: viewH / 2})
              item.weight += piexSum * areaFactor
              blocks.push(item)
              return
            }
          }
        })
        resolve(blocks)
      },
      fail (err) {
        console.log('get stencil imageData failed', err)
        reject && reject(err)
      }
    })
  })
}

function createGrid (w, h, l) {
  const grid = []
  for (let i = 0; i < h; i = i + l) {
    for (let j = 0; j < w; j = j + l) {
      let block = new Block(j, i, l)
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
  getBlocks
}
