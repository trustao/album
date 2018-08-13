<template>
  <container title="保存拼图">
    <div class="wrap">
      <swiper
        :indicator-dots="true"
        :autoplay="true"
        :circular="true"
        indicator-active-color="#FFE200"
        :interval="5000"
        @change="swiperChange"
        class="banner"
      >
        <swiper-item class="s-item"  v-for="(item, index) in imgData" :key="index">
          <p class="title">{{item.name}}</p>
          <img class="img" :src="item.path" :style="{width: item.imgW + 'rpx', height: item.imgH + 'rpx'}"/>
        </swiper-item>
      </swiper>
      <div class="bottom" :class="{iphoneX: iphoneX}">
        <button class="btn" id="save-images" @click="save">保存拼图</button>
        <button class="btn share" @click="backHome">回到主页</button>
        <button class="contact" id="contact" open-type="contact">我要反馈</button>
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
      title: '形状拼图',
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
    .banner{
      margin: 0 auto;
      width: 80.26%;
      height: 1010rpx;
      border-radius: 20rpx;
      padding-top: 1px;
      overflow: hidden;
      .s-item{
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 90rpx 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .title{
          position: absolute;
          top: 20rpx;
          font-size: 32rpx;
          left: 50%;
          transform: translateX(-50%);
        }
      }
      .img{
        width: 100%;
        height: auto;
        border-radius: 20rpx;
      }
    }
    .bottom{
      position: fixed;
      bottom: 30rpx;
      left: 0;
      width: 100%;
      text-align: center;
      &.iphoneX{
        bottom: 98rpx;
      }
      .btn {
        display: inline-block;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 42vw;
        height: 90rpx;
        line-height: 86rpx;
        font-size: 32rpx;
        background: #FFE200;
        &.share{
          margin-left: 30rpx;
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
