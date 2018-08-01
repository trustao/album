<template>
  <div class="cvs-wrap">
    <canvas class="cvs cvs-bg" canvas-id="puzzle-bg"></canvas>
    <canvas class="cvs" canvas-id="puzzle"></canvas>
    <canvas class="operation"
            canvas-id="operation"
            @touchstart="touchStartHandle"
            @touchmove="touchMoveHandle"
            @touchend="touchEndHandle"
    ></canvas>
    <canvas class="header-cvs" canvas-id="head-cvs" :class="{'iphoneX': iphoneX}" @tap="back"></canvas>
  </div>
</template>

<script>
/* global getCurrentPages */
// import { forEachmatTime } from '@/utils/index'
import header from '@/components/header'
import puzzle from './draw'
import svgJson from '@/images/stencil/svg.json'

const {drawColorBackground,
  getSVGPath, getImageData, getBlocks,
  createGrid, radiusPath, CvsDiv, // requestAnimationFrame,
  TapHelper} = puzzle
let stencilUnit8 = null
let min = 25
let maxLineWidth = 20
let maxRadius = 20
let imageBlock = []
let svgActions = []
let time = 0
let throttle = null
// let stopRenderAll = false
// let pattern = []
let tapHelper = new TapHelper()
export default {
  components: {
    'v-header': header
  },

  data () {
    const pages = getCurrentPages()
    const curPage = pages[pages.length - 1]
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    console.log(iphoneX)
    return {
      iphoneX,
      noBack: true,
      noBackground: false,
      size: {w: 0, h: 0},
      curPage,
      ctx: null,
      bgCtx: null,
      OpCtx: null,
      viewW: 0,
      viewH: 0,
      stencil: '',
      calcCount: 0,
      images: [],
      lineWidth: 5,
      lineColor: '#fff',
      radius: 0,
      changeLine: false,
      changeRadius: false,
      lWidth: 0,
      rWidth: 0,
      ios: false,
      stopRender: false,
      stopRenderBg: false,
      pixelRatio: 1,
      range: null,
      userHide: false,
      imgMargin: 3,
      colors: null
    }
  },
  watch: {
    stopRenderBg (val) {
      if (!val) this.drawBackground()
    }
  },
  methods: {
    clickHandle (ev) {
      var y = ev.mp.changedTouches[0].y
      var x = ev.mp.changedTouches[0].x
      tapHelper.invoke(x, y)
    },
    touchStartHandle (ev) {
      time = Date.now()
      // var lX = this.viewW * 0.2 + this.lWidth
      // var rX = this.viewW * 0.2 + this.rWidth
      // if (ev.x > lX - 20 && ev.x < lX + 20 && ev.y > 60 - 20 && ev.y < 60 + 20) {
      //   this.changeLine = true
      //   this.stopRenderBg = false
      // }
      // if (ev.x > rX - 20 && ev.x < rX + 20 && ev.y > 100 - 20 && ev.y < 100 + 20) {
      //   this.changeRadius = true
      //   this.stopRender = false
      // }
    },
    touchEndHandle (ev) {
      if (Date.now() - time < 500) {
        if (throttle) clearTimeout(throttle)
        throttle = setTimeout(() => {
          this.clickHandle(ev)
        }, 100)
      }
      // this.changeLine = false
      // this.changeRadius = false
      // this.stopRender = true
      // this.stopRenderBg = true
    },
    touchMoveHandle (ev) {
      // if (this.changeRadius) {
      //   this.rWidth = ev.x - this.viewW * 0.2
      //   if (this.rWidth > this.viewW * 0.6) this.rWidth = this.viewW * 0.6
      //   if (this.rWidth < 0) this.rWidth = 0
      //   this.radius = this.rWidth / (this.viewW * 0.6) * maxRadius
      // }
      // if (this.changeLine) {
      //   this.lWidth = ev.x - this.viewW * 0.2
      //   if (this.lWidth > this.viewW * 0.6) this.lWidth = this.viewW * 0.6
      //   if (this.lWidth < 0) this.lWidth = 0
      //   this.lineWidth = (this.lWidth < 5 ? 5 : this.lWidth) / (this.viewW * 0.6) * maxLineWidth
      // }
    },
    cvsInit () {
      this.ctx = wx.createCanvasContext('puzzle')
      this.bgCtx = wx.createCanvasContext('puzzle-bg')
      this.OpCtx = wx.createCanvasContext('operation')
      this.ctx.setLineJoin('round')
      this.ctx.setLineCap('round')
      this.ctx.setFillStyle('#fff')
      this.bgCtx.setFontSize(16)
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight * 1.2 | 0 // canvas全屏覆盖不全
        this.lWidth = this.lineWidth / maxLineWidth * this.viewW * 0.6
        this.rWidth = this.lineWidth / maxRadius * this.viewW * 0.6
        console.log('w h p', this.viewW, this.viewH, this.pixelRatio)
      } catch (e) {
        // Do something when catch error
      }
    },
    drawStencil (fill) {
      console.log('draw stencil')
      const res = this.setSvgPath(fill)
      this.range = res
      this.ctx.draw(false, () => {
        this.drawOperation()
        this.createImageContainer(res)
      })
    },
    setSvgPath (fill) {
      console.time('计算')
      var svgData = svgJson.data[this.stencil]
      var baseW = this.viewW - 60
      var baseH = this.viewH * 0.7 - 100 | 0
      var ratio = svgData.width / svgData.height
      var h1 = baseW / ratio
      var w1 = baseH * ratio
      if (h1 > baseH) {
        var width = w1
        var height = baseH
        var left = (this.viewW - width) / 2
        var top = 85
      } else {
        width = baseW
        height = h1
        left = 30
        top = (this.viewH * 0.7 - height) / 2
      }
      svgActions = getSVGPath(this.ctx, svgData, left, top, width, height)
      this.ctx.beginPath()
      for (let i = 0; i < svgActions.length; i++) {
        const item = svgActions[i]
        this.ctx[item.action].apply(this.ctx, item.args)
      }
      this.ctx.fill()
      if (width < height) {
        left = left - (height - width) / 2
        width = height
      } else {
        top = top - (width - height) / 2
        height = width
      }
      var range = {
        start: {
          x: left | 0,
          y: top | 0
        },
        end: {
          x: left + width | 0,
          y: top + height | 0
        }
      }
      return range
    },
    createImageContainer (range) {
      console.log('create grid')
      getImageData(range, 'puzzle')
        .then((data) => {
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          stencilUnit8 = data
          var maxArea = (range.end.y - range.start.y) * (range.end.x - range.start.x)
          var minArea = stencilUnit8.filter(n => n).length / 4 | 0
          if (!min) {
            wx.hideLoading()
            return
          }
          var maxL = Math.sqrt(maxArea / min) | 0
          var minL = Math.sqrt(minArea / min) | 0
          console.log(maxL, minL)
          this.calculateFitBlock(range, maxL + 1, minL - 1)
        })
        .catch(() => {})
    },
    drawItem (ctx, arr, color) {
      ctx.save()
      var c = (this.calcCount < 14 ? (14 - this.calcCount) : 0).toString(16)
      ctx.setStrokeStyle(color || ('#' + c + c + c))
      ctx.setLineWidth(2)
      arr.forEach(item => {
        ctx.strokeRect(item.x, item.y, item.l, item.l)
      })
      ctx.draw(true)
      ctx.restore()
    },
    calculateFitBlock (range, maxL, minL) {
      var l = Math.round((maxL + minL) / 2)
      console.log('边长：', l)
      this.calcCount++
      var grid = createGrid(range, l, 0)
      var block = getBlocks(grid, stencilUnit8, range, 1, this.ios)
      var fitLength = block.filter(item => item.weight > l * l * 0.5).length
      console.log('CALCULATE', fitLength, min)
      // this.drawItem(this.ctx, grid)
      if (this.calcCount > 20) {
        console.log('no', fitLength, min, this.calcCount)
        maxRadius = l / 2
        this.radius = l * 0.2
        this.sortBlocks(block)
        return
      }
      if (fitLength < min) {
        this.calculateFitBlock(range, l, minL)
      } else if (fitLength > min * 1.1) {
        this.calculateFitBlock(range, maxL, l)
      } else {
        console.log('get', fitLength, min, this.calcCount)
        maxRadius = l / 2
        this.radius = l * 0.2
        this.sortBlocks(block)
      }
    },
    sortBlocks (data) {
      // data.forEach(block => {
      //   block.factor = 1
      //   block.calcluateWeight({
      //     x: this.viewW / 2,
      //     y: this.viewH / 2
      //   })
      // })
      imageBlock = data.sort((a, b) => b.weight - a.weight)
      // data.forEach(item => {
      //   this.ctx.fillRect(item.x, item.y, item.l, item.l)
      // })
      // this.ctx.draw(true)
      this.calcCount = 0
      console.timeEnd('计算')
      // pattern = this.createPattern(this.ctx, this.images)
      this.drawBackground(() => {
        // this.stopRenderBg = true
        this.drawImages(() => {
          // this.stopRender = true
        })
      })
    },
    drawSvg (ctx, fill) {
      ctx.setFillStyle('#fff')
      ctx.setStrokeStyle('#fff')
      ctx.beginPath()
      for (let i = 0; i < svgActions.length; i++) {
        const item = svgActions[i]
        ctx[item.action].apply(ctx, item.args)
      }
      if (fill) {
        ctx.fill()
      } else {
        ctx.stroke()
      }
    },
    drawImages (cb) {
      // if (!stopRenderAll) requestAnimationFrame(this.drawImages)
      // if (this.stopRender) return
      this.ctx.setLineWidth(0)
      this.ctx.setStrokeStyle('#fff')
      this.ctx.beginPath()
      for (let i = 0; i < svgActions.length; i++) {
        const item = svgActions[i]
        this.ctx[item.action].apply(this.ctx, item.args)
      }
      this.ctx.closePath()
      this.ctx.clip()
      if (this.images.length) {
        for (let index = 0; index < imageBlock.length; index++) {
          const item = imageBlock[index]
          this.ctx.save()
          var l = item.l - this.imgMargin
          radiusPath(this.ctx, item.x, item.y, l, l, this.radius)
          this.ctx.fill()
          this.ctx.globalCompositeOperation = 'source-atop'
          this.ctx.drawImage(this.images[index % this.images.length], item.x, item.y, l, l)
          this.ctx.restore()
        }
      }
      this.ctx.draw(false, () => {
        cb && cb()
        wx.hideLoading()
      })
    },
    drawBackground (cb) {
      this.bgCtx.setLineWidth(this.lineWidth)
      drawColorBackground(this.bgCtx, {x: 0, y: 0}, {x: 0, y: this.viewH}, this.viewW, this.viewH, this.colors, false, () => {})
      this.drawSvg(this.bgCtx)
      this.bgCtx.fill()
      this.bgCtx.draw(false, () => {
        cb && cb()
        // if (!this.stopRenderBg) requestAnimationFrame(this.drawBackground)
      })
    },
    createOperation  () {
      const viewH = this.viewH * 5 / 6
      let aH = this.iphoneX ? viewH * 0.3 - 70 : viewH * 0.3 - 60
      const yM = aH / 5.5
      const margin = (this.viewW - 100) / 4
      const cS = 30 + margin
      const cM = (this.viewW - cS - 30) / 5
      const cW = margin * 3 / 5
      // const dS = cS
      // const dM = (this.viewW - dS - 30) / 3
      const operation = [
        {
          ctx: this.OpCtx,
          text: '模板边框',
          x: 20,
          y: aH - yM * 5,
          fontSize: 12,
          borderColor: '',
          background: ''
        },
        {
          ctx: this.OpCtx,
          text: '无边框',
          x: 30 + margin,
          y: aH - yM * 5,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            this.lineWidth = 0
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '小边框',
          x: 30 + margin * 2,
          y: aH - yM * 5,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('小边框')
            this.lineWidth = 5
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '大边框',
          x: 30 + margin * 3,
          y: aH - yM * 5,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('大边框')
            this.lineWidth = 10
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '图片间距',
          x: 20,
          y: aH - yM * 4,
          fontSize: 12,
          borderColor: '',
          background: ''
        },
        {
          ctx: this.OpCtx,
          text: '无间距',
          x: 30 + margin,
          y: aH - yM * 4,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('无间距')
            wx.showLoading({
              title: '渲染中',
              mask: true
            })
            this.imgMargin = 0
            this.drawImages()
          }
        },
        {
          ctx: this.OpCtx,
          text: '小间距',
          x: 30 + margin * 2,
          y: aH - yM * 4,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('小间距')
            wx.showLoading({
              title: '渲染中',
              mask: true
            })
            this.imgMargin = 3
            this.drawImages()
          }
        },
        {
          ctx: this.OpCtx,
          text: '大间距',
          x: 30 + margin * 3,
          y: aH - yM * 4,
          fontSize: 10,
          borderRadius: 6,
          background: '#D8D8D8',
          bind: () => {
            console.log('大间距')
            wx.showLoading({
              title: '渲染中',
              mask: true
            })
            this.imgMargin = 5
            this.drawImages()
          }
        },
        {
          ctx: this.OpCtx,
          text: '图片圆角',
          x: 20,
          y: aH - yM * 3,
          fontSize: 12,
          borderColor: '',
          background: ''
        },
        {
          ctx: this.OpCtx,
          text: '无圆角',
          x: 30 + margin,
          y: aH - yM * 3,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('无圆角')
            wx.showLoading({
              title: '渲染中',
              mask: true
            })
            this.radius = 0
            this.drawImages()
          }
        },
        {
          ctx: this.OpCtx,
          text: '小圆角',
          x: 30 + margin * 2,
          y: aH - yM * 3,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('小圆角')
            wx.showLoading({
              title: '渲染中',
              mask: true
            })
            this.radius = 6
            this.drawImages()
          }
        },
        {
          ctx: this.OpCtx,
          text: '大圆角',
          x: 30 + margin * 3,
          y: aH - yM * 3,
          fontSize: 10,
          borderRadius: 5,
          background: '#D8D8D8',
          bind: () => {
            console.log('大圆角')
            wx.showLoading({
              title: '渲染中',
              mask: true
            })
            this.radius = maxRadius * 0.9
            this.drawImages()
          }
        },
        {
          ctx: this.OpCtx,
          text: '背景颜色',
          x: 20,
          y: aH - yM * 2,
          fontSize: 12,
          borderColor: '',
          background: ''
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: 30 + margin,
          y: aH - yM * 2,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#F7D6CC', '#FAA3A7'],
          bind: () => {
            this.colors = ['#F7D6CC', '#FAA3A7']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM,
          y: aH - yM * 2,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#ffecd2', '#fcb69f'],
          bind: () => {
            this.colors = ['#ffecd2', '#fcb69f']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM * 2,
          y: aH - yM * 2,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#FFF1A6', '#FDDF6D'],
          bind: () => {
            this.colors = ['#FFF1A6', '#FDDF6D']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM * 3,
          y: aH - yM * 2,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#fdfcfb', '#e2d1c3'],
          bind: () => {
            this.colors = ['#fdfcfb', '#e2d1c3']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM * 4,
          y: aH - yM * 2,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#89f7fe', '#66a6ff'],
          bind: () => {
            this.colors = ['#89f7fe', '#66a6ff']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: 30 + margin,
          y: aH - yM,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#96deda', '#50c9c3'],
          bind: () => {
            this.colors = ['#96deda', '#50c9c3']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM,
          y: aH - yM,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#868f96', '#596164'],
          bind: () => {
            this.colors = ['#868f96', '#596164']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM * 2,
          y: aH - yM,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#B7F8DB', '#50A7C2'],
          bind: () => {
            this.colors = ['#B7F8DB', '#50A7C2']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM * 3,
          y: aH - yM,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#cfd9df', '#e2ebf0'],
          bind: () => {
            this.colors = ['#cfd9df', '#e2ebf0']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '',
          x: cS + cM * 4,
          y: aH - yM,
          w: cW,
          fontSize: 10,
          borderRadius: 5,
          lineGradient: ['#fdfbfb', '#ebedee'],
          bind: () => {
            this.colors = ['#fdfbfb', '#ebedee']
            this.drawBackground()
          }
        },
        {
          ctx: this.OpCtx,
          text: '重选模板',
          x: this.viewW * 0.1,
          y: viewH * 0.3 - 60,
          w: this.viewW * 0.3,
          h: 40,
          fontSize: 16,
          borderRadius: 18,
          borderColor: '#000',
          background: '#FFE200',
          bind: () => {
            wx.redirectTo({
              url: '../choose-stencil/main?rePick=1'
            })
          }
        },
        {
          ctx: this.OpCtx,
          text: '保存图片',
          x: this.viewW * 0.6,
          y: viewH * 0.3 - 60,
          w: this.viewW * 0.3,
          h: 40,
          fontSize: 16,
          borderRadius: 18,
          borderColor: '#000',
          background: '#FFE200',
          bind: () => {
            this.saveImage()
          }
        }
      ]
      return operation.map(item => {
        item.invokeArr = tapHelper.invokeArr
        var div = new CvsDiv(item)
        if (item.bind) {
          div.bindTapHandler(item.bind)
        }
        div.draw()
        return div
      })
    },
    drawOperation () {
      var ctx = this.OpCtx
      // 背景
      ctx.save()
      ctx.setFillStyle('#3D4042')
      ctx.setGlobalAlpha(0.42)
      ctx.fillRect(0, 0, this.viewW, this.viewH * 0.3)
      ctx.beginPath()
      ctx.restore()
      // 按钮
      this.createOperation()
      this.OpCtx.draw()
      // if (!stopRenderAll) requestAnimationFrame(this.drawOperation)
    },
    saveImage () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      // this.stopRender = true
      this.bgCtx.setLineWidth(this.lineWidth)
      wx.canvasToTempFilePath({
        canvasId: 'puzzle',
        x: 0,
        y: 0,
        width: this.viewW,
        height: this.viewH,
        success: (res) => {
          console.log(res)
          this.bgCtx.drawImage(res.tempFilePath, 0, 0, this.viewW, this.viewH)
          this.bgCtx.draw(true, () => {
            this.cvsToPhoto()
          })
        },
        fail (err) {
          console.log(err)
        }
      })
    },
    cvsToPhoto () {
      console.log('to photo')
      wx.canvasToTempFilePath({
        canvasId: 'puzzle-bg',
        x: 0,
        y: 0,
        width: this.viewW,
        height: this.range.end.y + this.range.start.y,
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: '成功',
                icon: 'success',
                mask: true,
                duration: 1000
              })
            },
            fail () {
              wx.showToast({
                title: '保存失败',
                icon: 'none',
                mask: true,
                duration: 1000
              })
            }
          })
        },
        fail (err) {
          console.log(err)
        }
      })
    },
    stopAll () {
      // stopRenderAll = true
      this.stopRenderBg = true
    },
    restart () {
      // stopRenderAll = false
      this.stopRenderBg = false
      this.drawImages()
      this.drawBackground()
    },
    createPattern (ctx, images) {
      return images.map(image => {
        return ctx.createPattern(image, 'no-repeat')
      })
    },
    // 头部
    back (ev) {
      console.log(ev)
      var x = ev.clientX
      var y = ev.clientY
      if (x > 5 && x < 25 && y > this.size.h - 30) {
        wx.navigateBack()
      }
    },
    drawHeader (cb) {
      const title = '编辑图片'
      this.getSize().then((size) => {
        this.size = size
        var y = size.h - 10
        var ctx = wx.createCanvasContext('head-cvs', this.curPage)
        console.log(ctx)
        ctx.beginPath()
        ctx.setLineCap('round')
        ctx.setLineWidth(2)
        ctx.setStrokeStyle('#333')
        ctx.moveTo(23, y)
        ctx.lineTo(15, y - 8)
        ctx.lineTo(23, y - 16)
        ctx.stroke()
        ctx.setFontSize(17)
        ctx.setTextBaseline('bottom')
        ctx.setFillStyle('#333')
        var textW = ctx.measureText(title).width
        ctx.fillText(title, (size.w - textW) / 2, y + 2)
        ctx.draw(false)
      })
    },
    getSize () {
      console.log('size')
      return new Promise((resolve, reject) => {
        wx.createSelectorQuery().select('.header-cvs').fields({
          computedStyle: ['width', 'height']
        }, function (res) {
          console.log('size res', res)
          resolve({
            w: parseInt(res.width),
            h: parseInt(res.height)
          })
        }).exec()
      })
    }
  },
  created () {

  },
  onLoad (options) {
    this.stencil = wx.getStorageSync('stencil') || 'heart'
    this.images = wx.getStorageSync('images') || []
    min = this.images.length // < 40 ? 40 : this.images.length
    this.stopRender = false
    this.stopRenderBg = false
    // stopRenderAll = false
  },
  mounted () {
    wx.showLoading({
      title: '图片渲染中',
      mask: true
    })
    this.cvsInit()
    this.drawHeader()
    this.drawStencil(true)
    drawColorBackground(this.bgCtx, {x: 0, y: this.viewH}, {x: this.viewW, y: 0}, this.viewW, this.viewH, this.colors, false, () => {})
    this.bgCtx.draw(true)
  },
  onReady () {
    console.log('ready')
  },
  onHide () {
    console.log('hide')
    this.userHide = true
    // this.stopAll()
  },
  onShow () {
    console.log('show')
    // if (this.userHide) {
    //   this.restart()
    // }
  },
  onUnload () {
    console.log('unload')
    clearTapHelper()
    this.stopAll()
    this.userHide = false
  }
}
</script>

<style lang="less">
.cvs-wrap{
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .cvs{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 120%;
  }
  .cvs-bg{
    filter: blur(2px);
  }
  .operation{
    position: absolute;
    left: 0;
    bottom: 0;
    height: 30vh;
    width: 100%;
  }
}
</style>
