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
    },
    needUser: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iphoneX: false,
    iphone5: false,
    plus: false,
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
    const sysInfo = wx.getSystemInfoSync()
    this.setData({
      iphoneX: sysInfo.model.indexOf('iPhone X') >= 0,
      iphone5: sysInfo.model.indexOf('iPhone 5') >= 0,
      plus: sysInfo.model.indexOf('Plus') >= 0
    })
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
