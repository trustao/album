<template>
  <div class="cvs-wrap">
    <canvas class="cvs cvs-bg" canvas-id="puzzle-bg"></canvas>
    <canvas class="cvs" canvas-id="puzzle"></canvas>
    <canvas class="operation"
            canvas-id="operation"
            @tap="clickHandle"
            @touchstart="touchStartHandle"
            @touchmove="touchMoveHandle"
            @touchend="touchEndHandle"
    ></canvas>
  </div>
</template>

<script>
// import { forEachmatTime } from '@/utils/index'
import card from '@/components/card'
import puzzle from './draw'
import svgJson from '@/images/stencil/svg.json'

const {drawColorBackground, getSVGPath, getImageData, getBlocks, createGrid, radiusPath, requestAnimationFrame} = puzzle
let stencilUnit8 = null
let min = 25
let maxLineWidth = 20
let maxRadius = 20
let imageBlock = []
let svgActions = []
let textWidth = 0
export default {
  components: {
    card
  },

  data () {
    return {
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
      range: null
    }
  },
  watch: {
    stopRenderBg (val) {
      if (!val) this.drawBackground()
    }
  },
  methods: {
    clickHandle (ev) {
      console.log(ev)
      var y = ev.y - ev.target.offsetTop
      console.log(ev.x, y)
      if (ev.x > this.viewW / 2 - 30 && ev.x < this.viewW / 2 + 30 && y > 135 && y < 155) {
        console.log('save')
        wx.showLoading({
          title: '图片生成中',
          mask: true
        })
        this.saveImage()
      }
    },
    touchStartHandle (ev) {
      var lX = this.viewW * 0.2 + this.lWidth
      var rX = this.viewW * 0.2 + this.rWidth
      if (ev.x > lX - 20 && ev.x < lX + 20 && ev.y > 60 - 20 && ev.y < 60 + 20) {
        this.changeLine = true
        this.stopRenderBg = false
      }
      if (ev.x > rX - 20 && ev.x < rX + 20 && ev.y > 100 - 20 && ev.y < 100 + 20) {
        this.changeRadius = true
        this.stopRender = false
      }
    },
    touchEndHandle (ev) {
      this.changeLine = false
      this.changeRadius = false
      this.stopRender = true
      this.stopRenderBg = true
    },
    touchMoveHandle (ev) {
      if (this.changeRadius) {
        this.rWidth = ev.x - this.viewW * 0.2
        if (this.rWidth > this.viewW * 0.6) this.rWidth = this.viewW * 0.6
        if (this.rWidth < 0) this.rWidth = 0
        this.radius = this.rWidth / (this.viewW * 0.6) * maxRadius
      }
      if (this.changeLine) {
        this.lWidth = ev.x - this.viewW * 0.2
        if (this.lWidth > this.viewW * 0.6) this.lWidth = this.viewW * 0.6
        if (this.lWidth < 0) this.lWidth = 0
        this.lineWidth = (this.lWidth < 5 ? 5 : this.lWidth) / (this.viewW * 0.6) * maxLineWidth
      }
    },
    cvsInit () {
      this.ctx = wx.createCanvasContext('puzzle')
      this.bgCtx = wx.createCanvasContext('puzzle-bg')
      this.OpCtx = wx.createCanvasContext('operation')
      this.ctx.setLineJoin('round')
      this.ctx.setLineCap('round')
      this.ctx.setFillStyle('#fff')
      textWidth = this.bgCtx.measureText('保存').width
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight
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
      var baseH = this.viewH - 260
      var ratio = svgData.width / svgData.height
      var h1 = baseW / ratio
      var w1 = baseH * ratio
      if (h1 > baseH) {
        var width = w1
        var height = baseH
        var left = (this.viewW - width) / 2
        var top = 130
      } else {
        width = baseW
        height = h1
        left = 30
        top = (this.viewH - height) / 2
      }
      svgActions = getSVGPath(this.ctx, svgData, left, top, width, height)
      this.ctx.beginPath()
      for (let i = 0; i < svgActions.length; i++) {
        const item = svgActions[i]
        this.ctx[item.action].apply(this.ctx, item.args)
      }
      this.ctx.fill()
      return {
        start: {
          x: left | 0,
          y: top | 0
        },
        end: {
          x: left + width | 0,
          y: top + height | 0
        }
      }
    },
    createImageContainer (range) {
      console.log('create grid')
      getImageData(this.viewW, this.viewH, 'puzzle')
        .then((data) => {
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          stencilUnit8 = data
          var maxArea = (range.end.y - range.start.y) * (range.end.x - range.start.x)
          var minArea = stencilUnit8.filter(n => n).length / 4 | 0
          if (!min) return
          var maxL = Math.sqrt(maxArea / min) | 0
          var minL = Math.sqrt(minArea / min) | 0
          this.calculateFitBlock(range, maxL, minL)
        })
        .catch(() => {})
    },
    calculateFitBlock (range, maxL, minL) {
      var l = Math.round((maxL + minL) / 2)
      console.log(l, maxL, minL)
      this.calcCount++
      var grid = createGrid(range, l, 0)
      var block = getBlocks(grid, stencilUnit8, this.viewW, this.viewH, 1, this.ios)
      var fitLength = block.length // filter(item => item.weight > l * l * 0.1).length
      console.log('CALCULATE', fitLength, min)
      if (l >= maxL || l < minL) {
        console.log('no', fitLength)
        maxRadius = l
        this.sortBlocks(block)
        return
      }
      if (fitLength < min) {
        this.calculateFitBlock(range, l, minL)
      } else if (fitLength > (min * 1.1 | 0)) {
        this.calculateFitBlock(range, maxL, l)
      } else {
        console.log('get', fitLength, min, this.calcCount)
        maxRadius = l
        this.sortBlocks(block)
      }
    },
    sortBlocks (data) {
      data.forEach(block => {
        block.factor = 1
        block.calcluateWeight({
          x: this.viewW / 2,
          y: this.viewH / 2
        })
      })
      // imageBlock = data.sort((a, b) => b.weight - a.weight)
      imageBlock = data
      this.calcCount = 0
      console.timeEnd('计算')
      this.drawBackground(() => {
        this.stopRenderBg = true
      })
      this.drawImages(() => {
        this.stopRender = true
        wx.hideLoading()
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
      requestAnimationFrame(this.drawImages)
      if (this.stopRender) return
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
          const l = item.l - this.lineWidth / 2
          radiusPath(this.ctx, item.x, item.y, l, l, this.radius)
          this.ctx.fill()
          this.ctx.globalCompositeOperation = 'source-atop'
          this.ctx.drawImage(this.images[index % this.images.length], item.x, item.y, item.l - this.lineWidth / 2, item.l - this.lineWidth / 2)
          this.ctx.restore()
        }
      }
      this.ctx.draw(false, () => {
        cb && cb()
      })
    },
    drawBackground (cb) {
      this.bgCtx.setLineWidth(this.lineWidth)
      drawColorBackground(this.bgCtx, {x: 0, y: this.viewH}, {x: this.viewW, y: 0}, this.viewW, this.viewH, null, true, () => {})
      this.drawSvg(this.bgCtx)
      this.bgCtx.fill()
      this.bgCtx.draw(false, () => {
        cb && cb()
        if (!this.stopRenderBg) requestAnimationFrame(this.drawBackground)
      })
    },
    drawOperation () {
      var width = this.viewW * 0.6
      var left = this.viewW * 0.2
      var top = 60
      var top2 = 100
      var ctx = this.OpCtx
      var lWidth = this.lWidth
      var rWidth = this.rWidth
      ctx.save()
      // 背景
      ctx.setFillStyle('#000')
      ctx.setGlobalAlpha(0.2)
      ctx.fillRect(0, 0, this.viewW, this.viewH * 0.3)
      ctx.beginPath()
      ctx.restore()

      ctx.setLineCap('round')
      ctx.setLineWidth(10)
      ctx.setStrokeStyle('#888')
      // 底条
      ctx.moveTo(left, top)
      ctx.lineTo(left + width, top)
      ctx.stroke()
      ctx.moveTo(left, top2)
      ctx.lineTo(left + width, top2)
      ctx.stroke()
      ctx.beginPath()
      // 内条
      ctx.setStrokeStyle('#fea9ac')
      ctx.moveTo(left, top)
      ctx.lineTo(left + lWidth, top)
      ctx.stroke()
      ctx.moveTo(left, top2)
      ctx.lineTo(left + rWidth, top2)
      ctx.stroke()
      ctx.beginPath()
      // 操作点
      ctx.setFillStyle('#fff')
      ctx.arc(left + lWidth, top, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(left + rWidth, top2, 10, 0, Math.PI * 2)
      ctx.fill()
      // save
      ctx.setFillStyle('#fea9ac')
      ctx.setFontSize(14)
      radiusPath(ctx, this.viewW / 2 - 30, top2 + 20, 60, 30, 5)
      ctx.fill()
      ctx.setFillStyle('#fff')
      ctx.setTextBaseline('middle')
      ctx.fillText('保存', (this.viewW) / 2 - textWidth + 5, top2 + 35)

      ctx.draw()
      requestAnimationFrame(this.drawOperation)
    },
    saveImage () {
      this.stopRender = true
      this.bgCtx.setLineWidth(this.lineWidth)
      wx.canvasToTempFilePath({
        canvasId: 'puzzle',
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
    }
  },
  created () {

  },
  onLoad (options) {
    this.stencil = options.name
    this.images = wx.getStorageSync('images') || []
    min = this.images.length
  },
  mounted () {
    wx.showLoading({
      title: '',
      mask: true
    })
    this.cvsInit()
    this.drawStencil(true)
    drawColorBackground(this.bgCtx, {x: 0, y: this.viewH}, {x: this.viewW, y: 0}, this.viewW, this.viewH, null, true, () => {})
    this.bgCtx.draw()
  },
  onHide () {
    console.log('stop')
  }
}
</script>

<style lang="less">
.cvs-wrap{
  position: relative;
  width: 100vw;
  height: 100vh;
  .cvs{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .cvs-bg{
    filter: blur(2px);
  }
  .operation{
    position: absolute;
    left: 0;
    bottom: 0;
    height: 30vh;
    width: 100vw;
  }
}
</style>
