<template>
  <container title="拼图相册Pintu">
    <div class="wrap">
      <swiper
        :indicator-dots="true"
        :autoplay="true"
        :circular="true"
        indicator-active-color="#FFE200"
        :interval="5000"
        class="banner"
      >
        <template v-for="(item, index) in imgUrls">
          <swiper-item class="s-item">
            <img class="img" :src="item"/>
          </swiper-item>
        </template>
      </swiper>
      <div class="bottom">
        <button class="btn" @click="bindViewTap">开始制作</button>
        <p>拼图功能对性能有一定要求</p>
        <p>请尽量使用较好配置的手机</p>
        <button class="contact" open-type="contact">联系客服</button>
      </div>
    </div>
  </container>
</template>

<script>
import card from '@/components/card'
import  img1 from '@/images/1.jpg'
import  img2 from '@/images/2.jpg'
import  img3 from '@/images/3.jpg'
export default {
  data () {
    return {
      imgUrls: [
        img1, img2, img3
      ]
    }
  },

  components: {
    card
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
      margin: 60rpx 80rpx 0;
      width: 79%;
      height: 62.8%;
      border-radius: 20rpx;
      overflow: hidden;
      .s-item{
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 0 10rpx;
      }
      .img{
        width: 100%;
        height: 91.88%;
        border-radius: 20rpx;
      }
    }
    .bottom{
      position: fixed;
      bottom: 32rpx;
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
        margin-top: 30rpx;
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
