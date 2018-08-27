<template>
  <container title="选择shape">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <canvas class="cvs" canvas-id="puzzle" :style="{width: cvsW + 'px', height: cvsH + 'px'}"></canvas>
      <canvas class="to-images" canvas-id="to-images"></canvas>
      <div class="cvs-background" :style="{background: '#fff'}">
        <img class="cvs-bg-img"
          v-if="colorIndex < 0 && bgImgPath"
          :class="{blur: !!drawImgBg}"
          :src="bgImgPath" mode="aspectFill" />
      </div>
      <div scroll-y class="cvs-operation" :style="{height: operationH + 'px'}" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-x class="kinds">
          <ul class="kinds-wrap">
            <li class="kinds-item" :class="{active: kinds === 'svg'}" @click="changeKinds('svg')">svg</li>
            <li class="kinds-item" :class="{active: kinds === 'png'}" @click="changeKinds('png')">png</li>
          </ul>
        </scroll-view>
        <scroll-view scroll-y class="stencils">
          <ul v-if="kinds === 'svg'" class="stencil-list" id="stencil">
            <li class="stencil-item" v-for="item in svgJson.name" :key="item" @click="changeStencil(item)" :class="{active: stencil === item}">
              <img class="stencil-img" :id="item" :src="base64Svg[item]" alt="">
            </li>
            <li class="stencil-item" v-for="item in fill" :key="item"></li>
          </ul>
          <ul class="stencil-list" v-else>
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

import svg11 from "@/images/stencil/1-1.svg"
import svg110 from "@/images/stencil/1-10.svg"
import svg112 from "@/images/stencil/1-12.svg"
import svg114 from "@/images/stencil/1-14.svg"
import svg113 from "@/images/stencil/1-13.svg"
import svg117 from "@/images/stencil/1-17.svg"
import svg115 from "@/images/stencil/1-15.svg"
import svg12 from "@/images/stencil/1-2.svg"
import svg13 from "@/images/stencil/1-3.svg"
import svg116 from "@/images/stencil/1-16.svg"
import svg14 from "@/images/stencil/1-4.svg"
import svg15 from "@/images/stencil/1-5.svg"
import svg111 from "@/images/stencil/1-11.svg"
import svg16 from "@/images/stencil/1-6.svg"
import svg19 from "@/images/stencil/1-9.svg"
import svg17 from "@/images/stencil/1-7.svg"
import svg21 from "@/images/stencil/2-1.svg"
import svg210 from "@/images/stencil/2-10.svg"
import svg22 from "@/images/stencil/2-2.svg"
import svg24 from "@/images/stencil/2-4.svg"
import svg23 from "@/images/stencil/2-3.svg"
import svg25 from "@/images/stencil/2-5.svg"
import svg26 from "@/images/stencil/2-6.svg"
import svg27 from "@/images/stencil/2-7.svg"
import svg28 from "@/images/stencil/2-8.svg"
import svg31 from "@/images/stencil/3-1.svg"
import svg29 from "@/images/stencil/2-9.svg"
import svg18 from "@/images/stencil/1-8.svg"
import svg311 from "@/images/stencil/3-11.svg"
import svg310 from "@/images/stencil/3-10.svg"
import svg313 from "@/images/stencil/3-13.svg"
import svg314 from "@/images/stencil/3-14.svg"
import svg312 from "@/images/stencil/3-12.svg"
import svg32 from "@/images/stencil/3-2.svg"
import svg34 from "@/images/stencil/3-4.svg"
import svg35 from "@/images/stencil/3-5.svg"
import svg36 from "@/images/stencil/3-6.svg"
import svg37 from "@/images/stencil/3-7.svg"
import svg38 from "@/images/stencil/3-8.svg"
import svg39 from "@/images/stencil/3-9.svg"
import svg410 from "@/images/stencil/4-10.svg"
import svg412 from "@/images/stencil/4-12.svg"
import svg411 from "@/images/stencil/4-11.svg"
import svg413 from "@/images/stencil/4-13.svg"
import svg42 from "@/images/stencil/4-2.svg"
import svg414 from "@/images/stencil/4-14.svg"
import svg415 from "@/images/stencil/4-15.svg"
import svg41 from "@/images/stencil/4-1.svg"
import svg44 from "@/images/stencil/4-4.svg"
import svg46 from "@/images/stencil/4-6.svg"
import svg47 from "@/images/stencil/4-7.svg"
import svg43 from "@/images/stencil/4-3.svg"
import svg45 from "@/images/stencil/4-5.svg"
import svg49 from "@/images/stencil/4-9.svg"
import svg48 from "@/images/stencil/4-8.svg"
import svg33 from "@/images/stencil/3-3.svg"
import svg from '@/images/stencil/svg.json'

import shape1 from '@/images/stencilPng/shape1-small.png'
import shape2 from '@/images/stencilPng/shape2-small.png'

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
    return {
      base64Svg: {
        "1-1": svg11,"1-10": svg110,"1-12": svg112,"1-14": svg114,"1-13": svg113,"1-17": svg117,"1-15": svg115,"1-2": svg12,"1-3": svg13,"1-16": svg116,"1-4": svg14,"1-5": svg15,"1-11": svg111,"1-6": svg16,"1-9": svg19,"1-7": svg17,"2-1": svg21,"2-10": svg210,"2-2": svg22,"2-4": svg24,"2-3": svg23,"2-5": svg25,"2-6": svg26,"2-7": svg27,"2-8": svg28,"3-1": svg31,"2-9": svg29,"1-8": svg18,"3-11": svg311,"3-10": svg310,"3-13": svg313,"3-14": svg314,"3-12": svg312,"3-2": svg32,"3-4": svg34,"3-5": svg35,"3-6": svg36,"3-7": svg37,"3-8": svg38,"3-9": svg39,"4-10": svg410,"4-12": svg412,"4-11": svg411,"4-13": svg413,"4-2": svg42,"4-14": svg414,"4-15": svg415,"4-1": svg41,"4-4": svg44,"4-6": svg46,"4-7": svg47,"4-3": svg43,"4-5": svg45,"4-9": svg49,"4-8": svg48,"3-3": svg33
      },
      pngs: {
        shape1, shape2
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
      operationH: 0,
      stencil: '',
      calcCount: 0,
      images: [],
      photoPath: '/static/photo.jpg',
      lineColor: '#fff',
      changeLine: false,
      changeRadius: false,
      ios: false,
      pixelRatio: 1,
      range: null,
      userHide: false,
      cvsW: 0,
      cvsH: 0,
      kinds: 'svg'
    }
  },
  computed: {
    fill () {
      return 6 - this.stencilList.length % 6
    },
    stencilList () {
      // if (kinds === 'svg') {
        return this.svgJson.name
      // } else {
      //   return
      // }
    }
  },
  methods: {
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
    changeStencilPng (item) {
      this.ctx.drawImage(this.photoPath, 0, 0, this.cvsW, this.cvsH)
      this.ctx.drawImage(`/static/${item}.png`,0, 0, this.cvsW, this.cvsH)
      this.ctx.draw()
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
          this.photoPath = res.tempFilePaths[0]
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
        var rpx = this.viewW / 750
        this.cvsW = this.viewW - 60 * rpx// this.viewW - 60 * rpx
        this.cvsH =  this.cvsW// this.viewH - (this.iphoneX ? 440 * rpx : 372 * rpx) - (this.iphoneX ? 176 * rpx: 128 * rpx) - 60 * rpx
        let headerHeight = 0
        if (res.model.indexOf('iPhone X') >= 0){
          headerHeight = headerH.iphoneX
        } else if (res.model.indexOf('iPhone 5') >= 0) {
          headerHeight = headerH.iphone5
        } else if (res.model.indexOf('Plus') >= 0) {
          headerHeight = headerH.plus
        } else {
          headerHeight = headerH.default
        }
        this.operationH = this.viewH - headerHeight * rpx - this.cvsH - 60 * rpx
        console.log('-0-height', this.operationH)
      } catch (e) {
        // Do something when catch error
      }
    },
    cvsInit () {
      this.stencil = '1-1'
      this.images = []
      this.ctx = wx.createCanvasContext('puzzle')
      this.ctx.setLineJoin('round')
      this.ctx.setLineCap('round')
      this.ctx.setFillStyle('#fff')
      const pages = getCurrentPages()
      pages[pages.length - 1].setData({
        stencil: this.stencil
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
      var scale = 1
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
      if (!photoCount) {
        wx.hideLoading()
        return
      }
      this.sortBlocks(createGrid(range, range.end.x - range.start.x, range.end.x - range.start.x, 0))
    },
    sortBlocks (data) {
      imageBlock = data.sort((a, b) => b.weight - a.weight)
      this.calcCount = 0
      this.drawImages(() => {
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
      for (let index = 0; index < imageBlock.length; index++) {
        const item = imageBlock[index]
        this.ctx.save()
        radiusPath(this.ctx,
         item.x, item.y,
         item.w,
         item.h,
         0)
        this.ctx.fill()
        this.ctx.globalCompositeOperation = 'source-atop'
        this.ctx.drawImage(this.photoPath, item.x, item.y, item.w, item.h)
        this.ctx.restore()
      }
      this.ctx.draw(false, () => {
        cb && cb()
      })
      wx.hideLoading()
    },
    saveImage () {
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
    this.init()
    events.$off('cvsDataClear')
    events.$on('cvsDataClear', () => {

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
    top: 15px;
    transform: translateX(-50%);
    z-index: 9;
  }
  &.iphoneX{
    .cvs{
      // top: 206rpx;
    }
    .btns{
      bottom: 60rpx;
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
    position: absolute;
    box-sizing: border-box;
    left: 0;
    bottom: 0;
    height: 456rpx;
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
</style>
