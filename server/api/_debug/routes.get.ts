// Debug endpoint: dumps the runtime routeRules so we can verify that
// the Vercel ISR config (expiration + allowQuery) landed in the build.
//
// Usage: curl https://www.redentia.com.br/api/_debug/routes

import { useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const routeRules = (config.nitro?.routeRules || {}) as Record<string, any>

  // Pick the branded-relevant routes only so the output is readable
  const branded = ['/', '/guias', '/calculadora', '/institucional/**', '/glossario', '/download']
  const picked: Record<string, any> = {}
  for (const route of branded) {
    if (routeRules[route]) picked[route] = routeRules[route]
  }

  return {
    resolverVersion: '2026-04-12-v3-isr-allowquery',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
    deployEnv: process.env.VERCEL_ENV || 'dev',
    brandedRoutes: picked,
    totalRoutes: Object.keys(routeRules).length,
    timestamp: new Date().toISOString(),
  }
})
