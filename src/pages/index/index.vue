<template>
  <container title="keke" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="shape-wrap">
        <div class="shape-content">
          <img class="shape-img copy" v-if="copy.show" :style="{width: copy.photoW + 'px', height: copy.photoH + 'px', transform: copy.photoStyle}" :src="copy.photoPath" alt="">
          <img class="shape-img" :style="{width: photoW + 'px', height: photoH + 'px', transform: photoStyle}" :src="photoPath" alt="">
        </div>
        <canvas class="shape-mask" canvas-id="shape-mask" :disable-scroll="true"
                @touchstart="touchStartHandler"
                @touchend="touchEndHandler"
                @touchmove="touchMoveHandler"></canvas>
      </div>
      <div scroll-y class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-y scroll-x  @touchstart.stop="fn" @touchend="changeKindsTouchEndHandler" class="kinds">
          <ul class="kinds-wrap">
            <li class="kinds-item" v-for="(cate, key) in kinds" :data-cate="cate" :key="key" :class="{active: curkinds === cate}">{{cate}}</li>
          </ul>
        </scroll-view>
        <swiper class="stencils"
                :current="currentIndex"
                id="stencils"
                @touchstart="fn"
                @touchend="changeStencilPngTouchEndHandler"
                @change="swiperChange">
          <swiper-item v-for="(cate, key) in kindsData" :key="key">
            <scroll-view scroll-y class="stencils-scroll">
              <ul class="stencil-list" >
                <li class="stencil-item" v-for="(item, index) in cate" :key="index" :data-stencil="item" :class="{active: stencilPng === item.full_url}">
                  <img class="stencil-img" :data-stencil="item" :src="item.full_icon_url" alt="">
                </li>
                <li class="stencil-item" v-for="item in (6 - (cate.length % 6 || 6))" :key="item"></li>
              </ul>
            </scroll-view>
          </swiper-item>
        </swiper>

      </div>
      <cover-view class="btns" id="create-puzzle">
        <cover-view class="btn" id="choose-img" @click="choosePhoto">选择图片</cover-view>
        <cover-view class="btn" id="save-img" @click="saveImage">保存图片</cover-view>
      </cover-view>
    </div>
    <canvas class="to-images" :style="{left: left, top: top}" canvas-id="to-images"></canvas>
  </container>
</template>

<script>
/* global getCurrentPages */
const API = 'https://api.pintuxiangce.com/icon/index'

import icon from '@/images/ic_changePic.png'
import {TapHelper, Trigger, requestAnimationFrame} from './draw'

const tapHelper = new TapHelper({zIndexModel: true})
let startTouch = {}
let startTime = 0
let startX = 0
let startY = 0
const chartlets = []
let chartletController = null
export default {

  data () {
    return {
      kinds: [],
      icon,
      iphoneX: false,
      viewW: 0,
      viewH: 0,
      photoPath: '/static/photo.jpg',
      cvsW: 0,
      cvsH: 0,
      curkinds: '',
      stencilPng: '',
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      photoContentWidth: 0,
      photoW: 0,
      photoH: 0,
      left: null,
      top: null,
      currentIndex: 0,
      kindsData: [],
      loadedPath: '',
      copy: {
        show: false,
        photoH: 0,
        photoW: 0,
        photoStyle: '',
        photoPath: ''
      },
      chartletW: 40,
      chartletH: 40,
      chartletControl: false
    }
  },
  computed: {
    maskPath () {
      console.log(this.stencilPng)
      return this.stencilPng
    },
    photoStyle () {
      return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
    }
  },
  methods: {
    fn (ev) {
      startTime = Date.now()
      startX = ev.mp.changedTouches[0].clientX
      startY = ev.mp.changedTouches[0].clientY
    },
    changeStencilPngTouchEndHandler (ev) {
      if (Date.now() - startTime < 250 &&
        Math.abs(ev.mp.changedTouches[0].clientX - startX) < 10 &&
        Math.abs(ev.mp.changedTouches[0].clientY - startY) < 10) {
        this.changeStencilPng(ev.target.dataset.stencil)
      }
    },
    changeKindsTouchEndHandler (ev) {
      if (Date.now() - startTime < 250 &&
        Math.abs(ev.mp.changedTouches[0].clientX - startX) < 10 &&
        Math.abs(ev.mp.changedTouches[0].clientY - startY) < 10) {
        this.changeKinds(ev.target.dataset.cate)
      }
    },
    getStencil (noChange) {
      wx.request({
        url: API,
        success: (res) => {
          const category = {}
          const kinds =[]
          const kindsData = []
          res.data.data.forEach(item => {
            if (category[item.category_name || item.category_id]) {
              category[item.category_name || item.category_id].push(item)
            } else {
              category[item.category_name || item.category_id] = [item]
            }
          })
          Object.keys(category).forEach(key => {
            kinds.push(key)
            kindsData.push(category[key])
          })
          this.kinds = kinds
          this.kindsData = kindsData
          if (noChange) return
          if (this.photoContentWidth) {
            this.changeStencilPng(this.kindsData[0][0])
            this.changeKinds(this.kinds[0])
          } else {
            const unWatch = this.$watch('photoContentWidth',() => {
              this.changeStencilPng(this.kindsData[0][0])
              this.changeKinds(this.kinds[0])
              unWatch()
            })
          }
        }
      })
    },
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
        identifiers: '' + ev.touches[0].identifier,
        timeStamp: Date.now()
      }
      tapHelper.setout(startTouch.x, startTouch.y)
      if (ev.touches.length > 1) {
        tapHelper.release()
        this.photoTouchStart(ev)
      }
    },
    touchMoveHandler(ev) {
      const {x, y} = ev.touches[0]
      if (Math.abs(x - startTouch.x) > 10 || Math.abs(y - startTouch.y) > 10) tapHelper.release()
      this.photoTouchMove(ev)
    },
    touchEndHandler (ev) {
      const {x, y} = ev.mp.changedTouches[0]
      if (
        Date.now() - startTouch.timeStamp < 300 &&
        Math.abs(x - startTouch.x) < 10 &&
        Math.abs(y - startTouch.y) < 10
      ) {
        tapHelper.invoke()
      } else {
        tapHelper.release()
      }
      this.photoTouchEnd(ev)
    },
    photoTouchStart (ev) {
      if (this.chartletControl) return
      const {x, y} = ev.touches[1]
      startTouch.distance = Math.sqrt((y - startTouch.y)**2 + (x - startTouch.x)**2)
      let slope = (y - startTouch.y) / (x - startTouch.x)
      if(isNaN(slope)) return
      startTouch.slope = slope
      startTouch.scale = this.scale
      startTouch.rotate = this.rotate
      startTouch.identifiers += ev.touches[1].identifier
    },
    photoTouchMove (ev) {
      if (this.chartletControl) return
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
    chartletTouchMove (ev) {
      if (!this.chartletControl) return
      // chartletController
    },
    photoTouchEnd (ev) {
      if (this.chartletControl) return
      if (ev.touches) {
        const identifiers = ev.touches.reduce((a, b) => {
          return a + b.identifier
        }, '').slice(0, 2)
        if (identifiers !== startTouch.identifiers) {
          this.touchStartHandler(ev)
        }
      }
    },
    initController () {
      let x = 0
      let y = 0
      const iconSize = 22
      chartletController = {
        show: false,
        closeTrigger: new Trigger(0, 0, iconSize, iconSize, tapHelper.triggersSet).clear(),
        scaleTrigger: new Trigger(0, 0, iconSize, iconSize, tapHelper.triggersSet).clear(),
        reversalTrigger: new Trigger(0, 0, iconSize, iconSize, tapHelper.triggersSet).clear(),
        curChartlet: null
      }
      Object.defineProperties(chartletController, {
        x: {
          get () {
            return x
          },
          set (val) {
            x = val
            this.closeTrigger.x = x - iconSize / 2
            this.scaleTrigger.x = x + this.w - iconSize / 2
            this.reversalTrigger.x = x - iconSize / 2
          }
        },
        y: {
          get () {
            return y
          },
          set (val) {
            y  = val
            this.closeTrigger.y = y - iconSize / 2
            this.scaleTrigger.y = y + this.h - iconSize / 2
            this.reversalTrigger.y = y + this.h - iconSize / 2
          }
        },
        w: {
          get () {
            return this.curChartlet.w
          }
        },
        h: {
          get () {
            return this.curChartlet.h
          }
        }
      })
      chartletController.closeTrigger.bindCb(() => {
        console.log('close')
        this.closeChartlet()
      })
      chartletController.reversalTrigger.bindCb(() => {
        this.reversalChartlet()
      })
      this.initControllerIcon()
    },
    initControllerIcon () {
      chartletController.closeTrigger.path =  '/static/ic_delete.png'
      chartletController.scaleTrigger.path = '/static/ic_drag.png'
      chartletController.reversalTrigger.path = '/static/ic_reverse.png'
    },
    addControllerTrigger (){
      chartletController.closeTrigger.addWatch()
      chartletController.scaleTrigger.addWatch()
      chartletController.reversalTrigger.addWatch()
    },
    clearControllerTrigger () {
      chartletController.closeTrigger.clear()
      chartletController.scaleTrigger.clear()
      chartletController.reversalTrigger.clear()
    },
    drawController (ctx) {
      if (!chartletController.show || !chartletController.curChartlet) return
      const {x, y, w, h} = chartletController.curChartlet
      ctx.save()
      ctx.setStrokeStyle('#FFE200')
      ctx.strokeRect(x, y, w, h)
      ctx.drawImage(chartletController.closeTrigger.path, chartletController.closeTrigger.x,
        chartletController.closeTrigger.y,chartletController.closeTrigger.w,chartletController.closeTrigger.h)
      ctx.drawImage(chartletController.scaleTrigger.path, chartletController.scaleTrigger.x,
        chartletController.scaleTrigger.y,chartletController.scaleTrigger.w,chartletController.scaleTrigger.h)
      ctx.drawImage(chartletController.reversalTrigger.path, chartletController.reversalTrigger.x,
        chartletController.reversalTrigger.y,chartletController.reversalTrigger.w,chartletController.reversalTrigger.h)
    },

    closeChartlet () {
      chartletController.show = false
      chartletController.curChartlet.clear()
      const index = chartlets.indexOf(chartletController.curChartlet)
      if (index >= 0) {
        chartlets.splice(index, 1)
      }
      chartletController.curChartlet = null
      this.clearControllerTrigger()
      console.log(chartlets, tapHelper.triggersSet)
      this.chartletControl = false
    },
    scaleChartlet (ev) {

    },
    reversalChartlet () {
      const cur = chartletController.curChartlet
      if (cur.reversalX === 1 && cur.reversalY === 1) {
        cur.reversalX = -1
        cur.reversalY = 1
      } else if (cur.reversalX === -1 && cur.reversalY === 1) {
        cur.reversalX = -1
        cur.reversalY = -1
      } else if (cur.reversalX === -1 && cur.reversalY === -1) {
        cur.reversalX = 1
        cur.reversalY = -1
      } else {
        cur.reversalX = 1
        cur.reversalY = 1
      }
    },
    getRectData (){
      wx.createSelectorQuery().select('.shape-content').boundingClientRect((rect) => {
        this.photoW = this.photoH = this.photoContentWidth = rect.width
        this.drawChartlet()
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
      this.createChartlet(item)
      this.stencilPng = item.full_url
      this.$root.$mp.page.setData({
        icon_id: item.icon_id,
        icon_name: item.icon_name
      })
    },
    changeKinds (val) {
      this.curkinds = val
      this.currentIndex = this.kinds.indexOf(val)
    },
    choosePhoto (name){
      this.copy = {
        show: true,
        photoH: this.photoH,
        photoW: this.photoW,
        transform: this.photoStyle,
        photoPath: this.photoPath
      }
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
              this.photoPath = ''
              this.scale = 1
              this.photoPath = path
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
              this.$nextTick(() => {
                setTimeout(() => {
                  this.copy.show = false
                }, 100)
              })
            }
          })
        }
      })
    },
    createChartlet (info) {
      console.warn('create')
      wx.getImageInfo({
        src: info.full_url,
        success: ({path}) => {
          const x = (this.viewW - this.chartletW) / 2
          const y = (this.viewW - this.chartletH) / 2
          const trigger = new Trigger(x, y, this.chartletW, this.chartletH, tapHelper.triggersSet)
          trigger.reversalX = 1
          trigger.reversalY = 1
          trigger.path = path
          trigger.icon_id = info.icon_id
          trigger.icon_name = info.icon_name
          trigger.bindCb(() => {
            // 点击贴纸
            console.log(trigger.icon_name)
            chartletController.curChartlet = trigger
            chartletController.x = trigger.x
            chartletController.y = trigger.y
            chartletController.show = true
            this.chartletControl = true
            this.addControllerTrigger()
          })
          this.loadedPath = path
          chartlets.push(trigger)
        }
      })
    },
    drawChartlet () {
      const ctx = wx.createCanvasContext('shape-mask')
      chartlets.forEach(item => {
        ctx.save()
        ctx.scale(item.reversalX, item.reversalY)
        ctx.drawImage(item.path, item.reversalX * item.x, item.reversalY * item.y, item.w, item.h)
        ctx.restore()
      })
      this.drawController(ctx)
      ctx.draw(false, () => {
        wx.hideLoading()
      })
      requestAnimationFrame(this.drawChartlet)
    },
    drawMask () {
      wx.getImageInfo({
        src: this.maskPath,
        success: ({path}) => {
          const ctx = wx.createCanvasContext('shape-mask')
          ctx.setFillStyle('#fff')
          const l = (this.viewW - this.photoContentWidth) / 2
          ctx.fillRect(0, 0, this.viewW, this.viewW)
          ctx.clearRect(l, l, this.photoContentWidth, this.photoContentWidth)
          ctx.drawImage(path, l, l, this.photoContentWidth, this.photoContentWidth)
          ctx.draw(false, () => {
            wx.hideLoading()
          })
          this.loadedPath = path
        }
      })
    },
    getSysInfo () {
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
      if (this.viewW < 375) {
        const s = this.viewW / 375
        Object.keys(goal).forEach((key) => {
          if (isNaN(goal[key]) || key === 'QRL') return
          if (key === 'QRY') {
            goal[key] = this.viewW - 43
          } else {
            goal[key] = goal[key] * s | 0
          }
        })
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
      ctx.fillRect(0, 0, this.viewW, this.viewW)
      ctx.rect(goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      ctx.save()
      ctx.clip()
      ctx.setFillStyle('#000')
      ctx.fill()
      ctx.translate(this.translateX * scale, this.translateY * scale)
      ctx.drawImage(this.photoPath, goal.puzzleX - width * (this.scale - 1) / 2, goal.puzzleY - height * (this.scale - 1) / 2, width *  this.scale, height *  this.scale)
      ctx.restore()
      ctx.drawImage(this.loadedPath, goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      ctx.drawImage(goal.QRCode, goal.QRX, goal.QRY, goal.QRL, goal.QRL)
      ctx.setFillStyle('#9C9C9C')
      ctx.setFontSize(10)
      ctx.setTextBaseline('bottom')
      ctx.fillText('小程序keke', goal.QRL + 1, goal.imgH)
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
    this.getStencil()
    this.getSysInfo()
    this.initController()
  },
  onReady() {
    wx.showLoading({
      mask: true
    })
    this.getRectData()

  },
  onShow () {
    this.getStencil(true)
  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/index/main',
      imageUrl: 'https://api.pintuxiangce.com/resources/uploads/images/58932d14069b519c207f030200cd256b.jpg'
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
  scroll-y: hidden;
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
        &.copy{
          z-index: 9;
        }
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
