/**
 * A pergunta que se escreve sozinha e a resposta que sai palavra por palavra,
 * no ritmo do herói da home (MercadoHeroPergunta). Desde 21/10/2026 a cena da
 * pergunta no painel do login usa o mesmo ritmo, a pedido do dono: "deixe
 * igual no hero, com a animação de escrita, loading e a resposta sendo gerada".
 *
 * Fases: digitando → pensando → respondendo → lendo → apagando, e o próximo
 * par. Com `repetir: false` a demonstração para em "lendo" depois do primeiro
 * par. Com `vazia`, ela nasce com a barra vazia; sem, nasce com o primeiro par
 * já respondido, o que serve ao SSR e ao movimento reduzido. `parar()` congela
 * onde estiver (a pessoa clicou na barra para escrever).
 */
import type { Ref } from 'vue'

export interface ParDemo { q: string; a: string }
export type FaseDemo = 'digitando' | 'pensando' | 'respondendo' | 'lendo' | 'apagando'

export function usePerguntaDemo(pares: Readonly<Ref<ParDemo[]>>, { repetir = true, espera = 0, vazia = false } = {}) {
  const i = ref(0)
  const digitado = ref(vazia ? '' : (pares.value[0]?.q ?? ''))
  const fase = ref<FaseDemo>(vazia ? 'digitando' : 'lendo')
  const palavras = computed(() => (pares.value[i.value]?.a ?? '').split(' '))

  let timer: ReturnType<typeof setTimeout> | null = null
  let vivo = true
  const esperar = (ms: number) => new Promise<void>((ok) => { timer = setTimeout(ok, ms) })

  async function rodar() {
    if (espera) await esperar(espera)
    while (vivo) {
      const par = pares.value[i.value]
      if (!par) return
      fase.value = 'digitando'
      digitado.value = ''
      for (const ch of par.q) {
        if (!vivo) return
        digitado.value += ch
        await esperar(ch === ' ' ? 55 : 34)
      }
      fase.value = 'pensando'
      await esperar(900)
      if (!vivo) return
      fase.value = 'respondendo'
      await esperar(palavras.value.length * 55 + 500)
      if (!vivo) return
      fase.value = 'lendo'
      if (!repetir) return
      await esperar(3400)
      if (!vivo) return
      fase.value = 'apagando'
      await esperar(450)
      i.value = (i.value + 1) % pares.value.length
    }
  }

  /** o par atual inteiro, já respondido (movimento reduzido) */
  function mostrar() {
    digitado.value = pares.value[i.value]?.q ?? ''
    fase.value = 'lendo'
  }

  function parar() {
    vivo = false
    if (timer) clearTimeout(timer)
  }
  onBeforeUnmount(parar)

  return { i, digitado, fase, palavras, rodar, mostrar, parar }
}
