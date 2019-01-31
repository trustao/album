<template>
  <container :title="title" :background="headBg" :needUser="!loading">
    <div class="wrap loading" v-if="loading">
      <img :src="AI" alt="">
      <p>AI考官 正在打分...</p>
    </div>
    <div class="wrap" v-else>
      <div class="star">
        <img :src="item >= (5 - nullStarCount) ? STARNULL : STAR" v-for="item in 5" :key="item">
      </div>
      <div class="score">{{level}}</div>
      <div class="img-title">
        <div>原图</div>
        <div>vs</div>
        <div>模仿</div>
      </div>
      <div class="img-wrap">
        <div class="img">
          <img :src="imgPath"  mode="aspectFit" >
        </div>
        <div class="img">
          <img :src="photoPath"  mode="aspectFit" >
        </div>
      </div>
      <div class="bottom" :class="{iphoneX: iphoneX}">
        <div class="hor">
          <div class="btn" id="re" @click="back">再来一题</div>
          <div class="btn" id="back" @click="create">保存图片</div>
        </div>
      </div>
      <canvas class="to-images" canvas-id="to-images"></canvas>
    </div>
  </container>
</template>

<script>
import events from '../../../static/events'
import {distance, classify} from './score'
import {radiusPath} from '../index/draw'
import AI from '../../images/imitation/ic_ai.png'
import STAR from '../../images/imitation/ic_star1.png'
import STARNULL from '../../images/imitation/ic_star2.png'

const scoreText = ['王者', '钻石', '黄金', '白银', '青铜']
export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      loading: false,
      imgPath:'https://api.pintuxiangce.com/resources/uploads/icons/24e02e999cedf6d03fd214205c2f732d.jpg',
      imgW: 0,
      photoPath:'https://api.pintuxiangce.com/resources/uploads/icons/24e02e999cedf6d03fd214205c2f732d.jpg',
      sJson: '',
      AI,
      STARNULL,
      STAR,
      nullStarCount: 5,
      level: '',
      avatarUrl: ''
    }
  },
  computed: {
    headBg () {
      return  this.loading ? '#fff' : '#FFE200'
    },
    title () {
      return this.loading ? 'keke模仿大赛': ''
    },
    starCount () {
      return 5 - this.nullStarCount
    }
  },
  methods: {
    back () {
      events.$emit('indexChange')
      this.$nextTick(() => {
        wx.navigateBack({
          delta: 2
        })
      })
    },
    create () {
      const timer = setTimeout(() => {
        wx.hideLoading()
        wx.showModal({
          title: 'ERROR',
          content: 'Canvas Crashed', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
          showCancel: false,
          success: function(res) {

          }
        })
      }, 10000)
      const nullStar = '/static/ic_star2.png'
      const star = '/static/ic_star1.png'
      const goal = {
        QRCode: '/static/new_qrcode.png',
        QRX: 57,
        QRY: 19,
        QRL: 64
      }
      const ctx = wx.createCanvasContext('to-images')
      console.log(ctx)
      const allW = 375
      const allH = 667
      const phW = 170
      const phH = 170
      ctx.setTextBaseline('top')
      ctx.setFillStyle('#FFE200')
      ctx.setStrokeStyle('#000')
      ctx.fillRect(0,0, allW, allH)
      // 用户信息
      if (this.avatarUrl) {
        ctx.save()
        radiusPath(ctx, 167, 20, 41, 41 , 20.5)
        ctx.clip()
        ctx.drawImage(this.avatarUrl, 167, 20, 41, 41)
        ctx.restore()
        ctx.setFontSize(17)
        ctx.setFillStyle('#000')
        const metrics = ctx.measureText(this.name)
        ctx.fillText(this.level, (allW - metrics.width) / 2, 65)
      }
      // star
      for (let i = 0; i <5; i++) {
        ctx.drawImage(i >= (5 - this.nullStarCount) ? nullStar : star, 48.2 + i * 60, 119, 39.8, 38.8)
      }
      // level
      ctx.setFontSize(40)
      ctx.setFillStyle('#5B29EF')
      ctx.fillText(this.level, (allW - ctx.measureText(this.level).width) / 2, 183)

      // 原图 vs 模仿
      ctx.setFontSize(20)
      ctx.setFillStyle('#4A4A4A')
      ctx.fillText('原图', 76, 306)
      ctx.fillText('vs', 177, 306)
      ctx.fillText('模仿', 258, 306)


      ctx.lineWidth = 4
      // 图片
      ctx.save()
      radiusPath(ctx, 13, 342, phW, phH,8.5)
      ctx.stroke()
      ctx.clip()
      // this.ctx.globalCompositeOperation = 'source-atop'
      ctx.drawImage(this.imgPath, 13, 342, phW, phH)
      ctx.restore()

      ctx.save()
      radiusPath(ctx, 193, 342, phW, phH, 8.5)
      ctx.stroke()
      ctx.clip()
      // this.ctx.globalCompositeOperation = 'source-atop'
      ctx.drawImage(this.photoPath, 193, 342, phW, phH)
      ctx.restore()


      ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
      ctx.setFillStyle('#333')
      ctx.setFontSize(18)
      ctx.setTextBaseline('bottom')
      ctx.fillText('扫码参加keke模仿大赛', 135, allH - 39)
      ctx.draw(false, () => {
        console.log('draw')
        wx.canvasToTempFilePath({
          canvasId: 'to-images',
          x: 0,
          y: 0,
          width: allW,
          height: allH,
          fileType: 'jpg',
          quality: .8,
          success: (res) => {
            clearTimeout(timer)
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.hideLoading()
                wx.showToast({
                  title: '保存成功'
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
          },
          fail (err) {
            console.log(err)
          }
        })
      })
    },
    uploadSource (path) {
      this.uploadImg(path, (res) => {
        this.sJson = res
        this.uploadImg(this.photoPath, (data) => {
          this.takeScore(this.photoPath, data)
        })
      })
    },
    uploadImg (path, cb) {
      wx.uploadFile({
        url: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
        filePath: path,
        name: 'image_file',
        formData: {
          api_key: 'Tti9NApKiVOqTmzlVKdISOIjLnfjCSpA',
          api_secret: 'sN2B9-iVyrtyKeQ_HSn6j3JYVdm1LSg2',
          return_landmark: 1,
          calculate_all: 1,
          return_attributes: 'gender,age,smiling,headpose,facequality,blur,eyestatus,emotion,ethnicity,beauty,mouthstatus,eyegaze,skinstatus'
        },
        success(res) {
          cb(JSON.parse(res.data))
        },
        fail (e) {
         console.log(e)
        }
      })
    },
    takeScore (path, data) {
      wx.getImageInfo({
        src: path,
        success: (img) => {
          try {
            console.log(data.faces[0], img.width, this.sJson.faces[0], this.imgW)
            const score = distance(data.faces[0], img.width, this.sJson.faces[0], this.imgW)
            const level = classify(score)
            this.nullStarCount = scoreText.indexOf(level)
            this.level = level
            console.log(img.width)
            console.log(score, level)
            this.loading = false
          } catch (e) {
            this.loading = false
            this.nullStarCount = 5
            this.level = '什么玩意'
          }
        }
      })
    }
  },
  onLoad () {
    this.loading = true
    this.name = global.name
    if (global.avatarUrl) {
      wx.getImageInfo({
        src: global.avatarUrl,
        success: ({path}) => {
          this.avatarUrl = path
        }
      })
    } else {
      this.avatarUrl = ''
    }
    this.imgPath = ''
    this.photoPath = ''
  },
  onReady () {
    wx.getImageInfo({
      src: events.$emit('getMaskPath'),
      success: (info) => {
        this.imgPath = info.path
        this.imgW = info.width
        this.uploadSource(info.path)
      }
    })
    this.photoPath = events.$emit('getPhoto')
  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/first/main',
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/24e02e999cedf6d03fd214205c2f732d.jpg'
    }
  }
}
</script>

<style lang="less" scoped>
  .wrap{
    background: #FFE200;
    width: 100%;
    height: 100%;
    text-align: center;
    overflow: auto;
    &.loading{
      background: #fff;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      img{
        width: 520rpx;
        height: 520rpx;
        margin-bottom: 60rpx;
      }
      p{
        width: 520rpx;
        height: 100rpx;
        line-height: 100rpx;
        border-radius: 16rpx;
        font-size: 36rpx;
        color: #000;
        background: #FFE200;
      }
    }
    .userInfo {
      position: absolute;
      top: -42rpx;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999;
      .avatar {
        display: block;
        width: 82rpx;
        height: 82rpx;
        border-radius: 50%;
        overflow: hidden;
      }
      .name{
        margin-top: 10rpx;
        font-size: 34rpx;
        color: #000;
        line-height: 45rpx;
      }
    }
    .star{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 134rpx 96.4rpx 50rpx;
      img{
        width: 80rpx;
        height: 80rpx;
      }
    }
    .score{
      font-size: 80rpx;
      color: #5B29EF;
      text-align: center;
    }
    .img-title{
      margin: 134rpx 0 16rpx;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      padding: 0 76rpx;
      font-size: 40rpx;
      color: #4A4A4A;
    }
    .img-wrap{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 0 26rpx;
      margin-bottom: 140rpx;
      .img {
        display: block;
        box-sizing: border-box;
        width: 340rpx;
        height: 340rpx;
        border: 1px solid;
        border-radius: 19rpx;
        overflow: hidden;
        img{
          width: 100%;
          height: 100%;
        }
      }
    }
    .tip-content{
      font-size: 28rpx;
      margin: 20rpx 0;
      text-align: center;
      color: #D0021B;
    }
    .bottom{
      box-sizing: border-box;
      width: 100%;
      padding: 0 56rpx;
      margin-top: 40rpx;
      .hor {
        display: flex;
        justify-content: space-between;
        .btn{
          width: 300rpx;
          height: 88rpx;
          background: #fff;
          text-align: center;
          line-height: 86rpx;
          box-sizing: border-box;
          border: 2rpx solid;
          border-radius: 44rpx;
          font-size: 32rpx;
          &:first-child{
            background: rgba(255,255,255,.51);
          }
          &:last-child{
            background: #EFEFEF;
          }
        }
      }
      .contact{
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: none;
        width: 42vw;
        height: 34rpx;
        line-height: 34rpx;
        font-size: 24rpx;
        color: #FF2600;
        margin-top: 12rpx;
        background: transparent;
        &:after{
          display: none;
         }
      }
    }
    .to-images{
      position: fixed;
      left: -600px;
      top: 0;
      width: 600px;
      height: 1746px;
      opacity: 0;
    }
  }

</style>
