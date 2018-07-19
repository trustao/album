<template>
  <div class="cvs-wrap">
    <canvas class="cvs cvs-bg" canvas-id="puzzle-bg"></canvas>
    <canvas class="cvs" canvas-id="puzzle"></canvas>
    <canvas class="operation" canvas-id="operation" @touchstart="touchStartHandle" @touchmove="touchMoveHandle" @touchend="touchEndHandle"></canvas>
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
let drawTime = null
let operatTime = null
var imageBlock = []
let svgActions = []
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
      lineWidth: 2,
      lineColor: '#fff',
      radius: 0,
      changeLine: false,
      changeRadius: false,
      lWidth: 0,
      rWidth: 0
    }
  },
  methods: {
    touchStartHandle (ev) {
      var lX = this.viewW * 0.2 + this.lWidth
      var rX = this.viewW * 0.2 + this.rWidth
      if (ev.x > lX - 20 && ev.x < lX + 20 && ev.y > 60 - 20 && ev.y < 60 + 20) {
        this.changeLine = true
      }
      if (ev.x > rX - 20 && ev.x < rX + 20 && ev.y > 100 - 20 && ev.y < 100 + 20) {
        this.changeRadius = true
      }
    },
    touchEndHandle (ev) {
      this.changeLine = false
      this.changeRadius = false
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
        this.lineWidth = this.lWidth / (this.viewW * 0.6) * maxLineWidth
      }
    },
    cvsInit () {
      this.ctx = wx.createCanvasContext('puzzle')
      this.bgCtx = wx.createCanvasContext('puzzle-bg')
      this.OpCtx = wx.createCanvasContext('operation')
      this.ctx.setLineJoin('round')
      this.ctx.setLineCap('round')
      this.ctx.setFillStyle('#fff')
      try {
        const res = wx.getSystemInfoSync()
        this.viewW = res.windowWidth
        this.viewH = res.windowHeight
        this.lWidth = this.lineWidth / maxLineWidth * this.viewW * 0.6
        this.rWidth = this.lineWidth / maxRadius * this.viewW * 0.6
      } catch (e) {
        // Do something when catch error
      }
    },
    drawStencil (fill) {
      console.log('draw stencil')
      const res = this.setSvgPath(fill)
      this.ctx.draw(false, () => {
        this.drawOperation()
        this.createImageContainer(res)
      })
    },
    setSvgPath (fill) {
      var svgData = svgJson.data[this.stencil] // todo
      var ratio = svgData.width / svgData.height
      var s = this.viewW * this.viewH * 0.4
      var height = Math.sqrt(s / ratio)
      var width = s / height
      var top = (this.viewH - height) / 2
      var left = (this.viewW - width) / 2
      svgActions = getSVGPath(this.ctx, svgData, left, top, width, height)
      var startY = this.viewH
      var endY = 0
      var startX = this.viewW
      var endX = 0
      this.ctx.beginPath()
      for (let i = 0; i < svgActions.length; i++) {
        const item = svgActions[i]
        if (item.args && item.args.length) {
          for (let i = 0; i < item.args.length; i++) {
            const val = item.args[i]
            if (i % 2 === 0) {
              if (val < startX) startX = val
              if (val > endX) endX = val
            } else {
              if (val < startY) startY = val
              if (val > endY) endY = val
            }
          }
        }
        this.ctx[item.action].apply(this.ctx, item.args)
      }
      this.ctx.fill()
      return {
        start: {
          x: startX | 0,
          y: startY | 0
        },
        end: {
          x: endX | 0,
          y: endY | 0
        }
      }
    },
    createImageContainer (range) {
      console.log('create grid')
      getImageData(this.viewW, this.viewH, 'puzzle')
        .then((data) => {
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          stencilUnit8 = data
          var area = (range.end.y - range.start.y) * (range.end.x - range.start.x)
          this.calculateFitBlock(min, range, area)
        })
        .catch(() => {})
    },
    calculateFitBlock (count, range, area) {
      console.log('CALCULATE', count)
      this.calcCount++
      var l = Math.sqrt(area / count) | 0
      var grid = createGrid(range, l, 0)
      // this.ctx.save()
      // grid.forEach((item, index) => {
      //   this.ctx.strokeRect(item.x, item.y, item.l, item.l)
      // })
      // this.ctx.draw(true)
      var block = getBlocks(grid, stencilUnit8, this.viewW, 1)
      // console.log(block)
      // this.sortBlocks(block)
      // if (count) return
      var fitLength = block.filter(item => item.weight > l * l * 0.1).length
      if (this.calcCount > 30) {
        console.log('no', fitLength)
        this.sortBlocks(block)
        return
      }
      if (fitLength < min) {
        this.calculateFitBlock(count + 1, range, area)
      } else if (fitLength > min * 1.1) {
        this.calculateFitBlock(count - 1, range, area)
      } else {
        console.log('get', fitLength, min, this.calcCount)
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
      imageBlock = data.sort((a, b) => b.weight - a.weight)
      // this.ctx.setStrokeStyle('red')
      // imageBlock.forEach((item, index) => {
      //   this.ctx.strokeRect(item.x, item.y, item.l, item.l)
      //   this.ctx.fillText(index, item.x + (item.l / 2), item.y + (item.l / 2))
      // })
      // this.ctx.draw(true)
      this.calcCount = 0
      this.drawImages()
    },
    drawImages () {
      this.ctx.clearActions()
      this.ctx.setLineWidth(this.lineWidth)
      this.ctx.setStrokeStyle('#fff')
      this.ctx.setFillStyle('#fff')
      this.ctx.beginPath()
      for (let i = 0; i < svgActions.length; i++) {
        const item = svgActions[i]
        this.ctx[item.action].apply(this.ctx, item.args)
      }
      this.ctx.stroke()
      // this.ctx.fill()
      this.ctx.clip()
      if (this.images.length) {
        this.ctx.setLineWidth(2)
        this.ctx.setStrokeStyle(this.lineColor)
        // this.ctx.arc((item.x + item.l / 2), (item.y + item.l / 2), item.l / 2.1, 0, 2 * Math.PI)
        // this.ctx.strokeRect(item.x, item.y, item.l, item.l)
        // this.ctx.clip()
        // this.ctx.fillText(index, item.x + (item.l / 2), item.y + (item.l / 2))
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
      this.ctx.draw()
      requestAnimationFrame(this.drawImages)
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
      radiusPath(ctx, this.viewW / 2 - 20, top2 + 20, 40, 30, 5)
      ctx.fill()
      ctx.setFillStyle('#fff')
      ctx.setTextBaseline('middle')
      ctx.fillText('保存', (this.viewW - ctx.measureText('保存').width) / 2, top2 + 35)

      ctx.draw()

      requestAnimationFrame(this.drawOperation)
    }
  },
  created () {

  },
  onLoad (options) {
    this.stencil = options.name
    this.images = wx.getStorageSync('images') || []
  },
  mounted () {
    this.cvsInit()
    this.drawStencil(true)
    drawColorBackground(this.bgCtx, {x: 0, y: this.viewH}, {x: this.viewW, y: 0}, this.viewW, this.viewH, null, true, () => {})
    // drawImageBackground(this.bgCtx, '/static/stencil/timg.jpg', 'puzzle-bg', 0, 200, 150)
    // setInterval(this.drawOperation, 50)
    getApp().ctx = this.ctx
  },
  onHide () {
    console.log('stop')
    clearInterval(operatTime)
    clearInterval(drawTime)
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
