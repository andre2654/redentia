<script setup lang="ts">
// SÓ NO DEV (12/11/2026, o dono: "faça de um jeito que eu consiga ver os outros
// modos dessa barra"): a régua do mercado em todos os modos, um embaixo do
// outro, com o dado da API local e o relógio de cada momento parado
// (relogioDoDev, o mesmo do ?regua-estado=). Cada linha é a peça de verdade
// (NuReguaEsqueleto; NuReguaPalco com a cena parada; NuReguaBolsa com a fase
// parada) numa moldura com as medidas da régua (44px, 36 no celular, na coluna
// do site). "Rever as entradas" remonta tudo (a cascata e os textos chegando de
// novo); a barra larga tem o botão para ver o crescimento; o palco ao vivo
// troca de cena sozinho e no botão. Embaixo, a mesma vitrine num celular de
// 390px (esta página num iframe, com ?so=linhas). Fora do `nuxi dev` a rota nem
// existe (pages:extend no nuxt.config); o middleware de 404 é a segunda trava.
import { agoraEmSP, relogioDoDev, type MomentoDoDev } from '~/utils/pregao'
import { mercadoDoTopo } from '~/utils/topo'
import type { CenaDaRegua } from '~/utils/reguaDaBolsa'

definePageMeta({
  layout: false,
  middleware: [() => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
  }],
})
useSeoMeta({ title: 'A régua, todos os modos (dev)', robots: 'noindex, nofollow' })

const route = useRoute()
const soLinhas = computed(() => route.query.so === 'linhas')
const { isAuthenticated } = useAuthState()
const { bolsa, estado, carregar } = useReguaDaBolsa()

/* ————— o relógio e o dado de cada momento ————— */
function momento(m: MomentoDoDev) {
  const r = relogioDoDev(m)
  if (!r) return null
  const d = bolsa.value?.ibov?.data ?? null
  const data = r.dataDeHoje ? agoraEmSP(r.agora).iso : d
  return { agora: r.agora, data, mercado: mercadoDoTopo(r.agora, data) }
}
const MOMENTOS: { m: MomentoDoDev; nome: string }[] = [
  { m: 'pre', nome: 'Antes da abertura' },
  { m: 'aberta', nome: 'Pregão aberto' },
  { m: 'fechada', nome: 'Depois do fechamento' },
  { m: 'feriado', nome: 'Feriado' },
]
/** um relógio por momento, calculado uma vez (o dado chegando recalcula) */
const momentos = computed(() => Object.fromEntries(MOMENTOS.map((x) => [x.m, momento(x.m)])) as Record<MomentoDoDev, ReturnType<typeof momento>>)

interface Linha {
  id: string
  titulo: string
  quando: string
  m: MomentoDoDev
  peca: 'esqueleto' | 'cena' | 'barra'
  cena?: CenaDaRegua
  fase?: 'textos' | 'larga'
  visitante?: boolean
}
const LINHAS: Linha[] = [
  { id: 'esqueleto', titulo: 'Carregando', quando: 'No SSR e até o dado chegar: a forma da barra, sem número.', m: 'aberta', peca: 'esqueleto' },
  { id: 'contagem', titulo: 'Antes da abertura · a contagem', quando: 'Quanto falta para abrir e a linha que enche desde o último fechamento. Troca com a barra a cada minuto.', m: 'pre', peca: 'cena', cena: 'contagem' },
  { id: 'pre-barra', titulo: 'Antes da abertura · a barra do último pregão', quando: 'A outra cena da manhã.', m: 'pre', peca: 'barra', fase: 'textos', visitante: true },
  { id: 'aberta', titulo: 'Pregão aberto · a barra se forma, com os textos', quando: 'Ao vivo. A cada entrada os pedaços acendem da esquerda para a direita e os textos chegam depois.', m: 'aberta', peca: 'barra', fase: 'textos', visitante: true },
  { id: 'larga', titulo: 'Pregão aberto · 15 s depois, a barra larga', quando: 'Os textos saem e a barra cresce até a coluna. Os rótulos e a dica continuam.', m: 'aberta', peca: 'barra', fase: 'larga', visitante: true },
  { id: 'assinante', titulo: 'Pregão aberto · para quem assina', quando: 'A listra nas ações da carteira e "Sua carteira" à direita, com a amostra da listra.', m: 'aberta', peca: 'barra', fase: 'textos' },
  { id: 'fechamento', titulo: 'Depois do fechamento · a frase do dia', quando: 'Os fatos do pregão que o dado traz. Troca com a barra de hoje.', m: 'fechada', peca: 'cena', cena: 'fechamento' },
  { id: 'fechada-barra', titulo: 'Depois do fechamento · a barra de hoje', quando: 'A outra cena da noite.', m: 'fechada', peca: 'barra', fase: 'textos', visitante: true },
  { id: 'feriado-barra', titulo: 'Feriado ou fim de semana · a barra do último pregão', quando: 'Com o nome do feriado à esquerda.', m: 'feriado', peca: 'barra', fase: 'textos', visitante: true },
  { id: 'feriado-contagem', titulo: 'Feriado ou fim de semana · a contagem', quando: 'Quanto falta para o próximo pregão.', m: 'feriado', peca: 'cena', cena: 'contagem' },
]

/* ————— rever: remonta as linhas; a barra larga cresce de novo ————— */
const rodada = ref(1)
const reduzido = ref(false)
const fases = reactive<Record<string, 'textos' | 'larga'>>({})
let tCresce: ReturnType<typeof setTimeout> | null = null
function rever() {
  rodada.value++
}
function verCrescer(id: string) {
  if (tCresce) clearTimeout(tCresce)
  fases[id] = 'textos'
  rodada.value++
  tCresce = setTimeout(() => { fases[id] = 'larga' }, 1800)
}

/* ————— o palco ao vivo ————— */
const momentoVivo = ref<MomentoDoDev>('pre')
const palco = ref<{ proxima: () => void; doComeco: () => void } | null>(null)

onMounted(() => {
  reduzido.value = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  void carregar()
})
onBeforeUnmount(() => { if (tCresce) clearTimeout(tCresce) })
</script>

<template>
  <main class="dr" :class="{ 'dr--linhas': soLinhas }">
    <header v-if="!soLinhas" class="dr__topo">
      <h1 class="dr__h1">A régua do mercado, todos os modos</h1>
      <p class="dr__sub">
        As peças de verdade, com o dado da API local e o relógio de cada momento parado. Passe o mouse na barra para ver a dica; as setas andam entre as ações.
        <template v-if="!isAuthenticated"> Sem sessão, a linha de quem assina mostra a régua do visitante.</template>
      </p>
      <div class="dr__acoes">
        <button type="button" class="dr__botao" @click="rever">Rever as entradas</button>
        <span class="dr__nota">No topo do site:</span>
        <a v-for="x in MOMENTOS" :key="x.m" :href="`/calculadoras?regua-estado=${x.m}`" class="dr__link">{{ x.nome }}</a>
      </div>
    </header>

    <p v-if="estado === 'erro'" class="dr__aviso">A API local não devolveu a bolsa do dia (/api/bolsa-do-dia): só o esqueleto aparece.</p>

    <section v-for="l in LINHAS" :key="l.id" class="dr__linha">
      <div class="dr__legenda">
        <h2 class="dr__titulo">{{ l.titulo }}</h2>
        <p class="dr__quando">{{ l.quando }}</p>
        <button v-if="l.fase === 'larga' && !soLinhas" type="button" class="dr__botao dr__botao--p" @click="verCrescer(l.id)">Ver crescer</button>
      </div>
      <div class="dr__regua">
        <NuReguaEsqueleto v-if="l.peca === 'esqueleto'" />
        <template v-else-if="bolsa?.acoes.length && bolsa.ibov && momentos[l.m]">
          <NuReguaPalco
            v-if="l.peca === 'cena'" :key="`${l.id}-${rodada}`"
            :bolsa="bolsa" :data="momentos[l.m]!.data" :mercado="momentos[l.m]!.mercado" :agora="momentos[l.m]!.agora"
            :cena-fixa="l.cena" congelado
          />
          <NuReguaBolsa
            v-else :key="`${l.id}-${rodada}`"
            :acoes="bolsa.acoes" :data="momentos[l.m]!.data" :mercado="momentos[l.m]!.mercado" :agora="momentos[l.m]!.agora"
            :fase="fases[l.id] ?? l.fase!" :ciclo="rodada" :acender="!reduzido" :visitante="l.visitante"
          />
        </template>
        <span v-else class="dr__nota">{{ estado === 'erro' ? 'Sem dado.' : 'Carregando o dado…' }}</span>
      </div>
    </section>

    <section v-if="!soLinhas" class="dr__linha dr__vivo">
      <div class="dr__legenda">
        <h2 class="dr__titulo">O palco ao vivo</h2>
        <p class="dr__quando">As cenas do momento trocando sozinhas, a cada minuto, como no site (pausa com o mouse em cima). Os botões passam na mão.</p>
        <div class="dr__acoes">
          <button v-for="x in MOMENTOS" :key="x.m" type="button" class="dr__botao dr__botao--p" :class="{ 'dr__botao--ativo': momentoVivo === x.m }" :aria-pressed="momentoVivo === x.m" @click="momentoVivo = x.m">{{ x.nome }}</button>
          <span class="dr__fio" aria-hidden="true" />
          <button type="button" class="dr__botao dr__botao--p" @click="palco?.proxima()">Próxima cena</button>
          <button type="button" class="dr__botao dr__botao--p" @click="palco?.doComeco()">Do começo</button>
        </div>
      </div>
      <div class="dr__regua">
        <NuReguaPalco
          v-if="bolsa?.acoes.length && bolsa.ibov && momentos[momentoVivo]" ref="palco" :key="momentoVivo"
          :bolsa="bolsa" :data="momentos[momentoVivo]!.data" :mercado="momentos[momentoVivo]!.mercado" :agora="momentos[momentoVivo]!.agora" congelado
        />
      </div>
    </section>

    <section v-if="!soLinhas" class="dr__celular">
      <div class="dr__legenda">
        <h2 class="dr__titulo">No celular (390 px)</h2>
        <p class="dr__quando">A mesma vitrine numa tela estreita: "10h", a barra sem rótulo e "71% subiu".</p>
      </div>
      <iframe src="/dev/regua?so=linhas" class="dr__iframe" title="A régua num celular de 390 px" loading="lazy" />
    </section>
  </main>
</template>

<style scoped>
.dr { min-height: 100vh; padding: 0 0 64px; background: var(--nu-page); color: var(--nu-ink); }
.dr--linhas { padding: 0 0 24px; }
.dr__topo { padding: 48px var(--nu-coluna) 24px; }
.dr__h1 { margin: 0; font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; }
.dr__sub { max-width: 72ch; margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); line-height: 1.55; }
.dr__acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-top: 16px; }
.dr__nota { color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.dr__link { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); text-underline-offset: 3px; }
.dr__botao {
  min-height: 36px; padding: 0 16px; border: 1px solid var(--nu-line); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.dr__botao:hover { border-color: var(--nu-ink); }
.dr__botao:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.dr__botao--p { min-height: 32px; padding: 0 12px; font-size: var(--nu-fs-xs); }
.dr__botao--ativo { border-color: var(--nu-ink); background: var(--nu-ink); color: var(--nu-white); }
.dr__fio { width: 1px; height: 20px; background: var(--nu-line-2); }
.dr__aviso { margin: 0 var(--nu-coluna) 16px; color: var(--nu-red-text); font-size: var(--nu-fs-sm); }

/* cada modo: a legenda e a régua na moldura dela */
.dr__linha { position: relative; margin-top: 28px; }
.dr__linha:hover, .dr__linha:focus-within { z-index: 3; }
.dr__legenda { padding: 0 var(--nu-coluna) 10px; }
.dr__titulo { margin: 0; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.dr__quando { max-width: 80ch; margin: 2px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.45; }
.dr__legenda .dr__botao { margin-top: 8px; }
.dr__legenda .dr__acoes { margin-top: 10px; }
/* a moldura: as medidas da régua do site (NuMarketTicker, .nut-regua) */
.dr__regua {
  position: relative; display: flex; align-items: center; gap: 24px; height: 44px; padding: 0 var(--nu-coluna);
  background: var(--nu-page); border-block: 1px solid var(--nu-line-2); font-size: var(--nu-fs-dense);
}
.dr__celular { margin-top: 48px; }
.dr__iframe {
  display: block; width: 390px; height: 1180px; margin: 0 var(--nu-coluna); border: 1px solid var(--nu-line); border-radius: var(--nu-r-card);
  background: var(--nu-page);
}
@media (max-width: 640px) {
  .dr__regua { height: 36px; gap: 12px; font-size: var(--nu-fs-xs); }
  .dr--linhas .dr__linha { margin-top: 22px; }
}
</style>
