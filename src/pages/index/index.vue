<template>
  <div class="container">
    <canvas canvas-id="old"></canvas>
    <canvas canvas-id="new"></canvas>
  </div>
</template>

<script>
import card from '@/components/card'
import draw from  '../puzzle/draw'
const {drawImageBackgroundB, drawImageBackground} = draw
export default {
  data () {
    return {
      motto: 'Hello World',
      userInfo: {}
    }
  },

  components: {
    card
  },

  methods: {
    bindViewTap () {
      const url = '../puzzle/main'
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
    },
    drawImage (path) {
      var oCtx = wx.createCanvasContext('old')
      var nCtx = wx.createCanvasContext('new')
      // (ctx, path, cvsId, blur, width, height)
      console.time('start')
      drawImageBackground(oCtx, path[0], 'old', 5, 100, 100)
      // drawImageBackgroundB(nCtx, path[0], 'new', 5, 100, 100)
      // oCtx.drawImage(path[0], 0, 0, 100, 100)
      // nCtx.drawImage(path[0], 0, 0, 100, 100)
      // oCtx.draw(true)
      console.timeEnd('start')
      // nCtx.draw()
    }
  },

  created () {
    // 调用应用实例的方法获取全局数据
  },
  mounted () {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        this.drawImage(tempFilePaths)
      }
    })
  }
}
</script>

<style scoped>
.userinfo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.userinfo-avatar {
  width: 128rpx;
  height: 128rpx;
  margin: 20rpx;
  border-radius: 50%;
}

.userinfo-nickname {
  color: #aaa;
}

.usermotto {
  margin-top: 150px;
}

.form-control {
  display: block;
  padding: 0 12px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
}

</style>
