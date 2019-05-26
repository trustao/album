<template>
  <container title="keke模仿秀" background="#FFE200">
    <div class="tip" v-if="needTip" @tap="clearTip">
      <img :src="TIP" alt="">
    </div>
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <ul class="kinds-wrap">
        <li class="kinds-item" v-for="(cate, key) in kinds" :id="'k' + key" :data-cate="cate" :key="key" @tap="changeKinds(cate)" :class="{active: curkinds === cate}">{{cate}}</li>
      </ul>
      <div class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <swiper class="stencils"
                :current="currentIndex"
                id="stencils"
                @change="swiperChange">
          <swiper-item :key="0">
            <refresh @refresh="refresh('A')" id="refreshA">
              <ul class="stencil-list wonderful">
                <li class="stencil-item" v-for="(item, index) in wonderfulList" :id="(index === wonderfulList.length - preLoadingCount) ? 'wonderful-loading' : ''" :key="index"  @tap="dblTap(item)">
                  <img mode="aspectFit" data-img class="stencil-img" :data-imgid="item.icon_id" :data-stencil="item" :src="item.full_icon_url">
                  <div class="btn"  @tap="zan(item)">
                    <img class="heart" :src="item.zan">
                    <div class="count">{{item.icon_good_num}}</div>
                  </div>
                </li>
              </ul>
            </refresh>
          </swiper-item>
          <swiper-item :key="1">
            <refresh @refresh="refresh('B')" id="refreshB">
              <ul class="stencil-list">
                <li class="stencil-item" v-for="(item, index) in newList" :key="index" :id="(index === newList.length - preLoadingCount) ? 'new-loading' : ''">
                  <img mode="aspectFit" data-img class="stencil-img" :data-imgid="item.icon_id" @tap="choosePreview(item)" :data-stencil="item" :src="item.full_icon_url">
                  <div class="btn">
                    <img class="heart" :src="item.zan">
                    <div class="count">{{item.icon_good_num}}</div>
                  </div>
                </li>
                <li class="stencil-item no-style" v-if="newList.length % 2"></li>
              </ul>
            </refresh>
          </swiper-item>
        </swiper>

        <div class="submit">
          <p @tap="goNextPage">
            我要秀
          </p>
          <button open-type="contact" class="question">
            <img :src="quesIcon" alt="">
          </button>
          <button open-type="share" class="share">
            <img :src="shareIcon" alt="">
          </button>
          <img class="create-tip" v-if="needCreateTip" :src="createTipIcon" alt=""  @tap.stop="clearCreateTip">
          <img class="photo-share-tip" v-if="photoShare" :src="alert4" alt=""  @tap.stop="clearPhotoShareTip">
        </div>
      </div>
      <cover-view class="preview-mask" v-if="previewData" @tap="closePreview">
        <cover-view class="preview" @tap.stop="">
          <cover-image mode="aspectFit" data-img class="stencil-img" :data-imgid="previewData.icon_id" :data-stencil="previewData" @tap="dblTap(previewData)"  :src="previewData.full_icon_url" />
          <cover-view class="btn"  @tap="zan(previewData)">
            <cover-image class="heart" :src="previewData.zan" />
            <cover-view class="count">{{previewData.icon_good_num}}</cover-view>
          </cover-view>
        </cover-view>
      </cover-view>
    </div>
  </container>
</template>

<script>
  /* global getCurrentPages */

  const API = 'https://api.pintuxiangce.com/icon/index'
  // import heart from '@/images/ic_heart1.png'
  // import heartRed from '@/images/ic_heart2.png'
  import quesIcon from '@/images/ic_feedback.png'
  import shareIcon from '@/images/ic_share.png'
  import TIP from '@/images/tip.png'
  import alert4 from '@/images/alert4.png'
  import createTipIcon from '@/images/createTipIcon.png'
  import events from '../../../static/events'
  let jumping = false
  let lastTime = 0
  let wNode = null
  let nNode = null
  let touching = false
  export default {
    data () {
      return {
        scrollTop: 0,
        swa: false,
        TIP,
        heart: 'https://api.pintuxiangce.com/resources/uploads/icons/58b5d98a57709892019a8f6405c3fd47.png',
        heartRed: 'https://api.pintuxiangce.com/resources/uploads/images/8e16130788fcdb4eb2aae6060bd05437.png',
        quesIcon,shareIcon,createTipIcon, alert4,
        curPlay: null,
        kinds: ['精选', '最新'],
        heartArr: [],
        iphoneX: false,
        viewW: 0,
        viewH: 0,
        left: 0,
        top: 0,
        list: [],
        listB: [],
        pageSize: 8,
        preLoadingCount: 2,
        wonderfulPage: 1,
        newPage: 1,
        needTip: false,
        needCreateTip: false,
        previewData: null,
        currentIndex: 0,
        curkinds: '精选',
        photoShare: false
        // refreshShow: false
      }
    },
    computed: {
      wonderfulList () {
        return this.list.slice(0, this.wonderfulPage * this.pageSize)
      },
      newList () {
        return this.listB.slice(0, this.newPage * this.pageSize)
      }
    },
    methods: {
      observeNode (querStr, fn) {
        const observe = wx.createIntersectionObserver()
        observe.relativeToViewport({bottom: 10}).observe(querStr, (res) => {
          fn && fn(res)
        })
        return observe
      },
      clearPhotoShareTip () {

      },
      swiperChange (ev){
        this.currentIndex = ev.target.current
        this.changeKinds(this.kinds[this.currentIndex])
      },
      changeKinds (val) {
        if (!val) return
        this.curkinds = val
        this.currentIndex = this.kinds.indexOf(val)
      },
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
      clearCreateTip () {
        this.needCreateTip = false
        wx.setStorage({
          key: 'needCreateTip',
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
          item.icon_good_num--
          wx.request({
            url: 'https://api.pintuxiangce.com/icon/unlike?id=' + id,
            success: (res) => {},
            fail: () => {}
          })
        } else {
          item.zan = this.heartRed
          this.heartArr.push(id)
          item.icon_good_num++
          wx.request({
            url: 'https://api.pintuxiangce.com/icon/like?id=' + id,
            success: (res) => {},
            fail: () => {}
          })

        }
        wx.setStorage({
          key: 'zanArr',
          data: JSON.stringify(this.heartArr)
        })
      },
      goNextPage () {
        this.clearCreateTip()
        const url = '../home/main'
        wx.navigateTo({ url })
      },
      getStencil (cb) {
        wx.request({
          url: API,
          success: (res) => {
            this.list = res.data.data.filter(item => {
              if (item.category_id == 32) item.zan = this.heartArr.indexOf(item.icon_id) >= 0 ? this.heartRed : this.heart
              return item.category_id == 32 && item.icon_choice == 1
            }).sort((a, b) => new Date(b.icon_created_at).getTime() - new Date(a.icon_created_at).getTime())
            this.listB = res.data.data.filter(item => {
              if (item.category_id == 32) item.zan = this.heartArr.indexOf(item.icon_id) >= 0 ? this.heartRed : this.heart
              return item.category_id == 32 && item.icon_choice == 0
            }).sort((a, b) => new Date(b.icon_created_at).getTime() - new Date(a.icon_created_at).getTime())
            typeof cb === 'function' && cb()
            this.$nextTick(() => {
              this.lazyLoad()
            })
          }
        })
      },
      lazyLoad () {
        console.log(nNode, wNode)
        nNode && nNode.disconnect()
        wNode && wNode.disconnect()
        setTimeout(() => {
          const obFn = () => {
            console.log('newLoading in', nNode)
            nNode && nNode.disconnect()
            if (this.newList.length < this.listB.length) {
              this.newPage++
              setTimeout(() => {
                nNode = this.observeNode('#new-loading', obFn)
              }, 200)
            }
          }
          const obFn2 = () => {
            console.log('wonderful in')
            wNode && wNode.disconnect()
            if (this.wonderfulList.length < this.list.length) {
              this.wonderfulPage++
              setTimeout(() => {
                wNode = this.observeNode('#wonderful-loading', obFn2)
              }, 200)
            }
          }
          nNode = this.observeNode('#new-loading', obFn)
          wNode = this.observeNode('#wonderful-loading', obFn2)
        }, 300)
      },
      refresh (pos) {
        this.getStencil(() => {
          this[`${pos === 'A' ? 'wonderful' : 'new'}Page`] = 1
          this.$mp.page.selectComponent("#refresh" + pos).fetchEnd()
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
    mounted () {
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
        key: 'needCreateTip',
        success: (res) => {
          this.needCreateTip = !res.data
        },
        fail: (re) =>{
          this.needCreateTip = true
        }
      })
      wx.getStorage({
        key: 'zanArr',
        success: (res) => {
          this.heartArr = JSON.parse(res.data) || []
        }
      })
      events.$on('refreshList', () => {
        this.currentIndex = 1
        this.changeKinds(this.kinds[this.currentIndex])
        setTimeout(() => {
          try {
            this.$mp.page.selectComponent("#refreshB").startRefresh()
          } catch (e) {
            ;
          }
          this.refresh('B')
        }, 500)
      })
    },
    onReady() {
      console.log(this)
    },
    onShow () {
      // this.getStencil(true)
      wx.getStorage({
        key: 'photoShare',
        success: (res) => {
          const photoShare = JSON.parse(res.data) || false
          wx.getStorage({
            key: 'photoCount',
            success: (res) => {
              const photoCount = JSON.parse(res.data) || 0
              this.photoShare = photoCount && photoShare
            }
          })
        }
      })

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
    background: #EAEBED;
    display: flex;
    flex-direction: column;
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
      .question, .share {
        position: absolute;
        top: 0;
        right: -2rpx;
        background: transparent;
        border: none;
        z-index: 99;
        &:after {
          display: none;
        }
        img {
          width: 88rpx;
          height: 88rpx;
        }
      }
      .share {
        top: -120rpx;
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
        font-size: 38rpx;
      }
      .create-tip {
        position: absolute;
        width: 560rpx;
        height: 94rpx;
        left: 50%;
        top: -104rpx;
        transform: translateX(-50%);
        z-index: 999;
      }
      .photo-share-tip {
        position: absolute;
        width: 446rpx;
        height: 94rpx;
        right: 10rpx;
        top: -224rpx;
        z-index: 999;
      }
    }
    .cvs-operation{
      position: relative;
      box-sizing: border-box;
      width: 100vw;
      background: #EAEBED;
      flex: 1;
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
        align-items: flex-start;
        align-content: flex-start;
        padding-bottom: 140rpx;
        background: #EAEBED;
        &.wonderful {
          padding-left: 100rpx;
          padding-right: 100rpx;
          .stencil-item {
            width: 550rpx;
            height: auto;
            .stencil-img {
              width: 550rpx;
              height: 550rpx;
            }
            .btn {
              height: 88rpx;
              .heart {
                width: 56rpx;
                height: 50rpx;
              }
              .count {
                font-size: 44rpx;
              }
            }
          }
        }
        .stencil-item{
          box-sizing: border-box;
          position: relative;
          width: 48.5vw;
          overflow: hidden;
          white-space: normal;
          word-break: break-all;
          text-align: center;
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
            height: 48.5vw;
            margin: 0;
            padding: 0;
          }
          .btn {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 60rpx;
            background: #fff;
            .heart {
              width: 40rpx;
              height: 36rpx;
            }
            .count {
              font-size: 30rpx;
              margin-left: 8rpx;
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
      width: 550rpx;
      margin: auto;
      .stencil-img{
        display: block;
        box-sizing: border-box;
        width: 550rpx;
        height: 550rpx;
        margin: 0;
        padding: 0;
      }
      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 550rpx;
        height: 88rpx;
        background: #fff;
        .heart {
          width: 56rpx;
          height: 50rpx;
        }
        .count {
          font-size: 44rpx;
          margin-left: 8rpx;
        }
      }
    }
  }

  .kinds-wrap{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 68rpx;
    margin-bottom: 0rpx;
    background: #FFE200;
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
</style>
