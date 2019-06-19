<template>
  <div style="width: 100%;height: 100%; box-sizing: border-box;background: #010101;" :style="{'padding-top': isIphoneX && '44px'}" title="" background="#010101" @touchmove="touchMoveHandler" @touchend="touchEndHandler">
    <div class="camera-wrap">
      <camera v-if="cameraShow" class="camera" :style="{width: photoW + 'px', height: photoW + 'px'}" :device-position="devicePosition" :flash="flash" @error="errorHandler"></camera>
      <!--<cover-image mode="aspectFit" @load="imageLoad" v-if="maskShow" class="mask-img" :style="{opacity: opacity,width: photoW + 'px', height: photoW + 'px'}" :src="imgPath"></cover-image>-->
      <canvas v-if="maskShow && needPoint" class="point-cvs"  :style="{width: photoW + 'px', height: photoW + 'px'}" canvas-id="point-cvs"></canvas>
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
<!--          <div class="take-photo" :class="{waiting: waiting}" @tap="takePhoto">{{waitingNum}}</div>-->
<!--          <img :src="cameraImg" class="change-device" @tap="changeDevice" />-->
        </div>
      </div>
      <cover-view class="photo-tip" v-if="startPhoto" :style="{top: photoW + 'px', 'font-size': fontSize + 'px'}">
        {{waitingNum}}
      </cover-view>
      <cover-image v-if="maskShow && devicePosition !== 'front'" :src="flashImg" class="flash-btn" @tap="flashHandler"></cover-image>
      <cover-view class="cover-tip" v-if="needTip">
        <cover-image class="cover-img" src="https://api.pintuxiangce.com/resources/uploads/icons/c7311bf0960ce3c16bb3d0645c074fb6.png"></cover-image>
        <cover-view class="tip-msg">
          <cover-view class="text">王者标准</cover-view>
          <cover-view class="text">1.头部位置角度一样</cover-view>
          <cover-view class="text">2.五官动作大小一样</cover-view>
        </cover-view>
        <cover-view class="cover-btn" @click="closeTip">我知道了</cover-view>
      </cover-view>
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
let once = true
let init = true
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
      needTip: false,
      isIphoneX: model.indexOf('iPhone X') >= 0,
      cameraShow: false,
      waitingNum: '准备',
      fontSize: 20,
      startPhoto: false,
      needPoint: true,
      waiting: false
    }
  },
  computed: {
    opacityWidth () {
      return this.opacity * 100 + '%'
    }
  },
  methods: {
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
    takePhoto () {
      console.log('开始拍照')
      if (this.waiting) return
      this.waiting = true
      setTimeout(() => {
        this.waitingNum = 5
        this.fontSize = 36
        this.needPoint = false
      }, 50)
      setTimeout(() => {
        this.waitingNum = 4
      }, 1050)
      setTimeout(() => {
        this.waitingNum = 3
      }, 2050)
      setTimeout(() => {
        this.waitingNum = 2
      }, 3050)
      setTimeout(() => {
        this.waitingNum = 1
      }, 4050)
      setTimeout(() => {
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
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath
            })
            const url = '../middle/main'
            wx.redirectTo({ url })
          },
          fail: () => {
            console.log('fail')
          }
        })
      }, 5050)
    },
    imageLoad () {
      this.drawPoint()
    },
    closeTip () {
      this.needTip = false
      setTimeout(() => {
        this.takePhoto()
      }, 2500)
      once = false
    },
    uploadImg (path) {
      return new Promise(((resolve, reject) => {
        wx.getImageInfo({
          src: path,
          success: (info) => {
            wx.uploadFile({
              url: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
              filePath: info.path,
              name: 'image_file',
              formData: {
                api_key: 'Tti9NApKiVOqTmzlVKdISOIjLnfjCSpA',
                api_secret: 'sN2B9-iVyrtyKeQ_HSn6j3JYVdm1LSg2',
                return_landmark: 1,
                calculate_all: 1,
                return_attributes: 'gender,age,smiling,headpose,facequality,blur,eyestatus,emotion,ethnicity,beauty,mouthstatus,eyegaze,skinstatus'
              },
              success(res) {
                resolve(JSON.parse(res.data))
              },
              fail (e) {
                reject(e)
                console.log(e)
              }
            })
            this.imgW = info.width
          }
        })
      }))
    },
    drawPoint () {
      console.log('获取点信息')
      this.uploadImg(this.imgPath).then((data) => {
        console.log('获得信息')
        const faceData = data.faces[0].landmark
        const ctx = wx.createCanvasContext('point-cvs')
        const scale = this.imgW / this.photoW
        ctx.beginPath()
        Object.keys(faceData).forEach(key => {
          if (/^left_eyebrow_|^right_eyebrow_|^left_eye_|^right_eye_|^mouth_/.test(key) &&
            !['mouth_upper_lip_left_contour3',
              'mouth_upper_lip_right_contour3','mouth_upper_lip_bottom','mouth_lower_lip_top','mouth_lower_lip_left_contour1',
              'mouth_lower_lip_right_contour1','left_eye_center','left_eye_pupil','right_eye_center','right_eye_pupil'].includes(key)
          ) {

            ctx.moveTo(faceData[key].x / scale, faceData[key].y / scale)
            ctx.arc(faceData[key].x / scale, faceData[key].y / scale, 2, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.setFillStyle('#e02020')
            ctx.fill()
          }
        })
        ctx.draw()
        if (once) {
          setTimeout(() => {
            this.startPhoto = true
            wx.hideLoading()
            this.needTip = true
          }, 500)
        } else {
          wx.hideLoading()
          this.startPhoto = true
          setTimeout(() => {
            this.takePhoto()
          }, 2500)
        }
      }).catch(err => {
        console.error(err)
      })
    },
    init () {
      console.log('init')
      wx.showLoading({
        title: '请稍等',
        mask: true
      })
      this.waiting = false
      this.needPoint = true
      this.fontSize = 20
      this.waitingNum = '准备'
      const path = events.$emit('getMaskPath')
      console.log(path)
      this.imgPath = path
      this.cameraShow = true
      setTimeout(() => {
        // this.getRectData()
        this.maskShow = true
      }, 500)
    }
  },
  onLoad () {
    this.imgPath = ''
  },
  onReady () {
    this.init()
  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/first/main',
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/c738d5e40bfa99731decacbaf8ef6298.jpg'
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
    .point-cvs {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
    .photo-tip {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120rpx;
      height: 120rpx;
      background: rgba(0,0,0,0.75);
      border: 1px solid #FFFFFF;
      border-radius: 50%;
      color: #fff;
      font-weight: bold;
      line-height: 120rpx;
      text-align: center;
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
      justify-content: flex-start;
      align-items: center;
      box-sizing: border-box;
      padding: 30rpx;
      background: transparent;
      height: 190rpx;
      width: 100%;
      color: #FFF;
      .back{
        width: 80rpx;
      }
      .take-photo{
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
        width: 80rpx;
        height: 80rpx;
        /*background: #fff;*/
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
  .cover-tip{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 660rpx;
    height: 900rpx;
    background: #FFE200;
    border-radius: 32rpx;
    .cover-img{
      width: 600rpx;
      height: 400rpx;
      margin: 46rpx auto 30rpx;
    }
    .tip-msg{
      width: 100%;
      margin-bottom: 70rpx;
      .text{
        width: 100%;
        text-align: center;
        font-size: 44rpx;
        color: #000;
      }
    }
    .cover-btn{
      margin: 0 auto;
      width: 400rpx;
      height: 96rpx;
      line-height: 96rpx;
      background: #fff;
      border-radius: 48rpx;
      font-size: 34rpx;
      color: #000;
      font-weight: bold;
      text-align: center;
    }
  }
</style>
