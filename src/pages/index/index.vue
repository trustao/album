<template>
  <container title="创作四格故事" background="#FFE200">
    <div class="cvs-wrap" :class="{'iphoneX': iphoneX}">
      <div class="play-wrap">
        <div class="play-list">
          <div class="play-item" v-for="(item, index) in playList" :key="index" @click="choosePlay(item)" :style="{'border-color': curIndex === index ? '#000' : '#FFE200'}">
            <img class="play-img" mode="aspectFill" :src="item.photoPath" alt="">
            <cover-image class="play-delete" src="/static/ic_delete_2.png" @click.stop="deletePlay(index)"/>
          </div>
        </div>
        <img class="play-add" src="/static/ic_add.png" alt="" @click="addPlay">
      </div>
      <div class="shape-wrap"
           @touchend="touchEndHandler"
           @touchmove="touchMoveHandler">
        <div class="shape-content">
          <img class="shape-img copy" v-if="copy.show" :style="{width: copy.photoW + 'px', height: copy.photoH + 'px', transform: copy.photoStyle}" :src="copy.photoPath" alt="">
          <img class="shape-img" :style="{width: photoW + 'px', height: photoH + 'px', transform: photoStyle}" :src="photoPath" alt="">
          <div class="tip">
            <p>这是第{{curIndexText}}幕</p>
            <p>请点击+图片</p>
          </div>
          <div class="shape-mask" canvas-id="shape-mask" :disable-scroll="true"
               @touchstart="touchStartHandler" @touchend="nullEnd"></div>
          <div class="tie-wrap">
            <img class="tie" v-for="(item, index) in tieList"
                 :key="index"
                 :style="{
                transform: 'translateX(' + item.x + 'px) translateY(' + item.y + 'px) translateZ(1px)  rotate(' + item.rotate + 'deg) scale(' + item.scaleX +
                 ',' + item.scaleY + ')',
                width: item.w + 'px',
                height: item.h + 'px',
                'z-index': item.z
               }"
                 :src="item.path2"
                 @touchend.stop="tieTouchEnd(item, $event)"
                 @touchstart="tieTouchStart(item, $event)"
            >
          </div>
          <div class="tie-text" v-for="(item, index) in textList"
             :id="item.id"
             :key="index"
             @touchend.stop="tieTouchEnd(item, $event)"
             @touchstart="tieTouchStart(item, $event)"
             :style="{
                width: item.w + 'px',
                height: item.h + 'px',
                top: item.t,
                left: item.l,
                transform: 'translateX(' + item.transX + ') translateY(' + item.transY + ') translateZ(1px) rotate(' + item.rotate + 'deg) scale(' + item.scaleX +
                 ',' + item.scaleY + ')',
                'z-index': item.z}">
            <text :id="'inner' + item.id">{{item.value}}</text>
          </div>
        </div>
        <div class="controller-wrap">
          <div class="controller" v-if="tieChanging" :style="{
            width: controller.w + 'px',height: controller.h + 'px',
            'z-index': controller.current.z,
            transform: 'translateX(' + controller.x + 'px) translateY(' + controller.y + 'px) rotate(' + controller.rotate + 'deg) scale(' + controller.scale + ')'
          }" @touchstart="controllerStart" @touchend.stop="controllerEnd">
            <div class="border border-top" :style="{transform: 'scaleY(' + (1 / controller.scale) + ')'}"></div>
            <div class="border border-left" :style="{transform: 'scaleX(' + (1 / controller.scale) + ')'}"></div>
            <div class="border border-bottom" :style="{transform: 'scaleY(' + (1 / controller.scale) + ')'}"></div>
            <div class="border border-right" :style="{transform: 'scaleX(' + (1 / controller.scale) + ')'}"></div>
            <img class="close" :style="{transform: 'scale(' + (1 / controller.scale) + ')'}" src="/static/ic_delete.png" @click="closeHandler"/>
            <img class="reversal" src="/static/ic_reverse.png" v-if="!isText" @click="reversalHandler"/>
            <img class="scale" :style="{transform: 'scale(' + (1 / controller.scale) + ')'}" src="/static/ic_drag.png" @touchstart.stop="scaleHandler"/>
          </div>
        </div>
      </div>
      <inputText :value="inputText" :show="inputShow" @inputblur="inputBlurHandler" @inputcomplete="inputCompleteHandler"></inputText>
      <!--<div class="textarea-wrap" :style="{width: photoW - 10 + 'px', bottom: inputBottom + 'px'}">-->
        <!--<textarea class="textarea" v-if="inputShow" fixed :adjust-position="false" :value="inputText"-->
                  <!--:focus="inputFocus" @blur="inputBlurHandler"/>-->
      <!--</div>-->
      <div scroll-y class="cvs-operation" :class="{'iphoneX': iphoneX}">
        <scroll-view scroll-y scroll-x  @touchstart.stop="fn" @touchend="changeKindsTouchEndHandler" class="kinds">
          <ul class="kinds-wrap">
            <li class="kinds-item" v-for="(cate, key) in kinds" :data-cate="cate" :key="key" :class="{active: curkinds === cate}">{{cate}}</li>
          </ul>
        </scroll-view>
        <swiper class="stencils"
                :current="currentIndex"
                id="stencils"
                @touchstart="fn"
                @touchend="changeStencilPngTouchEndHandler"
                @change="swiperChange">
          <swiper-item v-for="(cate, key) in kindsData" :key="key">
            <scroll-view scroll-y class="stencils-scroll">
              <ul class="stencil-list" >
                <li class="stencil-item" v-for="(item, index) in cate" :key="index" :data-stencil="item">
                  <img mode="aspectFit" class="stencil-img" :data-stencil="item" :src="item.full_icon_url" alt="">
                </li>
                <li class="stencil-item" v-for="item in (6 - (cate.length % 6 || 6))" :key="item"></li>
              </ul>
            </scroll-view>
          </swiper-item>
        </swiper>

      </div>
      <cover-view class="btns" id="create-puzzle">
        <cover-view class="btn text" id="choose-img" @click="choosePhoto">+背景图</cover-view>
        <cover-view class="btn text" id="add-text" @click="addText">+文字</cover-view>
        <cover-view class="btn save" id="save-img" @click="saveImage">生成</cover-view>
      </cover-view>
    </div>
    <canvas class="to-images" canvas-id="to-images"></canvas>
  </container>
</template>

<script>
/* global getCurrentPages */
const API = 'https://api.pintuxiangce.com/icon/index'
import Task from './taskQueue'
import events from '../../../static/events'
import icon from '@/images/ic_changePic.png'

const task = new Task()
const TEMPLATET_API = ''
const reversalTask = new Task()
let startTouch = {}
let startTime = 0
let startX = 0
let startY = 0
let zIndexBase = 10
let clickTime = 0
export default {

  data () {
    return {
      playList: [
        {
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        },{
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        },{
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        },{
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        }
      ],
      curPlay: null,
      kinds: [],
      icon,
      iphoneX: false,
      viewW: 0,
      viewH: 0,
      photoPath: '/static/photo.jpg',
      cvsW: 0,
      cvsH: 0,
      curkinds: '',
      stencilPng: '',
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      photoContentWidth: 0,
      photoW: 0,
      photoH: 0,
      left: 0,
      top: 0,
      currentIndex: 0,
      kindsData: [],
      loadedPath: '',
      copy: {
        show: false,
        photoH: 0,
        photoW: 0,
        photoStyle: '',
        photoPath: ''
      },
      tieList: [],
      textList: [],
      tieChanging: false,
      tieMoving: false,
      tieScaling: false,
      isText: false,
      controller: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        rotate: 0,
        scale: 1,
      },
      inputFocus: false,
      inputShow: false,
      inputEdit: false,
      inputHeight: 40,
      inputBottom: 0,
      inputText: ''
    }
  },
  computed: {
    maskPath () {
      console.log(this.stencilPng)
      return this.stencilPng
    },
    photoStyle () {
      return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
    },
    curIndex () {
      return this.playList.indexOf(this.curPlay)
    },
    curIndexText (){
      return '一二三四五六七'[this.curIndex]
    }
  },
  methods: {
    choosePlay (item) {
      this.tieChanging = false
      this.tieList = item.tieList
      this.textList = item.textList
      this.curPlay = item
      this.photoPath = item.photoPath
      this.translateX = item.translateX
      this.translateY = item.translateY
      this.photoW = item.photoW
      this.photoH = item.photoH
    },
    deletePlay(index) {
      wx.showModal({
        content: '是否确认删除', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
        success: (res) => {
          if (res.confirm) {
            if (this.playList.length > 1) {
              this.playList.splice(index, 1)
              this.choosePlay(index ? this.playList[index - 1] :  this.playList[index] )
            } else {
              this.curPlay.photoPath = ''
              this.photoPath = ''
              this.curPlay.textList.splice(0, this.curPlay.textList.length)
              this.curPlay.tieList.splice(0, this.curPlay.tieList.length)
            }
          }
        }
      })
    },
    addPlay () {
      if (this.playList.length >= 4) {
        wx.showModal({
          content: '目前只支持4幕', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
          showCancel: false,
          success: (res) => {
          }
        })
        return
      }
      const play = {
        photoPath: '',
        tieList: [],
        textList: [],
        translateX: 0,
        translateY: 0,
        photoW: 0,
        photoH: 0,
        scale: 1
      }
      this.playList.push(play)
      this.choosePlay(play)
    },
    textSlice(text) {
      const arr = text.split(/\n/)
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const res = []
        if (item.length > 16) {
          let index = 0
          while (index < item.length) {
            res.push(item.slice(index, index + 16))
            index += 16
          }
          arr.splice(i, 1, ...res)
          i+= res.length
        }
      }
      return arr.join('\n')
    },
    inputCompleteHandler (ev) {
      let {value} = ev.mp.detail
      value = this.textSlice(value)
      this.inputShow = false
      this.inputFocus = false
      if (!value) return
      this.inputText = value
      if (this.inputEdit) {
        this.controller.current.w = 'auto'
        this.controller.current.h = 'auto'
        this.controller.current.value = value
        setTimeout(() => {
          wx.createSelectorQuery().select('#inner' + this.controller.current.id).boundingClientRect((rect) => {
            console.log('#inner' + this.controller.current.id, rect.height)
            this.controller.current.h = rect.height / this.controller.current.scaleY
            this.controller.current.w = rect.width / this.controller.current.scaleX
            this.controlTie(this.controller.current)
          }).exec()
        }, 100)
      } else {
        this.createTextTie(value)
      }
    },
    inputBlurHandler (ev) {
      this.inputShow = false
      this.inputFocus = false
    },
    inputFocusHandler (ev) {
      const { height } = ev.mp.detail
      this.inputBottom = height + 10
    },
    fn (ev) {
      startTime = Date.now()
      startX = ev.mp.changedTouches[0].clientX
      startY = ev.mp.changedTouches[0].clientY
    },
    changeStencilPngTouchEndHandler (ev) {
      if (Date.now() - startTime < 250 &&
        Math.abs(ev.mp.changedTouches[0].clientX - startX) < 10 &&
        Math.abs(ev.mp.changedTouches[0].clientY - startY) < 10) {
        this.changeStencilPng(ev.target.dataset.stencil)
      }
    },
    changeKindsTouchEndHandler (ev) {
      if (Date.now() - startTime < 250 &&
        Math.abs(ev.mp.changedTouches[0].clientX - startX) < 10 &&
        Math.abs(ev.mp.changedTouches[0].clientY - startY) < 10) {
        this.changeKinds(ev.target.dataset.cate)
      }
    },
    getStencil (noChange) {
      wx.request({
        url: API,
        success: (res) => {
          const category = {}
          const kinds =[]
          const kindsData = []
          res.data.data.forEach(item => {
            if (category[item.category_name || item.category_id]) {
              category[item.category_name || item.category_id].push(item)
            } else {
              category[item.category_name || item.category_id] = [item]
            }
          })
          Object.keys(category).forEach(key => {
            kinds.push(key)
            kindsData.push(category[key])
          })
          this.kinds = kinds
          this.kindsData = kindsData
          this.changeKinds(this.kinds[this.currentIndex])
          if (noChange) return
          // if (this.photoContentWidth) {
          //   this.changeStencilPng(this.kindsData[0][0])
          //   this.changeKinds(this.kinds[0])
          // } else {
          //   const unWatch = this.$watch('photoContentWidth',() => {
          //     this.changeStencilPng(this.kindsData[0][0])
          //     this.changeKinds(this.kinds[0])
          //     unWatch()
          //   })
          // }
        }
      })
    },
    swiperChange (ev){
      this.currentIndex = ev.target.current
      this.changeKinds(this.kinds[this.currentIndex])
    },
    touchStartHandler (ev) {
      startTouch = {
        x: ev.mp.touches[0].clientX,
        y: ev.mp.touches[0].clientY,
        translate: {
          x: this.translateX,
          y: this.translateY
        },
        identifiers: '' + ev.mp.touches[0].identifier
      }
      if (ev.touches.length > 1) {
        const {x, y} = {
          x:  ev.mp.touches[1].clientX,
          y:  ev.mp.touches[1].clientY
        }
        startTouch.distance = Math.sqrt((y - startTouch.y)**2 + (x - startTouch.x)**2)
        let slope = (y - startTouch.y) / (x - startTouch.x)
        if(isNaN(slope)) return
        startTouch.slope = slope
        startTouch.scale = this.scale
        startTouch.rotate = this.rotate
        startTouch.identifiers += ev.mp.touches[1].identifier
      }
    },
    touchMoveHandler(ev) {
      const {x, y} = {
        x:  ev.mp.touches[0].clientX,
        y:  ev.mp.touches[0].clientY
      }
      if (this.tieScaling && this.tieChanging) {
        this.tieScaleMove(x, y, ev)
        return
      }
      if (!this.tieMoving) {
        return // 照片手势操作
        this.translateX = startTouch.translate.x + (x - startTouch.x)
        this.translateY = startTouch.translate.y + (y - startTouch.y)
        if (ev.touches.length > 1) {
          const X2 = ev.mp.touches[1].clientX
          const Y2 = ev.mp.touches[1].clientY
          const distance = Math.sqrt((y - Y2)**2 + (x - X2)**2)
          let slope = (Y2 - y) / (X2 - x)
          if(isNaN(slope)) return
          this.scale = startTouch.scale * (distance / startTouch.distance)
          this.rotate = startTouch.rotate + Math.atan(slope - startTouch.slope) / Math.PI * 180
          console.log(this.rotate)
        }
      } else {
        this.tieMove(x, y, ev)
      }
    },
    touchEndHandler (ev) {
      console.log(ev)
      if (ev.touches) {
        const identifiers = ev.mp.touches.reduce((a, b) => {
          return a + b.identifier
        }, '').slice(0, 2)
        if (identifiers !== startTouch.identifiers) {
          this.touchStartHandler(ev)
        }
      }
      this.tieMoving = false
      this.tieScaling = false
    },
    nullEnd(){
      this.tieChanging = false
      this.tieScaling = false
      this.tieMoving = false
    },
    tieScaleMove (x, y, ev) {
      const curTie = this.controller.current
      const r = (Math.atan2(y - startTouch.tieStatus.oriY, x - startTouch.tieStatus.oriX) - Math.atan2(startTouch.y - startTouch.tieStatus.oriY, startTouch.x - startTouch.tieStatus.oriX)) / Math.PI * 180
      const c = Math.sqrt(2) / 2 * (Math.sqrt((x - startTouch.tieStatus.oriX)**2 + (y - startTouch.tieStatus.oriY)**2) - Math.sqrt((startTouch.x - startTouch.tieStatus.oriX)**2 + (startTouch.y - startTouch.tieStatus.oriY)**2))
      if (-c * 2 > startTouch.tieStatus.w) return
      if (this.isText) {
        this.controller.rotate =  startTouch.tieStatus.rotate + r
        curTie.rotate  = startTouch.tieStatus.rotate + r
        curTie.scaleX = curTie.scaleY = startTouch.scale * Math.sqrt((x - startTouch.tieStatus.oriX)**2 + (y - startTouch.tieStatus.oriY)**2) / Math.sqrt((startTouch.x - startTouch.tieStatus.oriX)**2 + (startTouch.y - startTouch.tieStatus.oriY)**2)
        this.controller.w =  40 + curTie.w * curTie.scaleX
        this.controller.h = 40 + curTie.h * curTie.scaleX
        this.controller.x = startTouch.tieStatus.x - 20 - (curTie.w * curTie.scaleX - curTie.w) / 2
        this.controller.y = startTouch.tieStatus.y - 20 - (curTie.h * curTie.scaleX - curTie.h) / 2
      } else {
        this.controller.w =  40 + (curTie.w = startTouch.tieStatus.w + c * 2)
        this.controller.h = 40 + (curTie.h = curTie.w / startTouch.w$h)
        this.controller.x = (curTie.x = startTouch.tieStatus.x - c) - 20
        this.controller.y = (curTie.y = startTouch.tieStatus.y - c) - 20
        this.controller.rotate =  startTouch.tieStatus.rotate + r
        this.controller.scale = 1
        curTie.rotate  = startTouch.tieStatus.rotate + r// * curTie.scaleX * curTie.scaleY
        console.log(curTie.w, curTie.h, curTie.w / curTie.h)
      }
    },
    tieMove (x, y, ev) {
      const change = {
        x: startTouch.controller.x + x - startTouch.x,
        y: startTouch.controller.y + y - startTouch.y,
      }
      if (change.x < -this.controller.w / 2) change.x = -this.controller.w / 2
      if (change.x > this.photoW - this.controller.w / 2) change.x = this.photoW - this.controller.w / 2
      if (change.y < -this.controller.h / 2) change.y = -this.controller.h / 2
      if (change.y > this.photoH - this.controller.h / 2) change.y = this.photoH - this.controller.h / 2
      Object.assign(this.controller, change)
      change.x += 20 + (this.controller.current.w * Math.abs(this.controller.current.scaleX) - this.controller.current.w) / 2
      change.y += 20 + (this.controller.current.h *  Math.abs(this.controller.current.scaleX) - this.controller.current.h) / 2
      if (this.isText) {
        change.transX = change.x + 'px'
        change.transY = change.y + 'px'
      }
      Object.assign(this.controller.current, change)
    },
    controllerStart(ev) {
      this.tieTouchStart(this.controller.current, ev)
    },
    controllerEnd (ev) {
      this.tieMoving = false
      this.tieScaling = false
      if (Date.now() - clickTime < 300) {
        this.dbClickController()
        return
      }
      if (Date.now() - startTouch.time < 300) {
        this.controlTie(this.controller.current, ev)
        clickTime = Date.now()
      } else {
        clickTime = 0
      }
    },
    dbClickController () {
      const curTie = this.controller.current
      if (curTie.type !== 'text') return
      this.inputEdit = true
      this.inputText = curTie.value
      this.inputShow = true
      setTimeout(() => {
        events.$emit('inputFocus')
      }, 300)
    },
    tieTouchStart (item, ev) {
      console.log('tie start', item, ev)
      this.isText = item.type === 'text'
      const x = (this.isText ? (item.x - (item.w * item.scaleX - item.w) / 2) : item.x) - 20
      const y = (this.isText ? (item.y - (item.h * item.scaleX - item.h) / 2) : item.y) - 20
      const w = (this.isText ? (item.w * item.scaleX) : item.w) + 40
      const h = (this.isText ? (item.h * item.scaleX) : item.h) + 40
      const rotate = item.rotate
      if (this.tieChanging && item !== this.controller.current) {
        Object.assign(this.controller, { x, y, w, h, rotate })
      }
      this.tieMoving = true
      this.controller.current = item
      startTouch.controller = { x, y, w, h, rotate }
      startTouch.x = ev.mp.touches[0].clientX
      startTouch.y = ev.mp.touches[0].clientY
      startTouch.time = Date.now()
      this.controlTie(item, ev, true)
    },
    tieTouchEnd (item, ev) {
      if (Date.now() - clickTime < 300) {
        this.dbClickController()
        return
      }
      if (Date.now() - startTouch.time < 300) {
        this.controlTie(item, ev)
        clickTime = Date.now()
      } else {
        clickTime = 0
      }
    },
    controlTie (item, ev, notChangeZ) {
      this.isText = item.type === 'text'
      if (item.type === 'text') {
        this.controller.w = item.w * item.scaleX + 40
        this.controller.h = item.h * item.scaleX + 40
        this.controller.x = item.x - (item.w * item.scaleX - item.w) / 2 - 20
        this.controller.y = item.y - (item.h * item.scaleX - item.h) / 2 - 20
      } else {
        this.controller.w = item.w + 40
        this.controller.h = item.h + 40
        this.controller.x = item.x - 20
        this.controller.y = item.y - 20
      }
      this.controller.rotate = item.rotate
      this.controller.current = item
      // this.controller.scale = this.isText ? item.scaleX : 1
      this.tieChanging = true
      if (!notChangeZ && item.z !== zIndexBase) item.z = ++zIndexBase
    },
    closeHandler() {
      const list = this.controller.current.type === 'text' ? this.textList : this.tieList
      const index = list.indexOf(this.controller.current)
      if (index >= 0) {
        list.splice(index, 1)
        this.tieChanging = false
      }
    },
    scaleHandler(ev) {
      console.log('scale',ev)
      this.tieScaling = true
      startTouch.x = ev.mp.touches[0].clientX
      startTouch.y = ev.mp.touches[0].clientY
      const {x, y, w, h, rotate, scaleX} = this.controller.current
      this.isText = this.controller.current.type === 'text'
      const oriX = x + w / 2 + this.left
      const oriY = y + h / 2 + this.top
      console.log(x, y, w, h, rotate, oriX, oriY, scaleX)
      startTouch.tieStatus = {x, y, w, h, rotate, oriX, oriY}
      startTouch.scale = scaleX
      startTouch.w$h = w / h
    },
    reversalHandler() {
      const {scaleX, scaleY} = this.controller.current
      if (scaleX === 1 && scaleY === 1) {
        this.controller.current.scaleX = -1
        this.controller.current.scaleY = 1
      } else if (scaleX === -1 && scaleY === 1) {
        this.controller.current.scaleX = -1
        this.controller.current.scaleY = -1
      } else if (scaleX === -1 && scaleY === -1) {
        this.controller.current.scaleX = 1
        this.controller.current.scaleY = -1
      } else{
        this.controller.current.scaleX = 1
        this.controller.current.scaleY = 1
      }
    },
    getRectData (){
      wx.createSelectorQuery().select('.shape-content').boundingClientRect((rect) => {
        this.photoW = this.photoH = this.photoContentWidth = rect.width
        this.left = rect.left
        this.top = rect.top
        if (this.$mp.query.id) {
          this.getTemplate(this.$mp.query.id)
        } else {
          this.choosePlay(this.playList[0])
        }
      }).exec()
    },
    getTemplate () {
      this.playList = [
        {
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        },{
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        },{
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        },{
          photoPath: '',
          tieList: [],
          textList: [],
          translateX: 0,
          translateY: 0,
          photoW: 0,
          photoH: 0,
          scale: 1
        }
      ]
      this.$nextTick(() => {
        this.choosePlay(this.playList[0])
      })
      return
      wx.showLoading({
        title: '',
        mask: true
      })
      wx.request({
        url: TEMPLATET_API,
        success: (res) => {
          this.playList = res.data
          this.$nextTick(() => {
            this.choosePlay(this.playList[0])
            wx.hideLoading()
          })
        }
      })
    },
    changeStencilPng (item) {
      if (!item) return
      if (!this.curPlay.photoPath) {
        wx.showToast({
          title: '先添加一张图片吧',
          icon: 'none'
        })
        return
      }
      this.createTie(item)
      //
      this.stencilPng = item.full_url
      this.$root.$mp.page.setData({
        icon_id: item.icon_id,
        icon_name: item.icon_name
      })
    },
    getImgLocalPath (item) {
      console.log(item)
      wx.getImageInfo({
        src: item.path2,
        success: (info) => {
          item.drawPath = info.path
          const {width, height} = info
          console.log('图片宽高：', width, height)
          if (width > height) {
            item.w *= height / width
          } else {
            item.h *= width / height
          }
          this.tieList.push(item)
          this.controlTie(item)
          this.createReversalImg(item)
        }
      })
    },
    createReversalImg (item) {
      item.reversalPath = []
      reversalTask.addTask(() => {
        let toW = item.w * 4 | 0
        let toH = item.h * 4 | 0
        if (toW > 415) {
          toW = 415
          toH = toW * item.h / item.w | 0
        }
        return new Promise(resolve => {
          const ctx = wx.createCanvasContext('to-images')
          ctx.drawImage(item.drawPath, 0, 0, toW, toH)
          ctx.draw(false, () => {
            setTimeout(() => {
              wx.canvasGetImageData({
                canvasId: 'to-images',
                x: 0,
                y: 0,
                width: toW,
                height: toH,
                success: (res) => {
                  console.log('get')
                  const reversalXArr = new Uint8ClampedArray(toW * toH * 4)
                  const reversalXYArr = new Uint8ClampedArray(toW * toH * 4)
                  const reversalYArr = new Uint8ClampedArray(toW * toH * 4)
                  this.reversalX(res.data, reversalXArr, toW, toH)
                  this.reversalY(reversalXArr, reversalXYArr, toW, toH)
                  this.reversalY(res.data, reversalYArr, toW, toH);
                  [reversalXArr, reversalXYArr, reversalYArr].forEach((arr, index) => {
                    console.log('put')
                    reversalTask.addTask(() => new Promise((resolveFn, reject) => {
                      wx.canvasPutImageData({
                        canvasId: 'to-images',
                        x: 0,
                        y: 0,
                        width: toW,
                        height: toH,
                        data: arr,
                        success (res) {
                          console.log('save')
                          wx.canvasToTempFilePath({
                            canvasId: 'to-images',
                            x: 0,
                            y: 0,
                            width: toW,
                            height: toH,
                            success: function (res) {
                              item.reversalPath[index] = res.tempFilePath
                              resolveFn()
                            },
                            fail (err) {
                              console.log(err)
                            }
                          })
                        },
                        fail (er) {
                          console.log('drawImageFromU8 failed', er)
                          reject(er)
                        }
                      })
                    }))
                  })
                  resolve()
                },
                fail (err) {
                  console.log('get stencil imageData failed', err)
                }
              })
            }, 50)
          })
        })
      })
    },
    reversalX (source, target, width, height) {
      if (source.length !== width * height * 4) {
        console.error('length error')
        return
      }
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const sourceIndex = (j + width * i) * 4
          const targetIndex = (width - 1 - j + width * i) * 4
          target[targetIndex] = source[sourceIndex]
          target[targetIndex + 1] = source[sourceIndex + 1]
          target[targetIndex + 2] = source[sourceIndex + 2]
          target[targetIndex + 3] = source[sourceIndex + 3]
        }
      }
    },
    reversalY (source, target, width, height) {
      if (source.length !== width * height * 4) {
        console.error('length error')
        return
      }
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const sourceIndex = (j + width * i) * 4
          const targetIndex = (j + width * (height - 1 - i)) * 4
          target[targetIndex] = source[sourceIndex]
          target[targetIndex + 1] = source[sourceIndex + 1]
          target[targetIndex + 2] = source[sourceIndex + 2]
          target[targetIndex + 3] = source[sourceIndex + 3]
        }
      }
    },
    createTie (item) {
      const originW = 60
      const originH = 60
      zIndexBase++
      const tie = {
        x: (this.photoContentWidth - originW) / 2,
        y: (this.photoContentWidth - originH) / 2,
        w: originW,
        h: originH,
        z: zIndexBase,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        path: item.full_url,
        path2: item.full_icon_url,
        name: item.icon_name,
        id: item.icon_id
      }
      this.isText = false
      this.getImgLocalPath(tie)
      // this.tieChanging = false
    },
    createTextTie (value) {
      const text = {
        transX: '-50%',
        transY: '-50%',
        l: '50%',
        t: '50%',
        x: 0,
        y: 0,
        w: undefined,
        h: undefined,
        z: ++zIndexBase,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        id: 'tie-text-' + zIndexBase,
        type: 'text',
        value: value.trim()
      }
      this.textList.push(text)
      this.$nextTick(() => {
        setTimeout(() => {
          this.textTieInit(text)
        }, 100)
      })
    },
    textTieInit (item) {
      wx.createSelectorQuery().select('#' + item.id).boundingClientRect((rect) => {
        const {left, top, width, height} = rect
        item.x = left
        item.y = top - this.top
        item.w = width
        item.h = height
        item.l = 0
        item.t = 0
        item.transX = item.x + 'px'
        item.transY = item.y + 'px'
        this.controlTie(item)
      }).exec()
    },
    changeKinds (val) {
      if (!val) return
      this.curkinds = val
      this.currentIndex = this.kinds.indexOf(val)
    },
    choosePhoto (name){
      // this.copy = {
      //   show: true,
      //   photoH: this.photoH,
      //   photoW: this.photoW,
      //   transform: this.photoStyle,
      //   photoPath: this.photoPath
      // }
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed', 'original'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          const path = res.tempFilePaths[0]
          this.setImage(path)
          const url = '../cropped/main?imgPath=' + path
          wx.navigateTo({ url })
        }
      })
    },
    setImage (path) {
      wx.getImageInfo({
        src: path,
        success: (data) => {
          const {width, height} = data
          this.photoPath = ''
          this.scale = 1
          this.photoPath = path
          this.curPlay.photoPath = path
          if (width > height) {
            this.photoH = this.photoContentWidth
            this.photoW = this.photoContentWidth * (width / height)
            this.translateX = -(this.photoW - this.photoH) / 2
            this.translateY = 0
          } else {
            this.photoW = this.photoContentWidth
            this.photoH = this.photoContentWidth / (width / height)
            this.translateY = -(this.photoH - this.photoW) / 2
            this.translateX = 0
          }
          this.curPlay.translateX = this.translateX
          this.curPlay.translateY = this.translateY
          this.curPlay.photoW = this.photoW
          this.curPlay.photoH = this.photoH
          this.$nextTick(() => {
            setTimeout(() => {
              this.copy.show = false
            }, 100)
          })
        }
      })
    },
    drawMask () {
      wx.getImageInfo({
        src: this.maskPath,
        success: ({path}) => {
          const ctx = wx.createCanvasContext('shape-mask')
          ctx.setFillStyle('#fff')
          const l = (this.viewW - this.photoContentWidth) / 2
          ctx.fillRect(0, 0, this.viewW, this.viewW)
          ctx.clearRect(l, l, this.photoContentWidth, this.photoContentWidth)
          ctx.drawImage(path, l, l, this.photoContentWidth, this.photoContentWidth)
          ctx.draw(false, () => {
            wx.hideLoading()
          })
          this.loadedPath = path
        }
      })
    },
    getSysInfo () {
      try {
        const res = wx.getSystemInfoSync()
        if (/ios/ig.test(res.system)) this.ios = true
        this.viewW = res.windowWidth
        this.pixelRatio = res.pixelRatio
        this.viewH = res.windowHeight
      } catch (e) {
        // Do something when catch error
      }
    },
    drawTie (ctx, play) {
      const list = play.tieList.slice().concat(play.textList).sort((a, b) => a.z - b.z)
      const baseScale = 375 / this.photoContentWidth
      console.log(list)
      list.forEach(item => {
        if (item.type === 'text') {
          ctx.save()
          ctx.translate(amend(item.x) + amend(item.w) / 2, amend(item.y) + amend(item.h) / 2)
          ctx.rotate(item.rotate * Math.PI / 180)
          ctx.scale(item.scaleX, item.scaleY)
          ctx.setFontSize(16)
          ctx.setFillStyle('#000')
          ctx.setTextBaseline('top')
          item.value.split(/\n/).forEach((text, index, arr) => {
            ctx.fillText(text, amend(-item.w) / 2, amend(-item.h) / 2 + amend(index * item.h / arr.length),  amend(item.w))
          })
          ctx.restore()
        } else {
          ctx.save()
          ctx.translate(amend(item.x) + amend(item.w) / 2, amend(item.y) + amend(item.h) / 2)
          ctx.rotate(item.rotate * Math.PI / 180)
          ctx.scale(item.scaleX, item.scaleY)
          let path = item.drawPath
          if (this.ios) {
            if (item.scaleX > 0) {
              if (item.scaleY > 0) {
                path = item.drawPath
              } else {
                path = item.reversalPath[2]
              }
            } else {
              if (item.scaleY > 0) {
                path = item.reversalPath[0]
              } else {
                path = item.reversalPath[1]
              }
            }
          }
          ctx.drawImage(path, amend(-item.w) / 2, amend(-item.h) / 2, amend(item.w), amend(item.h))
          ctx.restore()
        }
      })

      function amend (val) {
        return val * baseScale
      }
    },
    saveImage () {
      wx.showLoading({
        title: '图片生成中',
        mask: true
      })
      this.tieChanging = false
      const timer = setTimeout(() => {
        wx.hideLoading()
        wx.showModal({
          title: 'ERROR',
          content: 'Canvas Crashed', //'微信对拼图渲染支持有限，导致中低端机型一定概率渲染失败。点击确认将重启小程序，请再次尝试。',
          showCancel: false,
          success: function(res) {

          }
        })
      }, 10000)
      const goal = {
        name: '个人头像',
        puzzleX: 0,
        puzzleY: 0,
        puzzleW: 375,
        puzzleH: 375,
        imgW: 375,
        imgH: 375,
        QRCode: '/static/new_qrcode.png',
        QRX: 59,
        QRY: 3,
        QRL: 43
      }

      // if (this.viewW < 375) {
      //   const s = this.viewW / 375
      //   Object.keys(goal).forEach((key) => {
      //     if (isNaN(goal[key]) || key === 'QRL') return
      //     if (key === 'QRY') {
      //       goal[key] = this.viewW - 43
      //     } else {
      //       goal[key] = goal[key] * s | 0
      //     }
      //   })
      // }
      const ctx = wx.createCanvasContext('to-images')
      const drawList = this.playList.filter(item => item.photoPath)
      drawList.forEach((play) => {
        task.addTask(() => new Promise((resolve, reject) => {
          const scale = goal.puzzleW / this.photoContentWidth
          let height, width
          if (play.photoW > play.photoH) {
            height = goal.puzzleH
            width = goal.puzzleH * (play.photoW / play.photoH)
          } else {
            width = goal.puzzleW
            height = goal.puzzleW / (play.photoW / play.photoH)
          }
          ctx.beginPath()
          // ctx.setFillStyle('#fff')
          // ctx.fillRect(0, 0, this.viewW, this.viewW)
          ctx.save()
          // ctx.rect(goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
          // ctx.save()
          // ctx.clip()
          // ctx.setFillStyle('#000')
          ctx.fill()
          ctx.translate(play.translateX * scale, play.translateY * scale)
          console.log(play.photoPath, goal.puzzleX - width * (play.scale - 1) / 2, goal.puzzleY - height * (play.scale - 1) / 2, width *  play.scale, height *  play.scale)
          ctx.drawImage(play.photoPath, goal.puzzleX - width * (play.scale - 1) / 2, goal.puzzleY - height * (play.scale - 1) / 2, width *  play.scale, height *  play.scale)
          ctx.restore()

          // ctx.drawImage(this.loadedPath, goal.puzzleX, goal.puzzleY, goal.puzzleW, goal.puzzleH)
          this.drawTie(ctx, play)

          // ctx.drawImage(goal.QRCode, goal.QRX, goal.QRY, goal.QRL, goal.QRL)
          // ctx.setFillStyle('#9C9C9C')
          // ctx.setFontSize(10)
          // ctx.setTextBaseline('bottom')
          // ctx.fillText('小程序keke', goal.QRL + 1, goal.imgH)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'to-images',
              x: 0,
              y: 0,
              width: goal.imgW,
              height: goal.imgH,
              success: function (res) {
                clearTimeout(timer)
                play.resPath = res.tempFilePath
                console.log('draw success', res.tempFilePath)
                resolve()
              },
              fail (err) {
                console.log(err)
                reject()
              }
            })
          })
        }))
      })
      task.setQueueEmptyCb(() => {
        console.log('res：', drawList)
        let phW, phH
        const allW = 395
        let allH = 445
        if (drawList.length === 2 ) {
          allH -= 195
        }
        if (drawList.length > 1) {
          phW = phH = 183
        } else {
          phW = phH = 375
        }
        ctx.setFillStyle('#FFF')
        ctx.setStrokeStyle('#000')
        ctx.fillRect(0,0, allW, allH)
        drawList.forEach((item, index) => {
          if (drawList.length - 1 === index && drawList.length % 2) {
            ctx.drawImage(item.resPath, (allW - phW) / 2,  10 +  (phH + 10) * (index / 2 | 0), phW, phH)
            ctx.strokeRect((allW - phW) / 2,  10 +  (phH + 10) * (index / 2 | 0), phW, phH)
            console.log((allW - phW) / 2,  10 +  (phH + 10) * (index / 2 | 0), phW, phH)
          } else {
            ctx.drawImage(item.resPath, 10 + (index % 2) * (phW + 10),  10 +  (phH + 10) * (index / 2 | 0), phW, phH)
            ctx.strokeRect(10 + (index % 2) * (phW + 10),  10 +  (phH + 10) * (index / 2 | 0), phW, phH)
            console.log(10 + (index % 2) * (phW + 10),  10 +  (phH + 10) * (index / 2 | 0), phW, phH)
          }
        })
        ctx.save()
        ctx.setFillStyle('#FFE200')
        ctx.fillRect(0, allH - 50, allW, 50)
        ctx.restore()
        ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
        ctx.setFillStyle('#333')
        ctx.setFontSize(18)
        ctx.setTextBaseline('bottom')
        ctx.fillText('快来创作你的四格故事，keke', 112, allH - 14)
        // const allH = 395 * drawList.length + 67
        // ctx.setFillStyle('#FFF')
        // ctx.setStrokeStyle('#000')
        // ctx.fillRect(0,0, allW, allH)
        // drawList.forEach((item, index) => {
        //   ctx.drawImage(item.resPath, 20,  20 +  395 * index, 375, 375)
        //   ctx.strokeRect(20,  20 +  395 * index, 375, 375)
        // })
        // ctx.drawImage(goal.QRCode, goal.QRX, allH - goal.QRY - goal.QRL, goal.QRL, goal.QRL)
        // ctx.setFillStyle('#333')
        // ctx.setFontSize(18)
        // ctx.setTextBaseline('bottom')
        // ctx.fillText('快来创作你的图片剧，keke', 125, allH - 22)
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'to-images',
            x: 0,
            y: 0,
            width: allW,
            height: allH,
            success: function (res) {
              clearTimeout(timer)
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success () {
                  wx.hideLoading()
                  const url = '../result/main'
                  wx.navigateTo({ url })
                },
                fail () {
                  wx.hideLoading()
                  wx.showToast({
                    title: '保存失败，请在右上角设置中打开权限。',
                    icon: 'none'
                  })
                }
              })
            },
            fail (err) {
              console.log(err)
            }
          })
        })

      })
    },

    addText () {
      if (!this.curPlay.photoPath) {
        wx.showToast({
          title: '先添加一张图片吧',
          icon: 'none'
        })
        return
      }
      this.inputText = ''
      this.inputShow = true
      this.inputEdit = false
      setTimeout(() => {
        events.$emit('inputFocus')
      }, 300)
    }
  },
  created () {
    this.getStencil()
    this.getSysInfo()
  },
  onReady() {
    // wx.showLoading({
    //   mask: true
    // })
    this.getRectData()
    events.$off(['clearList', 'setImage'])
    events.$on('clearList', () => {
      this.tieList.splice(0, this.tieList.length)
      this.textList.splice(0, this.textList.length)
    })
    events.$on('setImage', (path) => {
      this.setImage(path)
    })
  },
  onShow () {
    this.getStencil(true)
  },
  onShareAppMessage() {
    return {
      title: 'keke',
      path: '/pages/index/main',
      imageUrl: 'https://img1.doubanio.com/view/photo/l/public/p2536986009.webp'
    }
  }
}
</script>

<style lang="less" scoped>
.cvs-wrap{
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  scroll-y: hidden;
  overflow: hidden;
  &.iphoneX{
    .btns{
      bottom: 60rpx;
    }
  }
  .shape-wrap{
    position: relative;
    box-sizing: border-box;
    /*padding: 40rpx;*/
    width: 100vw;
    height: 100vw;
    background: #fff;
    overflow: hidden;
    .shape-content{
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #fff;
      .shape-img{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 8;
        &.copy{
          z-index: 9;
        }
      }
      .tip{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 48rpx;
        width: 300rpx;
        text-align: center;
      }
    }
    .shape-mask{
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vw;
      z-index: 9;
    }
    .tie-wrap{
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      .tie{
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: center center;
      }
    }
    .tie-text{
      position: absolute;
      transform-origin: center center;
      padding: 0;
      margin: 0;
      font-size: 32rpx;
      line-height: 40rpx;
      vertical-align: middle;
      text{
        white-space:nowrap;
      }
    }
    .controller {
      position: absolute;
      box-sizing: border-box;
      top: 0;
      left: 0;
      /*border: 1px solid #FFE000;*/
      z-index: 9999;
      &>img{
        position: absolute;
        width: 44rpx;
        height: 44rpx;
        padding: 16rpx;
      }
      .close {
        left: -36rpx;
        top: -36rpx;
      }
      .scale {
        right: -36rpx;
        bottom: -36rpx;
      }
      .reversal {
        left: -36rpx;
        bottom: -36rpx;
      }
      .border{
        position: absolute;
        background: #FFE000;
      }
      .border-top {
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
      }
      .border-left {
        top: 0;
        left: 0;
        height: 100%;
        width: 1px;
      }
      .border-right {
        top: 0;
        right: 0;
        height: 100%;
        width: 1px;
      }
      .border-bottom {
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
      }
    }
  }

  .btns{
    position: absolute;
    left: 0;
    bottom: 20rpx;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 80rpx;
    .btn{
      position: relative;
      box-sizing: border-box;
      width: 150rpx;
      height: 80rpx;
      line-height: 78rpx;
      text-align: center;
      font-size: 32rpx;
      background: #FFE200;
      color: #000;
      border-radius: 40rpx;
      border: 1px solid #000;
      z-index: 999;
      margin: 0 20rpx;
      &.save {
        width: 250rpx;
        margin-left: 100rpx;
        background: rgb(251, 14, 55);
        color: #fff;
      }
    }
  }

  .cvs-operation{
    position: relative;
    height: calc(100% - 100vw);
    width: 100vw;
    // padding: 2.5vw;
    border: 3rpx solid #2F2F2F;
    padding-top: 68rpx;
    background: #666;
    z-index: 10;
    .kinds{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 68rpx;
      padding: 0 20rpx;
      background: #2F2F2F;
      overflow: hidden;
      .kinds-wrap{
        height: 68rpx;
        white-space: nowrap;
      }
      .kinds-item{
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        height: 68rpx;
        line-height: 68rpx;
        margin: 0 20rpx;
        color: #fff;
        border-bottom: 4rpx solid #2F2F2F;
        transition: border-bottom-color .3s linear;
        &.active{
          border-bottom-color: #FFE200;
        }
      }
    }
    .stencils{
      width: 100%;
      height: calc(100% - 68rpx);
      overflow: hidden;
      background: #2F2F2F;
    }
    .stencils-scroll{
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    &.iphoneX .stencil-list{
      padding-bottom: 168rpx;
    }
    .stencil-list{
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-around;
      background: #2F2F2F;
      padding-bottom: 120rpx;
      .stencil-item{
        box-sizing: border-box;
        position: relative;
        width: 16.66%;
        height: 16.66vw;
        white-space: normal;
        word-break: break-all;
        text-align: center;
        background: #3D4042;
        border: 3rpx solid #2F2F2F;
        border-collapse: collapse;
        &.active{
          background: #6AC259;
        }
        .stencil-img{
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 80%;
          color: #fff;
        }
      }
    }
  }
}
.play-wrap{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  position: relative;
  height: 64rpx;
  padding: 10rpx 0;
  background: #FFE200;
  .play-list {
    left: 0;
    height: 64rpx;
    display: flex;
    .play-item{
      position: relative;
      width: 60rpx;
      height: 60rpx;
      background: #fff;
      border: 2rpx solid #000;
      margin: 0 10rpx;
      .play-img{
        width: 100%;
        height: 100%;
      }
      .play-delete{
        position: absolute;
        right: -12rpx;
        top: -12rpx;
        width: 28rpx;
        height: 28rpx;
      }
    }
  }
  .play-add{
    width: 64rpx;
    height: 64rpx;
    background: #fff;
    margin: 0 10rpx;
  }
}
.to-images{
  position: fixed;
  left: -415px;
  top: 0;
  width: 415px;
  height: 1746px;
  opacity: 0;
}
</style>
