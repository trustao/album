// static/container/refresh/index.js
const INIT_HEIGHT = 80
let currentScrollTop = INIT_HEIGHT
let time = null
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
    scrollAnimation: false,
    fetching: false,
    showRefreshHead: true,
    scrollTop: INIT_HEIGHT,
    refreshShow: true,
    headHeight: INIT_HEIGHT
  },

  /**
   * 组件的方法列表
   */
  methods: {
    upper () {

    },
    scrollHandler (ev) {
      console.log('scroll', ev.detail.scrollTop)
      currentScrollTop = ev.detail.scrollTop
      if (this.data.showRefreshHead && currentScrollTop > INIT_HEIGHT) {
        this.setData({
          showRefreshHead: false,
          scrollAnimation: false
        })
      }
      clearTimeout(time)
      time = setTimeout(() => {
        wx.createSelectorQuery().in(this).select('.refresh-content').boundingClientRect((rect) => {
          console.log(rect.top, this.contentTop)
          if (rect.top === this.contentTop && !this.data.showRefreshHead) {
            this.setData({
              showRefreshHead: true
            })
            this.setData({
              scrollTop: INIT_HEIGHT,
              scrollAnimation: true
            })
          }
        }).exec()
      }, 200)
    },
    touchendHanlder () {
      if (currentScrollTop > 0 && currentScrollTop < INIT_HEIGHT && !this.data.fetching && this.data.showRefreshHead) {
        this.setData({
          scrollTop: INIT_HEIGHT
        })
      }
    },
    touchstartHanlder () {

      // if (!this.data.showRefreshHead && currentScrollTop === 0) {

      // }
    }
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
