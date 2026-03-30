import { Hono } from 'hono'
import { RPCHandler } from '@orpc/server/fetch'
import { onError } from '@orpc/server'
import { router } from './router.js'

const app = new Hono()

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('[oRPC error]', error)
    }),
  ],
})

// Mount oRPC under /rpc/*
app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context: {
      headers: c.req.raw.headers,
    },
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

// Health check route
app.get('/', (c) => {
  return c.json({ message: 'Hello Cloudflare Workers!' })
})

export default app
