<template>
  <container background="#FFE200">
    <div class="wrap-jump">
      <h1>keke表情包模仿挑战</h1>
      <div class="img">
        <img src="https://api.pintuxiangce.com/resources/uploads/icons/c7311bf0960ce3c16bb3d0645c074fb6.png"/>
      </div>
      <p>测测你得多少分</p>
      <div class="bottom">
        <button class="btn" open-type="getUserInfo" id="jump" @getuserinfo="jump">我要挑战</button>
      </div>
    </div>
  </container>
</template>

<script>
export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      list: [],
      index: 0
    }
  },
  methods: {
    jump (res) {
      console.log(res)
      const url = '../question/main'
      wx.navigateTo({ url })
    },
  },
  created () {

  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/first/main',
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/c738d5e40bfa99731decacbaf8ef6298.jpg'
    }
  }
}
</script>

<style lang="less" scoped>
  .wrap-jump{
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
    overflow:hidden;
    background: #FFE200;
    p{
      text-align: center;
      font-size: 60rpx;
      color: #000;
      font-weight: bold;
      line-height: 74rpx;
    }
    h1{
      margin: 70rpx auto 50rpx;
      font-size: 60rpx;
      font-weight: bold;
      color: #000;
      text-align: center;
    }
    .img{
      display: block;
      width: 718rpx;
      height: 518rpx;
      margin: 0 auto 70rpx;
      overflow: hidden;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .change {
      margin: 24rpx auto 64rpx;
      font-size: 40rpx;
      color: #7D51FF;
      text-align: center;
      font-weight: bold;
    }
    .bottom{
      width: 100%;
      text-align: center;
      margin: 87rpx 0;
      .btn {
        display: block;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border-radius: 56rpx;
        width: 514rpx;
        height: 112rpx;
        line-height: 112rpx;
        font-size: 40rpx;
        background: #FFF;
        color: #000;
        border: none;
        font-weight: bold;
        &:after, &:before{
          display: none;
        }
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
