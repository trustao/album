<template>
  <container title="选择shape">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="shape-wrap">
        <div class="shape-content"
             @touchstart="touchStartHandler"
             @touchend="touchEndHandler"
             @touchmove="touchMoveHandler"
        >
          <img class="shape-img" :style="{width: photoW + 'px', height: photoH + 'px', transform: photoStyle}" :src="photoPath" alt="">
          <img class="shape-mask" :src="maskPath">
        </div>
      </div>
      <div scroll-y class="cvs-operation" :style="{height: operationH + 'px'}" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-x class="kinds">
          <ul class="kinds-wrap">
            <li class="kinds-item" :class="{active: kinds === 'svg'}" @click="changeKinds('svg')">svg</li>
            <li class="kinds-item" :class="{active: kinds === 'png'}" @click="changeKinds('png')">png</li>
          </ul>
        </scroll-view>
        <scroll-view scroll-y class="stencils">
          <ul class="stencil-list">
            <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencil === item}">
              <img class="stencil-img" :id="item" :src="item" alt="">
            </li>
            <li class="stencil-item" v-for="item in fill" :key="item"></li>
          </ul>
        </scroll-view>
      </div>
      <cover-view class="btns" id="create-puzzle">
        <cover-view class="btn" id="create-puzzle" @click="choosePhoto">选择图片</cover-view>
        <cover-view class="btn" id="create-puzzle" @click="saveImage">保存图片</cover-view>
      </cover-view>
    </div>
    <canvas class="to-images" :style="{left: left, top: top}" canvas-id="to-images"></canvas>
  </container>
</template>

<script>
/* global getCurrentPages */
// import { forEachmatTime } from '@/utils/index'
import puzzle from './draw'
import TaskQueue from './taskQueue'
import events from '../../../static/events'
import icon from '@/images/ic_changePic.png'


import shape1 from '@/images/stencilPng/shape1-small.png'
import shape2 from '@/images/stencilPng/shape2-small.png'
import shape3 from '@/images/stencilPng/shape1-small-2.4.png'
import shape4 from '@/images/stencilPng/shape2-small-2.4.png'
import shape5 from '@/images/stencilPng/shape1-small-3.png'
import shape6 from '@/images/stencilPng/shape2-small-3.png'

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

let startTouch = {}
let doubleClear = false
export default {

  data () {
    return {
      pngs: {
        shape1, shape2,
        'shape1-2.4': shape3,
        'shape2-2.4': shape4,
        'shape1-3': shape5,
        'shape2-3': shape6
      },
      icon,
      iphoneX: false,
      viewW: 0,
      viewH: 0,
      photoPath: '/static/photo.jpg',
      cvsW: 0,
      cvsH: 0,
      kinds: 'svg',
      stencilPng: 'shape1',
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      photoContentWidth: 0,
      photoW: 0,
      photoH: 0,
      left: null,
      top: null
    }
  },
  computed: {
    fill () {
      return 6 - Object.keys(this.pngs).length % 6
    },
    maskPath () {
      return `/static/${this.stencilPng}.png`
    },
    photoStyle () {
      return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
    }
  },
  methods: {
    touchStartHandler (ev) {
      startTouch = {
        x: ev.touches[0].clientX,
        y: ev.touches[0].clientY,
        translate: {
          x: this.translateX,
          y: this.translateY
        },
        identifiers: '' + ev.touches[0].identifier
      }
      if (ev.touches.length > 1) {
        const {clientX, clientY} = ev.touches[1]
        startTouch.distance = Math.sqrt((clientY - startTouch.y)**2 + (clientX - startTouch.x)**2)
        let slope = (clientY - startTouch.y) / (clientX - startTouch.x)
        if(isNaN(slope)) return
        startTouch.slope = slope
        startTouch.scale = this.scale
        startTouch.rotate = this.rotate
        startTouch.identifiers += ev.touches[1].identifier
      }
    },
    touchMoveHandler(ev) {
      const {clientX, clientY} = ev.touches[0]
      this.translateX = startTouch.translate.x + (clientX - startTouch.x)
      this.translateY = startTouch.translate.y + (clientY - startTouch.y)
      if (ev.touches.length > 1) {
        const X2 = ev.touches[1].clientX
        const Y2 = ev.touches[1].clientY
        const distance = Math.sqrt((clientY - Y2)**2 + (clientX - X2)**2)
        let slope = (Y2 - clientY) / (X2 - clientX)
        if(isNaN(slope)) return
        this.scale = startTouch.scale * (distance / startTouch.distance)
        this.rotate = startTouch.rotate + Math.atan(slope - startTouch.slope) / Math.PI * 180
        console.log(this.rotate)
      }
    },
    touchEndHandler (ev) {
      console.log(ev)
      if (ev.touches) {
        const identifiers = ev.touches.reduce((a, b) => {
          return a + b.identifier
        }, '').slice(0, 2)
        if (identifiers !== startTouch.identifiers) {
          this.touchStartHandler(ev)
        }
      }
    },
    getRectData (){
      wx.createSelectorQuery().select('.shape-content').boundingClientRect((rect) => {
        this.photoW = this.photoH = this.photoContentWidth = rect.width
      }).exec()
    },
    changeStencil (name){
      if (name !== this.stencil) {
        this.stencil = name
        wx.showLoading({
          title: '图片渲染中',
          mask: true
        })
        this.ctx.draw()
        this.drawStencil(true)
      }
    },
    changeStencilPng (item) {
      this.stencilPng = item
    },
    changeKinds (val) {
      this.kinds = val
    },
    choosePhoto (name){
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          const path = res.tempFilePaths[0]
          wx.getImageInfo({
            src: path,
            success: (data) => {
              const {width, height} = data
              if (width > height) {
                this.photoH = this.photoContentWidth
                this.photoW = this.photoContentWidth * (width / height)
                this.translateX = -(this.photoW - this.photoH) / 2
                this.translateY = 0
              } else {
                this.photoW = this.photoContentWidth
                this.photoH = this.photoContentWidth / (width / height)
                this.translateY = -(this.photoH - this.photoW) / 2
                this.translateX = 0
              }
              this.photoPath = path
            }
          })
        }
      })
    },
    getSysInfo () {
      const headerH = {
        default: 128,
        iphoneX: 176,
        plus: 116,
        iphone5: 142
      }
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight
      } catch (e) {
        // Do something when catch error
      }
    },
    saveImage () {
      // wx.showLoading({
      //   title: '图片生成中',
      //   mask: true
      // })
      const goal = {
        name: '个人头像',
        puzzleX: 20,
        puzzleY: 20,
        puzzleW: 335,
        puzzleH: 335,
        imgW: 375,
        imgH: 375,
        QRCode: '/static/QRCode.png',
        QRX: 0,
        QRY: 332,
        QRL: 43
      }
      const scale = goal.puzzleW / this.photoContentWidth
      const ctx = wx.createCanvasContext('to-images')
      let height, width
      if (this.photoW > this.photoH) {
        height = goal.puzzleH
        width = goal.puzzleH * (this.photoW / this.photoH)
      } else {
        width = goal.puzzleW
        height = goal.puzzleW / (this.photoW / this.photoH)
      }
      ctx.beginPath()
      ctx.setFillStyle('#fff')
      ctx.fillRect(0, 0, goal.imgW, goal.imgH)
      ctx.rect(goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      ctx.save()
      ctx.clip()
      ctx.setFillStyle('#000')
      ctx.fill()
      ctx.translate(this.translateX * scale, this.translateY * scale)
      ctx.scale(this.scale, this.scale)
      ctx.drawImage(this.photoPath, goal.puzzleX, goal.puzzleY, width, height)
      ctx.restore()
      ctx.drawImage(this.maskPath, goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          canvasId: 'to-images',
          x: 0,
          y: 0,
          width: goal.imgW,
          height: goal.imgH,
          success: function (res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success (res) {

              },
              fail () {
                wx.hideLoading()
                wx.showToast({
                  title: '保存失败，请在右上角设置中打开权限。',
                  icon: 'none'
                })
              }
            })
          },
          fail (err) {
            console.log(err)
          }
        })
      })
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
      let {x, y, w, h} = this.imgZone
      if (this.kinds === 'png') {
        x = 0
        y = 0
        w = this.cvsW
        h = this.cvsH
      }
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
          puzzleX: 15,
          puzzleY: 15,
          puzzleW: 345,
          puzzleH: 345,
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
        if (this.kinds === 'png') {
          imageQueue.addTask(this.makeImage.bind(this, puzzlePath, imgData))
          return
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
          ctx.fillRect(0, 0, imgData.imgW, imgData.imgH)
          ctx.setLineWidth(0)
          this.drawSvg(ctx, false, newSvgActions)
          ctx.fill()
          console.log(imgData.puzzleW, imgData.puzzleH)
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
    this.getRectData()
    events.$off('cvsDataClear')
    events.$on('cvsDataClear', () => {

    })
  },
  onLoad () {

  },
  onShow () {
    if (pageInit) return
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
  &.iphoneX{
    .btns{
      bottom: 60rpx;
    }
  }
  .shape-wrap{
    box-sizing: border-box;
    padding: 40rpx;
    width: 100vw;
    height: 100vw;
    background: lightpink;
    .shape-content{
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
      .shape-mask{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9;
      }
      .shape-img{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 8;
      }
    }
  }

  .btns{
    position: absolute;
    left: 0;
    bottom: 20rpx;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: 80rpx;
    .btn{
      width: 280rpx;
      height: 80rpx;
      line-height: 78rpx;
      text-align: center;
      font-size: 32rpx;
      background: #FFE200;
      color: #000;
      border-radius: 44rpx;
      z-index: 999;
      border: 1px solid #000;
      &:first-child{
        background: #fff;
      }
    }
  }

  .cvs-operation{
    position: relative;
    height: calc(100% - 100vw);
    width: 100vw;
    // padding: 2.5vw;
    border: 3rpx solid #2F2F2F;
    padding-top: 68rpx;
    background: #666;
    z-index: 10;
    .kinds{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 68rpx;
      padding: 0 20rpx;
      background: #2F2F2F;
      overflow: hidden;
      .kinds-wrap{
        height: 68rpx;
        white-space: nowrap;
      }
      .kinds-item{
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        height: 68rpx;
        line-height: 68rpx;
        margin: 0 20rpx;
        color: #fff;
        border-bottom: 4px solid #2F2F2F;
        &.active{
          border-bottom-color: #FFE200;
        }
      }
    }
    .stencils{
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #2F2F2F;
    }
    &.iphoneX .stencil-list{
      margin-bottom: 168rpx;
    }
    .stencil-list{
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-around;
      background: #2F2F2F;
      margin-bottom: 120rpx;
      .stencil-item{
        box-sizing: border-box;
        position: relative;
        width: 16.66%;
        height: 16.66vw;
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

</style>
