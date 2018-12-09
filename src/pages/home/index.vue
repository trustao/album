<template>
  <container title="选择模仿对象" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div scroll-y class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-y scroll-x class="kinds">
          <ul class="kinds-wrap">
            <li class="kinds-item" v-for="(cate, key) in kinds" :data-cate="cate" :key="key" @tap="changeKinds(cate)" :class="{active: curkinds === cate}">{{cate}}</li>
          </ul>
        </scroll-view>
        <swiper class="stencils"
                :current="currentIndex"
                id="stencils"
                @change="swiperChange">
          <swiper-item v-for="(cate, key) in kindsData" :key="key">
            <scroll-view scroll-y class="stencils-scroll">
              <ul class="stencil-list" >
                <li class="stencil-item" v-for="(item, index) in cate" :key="index" :data-stencil="item" @tap="chooseImg(item)">
                  <img mode="aspectFit" class="stencil-img" :data-stencil="item" :src="item.full_icon_url" alt="">
                  <p v-text="item.icon_name"></p>
                  <!--<div class="btn" @tap="chooseImg(item)">模仿</div>-->
                </li>
                <li class="stencil-item no-style" v-for="item in (3 - (cate.length % 3 || 3))" :key="item"></li>
                <li class="stencil-item" v-for="(item, index) in debugImg" :key="index">
                  <img mode="aspectFit" class="stencil-img" :data-stencil="item" :src="item" alt="">
                </li>
              </ul>
            </scroll-view>
          </swiper-item>
        </swiper>

      </div>
    </div>
  </container>
</template>

<script>
/* global getCurrentPages */
const API = 'https://api.pintuxiangce.com/icon/index'
import icon from '@/images/ic_changePic.png'
import events from '../../../static/events'

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
      maskPath: ''
    }
  },
  computed: {
    photoStyle () {
      return `translate(${~~this.translateX}px, ${~~this.translateY}px) scale(${this.scale})`
    }
  },
  methods: {
    chooseImg ({full_icon_url}) {
      this.maskPath = full_icon_url
      console.log(full_icon_url)
      this.$nextTick(() => {
        const url = '../camera/main'
        wx.navigateTo({ url })
      })
    },
    getStencil (noChange) {
      wx.request({
        url: API,
        success: (res) => {
          const category = {}
          const kinds =[]
          const kindsData = []
          res.data.data.forEach(item => {
            if (category[item.category_name || item.category_id]) {
              category[item.category_name || item.category_id].push(item)
            } else {
              category[item.category_name || item.category_id] = [item]
            }
          })
          Object.keys(category).forEach(key => {
            kinds.push(key)
            kindsData.push(category[key])
          })
          this.kinds = kinds
          this.kindsData = kindsData
          this.changeKinds(this.kinds[this.currentIndex])
          if (noChange) return
          // if (this.photoContentWidth) {
          //   this.changeStencilPng(this.kindsData[0][0])
          //   this.changeKinds(this.kinds[0])
          // } else {
          //   const unWatch = this.$watch('photoContentWidth',() => {
          //     this.changeStencilPng(this.kindsData[0][0])
          //     this.changeKinds(this.kinds[0])
          //     unWatch()
          //   })
          // }
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
    events.$off('getMaskPath')
    events.$on('getMaskPath', () => {
      return this.maskPath
    })
  },
  onShow () {
    // this.getStencil(true)
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
    padding-top: 68rpx;
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
      justify-content: space-between;
      background: #fff;
      padding-bottom: 120rpx;
      .stencil-item{
        box-sizing: border-box;
        position: relative;
        width: 33.2vw;
        height: 33.2vw;
        white-space: normal;
        word-break: break-all;
        text-align: center;
        background: #3D4042;
        border-collapse: collapse;
        margin-top: 3rpx;
        &.no-style{
          background: #fff;
          border: none;
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
