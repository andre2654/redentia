/**
 * `v-contexto-chat="{ id, tipo, rotulo, texto? }"`: o pedaço da página que a
 * pessoa pode mostrar à Redentia com o painel do chat aberto (o cursor mágico,
 * ChatSeletor). Universal: no SSR a diretiva só precisa existir (o atributo
 * nasce no mount), senão o render do servidor reclama da diretiva sem registro.
 */
import type { ValorContextoChat } from '~/utils/contexto-chat-registro'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, ValorContextoChat | null | undefined>('contexto-chat', {
    getSSRProps: () => ({}),
    mounted(el, b) { registrarContextoChat(el, b.value) },
    updated(el, b) { registrarContextoChat(el, b.value) },
    unmounted(el) { registrarContextoChat(el, null) },
  })
})
