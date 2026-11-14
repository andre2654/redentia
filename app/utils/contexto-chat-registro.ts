/**
 * Registro dos pedaços da página que podem ser mostrados à Redentia (02/11/2026).
 * A diretiva `v-contexto-chat` (plugins/contexto-chat.ts) marca o elemento
 * com `data-chat-contexto` e guarda o valor aqui; o ChatSeletor lê no clique.
 *
 * `texto` é opcional: sem ele, vale o texto visível do elemento no momento do
 * clique (o dado que a pessoa está vendo, nunca um número de outra fonte).
 */
export interface ValorContextoChat {
  id: string
  tipo: string
  rotulo: string
  texto?: string
}

const valores = new WeakMap<Element, ValorContextoChat>()

export function registrarContextoChat(el: Element, v: ValorContextoChat | null | undefined) {
  if (v && v.id && v.rotulo) {
    valores.set(el, v)
    el.setAttribute('data-chat-contexto', v.tipo)
  } else {
    valores.delete(el)
    el.removeAttribute('data-chat-contexto')
  }
}

export function contextoChatDoElemento(el: Element): ValorContextoChat | undefined {
  return valores.get(el)
}
