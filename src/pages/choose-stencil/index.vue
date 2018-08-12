<template>
  <container title="选择形状模板">
    <div class="stencil-container">
      <ul class="stencil-list" id="stencil">
        <li class="stencil-item" v-for="item in svg.name" :key="item" @click="bindViewTap(item)">
          <img class="stencil-img" :id="item" :src="base64Svg[item]" alt="">
        </li>
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
import svg33 from '@/images/stencil/33.svg'
import svg34 from '@/images/stencil/34.svg'
import svg35 from '@/images/stencil/35.svg'
import svg36 from '@/images/stencil/36.svg'
// import svg37 from '@/images/stencil/37.svg'
import svg38 from '@/images/stencil/38.svg'
// import svg39 from '@/images/stencil/39.svg'
import svg40 from '@/images/stencil/40.svg'
import svg41 from '@/images/stencil/41.svg'
import svg42 from '@/images/stencil/42.svg'
// import svg43 from '@/images/stencil/43.svg'
import svg44 from '@/images/stencil/44.svg'
// import svg45 from '@/images/stencil/45.svg'
import svg46 from '@/images/stencil/46.svg'
import svg47 from '@/images/stencil/47.svg'
import svg48 from '@/images/stencil/48.svg'
import svg49 from '@/images/stencil/49.svg'
import svg50 from '@/images/stencil/50.svg'
import svg51 from '@/images/stencil/51.svg'
import svg52 from '@/images/stencil/52.svg'
import svg53 from '@/images/stencil/53.svg'
// import svg54 from '@/images/stencil/54.svg'
// import svg55 from '@/images/stencil/55.svg'
import svg56 from '@/images/stencil/56.svg'
import svg57 from '@/images/stencil/57.svg'
// import svg58 from '@/images/stencil/58.svg'
// import svg59 from '@/images/stencil/59.svg'
// import svg60 from '@/images/stencil/60.svg'
// import svg61 from '@/images/stencil/61.svg'
// import svg62 from '@/images/stencil/62.svg'
// import svg63 from '@/images/stencil/63.svg'
// import svg64 from '@/images/stencil/64.svg'
// import svg65 from '@/images/stencil/65.svg'
// import svg66 from '@/images/stencil/66.svg'
// import svg67 from '@/images/stencil/67.svg'
// import svg68 from '@/images/stencil/68.svg'
// import svg69 from '@/images/stencil/69.svg'

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
        '32': svg32,
        '33': svg33,
        '34': svg34,
        '35': svg35,
        '36': svg36,
        // '37': svg37,
        '38': svg38,
        // '39': svg39,
        '40': svg40,
        '41': svg41,
        '42': svg42,
        // '43': svg43,
        '44': svg44,
        // '45': svg45,
        '46': svg46,
        '47': svg47,
        '48': svg48,
        '49': svg49,
        '50': svg50,
        '51': svg51,
        '52': svg52,
        '53': svg53,
        // '54': svg54,
        // '55': svg55,
        '56': svg56,
        '57': svg57
        // '58': svg58,
        // '59': svg59,
        // '60': svg60,
        // '61': svg61,
        // '62': svg62,
        // '63': svg63,
        // '64': svg64,
        // '65': svg65,
        // '66': svg66,
        // '67': svg67,
        // '68': svg68,
        // '69': svg69
      },
      rePick: false,
      stencil: ''
    }
  },

  methods: {
    bindViewTap (stencil) {
      this.stencil = stencil
      const pages = getCurrentPages()
      pages[pages.length - 1].setData({
        stencil
      })
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
