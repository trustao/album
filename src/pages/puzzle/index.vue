<template>
  <div class="cvs-wrap">
    <canvas class="cvs" canvas-id="puzzle-bg"></canvas>
    <canvas class="cvs" canvas-id="puzzle"></canvas>
  </div>
</template>

<script>
// import { forEachmatTime } from '@/utils/index'
import card from '@/components/card'
import puzzle from './draw'
import svgJson from '@/images/stencil/svg.json'
// import images from '~/stencil'
const {drawSVGPath, getBlocks} = puzzle
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
      images: []
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
      var svgData = svgJson.data.family // todo
      var ratio = svgData.width / svgData.height
      var s = this.viewW * this.viewH * 0.4
      var height = Math.sqrt(s / ratio)
      var width = s / height
      var top = (this.viewH - height) / 2
      var left = (this.viewW - width) / 2
      drawSVGPath(this.ctx, svgData, left, top, width, height, !!fill)
      this.ctx.draw(true, () => {
        console.time('计算')
        this.createImageContainer()
      })
    },
    createImageContainer () {
      // console.log('create grid')
      getBlocks(this.viewW, this.viewH, 'puzzle', 30, 1, 1)
        .then((data) => {
          // this.ctx.clearRect(0, 0, this.viewW, this.viewH)
          data.sort((a, b) => b.weight - a.weight).forEach((item, index) => {
            this.ctx.setStrokeStyle('red')
            this.ctx.setFillStyle('green')
            this.ctx.strokeRect(item.x, item.y, item.l, item.l)
            this.ctx.fillText(index, item.x + (item.l / 2), item.y + (item.l / 2))
            this.ctx.draw(true)
          })
          console.log(data)
          console.timeEnd('计算')
        })
        .catch(() => {})
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
    // drawColorBackground(this.bgCtx, {x: 0, y: 150}, {x: 200, y: 0}, 200, 150, null, true)
    // drawImageBackground(this.bgCtx, '/static/stencil/timg.jpg', 'puzzle-bg', 0, 200, 150)
    this.drawStencil(true)
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
}
</style>
