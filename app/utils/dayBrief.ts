/**
 * "O dia no mercado" (PR-R4) — mapeia o briefing diário do Atlas nos 4 tópicos
 * que alimentam a seção-gatilho (cards de destaque) E o modal do resumo.
 *
 * DECISÃO DO DONO (PLANO-REFRESH-HOME-LOGIN §"Lacuna de dado"): o modal foi
 * desenhado com 4 blocos estruturados (O placar / O que puxou / O que ficou pra
 * trás / A leitura do Atlas), mas o backend hoje entrega o briefing como CORPO
 * ÚNICO. V1: o corpo real flui na estrutura dos 4 rótulos, na ordem —
 *   placar  = 1º parágrafo do corpo   (real quando há briefing)
 *   puxou   = 2º parágrafo            (real se existir, senão mock do design)
 *   ficou   = 3º parágrafo            (real se existir, senão mock do design)
 *   leitura = takeaway "o que segurar" (real só no seed do /mercado; a API atual
 *             não separa esse bloco → cai no mock do design)
 * Cards de destaque: o 1º card usa dados REAIS (delta do IBOV + headline); os
 * outros 3 mostram a copy neutra do design (placeholder honesto) até o loop
 * atlas-daily-briefing gerar os 4 campos estruturados (fase 2, plano à parte).
 * NÃO inventa número: o único número dos cards é o delta real do IBOV; quando
 * ausente, cai no placeholder do design (o mesmo seed que o app já embarca).
 */
import type { NuBriefing, NuDayTopic, NuStatPill } from '~/types/market'

/* Copy exata dos designs v2 (placeholder honesto). Cards: números só no card 1;
   os demais são frases editoriais neutras. Modal: parágrafos completos. */
const MOCK_CARD = {
  placar: { stat: '+1,22%', blurb: 'Ibovespa a 172.742 pontos, o melhor pregão da semana, com 65 das 82 ações no azul.' },
  puxou: { title: 'Bancos & duration.', blurb: 'Curva de juros em queda e dólar a R$ 5,13 giraram o fluxo para os setores sensíveis a juros.' },
  ficou: { title: 'Petróleo.', blurb: 'O alívio que animou a bolsa tira prêmio do óleo: Petrobras andou na contramão, com PETR4 a −1,08%.' },
  leitura: { title: 'A leitura.', blurb: 'Rali de alívio, não de fundamento. Falta o estrangeiro confirmar o movimento.' },
} as const

const MOCK_MODAL = {
  placar: 'O Ibovespa fechou aos 172.742 pontos, alta de 1,22%, o melhor pregão da semana. Foram 65 das 82 ações no campo positivo, com o giro financeiro concentrado nas blue chips.',
  puxou: 'A largada veio da renda fixa: a curva de juros cedeu de ponta a ponta e o dólar recuou para R$ 5,13. Esse alívio girou o fluxo para os setores mais sensíveis a juros: bancos e nomes de <i>duration</i> longa lideraram os ganhos.',
  ficou: 'Na contramão, o petróleo. O mesmo alívio que animou a bolsa tira prêmio do óleo, e a Petrobras andou de lado: PETR4 caiu 1,08% e PETR3, 1,40%.',
  leitura: 'É um rali de alívio, não de fundamento. O movimento se sustenta enquanto a curva de juros seguir cedendo, mas falta o investidor estrangeiro confirmar a entrada para o fôlego virar tendência. Sem esse fluxo, o teto de curto prazo fica perto dos 174 mil pontos.',
} as const

interface DayBriefCore {
  headline: string
  ibovDelta: string | null   // '+1,22%' — delta do dia do IBOV (real)
  body: string[]             // parágrafos do corpo, em ordem (HTML já escapado)
  takeawayHtml: string | null
}

function ibovDeltaOf(pills: NuStatPill[]): string | null {
  return pills.find((p) => p.label === 'Ibovespa')?.delta ?? null
}

/** Núcleo do mapeamento — distribui o corpo real nos 4 tópicos com fallback. */
export function buildDayTopics(core: DayBriefCore): NuDayTopic[] {
  return [
    {
      label: 'O placar',
      labelColor: 'var(--nu-gray)',
      icon: 'trend',
      stat: core.ibovDelta ?? MOCK_CARD.placar.stat,
      cardTitle: null,
      cardBlurb: core.headline?.trim() || MOCK_CARD.placar.blurb,
      modalHtml: core.body[0] ?? MOCK_MODAL.placar,
      real: core.body[0] != null,
    },
    {
      label: 'O que puxou',
      labelColor: 'var(--nu-day-puxou)',
      icon: 'bars',
      stat: null,
      cardTitle: MOCK_CARD.puxou.title,
      cardBlurb: MOCK_CARD.puxou.blurb,
      modalHtml: core.body[1] ?? MOCK_MODAL.puxou,
      real: core.body[1] != null,
    },
    {
      label: 'O que ficou pra trás',
      labelColor: 'var(--nu-day-ficou)',
      icon: 'flame',
      stat: null,
      cardTitle: MOCK_CARD.ficou.title,
      cardBlurb: MOCK_CARD.ficou.blurb,
      modalHtml: core.body[2] ?? MOCK_MODAL.ficou,
      real: core.body[2] != null,
    },
    {
      label: 'A leitura da IA',
      labelColor: 'var(--nu-blue)',
      icon: 'compass',
      stat: null,
      cardTitle: MOCK_CARD.leitura.title,
      cardBlurb: MOCK_CARD.leitura.blurb,
      modalHtml: core.takeawayHtml ?? MOCK_MODAL.leitura,
      real: core.takeawayHtml != null,
    },
  ]
}

/** Adaptador do briefing do /mercado (useNuBriefing → NuBriefing). */
export function dayTopicsFromNuBriefing(b: NuBriefing): NuDayTopic[] {
  return buildDayTopics({
    headline: b.headline,
    ibovDelta: ibovDeltaOf(b.pills),
    body: [...b.paragraphs, ...b.extraParagraphs],
    takeawayHtml: b.takeaway?.html ?? null,
  })
}
