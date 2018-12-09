<template>
  <container title="生成作品" background="#FFE200">
    <div class="wrap">
      <div class="res-tip">
         <icon type="success" size="50" color="#6ac259"/>
          <p>已保存到手机相册</p>
          <p>快去分享你的作品</p>
          <p>keke</p>
      </div>
      <div class="bottom" :class="{iphoneX: iphoneX}">
        <div class="btn re" id="re" @click="back">重新编辑</div>
        <div class="btn" id="back" @click="backHome">回到主页</div>
        <button class="btn share" id="share"  open-type="share">推荐给朋友</button>
        <button class="btn share" id="advance" open-type="contact">我要反馈</button>
      </div>
    </div>
    <!--<div class="wrap-jump">-->
      <!--<h1>想要制作精致的形状拼图？<br>-->
        <!--快用小程序“Shapin”</h1>-->
      <!--<swiper-->
        <!--:indicator-dots="true"-->
        <!--:autoplay="true"-->
        <!--:circular="true"-->
        <!--indicator-active-color="#FFE200"-->
        <!--:interval="5000"-->
        <!--class="banner"-->
      <!--&gt;-->
        <!--<swiper-item v-for="(item, index) in imgUrls" :key="index" class="s-item">-->
          <!--<img class="img" :src="item"/>-->
        <!--</swiper-item>-->
      <!--</swiper>-->
      <!--<div class="bottom">-->
        <!--<button class="btn" id="jump" @click="jumpShapin-->
<!--">我要使用</button>-->
      <!--</div>-->
    <!--</div>-->
  </container>
</template>

<script>
import events from '../../../static/events'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      imgUrls: [
      ]
    }
  },

  methods: {
    jumpShapin () {
      console.log('jump')
      wx.navigateToMiniProgram({
        appId: 'wxea11b3efed0d1e07',
        envVersion: 'release',
        success(res) {
          // 打开成功
        },
        fail (res) {
          console.log(res)
        }
      })
    },
    backHome () {
      events.$emit('clearList')
      wx.navigateBack({
        delta: 4
      })
    },
    back () {
      wx.navigateBack()
    }
  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/first/main',
      imageUrl: 'https://api.pintuxiangce.com/resources/uploads/icons/785a09ebcb709dccc8e24035ec515501.jpg'
    }
  }
}
</script>

<style lang="less" scoped>
  .wrap{
    width: 100%;
    height: 920rpx;
    text-align: center;
    &:after{
      content: '';
      display: inline-block;
      width: 600rpx;
      height: 0;
      /*border-bottom: 1px solid #C7C7C7;*/
    }
    .res-tip{
      padding: 60rpx 0;
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
          background: transparent;
        }
        &.re{
          background: rgb(251, 14, 55);
          color: #fff;
          border: 2rpx solid #000;
        }
        &:after, &:before{
          display: none;
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
