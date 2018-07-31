<template>
  <container title="确认照片">
    <div>
      <p class="tips">温馨提醒：为保证拼图效果，请上传40张图以上；不足40张图，系统将自动做重复处理，请知晓。</p>
      <ul class="images-container">
        <li v-for="(img, index) in images" class="img-item" :key="index">
          <img :src="img" class="img" alt="">
          <icon class="delete-img" type="clear" size="20" color="#000" @click="deleteImg(img)"/>
        </li>
      </ul>
      <div class="footer-btn" :class="{iphoneX: iphoneX}">
        <button @click="chooseImages">继续选图</button>
        <button @click="chooseComplete">完成({{count}})</button>
      </div>
    </div>
  </container>
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
    computed: {
      pathArr () {
        return this.images.map(item => {
          return item.split('.').slice(-2).join('.').slice(12)
        })
      },
      count () {
        return this.images.length
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
            tempFilePaths.forEach(item => {
              if (this.pathArr.indexOf(item.split('.').slice(-2).join('.').slice(12)) < 0) {
                this.images.push(item)
              }
            })
          }
        })
      },
      chooseComplete () {
        wx.setStorageSync('images', this.images)
        wx.navigateTo({
          url: '../puzzle/main?name=' + this.stencil
        })
      },
      deleteImg (img) {
        this.images.splice(this.images.indexOf(img), 1)
      }
    },
    onLoad (options) {
      this.stencil = options.name
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
  .tips{
    background:  #3D4042;
    color: #fff;
    padding: 12px;
    font-size: 14px;
  }
  .images-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100vw;
    background: #fff;
    padding-bottom: 120rpx;
    .img-item {
      box-sizing: border-box;
      position: relative;
      border: 1rpx solid #fff;
      width: 20vw;
      height: 20vw;
      .delete-img{
        position: absolute;
        top: 4px;
        right: 4px;
        background: #fff;
        border-radius: 50%;
        opacity: .65;
      }
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
          background: #DEDEDE;
       }
      &:after{
        display: none;
       }
    }
  }
</style>
