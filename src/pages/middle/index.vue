<template>
  <container title="预览作品" background="#FFE200">
    <div class="wrap">
      <div class="img-wrap">
        <img class="img" :src="photoPath"  mode="aspectFit" >
        <img class="img pic" :src="imgPath"  mode="aspectFit" >
      </div>
      <div class="bottom" :class="{iphoneX: iphoneX}">
        <div class="btn re" @click="back">重新拍照</div>
        <div class="btn" @click="createToLocal">发布作品</div>
        <img class="tip" v-if="needTip" :src="alert3" alt=""  @tap.stop="clearTip">
      </div>
      <canvas class="to-images" canvas-id="to-images"></canvas>
    </div>
  </container>
</template>

<script>
import events from '../../../static/events'
import {distance, classify} from './score'
import alert3 from '@/images/alert3.png'

export default {
  data () {
    const model = wx.getSystemInfoSync().model
    console.log(model)
    const isIphone = model.indexOf('iPhone') >= 0
    const iphoneX = model.indexOf('iPhone X') >= 0
    return {
      isIphone,
      iphoneX,
      alert3,
      imgPath:'',
      imgW: 0,
      photoPath:'',
      sJson: '',
      needTip: false
    }
  },

  methods: {
    clearTip () {
      this.needTip = false
      wx.setStorage({
        key: 'publishTip',
        data: 1
      })
    },
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
    createToLocal () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      this.clearTip()
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
        QRCode: '/static/newqrcode.png',
        QRX: 47,
        QRY: 4,
        QRL: 56
      }
      const ctx = wx.createCanvasContext('to-images')
      const allW = 375
      const allH = 375 + 64
      const phW = 375
      const phH = 375
      ctx.setFillStyle('#FFF')
      ctx.setStrokeStyle('#000')
      ctx.fillRect(0,0, allW, allH)
      ctx.drawImage(this.photoPath, 0, 0, phW, phH)
      // ctx.strokeRect(20, 20, phW, phH)
      ctx.drawImage(this.imgPath, phW / 3 * 2, phH / 3 * 2, phW / 3, phH / 3)
      // ctx.strokeRect(20, phH + 40, phW, phH)
      ctx.save()
      ctx.setFillStyle('#FFE200')
      ctx.fillRect(0, allH - 64, allW, 64)
      ctx.restore()
      ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
      ctx.setFillStyle('#333')
      ctx.setFontSize(18)
      ctx.setTextBaseline('bottom')
      ctx.fillText('秀出你的神模仿，keke', 112, allH - 21)
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
                this.createToUpload()
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
    createToUpload () {
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
        QRCode: '/static/newqrcode.png',
        QRX: 47,
        QRY: 4,
        QRL: 56
      }
      const ctx = wx.createCanvasContext('to-images')
      const allW = 375
      const allH = 375
      const phW = 375
      const phH = 375
      ctx.setFillStyle('#FFF')
      ctx.setStrokeStyle('#000')
      ctx.fillRect(0,0, allW, allH)
      ctx.drawImage(this.photoPath, 0, 0, phW, phH)
      // ctx.strokeRect(20, 20, phW, phH)
      ctx.drawImage(this.imgPath, phW / 3 * 2, phH / 3 * 2, phW / 3, phH / 3)
      // ctx.strokeRect(20, phH + 40, phW, phH)
      ctx.save()
      // ctx.setFillStyle('#FFE200')
      // ctx.fillRect(0, allH - 64, allW, 64)
      // ctx.restore()
      // ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
      // ctx.setFillStyle('#333')
      // ctx.setFontSize(18)
      // ctx.setTextBaseline('bottom')
      // ctx.fillText('秀出你的神模仿，keke', 112, allH - 21)
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'to-images',
          x: 0,
          y: 0,
          width: allW,
          height: allH,
          destWidth: 700,
          destHeight: 700,
          fileType: 'jpg',
          quality: .8,
          success: (res) => {
            clearTimeout(timer)
            this.uploadImg(res.tempFilePath)
          },
          fail (err) {
            console.log(err)
          }
        })
      })

    },
    uploadImg (path) {
      wx.uploadFile({
        url: 'https://api.pintuxiangce.com/admin/upload/icon',
        filePath: path,
        name: 'icon_file',
        formData: {
          icon: '',
          image: ''
        },
        success(res) {
          const icon = JSON.parse(res.data).data.path
          try {
            wx.uploadFile({
              url: 'https://api.pintuxiangce.com/admin/upload/image',
              filePath: path,
              name: 'image_file',
              formData: {
                icon: icon,
                image: ''
              },
              success(imgRes) {
                try {
                  const img = JSON.parse(imgRes.data).data.path
                  const name = events.$emit('getChooseName')
                  wx.request({
                    method: 'POST',
                    data: {
                      id: 0,
                      name: name,
                      ename: Date.now(),
                      category: 32,
                      good_num: 0,
                      sort: 1,
                      icon_url: icon,
                      icon: img
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    url: 'https://api.pintuxiangce.com/admin/icon/create',
                    success: (res) => {
                      wx.getStorage({
                        key: 'photoCount',
                        success: (res) => {
                          const photoCount = JSON.parse(res.data) || 0
                          if (photoCount > 0) {
                            wx.setStorage({
                              key: 'photoCount',
                              data: photoCount + 1
                            })
                          } else {
                            wx.setStorage({
                              key: 'photoShare',
                              data: 1
                            })
                            wx.setStorage({
                              key: 'photoCount',
                              data: 1
                            })
                          }
                        },
                        fail: () => {
                          wx.setStorage({
                            key: 'photoShare',
                            data: 1
                          })
                          wx.setStorage({
                            key: 'photoCount',
                            data: 1
                          })
                        }
                      })
                      wx.hideLoading()
                      wx.showToast({
                        title: '作品已保存到手机相册',
                        icon: '',
                        duration: 1000
                      })
                      events.$emit('refreshList')
                      setTimeout(() => {
                        wx.navigateBack({
                          delta: 3
                        })
                      }, 300)
                    },
                    fail () {
                      wx.hideLoading()
                      wx.showToast({
                        title: '上传失败',
                        icon: 'none'
                      })
                    }
                  })
                } catch (e) {
                  wx.hideLoading()
                  wx.showToast({
                    title: '上传失败',
                    icon: 'none'
                  })
                }
              },
              fail (e) {
                console.log(e)
                wx.hideLoading()
                wx.showToast({
                  title: '上传失败',
                  icon: 'none'
                })
              }
            })
          } catch (e) {
            wx.hideLoading()
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        },
        fail (e) {
         console.log(e)
          wx.hideLoading()
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      })
    },
    beautifyPhoto (path) {
      let _this = this
      wx.uploadFile({
        url: 'https://api-cn.faceplusplus.com/facepp/v1/beautify',
        filePath: path,
        name: 'image_file',
        formData: {
          api_key: 'Tti9NApKiVOqTmzlVKdISOIjLnfjCSpA',
          api_secret: 'sN2B9-iVyrtyKeQ_HSn6j3JYVdm1LSg2',
          whitening: this.isIphone ? 100 : 30,
          smoothing: this.isIphone ? 100 : 30
        },
        success: (res) => {
          let data = JSON.parse(res.data)
          let img = data.result
          const fs = wx.getFileSystemManager()
          let path = `${wx.env.USER_DATA_PATH}/p-${Date.now().toString(32)}.jpg`
          console.log(`美颜： 用时${data.time_used}; 写入文件`)
          fs.writeFile({
            filePath: path,
            data: img,
            encoding: 'base64',
            success (info) {
              console.log(info)
              wx.getImageInfo({
                src: path,
                success (d) {
                  console.log('写入成功，获得图片' + d.path)
                  _this.photoPath = d.path
                  wx.getImageInfo({
                    src: events.$emit('getMaskPath'),
                    success: (info) => {
                      _this.imgPath = info.path
                      _this.imgW = info.width
                    }
                  })
                },
                fail (e) {
                  console.log('fail', e)
                }
              })
            },
            fail (info) {
              console.log(info)
            }
          })
        },
        fail (e) {
          console.log(e)
        },
        complete: () => {
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
    // this.imgPath = ''
    // this.photoPath = ''
  },
  onUnload () {
    this.photoPath = ''
    this.imgPath = ''
  },
  onReady () {
    wx.getStorage({
      key: 'publishTip',
      success: (res) => {
        this.needTip = !res.data
      },
      fail: (re) =>{
        this.needTip = true
      }
    })
    this.beautifyPhoto(events.$emit('getPhoto'))
  },
  onShareAppMessage() {
    return {
      title: 'keke模仿秀',
      path: '/pages/first/main',
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/4d74d69d5f87069c3576f2aa96507f5b.jpg'
    }
  }
}
</script>

<style lang="less" scoped>
  .wrap{
    width: 100%;
    text-align: center;
    .img-wrap {
      position: relative;
      .img {
        display: block;
        width: 100vw;
        height: 100vw;
        background: #cecece;
      }
      .pic {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 33.3vw;
        height: 33.3vw;
        background: #bcbcbc;
      }
    }
    .tip-content{
      font-size: 28rpx;
      margin: 20rpx 0;
      text-align: center;
      color: #D0021B;
    }
    .bottom{
      position: relative;
      width: 100%;
      margin-top: 40rpx;
      .btn {
        display: block;
        margin: 20rpx auto 32rpx;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 382rpx;
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
          background:  #fff;
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
      .tip {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 560rpx;
        height: 94rpx;
        bottom: -120rpx;
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
