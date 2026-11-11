<script setup lang="ts">
// "Sua carteira" (31/10/2026): o detalhe calmo, abaixo do leque. Como o
// Detalhes do Agora: o total com o olho, a barra por classe e um grupo por
// linha (Ações, FIIs, Renda Fixa…) com o valor e a variação do dia. Os papéis
// de cada grupo só aparecem quando a pessoa abre o grupo: detalhe sob pedido.
//
// Mesmos números do useCarteira de antes (buildGroups/buildAllocation); só a
// organização mudou. Os valores respeitam o olho global (useHiddenValues).
import type { CarteiraAllocationVM, CarteiraGroupVM } from '~/types/carteira'

const props = defineProps<{
  patrimonio: string
  groups: CarteiraGroupVM[]
  allocation: CarteiraAllocationVM[]
}>()

const { hidden, mask } = useHiddenValues()

// o resumo da carteira como contexto do chat. Valores ocultos (o olho) seguem
// ocultos: vai o que está na tela.
const contextoResumo = computed(() => ({
  id: 'carteira:resumo',
  tipo: 'carteira',
  rotulo: 'Sua carteira',
  texto: [
    `Patrimônio: ${mask(props.patrimonio)}`,
    props.allocation.length ? `Alocação: ${props.allocation.map((a) => `${a.name} ${a.pct}`).join('; ')}` : '',
    ...props.groups.map((g) => `${g.name}: ${g.rows.map((r) => r.label).join(', ')}`),
  ].filter(Boolean).join('\n'),
}))
const { aporteOpen, openAporte, closeAporte, confirmAporte, rebalanceHref, rebalancear } = useAporteChat()

// abre o maior grupo por padrão quando só há um (nada a esconder)
const abertos = ref<Set<string>>(new Set(props.groups.length === 1 ? [props.groups[0]!.name] : []))
function alternar(nome: string) {
  const s = new Set(abertos.value)
  if (s.has(nome)) s.delete(nome)
  else s.add(nome)
  abertos.value = s
}

const total = computed(() => (hidden.value ? 'R$ ••••••' : props.patrimonio))
const idDe = (nome: string) => `cps-${nome.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`
</script>

<template>
  <section class="cps" aria-labelledby="cps-titulo">
    <div class="cps__cols">
      <div v-contexto-chat="contextoResumo" class="cps__lado">
        <h2 id="cps-titulo" class="cps__titulo">Sua carteira</h2>
        <div class="cps__total-linha">
          <span class="cps__total" data-clarity-mask="true">{{ total }}</span>
          <NuEyeButton class="cps__olho" />
        </div>
        <div v-if="allocation.length" class="cps__barra" role="img" :aria-label="allocation.map((a) => `${a.name} ${a.pct}`).join(', ')">
          <span v-for="a in allocation" :key="a.name" class="cps__seg" :style="{ width: `${a.pctNum}%`, background: a.color }" />
        </div>
        <div class="cps__acoes">
          <button type="button" class="cps__acao" @click="openAporte">Planejar aporte</button>
          <NuxtLink :to="rebalanceHref" class="cps__acao cps__acao--quieta" @click="rebalancear">Rebalancear com a IA</NuxtLink>
        </div>
      </div>

      <ul class="cps__grupos" data-clarity-mask="true">
        <li v-for="g in groups" :key="g.name" class="cps__grupo" :class="{ 'cps__grupo--aberto': abertos.has(g.name) }">
          <button
            type="button" class="cps__linha"
            :aria-expanded="abertos.has(g.name)" :aria-controls="idDe(g.name)"
            @click="alternar(g.name)"
          >
            <span class="cps__ponto" :style="{ background: g.color }" aria-hidden="true" />
            <span class="cps__nome">
              <span class="cps__nome-txt">{{ g.name }}</span>
              <span class="cps__sub">
                <span class="cps__tiles" aria-hidden="true">
                  <span v-for="r in g.rows.slice(0, 4)" :key="r.ticker" class="cps__tile" :style="{ background: r.tileBg, color: r.tileFg }">{{ r.letter }}</span>
                </span>
                {{ g.count }} · {{ g.share }}
              </span>
            </span>
            <span class="cps__valores">
              <span class="cps__valor">{{ mask(g.total) }}</span>
              <span v-if="g.dia" class="cps__dia" :class="`cps__dia--${g.diaDir}`">{{ g.dia }} hoje</span>
              <span v-else-if="g.ret" class="cps__dia" :class="`cps__dia--${g.retKind === 'down' ? 'down' : 'up'}`">{{ g.ret }} no total</span>
            </span>
            <svg class="cps__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>

          <div v-show="abertos.has(g.name)" :id="idDe(g.name)" class="cps__papeis">
            <template v-for="r in g.rows" :key="r.ticker">
              <NuxtLink v-if="r.href" v-contexto-chat="{ id: `posicao:${r.ticker}`, tipo: 'posicao', rotulo: rotuloCurto(r.label, 28) }" :to="r.href" class="cps__papel cps__papel--link">
                <CarteiraPosicaoLinha :row="r" :hidden="hidden" :mask="mask" />
              </NuxtLink>
              <div v-else v-contexto-chat="{ id: `posicao:${r.ticker}`, tipo: 'posicao', rotulo: rotuloCurto(r.label, 28) }" class="cps__papel">
                <CarteiraPosicaoLinha :row="r" :hidden="hidden" :mask="mask" />
              </div>
            </template>
            <NuxtLink :to="g.ctaHref" class="cps__cta">{{ g.cta }} ›</NuxtLink>
          </div>
        </li>
      </ul>
    </div>

    <NuAmountModal :open="aporteOpen" @close="closeAporte" @confirm="confirmAporte" />
  </section>
</template>

<style scoped>
/* a tela antiga (sem a visão) na Aportou: faixa quente no lugar do branco */
.cps {
  background: var(--nu-band);
  padding: clamp(56px, 7.5vw, 96px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.cps__cols { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr); gap: clamp(28px, 5vw, 80px); align-items: start; }
.cps__lado { position: sticky; top: calc(var(--nuh-h, 76px) + 76px); }
.cps__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.04; }
.cps__total-linha { display: flex; align-items: center; gap: 14px; margin-top: 14px; }
.cps__total { color: var(--nu-ink); font-size: clamp(34px, 4.2vw, 54px); font-weight: var(--nu-w-display); letter-spacing: -0.04em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps__olho { width: 44px; height: 44px; }
.cps__barra { display: flex; gap: 4px; height: 26px; border-radius: 15px; overflow: hidden; margin-top: 22px; max-width: 460px; }
.cps__seg { height: 100%; min-width: 6px; border-radius: 6px; }
.cps__acoes { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
.cps__acao {
  display: inline-flex; align-items: center; border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); min-height: 48px; padding: 0 24px; font-size: 15px; font-weight: var(--nu-w-medio);
  transition: background .2s, transform .15s;
}
.cps__acao:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.cps__acao:active { transform: scale(.98); }
.cps__acao--quieta { background: var(--nu-white); color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink); }
.cps__acao--quieta:hover { background: var(--nu-row-hover); color: var(--nu-ink); }

.cps__grupos { list-style: none; margin: 0; padding: 0; }
.cps__grupo { border-top: 1px solid var(--nu-line); }
.cps__grupo:last-child { border-bottom: 1px solid var(--nu-cream-2); }
.cps__linha {
  width: 100%; display: flex; align-items: center; gap: 14px; text-align: left;
  background: none; border: none; cursor: pointer; font-family: inherit;
  padding: 20px 4px; border-radius: var(--nu-r-chip); transition: background .18s;
}
.cps__linha:hover { background: var(--nu-row-hover); }
.cps__ponto { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.cps__nome { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.cps__nome-txt { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: -0.01em; }
.cps__sub { display: flex; align-items: center; gap: 8px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cps__tiles { display: inline-flex; }
.cps__tile {
  width: 24px; height: 24px; border-radius: 50%; margin-left: -6px; border: 2px solid var(--nu-white);
  display: inline-flex; align-items: center; justify-content: center; font-size: var(--nu-fs-xs); font-weight: var(--nu-w-forte);
}
.cps__tile:first-child { margin-left: 0; }
.cps__valores { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; text-align: right; }
.cps__valor { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps__dia { font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps__dia--up { color: var(--nu-green-text); }
.cps__dia--down { color: var(--nu-red-text); }
.cps__seta { color: var(--nu-sand); flex-shrink: 0; transition: transform .2s; }
.cps__grupo--aberto .cps__seta { transform: rotate(90deg); color: var(--nu-gray); }

.cps__papeis { background: var(--nu-page); border-radius: var(--nu-r-pos-panel); padding: 6px 16px 14px; margin: 0 0 18px; animation: nu-fade .3s ease both; }
.cps__papel { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--nu-cream-line-2); }
.cps__papel--link { transition: opacity .18s; }
.cps__papel--link:hover { opacity: .78; }
.cps__cta { display: inline-block; margin-top: 12px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.cps__cta:hover { color: var(--nu-blue-hover); }

@media (max-width: 900px) {
  .cps__cols { grid-template-columns: minmax(0, 1fr); }
  .cps__lado { position: static; }
}
@media (max-width: 760px) {
  .cps__nome-txt { font-size: var(--nu-fs-lg); }
  .cps__valor { font-size: var(--nu-fs-md); }
}
@media (max-width: 480px) {
  /* no celular a contagem cabe numa linha sem os tiles */
  .cps__tiles { display: none; }
}
</style>
