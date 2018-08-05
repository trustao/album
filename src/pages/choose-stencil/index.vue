<template>
  <container title="选择形状模板">
    <div class="stencil-container">
      <ul class="stencil-list">
        <li class="stencil-item" v-for="item in svg.name" :key="item" @click="bindViewTap(item)">
          <img class="stencil-img" :src="base64Svg[item]" alt="">
        </li>
        <li class="stencil-item"></li>
      </ul>
    </div>
  </container>
</template>

<script>
/* global getCurrentPages */
import svg from '@/images/stencil/svg.json'
import svg1 from '@/images/stencil/1.svg'
import svg2 from '@/images/stencil/2.svg'
import svg3 from '@/images/stencil/3.svg'
import svg4 from '@/images/stencil/4.svg'
import svg5 from '@/images/stencil/5.svg'
import svg6 from '@/images/stencil/6.svg'
import svg7 from '@/images/stencil/7.svg'
import svg8 from '@/images/stencil/8.svg'
import svg9 from '@/images/stencil/9.svg'
import svg10 from '@/images/stencil/10.svg'
import svg11 from '@/images/stencil/11.svg'
import svg12 from '@/images/stencil/12.svg'
import svg13 from '@/images/stencil/13.svg'
import svg14 from '@/images/stencil/14.svg'
import svg15 from '@/images/stencil/15.svg'
import svg16 from '@/images/stencil/16.svg'
import svg17 from '@/images/stencil/17.svg'
import svg18 from '@/images/stencil/18.svg'
import svg19 from '@/images/stencil/19.svg'
import svg20 from '@/images/stencil/20.svg'
import svg21 from '@/images/stencil/21.svg'
import svg22 from '@/images/stencil/22.svg'
import svg23 from '@/images/stencil/23.svg'
import svg24 from '@/images/stencil/24.svg'
import svg25 from '@/images/stencil/25.svg'
import svg26 from '@/images/stencil/26.svg'
import svg27 from '@/images/stencil/27.svg'
import svg28 from '@/images/stencil/28.svg'
import svg29 from '@/images/stencil/29.svg'
import svg30 from '@/images/stencil/30.svg'
import svg31 from '@/images/stencil/31.svg'
import svg32 from '@/images/stencil/32.svg'


export default {
  data () {
    return {
      svg,
      base64Svg: {
        '1': svg1,
        '2': svg2,
        '3': svg3,
        '4': svg4,
        '5': svg5,
        '6': svg6,
        '7': svg7,
        '8': svg8,
        '9': svg9,
        '10': svg10,
        '11': svg11,
        '12': svg12,
        '13': svg13,
        '14': svg14,
        '15': svg15,
        '16': svg16,
        '17': svg17,
        '18': svg18,
        '19': svg19,
        '20': svg20,
        '21': svg21,
        '22': svg22,
        '23': svg23,
        '24': svg24,
        '25': svg25,
        '26': svg26,
        '27': svg27,
        '28': svg28,
        '29': svg29,
        '30': svg30,
        '31': svg31,
        '32': svg32
      },
        rePick: false
    }
  },

  methods: {
    bindViewTap (stencil) {
      wx.setStorageSync('stencil', stencil)
      console.log(this.rePick)
      if (!this.rePick) {
        wx.navigateTo({
          url: '../choose-img/main?name=' + stencil
        })
      } else {
        wx.navigateBack()
      }
    },
    clickHandle (msg, ev) {
      console.log('clickHandle:', msg, ev)
    }
  },
  onLoad (options) {
    console.log(options)
    if (options && options.rePick === '1') {
      this.rePick = true
    } else {
      this.rePick = false
    }
  },
  onShow () {
    if (getCurrentPages().length === 1) {
      this.rePick = false
    }
  },
  created () {

  },
  mounted () {

  },
  onShareAppMessage() {
    return {
      title: '形状拼图',
      path: '/pages/index/main',
      imageUrl: 'http://imglf3.nosdn0.126.net/img/Qmx2R2tOVVFNcjB2UDFEZjE3MExrZjkrVTRXZEhPWnhNSTF4K0xYSnNlenJzOEp3UXluaFJRPT0.jpg?imageView&thumbnail=1680x0&quality=96&stripmeta=0&type=jpg'
    }
  }
}
</script>

<style scoped lang="less">
.stencil-container{
  width: 100vw;
  .stencil-list{
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    .stencil-item{
      box-sizing: border-box;
      position: relative;
      width: 33vw;
      height: 33vw;
      white-space: normal;
      word-break: break-all;
      text-align: center;
      margin-bottom: 1px;
      background: #3D4042;
      .stencil-img{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        color: #fff;
      }
    }
  }
}
</style>
