<template>
  <div class="wrap">
    <mpvue-cropper
      ref="cropper"
      :option="cropperOpt"
      @ready="cropperReady"
      @beforeDraw="cropperBeforeDraw"
      @beforeImageLoad="cropperBeforeImageLoad"
      @beforeLoad="cropperLoad"
    ></mpvue-cropper>
    <cover-view class="cropper-buttons">
      <cover-view
        class="upload"
        @tap="uploadTap">
        重新选择
      </cover-view>
      <cover-view
        class="getCropperImage"
        @tap="getCropperImage">
        裁剪
      </cover-view>
    </cover-view>
  </div>
</template>

<script>
  import MpvueCropper from 'mpvue-cropper'
  import events from '../../../static/events'

  let wecropper

  const device = wx.getSystemInfoSync()
  const width = device.windowWidth
  const height = device.windowHeight - 40

  export default {
    data () {
      return {
        cropperOpt: {
          id: 'cropper',
          width,
          height,
          scale: 2.5,
          zoom: 8,
          cut: {
            x: (width - 300) / 2,
            y: (height - 300) / 2,
            width: 300,
            height: 300
          }
        }
      }
    },

    components: {
      MpvueCropper
    },

    methods: {
      cropperReady (...args) {
        console.log('cropper ready!')
      },
      cropperBeforeImageLoad (...args) {
        console.log('before image load')
      },
      cropperLoad (...args) {
        console.log('image loaded')
      },
      cropperBeforeDraw (...args) {
        // Todo: 绘制水印等等
      },
      uploadTap () {
        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: (res) => {
            const src = res.tempFilePaths[0]
            //  获取裁剪图片资源后，给data添加src属性及其值
            wecropper.pushOrigin(src)
          }
        })
      },
      getCropperImage () {
        wecropper.getCropperImage()
          .then((src) => {
            events.$emit('setImage', src)
            wx.navigateBack()
            //
            // wx.previewImage({
            //   current: '', // 当前显示图片的http链接
            //   urls: [src] // 需要预览的图片http链接列表
            // })
          })
          .catch(e => {
            console.error('获取图片失败')
          })
      }
    },

    mounted () {
      wecropper = this.$refs.cropper
      wecropper.pushOrigin(this.$mp.query.imgPath)
    }
  }
</script>

<style scoped lang="less">
  .wrap{
    width: 100%;
    height: 100%;
  }
  .cropper-wrapper{
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #e5e5e5;
  }

  .cropper-buttons{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    line-height: 50px;
  }

  .cropper-buttons .upload, .cropper-buttons .getCropperImage{
    width: 50%;
    text-align: center;
  }

  .cropper{
    position: absolute;
    top: 0;
    left: 0;
  }

  .cropper-buttons{
    background-color: #000;
    color: #04b00f;
  }
</style>
