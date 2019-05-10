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
    },
    navigationBarTextStyle: 'black',
    navigationBarBackgroundColor: '#FFE200',
    navigationBarTitleText: 'keke模仿秀',
    navigationStyle: 'custom'
  }
}
