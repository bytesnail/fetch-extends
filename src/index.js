/**
 * 通用fetch组件
 * 参考文章：https://segmentfault.com/a/1190000003810652
 * https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalFetch/fetch
 */
import fetch from 'isomorphic-fetch';

// FetchHandle集合
let FetchHandle = {}

function getFetchHandle() {
	let handle
	do {
		handle = parseInt(Math.random() * 90000000) + 10000000
	} while (FetchHandle[handle])
	return handle
}

class Fetch {
	static FetchHandle = {}
	constructor(url, opts) {
		this._fetchHandle = getFetchHandle()
		this._thenFn = []
		this._catchFn = null
		this._fetch = fetch(url, opts).then(
			res => {
				return FetchHandle[this._fetchHandle] && this._thenFn.reduce(function(p, fn){
					return p.then(...fn)
				}, Promise.resolve(res))
			},
			rej => {
				return FetchHandle[this._fetchHandle] && this._thenFn.reduce(function(p, fn){
					return p.then(...fn)
				}, Promise.reject(res))
			}
		).catch(err => {
			FetchHandle[this._fetchHandle] && typeof this._catchFn === 'function' && this._catchFn(err)
		})
		FetchHandle[this._fetchHandle] = true
	}
	then = (res, rej) => {
		this._thenFn.push([res,rej])
		return this
	}
	catch = (fn) => {
		this._catchFn = fn
		return this
	}
	ignore = () => {
		console.log('Fetch ignore')
		ignoreFetch(this._fetchHandle)
	}
	getHandle = () => {
		return this._fetchHandle
	}
}

function xFetch(url, opts) {
	opts = Object.assign({
		// mode:'no-cors',
		credentials: 'include'
	}, opts);
	return new Fetch(url, opts)
			.then(checkErr)
			.then(foramt)
			.then(rs=>{
				return bizErrHandler(rs, url, opts)
			});
}

function ignoreFetch(handle) {
	delete FetchHandle[handle]
}

function ignoreAll() {
	FetchHandle = {}
}

export default {
	fetch: xFetch,
	ignore: ignoreFetch,
	ignoreAll: ignoreAll
}
