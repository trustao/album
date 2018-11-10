<template>
  <container title="keke" background="#FFE200">
      <div class="list-wrap">
        <div class="item" v-for="item in list" :key="item.template_id">
          <img :src="item.full_img_url" alt="" mode="aspectFit">
          <div class="name">{{item.template_name}}</div>
          <div class="btn" @click="goEditPage(item)">拍同款</div>
        </div>
      </div>
      <div class="footer-btn" @click="goEditPage('')">创作你的四格故事</div>
  </container>
</template>

<script>
import events from '../../../static/events'
import  img1 from '@/images/1.jpg'
import  img2 from '@/images/2.jpg'
import  img3 from '@/images/3.jpg'

const TEMPLATET_LIST_API = 'https://api.pintuxiangce.com/template/index'

export default {
  data () {
    const iphoneX = wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0
    return {
      iphoneX,
      list: [],
      imgUrls: [
        img1, img2, img3
      ],
      activeTemplate: null
    }
  },

  methods: {
    getData () {
      wx.request({
        url: TEMPLATET_LIST_API,
        success: (res) => {
          console.log(res)
          if (res.statusCode === 200) {
            this.list = res.data.data
          }
        }
      })
    },
    goEditPage (template) {
      this.activeTemplate = template
      this.$nextTick(() => {
        const url = '../index/main' + (template && `?id=${template.template_id}`)
        wx.navigateTo({ url })
      })
    }
  },
  created () {
    this.getData()
    events.$off(['getTemplate', 'getTemplateList'])
    events.$on('getTemplate', (cb) => {
      cb(this.activeTemplate)
    })
    events.$on('getTemplateList', () => {
      this.getData()
    })
  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/index/main',
      imageUrl: 'https://img1.doubanio.com/view/photo/l/public/p2536986009.webp'
    }
  }
}
</script>

<style lang="less" scoped>
  .list-wrap{
    position: relative;
    padding: 20rpx 0 220rpx;
    background: #f4f4f4;
    .item{
      background: #fff;
      margin-bottom: 40rpx;
      padding-bottom: 20rpx;
      img{
        width: 100vw;
        height: 100vw;
      }
      .name{
        font-size: 32rpx;
        text-align: center;
        margin: 6px 0;
      }
      .btn{
        display: block;
        margin: 0 auto;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 40rpx;
        width: 252rpx;
        height: 80rpx;
        line-height: 76rpx;
        font-size: 32rpx;
        background: #FFE200;
        text-align: center;
        color: #000;
      }
    }
  }
  .footer-btn{
    position: fixed;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
    background: #FFE200;
    border: 1px solid #000000;
    height: 100rpx;
    width: 100vw;
    line-height: 100rpx;
    font-size: 32rpx;
    text-align: center;
  }
  .wrap{
    width: 100%;
    height: 920rpx;
    text-align: center;
    &:after{
      content: '';
      display: inline-block;
      width: 600rpx;
      height: 0;
      border-bottom: 1px solid #C7C7C7;
    }
    .res-tip{
      padding: 60rpx 0;
      text-align: center;
      p{
        font-size: 36rpx;
        color: #333;
      }
    }
    .bottom{
      width: 100%;
      .btn {
        display: block;
        margin: 0 auto 32rpx;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 2rpx solid;
        border-radius: 44rpx;
        width: 320rpx;
        height: 90rpx;
        line-height: 86rpx;
        font-size: 32rpx;
        background: #FFE200;
        text-align: center;
        color: #000;
        &.share{
          background: transparent;
        }
        &.re{
          background: rgb(251, 14, 55);
          color: #fff;
          border: 2rpx solid #000;
        }
      }
      .contact{
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: none;
        width: 42vw;
        height: 34rpx;
        line-height: 34rpx;
        font-size: 24rpx;
        color: #FF2600;
        margin-top: 12rpx;
        background: transparent;
        &:after{
          display: none;
         }
      }
    }
  }
  .wrap-jump{
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow:hidden;
    h1{
      margin: 40rpx auto;
      font-size: 32rpx;
      color: #333;
      line-height: 44rpx;
      text-align: center;
    }
    .banner{
      margin: auto;
      width: 610rpx;
      height: 840rpx;
      border-radius: 20rpx;
      overflow: hidden;
      .s-item{
        width: 100%;
        height: 100%;
      }
      .img{
        display: block;
        width: 590rpx;
        height: 770rpx;
        border-radius: 20rpx;
        margin: 0 auto;
      }
    }
    .bottom{
      margin-top: 3.6vh;
      width: 100%;
      text-align: center;
      .btn {
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
        margin-bottom: 0.74vh;
      }
      .btns{
        text-align: center;
      }
      .contact{
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: none;
        display: inline;
        height: 34rpx;
        font-size: 28rpx;
        line-height: 34rpx;
        color: #333;
        margin: 30rpx 15rpx;
        background: transparent;
        &:after{
          display: none;
        }
      }
      p{
        font-size: 20rpx;
        color: #868686;
      }
    }
  }

</style>
