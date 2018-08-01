<template>
  <container title="保存">
    <div class="wrap">
      <swiper
        :indicator-dots="true"
        :autoplay="true"
        :circular="true"
        indicator-active-color="#FFE200"
        :interval="5000"
        class="banner"
      >
        <template v-for="item in imgUrls">
          <swiper-item>
            <img class="img" :src="item.url" :style="{height: item.height + 'px'}"/>
          </swiper-item>
        </template>
      </swiper>
      <div class="bottom">
        <button class="btn" @click="save">save</button>
        <button class="btn share" open-type="share" @click="share">share</button>
        <p @click="backHome">回到首页</p>
      </div>
    </div>
  </container>
</template>

<script>
import card from '@/components/card'

export default {
  data () {
    return {
      imgUrls: [
        {
          url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
          height: 240
        },
        {
          url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
          height: 240
        },
        {
          url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg',
          height: 320
        },
        {
          url: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1873627548,2118672923&fm=27&gp=0.jpg',
          height: 400
        }
      ]
    }
  },

  components: {
    card
  },

  methods: {
    save () {
      const url = '../choose-stencil/main'
      wx.navigateTo({ url })
    },
    share () {
      const url = '../choose-stencil/main'
      wx.navigateTo({ url })
    },
    backHome () {
      const url = '../index/main'
      wx.reLaunch({ url })
    }
  },

  created () {
    // 调用应用实例的方法获取全局数据
  },
  mounted () {
  },
  onShareAppMessage() {
    return {
      title: '自定义转发标题',
      path: '/pages/index/main'
    }
  }
}
</script>

<style lang="less" scoped>
  .wrap{
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 20rpx 60rpx;
    .banner{
      width: 100%;
      height: 800rpx;
      overflow: hidden;
      .img{
        position: relative;
        width: 100%;
        height: auto;
        top: 50%;
        left: 0;
        border-radius: 20rpx;
        transform: translateY(-50%);
      }
    }
    .bottom{
      position: fixed;
      bottom: 30rpx;
      left: 0;
      width: 100%;
      text-align: center;
      .btn {
        display: inline-block;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: 1px solid;
        border-radius: 44rpx;
        width: 42vw;
        height: 90rpx;
        line-height: 90rpx;
        font-size: 32rpx;
        background: #FFE200;
        &.share{
          margin-left: 30rpx;
          background: #DEDEDE;
        }
      }
      p{
        font-size: 26rpx;
        color: #aaa;
      }
    }
  }

</style>
