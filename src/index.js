import fetch from 'isomorphic-fetch'

export default class Fetch {
	static handle = {}
	static getHandle = (instance) => {
		let handle
		do {
			handle = parseInt(Math.random() * 90000000) + 10000000
		} while (Fetch.handle[handle])
		Fetch.handle[handle] = instance
		return handle
	}
	static create = (url, opts) => {
		return new Fetch(url, opts)
	}
	static clear = (handle) => {
		let result = Fetch.handle[handle] instanceof Fetch
		delete Fetch.handle[handle]
		return result
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
		this._fetchHandle = Fetch.getHandle(this)
		this._thenFn = []
		this._fetch = fetch(url, opts).then(
			res => {
				Fetch.handle[this._fetchHandle] && (Fetch.handle[this._fetchHandle] = true)
			},
			rej => {
				Fetch.handle[this._fetchHandle] && (Fetch.handle[this._fetchHandle] = true)
			}
		)
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
		return Fetch.clear(this._fetchHandle) && Fetch.reduce(this._thenFn)
	}
}
