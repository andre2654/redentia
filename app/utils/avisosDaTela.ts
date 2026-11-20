/**
 * A tela /avisos (canvas "WhatsApp: ative seus avisos", 20/11/2026): os
 * quatro avisos, cada um com WhatsApp e e-mail, e o que cada cartão grava nos
 * tópicos de `NotificationPreferenceController::TOPICS`. É a tela que o
 * "Escolher avisos" do WhatsApp abre já na conta da pessoa: o link traz, no
 * fragmento (#u=…&expires=…&signature=…), a assinatura do caminho da API
 * (`GET/PUT /avisos/{u}`), que só lê e grava estas preferências.
 *
 * "O mês" junta dois tópicos (os proventos do dia 1 e o relatório do dia 2):
 * ligado quando algum dos dois está ligado; o toque liga ou desliga os dois.
 *
 * Puro, sem import do Nuxt: roda no `node --test` (tests/avisos-da-tela.test.ts).
 */
import type { TopicoCarteira } from './avisosCanais.ts'

export type TopicoDaTela = 'daily_briefing' | TopicoCarteira
export type Canal = 'whatsapp' | 'email'
export type CanaisDoTopico = Record<Canal, boolean>
export type PrefsDaTela = Record<TopicoDaTela, CanaisDoTopico>

export interface AvisoDaTela {
  id: string
  nome: string
  quando: string
  topicos: TopicoDaTela[]
}

export const AVISOS_DA_TELA: AvisoDaTela[] = [
  { id: 'bom-dia', nome: 'Bom dia', quando: 'Todo dia útil, às 8h', topicos: ['daily_briefing'] },
  { id: 'provento', nome: 'Provento na conta', quando: 'No dia em que cai, 19h30', topicos: ['carteira_provento_pago'] },
  { id: 'semana', nome: 'A semana', quando: 'Sábado, às 9h', topicos: ['carteira_semana'] },
  { id: 'mes', nome: 'O mês', quando: 'Proventos no dia 1, relatório no dia 2', topicos: ['carteira_proventos_mes', 'carteira_relatorio'] },
]

export const TOPICOS_DA_TELA: TopicoDaTela[] = AVISOS_DA_TELA.flatMap((a) => a.topicos)

export const CANAIS: { id: Canal, nome: string }[] = [
  { id: 'whatsapp', nome: 'WhatsApp' },
  { id: 'email', nome: 'E-mail' },
]

export function prefsVazias(): PrefsDaTela {
  return Object.fromEntries(TOPICOS_DA_TELA.map((t) => [t, { email: false, whatsapp: false }])) as PrefsDaTela
}

/** As preferências da resposta da API (a do link ou a /me/notification-preferences), só as da tela. */
export function prefsDaResposta(r: Record<string, Partial<CanaisDoTopico> | undefined> | null | undefined): PrefsDaTela {
  const p = prefsVazias()
  for (const t of TOPICOS_DA_TELA) p[t] = { email: !!r?.[t]?.email, whatsapp: !!r?.[t]?.whatsapp }
  return p
}

/** O cartão está ligado no canal quando algum tópico dele está. */
export function ligado(prefs: PrefsDaTela, aviso: AvisoDaTela, canal: Canal): boolean {
  return aviso.topicos.some((t) => prefs[t][canal])
}

/** O toque no canal do cartão: todos os tópicos dele passam ao valor novo (o WhatsApp só com o aceite). */
export function alternar(prefs: PrefsDaTela, aviso: AvisoDaTela, canal: Canal, valor: boolean, podeWhatsapp: boolean): PrefsDaTela {
  if (canal === 'whatsapp' && !podeWhatsapp) return prefs
  const novo = { ...prefs }
  for (const t of aviso.topicos) novo[t] = { ...prefs[t], [canal]: valor }
  return novo
}

/** Os tópicos que mudaram entre o que veio e o que vai ser salvo. */
export function mudancas(antes: PrefsDaTela, depois: PrefsDaTela): TopicoDaTela[] {
  return TOPICOS_DA_TELA.filter((t) => antes[t].email !== depois[t].email || antes[t].whatsapp !== depois[t].whatsapp)
}

export interface LinkDosAvisos {
  u: string
  expires: string
  signature: string
}

/**
 * O link assinado, do fragmento ("#u=3&expires=…&signature=…"). Só números no
 * `u` e no `expires` e só hexadecimal na assinatura: o resto vira null.
 */
export function linkDoFragmento(hash: string | null | undefined): LinkDosAvisos | null {
  const q = new URLSearchParams((hash ?? '').replace(/^#/, ''))
  const u = q.get('u') ?? ''
  const expires = q.get('expires') ?? ''
  const signature = q.get('signature') ?? ''
  if (!/^\d{1,12}$/.test(u) || !/^\d{1,12}$/.test(expires) || !/^[a-f0-9]{64}$/i.test(signature)) return null
  return { u, expires, signature }
}

/** O caminho da API (depois do /api/backend) com a assinatura, sem nenhum parâmetro a mais. */
export function caminhoDoLink(l: LinkDosAvisos): string {
  return `/avisos/${l.u}?expires=${l.expires}&signature=${l.signature}`
}

/** O link venceu? (`expires` em segundos, como o Laravel assina) */
export function linkVencido(l: LinkDosAvisos, agoraMs: number): boolean {
  return Number(l.expires) * 1000 <= agoraMs
}
