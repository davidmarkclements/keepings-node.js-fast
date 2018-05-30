'use strict'

const crypto = require('crypto')

module.exports = () => {
  const content = crypto.rng(5000).toString('hex')
  const ONE_MINUTE = 60000
  var last = Date.now()

  function timestamp () {
    var now = Date.now()
    if (now - last >= ONE_MINUTE) last = now
    return last
  }
  
  function etagger () {
    var cache = {}
    var afterEventAttached = false
    function attachAfterEvent (server) {
      if (afterEventAttached === true) return
      afterEventAttached = true
      server.on('after', (req, res) => {
        if (res.statusCode !== 200) return
        const key = req.url
        const etag = req.id()
        if (cache[key] !== etag) cache[key] = etag
      })
    }
    return function (req, res, next) {
      attachAfterEvent(this)
      const key = req.url
      if (key in cache) res.set('Etag', cache[key])
      res.set('Cache-Control', 'public, max-age=120')
      next()
    }
  }

  function fetchContent (url, cb) {
    setImmediate(() => {
      if (url !== '/seed/v1') cb(Object.assign(Error('Not Found'), {statusCode: 404}))
      else cb(null, content)
    })
  }

  return { timestamp, etagger, fetchContent }
  
}