import Vue from 'vue'
import App from './index'

const app = new Vue(App)
app.$mount()

export default {
  config: {
    "disableScroll": true,
    usingComponents: {
      'container': '/static/container/container',
      'refresh': '/static/container/refreshB/index'
    }
  }
}
