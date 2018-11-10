// components/inputText.js
import events from '../events.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bottom: 0,
    inputFocus: false,
    isComplete: false,
    inputText: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    focusHandler: function(ev) {
      this.setData({
        bottom: ev.detail.height + 10,
        show: true
      })
    },
    inputHandler (ev) {
      const { value } = ev.detail
      this.setData({ inputText: value })
    },
    inputBlurHandler: function(ev) {
      setTimeout(() => {
        if (this.data.isComplete) {
          setTimeout(() => {
            this.setData({isComplete: false})
          }, 500)
          return
        }
        this.triggerEvent('inputblur')
      }, 10)
    },
    completeHandler: function(ev) {
      this.setData({isComplete: true})
      this.triggerEvent('inputcomplete', {value: this.data.inputText || ''})
      setTimeout(() => {
        this.setData({inputText: ''})
      })
    }
  },
  attached () {
    events.$on('inputFocus', () => {
      this.setData({
        inputFocus: true
      })
    })
  }
})
