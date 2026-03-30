import { ORPCError, os } from '@orpc/server'
import * as z from 'zod'

// Example context type (e.g. Cloudflare Workers env + request headers)
export type Context = {
  headers: Headers
}

// Base procedure builder with context
const base = os.$context<Context>()

// Auth middleware
const authed = base.use(async ({ context, next }) => {
  const token = context.headers.get('authorization')?.split(' ')[1]
  if (!token) {
    throw new ORPCError('UNAUTHORIZED')
  }
  // TODO: verify token
  return next({ context: { ...context, user: { id: '1', token } } })
})

// --- Procedures ---

export const healthCheck = base.handler(async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const EchoInput = z.object({ message: z.string().min(1) })

export const echo = base
  .input(EchoInput)
  .handler(async ({ input }) => {
    return { echo: input.message }
  })

export const secretData = authed.handler(async ({ context }) => {
  return { secret: 'Top secret!', user: context.user }
})

// --- Router ---

export const router = {
  health: healthCheck,
  echo,
  secret: secretData,
}

export type Router = typeof router
