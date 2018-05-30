'use strict'

const restify = require('restify')
const { etagger, timestamp, fetchContent } = require('./util')()
const server = restify.createServer()

server.use(etagger().bind(server))

server.get('/seed/v1', function (req, res, next) {
  fetchContent(req.url, (err, content) => {
    if (err) return next(err)
    const ts = timestamp()
    req.id(ts.toString())
    res.end(`{"data": "${content}", "url": "${req.url}", "ts": ${ts}}`)
    next()
  })
})

server.listen(3000)

