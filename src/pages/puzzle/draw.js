import { blurUint8Array, coordsTransform, matrix3} from './calculate'
const actions = {
  M: 'moveTo',
  C: 'bezierCurveTo',
  L: 'lineTo',
  Z: 'closePath'
}

function radiusPath (ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (!r) {
    ctx.rect(x, y, w, h)
    return
  }
  const pi = Math.PI
  const ox = x + w / 2
  const oy = y + h / 2
  const l = w > h ? h : w
  if (r >= l / 2) {
    const R = l - r > 1 ? l - r : 1
    ctx.arc(ox, oy, R, 0, pi * 2)
    return
  }
  ctx.moveTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, w + x - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.closePath()
}

function getSvgActions (svg) {
  let minX = 1000, maxX = 0, minY = 1000, maxY = 0
  const pathArr = svg.path.split(/\s(?=[a-zA-Z])/g)
  const res = pathArr.map((p) => {
    var action = p.slice(0, 1)
    var args = p.slice(1).split(/,|\s/g)
    args.forEach((coord, index) => {
      if (action === 'Z') return
      if (index % 2 === 1) {
        if (+coord > maxY) maxY = +coord
        if (+coord < minY) minY = +coord
      } else {
        if (+coord > maxX) maxX = +coord
        if (+coord < minX) minX = +coord
      }
    })
    return {
      action: [actions[action]],
      args
    }
  })
  svg.width = maxX - minX
  svg.height = maxY - minY
  svg.minX = minX
  svg.minY = minY
  if (!svg.transform) {
    svg.transform = `translate(${-minX} ${-minY})`
  }
  // res.forEach(item => {
  //   item.args = item.args.map((coord, index) => {
  //     console.log(coord)
  //     if (coord) {
  //       return index % 2 ? (coord - minX) : (coord - minY)
  //     } else {
  //       return ''
  //     }
  //   })
  // })
  return res
}

function getSVGPath (svg, x, y, width, height) {
  let actions = svg.actions
  const transMatrix = calcTransMatrix(svg, x, y, width, height)
  return actions.map(item => {
    const res = {
      action: item.action,
      args: coordsTransform(transMatrix, item.args || [])
    }
    return res
  })
}

function calcTransMatrix (svg, x, y, width, height) {
  const sX = width / svg.width
  const sY = height / svg.height
  var transMatrix = matrix3(sX, 0, 0, sY, x, y)
  if (svg.transform) {
    transformStringToMatrix(svg.transform, transMatrix, sX, sY)
  }
  return transMatrix
}

function transformStringToMatrix (str, matrix, scaleX, scaleY) {
  const match = str.match(/translate\((.*?)\)/)
  if (!match) return
  const translate = match[1].split(' ')
  matrix[2] += Number(translate[0]) * scaleX
  matrix[5] += translate[1] ? Number(translate[1]) * scaleY : 0
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
}

function drawImageBackground (ctx, path, cvsId, blur, width, height, originImgData, cb) {

  ctx.drawImage(path, originImgData.x, originImgData.y, originImgData.w, originImgData.h)
  if (!blur) {
    if (cb) cb()
    return
  }
  ctx.draw(false, function () {
    setTimeout(() => {
      wx.canvasGetImageData({
        canvasId: cvsId,
        x: 0,
        y: 0,
        width: width,
        height: height,
        success: (res) => {
          drawImageFromU8(blurUint8Array(res.data, width, height, blur), cvsId, width, height, blur).then(() =>{
            if (cb) cb()
          })
        }
      })
    }, 100)
  })
}

function drawImageFromU8 (imgData, cvsId, width, height) {
  return new Promise((resolve, reject) => {
    try {
      wx.canvasPutImageData({
        canvasId: cvsId,
        x: 0,
        y: 0,
        width: width,
        height: height,
        data: imgData,
        success (res) {
          resolve(res)
        },
        fail (er) {
          console.log('drawImageFromU8 failed', er)
          reject(er)
        }
      })
    } catch (er) {
      reject(er)
    }

  })
}

class Block {
  constructor (x, y, w, h, weight, factor) {
    this.x = x || 0
    this.y = y || 0
    this.w = w || 0
    this.h = h || 0
    this.weight = weight || 0
    this.factor = factor !== undefined ? factor : 1
  }

  calcluateWeight (center) {
    this.weight += this.factor * (center.y * 2 - Math.sqrt((this.x - center.x) ** 2 + (this.y - center.y) ** 2) | 0)
    return this
  }
}

function getImageData (range, cvsId) {
  return new Promise((resolve, reject) => {
    wx.canvasGetImageData({
      canvasId: cvsId,
      x: range.start.x,
      y: range.start.y,
      width: range.end.x - range.start.x,
      height: range.end.y - range.start.y,
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

function getBlocks (grid, uint8Arr, range, areaFactor, ios) {
  const blocks = []
  const width = range.end.x - range.start.x
  for (let i = 0; i < grid.length; i++) {
    const item = grid[i]
    let endX = ''
    let piexSum = 0
    if (item.lastOne) {
      endX = (range.end.x - item.x) * 4
    } else {
      endX = item.w * 4
    }
    var h =  item.h
    if (item.y + item.h > range.end.y) h = range.end.y - item.y
    for (let i = 0; i < h; i++) {
      let startIndex = 0
      if (ios) {
        startIndex = ((range.end.y - item.y - i) * width + (item.x - range.start.x)) * 4
      } else {
        startIndex = ((item.y - range.start.y + i) * width + (item.x - range.start.x)) * 4
      }
      piexSum += uint8Arr.slice(startIndex, startIndex + endX).filter(c => c).length
    }
    if (piexSum) {
      item.weight += piexSum * areaFactor
      blocks.push(item)
    }
  }
  return blocks
}

function createGrid (range, w, h, factor) {
  const grid = []
  for (let i = range.start.y; i < range.end.y; i = i + h) {
    for (let j = range.start.x; j < range.end.x; j = j + w) {
      let block = new Block(j, i, w, h, 0, factor)
      grid.push(block)
      if (j + w >= range.end.x) {
        block.lastOne = true
      }
    }
  }
  return grid
}

function requestAnimationFrame (callback) {
  var id = setTimeout(() => {
    callback && callback()
  }, 60)
  return id
}

let helperId = 0
class TapHelper {
  constructor () {
    helperId++
    this.id = '_help_id_' + helperId
    this.invokeArr = []
  }

  invoke (x, y) {
    this.invokeArr.forEach(trigger => {
      if (trigger.inside(x, y)) trigger.invoke()
    })
  }
  clearTapHelper () {
    this.invokeArr.splice(0, this.invokeArr.length)
  }
}

class Trigger {
  constructor (x, y, w, h, invokeArr) {
    if ([x, y, w, h].some(i => isNaN(i))) throw new Error('params type error.')
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.cbs = []
    this.invokeArr = invokeArr
    this.addWatch()
  }

  inside (x, y) {
    return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
  }

  invoke () {
    const callbacks = this.cbs.slice()
    while (callbacks.length) {
      const cb = callbacks.shift()
      if (typeof cb === 'function') {
        cb.call(this)
      }
    }
  }
  bindCb (cb) {
    if (this.cbs.indexOf(cb) < 0) this.cbs.push(cb)
    return this
  }
  removeCb (cb) {
    const index = this.cbs.indexOf(cb)
    if (index >= 0) this.cbs.splice(index, 1)
  }
  addWatch () {
    if (!this.invokeArr) {
      console.err('add watch failed')
      return
    }
    if (this.invokeArr.indexOf(this) < 0) this.invokeArr.push(this)
  }
  clear () {
    if (!this.invokeArr) return
      const index = this.invokeArr.indexOf(this)
    if (index >= 0) this.invokeArr.splice(this, 1)
  }
}

class CvsDiv {
  constructor (options) {
    this.init(options)
  }
  draw (ctx) {
    ctx = ctx || this.ctx
    radiusPath(ctx, this.x, this.y, this.w, this.h, this.borderRadius || 0)
    if (this.borderColor && this.borderColor !== 'none') {
      ctx.setLineWidth(this.borderWidth)
      ctx.setStrokeStyle(this.borderColor)
      ctx.stroke()
    }
    if (!this.lineGradient && this.background && this.background !== 'none') {
      ctx.setFillStyle(this.background)
      ctx.fill()
    }
    if (this.lineGradient && typeof this.lineGradient === 'object') {
      let start = {x: 0, y: this.y}
      let end = {x: 0, y: this.y + this.h}
      let colors = null
      if (Array.isArray(this.lineGradient)) {
        colors = this.lineGradient
      } else {
        start = this.lineGradient.start
        end = this.lineGradient.end
        colors = this.lineGradient.colors
      }
      var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y)
      colors.forEach((color, i) => {
        grd.addColorStop(i / (colors.length - 1), color)
      })
      // Fill with gradient
      ctx.setFillStyle(grd)
      ctx.fill()
    }
    if (this.text) {
      ctx.setFillStyle(this.color)
      ctx.setFontSize(this.fontSize)
      ctx.setTextBaseline('middle')
      ctx.fillText(this.text, this.x + (this.w - this.textWidth) / 2, this.y + this.h / 2)
    }
  }
  bindTapHandler (cb) {
    this.trigger.bindCb(cb)
    return this
  }
  clearTapHandler (cb) {
    if (cb) {
      this.trigger.removeCb(cb)
    } else {
      this.trigger.clear()
    }
  }
  init (options) {
    this.x = 0
    this.y = 0
    this.w = 0
    this.h = 0
    this.text = ''
    this.padding = '5 10'
    this.borderColor = ''
    this.borderWidth = 1
    this.color = '#000'
    this.background = '#fff'
    this.fontSize = 14
    this.borderRadius = 0
    this.ctx = null
    this.lineGradient = null
    for (let key in options) {
      this[key] = options[key]
    }
    this.initPadding()
    this.autoSize()
    this.initTrigger(options.invokeArr)
  }
  initTrigger (invokeArr) {
    this.trigger = new Trigger(this.x, this.y, this.w, this.h, invokeArr)
  }
  autoSize () {
    this.ctx.save()
    this.ctx.setFontSize(this.fontSize)
    this.textWidth = this.ctx.measureText(this.text).width
    this.ctx.restore()
    if (!this.w) {
      this.w = +this.textWidth + this.paddingleft + this.paddingRight
    }
    if (!this.h) {
      this.h = +this.fontSize + this.paddingBottom + this.paddingTop
    }
  }
  initPadding () {
    const padding = this.padding.toString().split(' ')
    switch (padding.length) {
      case 0:
        this.setPadding(0, 0, 0, 0)
        break
      case 1:
        this.setPadding(padding[0], padding[0], padding[0], padding[0])
        break
      case 2:
        this.setPadding(padding[0], padding[1], padding[1], padding[0])
        break
      case 3:
        this.setPadding(padding[0], padding[1], padding[1], padding[2])
        break
      case 4:
        this.setPadding(padding[0], padding[1], padding[2], padding[3])
        break
    }
  }
  setPadding (top, right, left, bottom) {
    this.paddingTop = +top
    this.paddingleft = +left
    this.paddingRight = +right
    this.paddingBottom = +bottom
  }
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
  requestAnimationFrame,
  drawImageFromU8,
  Trigger,
  TapHelper,
  CvsDiv,
  getSvgActions
}
