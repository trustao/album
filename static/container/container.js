// components/container.js
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
      console.log(ev)
      var x = ev.detail.x
      var y = ev.detail.y
      if (x > 5 && x < 25 && y > this.data.size.h - 30) {
        wx.navigateBack()
      }
    },
    drawHeader () {
      this.getSize().then((size) => {
        this.setData({
          size: size
        })
        var y = size.h - 10
        var ctx = wx.createCanvasContext('head-cvs', this)
        ctx.beginPath()
        ctx.setLineCap('round')
        ctx.setLineWidth(2)
        ctx.setStrokeStyle('#333')
        if (this.data.background !== 'none') {
          console.log('draw bg')
          ctx.setFillStyle(this.data.background)
          ctx.fillRect(0, 0, size.w, size.h)
        }
        if (!this.data.noBack) {
          ctx.moveTo(23, y)
          ctx.lineTo(15, y - 8)
          ctx.lineTo(23, y - 16)
          ctx.stroke()
        }
        ctx.setFontSize(17)
        ctx.setTextBaseline('bottom')
        ctx.setFillStyle('#333')
        var textW = ctx.measureText(this.data.title).width
        ctx.fillText(this.data.title, (size.w - textW) / 2, y + 2)
        ctx.draw()
      })
    },
    getSize () {
      return new Promise((resolve, reject) => {
        wx.createSelectorQuery().in(this).select('#header').fields({
          computedStyle: ['width', 'height']
        }, function (res) {
          resolve({
            w: parseInt(res.width),
            h: parseInt(res.height)
          })
        }).exec()
      })
    }
  },
  attached () {
    var pages = getCurrentPages()
    console.log(pages)
    if (pages.length > 1) {
      this.setData({
        noBack: false
      })
    }
    if (this.properties.background === 'none') {
      this.setData({
        noBackground: true
      })
    }
  },
  ready () {
    this.drawHeader()
  }
})
