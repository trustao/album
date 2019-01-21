<template>
  <container title="keke" background="#FFE200">
    <div class="wrap-jump">
      <swiper
        :indicator-dots="true"
        :autoplay="true"
        :circular="true"
        indicator-active-color="#FFE200"
        :interval="5000"
        class="banner"
      >
        <swiper-item v-for="(item, index) in imgUrls" :key="index" class="s-item">
          <img class="img" :src="item"/>
        </swiper-item>
      </swiper>
      <div class="bottom">
        <button class="btn" id="jump" @tap="jump">创作我的图片模仿秀</button>
        <button class="btn concat" id="advance" open-type="contact">我要反馈</button>
      </div>
      <ad unit-id="adunit-c790d450da396f1c"></ad>
    </div>
  </container>
</template>

<script>
import  img2 from '@/images/banner/2.jpg'
import  img4 from '@/images/banner/4.jpg'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      imgUrls: [
         img2, img4
      ]
    }
  },

  methods: {
    jump () {
      const url = '../home/main'
      wx.navigateTo({ url })
    }
  },
  created () {
    // wx.getUserInfo({
    //   success(res) {
    //     const userInfo = res.userInfo
    //     const nickName = userInfo.nickName
    //     const avatarUrl = userInfo.avatarUrl
    //     const gender = userInfo.gender // 性别 0：未知、1：男、2：女
    //     const province = userInfo.province
    //     const city = userInfo.city
    //     const country = userInfo.country
    //     console.log(res)
    //   }
    // })
    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.userInfo']) {
    //       wx.authorize({
    //         scope: 'scope.userInfo',
    //         success() {
    //           // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
    //
    //         }
    //       })
    //     }
    //   }
    // })
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
  .wrap-jump{
    box-sizing: border-box;
    width: 100%;
    /*height: 100%;*/
    overflow:hidden;
    h1{
      margin: 40rpx auto;
      font-size: 32rpx;
      color: #333;
      line-height: 44rpx;
      text-align: center;
    }
    .banner{
      margin: 40rpx auto 0;
      width: 450rpx;
      height: 950rpx;
      overflow: hidden;
      .s-item{
        width: 100%;
        height: 100%;
      }
      .img{
        display: block;
        width: 450rpx;
        height: 894rpx;
        margin: 0 auto;
      }
    }
    .bottom{
      width: 100%;
      text-align: center;
      margin: 30rpx 0;
      .btn {
        display: block;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 498rpx;
        height: 90rpx;
        line-height: 88rpx;
        font-size: 32rpx;
        background: #FFE200;
        margin-bottom: 8rpx;
      }
      .btns{
        text-align: center;
      }
      .concat{
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: none;
        display: inline;
        height: 34rpx;
        font-size: 24rpx;
        line-height: 34rpx;
        color: #FF2600;
        margin: 30rpx 15rpx;
        background: transparent;
        &:after{
          display: none;
        }
      }
      p{
        font-size: 20rpx;
        color: #868686;
      }
    }
  }

</style>
