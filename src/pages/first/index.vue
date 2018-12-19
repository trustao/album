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
    </div>
  </container>
</template>

<script>
import  img1 from '@/images/banner/1.jpg'
import  img2 from '@/images/banner/2.jpg'
import  img3 from '@/images/banner/3.jpg'
import  img4 from '@/images/banner/4.jpg'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      imgUrls: [
        img1, img2, img3, img4
      ]
    }
  },

  methods: {
    jump () {
      const url = '../home/main'
      wx.navigateTo({ url })
    }
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
    height: 100%;
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
      margin-top: 30rpx;
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
