import Vue from 'vue'
import App from './index'

const app = new Vue(App)
app.$mount()

export default {
  config: {
    "disableScroll": true,
    usingComponents: {
      'container': '/static/container/container'
    },
    navigationBarTextStyle: 'black',
    navigationBarBackgroundColor: '#FFE200',
    navigationBarTitleText: 'keke模仿秀',
  }
}
