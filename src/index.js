import fetch from 'isomorphic-fetch'

export default class Fetch {
	static handle = {}
	static getHandle = () => {
		let handle
		do {
			handle = parseInt(Math.random() * 90000000) + 10000000
		} while (Fetch.handle[handle])
		return handle
	}
	static create = (url, opts) => {
		return new Fetch(url, opts)
	}
	static clear = (handle) => {
		delete Fetch.handle[handle]
	}
	static clearAll = () => {
		Fetch.handle = {}
	}
	static reduce = (fns, type) => {
		fns.reduce(function(p, fn){
			return p.then(...fn)
		}, type ? Promise.resolve() : Promise.reject())
	}
	constructor(url, opts) {
		this._fetchHandle = Fetch.getHandle()
		this._thenFn = []
		this._fetch = fetch(url, opts)
		Fetch.handle[this._fetchHandle] = this
	}
	then = (resFn, rejFn) => {
		this._thenFn.push([resFn, rejFn])
		this._fetch.then(
			res => {
				return Fetch.handle[this._fetchHandle] && resFn && resFn(res)
			},
			rej => {
				return Fetch.handle[this._fetchHandle] && rejFn && resFn(rej)
			}
		)
		return this
	}
	catch = (catchFn) => {
		this._thenFn.push([undefined, catchFn])
		this._fetch.catch(res => {
			return Fetch.handle[this._fetchHandle] && catchFn && catchFn(res)
		})
		return this
	}
	abort = () => {
		Fetch.clear(this._fetchHandle)
		Fetch.reduce(this._thenFn)
	}
}
