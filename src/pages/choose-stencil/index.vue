<template>
  <container title="拼图相册Pintu">
    <div class="stencil-container">
      <ul class="stencil-list">
        <li class="stencil-item" v-for="item in svg.name" :key="item" @click="bindViewTap(item)">
          <img class="stencil-img" :src="base64Svg[item]" alt="">
        </li>
      </ul>
    </div>
  </container>
</template>

<script>
/* global getCurrentPages */
import svg from '@/images/stencil/svg.json'
import ballet from '@/images/stencil/ballet.svg'
import cat from '@/images/stencil/cat.svg'
import family from '@/images/stencil/family.svg'
import heart from '@/images/stencil/heart.svg'
import michaelJackson from '@/images/stencil/michael_jackson.svg'
import wedding from '@/images/stencil/wedding.svg'
import wedding2 from '@/images/stencil/wedding2.svg'
import worldTravel from '@/images/stencil/world_travel.svg'
import yoga from '@/images/stencil/yoga.svg'

export default {
  data () {
    return {
      svg,
      base64Svg: {
        ballet,
        cat,
        family,
        heart,
        wedding,
        wedding2,
        yoga,
        world_travel: worldTravel,
        michael_jackson: michaelJackson,
        rePick: false
      }
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
        wx.redirectTo({
          url: '../puzzle/main?name=' + stencil
        })
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
