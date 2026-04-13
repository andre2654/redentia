/**
 * Catch leaked Vercel ISR internal routes (e.g. /index-isr, /asset/petr4-isr)
 * and redirect them back to the real route. These are internal function names
 * that should never be visible to the user.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const match = url.pathname.match(/^(.+)-isr$/)
  if (match) {
    const realPath = match[1] === '/index' ? '/' : match[1]
    return sendRedirect(event, realPath + url.search, 301)
  }
})
