<script setup lang="ts">
// A régua "Mercado agora" (02/11/2026, a direção "editorial calmo" que o dono
// escolheu): parada, logo abaixo do header e grudada nele (--nuh-h). O estado
// da bolsa à esquerda ("Feriado · Finados", "Bolsa aberta" com o ponto que
// respira, "Abre às 10h"), as cotações em números tabulares separados por
// fios, que se ajustam à largura sem marquee (o que não cabe some do fim da
// fila: IBOV, dólar, IFIX, CDI, PETR4, bitcoin), e no canto de quando são os
// números e o aviso de atraso da B3, que nunca sai (no celular vira o relógio
// com "15 min").
// APORTOU (11/11/2026): a régua senta no creme da página, como o topo, com um
// fio leve embaixo (--nu-line-2). Não existe faixa branca de ponta a ponta.
// Dados via useMarketTicker (esqueleto → hidrata real). Sem dado real a régua
// NÃO é desenhada: até 2026-08-29 ela degradava pra um seed de cotações do
// design e mostrava número inventado sob o carimbo "B3".
// ROBUSTEZ (11/11/2026): a régua senta na coluna do site (--nu-coluna), com o
// wordmark do topo e o título da página na mesma linha vertical; o número que
// chega troca o esqueleto num fade (--nu-dur-media), sem pulo; o resto em token.
// O deslizar do top segue o tempo do encolher do topo (.32s, o mesmo do NuHeader).
// A BOLSA INTEIRA NUMA LINHA (12/11/2026, pedido do dono: "melhorar esse trem
// aqui pra algo mais útil", depois "mais criativos ainda"): no lugar das
// cotações, a barra das ações do Ibovespa (NuReguaBolsa, a opção 1 do esboço).
// Os estados, na ordem:
//  - o esqueleto no SSR e até o dado chegar (a régua acende no cliente: o
//    payload de cada página não carrega a bolsa do dia, e o estado do pregão
//    depende do relógio, como sempre dependeu);
//  - com as ações (useReguaDaBolsa → /api/bolsa-do-dia), o palco (NuReguaPalco):
//    a barra das ações e, conforme o momento da bolsa, a contagem para a
//    abertura ou a frase do fechamento, trocando a cada ~60 s (o aviso de
//    atraso da B3 saiu da linha em 12/11/2026, a pedido do dono: está na dica de
//    cada pedaço e no fim do aria-label da barra);
//  - sem as ações, a régua de antes, com as cotações (useMercadoDoTopo);
//  - sem nada, a régua não é desenhada.
// O /assinar segue com a variante de vendas (VENDAS), sem mudança.
import { agoraEmSP, relogioDoDev } from '~/utils/pregao'
import { mercadoDoTopo } from '~/utils/topo'
import type { CenaDaRegua } from '~/utils/reguaDaBolsa'

const { itens, loading, mercado, agora } = useMercadoDoTopo()
const { bolsa, estado: estadoDaBolsa, carregar: carregarBolsa, manterAoVivo } = useReguaDaBolsa()
const montado = ref(false)

// Só no dev, para fotografar os estados (no padrão do ?folha-estado=):
// ?regua-estado=pre|aberta|fechada|feriado põe o relógio da régua às 9h, 14h ou
// 19h do pregão de hoje (ou num feriado da B3), e em aberta/fechada o dado passa
// a ser de hoje ("sobe agora", "subiu hoje"); ?regua-agora=2026-11-12T09:12 para o
// relógio nessa hora de São Paulo (o dado segue o de verdade); ?regua-cena=
// contagem|fechamento|barra deixa o palco parado nessa cena. Com o relógio
// forçado, ele não anda. `import.meta.dev` é falso no build. Todos os modos de
// uma vez, lado a lado: /dev/regua (só no dev).
const consulta = import.meta.dev ? useRoute().query : {}
const forcado = import.meta.dev ? String(consulta['regua-estado'] ?? '') : ''
const agoraFixo = (() => {
  const v = import.meta.dev ? String(consulta['regua-agora'] ?? '') : ''
  const m = v.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/)
  return m ? new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4] ?? '00'}-03:00`) : null
})()
const cenaFixa = (() => {
  const v = import.meta.dev ? String(consulta['regua-cena'] ?? '') : ''
  return (['contagem', 'fechamento', 'barra'] as const).find((c) => c === v) ?? null
})() as CenaDaRegua | null
const congelado = !!agoraFixo || !!forcado
const relogio = computed(() => {
  if (!agora.value) return null
  if (agoraFixo) return { agora: agoraFixo, dataDeHoje: false }
  const f = forcado ? relogioDoDev(forcado) : null
  return f ?? { agora: agora.value, dataDeHoje: false }
})
const dataDaBolsa = computed(() => {
  const d = bolsa.value?.ibov?.data ?? null
  const r = relogio.value
  return d && r?.dataDeHoje ? agoraEmSP(r.agora).iso : d
})
const mercadoDaRegua = computed(() => (relogio.value ? mercadoDoTopo(relogio.value.agora, dataDaBolsa.value) : null))

const modo = computed<'esqueleto' | 'mapa' | 'cotacoes' | 'nada'>(() => {
  if (!montado.value) return 'esqueleto'
  if (estadoDaBolsa.value === 'pronto' && bolsa.value?.acoes.length && bolsa.value.ibov && mercadoDaRegua.value) return 'mapa'
  if (estadoDaBolsa.value === 'parado' || estadoDaBolsa.value === 'carregando' || loading.value) return 'esqueleto'
  return itens.value.length ? 'cotacoes' : 'nada'
})

let pararAoVivo: () => void = () => {}
onMounted(() => {
  montado.value = true
  void carregarBolsa()
  // ao vivo com a bolsa aberta, e depois do fechamento até o fechamento de hoje chegar (a frase do fechamento espera por ele)
  pararAoVivo = manterAoVivo(() => {
    const e = mercadoDaRegua.value?.estado
    const hoje = relogio.value ? agoraEmSP(relogio.value.agora).iso : null
    return e === 'aberta' || (e === 'fechada' && !!hoje && dataDaBolsa.value !== hoje)
  })
})
onBeforeUnmount(() => pararAoVivo())

// No /assinar (pedido do dono, 31/10/2026: "algo que ajude a vender"), a
// faixa troca as cotações pelo que a pessoa ganha ao conectar, girando do
// mesmo jeito, e o canto direito abre o quiz. Tudo o que está aqui existe.
const route = useRoute()
const vendendo = computed(() => route.path === '/assinar')
const VENDAS = [
  'Nubank, Itaú, XP e mais de 100 bancos e corretoras',
  'Todos os seus investimentos numa tela só',
  '2.000 cenários dos próximos 5 anos',
  'Um aviso no dia em que importa',
  'Uma IA que responde com os seus números',
  'Só leitura: ninguém mexe no seu dinheiro',
  'Regulado pelo Banco Central',
  'Cancele quando quiser',
]
const quiz = useQuizAssinatura()


// A altura da régua vai para --nut-h no <html>, como o header publica a dele em
// --nuh-h (useTopo): quem gruda logo abaixo dos dois (a barra de seções do
// /asset) usa top: calc(var(--nuh-h) + var(--nut-h)) e encosta sem vão, com o
// header encolhido ou não e em qualquer largura. Sem régua, 0px.
const regua = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null
function publicarAltura() {
  const h = regua.value?.getBoundingClientRect().height ?? 0
  document.documentElement.style.setProperty('--nut-h', `${Math.round(h)}px`)
}
onMounted(() => {
  ro = new ResizeObserver(publicarAltura)
  watch(regua, (el, antes) => {
    if (antes) ro?.unobserve(antes)
    if (el) ro?.observe(el)
    publicarAltura()
  }, { immediate: true })
})
onBeforeUnmount(() => {
  ro?.disconnect()
  document.documentElement.style.removeProperty('--nut-h')
})

</script>

<template>
  <!-- items vazio = hidratou e nada real chegou: a faixa some (some, não
       mente). loading ainda true = skeleton, o estado normal do SSR. -->
  <!-- no /assinar: o que vem ao conectar -->
  <div v-if="vendendo" ref="regua" class="nut-wrap">
    <div class="nut">
      <span class="nut__label">Ao conectar</span>
      <div class="nut__marquee">
        <div class="nut__track">
          <div v-for="half in 2" :key="half" class="nut__group" :aria-hidden="half === 2 || undefined">
            <span v-for="v in VENDAS" :key="`${half}-${v}`" class="nut__item">
              <svg class="nut__visto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <span class="nut__value">{{ v }}</span>
            </span>
          </div>
        </div>
      </div>
      <button type="button" class="nut__conectar" aria-haspopup="dialog" @click="quiz.abrir('faixa')">
        Conectar carteira
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>
  </div>
  <div v-else-if="modo !== 'nada'" ref="regua" class="nut-wrap nut-regua" :class="`nut-regua--${modo}`">
    <!-- o esqueleto tem a forma da barra: o estado, o fio, a barra e o número -->
    <NuReguaEsqueleto v-if="modo === 'esqueleto'" />
    <!-- a bolsa inteira numa linha: o palco, com a barra e as outras cenas do momento -->
    <NuReguaPalco
      v-else-if="modo === 'mapa'" :bolsa="bolsa!" :data="dataDaBolsa" :mercado="mercadoDaRegua!" :agora="relogio!.agora"
      :cena-fixa="cenaFixa" :congelado="congelado"
    />
    <!-- sem as ações: a régua de antes, com as cotações (e o aviso de atraso da B3 na linha, porque aqui não há dica) -->
    <template v-else>
      <NuTopoEstado :mercado="mercado" curto class="nut-regua__estado" />
      <NuTopoCotacoes :itens="itens" separador class="nut-regua__cot" />
      <span class="nut-regua__nota">
        <span v-if="mercado?.referencia" class="nut-regua__ref">{{ mercado.referencia }} · </span><span class="nut-regua__b3">B3 · atraso de </span><svg class="nut-regua__relogio" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" role="img" aria-label="atraso de"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>15 min
      </span>
    </template>
  </div>
</template>

<style scoped>
.nut-wrap {
  background: var(--nu-page); border-bottom: 1px solid var(--nu-line-2);
  /* gruda ABAIXO do header sticky (UX do dono 2026-07-11): --nuh-h vive no
     <html>, setada pelo NuHeader (72px normal, 60px encolhido; no celular
     52 e 46). .nut-wrap é a classe que o ChatSeletor conta como topo. */
  position: sticky; top: var(--nuh-h, 72px); z-index: 40;
  transition: top var(--nu-dur-topo) var(--nu-ease-saida);
}
.nut { display: flex; align-items: center; gap: 26px; padding: 14px var(--nu-coluna); }
.nut__label { color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
.nut__marquee { flex: 1; min-width: 0; overflow: hidden; }
.nut__track { display: inline-flex; width: max-content; animation: nut-scroll 55s linear infinite; }
.nut__marquee:hover .nut__track { animation-play-state: paused; }
.nut__group { display: inline-flex; align-items: center; gap: 26px; padding-right: 26px; }
@keyframes nut-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.nut__item { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nut__value { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__visto { color: var(--nu-green-text); flex-shrink: 0; }
.nut__conectar {
  display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 8px 14px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-family: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer;
  min-height: 36px; transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nut__conectar:hover { background: var(--nu-blue-hover); }
.nut__conectar:hover svg { animation: nu-seta var(--nu-dur-lenta) var(--nu-ease-troca); }
.nut__conectar:active { transform: scale(.98); }

/* no celular a faixa de venda fica só com os itens e o botão */
@media (max-width: 560px) {
  .nut:has(.nut__conectar) .nut__label { display: none; }
  .nut:has(.nut__conectar) { gap: 14px; padding: 10px var(--nu-coluna); }
}
@media (prefers-reduced-motion: reduce) {
  .nut__track { animation: none; }
}

/* ——— a régua do mercado ———
   44px (12/11/2026, a barra das ações: 40px quando eram só cotações); no
   celular 36. A altura vai para --nut-h (acima). */
.nut-regua {
  display: flex; align-items: center; gap: 24px; height: 44px; padding: 0 var(--nu-coluna);
  font-size: var(--nu-fs-dense);
}
/* o número que chega: troca o esqueleto num fade, no mesmo lugar */
.nut-regua__estado, .nut-regua__cot, .nut-regua--cotacoes .nut-regua__nota { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
.nut-regua__estado { flex-shrink: 0; padding-right: 24px; border-right: 1px solid var(--nu-line-2); height: 16px; }
.nut-regua__cot { flex: 1 1 0; --ntc-gap: 28px; }
.nut-regua__relogio { display: none; margin-right: 3px; vertical-align: -1px; }
.nut-regua__nota { flex-shrink: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); white-space: nowrap; font-variant-numeric: tabular-nums; }
@media (max-width: 1100px) { .nut-regua__ref { display: none; } }
/* celular: a régua mais leve, em tipo de etiqueta (36px com a barra de 22; 30 com as cotações) */
@media (max-width: 640px) {
  .nut-regua { height: 30px; gap: 12px; padding: 0 var(--nu-coluna); font-size: var(--nu-fs-xs); }
  .nut-regua--mapa, .nut-regua--esqueleto { height: 36px; }
  .nut-regua__estado { padding-right: 12px; height: 12px; }
  .nut-regua__cot { --ntc-gap: 16px; --ntc-h: 18px; }
  .nut-regua__b3 { display: none; }
  .nut-regua__relogio { display: inline-block; }
}
@media (prefers-reduced-motion: reduce) {
  .nut-regua__estado, .nut-regua__cot, .nut-regua--cotacoes .nut-regua__nota { animation: none; }
}
</style>
