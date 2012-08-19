/*
 *  DeferredURLRequest.js
 *
 *  Copyright 2011, HeavyLifters Network Ltd. All rights reserved.
 */

var deferred = require('./deferred')
  , Deferred = deferred.Deferred
  , util = require('util')
  , fs = require('fs')
  , http = require('http')

exports.DeferredURLRequest = DeferredURLRequest
exports.DeferredJSONRequest = DeferredJSONRequest
exports.DeferredDownload = DeferredDownload

function DeferredURLRequest(context) {
    this.context = context
    this.client = this._createClient()
    this.request = null
    this.response = null
    this.responseData = null
    this.deferred = new Deferred()
}

DeferredURLRequest.prototype._createClient = function() {
    var port = this.context.port || 80
      , host = this.context.host
    return http.createClient(port, host)
}

DeferredURLRequest.prototype._createRequest = function() {
    var method = this.context.method || 'GET'
      , host = this.context.host
      , endpoint = this.context.endpoint || '/'
    return this.client.request(method, endpoint, {'host': host})
}

DeferredURLRequest.prototype._logRequestFailure = function(err) {
    var port = this.context.port || 80
      , host = this.context.host
      , method = this.context.method || 'GET'
      , endpoint = this.context.endpoint || '/'
    // FIXME: use log.error?
    console.log('DeferredURLRequest request failed, request: ' + method + ' http://' + host + ':' + port + endpoint)
    console.log('DeferredURLRequest request failed,   error: ' + err)
}

DeferredURLRequest.prototype._logResponseFailure = function(err) {
    var port = this.context.port || 80
      , host = this.context.host
      , method = this.context.method || 'GET'
      , endpoint = this.context.endpoint || '/'
    // FIXME: use log.error?
    console.log('DeferredURLRequest response failed, request: ' + method + ' http://' + host + ':' + port + endpoint)
    console.log('DeferredURLRequest response failed,   error: ' + err)
}

DeferredURLRequest.prototype._responseBegan = function() {
    // console.log('_responseBegan')
    if (this.response.statusCode === 200) {
        this.responseData = ''
        // console.log('_responseBegan true')
        return true
    } else {
        // console.log('_responseBegan statusCode: ' + this.response.statusCode)
        // console.log('_responseBegan false')
        this.error = {code: this.response.statusCode}
        this._responseFailed()
        return false
    }
}

DeferredURLRequest.prototype._responseReceivedData = function(data) {
    // console.log('_responseReceivedData')
    if (this.responseData !== null) this.responseData += data
}

DeferredURLRequest.prototype._responseFinished = function() {
    // console.log('_responseFinished')
    this.deferred.resolve(this.responseData)
}

DeferredURLRequest.prototype._responseFailed = function() {
    // console.log('_responseFailed')
    this._logResponseFailure(this.error)
    this.deferred.reject(this.error)
}

DeferredURLRequest.prototype.requestStart = function() {
    var self = this

    this.request = this._createRequest()
    this.request.on('response', function(res) {
        self.response = res
        if (self._responseBegan()) {
            res.on('data', function(chunk) { self._responseReceivedData(chunk) })
            res.on('end', function() { self._responseFinished() })
            res.on('error', function(err) {
                self._logResponseFailure(err)
                if (self.error === undefined) {
                    self.error = err
                    self._responseFailed()
                }
            })
        }
    })
    this.request.on('error', function(err) {
        self._logRequestFailure(err)
        if (self.error === undefined) {
            self.error = err
            self.deferred.reject(err)
        }
    })
    this.request.end()
    return this.deferred
}

function DeferredJSONRequest(context) {
    DeferredURLRequest.call(this, context)
}

util.inherits(DeferredJSONRequest, DeferredURLRequest)

DeferredJSONRequest.prototype._responseFinished = function() {
    // console.log('_responseFinished')
    try {
        this.deferred.resolve(JSON.parse(this.responseData))
    } catch (e) {
        this.deferred.reject({message: 'failed to parse JSON response', data: this.responseData})
    }
}

function DeferredDownload(context, destpath) {
    DeferredURLRequest.call(this, context)
    this.destpath = destpath
}

util.inherits(DeferredDownload, DeferredURLRequest)

DeferredDownload.prototype._requestStart = function() {
    try {
        fs.statSync(this.destpath)
        this.deferred.resolve(this.destpath)
    } catch (e) {
        DeferredURLRequest.prototype._requestStart.call(this)
    }
}

DeferredDownload.prototype._responseBegan = function() {
    if (DeferredURLRequest.prototype._responseBegan.call(this)) {
        this.file = fs.createWriteStream(this.destpath)
        return true
    }
    return false
}

DeferredDownload.prototype._responseReceivedData = function(data) {
    if (this.file) {
        this.file.write(data, 'utf8')
        return true
    }
    return false
}

DeferredDownload.prototype._responseFinished = function() {
    var self = this
    if (this.file) {
        this.file.on('close', function(had_error) {
            if (had_error) {
                self.error = 'failed to close file: ' + self.destpath
                self._responseFailed()
            } else {
                self.deferred.resolve(self.destpath)
            }
        })
        this.file.end()
    } else {
        this.error = "download failed"
        this._responseFailed()
    }
}
