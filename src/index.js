'use strict';

var fetch = require('isomorphic-fetch');

// FetchExtend实例数组
var FetchIns = []

function FetchIns_Add(ins) {
	FetchIns.push(ins)
}

function FetchIns_Delete(ins) {
	var index = FetchIns.indexOf(ins)
	FetchIns.splice(index, 1)
	return ins
}

// Fetch扩展类
function FetchExtend(url, opts) {
	var _this = this
	this._status = 'pending'
	this._thenFn = []
	this._fetch = fetch(url, opts).then(function(res){
		_this._status === 'pending' && ( _this._status = 'resolved' )
		FetchIns_Delete(_this)
		return res
	}, function(err){
		_this._status === 'pending' && ( _this._status = 'rejected' )
		FetchIns_Delete(_this)
		return err
	})
}

// 重构fetch的then & catch方法
FetchExtend.prototype.then = function(resFn, rejFn) {
	var _this = this
	if (this._status !== 'abort') {
		this._thenFn.push([resFn, rejFn])
		this._fetch = this._fetch.then(function(res){
			return _this._status === 'resolved' && resFn && resFn(res)
		}, function(rej){
			return _this._status === 'rejected' && rejFn && resFn(rej)
		})
	}
	return this
}

FetchExtend.prototype.catch = function(catchFn) {
	var _this = this
	if (this._status !== 'abort') {
		this._thenFn.push([null, catchFn])
		this._fetch = this._fetch.catch(function(res){
			return _this._status === 'rejected' && catchFn && catchFn(res)
		})
	}
	return this
}

FetchExtend.prototype.abort = function(res) {
	if (this._status === 'pending') {
		this._status = 'abort'
		FetchIns_Delete(this)
		return this._thenFn.reduce(function(res, fn){
			return fn[1] instanceof Function ? fn[1](res) : res
		}, res || 'abort')
	} else {
		console.log('fetch实例已获取结果, 无法终止请求')
	}
}

// 实例化FetchExtend扩展类
function Fetch(url, opts) {
	if (!url) return
	var ins = new FetchExtend(url, opts || {})
	FetchIns_Add(ins)
	return ins
}

Fetch.clear = function() {
	FetchIns.forEach(function(fetch){
		fetch.abort()
	})
	FetchIns = []
}

module.exports = Fetch
