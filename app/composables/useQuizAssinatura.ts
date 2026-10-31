/**
 * Quem abre e fecha o quiz do "Conectar carteira" (31/10/2026). Um só no site
 * (o AssinaturaQuiz vive na AssinaturaVitrine, do /assinar e do paywall), e
 * os eventos do funil vão para o GA4 só com o passo, nunca com as respostas.
 */
export function useQuizAssinatura() {
  const aberto = useState('quiz:aberto', () => false)
  const origem = useState<string>('quiz:origem', () => '')

  function evento(nome: string, params: Record<string, unknown> = {}) {
    if (import.meta.server) return
    ;(window as any).gtag?.('event', nome, { origem: origem.value, ...params })
  }

  function abrir(de: string) {
    origem.value = de
    aberto.value = true
    evento('quiz_aberto')
  }
  function fechar() {
    aberto.value = false
  }

  return { aberto, origem, abrir, fechar, evento }
}
