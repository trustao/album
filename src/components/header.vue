<template>
  <canvas class="header-cvs" canvas-id="head-cvs" :class="{'iphoneX': iphoneX}" @tap="back"></canvas>
</template>

<script>
/* global getCurrentPages */
export default {
  props: ['title', 'background'],
  data () {
    const pages = getCurrentPages()
    const curPage = pages[pages.length - 1]
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      noBack: true,
      noBackground: false,
      size: {w: 0, h: 0},
      curPage
    }
  },
  methods: {
    back (ev) {
      console.log(ev)
      var x = ev.clientX
      var y = ev.clientY
      if (x > 5 && x < 25 && y > this.size.h - 30) {
        wx.navigateBack()
      }
    },
    drawHeader () {
      this.getSize().then((size) => {
        this.size = size
        var y = size.h - 10
        var ctx = wx.createCanvasContext('head-cvs', this.curPage)
        console.log(ctx)
        ctx.beginPath()
        ctx.setLineCap('round')
        ctx.setLineWidth(2)
        ctx.setStrokeStyle('#333')
        if (this.background !== 'none') {
          console.log('draw bg')
          ctx.setFillStyle(this.background)
          ctx.fillRect(0, 0, size.w, size.h)
        }
        ctx.moveTo(23, y)
        ctx.lineTo(15, y - 8)
        ctx.lineTo(23, y - 16)
        ctx.stroke()
        ctx.setFontSize(17)
        ctx.setTextBaseline('bottom')
        ctx.setFillStyle('#333')
        var textW = ctx.measureText(this.title).width
        ctx.fillText(this.title, (size.w - textW) / 2, y + 2)
        ctx.draw()
      })
    },
    getSize () {
      return new Promise((resolve, reject) => {
        wx.createSelectorQuery().in(this.curPage).select('.header-cvs').fields({
          computedStyle: ['width', 'height']
        }, function (res) {
          resolve({
            w: parseInt(res.width),
            h: parseInt(res.height)
          })
        }).exec()
      })
    }
  },
  mounted () {
    this.drawHeader()
    console.log('======================', this.curPage)
  }
}
</script>

<style lang="less">
.header-cvs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 126rpx;
  &.iphoneX{
    height: 180rpx;
  }
}
</style>
