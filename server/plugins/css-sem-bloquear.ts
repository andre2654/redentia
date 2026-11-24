import { cssSemBloquear } from '../utils/css-sem-bloquear.ts'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head = html.head.map(cssSemBloquear)
  })
})
