<template>
  <container title="预览作品" background="#FFE200">
    <div class="wrap">
      <img class="img" :src="imgPath"  mode="aspectFit" >
      <img class="img" :src="photoPath"  mode="aspectFit" >
      <div class="tip-content">
        <p>你的照片已存相册</p>
        <p>可美化后替换照片</p>
      </div>
      <div class="bottom" :class="{iphoneX: iphoneX}">
        <div class="hor">
          <div class="btn" id="re" @click="back">重新拍照</div>
          <div class="btn" id="back" @click="chooseImg">相册选图</div>
        </div>
        <div class="btn" @click="create">生成作品</div>
      </div>
      <canvas class="to-images" canvas-id="to-images"></canvas>
    </div>
  </container>
</template>

<script>
import events from '../../../static/events'
import {distance, classify} from './score'
export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      imgPath:'https://api.pintuxiangce.com/resources/uploads/icons/24e02e999cedf6d03fd214205c2f732d.jpg',
      imgW: 0,
      photoPath:'https://api.pintuxiangce.com/resources/uploads/icons/24e02e999cedf6d03fd214205c2f732d.jpg',
      sJson: ''
    }
  },

  methods: {
    backHome () {
      events.$emit('clearList')
      wx.navigateBack({
        delta: 2
      })
    },
    back () {
      wx.navigateBack()
    },
    chooseImg () {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed', 'original'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          const path = res.tempFilePaths[0]
          // this.setImage(path)
          events.$off('setImage')
          events.$once('setImage', (img) => {
            this.photoPath = img
          })
          const url = '../cropped/main?imgPath=' + path
          wx.navigateTo({ url })
        }
      })
    },
    create () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })

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
      const goal = {
        QRCode: '/static/new_qrcode.png',
        QRX: 47,
        QRY: 4,
        QRL: 56
      }
      const ctx = wx.createCanvasContext('to-images')
      const allW = 375 + 40
      const allH = (375 + 20) * 2 +20 + 64
      const phW = 375
      const phH = 375
      ctx.setFillStyle('#FFF')
      ctx.setStrokeStyle('#000')
      ctx.fillRect(0,0, allW, allH)
      ctx.drawImage(this.imgPath, 20, 20, phW, phH)
      ctx.strokeRect(20, 20, phW, phH)
      ctx.drawImage(this.photoPath, 20, phH + 40, phW, phH)
      ctx.strokeRect(20, phH + 40, phW, phH)
      ctx.save()
      ctx.setFillStyle('#FFE200')
      ctx.fillRect(0, allH - 64, allW, 64)
      ctx.restore()
      ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
      ctx.setFillStyle('#333')
      ctx.setFontSize(18)
      ctx.setTextBaseline('bottom')
      ctx.fillText('快来创作你的图片模仿秀，keke', 112, allH - 21)
      ctx.draw(false, () => {
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
                this.uploadImg(this.photoPath, (data) => {
                  this.takeScore(this.photoPath, data)
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
            wx.hideLoading()
            const url = '../result/main?score=' + score + '&level=' + level
            wx.navigateTo({ url })
            console.log(img.width)
            console.log(score, level)
          } catch (e) {
            wx.hideLoading()
            wx.showModal({
              title: '',
              content: '没有检测到人脸', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
              showCancel: false,
              success: function(res) {
                const url = '../result/main?score=十万八千里&level=青铜'
                wx.navigateTo({ url })
              }
            })
          }
        }
      })
    }
  },
  onLoad () {
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
    width: 100%;
    text-align: center;
    .img {
      display: block;
      width: 360rpx;
      height: 360rpx;
      border: 1px solid;
      margin: 20rpx auto;
    }
    .tip-content{
      font-size: 28rpx;
      margin: 20rpx 0;
      text-align: center;
      color: #D0021B;
    }
    .bottom{
      width: 100%;
      margin-top: 40rpx;
      .hor {
        display: flex;
        justify-content: center;
        .btn{
          width: 240rpx;
          height: 88rpx;
          background: #fff;
          border: 1rpx solid;
          text-align: center;
          line-height: 86rpx;
          margin: 0 8rpx;
        }
      }
      .btn {
        display: block;
        margin: 20rpx auto 32rpx;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 514rpx;
        height: 90rpx;
        line-height: 86rpx;
        font-size: 32rpx;
        background: #FFE200;
        text-align: center;
        color: #000;
        &.share{
          background: transparent;
        }
        &.re{
          background: rgb(251, 14, 55);
          color: #fff;
          border: 2rpx solid #000;
        }
        &:after, &:before{
          display: none;
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
