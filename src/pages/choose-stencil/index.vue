<template>
  <div class="stencil-container">
    <ul class="stencil-list">
      <li class="stencil-item" v-for="item in svg.name" :key="item" @click="bindViewTap(item)">
        {{item}}
        <img class="stencil-img" :src="'/static/stencil/' + item + '.png'" alt="">
      </li>
    </ul>
  </div>
</template>

<script>
import svg from '@/images/stencil/svg.json'

export default {
  data () {
    return {
      svg
    }
  },

  methods: {
    bindViewTap (stencil) {
      const url = '../choose-img/main?name=' + stencil
      wx.navigateTo({
        url
      })
    },
    clickHandle (msg, ev) {
      console.log('clickHandle:', msg, ev)
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
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10rpx;
    .stencil-item{
      position: relative;
      width: 25vw;
      height: 25vw;
      border: 1px solid;
      white-space: normal;
      word-break: break-all;
      text-align: center;
      margin-bottom: 20rpx;
      .stencil-img{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -40%);
        width: 60%;
        height: 60%;
      }
    }
  }
}
</style>
