<template>
  <container title="保存">
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
        <template v-for="(item, index) in imgData">
          <swiper-item class="s-item">
            <p class="title">{{item.name}}</p>
            <img class="img" :src="item.path" :style="{width: item.imgW + 'rpx', height: item.imgH + 'rpx'}"/>
          </swiper-item>
        </template>
      </swiper>
      <div class="bottom">
        <button class="btn" @click="save">保存拼图</button>
        <button class="btn share" open-type="share">推荐给朋友</button>
        <p @click="backHome">回到首页</p>
      </div>
    </div>
  </container>
</template>

<script>
import card from '@/components/card'

export default {
  data () {
    return {
      imgUrls: [
        {
          url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
          height: 240
        },
        {
          url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
          height: 240
        },
        {
          url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg',
          height: 320
        },
        {
          url: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1873627548,2118672923&fm=27&gp=0.jpg',
          height: 400
        }
      ],
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
                 item.imgH = 375 / 480 * 656 *2
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
          title: '图片储存中'
      })
      this.imgData.forEach(item => {
        wx.saveImageToPhotosAlbum({
          filePath: item.path,
          success (res) {
            wx.hideLoading()
          },
          fail () {
            wx.hideLoading()
          }
        })
      })

    },
    backHome () {
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
  onShareAppMessage() {
    return {
      title: '形状拼图',
      path: '/pages/index/main'
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
      height: 1080rpx;
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
        font-size: 26rpx;
        color: #aaa;
      }
    }
  }

</style>
