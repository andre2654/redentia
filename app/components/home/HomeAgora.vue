<script setup lang="ts">
// O topo da home para quem está logado (31/10/2026): a tela Início do Agora
// dos apps, no site. Uma pergunta só, "está tudo normal?", respondida numa
// frase, com o resultado do dia escondido atrás do olho (abre escondido, como
// no iPhone) e os detalhes sob demanda. A carteira completa é a /carteira
// (paga); daqui só se chega lá.
// Substitui o "Olá, Nome." com o mini-painel (MercadoHero logado) e a banda
// azul "Sua carteira" (MercadoSuaCarteira), que empilhavam números antes da
// resposta.
// Estados (dado que falta some, nunca vira zero):
//  - 'patrimonio' com dado: "Tudo normal." + a carteira contra a bolsa
//    ("Sua carteira sobe 0,91% hoje; a bolsa, 1,57%.") + a pílula escondida;
//  - 'connect' (sem Open Finance, o caso de 96% das contas): "Conecte a sua
//    carteira." + a mesma chamada do visitante, que leva ao /assinar;
//  - resumo indisponível (API fora): "Olá, Nome." + o caminho da carteira.
import type { CarteiraResumoVM } from '~/types/carteira'

const props = defineProps<{ resumo: CarteiraResumoVM | null }>()

const { firstName } = useAuthState()
const { indices, indicesReais } = await useNuMovers()
const momento = useState('home:momento-bolsa', () => momentoDaBolsa())

const comCarteira = computed(() => props.resumo?.state === 'patrimonio')
const semCarteira = computed(() => props.resumo?.state === 'connect')

const ibovPct = computed(() => (indicesReais.value ? numeroDoPct(indices.value.find((i) => i.label === 'IBOV')?.pct) : null))
const carteiraPct = computed(() => pctDoResumo(props.resumo?.hojeTxt))
const sub = computed(() => fraseDaCarteira(carteiraPct.value, ibovPct.value, momento.value) ?? 'Estamos analisando tudo para você.')

// a pílula: o valor do dia ('+R$ 761,20'), escondido até o toque no olho
const mostrar = ref(false)
const valorDoDia = computed(() => props.resumo?.hojeTxt?.split(' (')[0] ?? null)
const rotuloDoDia = computed(() => (momento.value.numerosDeHoje ? 'Hoje' : 'Último pregão'))

// os detalhes, sob demanda: cada um leva à seção da /carteira que o explica
const detalhesAbertos = ref(false)
const detalhes = computed(() => {
  const r = props.resumo
  if (!r || r.state !== 'patrimonio') return []
  const lista: { k: string; rotulo: string; valor: string; to: string; tom?: 'ambar' | 'verde' }[] = []
  if (r.patrimonio) lista.push({ k: 'patrimonio', rotulo: 'Patrimônio', valor: mostrar.value ? r.patrimonio : 'R$ ••••••', to: '/carteira#posicoes' })
  if (r.proventos12m) lista.push({ k: 'proventos', rotulo: 'Proventos em 12 meses', valor: mostrar.value ? r.proventos12m : 'R$ ••••', to: '/carteira#renda-passiva' })
  if (r.score) lista.push({ k: 'score', rotulo: `Score da carteira · ${r.score.band}`, valor: `${r.score.val}/100`, to: '/carteira#raio-x' })
  if (r.atencao != null) {
    lista.push(r.atencao > 0
      ? { k: 'atencao', rotulo: r.atencao === 1 ? 'Ponto de atenção' : 'Pontos de atenção', valor: String(r.atencao), to: '/carteira#raio-x', tom: 'ambar' }
      : { k: 'atencao', rotulo: 'Pontos de atenção', valor: 'Nenhum', to: '/carteira#raio-x', tom: 'verde' })
  }
  return lista
})
</script>

<template>
  <section class="hag" aria-labelledby="hag-titulo">
    <div class="hag__tela">
      <!-- com carteira: a resposta do dia -->
      <template v-if="comCarteira">
        <div class="hag__meio">
          <p class="hag__estado" :class="{ 'hag__estado--verde': momento.estado === 'aberta' }">{{ momento.rotulo }}</p>
          <h1 id="hag-titulo" class="hag__frase">Tudo normal.</h1>
          <p class="hag__sub">{{ sub }}</p>
        </div>
        <div class="hag__base">
          <div v-if="valorDoDia" class="hag__pilula-linha">
            <span class="hag__pilula" :class="mostrar ? `hag__pilula--${resumo?.hojeDir}` : ''">
              <span class="hag__pilula-valor">{{ mostrar ? valorDoDia : 'R$ •••••' }}</span>
              <span class="hag__pilula-rotulo">{{ rotuloDoDia }}</span>
            </span>
            <button
              type="button" class="hag__olho" :aria-pressed="mostrar"
              :aria-label="mostrar ? 'Esconder o resultado do dia' : 'Mostrar o resultado do dia'"
              @click="mostrar = !mostrar"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1.6 12 C3.9 7.3 7.7 4.9 12 4.9 C16.3 4.9 20.1 7.3 22.4 12 C20.1 16.7 16.3 19.1 12 19.1 C7.7 19.1 3.9 16.7 1.6 12 Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3.9" fill="currentColor" />
                <template v-if="!mostrar">
                  <path d="M3.6 3.6 L20.4 20.4" class="hag__olho-corte" stroke-width="4.6" stroke-linecap="round" />
                  <path d="M3.6 3.6 L20.4 20.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
                </template>
              </svg>
            </button>
          </div>
          <div class="hag__acoes">
            <button
              v-if="detalhes.length" type="button" class="hag__detalhes-btn"
              :aria-expanded="detalhesAbertos" aria-controls="hag-detalhes" @click="detalhesAbertos = !detalhesAbertos"
            >
              {{ detalhesAbertos ? 'Menos detalhes' : 'Detalhes' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ 'hag__gira': detalhesAbertos }"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <NuxtLink to="/carteira" class="hag__carteira">
              Abrir minha carteira
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
          </div>
        </div>
        <div v-show="detalhesAbertos" id="hag-detalhes" class="hag__detalhes">
          <NuxtLink v-for="d in detalhes" :key="d.k" :to="d.to" class="hag__detalhe">
            <span class="hag__detalhe-valor" :class="d.tom ? `hag__detalhe-valor--${d.tom}` : ''">{{ d.valor }}</span>
            <span class="hag__detalhe-rotulo">{{ d.rotulo }}</span>
          </NuxtLink>
        </div>
      </template>

      <!-- sem carteira: o passo que falta, com a mesma chamada do visitante -->
      <template v-else-if="semCarteira">
        <div class="hag__meio">
          <p class="hag__estado hag__estado--azul">Falta um passo</p>
          <h1 id="hag-titulo" class="hag__frase">Conecte a sua carteira.</h1>
          <p class="hag__sub">A Redentia junta os seus investimentos de qualquer banco, testa a carteira em 2.000 cenários e passa a vigiar todo dia por você.</p>
        </div>
        <HomeChamada tom="escuro" :centro="false" class="hag__chamada" />
      </template>

      <!-- resumo fora do ar: só o caminho, sem número -->
      <template v-else>
        <div class="hag__meio">
          <p class="hag__estado" :class="{ 'hag__estado--verde': momento.estado === 'aberta' }">{{ momento.rotulo }}</p>
          <h1 id="hag-titulo" class="hag__frase">Olá{{ firstName ? `, ${firstName}` : '' }}.</h1>
          <p class="hag__sub">A sua carteira está a um clique.</p>
        </div>
        <div class="hag__base">
          <NuxtLink to="/carteira" class="hag__carteira">
            Abrir minha carteira
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* A primeira tela inteira é a do app, e só ela: a seção ocupa o resto da
   janela abaixo do header e da faixa do mercado (~128 px). Assim a faixa
   "Seus ativos", que chega pelo cliente, nasce abaixo da dobra e não empurra
   nada que a pessoa esteja vendo (CLS). */
.hag {
  display: flex; min-height: max(560px, calc(100svh - 128px));
  background: var(--nu-cream); padding: clamp(20px, 3vw, 40px) clamp(22px, 5.5vw, 80px);
}
/* a tela do app: preta, a frase no meio e a pílula embaixo */
.hag__tela {
  flex: 1; width: 100%;
  display: flex; flex-direction: column; justify-content: center; gap: clamp(36px, 5vw, 64px); max-width: 1056px; margin: 0 auto;
  padding: clamp(36px, 5vw, 64px) clamp(24px, 5vw, 64px); border-radius: clamp(28px, 3vw, 40px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
  animation: nu-fade .5s ease both;
}
.hag__meio { margin-top: auto; }
.hag__base, .hag__chamada { margin-top: auto; }
.hag__estado { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); font-weight: 700; }
.hag__estado--verde { color: var(--nu-agora-verde); }
.hag__estado--azul { color: var(--nu-agora-azul); }
.hag__frase {
  margin: 12px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-hero); font-weight: 800;
  letter-spacing: -0.05em; line-height: 1;
}
.hag__sub { margin: 18px 0 0; max-width: 52ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }

.hag__base { display: flex; align-items: center; justify-content: space-between; gap: 18px 28px; flex-wrap: wrap; }
.hag__pilula-linha { display: inline-flex; align-items: center; gap: 14px; }
.hag__pilula {
  display: inline-flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 18px 8px 16px;
  border-radius: 14px; background: var(--nu-agora-pilula); color: var(--nu-agora-sub);
}
.hag__pilula-valor { font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hag__pilula-rotulo { font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
.hag__pilula--up { color: var(--nu-agora-verde); }
.hag__pilula--down { color: var(--nu-agora-vermelho); }
.hag__olho {
  display: grid; place-items: center; width: 48px; height: 48px; padding: 0; border: 0; border-radius: 50%;
  background: transparent; color: var(--nu-agora-sub); cursor: pointer; transition: background .2s, color .2s;
}
.hag__olho:hover { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); }
.hag__olho:focus-visible { outline: 2px solid var(--nu-agora-azul); outline-offset: 2px; }
.hag__olho-corte { stroke: var(--nu-agora-bg); }

.hag__acoes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.hag__detalhes-btn, .hag__carteira {
  display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 20px; border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; transition: background .2s, color .2s;
}
.hag__detalhes-btn { border: 0; background: var(--nu-agora-pilula); color: var(--nu-agora-texto); }
.hag__detalhes-btn:hover { background: var(--nu-agora-linha); }
.hag__detalhes-btn svg { transition: transform .2s ease; }
.hag__gira { transform: rotate(180deg); }
.hag__carteira { background: var(--nu-agora-texto); color: var(--nu-agora-bg); }
.hag__carteira:hover { background: var(--nu-white); color: var(--nu-agora-bg); }
.hag__detalhes-btn:focus-visible, .hag__carteira:focus-visible { outline: 2px solid var(--nu-agora-azul); outline-offset: 3px; }

.hag__detalhes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 10px; margin-top: -24px; }
.hag__detalhe {
  display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; border-radius: 16px;
  background: var(--nu-agora-cartao); transition: background .2s, transform .15s;
}
.hag__detalhe:hover { background: var(--nu-agora-pilula); transform: translateY(-2px); }
.hag__detalhe-valor { color: var(--nu-agora-texto); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.hag__detalhe-valor--ambar { color: var(--nu-agora-ambar); }
.hag__detalhe-valor--verde { color: var(--nu-agora-verde); }
.hag__detalhe-rotulo { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }


@media (max-width: 560px) {
  .hag__pilula-linha { width: 100%; }
  .hag__pilula { flex: 1; min-width: 0; justify-content: space-between; min-height: 56px; }
  .hag__pilula-valor { font-size: var(--nu-fs-2xl); }
  .hag__acoes { width: 100%; flex-direction: column; align-items: stretch; }
  .hag__carteira, .hag__detalhes-btn { justify-content: center; white-space: nowrap; }
}
@media (prefers-reduced-motion: reduce) {
  .hag__tela { animation: none; }
  .hag__detalhes-btn svg { transition: none; }
}
</style>
