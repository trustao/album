<template>
  <container title="keke" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="shape-wrap"
           @touchend="touchEndHandler"
           @touchmove="touchMoveHandler">
        <div class="shape-content">
          <img class="shape-img copy" v-if="copy.show" :style="{width: copy.photoW + 'px', height: copy.photoH + 'px', transform: copy.photoStyle}" :src="copy.photoPath" alt="">
          <img class="shape-img" :style="{width: photoW + 'px', height: photoH + 'px', transform: photoStyle}" :src="photoPath" alt="">
          <div class="shape-mask" canvas-id="shape-mask" :disable-scroll="true"
               @touchstart="touchStartHandler" @touchend="nullEnd"></div>
          <div class="tie-wrap">
            <img class="tie" v-for="(item, index) in tieList"
                 :key="index"
                 :style="{
                transform: 'translateX(' + item.x + 'px) translateY(' + item.y + 'px)  rotate(' + item.rotate + 'deg) scale(' + item.scaleX +
                 ',' + item.scaleY + ')',
                width: item.w + 'px',
                height: item.h + 'px',
                'z-index': item.z
               }"
                 :src="item.path2"
                 @click="controlTie(item, $event)"
                 @touchstart="tieTouchStart(item, $event)"
            >
          </div>
        </div>
        <div class="controller-wrap">
          <div class="controller" v-if="tieChanging" :style="{
            width: controller.w + 'px',height: controller.h + 'px',
            transform: 'translateX(' + controller.x + 'px) translateY(' + controller.y + 'px) rotate(' + controller.rotate + 'deg)'
          }" @touchstart="controllerStart">
            <img class="close" src="/static/ic_delete.png" @click="closeHandler"/>
            <img class="reversal" src="/static/ic_reverse.png" @click="reversalHandler"/>
            <img class="scale" src="/static/ic_drag.png" @touchstart.stop="scaleHandler"/>
          </div>
        </div>
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
        <cover-view class="btn" id="choose-img" @click="choosePhoto">选图</cover-view>
        <cover-view class="btn" id="save-img" @click="saveImage">保存</cover-view>
      </cover-view>
    </div>
    <canvas class="to-images" canvas-id="to-images"></canvas>
  </container>
</template>

<script>
/* global getCurrentPages */
const API = 'https://api.pintuxiangce.com/icon/index'

import events from '../../../static/events'
import icon from '@/images/ic_changePic.png'

let startTouch = {}
let startTime = 0
let startX = 0
let startY = 0
let zIndexBase = 10
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
      left: 0,
      top: 0,
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
      tieList: [],
      tieChanging: false,
      tieMoving: false,
      tieScaling: false,
      controller: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        rotate: 0
      }
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
          // if (this.photoContentWidth) {
          //   this.changeStencilPng(this.kindsData[0][0])
          //   this.changeKinds(this.kinds[0])
          // } else {
          //   const unWatch = this.$watch('photoContentWidth',() => {
          //     this.changeStencilPng(this.kindsData[0][0])
          //     this.changeKinds(this.kinds[0])
          //     unWatch()
          //   })
          // }
        }
      })
    },
    swiperChange (ev){
      this.currentIndex = ev.target.current
      this.changeKinds(this.kinds[this.currentIndex])
    },
    touchStartHandler (ev) {
      startTouch = {
        x: ev.mp.touches[0].clientX,
        y: ev.mp.touches[0].clientY,
        translate: {
          x: this.translateX,
          y: this.translateY
        },
        identifiers: '' + ev.mp.touches[0].identifier
      }
      if (ev.touches.length > 1) {
        const {x, y} = {
          x:  ev.mp.touches[1].clientX,
          y:  ev.mp.touches[1].clientY
        }
        startTouch.distance = Math.sqrt((y - startTouch.y)**2 + (x - startTouch.x)**2)
        let slope = (y - startTouch.y) / (x - startTouch.x)
        if(isNaN(slope)) return
        startTouch.slope = slope
        startTouch.scale = this.scale
        startTouch.rotate = this.rotate
        startTouch.identifiers += ev.mp.touches[1].identifier
      }
    },
    touchMoveHandler(ev) {
      const {x, y} = {
        x:  ev.mp.touches[0].clientX,
        y:  ev.mp.touches[0].clientY
      }
      if (this.tieScaling && this.tieChanging) {
        this.tieScaleMove(x, y, ev)
        return
      }
      if (!this.tieMoving) {
        return
        this.translateX = startTouch.translate.x + (x - startTouch.x)
        this.translateY = startTouch.translate.y + (y - startTouch.y)
        if (ev.touches.length > 1) {
          const X2 = ev.mp.touches[1].clientX
          const Y2 = ev.mp.touches[1].clientY
          const distance = Math.sqrt((y - Y2)**2 + (x - X2)**2)
          let slope = (Y2 - y) / (X2 - x)
          if(isNaN(slope)) return
          this.scale = startTouch.scale * (distance / startTouch.distance)
          this.rotate = startTouch.rotate + Math.atan(slope - startTouch.slope) / Math.PI * 180
          console.log(this.rotate)
        }
      } else {
        this.tieMove(x, y, ev)
      }
    },
    touchEndHandler (ev) {
      console.log(ev)
      if (ev.touches) {
        const identifiers = ev.mp.touches.reduce((a, b) => {
          return a + b.identifier
        }, '').slice(0, 2)
        if (identifiers !== startTouch.identifiers) {
          this.touchStartHandler(ev)
        }
      }
      this.tieMoving = false
      this.tieScaling = false
    },
    nullEnd(){
      this.tieChanging = false
    },
    tieScaleMove (x, y, ev) {
      const curTie = this.controller.current
      const r = (Math.atan2(y - startTouch.tieStatus.oriY, x - startTouch.tieStatus.oriX) - Math.atan2(startTouch.y - startTouch.tieStatus.oriY, startTouch.x - startTouch.tieStatus.oriX)) / Math.PI * 180
      const c = Math.sqrt(2) / 2 * (Math.sqrt((x - startTouch.tieStatus.oriX)**2 + (y - startTouch.tieStatus.oriY)**2) - Math.sqrt((startTouch.x - startTouch.tieStatus.oriX)**2 + (startTouch.y - startTouch.tieStatus.oriY)**2))
      if (-c * 2 > startTouch.tieStatus.w) return
      this.controller.w =  40 + (curTie.w = startTouch.tieStatus.w + c * 2)
      this.controller.h = 40 + (curTie.h = startTouch.tieStatus.h + c * 2)
      this.controller.x = (curTie.x = startTouch.tieStatus.x - c) - 20
      this.controller.y = (curTie.y = startTouch.tieStatus.y - c) - 20
      this.controller.rotate =  startTouch.tieStatus.rotate + r
      curTie.rotate  = startTouch.tieStatus.rotate + r// * curTie.scaleX * curTie.scaleY
    },
    tieMove (x, y, ev) {
      const change = {
        x: startTouch.controller.x +  x - startTouch.x,
        y: startTouch.controller.y +  y - startTouch.y,
      }
      Object.assign(this.controller.current, change)
      change.x -= 20
      change.y -= 20
      Object.assign(this.controller, change)
    },
    controllerStart(ev) {
      this.tieTouchStart(this.controller.current, ev)
    },
    tieTouchStart (item, ev) {
      console.log('tie start', item, ev)
      const x = item.x - 20
      const y = item.y - 20
      const w = item.w + 40
      const h = item.h + 40
      const rotate = item.rotate
      if (this.tieChanging && item !== this.controller.current) {
        Object.assign(this.controller, { x, y, w, h, rotate })
      }
      this.tieMoving = true
      this.controller.current = item
      startTouch.controller = { x, y, w, h, rotate }
      startTouch.x = ev.mp.touches[0].clientX
      startTouch.y = ev.mp.touches[0].clientY
      if (item.z !== zIndexBase) item.z = ++zIndexBase
    },
    controlTie (item, ev) {
      console.log(item, ev)
      this.controller.w = item.w + 40
      this.controller.h = item.h + 40
      this.controller.x = item.x - 20
      this.controller.y = item.y - 20
      this.controller.rotate = item.rotate
      this.controller.current = item
      this.tieChanging = true
    },
    closeHandler() {
      const index = this.tieList.indexOf(this.controller.current)
      if (index >= 0) {
        this.tieList.splice(index, 1)
        this.tieChanging = false
      }
    },
    scaleHandler(ev) {
      console.log('scale',ev)
      this.tieScaling = true
      startTouch.x = ev.mp.touches[0].clientX
      startTouch.y = ev.mp.touches[0].clientY
      const {x, y, w, h, rotate} = this.controller.current
      const oriX = x + w / 2 + this.left
      const oriY = y + h / 2 + this.top
      startTouch.tieStatus = {x, y, w, h, rotate, oriX, oriY}
    },
    reversalHandler() {
      const {scaleX, scaleY} = this.controller.current
      if (scaleX === 1 && scaleY === 1) {
        this.controller.current.scaleX = -1
        this.controller.current.scaleY = 1
      } else if (scaleX === -1 && scaleY === 1) {
        this.controller.current.scaleX = -1
        this.controller.current.scaleY = -1
      } else if (scaleX === -1 && scaleY === -1) {
        this.controller.current.scaleX = 1
        this.controller.current.scaleY = -1
      } else{
        this.controller.current.scaleX = 1
        this.controller.current.scaleY = 1
      }
    },
    getRectData (){
      wx.createSelectorQuery().select('.shape-content').boundingClientRect((rect) => {
        this.photoW = this.photoH = this.photoContentWidth = rect.width
        this.left = rect.left
        this.top = rect.top
      }).exec()
    },
    changeStencilPng (item) {
      this.createTie(item)
      //
      this.stencilPng = item.full_url
      this.$root.$mp.page.setData({
        icon_id: item.icon_id,
        icon_name: item.icon_name
      })
    },
    getImgLocalPath (item) {
      console.log(item)
      wx.getImageInfo({
        src: item.path2,
        success (info) {
          item.drawPath = info.path
        }
      })
    },
    createTie (item) {
      const originW = 60
      const originH = 60
      zIndexBase++
      const tie = {
        x: (this.photoContentWidth - originW) / 2,
        y: (this.photoContentWidth - originH) / 2,
        w: originW,
        h: originH,
        z: zIndexBase,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        path: item.full_url,
        path2: item.full_icon_url,
        name: item.icon_name,
        id: item.icon_id
      }
      this.getImgLocalPath(tie)
      this.tieList.push(tie)
      this.tieChanging = false
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
    drawTie (ctx) {
      const list = this.tieList.slice().sort((a, b) => a.z - b.z)
      const baseScale = 375 / this.photoContentWidth
      console.log(list)
      list.forEach(item => {
        ctx.save()
        ctx.translate(amend(item.x) + amend(item.w) / 2, amend(item.y) + amend(item.h) / 2)
        ctx.rotate(item.rotate * Math.PI / 180)
        ctx.scale(item.scaleX, item.scaleY)
        ctx.drawImage(item.drawPath, amend(-item.w) / 2, amend(-item.h) / 2, amend(item.w), amend(item.h))
        ctx.restore()
      })

      function amend (val) {
        return val * baseScale
      }
    },
    saveImage () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      this.tieChanging = false
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
        puzzleX: 0,
        puzzleY: 0,
        puzzleW: 375,
        puzzleH: 375,
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
      ctx.setFillStyle('#000')
      ctx.fillRect(0, 0, this.viewW, this.viewW)
      ctx.save()
      // ctx.rect(goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      // ctx.save()
      // ctx.clip()
      // ctx.setFillStyle('#000')
      ctx.fill()
      ctx.translate(this.translateX * scale, this.translateY * scale)
      ctx.drawImage(this.photoPath, goal.puzzleX - width * (this.scale - 1) / 2, goal.puzzleY - height * (this.scale - 1) / 2, width *  this.scale, height *  this.scale)
      ctx.restore()

      // ctx.drawImage(this.loadedPath, goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
      this.drawTie(ctx)

      ctx.drawImage(goal.QRCode, goal.QRX, goal.QRY, goal.QRL, goal.QRL)
      // ctx.setFillStyle('#9C9C9C')
      // ctx.setFontSize(10)
      // ctx.setTextBaseline('bottom')
      // ctx.fillText('小程序keke', goal.QRL + 1, goal.imgH)
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'to-images',
          x: 0,
          y: 0,
          width: goal.imgW,
          height: goal.imgH,
          success: function (res) {
            clearTimeout(timer)
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success () {
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
  },
  onReady() {
    // wx.showLoading({
    //   mask: true
    // })
    this.getRectData()
    events.$on('clearList', () => {
      this.tieList.splice(0, this.tieList.length)
    })
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
    /*padding: 40rpx;*/
    width: 100vw;
    height: 100vw;
    background: #fff;
    overflow: hidden;
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
    .tie-wrap{
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      .tie{
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: center center;
      }
    }
    .controller {
      position: absolute;
      box-sizing: border-box;
      top: 0;
      left: 0;
      border: 1px solid #FFE000;
      z-index: 9999;
      &>img{
        position: absolute;
        width: 44rpx;
        height: 44rpx;
        padding: 16rpx;
      }
      .close {
        left: -36rpx;
        top: -36rpx;
      }
      .scale {
        right: -36rpx;
        bottom: -36rpx;
      }
      .reversal {
        left: -36rpx;
        bottom: -36rpx;
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
    justify-content: center;
    height: 80rpx;
    .btn{
      position: relative;
      box-sizing: border-box;
      width: 200rpx;
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
        margin-right: 60rpx;
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
