<template>
  <div style="width: 100%;height: 100%; box-sizing: border-box;background: #010101;" :style="{'padding-top': isIphoneX && '44px'}" title="" background="#010101" @touchmove="touchMoveHandler" @touchend="touchEndHandler">
    <div class="camera-wrap">
      <camera v-if="cameraShow" class="camera" :style="{width: photoW + 'px', height: photoW + 'px'}" :device-position="devicePosition" :flash="flash" @error="errorHandler"></camera>
      <!--<cover-image mode="aspectFit" @load="imageLoad" v-if="maskShow" class="mask-img" :style="{opacity: opacity,width: photoW + 'px', height: photoW + 'px'}" :src="imgPath"></cover-image>-->
      <div class="i-wrap" v-if="cameraShow" :style="{height: windowHeight - photoW - (isIphoneX ? 44 : 0) + 'px'}">
        <!--<div class="opacity-controller-wrap">-->
          <!--<div class="opacity-controller">-->
            <!--<div class="inner-bar" :style="{width: opacityWidth}">-->
              <!--<div class="controller" @touchstart="opacityTouchStart"></div>-->
            <!--</div>-->
          <!--</div>-->
        <!--</div>-->
        <div class="example-img"  :style="{width: photoW + 'px', height: photoW + 'px'}">
          <img mode="aspectFit" @load="imageLoad" :src="imgPath" />
        </div>
        <div class="btns">
          <div class="back" @tap="back">取消</div>
          <div class="take-photo" :class="{waiting: waiting}" @tap="takePhoto">{{waitingNum}}</div>
          <img :src="cameraImg" class="change-device" @tap="changeDevice" />
          <movable-area class="move-wrap">
            <movable-view :x="x" direction="horizontal" class="move-content" @change="moveHandler" @touchend="moveEnd">
              <div class="move-item"
                   v-for="(item, index) in delayArr" :class="activeIndex === index ? 'active' : ''"
                   @click="moveTo(index)"
                   :key="index">{{item}}s</div>
            </movable-view>
          </movable-area>
        </div>
      </div>
      <cover-image v-if="maskShow && devicePosition !== 'front'" :src="flashImg" class="flash-btn" @tap="flashHandler"></cover-image>
    </div>
  </div>
</template>

<script>
/* global getCurrentPages */
import events from '../../../static/events'
// import flashOff from '../../images/ios-flash-off.png'
// import flashOn from '../../images/ios-flash.png'
import cameraImg from '../../images/photo2.png'
const flashOff = 'https://api.pintuxiangce.com/resources/uploads/icons/b41b78281d041752282706c340899726.png'
const flashOn = 'https://api.pintuxiangce.com/resources/uploads/images/d3cf28fafbbb073e94a78751771a4210.png'
let startData = {}
let moveDis = 0
export default {

  data () {
    const {windowWidth, windowHeight, model} = wx.getSystemInfoSync()
    let photoW = 0
    if (windowHeight > windowWidth * 2) {
      photoW = windowWidth
    } else {
      photoW = windowHeight / 2
    }
    return {
      devicePosition: 'front', // back
      flash: 'off', // off on
      opacity: .2,
      opacityActive: false,
      controllerW: 0,
      maskShow: false,
      imgPath: '',
      flashImg: flashOff,
      cameraImg,
      windowWidth,
      windowHeight,
      photoW,
      isIphoneX: model.indexOf('iPhone X') >= 0,
      cameraShow: false,
      waitingNum: '',
      waiting: false,
      x: 90,
      activeIndex: 1,
      moveOuterW: 0,
      moveInnerW: 0,
      delayArr: [0, 3, 10, 30]
    }
  },
  computed: {
    opacityWidth () {
      return this.opacity * 100 + '%'
    },
    disArr () {
      const arr = []
      for (let i = 0; i < 4; i++) {
        arr.push(this.moveOuterW /2 - this.moveInnerW / 4 * i - this.moveInnerW / 8)
      }
      return arr
    }
  },
  methods: {
    moveEnd (ev) {
      console.log('moveEnd')
      let dis = 1000, res = 0, index = 0
      this.disArr.forEach((v, i) => {
        const d = Math.abs(v - moveDis)
        if (d < dis) {
          dis = d
          res = v
          index = i
        }
      })
      console.log(res, index)
      this.x = this.x === res ? res + 0.001 : res
      this.activeIndex = index
    },
    moveTo (index) {
      this.x = this.disArr[index]
      this.activeIndex = index
    },
    moveHandler (ev) {
      moveDis = ev.mp.detail.x
    },
    getMoveW () {
      wx.createSelectorQuery().select('.move-wrap').boundingClientRect((rect) => {
        this.moveOuterW = rect.width
      }).exec()
      wx.createSelectorQuery().select('.move-content').boundingClientRect((rect) => {
        this.moveInnerW = rect.width
        this.x = this.moveOuterW /2 - this.moveInnerW / 4 * this.activeIndex - this.moveInnerW / 8
      }).exec()
    },
    errorHandler () {
      wx.showModal({
        content: '相机开启失败', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
        success: (res) => {
          if (res.confirm) {

          }
        }
      })
    },
    flashHandler () {
      if (this.devicePosition === 'front') return
      if (this.flash !== 'on') {
        this.flashImg = flashOn
        this.flash = 'on'
      } else {
        this.flashImg = flashOff
        this.flash = 'off'
      }
      console.log(this.flash)
    },
    changeDevice () {
      if (this.devicePosition === 'front') {
        this.devicePosition = 'back'
      } else {
        this.devicePosition = 'front'
        this.flashImg = flashOff
        this.flash = 'off'
      }
    },
    opacityTouchStart (ev) {
      this.opacityActive = true
      const {x, y} = {
        x:  ev.mp.touches[0].clientX,
        y:  ev.mp.touches[0].clientY
      }
      startData = {x, y, opacity: this.opacity}
    },
    touchMoveHandler (ev) {
      if (!this.opacityActive) {
        return
      }
      const {x, y} = {
        x:  ev.mp.touches[0].clientX,
        y:  ev.mp.touches[0].clientY
      }
      let opacity = startData.opacity + (x - startData.x) / this.controllerW
      if (opacity > 1) {
        opacity = 1
      } else if (opacity < 0) {
        opacity = 0
      }
      this.opacity = opacity
    },
    touchEndHandler () {
      this.opacityActive = false
    },
    getRectData (){
      wx.createSelectorQuery().select('.opacity-controller').boundingClientRect((rect) => {
        this.controllerW = rect.width
      }).exec()
    },
    back () {
      wx.navigateBack()
    },
    delay (time, callback) {
      let i = 0
      if (time > 0) {
        f.call(this)
      } else {
        callback()
      }
      function f() {
        this.waitingNum = time - i
        setTimeout(() => {
          i++
          if (i < time) {
            f.call(this)
          } else {
            callback()
          }
        }, 1000)
      }
    },
    takePhoto () {
      if (this.waiting) return
      this.waiting = true
      this.delay(this.delayArr[this.activeIndex], () => {
        this.waitingNum = ''
        const ctx = wx.createCameraContext()
        ctx.takePhoto({
          quality: 'high',
          success: (res) => {
            this.waiting = false
            events.$off('getPhoto')
            events.$on('getPhoto', () => {
              return res.tempImagePath
            })
            const url = '../middle/main'
            wx.navigateTo({ url })
          },
          fail: () => {
            this.waiting = false
          }
        })
      })
    },
    imageLoad () {
      wx.hideLoading()
    }
  },
  onShow () {
    this.waiting = false
  },
  onLoad () {
    this.imgPath = ''
  },
  onReady () {
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    const path = events.$emit('getMaskPath')
    // const path = 'https://api.pintuxiangce.com/resources/uploads/icons/99a90b3b06bf91d61fc6bf4520ac786e.jpg'
    console.log(path)
    this.imgPath = path
    this.cameraShow = true
    setTimeout(() => {
      // this.getRectData()
      this.maskShow = true
      this.getMoveW()
    }, 500)
  },
  onShow () {
    // this.getStencil(true)
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  onHide () {
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
  },
  onShareAppMessage() {
    return {
      title: 'keke模仿秀',
      path: '/pages/first/main',
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/2f40b8f4c719666222a418c06c836489.jpg'
    }
  }
}
</script>

<style lang="less" scoped>
  @l:calc(100vw - 80rpx);
  .camera-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    background: #010101;
    overflow: hidden;
    .camera{
      margin: auto;
    }
    .opacity-controller-wrap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80rpx;
      /*background: rgba(0,0,0,.37);*/
      z-index: 99;
      .opacity-controller{
        position: absolute;
        left: 50%;
        top: 10rpx;
        transform: translateX(-50%);
        z-index: 999;
        width: 560rpx;
        height: 20rpx;
        margin: 20rpx auto;
        background: #F0F0F0;
        border-radius: 10rpx;
        .inner-bar{
          position: relative;
          height: 100%;
          border-radius: 10rpx;
          background: #FFE200;
          .controller {
            position: absolute;
            z-index: 999;
            right: -10rpx;
            top: -10rpx;
            width: 40rpx;
            height: 40rpx;
            border-radius: 50%;
            background: #FFE200;
            .active{
              background: rgba(255,226,0, .6);
              box-shadow: 0 0 10rpx 0 #FFE200;
            }
          }
        }
      }
    }
    .i-wrap{
      box-sizing: border-box;
      position: relative;
      width: 100%;
    }
    .mask-img{
      position: absolute;
      left: 50%;
      top: 0;
      width: @l;
      height: @l;
      transform: translateX(-50%);
    }
    .example-img{
      position: absolute;
      left: 50%;
      top: 0;
      width: @l;
      height: @l;
      transform: translateX(-50%);
      img{
        width: 100%;
        height: 100%;
        margin: auto;
      }
    }
    .btns {
      position: absolute;
      left: 0;
      bottom: 0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
      box-sizing: border-box;
      padding: 30rpx 30rpx 68rpx;
      background: rgba(0,0,0, .25);
      height: 190rpx;
      width: 100%;
      color: #FFF;
      .back{
        width: 80rpx;
        font-size: 34rpx;
      }
      .take-photo{
        position: absolute;
        top: 30rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 80rpx;
        height: 80rpx;
        border: 2px solid #333;
        box-shadow: 0 0 0 5px #fff;
        border-radius: 50%;
        background: #fff;
        &.waiting {
          border: none;
          box-shadow: none;
          background: transparent;
          line-height: 80rpx;
          text-align: center;
          font-size: 80rpx;
          color: #fff;
        }
      }
      .change-device{
        width: 68rpx;
        height: 68rpx;
        /*background: #fff;*/
      }
      .move-wrap {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 600rpx;
        height: 56rpx;
        .move-content {
          display: flex;
          flex-direction: row;
          width: 320rpx;
          height: 56rpx;
          .move-item {
            width: 80rpx;
            text-align: center;
            color: #fff;
            font-size: 30rpx;
            &.active {
              position: relative;
              color: #FFE200;
              &:after {
                content: '';
                position: absolute;
                bottom: 6rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 36rpx;
                height: 4rpx;
                background: #FFE200;
              }
            }
          }
        }
      }
    }
  }
  .flash-btn{
    position: fixed;
    width: 60rpx;
    height: 60rpx;
    top: 40rpx;
    left: 30rpx;
    color: #fff;
    z-index: 9999;
    &.dis{
      filter: brightness(.3);
    }
  }
</style>
