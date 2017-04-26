'use strict';

var fetch = require('isomorphic-fetch');

// FetchExtend实例钩子
var FetchHandle = {}

function getFetchHandle() {
	var handle
	do {
		handle = parseInt(Math.random() * 90000000) + 10000000
	} while (FetchHandle[handle])
	return handle
}

function reduce(fns, type) {
	fns.reduce(function(p, fn){
		return p.then(...fn)
	}, type ? Promise.resolve() : Promise.reject())
}

// fetch扩展类
function FetchExtend() {
	this._fetchHandle = getFetchHandle(this)
	this._thenFn = []
	this._fetch = fetch(url, opts).then(
		res => {
			FetchHandle[this._fetchHandle] && (FetchHandle[this._fetchHandle] = true)
		},
		rej => {
			FetchHandle[this._fetchHandle] && (FetchHandle[this._fetchHandle] = true)
		}
	)
}

// 重构fetch的then & catch方法
FetchExtend.prototype.then = function(resFn, rejFn) {
	if (FetchHandle[this._fetchHandle]) {
		this._thenFn.push([resFn, rejFn])
		this._fetch.then(
			res => {
				return FetchHandle[this._fetchHandle] && resFn && resFn(res)
			},
			rej => {
				return FetchHandle[this._fetchHandle] && rejFn && resFn(rej)
			}
		)
	}
	return this
}

FetchExtend.prototype.catch = function(catchFn) {
	if (FetchHandle[this._fetchHandle]) {
		this._thenFn.push([undefined, catchFn])
		this._fetch.catch(res => {
			return FetchHandle[this._fetchHandle] && catchFn && catchFn(res)
		})
	}
	return this
}

FetchExtend.prototype.abort = function() {
	if (FetchHandle[handle] instanceof FetchExtend) {
		Fetch.clear(this._fetchHandle)
		return reduce(this._thenFn)
	} else {
		console.log('fetch实例不存在或已获取Promise结果')
	}
}

FetchExtend.prototype.getHandle = function() {
	return this._fetchHandle
}

// 输出FetchExtend实例
function Fetch(url, opts) {
	var ins = new FetchExtend(url, opts)
	FetchHandle[ins.getHandle()] = ins
	return ins
}

Fetch.clear = function(handle) {
	delete FetchHandle[handle]
}

Fetch.clearAll = function() {
	FetchHandle = {}
}

module.exports = Fetch
