<template>
  <container title="选择模仿对象" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-y class="stencils-scroll">
          <ul class="stencil-list" >
            <li class="stencil-item" v-for="(item, index) in list" :key="index" :data-stencil="item">
              <img mode="aspectFit" class="stencil-img" :data-stencil="item" :src="item.full_icon_url" alt="" @tap="chooseImg(item)">
              <div class="btn">
                <img class="heart" @tap="zan(item.icon_id)" :src="heartArr.includes(item.icon_id) ? heartRed : heart" alt="">
              </div>
            </li>
          </ul>
        </scroll-view>
      </div>
    </div>
  </container>
</template>

<script>
  /* global getCurrentPages */

  const API = 'https://api.pintuxiangce.com/icon/index'
  import heart from '@/images/ic_heart1.png'
  import heartRed from '@/images/ic_heart2.png'
  import events from '../../../static/events'
  let jumping = false
  export default {

    data () {
      return {
        heart,
        heartRed,
        curPlay: null,
        kinds: [],
        heartArr: [],
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
        list: [],
      }
    },
    methods: {
      zan (id) {
        console.log(id)
        const index = this.heartArr.indexOf(id)
        if (index >= 0) {
          this.heartArr.splice(index, 1)
        } else {
          this.heartArr.push(id)
        }
        console.log(index, this.heartArr)
        wx.setStorage({
          key: 'heartArr',
          data: JSON.stringify(this.heartArr)
        })
      },
      getStencil (noChange) {
        wx.request({
          url: API,
          success: (res) => {
            this.list = res.data.data.filter(item => item.category_id == 30)
          }
        })
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
      wx.getStorage({
        key: 'heartArr',
        success(res) {
          this.heartArr = JSON.parse(res.data) || []
        }
      })
    },
    onReady() {
    },
    onShow () {
      // this.getStencil(true)
    },
    onShareAppMessage() {
      return {
        title: 'keke',
        path: '/pages/first/main',
        imageUrl:'https://api.pintuxiangce.com/resources/uploads/icons/24e02e999cedf6d03fd214205c2f732d.jpg'
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
    background: #C6C6C6;
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
      /*padding-top: 68rpx;*/
      z-index: 10;
      &.iphoneX .stencil-list{
        padding-bottom: 168rpx;
      }
      .stencils-scroll{
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .stencil-list{
        box-sizing: border-box;
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        padding: 0 0 40rpx;
        .stencil-item{
          box-sizing: border-box;
          position: relative;
          width: 100vw;
          overflow: hidden;
          white-space: normal;
          word-break: break-all;
          text-align: center;
          background: #fff;
          border-collapse: collapse;
          margin: 8rpx 0 20rpx;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          &:after{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            /*border: 1rpx solid #000;*/
            background: transparent;
          }
          &.no-style{
            background: #fff;
            border: none;
          }
          .stencil-img{
            box-sizing: border-box;
            width: 100%;
            height: 100vw;
            margin: 0;
            padding: 0;
          }
          .btn {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 88rpx;
            background: #fff;
            .heart {
              width: 70rpx;
              height: 60rpx;
            }
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
