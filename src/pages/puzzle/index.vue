<template>
  <div class="cvs-wrap">
    <canvas class="cvs" canvas-id="puzzle"></canvas>
    <canvas class="cvs" canvas-id="puzzle-mask"></canvas>
  </div>
</template>

<script>
import { formatTime } from '@/utils/index'
import card from '@/components/card'

export default {
  components: {
    card
  },

  data () {
    return {
      ctx: null,
      maskCtx: null
    }
  },
  methods: {
    cvsInit () {
      this.ctx = wx.createCanvasContext('puzzle')
      this.maskCtx = wx.createCanvasContext('puzzle-mask')
    }
  },
  created () {
    const logs = (wx.getStorageSync('logs') || [])
    this.logs = logs.map(log => formatTime(new Date(log)))
  },
  mounted () {
    this.cvsInit()
  }
}
</script>

<style lang="less">
.cvs-wrap{
  position: relative;
  width: 100vw;
  height: 100vh;
  .cvs{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
