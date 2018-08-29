<template>
  <container title="Shapin">

  </container>
</template>

<script>
import  img1 from '@/images/1.jpg'
import  img2 from '@/images/2.jpg'
import  img3 from '@/images/3.jpg'
export default {
  data () {
    return {
      imgUrls: [
        img1, img2, img3
      ],
      crash: false
    }
  },

  methods: {
    bindViewTap () {
      const url = '../choose-img/main'
      wx.navigateTo({ url })
    },
    getUserInfo () {
      // 调用登录接口
      wx.login({
        success: () => {
          wx.getUserInfo({
            success: (res) => {
              this.userInfo = res.userInfo
            }
          })
        }
      })
    },
    clickHandle (msg, ev) {
      console.log('clickHandle:', msg, ev)
    }
  },

  created () {
    // 调用应用实例的方法获取全局数据
  },
  mounted () {
  },
  onShareAppMessage() {
    return {
      title: 'Shapin',
      path: '/pages/index/main',
      imageUrl: 'http://imglf3.nosdn0.126.net/img/Qmx2R2tOVVFNcjB2UDFEZjE3MExrZjkrVTRXZEhPWnhNSTF4K0xYSnNlenJzOEp3UXluaFJRPT0.jpg?imageView&thumbnail=1680x0&quality=96&stripmeta=0&type=jpg'
    }
  },
  onLoad (options) {
    this.crash = options && !!options.crash || false
  }
}
</script>

<style lang="less" scoped>
  @import "../../less/mixin.less";
  .wrap{
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
      margin: auto;
      width: 610rpx;
      height: 840rpx;
      border-radius: 20rpx;
      overflow: hidden;
      .s-item{
        width: 100%;
        height: 100%;
      }
      .img{
        display: block;
        width: 590rpx;
        height: 770rpx;
        border-radius: 20rpx;
        margin: 0 auto;
      }
    }
    .bottom{
      margin-top: 3.6vh;
      width: 100%;
      text-align: center;
      .btn {
        display: inline-block;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 42vw;
        height: 90rpx;
        line-height: 88rpx;
        font-size: 32rpx;
        background: #FFE200;
        margin-bottom: 0.74vh;
      }
      .btns{
        text-align: center;
      }
      .contact{
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: none;
        display: inline;
        height: 34rpx;
        font-size: 28rpx;
        line-height: 34rpx;
        color: #333;
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
