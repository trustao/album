// static/container/refresh/index.js
const INIT_HEIGHT = 40

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    INIT_HEIGHT,
    scrollAnimation: false,
    fetching: false,
    showRefreshHead: true,
    scrollTop: 0,
    refreshShow: true,
    headHeight: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    upper () {

    },
    scrollHandler (ev) {

    },
    touchendHanlder () {
      if (this.data.fetching) return
      if (this.data.headHeight === INIT_HEIGHT) {
        this.triggerEvent("refresh")
        this.fetchStartTime = Date.now()
        this.setData({
          fetching: true
        })
      } else {
        if (this.data.headHeight > 0) {
          this.setData({
            headHeight: 0
          })
        }
      }
    },
    touchstartHanlder (ev) {
      wx.createSelectorQuery().in(this).select('.refresh-content').boundingClientRect((rect) => {
        if (rect.top === this.contentTop) {
          this.readyRefresh = true
          this.startTouchY = ev.changedTouches[0].clientY
        }
      }).exec()
    },
    touchmoveHandler (ev) {
      if (this.data.fetching) return
      if (this.readyRefresh) {
        const h = ev.changedTouches[0].clientY - this.startTouchY
        if (h <= 0) return
        this.setData({
          headHeight: h >= INIT_HEIGHT ? INIT_HEIGHT : h
        })
      }
    },
    startRefresh () {
      this.fetchStartTime = Date.now()
      this.setData({
        fetching: true,
        headHeight: INIT_HEIGHT
      })
    },
    fetchEnd () {
      if (this.fetchStartTime && Date.now() - this.fetchStartTime < 1000) {
        setTimeout(() => {
          this.setData({
            fetching: false,
            headHeight: 0,
            scrollTop: 0
          })
        }, 1000 - Date.now() - this.fetchStartTime)
        return
      }
      this.setData({
        fetching: false,
        headHeight: 0,
        scrollTop: 0
      })
    },
  },


  // onLoad() {
  //   this._observer = wx.createIntersectionObserver(this)
  //   this._observer
  //     .relativeTo('.refresh-scroll')
  //     .observe('.refresh-content', (res) => {
  //       console.log(res);
  //       // this.setData({
  //       //   appear: res.intersectionRatio > 0
  //       // })
  //     })
  // },
  onUnload() {
    // if (this._observer) this._observer.disconnect()
  },
  attached () {
    setTimeout(() => {
      wx.createSelectorQuery().in(this).select('.refresh-content').boundingClientRect((rect) => {
        this.contentTop = rect.top
        console.log(rect.top)
      }).exec()
    }, 100)
    this.setData({
      scrollAnimation: true
    })
  }
})
