<template>
  <container title="keke表情包模仿挑战" background="#fff">
    <div class="wrap-jump">
      <p>AI考官出的表情包题目为</p>
      <h1>{{name}}</h1>
      <div class="img">
        <img :src="path"/>
      </div>
      <div class="change-btn">
        <div class="change" @click="change(false)">上一题</div>
        <div class="change" @click="change(true)">下一题</div>
      </div>
      <div class="bottom">
        <button class="btn" id="jump" @tap="jump">开始模仿</button>
        <button class="btn concat" id="advance" open-type="contact">我要反馈</button>
      </div>
      <ad unit-id="adunit-c790d450da396f1c"></ad>
    </div>
  </container>
</template>

<script>
const TEMPLATET_LIST_API = 'https://api.pintuxiangce.com/icon/index'
import events from '../../../static/events'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      list: [],
      index: 0
    }
  },
  computed: {
    name () {
      return this.list.length > 0 ? this.list[this.index % this.list.length].icon_name : ''
    },
    path () {
      return  this.list.length > 0 ? this.list[this.index % this.list.length].full_icon_url : ''
    }
  },
  methods: {
    jump () {
      events.$off('getMaskPath')
      events.$on('getMaskPath', () => {
        return this.path
      })
      const url = '../camera/main'
      wx.navigateTo({ url })
    },
    getData () {
      wx.request({
        url: TEMPLATET_LIST_API,
        success: (res) => {
          if (res.statusCode === 200) {
            this.list = res.data.data.filter(item => item.category_id === '29')
            this.preGetImage()
          }
        }
      })
    },
    change (isAdd) {
      if (isAdd) {
        this.index++
      } else {
        this.index--
        if (this.index < 0) this.index = this.list.length
      }
      this.preGetImage()
    },
    preGetImage () {
      wx.getImageInfo({
        src: this.list[(this.index + 1) % this.list.length].full_icon_url,
        success: (res) => {
          this.list[(this.index + 1) % this.list.length].full_icon_url = res.path
        }
      })
    }
  },
  created () {
    events.$on('indexChange', () => {
      this.change(true)
    })
    this.getData()
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              wx.getUserInfo({
                success(res) {
                  const userInfo = res.userInfo
                  const nickName = userInfo.nickName
                  const avatarUrl = userInfo.avatarUrl
                  global.nickName = nickName
                  global.avatarUrl = avatarUrl
                }
              })
            }
          })
        }
      }
    })
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
    overflow:hidden;
    background: #fff;
    p{
      text-align: center;
      margin-top: 50rpx;
      font-size: 34rpx;
      color: #707070;
    }
    h1{
      margin: 0rpx auto 50rpx;
      font-size: 56rpx;
      font-weight: bold;
      color: #000;
      text-align: center;
    }
    .img{
      display: block;
      width: 612rpx;
      height: 612rpx;
      margin: 0 auto;
      border-radius: 40rpx;
      border: 8rpx solid #000;
      overflow: hidden;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .change-btn{
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin: 24rpx auto 64rpx;
      .change {
        font-size: 40rpx;
        color: #7D51FF;
        text-align: center;
        font-weight: bold;
        margin: 0 93rpx;
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
        border-radius: 56rpx;
        width: 514rpx;
        height: 112rpx;
        line-height: 110rpx;
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
        font-size: 30rpx;
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
