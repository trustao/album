const _queueEmptyCbs = Symbol('_queueEmptyCbs')
const _emptyQueue = Symbol('_emptyQueue')
const _invoking = Symbol('_invoking')
const _invoke = Symbol('_invoke')

class TaskQueue {
  constructor () {
    this.queue = []
    this[_invoking] = false
    this[_queueEmptyCbs] = []
  }

  addTask (item) {
    if (typeof item === 'function') {
      this.queue.push(item)
      this.invoke()
    } else {
      console.error('error. must be a function and return a promise.')
    }
  }

  setQueueEmptyCb (cb) {
    if (typeof cb === 'function') this[_queueEmptyCbs].push(cb)
  }

  get invoking () {
    return this[_invoking]
  }
  set invoking (value) {
    this[_invoking] = value
    if (!value) {
      this[_emptyQueue]()
    }
  }

  invoke() {
    if (this.invoking) return
    this.invoking = true
    this[_invoke]()
  }
  [_invoke] () {
    const cb = this.queue.shift()
    var res = cb()
    if (res instanceof Promise) {
      res.catch(err => {
        throw new Error(err)
      })
      res.finally(() => {
        if (this.queue.length) {
          this[_invoke]()
          return
        }
        this.invoking = false
      })
    } else {
      console.error('invoke error')
    }
  }
  [_emptyQueue] () {
    while (this[_queueEmptyCbs].length) {
      const cb = this[_queueEmptyCbs].shift()
      cb()
    }
  }
}

export default TaskQueue
