<template>
  <container title="选择模仿对象" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div scroll-y class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-y class="stencils-scroll">
          <ul class="stencil-list" >
            <li class="stencil-item" v-for="(item, index) in list" :key="index" :data-stencil="item" @tap="chooseImg(item)">
              <img mode="aspectFit" class="stencil-img" :data-stencil="item" :src="item.full_icon_url" alt="">
              <!--<p v-text="item.icon_name"></p>-->
              <!--<div class="btn" @tap="chooseImg(item)">模仿</div>-->
            </li>
            <li class="stencil-item no-style" v-for="item in (3 - (list.length % 3 || 3))" :key="item"></li>

          </ul>
        </scroll-view>

      </div>
    </div>
  </container>
</template>

<script>
/* global getCurrentPages */

const API = 'https://api.pintuxiangce.com/icon/index'
import icon from '@/images/ic_changePic.png'
import events from '../../../static/events'
let jumping = false
export default {

  data () {
    return {
      curPlay: null,
      kinds: [],
      icon,
      iphoneX: false,
      viewW: 0,
      viewH: 0,
      photoPath: '/static/photo.jpg',
      cvsW: 0,
      cvsH: 0,
      curkinds: '',
      stencilPng: '',
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      photoContentWidth: 0,
      photoW: 0,
      photoH: 0,
      left: 0,
      top: 0,
      currentIndex: 0,
      kindsData: [],
      loadedPath: '',
      copy: {
        show: false,
        photoH: 0,
        photoW: 0,
        photoStyle: '',
        photoPath: ''
      },
      materials: [],
      textList: [],
      tieChanging: false,
      tieMoving: false,
      tieScaling: false,
      isText: false,
      controller: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        rotate: 0,
        scale: 1,
      },
      inputFocus: false,
      inputShow: false,
      inputEdit: false,
      inputHeight: 40,
      inputBottom: 0,
      inputText: '',
      debugImg: [],
      maskPath: '',
      list: [],
      chooseName: ''
    }
  },
  computed: {
    photoStyle () {
      return `translate(${~~this.translateX}px, ${~~this.translateY}px) scale(${this.scale})`
    },
    curKindsIndex () {
      return this.kinds.indexOf(this.curkinds)
    }
  },
  methods: {
    chooseImg ({full_icon_url, icon_name}) {
      if (jumping) return
      jumping = true
      setTimeout(() => {
        jumping = false
      }, 500)
      this.chooseName = icon_name
      this.maskPath = full_icon_url
      console.log(full_icon_url)
      this.$nextTick(() => {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.camera']) {
              wx.authorize({
                scope: 'scope.camera',
                success () {
                  const url = '../camera/main'
                  wx.navigateTo({ url })
                },
                fail () {
                  wx.showModal({
                    content: '需要授权相机才能继续，可在右上角设置中打开相机授权。', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
                    showCancel: false,
                    success: (res) => {
                      if (res.confirm) {

                      }
                    }
                  })
                }
              })
            } else {
              const url = '../camera/main'
              wx.navigateTo({ url })
            }
          }
        })

      })
    },
    getStencil (noChange) {
      wx.request({
        url: API,
        success: (res) => {
          this.list = res.data.data.filter(item => item.category_id == 31).reverse()
        }
      })
    },
    swiperChange (ev){
      this.currentIndex = ev.target.current
      this.changeKinds(this.kinds[this.currentIndex])
    },
    getRectData (){
      wx.createSelectorQuery().select('.cvs-wrap').boundingClientRect((rect) => {
        console.log(rect)
        this.photoContentWidth = rect.width
        this.left = rect.left
        this.top = rect.top
      }).exec()
    },
    changeStencilPng (item) {
      if (!item) return
      if (!this.curPlay.photoPath) {
        wx.showToast({
          title: '先添加一张图片吧',
          icon: 'none'
        })
        return
      }
      this.createTie(item)
      //
      this.stencilPng = item.full_url
      this.$root.$mp.page.setData({
        icon_id: item.icon_id,
        icon_name: item.icon_name
      })
    },
    changeKinds (val) {
      if (!val) return
      this.curkinds = val
      this.currentIndex = this.kinds.indexOf(val)
    },
    getSysInfo () {
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight
      } catch (e) {
        // Do something when catch error
      }
  }
},
  created () {
    this.getStencil()
    this.getSysInfo()
  },
  onReady() {
    events.$off(['getMaskPath', 'getChooseName'])
    events.$on('getMaskPath', () => {
      return this.maskPath
    })
    events.$on('getChooseName', () => {
      return this.chooseName
    })

  },
  onShow () {
    // this.getStencil(true)
  },
  onShareAppMessage() {
    return {
      title: 'keke模仿秀',
      path: '/pages/first/main',
      imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/4d74d69d5f87069c3576f2aa96507f5b.jpg'
    }
  }
}
</script>

<style lang="less" scoped>
.cvs-wrap{
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  scroll-y: hidden;
  overflow: hidden;
  &.iphoneX{
    .btns{
      bottom: 60rpx;
    }
  }

  .cvs-operation{
    position: relative;
    box-sizing: border-box;
    width: 100vw;
    height: 100%;
    // padding: 2.5vw;
    /*border: 3rpx solid #2F2F2F;*/
    background: #fff;
    z-index: 10;
    .kinds{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 68rpx;
      padding: 0 20rpx;
      background: #FFE200;
      overflow: hidden;
      .kinds-wrap{
        height: 68rpx;
        white-space: nowrap;
      }
      .kinds-item{
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        height: 68rpx;
        line-height: 68rpx;
        margin: 0 20rpx;
        color: #000;
        font-size: 28rpx;
        border-bottom: 6rpx solid transparent;
        transition: border-bottom-color .3s linear;
        &.active{
          border-bottom-color: #2F2F2F;
        }
      }
    }
    .stencils{
      width: 100%;
      height:100%;
      overflow: hidden;
      background: #fff;
    }
    .stencils-scroll{
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    &.iphoneX .stencil-list{
      padding-bottom: 168rpx;
    }
    .stencil-list{
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-around;
      background: #fff;
      padding: 0 2rpx 40rpx;
      .stencil-item{
        box-sizing: border-box;
        position: relative;
        width: 33vw;
        height: 33vw;
        overflow: hidden;
        white-space: normal;
        word-break: break-all;
        text-align: center;
        background: #3D4042;
        border-collapse: collapse;
        margin-top: 4rpx;
        &:after{
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          border: 1rpx solid #000;
          background: transparent;
        }
        &.no-style{
          background: #fff;
          border: none;
          &:after {
            display: none;
          }
        }
        .stencil-img{
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
        p{
          position: absolute;
          bottom: 0rpx;
          left: 0;
          width: 100%;
          height: 48rpx;
          line-height: 48rpx;
          font-size: 28rpx;
          color: #fff;
          background: rgba(0,0,0,.5);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
.play-wrap{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  position: relative;
  height: 64rpx;
  padding: 10rpx 0;
  background: #FFE200;
  .play-list {
    left: 0;
    height: 64rpx;
    display: flex;
    .play-item{
      position: relative;
      width: 60rpx;
      height: 60rpx;
      background: #fff;
      border: 2rpx solid #000;
      margin: 0 10rpx;
      .play-img{
        width: 100%;
        height: 100%;
      }
      .play-delete{
        position: absolute;
        right: -12rpx;
        top: -12rpx;
        width: 28rpx;
        height: 28rpx;
      }
    }
  }
  .play-add{
    width: 64rpx;
    height: 64rpx;
    background: #fff;
    margin: 0 10rpx;
  }
}
.to-images{
  position: fixed;
  left: -600px;
  top: 0;
  width: 600px;
  height: 1746px;
  opacity: 0;
}
</style>
