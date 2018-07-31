import Vue from 'vue'
import App from './index'

const app = new Vue(App)
app.$mount()

export default {
  config: {
    navigationBarTitleText: '拼图相册',
    usingComponents: {
      'container': '/static/container/container'
    }
  }
}
