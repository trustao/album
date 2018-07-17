<template>
  <div class="cvs-wrap">
    <canvas class="cvs cvs-bg" canvas-id="puzzle-bg"></canvas>
    <canvas class="cvs" canvas-id="puzzle"></canvas>
  </div>
</template>

<script>
// import { forEachmatTime } from '@/utils/index'
import card from '@/components/card'
import puzzle from './draw'
import svgJson from '@/images/stencil/svg.json'

const {drawColorBackground, drawSVGPath, getImageData, getBlocks, createGrid} = puzzle
let stencilUnit8 = null
let min = 6
export default {
  components: {
    card
  },

  data () {
    return {
      ctx: null,
      bgCtx: null,
      viewW: 0,
      viewH: 0,
      stencil: '',
      calcCount: 0,
      images: [],
      blocks: [],
      lineWidth: 2
    }
  },
  methods: {
    cvsInit () {
      this.ctx = wx.createCanvasContext('puzzle')
      this.bgCtx = wx.createCanvasContext('puzzle-bg')
      try {
        const res = wx.getSystemInfoSync()
        this.viewW = res.windowWidth
        this.viewH = res.windowHeight
      } catch (e) {
        // Do something when catch error
      }
    },
    drawStencil (fill) {
      this.setSvgPath(fill)
      this.ctx.draw(true, () => {
        console.time('计算')
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
      drawSVGPath(this.ctx, svgData, left, top, width, height, !!fill)
    },
    createImageContainer () {
      console.log('create grid')
      getImageData(this.viewW, this.viewH, 'puzzle')
        .then((data) => {
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          console.log('get')
          stencilUnit8 = data
          this.s = stencilUnit8.filter(n => n).length / 4
          this.calculateFitBlock(min)
          console.timeEnd('计算')
        })
        .catch(() => {})
    },
    calculateFitBlock (count) {
      this.calcCount++
      var l = Math.sqrt(this.s / count / 1.5) | 0
      var grid = createGrid(this.viewW, this.viewH, l, 0)
      var block = getBlocks(grid, stencilUnit8, this.viewW, 1)
      console.log(block)
      // var fitLength = block.filter(item => item.weight > l * l * 0.4).length
      this.sortBlocks(block)
      // if (this.calcCount > 5) {
      //   console.log('no', fitLength)
      //   this.drawImages(block)
      //   return
      // }
      // if (fitLength < min + 2) {
      //   this.calculateFitBlock(count + 2)
      // } else if (fitLength > min * 1.4) {
      //   this.calculateFitBlock(count - 2)
      // } else {
      //   console.log(fitLength)
      //   this.drawImages(block)
      // }
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
      this.drawImages()
    },
    drawImages () {
      this.calcCount = 0
      this.ctx.clearRect(0, 0, this.viewW, this.viewH)
      this.ctx.setLineWidth(this.lineWidth)
      this.setSvgPath()
      this.ctx.fill()
      this.ctx.clip()
      this.blocks.forEach((item, index) => {
        this.ctx.setStrokeStyle('#fff')
        this.ctx.setFillStyle('green')
        this.ctx.beginPath()
        this.ctx.save()
        this.ctx.arc((item.x + item.l / 2), (item.y + item.l / 2), item.l / 2.1, 0, 2 * Math.PI)
        // this.ctx.strokeRect(item.x, item.y, item.l, item.l)
        this.ctx.stroke()
        this.ctx.clip()
        // this.ctx.fillText(index, item.x + (item.l / 2), item.y + (item.l / 2))
        this.ctx.drawImage(this.images[index % this.images.length], item.x, item.y, item.l, item.l)
        this.ctx.restore()
      })
      this.ctx.draw(true)
    }
  },
  created () {

  },
  onLoad (options) {
    this.stencil = options.name
    this.images = wx.getStorageSync('images') || []
    console.log(this.stencil, this.images)
  },
  mounted () {
    this.cvsInit()
    this.drawStencil(true)
    console.log(drawColorBackground)
    drawColorBackground(this.bgCtx, {x: 0, y: this.viewH}, {x: this.viewW, y: 0}, this.viewW, this.viewH, null, true, () => {})
    // drawImageBackground(this.bgCtx, '/static/stencil/timg.jpg', 'puzzle-bg', 0, 200, 150)
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
}
</style>
