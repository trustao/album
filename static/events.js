let app = null
try {
  app = getApp() || {}
} catch (e) {
  app = {}
}

let _events = null
if (!app._events) {
  _events = app._events = Object.create(null)
} else {
  _events = app._events
}

function $on (eventStr, fn) {
  if (Array.isArray(eventStr)) {
    eventStr.forEach(item => {
      $on(item, fn)
    })
    return
  }
  if (typeof eventStr !== 'string') {
    throw new Error('events name must be a string.')
  }
  if (_events[eventStr]) {
    if (Array.isArray(_events[eventStr])) {
      _events[eventStr].push(fn)
    } else {
      _events[eventStr] = [_events[eventStr], fn]
    }
  } else {
    _events[eventStr] = fn
  }
}

function $emit () {
  const eventStr = arguments[0]
  console.log('emit ', eventStr)
  const args = [].slice.call(arguments, 1)
  if (Array.isArray(eventStr)) {
    eventStr.forEach(item => {
      $emit(item, ...args)
    })
    return
  }
  if (typeof eventStr !== 'string') {
    throw new Error('events name must be a string.')
  }
  if (_events[eventStr]) {
    _events[eventStr](...args)
  }
}

function $off (eventStr, fn) {
  if (Array.isArray(eventStr)) {
    eventStr.forEach(item => {
      $off(item, fn)
    })
    return
  }
  if (typeof eventStr !== 'string') {
    throw new Error('events name must be a string.')
  }

  if (_events[eventStr]) {
    if (Array.isArray(_events[eventStr]) && !!fn) {
      const index = _events[eventStr].indexOf(fn)
      if (index >= 0) _events[eventStr].splice(index, 1)
    } else {
      _events[eventStr] = null
    }
  }
}

function $once (eventStr, fn) {
  if (Array.isArray(eventStr)) {
    eventStr.forEach(item => {
      $off(item, fn)
    })
  }
  if (typeof eventStr !== 'string') {
    throw new Error('events name must be a string.')
  }
  const cb = function () {
    fn(...arguments)
    $off(eventStr, cb)
  }

  $on(eventStr, cb)
}

export default {
  $on,
  $emit,
  $off,
  $once
}
