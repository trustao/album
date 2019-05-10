<template>
  <container title="keke模仿秀" background="#FFE200">
    <div class="tip" v-if="needTip" @tap="clearTip">
      <img :src="TIP" alt="">
    </div>
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <refresh @refresh="refresh" id="refreshA">
          <ul class="stencil-list" id="list">
            <li class="stencil-item" v-for="(item, index) in list" :key="index">
              <img mode="aspectFit" data-img class="stencil-img" :data-imgid="item.icon_id" @tap="choosePreview(item)" :data-stencil="item" :src="item.full_icon_url">
            </li>
          </ul>
        </refresh>
        <div class="submit">
          <p @tap="goNextPage">我要秀</p>
          <button open-type="contact" class="question">
            <img :src="quesIcon" alt="">
          </button>
        </div>
      </div>
      <div class="preview-mask" v-if="previewData" @tap="closePreview">
        <div class="preview" @tap.stop="">
          <img mode="aspectFit" data-img class="stencil-img" :data-imgid="previewData.icon_id" :data-stencil="previewData" @tap="dblTap(previewData)"  :src="previewData.full_icon_url">
          <div class="btn">
            <img class="heart" :src="previewData.zan"  @tap="zan(previewData)">
          </div>
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
  import shareIcon from '@/images/ic_share.png'
  import TIP from '@/images/tip.png'
  import events from '../../../static/events'
  let jumping = false
  let lastTime = 0

  let touching = false
  export default {
    data () {
      return {
        scrollTop: 0,
        swa: false,
        TIP,
        heart,
        heartRed,quesIcon,shareIcon,
        curPlay: null,
        kinds: [],
        heartArr: [],
        iphoneX: false,
        viewW: 0,
        viewH: 0,
        left: 0,
        top: 0,
        list: [],
        needTip: false,
        previewData: null,
        // refreshShow: false
      }
    },
    methods: {
      choosePreview (item) {
        this.previewData = item
      },
      closePreview () {
        this.previewData = null
      },
      clearTip () {
        console.log(this.needTip)
        this.needTip = false
        wx.setStorage({
          key: 'notTip',
          data: 1
        })
      },
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
        wx.setStorage({
          key: 'heartArr',
          data: JSON.stringify(this.heartArr)
        })
      },
      goNextPage () {
        const url = '../home/main'
        wx.navigateTo({ url })
      },
      getStencil (cb) {
        wx.request({
          url: API,
          success: (res) => {
            this.list = res.data.data.filter(item => {
              if (item.category_id == 30) item.zan = this.heartArr.indexOf(item.icon_id) >= 0 ? this.heartRed : this.heart
              return item.category_id == 30
            }).reverse()
            typeof cb === 'function' && cb()
          }
        })
      },
      refresh () {
        this.getStencil(() => {
          this.$mp.page.selectComponent("#refreshA").fetchEnd()
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
      setTimeout(() => {
        this.refreshShow = true
        this.scrollTop = 40
      }, 6000)
      this.getStencil()
      this.getSysInfo()
      wx.getStorage({
        key: 'notTip',
        success: (res) => {
          this.needTip = !res.data
        },
        fail: (re) =>{
          this.needTip = true
        }
      })
      wx.getStorage({
        key: 'heartArr',
        success: (res) => {
          this.heartArr = JSON.parse(res.data) || []
        }
      })
    },
    onReady() {
      console.log(this)
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
  .tip {
    position: absolute;
    right: 16rpx;
    top: 16rpx;
    width: 468rpx;
    height: 86.5rpx;
    z-index: 9999;
    img {
      width: 100%;
      height: 100%;
    }
  }
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
        min-height: 110vh;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        padding-bottom: 140rpx;
        .stencil-item{
          box-sizing: border-box;
          position: relative;
          width: 48.5vw;
          height: 48.5vw;
          overflow: hidden;
          white-space: normal;
          word-break: break-all;
          text-align: center;
          border-collapse: collapse;
          margin-top: 10rpx;
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

  .preview-mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, .8);
    display: flex;
    justify-content: center;
    align-items: center;
    .preview {
      width: 100vw;
      .stencil-img{
        display: block;
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
    }
  }
</style>
