<template>
  <div class="cvs-wrap">
    <canvas class="cvs" canvas-id="puzzle-bg"></canvas>
    <canvas class="cvs" canvas-id="puzzle"></canvas>
  </div>
</template>

<script>
// import { forEachmatTime } from '@/utils/index'
import card from '@/components/card'
import puzzle from './puzzle'
import svgJson from '@/images/stencil/svg.json'
// import images from '~/stencil'
const {drawImageBackground, drawSVGPath} = puzzle
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
    drawImageBackground(this.bgCtx, '/static/stencil/timg.jpg', 'puzzle-bg', 0, 200, 150)
    drawSVGPath(this.ctx, svgJson.data[this.stencil].path, true)
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
