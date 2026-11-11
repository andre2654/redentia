<script setup lang="ts">
// "O que está na tese" (11/11/2026, docs/aportou/tese.md): os ativos como uma
// LISTA de linhas que abrem (TeseAtivoLinha), no lugar da grade de cartões que
// despejava o `status`, o `rationale` e o `catalyst` inteiros.
//
// De onde vem cada linha: de `ativos` (data.companies[] do detail, com os
// textos crus que utils/teseTexto reparte). A avaliação do estudo mais recente
// (studies[0].assets: decisão, avaliação e porquê), que era o texto do cartão
// de antes, entra no topo da linha aberta. Sem `ativos` (o seed do design, com
// o backend fora do ar) a linha sai dos cartões de sempre.
//
// PAYWALL (dono, 14/07/2026), a MESMA regra: para o visitante só os 2
// primeiros ativos abrem; os 3 seguintes aparecem trancados e um cartão de
// convite pede o cadastro para abrir o resto. Mudou só a forma: a linha
// trancada mostra o código, o nome e o papel com um cadeado, sem texto
// embaçado. Quem entrou vê tudo, sem convite.
import type { TeseAtivoVM, TeseEvalBadgeVariant, TeseEvalCardVM, TeseStudyVM } from '~/types/tese'
import type { TeseLinhaVM } from './TeseAtivoLinha.vue'
import { partesDoCatalyst, partesDoStatus, primeirosPeriodos, revisoesDaMaisNova } from '~/utils/teseTexto'

const props = withDefaults(defineProps<{
  ativos: TeseAtivoVM[]
  /** os cartões de antes (studies[0].assets ou companies): só para o seed, sem `ativos` */
  cards: TeseEvalCardVM[]
  /** o estudo mais recente: a avaliação por ativo dele abre cada linha */
  ultimoEstudo: TeseStudyVM | null
  metaLine: string | null
  studiesCount?: number
  // a tese tem relatório completo? (só então o convite promete o relatório)
  hasReport?: boolean
}>(), { studiesCount: 0, hasReport: false })
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
const painel = useChatPainel()

const { isAuthenticated } = useAuthState()
const route = useRoute()
const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

// /asset só existe pra tickers B3 (PETR4, CATP34, E1TN34…) — formato validado
// pelo middleware da página de ativo; fora do formato, sem link.
const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/
const hrefFor = (ticker: string): string | null => (TICKER_RE.test(ticker.toUpperCase()) ? `/asset/${ticker.toUpperCase()}` : null)

type Tom = TeseLinhaVM['seloTom']
// o tom do selo do papel, pela mesma leitura do badge de antes (evalBadge do useTese)
function tomDoPapel(texto: string): Tom {
  const n = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (n.startsWith('mantem') || n.startsWith('nucleo')) return 'verde'
  if (n.startsWith('acompanhar') || n.startsWith('entra') || n.startsWith('em observacao')) return 'azul'
  if (n.startsWith('em risco') || n.startsWith('sai') || n.startsWith('reduz')) return 'vermelho'
  return 'neutro'
}
const TOM_DO_BADGE: Record<TeseEvalBadgeVariant, Tom> = { green: 'verde', blue: 'azul', 'blue-solid': 'azul', red: 'vermelho', neutral: 'neutro' }

// o gatilho comprido também recolhe (o da Deere tem 2,4 mil caracteres)
const partido = (texto: string, min = 420) => (texto.length > min ? primeirosPeriodos(texto, 2) : { inicio: texto, resto: '' })

const linhas = computed<TeseLinhaVM[]>(() => {
  if (props.ativos.length) {
    const estudo = props.ultimoEstudo
    return props.ativos.map((a) => {
      const st = partesDoStatus(a.status)
      const cat = partesDoCatalyst(a.catalyst)
      const av = estudo?.assets?.find((x) => x.ticker === a.ticker) ?? null
      return {
        ticker: a.ticker,
        name: a.name,
        role: a.role,
        selo: st.selo ?? null,
        seloTom: tomDoPapel(st.selo ?? ''),
        data: st.data ?? null,
        frase: st.texto,
        porque: primeirosPeriodos(a.rationale, 2),
        gatilho: partido(cat.gatilho),
        revisoes: revisoesDaMaisNova(cat.revisoes),
        ultima: av && (av.assessment || av.why)
          ? { rotulo: estudo?.rowDate ? `No estudo de ${estudo.rowDate}` : 'No último estudo', decisao: av.decision, tom: TOM_DO_BADGE[av.variant] ?? 'neutro', avaliacao: av.assessment, porque: av.why }
          : null,
        href: hrefFor(a.ticker),
      }
    })
  }
  // o seed do design: o cartão de antes vira a linha (o selo, a frase e o porquê)
  return props.cards.map((c) => ({
    ticker: c.ticker,
    name: c.name,
    role: '',
    selo: c.badgeText || null,
    seloTom: TOM_DO_BADGE[c.badgeVariant] ?? 'neutro',
    data: null,
    frase: c.txt,
    porque: { inicio: c.pq, resto: '' },
    gatilho: { inicio: '', resto: '' },
    revisoes: [],
    ultima: null,
    href: hrefFor(c.ticker),
  }))
})

const FREE = 2 // ativos que abrem para o visitante
const TEASE = 3 // ativos trancados de amostra antes do convite
const total = computed(() => linhas.value.length)
// Logado: todos. Visitante: os FREE abertos + alguns trancados.
const visiveis = computed(() => (isAuthenticated.value ? linhas.value : linhas.value.slice(0, FREE + TEASE)))
const trancada = (i: number) => !isAuthenticated.value && i >= FREE
const showGate = computed(() => !isAuthenticated.value && total.value > FREE)

const titulo = computed(() => (total.value === 1 ? '1 ativo, com um papel.' : `${total.value} ativos, cada um com um papel.`))

const textoDoContexto = (l: TeseLinhaVM) => [
  `${l.ticker} (${l.name}) na tese ${sobre}${l.selo ? `: ${l.selo}` : ''}`,
  l.role ? `Papel: ${l.role}` : '',
  l.frase,
  l.ultima ? `${l.ultima.avaliacao}. ${l.ultima.porque}` : '',
  l.porque.inicio ? `Por que está na tese: ${l.porque.inicio}` : '',
].filter(Boolean).join('\n')
const contextoDe = (l: TeseLinhaVM) => ({ id: `tese-ativo:${sobre}:${l.ticker}`, tipo: 'tese', rotulo: rotuloCurto(`${l.ticker} na tese`), texto: textoDoContexto(l) })
// abre o painel do chat com o ativo anexado, sem pergunta: a pessoa escreve
function perguntar(l: TeseLinhaVM) {
  painel.abrir(undefined, [{ ...contextoDe(l), rota: route.path }])
}
</script>

<template>
  <section id="ativos" class="tat">
    <div class="tat__cab">
      <div>
        <NuEyebrow como="p">O que está na tese</NuEyebrow>
        <h2 class="tat__h2">{{ titulo }}</h2>
      </div>
      <span v-if="metaLine" class="tat__meta">{{ metaLine }}</span>
    </div>

    <div class="tat__lista">
      <template v-for="(l, i) in visiveis" :key="l.ticker">
        <TeseAtivoLinha v-if="!trancada(i)" :linha="l" :indice="i" :contexto="contextoDe(l)" @perguntar="perguntar(l)" />
        <!-- trancada (visitante): o código, o nome e o papel, com o cadeado -->
        <div v-else class="tat__trancada" :style="{ '--i': i }">
          <span class="tat__t-id">
            <NuAssetLogo :ticker="l.ticker" :letter="l.ticker.charAt(0) || '?'" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)" :size="44" :radius="14" />
            <span class="tat__t-quem">
              <span class="tat__t-nomes"><span class="tat__t-ticker">{{ l.ticker }}</span><span class="tat__t-nome">{{ l.name }}</span></span>
              <span v-if="l.role" class="tat__t-papel">{{ l.role }}</span>
            </span>
          </span>
          <span class="tat__cadeado" role="img" aria-label="Abre com a conta grátis">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" /><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" /></svg>
          </span>
        </div>
      </template>
    </div>

    <!-- CONVITE (só visitante): pede o cadastro pra abrir o resto da tese -->
    <NuFaixaMarca v-if="showGate" rotulo="Tese completa" como="p" :altura="56" class="tat__gate">
      <div class="tat__gate-in">
        <div class="tat__gate-left">
          <h2 class="tat__gate-title">Você viu {{ FREE }} dos {{ total }} ativos.</h2>
          <p class="tat__gate-sub">Crie sua conta grátis para abrir a tese completa: a avaliação de todos os ativos, os sinais de risco, {{ hasReport ? 'o relatório completo' : 'o risco central' }} e o diário, revalidado todo dia pela Aportou.</p>
          <div class="tat__gate-actions">
            <NuBotaoSeta :to="loginTo" variante="azul" tamanho="m">Criar conta grátis</NuBotaoSeta>
            <NuxtLink :to="loginTo" class="tat__gate-ghost">Já tenho conta</NuxtLink>
          </div>
          <span class="tat__gate-micro">Grátis, sem cartão de crédito</span>
        </div>
        <ul class="tat__gate-list">
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Avaliação dos <b>{{ total }} ativos</b> da carteira</span></li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Sinais de risco e risco central</span></li>
          <li v-if="hasReport"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>O <b>relatório completo</b> da tese</span></li>
          <li v-if="studiesCount > 0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Diário da tese <b>· {{ studiesCount }} estudos</b></span></li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Acompanhe e receba alertas</span></li>
        </ul>
      </div>
    </NuFaixaMarca>
  </section>
</template>

<style scoped>
.tat {
  background: var(--nu-page); scroll-margin-top: 120px;
  padding: clamp(56px, 5.6vw, 80px) max(clamp(20px, 4vw, 56px), calc((100% - 1240px) / 2));
}
.tat__cab { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px 22px; flex-wrap: wrap; animation: nu-fade .5s ease both; }
.tat__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; }
.tat__meta { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }

.tat__lista { display: flex; flex-direction: column; gap: 10px; margin-top: clamp(28px, 3vw, 36px); }

/* a linha trancada do visitante: o mesmo cartão, sem miolo, com o cadeado */
.tat__trancada {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px clamp(16px, 2vw, 24px); border-radius: var(--nu-r-panel);
  background: color-mix(in srgb, var(--nu-card) 60%, var(--nu-page)); box-shadow: inset 0 0 0 1px var(--nu-line-2);
  animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms);
}
.tat__t-id { display: flex; align-items: center; gap: 14px; min-width: 0; }
.tat__t-quem { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.tat__t-nomes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tat__t-ticker {
  display: inline-flex; align-items: center; height: 26px; padding: 0 9px; border-radius: var(--nu-r-tag);
  background: var(--nu-gray); color: var(--nu-white); font-size: 13.5px; font-weight: var(--nu-w-forte); letter-spacing: .04em;
}
.tat__t-nome { color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; line-height: 1.2; }
.tat__t-papel { color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.35; }
.tat__cadeado { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--nu-cream-2); color: var(--nu-gray-3); }

/* ——— o convite do visitante: o cartão carvão com a faixa da marca ——— */
.tat__gate { margin-top: 20px; }
.tat__gate-in {
  padding: clamp(24px, 3vw, 40px) clamp(24px, 3.6vw, 48px) clamp(28px, 3.4vw, 44px);
  display: flex; gap: clamp(28px, 4vw, 72px); align-items: center; flex-wrap: wrap;
}
.tat__gate-left { flex: 1 1 380px; min-width: min(320px, 100%); }
.tat__gate-title {
  margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h3);
  font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05;
}
.tat__gate-sub {
  margin: 14px 0 0; color: var(--nu-on-dark); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500;
  line-height: 1.5; max-width: 48ch;
}
.tat__gate-actions { display: flex; align-items: center; gap: 12px 24px; flex-wrap: wrap; margin-top: 26px; }
.tat__gate-ghost {
  display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio);
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-dark-chip-line);
  transition: text-decoration-color .2s ease;
}
.tat__gate-ghost:hover { color: var(--nu-white); text-decoration-color: currentColor; }
.tat__gate-micro { display: block; margin-top: 14px; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 500; }

.tat__gate-list {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 14px; flex: 0 1 360px; min-width: min(280px, 100%);
}
.tat__gate-list li { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-on-dark); font-size: 15.5px; font-weight: 600; line-height: 1.4; }
.tat__gate-list svg { color: var(--nu-green-soft); flex-shrink: 0; margin-top: 1px; }
.tat__gate-list b { color: var(--nu-white); font-weight: var(--nu-w-forte); }
@media (prefers-reduced-motion: reduce) { .tat__cab, .tat__trancada { animation: none; } }
</style>
