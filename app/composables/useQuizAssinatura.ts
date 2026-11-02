/**
 * Quem abre e fecha o quiz do "Conectar carteira" (31/10/2026). Um só no site
 * (o AssinaturaQuiz vive no layout desde 02/11/2026: abre de qualquer página,
 * do /assinar, do paywall e do chat), e
 * os eventos do funil vão para o GA4 só com o passo, nunca com as respostas.
 */
export function useQuizAssinatura() {
  const aberto = useState('quiz:aberto', () => false)
  const origem = useState<string>('quiz:origem', () => '')
  /** abre direto no passo do CPF (o checkout respondeu cpf_necessario) */
  const direto = useState<'dados' | null>('quiz:direto', () => null)
  /** o quiz está montado nesta página (o /assinar e o paywall); fora dele, o botão manda ao /assinar */
  const montado = useState('quiz:montado', () => false)

  function evento(nome: string, params: Record<string, unknown> = {}) {
    if (import.meta.server) return
    ;(window as any).gtag?.('event', nome, { origem: origem.value, ...params })
  }

  function abrir(de: string) {
    origem.value = de
    direto.value = null
    aberto.value = true
    evento('quiz_aberto')
  }
  /** Falta o CPF para o pagamento: o quiz abre no passo dos dados (ou o /assinar abre, se o quiz não está aqui). */
  function abrirNosDados(de: string) {
    if (!montado.value) return navigateTo('/assinar?dados=1')
    origem.value = de
    direto.value = 'dados'
    aberto.value = true
    evento('quiz_dados_aberto')
  }
  function fechar() {
    aberto.value = false
  }

  return { aberto, origem, direto, montado, abrir, abrirNosDados, fechar, evento }
}
