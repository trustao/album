import Vue from 'vue'
import App from './index'

const app = new Vue(App)
app.$mount()

export default {
  config: {
    navigationBarTitleText: '',
    "disableScroll": true,
    usingComponents: {
      'container': '/static/container/container'
    }
  }
}
