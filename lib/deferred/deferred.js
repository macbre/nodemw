/*
 *  deferred.js
 *
 *  Copyright 2011, HeavyLifters Network Ltd. All rights reserved.
 */

;(function() {

  var DeferredAPI = {
      deferred: deferred,
      all: all,
      Deferred: Deferred,
      DeferredList: DeferredList,
      wrapResult: wrapResult,
      wrapFailure: wrapFailure,
      Failure: Failure
  }

  // CommonJS module support
  if (typeof module !== 'undefined') {
      var DeferredURLRequest = require('./DeferredURLRequest')
      for (var k in DeferredURLRequest) {
          DeferredAPI[k] = DeferredURLRequest[k]
      }
      module.exports = DeferredAPI
  }

  // Browser API
  else if (typeof window !== 'undefined') {
      window.deferred = DeferredAPI
  }

  // Fake out console if necessary
  if (typeof console === 'undefined') {
      var global = function() { return this || (1,eval)('this') }
      ;(function() {
          var noop = function(){}
          global().console = { log: noop, warn: noop, error: noop, dir: noop }
      }())
  }

  function wrapResult(result) {
      return new Deferred().resolve(result)
  }
  
  function wrapFailure(error) {
      return new Deferred().reject(error)
  }

  function Failure(v) { this.value = v }

  // Crockford style constructor
  function deferred(t) { return new Deferred(t) }

  function Deferred(canceller) {
      this.called = false
      this.running = false
      this.result = null
      this.pauseCount = 0
      this.callbacks = []
      this.verbose = false
      this._canceller = canceller

      // If this Deferred is cancelled and the creator of this Deferred
      // didn't cancel it, then they may not know about the cancellation and
      // try to resolve or reject it as well. This flag causes the
      // "already called" error that resolve() or reject() normally throws
      // to be suppressed once.
      this._suppressAlreadyCalled = false
  }

  if (typeof Object.defineProperty === 'function') {
      var _consumeThrownExceptions = true
      Object.defineProperty(Deferred, 'consumeThrownExceptions', {
          enumerable: false,
          set: function(v) { _consumeThrownExceptions = v },
          get: function() { return _consumeThrownExceptions }
      })
  } else {
      Deferred.consumeThrownExceptions = true
  }
  
  Deferred.prototype.cancel = function() {
      if (!this.called) {
          if (typeof this._canceller === 'function') {
              this._canceller(this)
          } else {
              this._suppressAlreadyCalled = true
          }
          if (!this.called) {
              this.reject('cancelled')
          }
      } else if (this.result instanceof Deferred) {
          this.result.cancel()
      }
  }

  Deferred.prototype.then = function(callback, errback) {
      this.callbacks.push({callback: callback, errback: errback})
      if (this.called) _run(this)
      return this
  }

  Deferred.prototype.fail = function(errback) {
      this.callbacks.push({callback: null, errback: errback})
      if (this.called) _run(this)
      return this
  }

  Deferred.prototype.both = function(callback) {
      return this.then(callback, callback)
  }

  Deferred.prototype.resolve = function(result) {
      _startRun(this, result)
      return this
  }

  Deferred.prototype.reject = function(err) {
      if (!(err instanceof Failure)) {
          err = new Failure(err)
      }
      _startRun(this, err)
      return this
  }

  Deferred.prototype.pause = function() {
      this.pauseCount += 1
      if (this.extra) {
          console.log('Deferred.pause ' + this.pauseCount + ': ' + this.extra)
      }
      return this
  }

  Deferred.prototype.unpause = function() {
      this.pauseCount -= 1
      if (this.extra) {
          console.log('Deferred.unpause ' + this.pauseCount + ': ' + this.extra)
      }
      if (this.pauseCount <= 0 && this.called) {
          _run(this)
      }
      return this
  }

  // For debugging
  Deferred.prototype.inspect = function(extra, cb) {
      this.extra = extra
      var self = this
      return this.then(function(r) {
          console.log('Deferred.inspect resolved: ' + self.extra)
          console.dir(r)
          return r
      }, function(e) {
          console.log('Deferred.inspect rejected: ' + self.extra)
          console.dir(e)
          return e
      })
  }

  /// A couple of sugary methods

  Deferred.prototype.thenReturn = function(result) {
      return this.then(function(_) { return result })
  }

  Deferred.prototype.thenCall = function(f) {
      return this.then(function(result) {
          f(result)
          return result
      })
  }

  Deferred.prototype.failReturn = function(result) {
      return this.fail(function(_) { return result })
  }

  Deferred.prototype.failCall = function(f) {
      return this.fail(function(result) {
          f(result)
          return result
      })
  }

  function _continue(d, newResult) {
      d.result = newResult
      d.unpause()
      return d.result
  }

  function _nest(outer) {
      outer.result.both(function(newResult) {
          return _continue(outer, newResult)
      })
  }

  function _startRun(d, result) {
      if (d.called) {
          if (d._suppressAlreadyCalled) {
              d._suppressAlreadyCalled = false
              return
          }
          throw new Error("Already resolved Deferred: " + d)
      }
      d.called = true
      d.result = result
      if (d.result instanceof Deferred) {
          d.pause()
          _nest(d)
          return
      }
      _run(d)
  }

  function _run(d) {
      if (d.running) return
      var link, status, fn
      if (d.pauseCount > 0) return
      while (d.callbacks.length > 0) {
          link = d.callbacks.shift()
          status = (d.result instanceof Failure) ? 'errback' : 'callback'
          fn = link[status]
          if (typeof fn !== 'function') continue
          try {
              d.running = true
              d.result = fn(d.result)
              d.running = false
              if (d.result instanceof Deferred) {
                  d.pause()
                  _nest(d)
                  return
              }
          } catch (e) {
              if (Deferred.consumeThrownExceptions) {
                  d.running = false
                  var f = new Failure(e)
                  f.source = f.source || status
                  d.result = f
                  if (d.verbose) {
                      console.warn('uncaught error in deferred ' + status + ': ' + e.message)
                      console.warn('Stack: ' + e.stack)
                  }
              } else {
                  throw e
              }
          }
      }
  }


  /// DeferredList / all

  function all(ds, opts) { return new DeferredList(ds, opts) }

  function DeferredList(ds, opts) {
      opts = opts || {}
      Deferred.call(this)
      this._deferreds = ds
      this._finished = 0
      this._length = ds.length
      this._results = []
      this._fireOnFirstResult = opts.fireOnFirstResult
      this._fireOnFirstError = opts.fireOnFirstError
      this._consumeErrors = opts.consumeErrors
      this._cancelDeferredsWhenCancelled = opts.cancelDeferredsWhenCancelled

      if (this._length === 0 && !this._fireOnFirstResult) {
          this.resolve(this._results)
      }
      
      for (var i = 0, n = this._length; i < n; ++i) {
            ds[i].both(deferredListCallback(this, i))
      }
  }

  if (typeof Object.create === 'function') {
      DeferredList.prototype = Object.create(Deferred.prototype, {
          constructor: { value: DeferredList, enumerable: false }
      })
  } else {
      DeferredList.prototype = new Deferred()
      DeferredList.prototype.constructor = DeferredList
  }

  DeferredList.prototype.cancelDeferredsWhenCancelled = function() {
      this._cancelDeferredsWhenCancelled = true
  }

  var _deferredCancel = Deferred.prototype.cancel
  DeferredList.prototype.cancel = function() {
      _deferredCancel.call(this)
      if (this._cancelDeferredsWhenCancelled) {
          for (var i = 0; i < this._length; ++i) {
              this._deferreds[i].cancel()
          }
      }
  }

  function deferredListCallback(d, i) {
      return function(result) {
          var isErr = result instanceof Failure
            , myResult = (isErr && d._consumeErrors) ? null : result
          // Support nesting
          if (result instanceof Deferred) {
              result.both(deferredListCallback(d, i))
              return
          }
          d._results[i] = myResult
          d._finished += 1
          if (!d.called) {
              if (d._fireOnFirstResult && !isErr) {
                  d.resolve(result)
              } else if (d._fireOnFirstError && isErr) {
                  d.reject(result)
              } else if (d._finished === d._length) {
                  d.resolve(d._results)
              }
          }
          return myResult
      }
  }

}())