<template>
  <container title="keke" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="shape-wrap">
        <div class="shape-content">
          <img class="shape-img" :style="{width: photoW + 'px', height: photoH + 'px', transform: photoStyle}" :src="photoPath" alt="">
        </div>
        <canvas class="shape-mask" canvas-id="shape-mask"
                @touchstart="touchStartHandler"
                @touchend="touchEndHandler"
                @touchmove="touchMoveHandler"></canvas>
      </div>
      <div scroll-y class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-x class="kinds">
          <ul class="kinds-wrap">
            <li class="kinds-item" v-for="(item, index) in kinds" :key="index" :class="{active: curkinds === item}" @click="changeKinds(item)">{{item}}</li>
          </ul>
        </scroll-view>
        <swiper class="stencils"
                :current="currentIndex"
                @change="swiperChange">
          <swiper-item>
            <scroll-view scroll-y class="stencils-scroll">
              <ul class="stencil-list">
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="item in fill" :key="item"></li>
              </ul>
            </scroll-view>
          </swiper-item>
          <swiper-item>
            <scroll-view scroll-y class="stencils-scroll">
              <ul class="stencil-list">
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="(item, key) in pngs" :key="key" @click="changeStencilPng(key)" :class="{active: stencilPng === key}">
                  <img class="stencil-img" :id="item" :src="item" alt="">
                </li>
                <li class="stencil-item" v-for="item in fill" :key="item"></li>
              </ul>
            </scroll-view>
          </swiper-item>
        </swiper>

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
      kinds: ['类别a', '类别b'],
      icon,
      iphoneX: false,
      viewW: 0,
      viewH: 0,
      photoPath: '/static/photo.jpg',
      cvsW: 0,
      cvsH: 0,
      curkinds: '',
      stencilPng: 'shape1',
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      photoContentWidth: 0,
      photoW: 0,
      photoH: 0,
      left: null,
      top: null,
      currentIndex: 0
    }
  },
  computed: {
    fill () {
      return 6 - (Object.keys(this.pngs).length % 6 || 6)
    },
    maskPath () {
      return `/static/${this.stencilPng}.png`
    },
    photoStyle () {
      return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
    }
  },
  methods: {
    swiperChange (ev){
      this.currentIndex = ev.target.current
      this.changeKinds(this.kinds[this.currentIndex])
    },
    touchStartHandler (ev) {
      startTouch = {
        x: ev.touches[0].x,
        y: ev.touches[0].y,
        translate: {
          x: this.translateX,
          y: this.translateY
        },
        identifiers: '' + ev.touches[0].identifier
      }
      if (ev.touches.length > 1) {
        const {x, y} = ev.touches[1]
        startTouch.distance = Math.sqrt((y - startTouch.y)**2 + (x - startTouch.x)**2)
        let slope = (y - startTouch.y) / (x - startTouch.x)
        if(isNaN(slope)) return
        startTouch.slope = slope
        startTouch.scale = this.scale
        startTouch.rotate = this.rotate
        startTouch.identifiers += ev.touches[1].identifier
      }
    },
    touchMoveHandler(ev) {
      const {x, y} = ev.touches[0]
      this.translateX = startTouch.translate.x + (x - startTouch.x)
      this.translateY = startTouch.translate.y + (y - startTouch.y)
      if (ev.touches.length > 1) {
        const X2 = ev.touches[1].x
        const Y2 = ev.touches[1].y
        const distance = Math.sqrt((y - Y2)**2 + (x - X2)**2)
        let slope = (Y2 - y) / (X2 - x)
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
        this.drawMask()
        this.changeKinds(this.kinds[0])
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
      this.$nextTick(() => {
        this.drawMask()
      })
    },
    changeKinds (val) {
      this.curkinds = val
      this.currentIndex = this.kinds.indexOf(val)
    },
    choosePhoto (name){
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed', 'original'], // 可以指定是原图还是压缩图，默认二者都有
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
              this.scale = 1
              this.photoPath = path
            }
          })
        }
      })
    },
    drawMask () {
      const ctx = wx.createCanvasContext('shape-mask')
      ctx.setFillStyle('#fff')
      const l = (this.viewW - this.photoContentWidth) / 2
      ctx.fillRect(0, 0, this.viewW, this.viewW)
      ctx.clearRect(l, l, this.photoContentWidth, this.photoContentWidth)
      ctx.drawImage(this.maskPath, l, l, this.photoContentWidth, this.photoContentWidth)
      ctx.draw()
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
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      const timer = setTimeout(() => {
        wx.hideLoading()
        wx.showModal({
          title: 'ERROR',
          content: 'Canvas Crashed',//'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
          showCancel: false,
          success: function(res) {

          }
        })
      }, 10000)
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
      ctx.fillRect(0, 0, this.viewW, this.viewH)
      ctx.rect(goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      ctx.save()
      ctx.clip()
      ctx.setFillStyle('#000')
      ctx.fill()
      ctx.translate(this.translateX * scale, this.translateY * scale)
      ctx.drawImage(this.photoPath, goal.puzzleX - width * (this.scale - 1) / 2, goal.puzzleY - height * (this.scale - 1) / 2, width *  this.scale, height *  this.scale)
      ctx.restore()
      ctx.drawImage(this.maskPath, goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      ctx.drawImage(goal.QRCode, goal.QRX, goal.QRY, goal.QRL, goal.QRL)
      ctx.setFillStyle('#9C9C9C')
      ctx.setFontSize(10)
      ctx.setTextBaseline('bottom')
      ctx.fillText('小程序Keke', goal.QRL + 1, goal.imgH)
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'to-images',
          x: 0,
          y: 0,
          width: goal.imgW,
          height: goal.imgH,
          success: function (res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success () {
                clearTimeout(timer)
                wx.hideLoading()
                const url = '../result/main'
                wx.navigateTo({ url })
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
      title: 'Keke',
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
    position: relative;
    box-sizing: border-box;
    padding: 40rpx;
    width: 100vw;
    height: 100vw;
    background: #fff;
    .shape-content{
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
      .shape-img{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 8;
      }
    }
    .shape-mask{
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vw;
      z-index: 9;
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
      position: relative;
      box-sizing: border-box;
      width: 280rpx;
      height: 80rpx;
      line-height: 78rpx;
      text-align: center;
      font-size: 32rpx;
      background: #FFE200;
      color: #000;
      border-radius: 40rpx;
      border: 1px solid #000;
      z-index: 999;
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
        border-bottom: 4rpx solid #2F2F2F;
        transition: border-bottom-color .3s linear;
        &.active{
          border-bottom-color: #FFE200;
        }
      }
    }
    .stencils{
      width: 100%;
      height: calc(100% - 68rpx);
      overflow: hidden;
      background: #2F2F2F;
    }
    .stencils-scroll{
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    &.iphoneX .stencil-list{
      padding-bottom: 168rpx;
    }
    .stencil-list{
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-around;
      background: #2F2F2F;
      padding-bottom: 120rpx;
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
  height: 100vw;
  opacity: 0;
}

</style>
