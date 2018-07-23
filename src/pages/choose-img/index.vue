<template>
  <div>
    <ul class="images-container">
      <li v-for="(img, index) in images" class="img-item" :key="index">
        <img :src="img" class="img" alt="">
      </li>
    </ul>
    <div class="footer-btn" :class="{iphoneX: iphoneX}">
      <button @click="chooseImages">继续选择</button>
      <button @click="chooseComplete">选择完成</button>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        images: [],
        stencil: '',
        iphoneX: false
      }
    },
    methods: {
      chooseImages () {
        wx.chooseImage({
          count: 9, // 默认9
          sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
          success: (res) => {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var tempFilePaths = res.tempFilePaths
            console.log(tempFilePaths)
            this.images = Array.from(new Set(this.images.concat(tempFilePaths)))
          }
        })
      },
      chooseComplete () {
        wx.setStorageSync('images', this.images)
        wx.navigateTo({
          url: '../puzzle/main?name=' + this.stencil
        })
      }
    },
    onLoad (options) {
      this.stencil = options.name
      this.images = []
      wx.setStorageSync('images', [])
    },
    created () {
    },
    mounted () {
      try {
        var res = wx.getSystemInfoSync()
        console.log(res)
        if (res.model.indexOf('iPhone X') >= 0) {
          this.iphoneX = true
        }
      } catch (e) {
        // Do something when catch error
      }
      this.chooseImages()
    }
  }
</script>

<style lang="less" scoped>
  .images-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100vw;
    background: #fff;
    padding-bottom: 120rpx;
    .img-item {
      width: 20vw;
      height: 20vw;
      img{
        width: 100%;
        height: 100%;
      }
    }
  }
  .footer-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    text-align: center;
    width: 100vw;
    height: 100rpx;
    background: #fff;
    padding-bottom:  20rpx;
  &.iphoneX{
        padding-bottom:  60rpx;
     }
    button{
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
      &:last-child{
          margin-left: 5vw;
       }
      &:after{
        display: none;
       }
    }
  }
</style>
