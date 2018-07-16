<template>
  <div>
    <ul class="images-container">
      <li v-for="(img, index) in images" class="img-item" :key="index">
        <img :src="img" class="img" alt="">
      </li>
    </ul>
    <div class="footer-btn">
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
        stencil: ''
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
            this.images = new Set(tempFilePaths.concat(this.images))
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
    },
    mounted () {

    }
  }
</script>

<style lang="less" scoped>
  .images-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: 100vw;
    background: #fff;
    padding-bottom: 120rpx;
    .img-item {
      width: 32.8vw;
      height: 32.8vw;
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
    button{
      display: inline-block;
      width: 200rpx;
    }
  }
</style>
