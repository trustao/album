<template>
  <container :title="title" :background="headBg">
    <div class="wrap loading" v-if="loading">
      <img :src="AI" alt="">
      <p>AI考官 正在打分...</p>
    </div>
    <div class="wrap" v-else>
      <div class="img-title">
        <div>表情包</div>
        <div>vs</div>
        <div>模仿照</div>
      </div>
      <div class="img-wrap">
        <div class="img">
          <img :src="imgPath"  mode="aspectFit" >
        </div>
        <div class="img">
          <img :src="photoPath"  mode="aspectFit" @load="photoLoad">
        </div>
      </div>

      <div class="star">
        <img :src="item >= (5 - nullStarCount) ? STARNULL : STAR" v-for="item in 5" :key="item">
      </div>
      <div class="score">{{level}}</div>
      <div class="bar-out">
        <div class="bar-inner" :style="{width: (people / 100 * 606 ) + 'rpx'}"></div>
      </div>
      <div class="over-p">
        超越 <span>{{people}}</span>%的挑战者
      </div>
      <div class="talk">{{talk}}</div>
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
const p = [
  '"模仿如此之像，无愧王者称号"',
  '"模仿不错哦，绝对是个⾼手"',
  '"模仿得还可以，细节要仔细哦"',
  '"模仿得⼀般哦，加油加油"',
  '"模仿成这样，AI考官不忍直视"',
  '"你绝对是来砸场⼦的"'
]
const ran = [
  [90, 99],
  [70, 89],
  [50, 69],
  [20, 49],
  [10, 19]
]
export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      loading: false,
      imgPath:'https://api.pintuxiangce.com/resources/uploads/icons/c738d5e40bfa99731decacbaf8ef6298.jpg',
      imgW: 0,
      photoPath:'https://api.pintuxiangce.com/resources/uploads/icons/c738d5e40bfa99731decacbaf8ef6298.jpg',
      sJson: '',
      AI,
      STARNULL,
      STAR,
      nullStarCount: 3,
      level: '王者',
      avatarUrl: '',
      talk: p[0],
      people: 96
    }
  },
  computed: {
    headBg () {
      return  this.loading ? '#fff' : '#FFE200'
    },
    title () {
      return this.loading ? 'keke表情包模仿挑战': ''
    },
    starCount () {
      return 5 - this.nullStarCount
    }
  },
  watch: {
    loading (val) {
      wx.setKeepScreenOn({
        keepScreenOn: val
      })
    }
  },
  methods: {
    photoLoad (e) {
      console.log(e)
    },
    back () {
      events.$emit('indexChange')
      this.$nextTick(() => {
        wx.navigateBack()
      })
    },
    uploadPhoto (cb) {
      console.log('上传')
      wx.uploadFile({
        url: 'https://api.pintuxiangce.com/admin/upload/icon',
        filePath: this.photoPath,
        name: 'icon_file',
        formData: {
          icon: '',
          image: ''
        },
        success(res) {
          try {
            const icon = JSON.parse(res.data).data.path
            wx.uploadFile({
              url: 'https://api.pintuxiangce.com/admin/upload/image',
              filePath: this.imgPath,
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
                      category: 31,
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
                      cb()
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
      this.draw()
      this.draw((allW, allH) => {
        setTimeout(() => {
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
              this.uploadPhoto(() => {
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
              })
            },
            fail (err) {
              console.log(err)
            }
          })
        }, 200)
      })
    },
    draw (fn) {
      const nullStar = '/static/ic_star2.png'
      const star = '/static/ic_star1.png'
      const goal = {
        QRCode: '/static/new_qrcode.png',
        QRX: 27,
        QRY: 19,
        QRL: 64
      }
      const ctx = wx.createCanvasContext('to-images')
      const allW = 375
      const allH = 667
      const phW = 170
      const phH = 170
      ctx.setTextBaseline('top')
      ctx.setFillStyle('#FFE200')
      ctx.setStrokeStyle('#000')
      ctx.fillRect(0,0, allW, allH)

      // 原图 vs 模仿
      ctx.setFontSize(20)
      ctx.setFillStyle('#4A4A4A')
      ctx.fillText('表情包', 66, 40)
      ctx.fillText('vs', 177, 40)
      ctx.fillText('模仿照', 248, 40)


      ctx.lineWidth = 4
      // 图片
      ctx.save()
      radiusPath(ctx, 13, 76, phW, phH,8.5)
      ctx.stroke()
      ctx.clip()
      // this.ctx.globalCompositeOperation = 'source-atop'
      ctx.drawImage(this.imgPath, 13, 76, phW, phH)
      ctx.restore()

      ctx.save()
      radiusPath(ctx, 193, 76, phW, phH, 8.5)
      ctx.stroke()
      ctx.clip()
      // this.ctx.globalCompositeOperation = 'source-atop'
      ctx.drawImage(this.photoPath, 193, 76, phW, phH)
      ctx.restore()
      // 用户信息
      // if (this.avatarUrl) {
      //   ctx.save()
      //   radiusPath(ctx, 167, 20, 41, 41 , 20.5)
      //   ctx.clip()
      //   ctx.drawImage(this.avatarUrl, 167, 20, 41, 41)
      //   ctx.restore()
      //   ctx.setFontSize(17)
      //   ctx.setFillStyle('#000')
      //   const metrics = ctx.measureText(this.name)
      //   ctx.fillText(this.level, (allW - metrics.width) / 2, 65)
      // }
      // star
      for (let i = 0; i <5; i++) {
        ctx.drawImage(i >= (5 - this.nullStarCount) ? nullStar : star, 62.2 + i * 54, 286, 35.8, 34.8)
      }
      // level
      ctx.setFontSize(40)
      ctx.setFillStyle('#5B29EF')
      ctx.fillText(this.level, (allW - ctx.measureText(this.level).width) / 2, 335)

      //bar
      ctx.setLineJoin('round')
      ctx.setLineWidth(12)
      ctx.setStrokeStyle('#DDD')
      ctx.beginPath()
      ctx.moveTo(43, 409)
      ctx.lineTo(329, 409)
      ctx.closePath()
      ctx.stroke()

      ctx.setStrokeStyle('#7D51FF')
      ctx.beginPath()
      ctx.moveTo(43, 409)
      let x = 31 + (300 * this.people / 100)
      ctx.lineTo(x > 329 ? 329 : x, 409)
      ctx.closePath()
      ctx.stroke()

      // des
      ctx.setFillStyle('#4A4A4A')
      ctx.setFontSize(16)
      ctx.fillText('超越', 115, 441)
      // 150 188
      ctx.save()
      ctx.setFillStyle('#7D51FF')
      ctx.setFontSize(24)
      ctx.fillText(this.people, 188 - ctx.measureText('' + this.people).width, 435)
      ctx.restore()
      ctx.fillText('% 的挑战者', 188, 441)

      ctx.setFontSize(18)
      ctx.setFillStyle('#000')
      ctx.fillText(this.talk, (allW - ctx.measureText(this.talk).width) / 2, 506)


      ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
      ctx.setFillStyle('#333')
      ctx.setFontSize(18)
      ctx.setTextBaseline('bottom')
      ctx.fillText('扫码参加keke表情包模仿挑战', 105, allH - 39)
      ctx.draw(false, () => {
        console.log('draw')
        fn && fn(allW, allH)
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
    beautifyPhoto (path) {
      let _this = this
      wx.uploadFile({
        url: 'https://api-cn.faceplusplus.com/facepp/v1/beautify',
        filePath: path,
        name: 'image_file',
        formData: {
          api_key: 'Tti9NApKiVOqTmzlVKdISOIjLnfjCSpA',
          api_secret: 'sN2B9-iVyrtyKeQ_HSn6j3JYVdm1LSg2',
          whitening: 100,
          smoothing: 100
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
          this.loading = false
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
            this.talk = p[this.nullStarCount]
            this.people = (Math.random() * (ran[this.nullStarCount][1] - ran[this.nullStarCount][0]) + ran[this.nullStarCount][0]) | 0
          } catch (e) {
            this.nullStarCount = 5
            this.talk = p[5]
            this.people = 0
            this.level = '什么玩意'
          }
        },
        complete: () => {
          console.log(`评分：${this.level}; 美颜`)
          this.beautifyPhoto(this.photoPath)
        }
      })
    }
  },
  onLoad () {
    this.loading = true
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
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
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/c738d5e40bfa99731decacbaf8ef6298.jpg'
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
      padding: 0 124.4rpx 28rpx;
      img{
        width: 71.6rpx;
        height: 70rpx;
      }
    }
    .score{
      font-size: 80rpx;
      color: #5B29EF;
      text-align: center;
    }
    .img-title{
      margin: 22rpx 0 16rpx;
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
      margin-bottom: 80rpx;
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
    .bar-out{
      width: 606rpx;
      height: 24rpx;
      margin:50rpx auto 0;
      background: #DDD;
      border-radius: 12rpx;
      overflow: hidden;
      .bar-inner{
        height: 24rpx;
        border-radius: 12rpx;
        background: #5B29EF;
      }
    }
    .over-p{
      color: #4A4A4A;
      font-size: 32rpx;
      text-align: center;
      span{
        font-size: 48rpx;
        color: #7D51FF;
      }
    }
    .talk{
      margin-top: 76rpx;
      font-size: 36rpx;
      color: #333;
      text-align: center;
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
      margin-top: 98rpx;
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
