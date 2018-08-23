<template>
  <container title="保存拼图">
    <div class="wrap">
      <div class="res-tip">
         <icon type="success" size="50" color="#6ac259"/>
          <p>已保存到手机相册</p>
          <p>快分享你的Shapin</p>
      </div>
      <div class="bottom" :class="{iphoneX: iphoneX}">
        <button class="btn" @click="backHome">回到主页</button>
        <button class="btn share" id="save-images"  open-type="share">推荐给朋友</button>
        <button class="btn share" id="contact" open-type="contact">我要反馈</button>
      </div>
    </div>
  </container>
</template>

<script>
import events from '../../../static/events'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      images: [],
      showImages: [],
      current: 0
    }
  },

  computed: {
     imgData () {
         return this.showImages.map(item => {
             if (item.imgW === item.imgH) {
                 item.imgW = item.imgH = 598
             } else {
                 item.imgH = 840
                 item.imgW = 480
             }
             return item
         })
     }
  },
  methods: {
    swiperChange (ev) {
       this.current = ev.target.current
    },
    save () {
      wx.showLoading({
          title: '图片保存中'
      })
      Promise.all(this.images.map(item => {
        return new Promise((resolve, reject) => {
          wx.saveImageToPhotosAlbum({
            filePath: item.path,
            success (res) {
              resolve()
            },
            fail () {
              reject()
            }
          })
        })
      })).then(() => {
        wx.hideLoading()
        wx.showModal({
          title: '保存成功',
          content: '4张拼图已保存到手机相册，\r\n快去分享你的创作！',
          showCancel: false,
          success: function(res) {
          }
        })
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({
          title: '保存失败，请在右上角设置中打开权限。',
          icon: 'none'
        })
      })

    },
    backHome () {
      events.$emit('imgClear')
      events.$emit('cvsDataClear')
      const url = '../index/main'
      wx.reLaunch({ url })
    }
  },

  created () {
    // 调用应用实例的方法获取全局数据

  },
  mounted () {
    this.images = wx.getStorageSync('result') || []
    this.showImages = this.images// .filter(item => item.name !== 'fx')
    console.log(this.images)
  },
  onUnLoad () {
    this.showImages = []
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
  .wrap{
    width: 100%;
    height: 100%;
    .res-tip{
      padding: 80rpx 0 100rpx;
      text-align: center;
      p{
        font-size: 36rpx;
        color: #333;
      }
    }
    .bottom{
      width: 100%;
      .btn {
        display: block;
        margin: 0 auto 32rpx;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 320rpx;
        height: 90rpx;
        line-height: 86rpx;
        font-size: 32rpx;
        background: #FFE200;
        text-align: center;
        color: #000;
        &.share{
          background: #DEDEDE;
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
  }

</style>
