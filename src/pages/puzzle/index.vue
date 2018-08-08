<template>
  <container title="编辑拼图" background="none">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <canvas class="cvs cvs-bg" canvas-id="puzzle-bg" :style="{width: cvsW + 'px', height: cvsH + 'px'}"></canvas>
      <canvas class="cvs" canvas-id="puzzle" :style="{width: cvsW + 'px', height: cvsH + 'px'}"></canvas>
      <canvas class="to-images" canvas-id="to-images"></canvas>
      <div class="cvs-background" :style="{background: gradientStr[colorIndex], height: bgH + 'px'}"></div>
      <div class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <div class="operation-item location">
          <div class="h-item">
            <p>边框</p>
            <div class="choose-wrap">
              <div class="choose-item"
                   v-for="(item, index) in borderOptions"
                   :class="{active: lineWidth === item}"
                   v-text="chooseText[index]"
                   @click="pickBorder(item)"
              ></div>
            </div>
          </div>
          <div class="h-item">
            <p>边距</p>
            <div class="choose-wrap">
              <div class="choose-item"
                   v-for="(item, index) in marginOptions"
                   :class="{active: marginOptions[imgMargin] === item}"
                   v-text="chooseText[index]"
                   @click="pickMargin(index)"
                   :key="index"
              ></div>
            </div>
          </div>
          <div class="h-item">
            <p>圆角</p>
            <div class="choose-wrap">
              <div class="choose-item"
                   v-for="(item, index) in radiusOptions"
                   :class="{active: radiusOptions[radius] === item}"
                   v-text="chooseText[index]"
                   @click="pickRadius(index)"
                   :key="index"
              ></div>
            </div>
          </div>
        </div>
        <div class="operation-item">
          <p>颜色</p>
          <!--<movable-area>-->
          <!--<movable-view direction="horizontal" inertia>-->
          <!--</movable-view>-->
          <!--</movable-area>-->
          <scroll-view scroll-x class="scroll-wrap">
            <div class="choose-item"
                 v-for="(item, index) in colorOptions"
                 :class="{active: index === colorIndex}"
                 :key="index"
                 :style="{background: gradientStr[index]}"
                 @click="pickColors(item)"></div>
          </scroll-view>
        </div>
        <div class="operation-item complete">
          <div class="choose-stencil" id="change-stencil" @click="chooseStencil">换模板</div>
          <div class="submit" id="create-puzzle" @click="saveImage">生成拼图</div>
        </div>
      </div>
    </div>
  </container>
</template>

<script>
/* global getCurrentPages */
// import { forEachmatTime } from '@/utils/index'
import puzzle from './draw'
import svgJson from '@/images/stencil/svg.json'
import TaskQueue from '../choose-img/taskQueue'
import events from '../../../static/events'

const {
  drawColorBackground, getSvgActions,
  getSVGPath, getImageData, getBlocks,
  createGrid, radiusPath, // requestAnimationFrame,
} = puzzle
let stencilUnit8 = null
let photoCount = 25
let imageBlock = []
let svgActions = []
let imageQueue = new TaskQueue()
let pageInit = true
let renderTime = 0
console.log('start js')
export default {

  data () {
    const pages = getCurrentPages()
    const curPage = pages[pages.length - 1]
    const model = wx.getSystemInfoSync().model
    const iphoneX = model.indexOf('iPhone X') >= 0
    const colorOptions = [
      ['#e6b980', '#eacda3'],
      ['#bdc2e8', '#e6dee9'],
      ['#F3D1AE', '#C8DE7F', '#4FBDCF'],
      ['#9CBABF', '#FDF1DA'],
      ['#FECD9B', '#FFE8C7'],
      ['#D7B3B2', '#E9C9BE'],
      ['#C0B59B', '#866D5C'],
      ['#ABAD71', '#CEB085'],
      ['#F7D6CC','#FAA3A7'],
      ['#ffecd2','#fcb69f'],
      ['#FFF1A6','#FDDF6D'],
      ['#fdfcfb','#e2d1c3'],
      ['#89f7fe','#66a6ff'],
      ['#96deda','#50c9c3'],
      ['#868f96','#596164'],
      ['#B7F8DB','#50A7C2'],
      ['#cfd9df','#e2ebf0'],
      ['#fdfbfb','#ebedee']
    ]
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
      bgH: 500,
      stencil: '',
      calcCount: 0,
      images: [],
      lineColor: '#fff',
      changeLine: false,
      changeRadius: false,
      ios: false,
      pixelRatio: 1,
      range: null,
      userHide: false,
      cvsW: 0,
      cvsH: 0,
      chooseText: ['无', '小', '大'],
      lineWidth: 5,
      imgMargin: 1,
      radius: 1,
      borderOptions: [0, 5, 10],
      marginOptions: [0, 3, 6],
      radiusOptions: [0, 5, 10],
      colors: colorOptions[0],
      colorOptions
    }
  },
  computed: {
    gradientStr () {
      return this.colorOptions.map(item => {
        if (Array.isArray(item)) {
          if (item.length > 1) {
            return item.reduce((a, b, index) => {
              return a + b + ' ' + (index / (item.length - 1) * 100 | 0) + '%' + (index !== item.length - 1 ? ', ' : ')')
            }, 'linear-gradient(to bottom, ')
          } else {
            return item[0] || ''
          }
        }
      })
    },
    colorIndex () {
      return this.colorOptions.indexOf(this.colors)
    }
  },
  methods: {
    pickColors (colors) {
      this.colors = colors
    },
    pickRadius (item) {
      if (item === this.radius) return
      wx.showLoading({
        title: '重新渲染中'
      })
      this.radius = item
      this.drawImages()
    },
    pickBorder (item) {
      if (item === this.lineWidth) return
      this.lineWidth = item
      this.drawBackground()
    },
    pickMargin (item) {
      if (item === this.imgMargin) return
      wx.showLoading({
        title: '重新渲染中'
      })
      this.imgMargin = item
      this.drawImages()
    },
    getSysInfo () {
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight
        var rpx = this.viewW / 750
        this.cvsW = this.viewW - 60 * rpx
        this.cvsH = this.viewH - (this.iphoneX ? 440 * rpx : 372 * rpx) - (this.iphoneX ? 176 * rpx: 128 * rpx) - 60 * rpx
        this.bgH = this.viewH - (this.iphoneX ? 440 * rpx : 372 * rpx) + 60
      } catch (e) {
        // Do something when catch error
      }
    },
    cvsInit () {
      this.stencil = wx.getStorageSync('stencil') || 'heart'
      this.images = wx.getStorageSync('images') || []
      photoCount = this.images.length < 27 ? 27 : this.images.length
      this.ctx = wx.createCanvasContext('puzzle')
      this.bgCtx = wx.createCanvasContext('puzzle-bg')
      this.OpCtx = wx.createCanvasContext('operation')
      this.ctx.setLineJoin('round')
      this.ctx.setLineCap('round')
      this.ctx.setFillStyle('#fff')
      this.bgCtx.setFontSize(16)
      const pages = getCurrentPages()
      pages[pages.length - 1].setData({
        stencil: this.stencil,
        count: this.images.length
      })
    },
    drawStencil (fill) {
      console.log('draw stencil')
      const res = this.setSvgPath(fill)
      this.range = res
      this.drawSvg(this.ctx, true)
      this.ctx.draw(false, () => {
        setTimeout(() => {
          clearTimeout(renderTime)
          this.createImageContainer(res)
        }, 500)
      })
    },
    setSvgPath (fill) {
      console.time('计算')
      var svgData = svgJson.data[this.stencil]
      svgData.actions = getSvgActions(svgData)
      var baseW = this.cvsW - 10
      var baseH = this.cvsH - 10
      var ratio = svgData.width / svgData.height
      var cvsRatio = this.cvsW / this.cvsH
      var h1 = baseW / ratio
      var w1 = baseH * ratio
      console.log(svgData)
      if (ratio < cvsRatio) {
        var width = w1
        var height = baseH
        var left = (baseW - width) / 2 + 5
        var top = 5
      } else {
        width = baseW
        height = h1
        left = 5
        top = (baseH - height) / 2 + 5
      }
      svgActions = getSVGPath(svgData, left, top, width, height)
      // this.drawSvg(this.bgCtx, true)
      // this.bgCtx.draw()
      this.imgZone = {
        x: left,
        y: top,
        w: width,
        h: height
      }
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
      getImageData(range, 'puzzle')
        .then((data) => {
          stencilUnit8 = data
          console.log('range', range)
          var maxArea = (range.end.y - range.start.y) * (range.end.x - range.start.x)
          var minArea = 0
          for (let i = 0; i < stencilUnit8.length; i++) {
            if (stencilUnit8[i]) minArea++
          }
          minArea /= 4
          if (!photoCount) {
            wx.hideLoading()
            return
          }
          var maxL = Math.sqrt(maxArea / photoCount) | 0
          var minL = Math.sqrt(minArea / photoCount) | 0
          console.log('边长范围', maxL, minL)
          this.calculateFitBlock(range, maxL + 1, minL - 1)
        })
        .catch(() => {})
    },
    calculateFitBlock (range, maxL, minL) {
      var l = Math.round((maxL + minL) / 2)
      this.calcCount++
      console.log('边长', l, this.calcCount)
      var grid = createGrid(range, l, 0)
      var block = getBlocks(grid, stencilUnit8, range, 1, this.ios)
      var fitLength = block.filter(item => item.weight > l * l * 0.5).length
      if (this.calcCount > 10) {
        this.radiusOptions = [0, l * 0.2, l / 2 * 0.9]
        console.log('no', fitLength, photoCount, this.calcCount)
        this.sortBlocks(block, grid)
        return
      }
      if (fitLength < photoCount) {
        this.calculateFitBlock(range, l, minL)
      } else if (fitLength > photoCount * 1.1) {
        this.calculateFitBlock(range, maxL, l)
      } else {
        console.log('get', fitLength, photoCount, this.calcCount)
        this.radiusOptions = [0, l * 0.2, l / 2 * 0.9]
        this.sortBlocks(block, grid)
      }
    },
    sortBlocks (data, grid) {
      // data.forEach(block => {
      //   block.factor = 1
      //   block.calcluateWeight({
      //     x: this.viewW / 2,
      //     y: this.viewH / 2
      //   })
      // })
      // grid.forEach(item => {
      //   this.ctx.setStrokeStyle('#000')
      //   this.ctx.strokeRect(item.x, item.y, item.l, item.l)
      // })
      // data.forEach(item => {
      //   this.ctx.setStrokeStyle('red')
      //   this.ctx.strokeRect(item.x, item.y, item.l, item.l)
      // })
      // this.ctx.setStrokeStyle('yellow')
      // this.ctx.strokeRect(this.imgZone.x, this.imgZone.y, this.imgZone.w, this.imgZone.h)
      // this.ctx.draw(true)
      // getApp().ctx = this.ctx
      // wx.hideLoading()
      // return
      imageBlock = data.sort((a, b) => b.weight - a.weight)
      this.calcCount = 0
      console.timeEnd('计算')
      this.drawBackground(() => {
        this.drawImages(() => {
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
          var l = item.l - this.marginOptions[this.imgMargin]
          radiusPath(this.ctx, item.x, item.y, l, l, this.radiusOptions[this.radius])
          this.ctx.fill()
          this.ctx.globalCompositeOperation = 'source-atop'
          const img = this.images[index % this.images.length]
          this.ctx.drawImage(img.compressImg, item.x, item.y, l, l)
          this.ctx.restore()
        }
      }
      this.ctx.draw(false, () => {
        cb && cb()
      })
      wx.hideLoading()
    },
    drawBackground (cb) {
      this.bgCtx.setLineWidth(this.lineWidth)
      // drawColorBackground(this.bgCtx, {x: 0, y: 0}, {x: 0, y: this.viewH}, this.viewW, this.viewH, this.colors, false, () => {})
      this.drawSvg(this.bgCtx)
      this.bgCtx.fill()
      this.bgCtx.draw(false, () => {
        cb && cb()
      })
    },
    chooseStencil () {
      wx.navigateTo({
        url: '../choose-stencil/main?rePick=1'
      })
    },
    saveImage () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      const pages = getCurrentPages()
      pages[pages.length - 1].setData({
        colors: this.colors,
        radius: this.radius,
        lineWidth: this.lineWidth,
        imgMargin: this.imgMargin
      })
      this.bgCtx.setLineWidth(this.lineWidth)
      const {x, y, w, h} = this.imgZone
      wx.canvasToTempFilePath({
        canvasId: 'puzzle',
        x,
        y,
        width: w,
        height: h,
        success: (res) => {
          this.cvsToImages(res.tempFilePath)
        },
        fail (err) {
          console.log(err)
        }
      })
    },
    cvsToImages (puzzlePath) {
      console.log(puzzlePath)
      const variety = [
        {
          name: 'fx',
          puzzleX: 40,
          puzzleY: 118,
          puzzleW: 295,
          puzzleH: 420,
          imgW: 375,
          imgH: 656,
          QRCode: '/static/QRCode.png',
          QRX: 168,
          QRY: 600,
          QRL: 40
        },
        {
          name: '手机壁纸',
          puzzleX: 40,
          puzzleY: 118,
          puzzleW: 295,
          puzzleH: 420,
          imgW: 375,
          imgH: 656,
        },
        {
          name: '个人头像',
          puzzleX: 48,
          puzzleY: 48,
          puzzleW: 279,
          puzzleH: 279,
          imgW: 375,
          imgH: 375,
        },
        {
          name: '相册封面',
          puzzleX: 48,
          puzzleY: 78,
          puzzleW: 279,
          puzzleH: 279,
          imgW: 375,
          imgH: 375,
        }
      ]
      if (Date.now() < 1533859200000) {
        variety.shift()
      }
      variety.forEach(imgData => {
        if (this.viewW < 375) {
          Object.keys(imgData).forEach(key => {
            if (!isNaN(imgData[key])) {
              imgData[key] *= this.viewW / 375
            }
          })
        }
        const {w, h} = this.imgZone
        console.log(w, h, imgData.puzzleW, imgData.puzzleH)
        const scale = w / h
        if (scale >= imgData.puzzleW / imgData.puzzleH) {
          const height = imgData.puzzleW / scale
          imgData.puzzleY += (imgData.puzzleH - height) / 2
          imgData.puzzleH = height
        } else {
          const width = imgData.puzzleH * scale
          imgData.puzzleX += (imgData.puzzleW - width) / 2
          imgData.puzzleW = width
        }
        console.log(imgData)
        imageQueue.addTask(this.makeImage.bind(this, puzzlePath, imgData))
      })
      imageQueue.setQueueEmptyCb(() => {
        wx.setStorageSync('result', variety)
        wx.hideLoading()
        wx.navigateTo({
          url: '../save/main'
        })
      })
    },
    makeImage (puzzlePath, imgData) {
      return new Promise((resolve, reject) => {
        console.log(svgJson.data[this.stencil])
        try {
        const newSvgActions = getSVGPath(svgJson.data[this.stencil], imgData.puzzleX, imgData.puzzleY, imgData.puzzleW, imgData.puzzleH)
        let temp = svgActions
        svgActions = newSvgActions
        var ctx = wx.createCanvasContext('to-images')
        ctx.beginPath()
        ctx.save()
        drawColorBackground(ctx, {x: 0, y: 0}, {x: 0, y: imgData.imgH}, imgData.imgW, imgData.imgH, this.colors, false, () => {})
        ctx.restore()
        ctx.setFillStyle('#fff')
        ctx.setStrokeStyle('#fff')
        ctx.setLineWidth(this.lineWidth)
        this.drawSvg(ctx, false)
        ctx.fill()
        svgActions = temp
        ctx.drawImage(puzzlePath, imgData.puzzleX, imgData.puzzleY, imgData.puzzleW, imgData.puzzleH)
        if (imgData.QRCode) {
          ctx.drawImage(imgData.QRCode, imgData.QRX, imgData.QRY, imgData.QRL, imgData.QRL)
        }
        ctx.draw(false, () => {
          console.log('draw complete')
          wx.canvasToTempFilePath({
            canvasId: 'to-images',
            x: 0,
            y: 0,
            width: imgData.imgW,
            height: imgData.imgH,
            success: function (res) {
              imgData.path = res.tempFilePath
              resolve()
            },
            fail (err) {
              console.log(err)
              reject()
            }
          })
        })
        } catch (err) {
          console.log(err)
        }

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
    init () {
      pageInit = false
      wx.showLoading({
        title: '图片渲染中',
        mask: true
      })
      svgActions = []
      this.cvsInit()
      this.drawStencil(true)
    }
  },
  created () {
    this.getSysInfo()
  },
  mounted () {
    this.init()
    events.$off('cvsDataClear')
    events.$on('cvsDataClear', () => {
      this.lineWidth = 5
      this.imgMargin = 1
      this.radius = 1
      this.colors = this.colorOptions[0]
    })
  },
  onLoad () {
    renderTime = setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '',
        content: '微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
        showCancel: false,
        success: function(res) {
          const url = '../index/main?crash=1'
          wx.reLaunch({ url })
        }
      })
    }, 5000)
  },
  onShow () {
    if (pageInit) return
    const stencil = wx.getStorageSync('stencil')
    if (stencil !== this.stencil) {
      wx.showLoading({
        title: '图片渲染中',
        mask: true
      })
      this.ctx.draw()
      this.bgCtx.draw()
      this.stencil = stencil
      this.drawStencil(true)
    } else {
      this.drawImages()
    }
  },
  onShareAppMessage() {
    return {
      title: '形状拼图',
      path: '/pages/index/main',
      imageUrl: 'http://imglf3.nosdn0.126.net/img/Qmx2R2tOVVFNcjB2UDFEZjE3MExrZjkrVTRXZEhPWnhNSTF4K0xYSnNlenJzOEp3UXluaFJRPT0.jpg?imageView&thumbnail=1680x0&quality=96&stripmeta=0&type=jpg'
    }
  }
}
</script>

<style lang="less" scoped>
.cvs-wrap{
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .cvs{
    position: absolute;
    left: 50%;
    top: 158rpx;
    transform: translateX(-50%);
    z-index: 9;
  }
  &.iphoneX{
    .cvs{
      top: 206rpx;
    }
  }
  .cvs-operation{
    position: absolute;
    left: 0;
    bottom: 0;
    height: 352rpx;
    width: 95vw;
    padding: 2.5vw;
    background: #666;
    z-index: 10;
    &.iphoneX{
      padding-bottom: 88rpx;
    }
    .operation-item{
      position: relative;
      height: 110rpx;
      &.location{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .choose-item{
          background: #fff;
          color: #5F5F5F;
          &.active{
            background: #FFE200;
            &:after {
              display: none;
            }
          }
        }
      }
      &.complete{
        height: 120rpx;
      }
      p{
        font-size: 24rpx;
        line-height: 44rpx;
        color: #dedede;
      }
      .scroll-wrap{
        position: relative;
        width:100%;
        height: 70rpx;
        white-space:nowrap;
      }
      .choose-item{
        display: inline-block;
        position: relative;
        width: 48rpx;
        height: 48rpx;
        border-radius: 12rpx;
        background: pink;
        text-align: center;
        line-height: 48rpx;
        margin-right: 20rpx;
        font-size: 20rpx;
        &.active:after{
          content: '';
          position: absolute;
          left: 0;
          bottom: -16rpx;
          width: 48rpx;
          height: 8rpx;
          border-radius: 4rpx;
          background: #FFE200;
        }
      }
      .choose-stencil{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 120rpx;
        height: 60rpx;
        line-height: 60rpx;
        text-align: center;
        font-size: 24rpx;
        background: transparent;
        color: #fff;
        border-radius: 30rpx;
        border: 1px solid #fff;
      }
      .submit{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 240rpx;
        height: 64rpx;
        line-height: 64rpx;
        text-align: center;
        font-size: 24rpx;
        background: #FFE200;
        color: #000;
        border-radius: 32rpx;
      }
    }
  }
  .header-cvs {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 128rpx;
    z-index: 99;
    &.iphoneX{
      height: 176rpx;
    }
  }
  .cvs-background{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .to-images{
    position: fixed;
    left: -100vw;
    top: -100vh;
    width: 100vw;
    height: 100vh;
    opacity: 0;
  }
}
</style>
