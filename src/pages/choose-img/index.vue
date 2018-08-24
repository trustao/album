<template>
  <container title="确认图片" beforeBack="imgBack">
    <div>
      <p class="tips">
        1.微信一次性只支持选9张图；<br>
        2.Shapin支持选任意数量的图片进行拼图；<br>
      </p>
      <ul class="images-container">
        <li v-for="(img, index) in imagesData" class="img-item" :key="index">
          <img :src="img.path" mode="aspectFill" class="img">
          <icon class="delete-img" type="clear" size="20" color="#000" @click="deleteImg(img)"/>
        </li>
      </ul>
      <canvas class="compress-img" canvas-id="compress"></canvas>
      <div class="footer-btn" :class="{iphoneX: iphoneX}">
        <button @click="chooseImages">继续选图</button>
        <button id="choose-images-complete" @click="chooseComplete">完成({{count}})</button>
      </div>
    </div>
  </container>
</template>

<script>
  import TaskQueue from './taskQueue'
  import events from '../../../static/events'

  let compressTask = null
  export default {
    data () {
      return {
        imagesData: [],
        stencil: '',
        iphoneX: false
      }
    },
    computed: {
      imagesMd5 () {
        return this.imagesData.map(item => {
          return item.digest
        })
      },
      count () {
        return this.imagesData.length
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
            this.checkRepeat(tempFilePaths)
          }
        })
      },
      checkRepeat (imagesList) {
        Promise.all(imagesList.map(img => {
          return new Promise((resolve, reject) => {
            wx.getFileInfo({
              filePath: img,
              success (res) {
                resolve({
                  digest: res.digest,
                  path: img
                })
              },
              fail (er) {
                reject(er)
              }
            })
          })
        }))
          .then((imagesData) => {
            let repeatCount = 0
            imagesData.forEach(item => {
              if (this.imagesMd5.indexOf(item.digest) < 0) {
                this.imagesData.push(item)
                item.compressImg = {}
                wx.getImageInfo({
                  src: item.path,
                  success: (res) => {
                    const targetScales = [1, 3 / 4, 4 / 3]
                    var w = res.width
                    var h = res.height
                    var targetW = 200
                    targetScales.forEach((scale, index) => {
                      const img = {}
                      if (w / h  > scale) {
                        img.h = targetW
                        img.w = w / h * targetW
                        img.clipW = targetW * scale
                        img.clipH = targetW
                        img.clipX = (img.w - img.clipW) / 2
                        img.clipY = 0
                      } else {
                        img.h = h / w * targetW
                        img.w = targetW
                        img.clipW = targetW
                        img.clipH = targetW / scale
                        img.clipX = 0
                        img.clipY = (img.h - img.clipH) / 2
                      }
                      this.compressImg(img, item, index)
                    })
                  }
                })
              } else {
                repeatCount++
              }
            })
            if (repeatCount > 0)
            wx.showToast({
              icon: 'none',
              title: `已过滤${repeatCount}张重复图片`,
              duration: 1500
            })
          }).catch(() => {
            wx.showToast({
              icon: 'none',
              title: '操作失败',
              duration: 2000
            })
        })
      },
      compressImg(img, item, index) {
        compressTask.addTask(() => {
          return new Promise((resolve, reject) => {
            const ctx = wx.createCanvasContext('compress')
            ctx.drawImage(item.path, 0, 0, img.w, img.h)
            ctx.draw(false, () => {
              wx.canvasToTempFilePath({
                canvasId: 'compress',
                x: img.clipX,
                y: img.clipY,
                width: img.clipW,
                height: img.clipH,
                success: (res) => {
                  item.compressImg[index] = res.tempFilePath
                  resolve()
                },
                fail (err) {
                  reject(err)
                }
              })
            })
          })
        })
      },
      chooseComplete () {
        if (!this.imagesData.length) {
          wx.showToast({
            title: '请添加照片',
            icon: 'none'
          })
          return
        }
        if (compressTask.invoking) {
          wx.showLoading({
            title: '图片处理中...',
            mask: true
          })
          compressTask.setQueueEmptyCb(this.chooseComplete)
          return
        }
        const pages = getCurrentPages()
        pages[pages.length - 1].setData({
          count: this.count
        })
        wx.setStorageSync('images', this.imagesData)
        wx.hideLoading()
        wx.navigateTo({
          url: '../puzzle/main?name=' + this.stencil
        })
      },
      deleteImg (img) {
        this.imagesData.splice(this.imagesData.indexOf(img), 1)
      },
      beforeBack (next) {
        if (this.imagesData.length > 0) {
          wx.showModal({
            title: '',
            content: '该操作将清空已选图片',
            success: (res) => {
              if (res.confirm) {
                console.log('用户点击确定')
                this.imagesData.splice(0)
                next()
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          next()
        }
      }
    },
    onLoad (options) {
      this.stencil = options.name
    },
    created () {
    },
    mounted () {
      compressTask = new TaskQueue()
      console.log(compressTask)
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
      events.$off('imgBack')
      events.$on('imgBack', this.beforeBack.bind(this))
      events.$off('imgClear')
      events.$on('imgClear', () => {
        this.imagesData.splice(0)
      })

    },
    onShareAppMessage() {
      return {
        title: 'Shapin',
        path: '/pages/index/main',
        imageUrl: 'http://imglf3.nosdn0.126.net/img/Qmx2R2tOVVFNcjB2UDFEZjE3MExrZjkrVTRXZEhPWnhNSTF4K0xYSnNlenJzOEp3UXluaFJRPT0.jpg?imageView&thumbnail=1680x0&quality=96&stripmeta=0&type=jpg'
      }
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
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100vw;
    padding-bottom: 120rpx;
    .img-item {
      box-sizing: border-box;
      position: relative;
      border: 1rpx solid #fff;
      width: 33.3vw;
      height: 33.3vw;
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
        padding-bottom:  88rpx;
     }
    button{
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
      &:last-child{
          margin-left: 5vw;
          background: #DEDEDE;
       }
      &:after{
        display: none;
       }
    }
  }
  .compress-img{
    position: fixed;
    width: 200px;
    height: 200px;
    top: -300px;
    left: -300px;
    opacity: 0;
  }
</style>
