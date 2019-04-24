<template>
  <container title="keke模仿秀" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-y class="stencils-scroll">
          <ul class="stencil-list">
            <li class="stencil-item" v-for="(item, index) in list" :key="index">
              <img mode="aspectFit" data-img class="stencil-img" :data-stencil="item" @tap="dblTap(item)" :src="item.full_icon_url">
              <div class="btn">
                <img class="heart" :src="item.zan"  @tap="zan(item)">
              </div>
            </li>
          </ul>
        </scroll-view>
        <div class="submit">
          <p @tap="goNextPage">我要秀</p>
          <button open-type="contact" class="question">
            <img :src="quesIcon" alt="">
          </button>
        </div>
      </div>
    </div>
  </container>
</template>

<script>
  /* global getCurrentPages */

  const API = 'https://api.pintuxiangce.com/icon/index'
  import heart from '@/images/ic_heart1.png'
  import heartRed from '@/images/ic_heart2.png'
  import quesIcon from '@/images/ic_feedback.png'
  import events from '../../../static/events'
  let jumping = false
  let lastTime = 0
  export default {

    data () {
      return {
        heart,
        heartRed,quesIcon,
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
      dblTap (item) {
        const now = Date.now()
        if (now - lastTime < 300) {
          this.zan(item)
        }
        lastTime = now
      },
      zan (item) {
        const id = item.icon_id
        const index = this.heartArr.indexOf(id)
        if (index >= 0) {
          this.heartArr.splice(index, 1)
          item.zan = this.heart
        } else {
          item.zan = this.heartRed
          this.heartArr.push(id)
        }
        console.log(index, this.heartArr)
        wx.setStorage({
          key: 'heartArr',
          data: JSON.stringify(this.heartArr)
        })
      },
      goNextPage () {
        const url = '../home/main'
        wx.navigateTo({ url })
      },
      getStencil (noChange) {
        wx.request({
          url: API,
          success: (res) => {
            this.list = res.data.data.filter(item => {
              if (item.category_id == 30) item.zan = this.heartArr.indexOf(item.icon_id) >= 0 ? this.heartRed : this.heart
              return item.category_id == 30
            }).sort((a, b) => b.icon_id - a.icon_id)
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
        success: (res) => {
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
    background: #eee;
    &.iphoneX{
      .btns{
        bottom: 60rpx;
      }
    }
    .submit {
      position: absolute;
      bottom: 120rpx;
      left: 0;
      width: 100%;
      .question {
        position: absolute;
        top: 0;
        right: 40rpx;
        background: transparent;
        border: none;
        &:after {
          display: none;
        }
        img {
          width: 88rpx;
          height: 88rpx;
        }
      }
      p{
        width:240rpx;
        height:88rpx;
        line-height: 84rpx;
        background:rgba(255,226,0,1);
        border-radius:22px;
        border:1px solid rgba(0,0,0,1);
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
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
        padding-bottom: 140rpx;
        .stencil-item{
          box-sizing: border-box;
          position: relative;
          width: 100vw;
          overflow: hidden;
          white-space: normal;
          word-break: break-all;
          text-align: center;
          background: #3D4042;
          border-collapse: collapse;
          margin-top: 20rpx;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
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
</style>
