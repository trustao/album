<template>
  <container title="编辑拼图">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <canvas class="cvs cvs-bg" canvas-id="puzzle-bg" :style="{width: cvsW + 'px', height: cvsH + 'px'}"></canvas>
      <canvas class="cvs" canvas-id="puzzle" :style="{width: cvsW + 'px', height: cvsH + 'px'}"></canvas>
      <canvas class="to-images" canvas-id="to-images"></canvas>
      <div class="cvs-background" :style="{background: cvsBg, height: bgH + 'px'}">
        <img class="cvs-bg-img"
          v-if="colorIndex < 0 && bgImgPath"
          :class="{blur: !!drawImgBg}"
          :src="bgImgPath" mode="aspectFill" />
      </div>
      <scroll-view scroll-y class="cvs-operation" :class="{'iphoneX': iphoneX}">
         <ul class="stencil-list" id="stencil">
            <li class="stencil-item" v-for="item in svgJson.name" :key="item" @click="changeStencil(item)" :class="{active: stencil === item}">
              <img class="stencil-img" :id="item" :src="base64Svg[item]" alt="">
            </li>
           <li class="stencil-item">
           </li>
          </ul>
      </scroll-view>
      <cover-view class="submit" id="create-puzzle" @click="saveImage">生成拼图</cover-view>
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
import icon from '@/images/ic_changePic.png'

import svg from '@/images/stencil/svg.json'
import svg1 from '@/images/stencil/1.svg'
import svg2 from '@/images/stencil/2.svg'
import svg3 from '@/images/stencil/3.svg'
import svg4 from '@/images/stencil/4.svg'
import svg5 from '@/images/stencil/5.svg'
import svg6 from '@/images/stencil/6.svg'
import svg7 from '@/images/stencil/7.svg'
import svg8 from '@/images/stencil/8.svg'
import svg9 from '@/images/stencil/9.svg'
import svg10 from '@/images/stencil/10.svg'
import svg11 from '@/images/stencil/11.svg'
import svg12 from '@/images/stencil/12.svg'
import svg13 from '@/images/stencil/13.svg'
import svg14 from '@/images/stencil/14.svg'
import svg15 from '@/images/stencil/15.svg'
import svg16 from '@/images/stencil/16.svg'
import svg17 from '@/images/stencil/17.svg'
import svg18 from '@/images/stencil/18.svg'
import svg19 from '@/images/stencil/19.svg'
import svg20 from '@/images/stencil/20.svg'
import svg21 from '@/images/stencil/21.svg'
import svg22 from '@/images/stencil/22.svg'
import svg23 from '@/images/stencil/23.svg'
import svg24 from '@/images/stencil/24.svg'
import svg25 from '@/images/stencil/25.svg'
import svg26 from '@/images/stencil/26.svg'
import svg27 from '@/images/stencil/27.svg'
import svg28 from '@/images/stencil/28.svg'
import svg29 from '@/images/stencil/29.svg'
import svg30 from '@/images/stencil/30.svg'
import svg31 from '@/images/stencil/31.svg'
import svg32 from '@/images/stencil/32.svg'
import svg33 from '@/images/stencil/33.svg'
import svg34 from '@/images/stencil/34.svg'
import svg35 from '@/images/stencil/35.svg'
import svg36 from '@/images/stencil/36.svg'
// import svg37 from '@/images/stencil/37.svg'
import svg38 from '@/images/stencil/38.svg'
// import svg39 from '@/images/stencil/39.svg'
import svg40 from '@/images/stencil/40.svg'
import svg41 from '@/images/stencil/41.svg'
import svg42 from '@/images/stencil/42.svg'
// import svg43 from '@/images/stencil/43.svg'
import svg44 from '@/images/stencil/44.svg'
// import svg45 from '@/images/stencil/45.svg'
import svg46 from '@/images/stencil/46.svg'
import svg47 from '@/images/stencil/47.svg'
import svg48 from '@/images/stencil/48.svg'
import svg49 from '@/images/stencil/49.svg'
import svg50 from '@/images/stencil/50.svg'
import svg51 from '@/images/stencil/51.svg'
import svg52 from '@/images/stencil/52.svg'
import svg53 from '@/images/stencil/53.svg'
// import svg54 from '@/images/stencil/54.svg'
// import svg55 from '@/images/stencil/55.svg'
import svg56 from '@/images/stencil/56.svg'
import svg57 from '@/images/stencil/57.svg'

const {
  drawColorBackground, getSvgActions,
  getSVGPath, getImageData, getBlocks, drawImageBackground,
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
      ['#FFD9D9'],
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
    const scaleOptions = [
      {
        width: '36rpx',
        height: '36rpx',
        scale: 1
      },
      {
        width: '32rpx',
        height: '48rpx',
        scale: 3 / 4
      },
      {
        width: '48rpx',
        height: '32rpx',
        scale: 4 / 3
      }
    ]
    return {
      base64Svg: {
        '1': svg1,
        '2': svg2,
        '3': svg3,
        '4': svg4,
        '5': svg5,
        '6': svg6,
        '7': svg7,
        '8': svg8,
        '9': svg9,
        '10': svg10,
        '11': svg11,
        '12': svg12,
        '13': svg13,
        '14': svg14,
        '15': svg15,
        '16': svg16,
        '17': svg17,
        '18': svg18,
        '19': svg19,
        '20': svg20,
        '21': svg21,
        '22': svg22,
        '23': svg23,
        '24': svg24,
        '25': svg25,
        '26': svg26,
        '27': svg27,
        '28': svg28,
        '29': svg29,
        '30': svg30,
        '31': svg31,
        '32': svg32,
        '33': svg33,
        '34': svg34,
        '35': svg35,
        '36': svg36,
        // '37': svg37,
        '38': svg38,
        // '39': svg39,
        '40': svg40,
        '41': svg41,
        '42': svg42,
        // '43': svg43,
        '44': svg44,
        // '45': svg45,
        '46': svg46,
        '47': svg47,
        '48': svg48,
        '49': svg49,
        '50': svg50,
        '51': svg51,
        '52': svg52,
        '53': svg53,
        // '54': svg54,
        // '55': svg55,
        '56': svg56,
        '57': svg57
        // '58': svg58,
        // '59': svg59,
        // '60': svg60,
        // '61': svg61,
        // '62': svg62,
        // '63': svg63,
        // '64': svg64,
        // '65': svg65,
        // '66': svg66,
        // '67': svg67,
        // '68': svg68,
        // '69': svg69
      },
      svgJson,
      icon,
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
      lineWidth: 0,
      imgMargin: 0,
      radius: 0,
      borderOptions: [0, 5, 10],
      marginOptions: [0, 3, 6],
      radiusOptions: [0, 5, 10],
      colors: colorOptions[0],
      colorOptions,
      scaleOptions,
      drawImgBg: -1,
      scale: 0,
      bgImg: {
        w: 0,
        h: 0,
        path: ''
      }
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
    },
    bgImgPath () {
      return this.bgImg.path || ''
    },
    cvsBg(){
      if (this.colorIndex >= 0) {
        return this.gradientStr[this.colorIndex]
      } else {
        return 'transparent'
      }
    }
  },
  methods: {
    pickColors (colors) {
      this.colors = colors
      this.drawImgBg = -1
    },
    pickRadius (item) {
      if (item === this.radius) return
      wx.showLoading({
        title: '重新渲染中'
      })
      console.log(this.radiusOptions)
      this.radius = item
      this.drawImages()
    },
    pickBorder (item) {
      if (item === this.lineWidth) return
      this.lineWidth = item
      this.drawBackground()
    },
    pickScale (item) {
      if (item === this.scale) return
      this.scale = item
      wx.showLoading({
        title: '重新渲染中'
      })
      this.$nextTick(() =>{
        this.startCalc()
      })
    },
    pickMargin (item) {
      if (item === this.imgMargin) return
      wx.showLoading({
        title: '重新渲染中'
      })
      this.imgMargin = item
      this.drawImages()
    },
    chooseImgBg() {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed', 'original'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          this.setBgImg(res.tempFilePaths[0], () =>{
            this.drawBlur(0)
          })
        }
      })
    },
    setBgImg (path, cb) {
       wx.getImageInfo({
          src: path,
          success: (res) => {
            var w = res.width
            var h = res.height
            this.bgImg = {
              w,
              h,
              path
            }
            if (cb) cb()
          }
       })
    },
    drawBlur(val) {
      this.colors = []
      this.drawImgBg = val
    },
    getSysInfo () {
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight
        var rpx = this.viewW / 750
        this.cvsW = 355// this.viewW - 60 * rpx
        this.cvsH = 355// this.viewH - (this.iphoneX ? 440 * rpx : 372 * rpx) - (this.iphoneX ? 176 * rpx: 128 * rpx) - 60 * rpx
        this.bgH = this.viewH - (this.iphoneX ? 440 * rpx : 372 * rpx) + 60
      } catch (e) {
        // Do something when catch error
      }
    },
    cvsInit () {
      this.stencil = '1'
      this.images = wx.getStorageSync('images') || []
      if (this.images.length) this.setBgImg(this.images[0].path)
      photoCount = this.images.length// < 27 ? 27 : this.images.length
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
      this.setSvgPath(fill)
      this.drawSvg(this.ctx, true)
      this.ctx.draw(false, () => {
        setTimeout(() => {
          clearTimeout(renderTime)
          this.createImageContainer()
        }, 500)
      })
    },
    setSvgPath (fill) {
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
      this.repairRange()
    },
    repairRange(){
      var {x, y, w, h} = this.imgZone
      var sX, sY, eX, eY;
      var scale = this.scaleOptions[this.scale].scale
      if (w / h > scale) {
        sX = x
        sY = y - (w / scale - h) / 2
        eX = x + w
        eY = sY + w / scale
      } else {
        sX = x - (h * scale - w) / 2
        sY = y
        eX = sX + h * scale
        eY = y + h
      }

      this.range = {
        start: {
          x: sX | 0,
          y: sY | 0
        },
        end: {
          x: eX | 0,
          y: eY | 0
        }
      }
    },
    createImageContainer () {
      getImageData(this.range, 'puzzle')
        .then((data) => {
          stencilUnit8 = data
          this.startCalc()
        })
        .catch(() => {})
    },
    startCalc() {
      var range = this.range
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
      var maxL = Math.sqrt(maxArea / photoCount * this.scaleOptions[this.scale].scale) | 0
      var minL = Math.sqrt(minArea / photoCount * this.scaleOptions[this.scale].scale) | 0
      console.log('边长范围', maxL, minL)
      if (this.images.length === 1) {
        this.sortBlocks(createGrid(range, range.end.x - range.start.x, range.end.x - range.start.x, 0))
        return
      }
      this.calculateFitBlock(range, maxL + 1, minL - 1)
    },
    calculateFitBlock (range, maxL, minL) {
      var l = Math.round((maxL + minL) / 2)
      this.calcCount++
      console.log('边长', l, this.calcCount)
      var grid = createGrid(range, l, l / this.scaleOptions[this.scale].scale | 0, 0)
      var block = getBlocks(grid, stencilUnit8, range, 1, this.ios)
      var fitLength = block.filter(item => item.weight > l * l / this.scaleOptions[this.scale].scale * 0.5).length
      if (this.calcCount > 10) {
        this.radiusOptions = [0, l * 0.2, Math.min(l, l / this.scaleOptions[this.scale].scale) / 2 * 0.9]
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
        this.radiusOptions = [0, l * 0.2, Math.min(l, l / this.scaleOptions[this.scale].scale) / 2 * 0.9]
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
      this.drawBackground(() => {
        this.drawImages(() => {
        })
      })
    },
    drawSvg (ctx, fill, customActions) {
      var actions = customActions || svgActions
      ctx.setFillStyle('#fff')
      ctx.setStrokeStyle('#fff')
      ctx.beginPath()
      for (let i = 0; i < actions.length; i++) {
        const item = actions[i]
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
          radiusPath(this.ctx,
           item.x, item.y,
           item.w - this.marginOptions[this.imgMargin],
           item.h - this.marginOptions[this.imgMargin],
           this.radiusOptions[this.radius])
          this.ctx.fill()
          this.ctx.globalCompositeOperation = 'source-atop'
          const img = this.images[index % this.images.length]
          this.ctx.drawImage(img.compressImg[this.scale], item.x, item.y, item.w - this.marginOptions[this.imgMargin], item.h - this.marginOptions[this.imgMargin])
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
    changeStencil (name){
      if (name !== this.stencil) {
        this.stencil = name
        wx.showLoading({
          title: '图片渲染中',
          mask: true
        })
        this.ctx.draw()
        this.bgCtx.draw()
        this.drawStencil(true)
      }
    },
    chooseStencil () {
      wx.navigateTo({
        url: '../choose-stencil/main?rePick=1'
      })
    },
    saveImage () {
      if (this.drawImgBg === 1 && this.colorIndex < 0) {
        wx.showModal({
          title: '',
          content: '虚化背景的生成较复杂，预计耗时十几秒，请知晓！',
          confirmText: '确定生成',
          success: (res) => {
            if (res.confirm) {
              console.log('用户点击确定')
              this.startCreatePuzzle()
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        return
      }
      this.startCreatePuzzle()
    },
    startCreatePuzzle () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      const pages = getCurrentPages()
      pages[pages.length - 1].setData({
        colors: this.colors,
        radius: this.radius,
        lineWidth: this.lineWidth,
        imgMargin: this.imgMargin,
        scale: this.scale,
        blur: this.drawImgBg
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
        // {
        //   name: '拼图作品',
        //   puzzleX: 40,
        //   puzzleY: 118,
        //   puzzleW: 295,
        //   puzzleH: 420,
        //   imgW: 375,
        //   imgH: 656,
        //   QRCode: '/static/QRCode.png',
        //   QRX: 168,
        //   QRY: 586,
        //   QRL: 60
        // },
        // {
        //   name: '手机壁纸',
        //   puzzleX: 40,
        //   puzzleY: 118,
        //   puzzleW: 295,
        //   puzzleH: 420,
        //   imgW: 375,
        //   imgH: 656,
        // },
        {
          name: '个人头像',
          puzzleX: 48,
          puzzleY: 48,
          puzzleW: 279,
          puzzleH: 279,
          imgW: 375,
          imgH: 375,
          QRCode: '/static/QRCode.png',
          QRX: 0,
          QRY: 332,
          QRL: 43
        }
        // {
        //   name: '相册封面',
        //   puzzleX: 48,
        //   puzzleY: 78,
        //   puzzleW: 279,
        //   puzzleH: 279,
        //   imgW: 375,
        //   imgH: 375,
        // }
      ]
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
        wx.saveImageToPhotosAlbum({
          filePath: variety[0].path,
          success (res) {
            wx.hideLoading()
            wx.navigateTo({
              url: '../save/main'
            })
          },
          fail () {
            wx.hideLoading()
            wx.showToast({
              title: '保存失败，请在右上角设置中打开权限。',
              icon: 'none'
            })
          }
        })
      })
    },
    makeImage (puzzlePath, imgData) {
      return new Promise((resolve, reject) => {
        console.log('执行任务')
        try {
          const newSvgActions = getSVGPath(svgJson.data[this.stencil], imgData.puzzleX, imgData.puzzleY, imgData.puzzleW, imgData.puzzleH)
          var ctx = wx.createCanvasContext('to-images')
          ctx.clearRect(0, 0, imgData.imgW,  imgData.imgH)
          ctx.beginPath()
          ctx.save()
          ctx.setFillStyle('#fff')
          ctx.setStrokeStyle('#fff')
          ctx.setLineWidth(this.lineWidth)
          this.drawSvg(ctx, false, newSvgActions)
          ctx.fill()
          ctx.drawImage(puzzlePath, imgData.puzzleX, imgData.puzzleY, imgData.puzzleW, imgData.puzzleH)
          if (imgData.QRCode) {
            ctx.drawImage(imgData.QRCode, imgData.QRX, imgData.QRY, imgData.QRL, imgData.QRL)
            ctx.setFillStyle('#9C9C9C')
            ctx.setFontSize(10)
            ctx.setTextBaseline('bottom')
            ctx.fillText('小程序Shapin', 44, 375)
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
          ctx.restore()
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
    this.drawImages()
  },
  onShareAppMessage() {
    return {
      title: 'Shapin',
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
    top: 40rpx;
    transform: translateX(-50%);
    z-index: 9;
  }
  &.iphoneX{
    .cvs{
      // top: 206rpx;
    }
    .submit{
      bottom: 88rpx;
    }
  }
  .submit{
    position: absolute;
    bottom: 40rpx;
    left: 50%;
    transform: translate(-50%, 0);
    width: 240rpx;
    height: 64rpx;
    line-height: 64rpx;
    text-align: center;
    font-size: 24rpx;
    background: #FFE200;
    color: #000;
    border-radius: 32rpx;
    z-index: 999;
  }
  .cvs-operation{
    position: absolute;
    left: 0;
    bottom: 0;
    height: 456rpx;
    width: 100vw;
    // padding: 2.5vw;
    background: #666;
    z-index: 10;
    &.iphoneX{
      // padding-bottom: 88rpx;

    }

    .operation-item{
      position: relative;
      height: 110rpx;
      display: flex;
      .h-item{
        display: inline-block;
        width: 184rpx;
        margin-right: 60rpx;
        .choose-item:last-child{
          margin-right: 0;
        }
      }
      .colors-wrap{
        display: inline-block;
        width: calc(100% - 244rpx);
      }
      .color-bg.choose-wrap{
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
      .choose-wrap{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
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
        .img-wrap{
          width: 48rpx;
          height: 48rpx;
          overflow: hidden;
          border-radius: 12rpx;
          background: #9B9B9B;
          .img-btn{
            width: 48rpx;
            height: 48rpx;
          }
        }
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
        &.img-choose {
          position: relative;
          background: #9B9B9B;
          overflow: hidden;
          .img{
            width: 48rpx;
            height: 48rpx;
          }
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
    overflow: hidden;
    .cvs-bg-img{
      width: 100%;
      height: 100%;
      &.blur{
        filter: blur(5px);
      }
    }
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
.stencil-list{
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    background: #2F2F2F;
    border: 3rpx solid #2F2F2F;
  .stencil-item{
      box-sizing: border-box;
      position: relative;
      width: 25%;
      height: 25vw;
      white-space: normal;
      word-break: break-all;
      text-align: center;
      background: #3D4042;
      border: 3rpx solid #2F2F2F;
      border-collapse: collapse;
      &.active{
        background: #6AC259;
      }
      .stencil-img{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        color: #fff;
      }
    }
  }
</style>
