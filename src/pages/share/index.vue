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
        <button class="btn" @click="save">保存拼图</button>
        <button class="btn share" open-type="share">推荐给朋友</button>
        <p @click="backHome">回到首页</p>
      </div>
    </div>
  </container>
</template>

<script>
import card from '@/components/card'
import events from '../../../static/events'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      images: [],
      current: 0
    }
  },

  components: {
    card
  },
  computed: {
     imgData () {
         return this.images.map(item => {
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
      Promise.all(this.imgData.map(item => {
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
        wx.showToast({
          title: '保存成功',
          icon: 'success'
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
    console.log(this.images)
  },
  onUnLoad () {
    this.images = []
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
      margin: 0 80rpx;
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
        padding: 90rpx 10rpx;
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
        border: 1px solid;
        border-radius: 44rpx;
        width: 42vw;
        height: 90rpx;
        line-height: 90rpx;
        font-size: 32rpx;
        background: #FFE200;
        &.share{
          margin-left: 30rpx;
          background: #DEDEDE;
        }
      }
      p{
        margin-top: 12rpx;
        font-size: 26rpx;
        color: #333;
      }
    }
  }

</style>
