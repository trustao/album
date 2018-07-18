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
var maxLineWidth = 20
var maxRadius = 160
let drawTime = null
let operatTime = null
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
      blocks: [],
      lineWidth: 2,
      svgActions: [],
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
    touchEndHandle () {
      this.changeLine = false
      this.changeRadius = false
    },
    touchMoveHandle (ev) {
      if (this.changeRadius) {
        this.rWidth = ev.x - this.viewW * 0.2
        this.radius = this.rWidth / this.viewW * maxRadius
      }
      if (this.changeLine) {
        this.lWidth = ev.x - this.viewW * 0.2
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
      this.setSvgPath(fill)
      this.ctx.draw(false, () => {
        this.drawOperation()
        this.createImageContainer()
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
      this.svgActions = getSVGPath(this.ctx, svgData, left, top, width, height)
      this.ctx.beginPath()
      this.svgActions.forEach((item) => {
        this.ctx[item.action].apply(this.ctx, item.args)
      })
      this.ctx.fill()
    },
    createImageContainer () {
      console.log('create grid')
      getImageData(this.viewW, this.viewH, 'puzzle')
        .then((data) => {
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          stencilUnit8 = data
          this.s = stencilUnit8.filter(n => n).length / 4
          var startIndex = stencilUnit8.indexOf(255) / 4
          this.calculateFitBlock(min / 2, startIndex, stencilUnit8.lastIndexOf(255) / 4)
        })
        .catch(() => {})
    },
    calculateFitBlock (count, startIndex, endIndex) {
      console.log('CALCULATE')
      this.calcCount++
      var l = Math.sqrt(this.s / count) | 0
      var grid = createGrid(startIndex / this.viewW | 0, endIndex / this.viewW | 0, this.viewW, this.viewH, l, 0)
      var block = getBlocks(grid, stencilUnit8, this.viewW, 1)
      var fitLength = block.filter(item => item.weight > l * l * 0.1).length
      if (this.calcCount > 30) {
        console.log('no', fitLength)
        this.sortBlocks(block)
        return
      }
      if (fitLength < min) {
        this.calculateFitBlock(count + 1, startIndex, endIndex)
      } else if (fitLength > min * 1.1) {
        this.calculateFitBlock(count - 1, startIndex, endIndex)
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
      this.blocks = data.sort((a, b) => b.weight - a.weight)
      this.calcCount = 0
      this.drawImages()
    },
    drawImages () {
      this.ctx.setLineWidth(this.lineWidth)
      this.ctx.setStrokeStyle('#fff')
      this.ctx.setFillStyle('#fff')
      this.ctx.beginPath()
      this.svgActions.forEach(item => {
        this.ctx[item.action].apply(this.ctx, item.args)
      })
      this.ctx.stroke()
      this.ctx.fill()
      // this.ctx.globalCompositeOperation = 'source-atop'
      this.ctx.clip()
      if (this.images.length) {
        this.ctx.setLineWidth(2)
        this.blocks.forEach((item, index) => {
          this.ctx.setStrokeStyle(this.lineColor)
          this.ctx.save()
          radiusPath(this.ctx, item.x, item.y, item.l - this.lineWidth / 2, this.radius)
          // this.ctx.arc((item.x + item.l / 2), (item.y + item.l / 2), item.l / 2.1, 0, 2 * Math.PI)
          // this.ctx.strokeRect(item.x, item.y, item.l, item.l)
          this.ctx.stroke()
          this.ctx.clip()
          // this.ctx.fillText(index, item.x + (item.l / 2), item.y + (item.l / 2))
          this.ctx.drawImage(this.images[index % this.images.length], item.x, item.y, item.l - this.lineWidth / 2, item.l - this.lineWidth / 2)
          this.ctx.restore()
        })
      }
      this.ctx.draw()
      this.ctx.clearActions()
      requestAnimationFrame(this.drawImages)
    },
    drawOperation () {
      var width = this.viewW * 0.6
      var left = this.viewW * 0.2
      var top = 60
      var top2 = 100
      var ctx = this.OpCtx
      var lWidth = this.lWidth
      var rWidth = this.rWidth// this.radius / maxRadius * width
      ctx.save()
      ctx.setFillStyle('#000')
      ctx.setGlobalAlpha(0.2)
      ctx.fillRect(0, 0, this.viewW, this.viewH * 0.3)
      ctx.beginPath()
      ctx.restore()
      ctx.setLineCap('round')
      ctx.setLineWidth(10)
      ctx.setStrokeStyle('#888')
      ctx.moveTo(left, top)
      ctx.lineTo(left + width, top)
      ctx.stroke()
      ctx.moveTo(left, top2)
      ctx.lineTo(left + width, top2)
      ctx.stroke()
      ctx.beginPath()

      ctx.setStrokeStyle('#fea9ac')
      ctx.moveTo(left, top)
      ctx.lineTo(left + lWidth, top)
      ctx.stroke()
      ctx.moveTo(left, top2)
      ctx.lineTo(left + rWidth, top2)
      ctx.stroke()
      ctx.beginPath()

      ctx.setFillStyle('#fff')
      ctx.arc(left + lWidth, top, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(left + rWidth, top2, 10, 0, Math.PI * 2)
      ctx.fill()
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
