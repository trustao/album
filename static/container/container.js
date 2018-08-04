// components/container.js
import events from '../events.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    background: {
      type: String,
      value: '#FAFAFA'
    },
    title: {
      type: String,
      value: ''
    },
    beforeBack: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iphoneX: wx.getSystemInfoSync().model.indexOf('iPhone X') >= 0,
    noBack: true,
    noBackground: false,
    size: {w: 0, h: 0}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    back: function (ev) {
      if (this.data.beforeBack) {
        events.$emit(this.data.beforeBack, () => {
          wx.navigateBack()
        })
        return
      }
      wx.navigateBack()
    }
  },
  attached () {
    var pages = getCurrentPages()
    if (pages.length > 1) {
      this.setData({
        noBack: false
      })
    } else {
      this.setData({
        noBack: true
      })
    }
    if (this.properties.background === 'none') {
      this.setData({
        noBackground: true
      })
    }
    console.log(this.data.noBack)
  }
})
