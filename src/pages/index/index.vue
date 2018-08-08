<template>
  <container title="形状拼图">
    <div class="wrap">
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
        <button class="btn" id="start" @click="bindViewTap">开始制作</button>
        <p>拼图功能对性能有一定要求</p>
        <p>请尽量使用较好配置的手机</p>
        <button class="contact" id="contact" open-type="contact">联系客服</button>
      </div>
    </div>
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
      const url = '../choose-stencil/main'
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
      title: '形状拼图',
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
    .banner{
      margin: 4.5vh auto 0;
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
        border: 1px solid;
        border-radius: 44rpx;
        width: 42vw;
        height: 90rpx;
        line-height: 90rpx;
        font-size: 32rpx;
        background: #FFE200;
        margin-bottom: 0.74vh;
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
        margin-top: 2.24vh;
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
