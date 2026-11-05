<script setup lang="ts">
// O topo da /carteira (31/10/2026), no conceito do Agora dos apps: a pessoa
// abre e lê numa frase se está tudo bem ("Tudo normal."), com o estado do
// pregão em cima e o resultado do dia ESCONDIDO na pílula até ela querer ver.
// Quase nada na tela, de propósito: o detalhe vem embaixo, quando ela rolar.
//
// A frase é montada aqui (utils/carteira-agora.ts) com o relógio do pregão
// (utils/pregao.ts) e os números do /portfolio/today que o useCarteira já
// trouxe. Nenhum número inventado: sem /today, a frase não afirma nada.
//
// A pílula tem o próprio olho: abre escondida, como no app, e o "mostrar"
// vale para a visita inteira, o mesmo da home (useValoresVisiveis). O olho
// global (useHiddenValues) segue valendo para os detalhes de baixo.
//
// Logo abaixo da pílula, as contas do Open Finance (pedido do dono, 31/10/2026):
// de onde a carteira vem, num relance, e o "Adicionar conta" para trazer mais
// uma. Só o nome e o logo: o valor de cada banco fica no cartão "Suas contas".
// Conta que pede reconexão leva à /conta, onde mora o reconectar.
//
// O losango do dia (05/11/2026; o dono: "precisamos trazer nosso novo
// elemento da logo, que tem no início, também na carteira"): o HomeLosango
// da home, no tema do creme, com o mesmo dado (você e a bolsa no mesmo dia de
// preço; a aba de baixo acende com o provento do dia, proventoDoDiaDe) e a
// mesma reserva da bolsa durante o pregão (o snapshot do Ibovespa, se for do
// mesmo dia de preço), que vale também para a frase. Só %, como na home: o
// R$ do provento só aparece com os valores à vista (o olho da pílula).
// Saiu de três variações; o dono escolheu a 3 ("pode manter o losango
// carteira 3"): o logo pequeno (compacto) num cartão branco no bloco do dia,
// com os números ao lado, em cima da pílula.
//
// O topo ganhou presença (05/11/2026; o dono: "acho esse hero meio caído",
// sobre o "FLRY3 caindo." solto no creme). Três variações, com os MESMOS dados
// e as mesmas funções, no dev por ?topo-carteira=1|2|3 (em produção, a 1):
//  1. A noite: a banda do céu navy, com a luz do tom do dia (âmbar na
//     atenção, menta na alta, rosa na queda) e a que segue o cursor; o título
//     branco surge palavra por palavra, e o losango vai num cartão de vidro;
//  2. Creme composto: o título menor e firme, o resultado do dia e o losango
//     num bloco de destaque ao lado, e a atenção numa faixa âmbar com o papel;
//  3. O cartão do dia: um cartão só, grande, com sombra navy, juntando frase,
//     losango (o inteiro, com rótulos), pílula e contas.
// Na atenção, o papel aparece de verdade (logo, nome, ticker, %), não só o
// ticker no título. A animação só embeleza: sem JS ou com menos movimento,
// tudo está lá.
import type { CarteiraAgoraVM } from '~/types/carteira'
import { fraseDaCarteira, rotuloDaPilula } from '~/utils/carteira-agora'
import { pctComSinal, subDoProvento } from '~/utils/diaDaCarteira'
import { quemNaFrente } from '~/utils/losangoDoDia'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'

const props = defineProps<{ agora: CarteiraAgoraVM }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

// as três variações do topo, só no dev (?topo-carteira=1|2|3); em produção, a 1
const route = useRoute()
const variante = computed<1 | 2 | 3>(() => {
  if (!import.meta.dev) return 1
  const v = Number(route.query['topo-carteira'])
  return v === 2 || v === 3 ? v : 1
})

const { connections, loading: contasCarregando, ensure: carregarContas, refresh: atualizarContas } = useContasConectadas()
onMounted(carregarContas)

const RECONECTAR = new Set(['LOGIN_ERROR', 'WAITING_USER_INPUT', 'ERROR', 'ITEM_NOT_FOUND'])
const Link = resolveComponent('NuxtLink')
const { openWidget, opening, registering, error: erroConexao } = usePluggyConnect()
const conectou = ref(false)
function adicionarConta() {
  if (opening.value || registering.value) return
  openWidget({
    onConnected: async () => {
      conectou.value = true
      emit('connected')
      await atualizarContas()
    },
  })
}
const rotuloAdicionar = computed(() => (opening.value || registering.value ? 'Abrindo conexão segura…' : 'Adicionar conta'))

const { visiveis: revelado, alternar: alternarRevelado } = useValoresVisiveis()
const painel = useChatPainel()

// a reserva da bolsa, como na home: com o pregão aberto e a série do Ibovespa
// ainda sem o ponto de hoje, o snapshot entra se for do mesmo dia de preço
const { bolsa } = await useBolsaDoDia()

const pregao = computed(() => estadoDoPregao())
const quando = computed(() => quandoFoi(props.agora.priceDate))
const bolsaPct = computed(() => {
  const b = props.agora.bolsaPct
  const ib = bolsa.value?.ibov
  if (b != null || pregao.value.estado !== 'aberta' || !ib || ib.data !== props.agora.priceDate) return b
  return ib.pct
})
const frase = computed(() => fraseDaCarteira({
  pregao: pregao.value.estado,
  quando: quando.value,
  carteiraPct: props.agora.carteiraPct,
  bolsaPct: bolsaPct.value,
  alerta: props.agora.alerta ? { nome: props.agora.alerta.nome, pct: props.agora.alerta.pct } : null,
}))

const temDia = computed(() => !!props.agora.diaValor)
const rotulo = computed(() => rotuloDaPilula(quando.value))

/* ——— o losango do dia ——— */
// sem o dia da carteira, o losango some (dado que falta some, nunca vira zero)
const temLosango = computed(() => props.agora.carteiraPct != null)
// antes da abertura, o pregão anterior vai esmaecido (a mesma regra da home)
const esmaecido = computed(() => pregao.value.estado === 'antes' && props.agora.priceDate?.slice(0, 10) !== agoraEmSP().iso)
// a linha do provento: quem pagou, e o R$ só com os valores à vista
const proventoSub = computed(() => subDoProvento(props.agora, quando.value ?? 'hoje', revelado.value))
const frente = computed(() => quemNaFrente(props.agora.carteiraPct, bolsaPct.value))
const contextoLosango = computed(() => {
  const c = props.agora.carteiraPct
  if (c == null) return null
  const b = bolsaPct.value
  return {
    id: 'carteira:losango', tipo: 'carteira', rotulo: 'Você e a bolsa hoje',
    texto: [`Sua carteira: ${pctComSinal(c)}`, b != null ? `Ibovespa: ${pctComSinal(b)}` : '', props.agora.provento ? `Provento: ${proventoSub.value}` : ''].filter(Boolean).join('\n'),
  }
})

/* ——— o papel que pede atenção: logo, nome, ticker e % ——— */
const alerta = computed(() => (frase.value.tom === 'atencao' ? props.agora.alerta : null))
const alertaSub = computed(() => {
  const a = alerta.value
  if (!a) return ''
  return a.nome.toUpperCase() !== a.ticker.toUpperCase() ? a.ticker : 'Na sua carteira'
})
const contextoAlerta = computed(() => {
  const a = alerta.value
  return a ? { id: 'carteira:alerta', tipo: 'carteira', rotulo: 'Papel que pede atenção', texto: `${a.nome} (${a.ticker}): ${pctComSinal(a.pct)} ${quando.value ?? 'hoje'}` } : null
})

/* ——— o título surge palavra por palavra (o gesto de utils/revelar-palavras.ts) ——— */
const palavras = computed(() => frase.value.titulo.split(' ').filter(Boolean))

/* ——— a luz do céu: o tom do dia (variação 1) ——— */
const ceu = computed(() => {
  if (frase.value.tom === 'atencao') return 'atencao'
  const c = props.agora.carteiraPct
  if (c == null || Math.abs(c) < 0.05) return 'calma'
  return c > 0 ? 'alta' : 'queda'
})
// a luz que segue o cursor (só onde há ponteiro fino): as coordenadas vão em
// variáveis do próprio elemento, sem re-render
function mover(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--cag-mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--cag-my', `${e.clientY - r.top}px`)
}

const perguntaPorque = computed(() => {
  const a = props.agora.alerta
  return a ? `Por que ${a.ticker} caiu ${quando.value ?? 'hoje'}? E o que isso muda na minha carteira?` : null
})
// os atalhos abrem o painel do chat nesta página (02/11/2026); o href da
// /busca fica para quem abre em outra aba
const porque = computed(() => (perguntaPorque.value ? `/busca?chat=1&q=${encodeURIComponent(perguntaPorque.value)}` : null))
</script>

<template>
  <section
    class="cag"
    :class="[`cag--v${variante}`, `cag--${frase.tom}`, `cag--ceu-${ceu}`]"
    aria-labelledby="cag-titulo"
    @pointermove="variante === 1 ? mover($event) : undefined"
  >
    <!-- 1 · o céu: a luz do tom do dia, a do cursor e o grão -->
    <div v-if="variante === 1" class="cag__ceu" aria-hidden="true">
      <span class="cag__luz" />
      <span class="cag__luz cag__luz--baixa" />
      <span class="cag__cursor" />
      <span class="cag__grao" />
    </div>

    <div class="cag__corpo" @pointermove="variante === 3 ? mover($event) : undefined">
      <span v-if="variante === 3" class="cag__cursor" aria-hidden="true" />

      <div v-contexto-chat="{ id: 'carteira:hoje', tipo: 'carteira', rotulo: 'Carteira hoje', texto: [frase.titulo, frase.linha].filter(Boolean).join('\n') }" class="cag__miolo">
        <span class="cag__estado" :class="`cag__estado--${frase.tom === 'atencao' ? 'atencao' : pregao.estado}`">
          <span class="cag__ponto" aria-hidden="true" />
          {{ frase.tom === 'atencao' ? 'Pede atenção' : pregao.rotulo }}
        </span>
        <h1 id="cag-titulo" class="cag__titulo">
          <template v-for="(p, i) in palavras" :key="`${i}-${p}`"><span class="cag__palavra" :style="{ '--i': i }">{{ p }}</span>{{ ' ' }}</template>
        </h1>
        <p class="cag__linha" :class="{ 'cag__linha--analisando': frase.analisando }">{{ frase.linha }}</p>
      </div>

      <!-- o papel que pede atenção: o papel de verdade, com logo, nome e % -->
      <div v-if="alerta" v-contexto-chat="contextoAlerta" class="cag__alerta" role="group" aria-label="Papel que pede atenção">
        <NuxtLink :to="`/asset/${alerta.ticker}`" class="cag__alerta-papel">
          <span class="cag__alerta-logo">
            <NuAssetLogo :ticker="alerta.ticker" :letter="alerta.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="48" :radius="14" />
          </span>
          <span class="cag__alerta-id">
            <span class="cag__alerta-nome">{{ alerta.nome }}</span>
            <span class="cag__alerta-ticker">{{ alertaSub }}</span>
          </span>
        </NuxtLink>
        <span class="cag__alerta-pct">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20 4 8h16Z" fill="currentColor" /></svg>
          {{ pctComSinal(alerta.pct) }}
          <span class="cag__alerta-quando">{{ quando ?? 'hoje' }}</span>
        </span>
        <NuxtLink v-if="porque" :to="porque" class="cag__porque" @click.prevent="painel.abrir(perguntaPorque!)">
          Por que caiu?
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>

      <div class="cag__destaque">
        <!-- o losango do dia: o logo da marca, com os números ao lado -->
        <div v-if="temLosango" v-contexto-chat="contextoLosango" class="cag__cartao" :class="{ 'cag__cartao--esmaecido': esmaecido }" data-clarity-mask="true">
          <div class="cag__cartao-logo">
            <HomeLosango
              :tema="variante === 1 ? 'noite' : 'dia'" :compacto="variante !== 3"
              link-dia="/carteira#posicoes" link-provento="/carteira#renda-passiva"
              :voce="agora.carteiraPct" :bolsa="bolsaPct"
              :provento="agora.provento" :provento-sub="proventoSub" :esmaecido="esmaecido"
            />
          </div>
          <div class="cag__cartao-texto" aria-hidden="true">
            <p class="cag__cartao-nums">
              <span class="cag__cartao-num" :class="agora.carteiraPct! < 0 ? 'cag__cartao-num--down' : 'cag__cartao-num--up'"><span class="cag__cartao-quem">Você</span> {{ pctComSinal(agora.carteiraPct!) }}</span>
              <span v-if="bolsaPct != null" class="cag__cartao-num cag__cartao-num--bolsa"><span class="cag__cartao-quem">Bolsa</span> {{ pctComSinal(bolsaPct) }}</span>
            </p>
            <p v-if="frente" class="cag__cartao-rel">{{ frente.lider === 'empate' ? 'Empatado com a bolsa' : `${frente.numero} ${frente.relacao}` }}</p>
            <p class="cag__cartao-prov" :class="{ 'cag__cartao-prov--aceso': agora.provento }">
              <span class="cag__cartao-cifrao" aria-hidden="true">$</span> Provento · {{ proventoSub }}
            </p>
          </div>
        </div>

        <!-- o resultado do dia: escondido no olho, vai escondido ao chat -->
        <div v-contexto-chat="{ id: 'carteira:dia', tipo: 'carteira', rotulo: 'Resultado do dia', texto: revelado ? [`Resultado ${rotulo}: ${agora.diaValor ?? ''} ${agora.diaPct ?? ''}`, `Patrimônio: ${agora.patrimonio}`].join('\n') : 'Resultado do dia e patrimônio (a pessoa escondeu os valores na tela)' }" class="cag__dia" data-clarity-mask="true">
          <span v-if="variante === 2" class="cag__dia-rotulo">Seu resultado {{ rotulo === 'hoje' ? 'de hoje' : `de ${rotulo}` }}</span>
          <div class="cag__dia-linha">
            <button
              v-if="temDia"
              type="button"
              class="cag__pilula"
              :class="revelado ? `cag__pilula--${agora.diaDir}` : 'cag__pilula--oculta'"
              :aria-pressed="revelado"
              :aria-label="revelado ? `Resultado ${rotulo}: ${agora.diaValor}, ${agora.diaPct}. Esconder.` : `Mostrar o resultado ${rotulo === 'hoje' ? 'de hoje' : `de ${rotulo}`}`"
              @click="alternarRevelado"
            >
              <span class="cag__pilula-valor">{{ revelado ? agora.diaValor : 'R$ •••••' }}</span>
              <span v-if="revelado && agora.diaPct" class="cag__pilula-pct">{{ agora.diaPct }}</span>
              <span v-if="variante !== 2" class="cag__pilula-quando">{{ rotulo }}</span>
            </button>
            <button
              type="button"
              class="cag__olho"
              :aria-label="revelado ? 'Esconder os valores' : 'Mostrar os valores'"
              :aria-pressed="revelado"
              @click="alternarRevelado"
            >
              <svg v-if="revelado" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
            </button>
          </div>
          <!-- o total ocupa o lugar dele mesmo escondido: revelar não empurra a tela -->
          <span class="cag__total" :class="{ 'cag__total--oculto': !revelado }" :aria-hidden="!revelado">
            Sua carteira vale <strong>{{ revelado ? agora.patrimonio : 'R$ ••••••' }}</strong>
          </span>
        </div>
      </div>

      <div v-contexto-chat="{ id: 'carteira:contas', tipo: 'carteira', rotulo: 'Contas conectadas' }" class="cag__contas" data-clarity-mask="true">
        <template v-if="contasCarregando">
          <NuSkeleton v-for="i in 2" :key="i" :tone="variante === 1 ? 'navy' : 'cream'" width="132px" height="40px" radius="pill" />
        </template>
        <template v-else>
          <component
            :is="RECONECTAR.has(c.status) ? Link : 'span'"
            v-for="c in connections"
            :key="c.id"
            :to="RECONECTAR.has(c.status) ? '/conta#open-finance' : undefined"
            class="cag__conta"
            :class="{ 'cag__conta--reconectar': RECONECTAR.has(c.status) }"
          >
            <span class="cag__conta-logo" aria-hidden="true">
              <img v-if="c.institution_logo" :src="c.institution_logo" alt="" width="26" height="26" loading="lazy">
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14" /></svg>
            </span>
            <span class="cag__conta-nome">{{ c.institution_name }}</span>
            <span v-if="RECONECTAR.has(c.status)" class="cag__conta-status">Reconectar</span>
          </component>
        </template>
        <button type="button" class="cag__conta-mais" :disabled="opening || registering" @click="adicionarConta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          {{ rotuloAdicionar }}
        </button>
        <p v-if="conectou" class="cag__contas-aviso" role="status">Conta conectada. As posições dela chegam aqui em alguns minutos.</p>
        <p v-else-if="erroConexao" class="cag__contas-aviso cag__contas-aviso--erro" role="alert">{{ erroConexao }}</p>
      </div>
    </div>

    <div class="cag__pe">
      <span class="cag__meta">{{ agora.ativos }}<template v-if="agora.atualizado"> · atualizado {{ agora.atualizado }}</template></span>
      <NuxtLink to="/busca?chat=1" class="cag__perguntar" @click.prevent="painel.abrir()">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cag__losango-miolo" /></svg>
        Pergunte à Redentia
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
/* ════════ a base: o que vale para as três ════════ */
.cag {
  /* as cores do topo: as do creme por padrão; a noite (1) redefine */
  --cag-fundo: var(--nu-cream);
  --cag-tinta: var(--nu-ink);
  --cag-sub: var(--nu-gray-2);
  --cag-fraco: var(--nu-gray);
  --cag-linha: var(--nu-cream-line);
  --cag-sup: var(--nu-white);
  --cag-up: var(--nu-green-text);
  --cag-down: var(--nu-red-text);
  --cag-sombra: 0 0 0 1px var(--nu-navy-06), 0 24px 60px -30px rgba(12, 21, 36, 0.22);
  --cag-sombra-alta: 0 0 0 1px var(--nu-navy-07), 0 34px 70px -30px rgba(12, 21, 36, 0.34);
  --cag-ease: cubic-bezier(.2, .8, .2, 1);

  position: relative; isolation: isolate; overflow: hidden;
  background: var(--cag-fundo); color: var(--cag-tinta);
  padding: clamp(40px, 6vw, 88px) clamp(22px, 5.5vw, 80px) clamp(24px, 3vw, 36px);
  display: flex; flex-direction: column;
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.cag__corpo { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; align-items: start; }
.cag__miolo { grid-area: frase; display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
.cag__alerta { grid-area: alerta; }
.cag__destaque { grid-area: destaque; min-width: 0; }
.cag__contas { grid-area: contas; }

/* a entrada: cada bloco chega na sua vez (só embeleza; sem JS o CSS já mostra) */
.cag__estado, .cag__linha, .cag__alerta, .cag__destaque, .cag__contas, .cag__pe {
  animation: cag-sobe 1s var(--cag-ease) both; animation-delay: var(--cag-d, 0ms);
}
.cag__linha { --cag-d: 420ms; }
.cag__alerta { --cag-d: 560ms; }
.cag__destaque { --cag-d: 660ms; }
.cag__contas { --cag-d: 780ms; }
.cag__pe { --cag-d: 880ms; }
@keyframes cag-sobe { from { opacity: 0; transform: translateY(14px); } }
.cag__palavra { display: inline-block; animation: cag-palavra 620ms cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(110ms + var(--i) * 70ms); }
@keyframes cag-palavra { from { opacity: 0; filter: blur(10px); transform: translateY(10px); } }

.cag__estado {
  display: inline-flex; align-items: center; gap: 9px;
  color: var(--cag-sub); font-size: var(--nu-fs-md); font-weight: 700;
}
.cag__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-sand); }
.cag__estado--aberta { color: var(--nu-green-text); }
.cag__estado--aberta .cag__ponto { background: var(--nu-green); box-shadow: 0 0 0 4px var(--nu-green-tint); }
.cag__estado--atencao { color: var(--nu-amber-text); }
.cag__estado--atencao .cag__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px var(--nu-amber-bg); }

.cag__titulo {
  margin: 16px 0 0; color: var(--cag-tinta);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1; text-wrap: balance;
}
.cag__linha {
  margin: clamp(12px, 1.6vw, 18px) 0 0; max-width: 620px;
  color: var(--cag-sub); font-size: clamp(17px, 1.7vw, 21px); font-weight: 500; line-height: 1.45;
  font-variant-numeric: tabular-nums; text-wrap: pretty;
}
/* o brilho do "Estamos analisando…" do Agora: passa três vezes e para */
.cag__linha--analisando {
  background: linear-gradient(100deg, var(--cag-sub) 0%, var(--cag-sub) 38%, var(--cag-brilho, var(--nu-sand)) 50%, var(--cag-sub) 62%, var(--cag-sub) 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: cag-sobe 1s var(--cag-ease) 420ms both, cag-brilho 2.6s linear 1.2s 3 both;
}
@keyframes cag-brilho { from { background-position: 100% 0; } to { background-position: 0% 0; } }

/* ——— o papel que pede atenção ——— */
.cag__alerta {
  display: flex; align-items: center; gap: 12px 16px; flex-wrap: wrap;
  padding: 12px 12px 12px 12px; border-radius: var(--nu-r-panel);
  background: var(--nu-amber-bg); color: var(--nu-ink);
}
.cag__alerta-papel { display: inline-flex; align-items: center; gap: 12px; min-width: 0; color: inherit; border-radius: var(--nu-r-input); }
.cag__alerta-papel:hover { color: inherit; }
.cag__alerta-logo { display: inline-flex; border-radius: 14px; box-shadow: 0 0 0 1px var(--nu-navy-06), 0 10px 22px -12px rgba(12, 21, 36, 0.45); transition: transform .35s var(--cag-ease); }
.cag__alerta-papel:hover .cag__alerta-logo { transform: translateY(-2px) rotate(-3deg) scale(1.04); }
.cag__alerta-id { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.cag__alerta-nome { font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; line-height: 1.2; }
.cag__alerta-ticker { color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.cag__alerta-pct {
  display: inline-flex; align-items: center; gap: 6px; margin-left: auto;
  color: var(--nu-red-text); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.cag__alerta-quando { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; letter-spacing: 0; }
.cag__porque {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px;
  background: var(--nu-navy); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); padding: 0 18px 0 20px; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
  box-shadow: 0 14px 30px -16px rgba(12, 21, 36, 0.7);
  transition: transform .2s var(--cag-ease), background .2s, box-shadow .2s;
}
.cag__porque svg { transition: transform .2s ease; }
.cag__porque:hover { color: var(--nu-cream-text); background: var(--nu-navy-2); transform: translateY(-2px); box-shadow: 0 18px 36px -16px rgba(12, 21, 36, 0.8); }
.cag__porque:hover svg { transform: translateX(3px); }
.cag__porque:focus-visible, .cag__alerta-papel:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— o losango: o logo e os números ao lado ——— */
.cag__cartao { display: flex; align-items: center; gap: clamp(12px, 2vw, 18px); min-width: 0; }
/* o recorte das abas do logo usa o fundo de quem está atrás */
.cag__cartao-logo { flex: none; width: clamp(80px, 9vw, 104px); --hlo-fundo: var(--cag-sup); }
.cag__cartao-texto { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.cag__cartao-nums { margin: 0; display: flex; flex-wrap: wrap; gap: 2px 16px; }
.cag__cartao-num { font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cag__cartao-num--up { color: var(--cag-up); }
.cag__cartao-num--down { color: var(--cag-down); }
.cag__cartao-num--bolsa { color: var(--cag-bolsa, var(--nu-navy)); }
.cag__cartao-quem { font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: 0; }
.cag__cartao-rel { margin: 0; color: var(--cag-tinta); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.cag__cartao-prov { margin: 0; color: var(--cag-sub); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.cag__cartao-prov--aceso { color: var(--cag-tinta); font-weight: 700; }
.cag__cartao-cifrao { color: var(--cag-up); font-weight: 800; }
.cag__cartao--esmaecido .cag__cartao-nums, .cag__cartao--esmaecido .cag__cartao-rel { opacity: .6; }

/* ——— a pílula do dia: escondida ao abrir ——— */
.cag__dia { display: flex; align-items: center; gap: 10px 12px; flex-wrap: wrap; }
.cag__dia-linha { display: flex; align-items: center; gap: 10px; }
.cag__pilula {
  display: inline-flex; align-items: baseline; gap: 10px;
  border: none; cursor: pointer; font-family: inherit;
  border-radius: var(--nu-r-input); padding: 12px 18px 12px 16px;
  transition: background .25s, color .25s, transform .2s var(--cag-ease), box-shadow .25s;
}
.cag__pilula:hover { transform: translateY(-1px); }
.cag__pilula:active { transform: translateY(1px); }
.cag__pilula:focus-visible, .cag__olho:focus-visible, .cag__perguntar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cag__pilula--oculta { background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-card); }
.cag__pilula--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cag__pilula--down { background: var(--nu-red-pill-bg); color: var(--nu-red-2); }
.cag__pilula-valor { font-size: clamp(22px, 2.4vw, 28px); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.cag__pilula-pct { font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.cag__pilula-quando { font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
.cag__olho {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; cursor: pointer;
  background: transparent; color: var(--cag-tinta); border: 2px solid var(--nu-ink-16);
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .2s, border-color .2s, transform .2s var(--cag-ease);
}
.cag__olho:hover { background: var(--nu-white); border-color: var(--nu-ink-30); transform: scale(1.05); }
.cag__total { color: var(--cag-sub); font-size: var(--nu-fs-md); font-weight: 500; font-variant-numeric: tabular-nums; transition: opacity .25s, transform .25s; }
.cag__total strong { color: var(--cag-tinta); font-weight: 800; }
/* escondido, o total mostra só a máscara: o lugar dele não fica vazio */
.cag__total--oculto strong { color: var(--cag-sub); letter-spacing: .04em; }

/* ——— as contas do Open Finance: um chip por banco e o "+" no fim da fila ——— */
.cag__contas { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cag__conta {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-card);
  border-radius: var(--nu-r-pill); padding: 7px 16px 7px 7px;
  font-size: var(--nu-fs-sm); font-weight: 700;
  transition: transform .2s var(--cag-ease), box-shadow .2s;
}
.cag__conta:hover { transform: translateY(-1px); }
.cag__conta-logo {
  width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream); color: var(--nu-gray-2);
}
.cag__conta-logo img { width: 100%; height: 100%; object-fit: cover; }
.cag__conta--reconectar:hover { color: var(--nu-ink); }
.cag__conta-status { color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 800; }
.cag__conta-mais {
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer; font-family: inherit;
  background: transparent; color: var(--cag-tinta); border: 2px dashed var(--nu-ink-16);
  border-radius: var(--nu-r-pill); padding: 9px 16px;
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, border-color .2s, transform .2s var(--cag-ease);
}
.cag__conta-mais:hover:not(:disabled) { background: var(--nu-white); border-color: var(--nu-ink-30); transform: translateY(-1px); }
.cag__conta-mais:disabled { cursor: progress; opacity: .7; }
.cag__conta-mais:focus-visible, .cag__conta--reconectar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cag__contas-aviso { flex-basis: 100%; margin: 4px 0 0; color: var(--nu-green-text); font-size: var(--nu-fs-sm); font-weight: 500; }
.cag__contas-aviso--erro { color: var(--nu-red-2); }

/* ——— o pé ——— */
.cag__pe {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin-top: clamp(28px, 4vw, 48px); padding-top: 20px; border-top: 1px solid var(--cag-linha);
}
.cag__meta { color: var(--cag-fraco); font-size: var(--nu-fs-sm); font-weight: 500; }
.cag__perguntar {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-navy); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); padding: 11px 20px 11px 16px;
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, transform .2s var(--cag-ease);
}
.cag__perguntar svg { transition: transform .35s var(--cag-ease); }
.cag__perguntar:hover { background: var(--nu-navy-2); color: var(--nu-cream-text); transform: translateY(-2px); }
.cag__perguntar:hover svg { transform: rotate(45deg); }
.cag__losango-miolo { fill: var(--nu-navy); }
.cag__perguntar:hover .cag__losango-miolo { fill: var(--nu-navy-2); }

/* ════════ 1 · A noite: a banda do céu, o título branco, o losango em vidro ════════ */
.cag--v1 {
  --cag-fundo: var(--nu-navy);
  --cag-tinta: var(--nu-cream-text);
  --cag-sub: var(--nu-cream-text-70);
  --cag-fraco: var(--nu-cream-text-55);
  --cag-linha: var(--nu-cream-text-12);
  --cag-sup: var(--nu-navy-2);
  --cag-up: var(--nu-green-soft);
  --cag-down: var(--nu-red-soft);
  --cag-bolsa: var(--nu-cream-text);
  --cag-brilho: var(--nu-white);
  --cag-luz: rgba(100, 181, 255, 0.34);
  --cag-luz-2: rgba(47, 106, 255, 0.22);
  padding-top: clamp(48px, 7vw, 104px);
  min-height: clamp(520px, calc(100svh - 230px), 700px);
  justify-content: center;
}
.cag--v1.cag--ceu-alta { --cag-luz: rgba(95, 211, 243, 0.32); --cag-luz-2: rgba(143, 240, 181, 0.16); }
.cag--v1.cag--ceu-queda { --cag-luz: rgba(255, 107, 138, 0.26); --cag-luz-2: rgba(180, 140, 255, 0.18); }
.cag--v1.cag--ceu-atencao { --cag-luz: rgba(255, 181, 71, 0.34); --cag-luz-2: rgba(255, 107, 138, 0.16); }

.cag__ceu {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(180deg, var(--nu-navy-2) 0%, var(--nu-navy) 46%, color-mix(in srgb, var(--nu-navy) 72%, var(--nu-ink)) 100%);
}
/* a luz do tom do dia: nasce no alto, à direita, uma vez */
.cag__luz {
  position: absolute; width: min(1100px, 130vw); aspect-ratio: 1; right: -24%; top: -62%;
  background: radial-gradient(closest-side, var(--cag-luz), transparent 72%);
  filter: blur(8px);
  animation: cag-nasce 1.8s var(--cag-ease) both;
}
.cag__luz--baixa {
  width: min(900px, 110vw); left: -30%; right: auto; top: auto; bottom: -70%;
  background: radial-gradient(closest-side, var(--cag-luz-2), transparent 72%);
  animation-delay: .25s;
}
@keyframes cag-nasce { from { opacity: 0; transform: translateY(60px) scale(.88); } }
/* a luz que segue o cursor */
.cag__cursor {
  position: absolute; width: 520px; height: 520px; left: calc(var(--cag-mx, 70%) - 260px); top: calc(var(--cag-my, 30%) - 260px);
  background: radial-gradient(closest-side, rgba(255, 255, 255, 0.075), transparent 70%);
  opacity: 0; transition: opacity .4s ease; pointer-events: none;
}
.cag--v1:hover .cag__cursor { opacity: 1; }
/* o grão: o céu não é um degradê de computador */
.cag__grao {
  position: absolute; inset: 0; opacity: .14; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
.cag--v1 .cag__titulo { font-size: clamp(46px, 7.4vw, 108px); letter-spacing: -0.05em; line-height: .96; }
.cag--v1 .cag__estado--fechada, .cag--v1 .cag__estado--antes, .cag--v1 .cag__estado--sem-pregao { color: var(--cag-sub); }
.cag--v1 .cag__estado--aberta { color: var(--nu-green-soft); }
.cag--v1 .cag__estado--aberta .cag__ponto { background: var(--nu-green-soft); box-shadow: 0 0 0 4px var(--nu-green-soft-16), 0 0 14px var(--nu-green-soft); }
.cag--v1 .cag__estado--atencao { color: var(--nu-amber-soft); }
.cag--v1 .cag__estado--atencao .cag__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px var(--nu-warning-bg), 0 0 14px var(--nu-amber-fill); }
.cag--v1 .cag__ponto { background: var(--nu-cream-text-45); }

/* o papel na noite: vidro âmbar */
.cag--v1 .cag__alerta {
  background: linear-gradient(100deg, rgba(255, 181, 71, 0.2), rgba(255, 181, 71, 0.08));
  color: var(--cag-tinta);
  box-shadow: inset 0 0 0 1px rgba(255, 214, 160, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px);
}
.cag--v1 .cag__alerta-ticker { color: var(--nu-amber-soft); }
.cag--v1 .cag__alerta-pct { color: var(--nu-red-soft); }
.cag--v1 .cag__alerta-quando { color: var(--cag-sub); }
.cag--v1 .cag__porque { background: var(--nu-amber-soft); color: var(--nu-navy); box-shadow: 0 14px 34px -14px rgba(255, 181, 71, 0.6); }
.cag--v1 .cag__porque:hover { background: var(--nu-white); color: var(--nu-navy); box-shadow: 0 18px 40px -14px rgba(255, 181, 71, 0.75); }

/* o cartão de vidro: o losango e o dia */
.cag--v1 .cag__destaque {
  display: flex; flex-direction: column; gap: 18px;
  padding: clamp(16px, 2vw, 22px);
  border-radius: var(--nu-r-card-lg);
  background: color-mix(in srgb, var(--nu-navy-2) 88%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 40px 80px -36px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px) saturate(1.2);
  transition: transform .45s var(--cag-ease), box-shadow .45s var(--cag-ease);
}
.cag--v1 .cag__destaque:hover { transform: translateY(-3px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 50px 90px -36px rgba(0, 0, 0, 0.8); }
.cag--v1 .cag__cartao-logo { --nu-agora-bg: var(--nu-navy-2); width: clamp(104px, 10vw, 136px); }
.cag--v1 .cag__dia { padding-top: 16px; border-top: 1px solid var(--cag-linha); }
.cag--v1 .cag__pilula--oculta { background: rgba(255, 255, 255, 0.1); color: var(--cag-tinta); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12); }
.cag--v1 .cag__pilula--oculta:hover { background: rgba(255, 255, 255, 0.16); }
.cag--v1 .cag__pilula--up { background: var(--nu-green-soft-16); color: var(--nu-green-soft); }
.cag--v1 .cag__pilula--down { background: rgba(255, 179, 184, 0.16); color: var(--nu-red-soft); }
.cag--v1 .cag__olho { border-color: rgba(255, 255, 255, 0.2); }
.cag--v1 .cag__olho:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.36); }
.cag--v1 .cag__conta { background: rgba(255, 255, 255, 0.08); color: var(--cag-tinta); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); }
.cag--v1 .cag__conta:hover { background: rgba(255, 255, 255, 0.12); }
.cag--v1 .cag__conta--reconectar:hover { color: var(--cag-tinta); }
.cag--v1 .cag__conta-logo { background: rgba(255, 255, 255, 0.12); color: var(--cag-sub); }
.cag--v1 .cag__conta-status { color: var(--nu-amber-soft); }
.cag--v1 .cag__conta-mais { border-color: rgba(255, 255, 255, 0.22); }
.cag--v1 .cag__conta-mais:hover:not(:disabled) { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.4); }
.cag--v1 .cag__contas-aviso { color: var(--nu-green-soft); }
/* o horizonte: a linha do pé acende no meio */
.cag--v1 .cag__pe { border-top: 0; }
.cag--v1 .cag__pe::before {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.3) 70%, transparent);
}
.cag--v1 .cag__perguntar { background: var(--nu-cream-text); color: var(--nu-navy); box-shadow: 0 16px 36px -18px rgba(0, 0, 0, 0.8); }
.cag--v1 .cag__perguntar:hover { background: var(--nu-white); color: var(--nu-navy); }
.cag--v1 .cag__losango-miolo, .cag--v1 .cag__perguntar:hover .cag__losango-miolo { fill: var(--nu-cream-text); }

/* ════════ 2 · Creme composto: título firme, o bloco de destaque ao lado, a faixa âmbar ════════ */
.cag--v2 { padding-top: clamp(36px, 5vw, 72px); }
.cag--v2 .cag__titulo { font-size: var(--nu-fs-h2); letter-spacing: -0.035em; }
/* o bloco de destaque: o resultado do dia em cima, o losango embaixo */
.cag--v2 .cag__destaque {
  display: flex; flex-direction: column; gap: 18px;
  padding: clamp(18px, 2.2vw, 26px);
  background: var(--nu-white); border-radius: var(--nu-r-card-lg); box-shadow: var(--cag-sombra);
  transition: transform .45s var(--cag-ease), box-shadow .45s var(--cag-ease);
}
.cag--v2 .cag__destaque:hover { transform: translateY(-3px); box-shadow: var(--cag-sombra-alta); }
.cag--v2 .cag__dia { order: -1; flex-direction: column; align-items: flex-start; gap: 8px; }
.cag--v2 .cag__dia-rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.cag--v2 .cag__pilula { padding: 0; background: transparent !important; box-shadow: none !important; }
.cag--v2 .cag__pilula-valor { font-size: clamp(32px, 3.6vw, 44px); letter-spacing: -0.035em; }
.cag--v2 .cag__pilula--oculta { color: var(--nu-ink); }
.cag--v2 .cag__pilula--up { color: var(--nu-green-text); }
.cag--v2 .cag__pilula--down { color: var(--nu-red-text); }
.cag--v2 .cag__olho { width: 40px; height: 40px; }
.cag--v2 .cag__cartao { padding-top: 18px; border-top: 1px solid var(--nu-cream-line); }
.cag--v2 .cag__cartao-logo { width: clamp(76px, 8vw, 92px); }
/* a faixa âmbar: o papel inteiro, com uma luz que passa uma vez */
.cag--v2 .cag__alerta {
  position: relative; overflow: hidden;
  padding: 12px 12px 12px 14px;
  background: linear-gradient(100deg, var(--nu-amber-bg), color-mix(in srgb, var(--nu-amber-bg) 70%, var(--nu-amber-soft)));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nu-amber-fill) 30%, transparent), 0 20px 44px -28px rgba(166, 107, 0, 0.55);
}
.cag--v2 .cag__alerta::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
  transform: translateX(-100%); animation: cag-passa 1.6s ease 1.3s 1 both;
}
@keyframes cag-passa { to { transform: translateX(100%); } }

/* ════════ 3 · O cartão do dia: um cartão só, grande, com sombra navy ════════ */
.cag--v3 { padding-top: clamp(28px, 4vw, 56px); }
.cag--v3 .cag__corpo {
  overflow: hidden; isolation: isolate;
  padding: clamp(20px, 3.4vw, 44px);
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  box-shadow: 0 0 0 1px var(--nu-navy-07), 0 50px 100px -48px rgba(12, 21, 36, 0.45), 0 14px 34px -22px rgba(12, 21, 36, 0.2);
  animation: cag-sobe 1s var(--cag-ease) both;
}
/* a manhã do cartão: uma luz do tom do dia atrás do losango, e a do cursor */
.cag--v3 .cag__corpo::before {
  content: ''; position: absolute; z-index: -1; right: -12%; top: -30%; width: 70%; aspect-ratio: 1;
  background: radial-gradient(closest-side, var(--cag-manha, rgba(47, 106, 255, 0.1)), transparent 72%);
  animation: cag-nasce 1.8s var(--cag-ease) .2s both;
}
.cag--v3.cag--ceu-alta .cag__corpo { --cag-manha: rgba(20, 143, 78, 0.1); }
.cag--v3.cag--ceu-queda .cag__corpo { --cag-manha: rgba(214, 50, 59, 0.08); }
.cag--v3.cag--ceu-atencao .cag__corpo { --cag-manha: rgba(232, 161, 61, 0.18); }
.cag--v3 .cag__cursor {
  position: absolute; z-index: -1; width: 460px; height: 460px; left: calc(var(--cag-mx, 70%) - 230px); top: calc(var(--cag-my, 30%) - 230px);
  background: radial-gradient(closest-side, rgba(47, 106, 255, 0.07), transparent 70%);
  opacity: 0; transition: opacity .4s ease; pointer-events: none;
}
.cag--v3 .cag__corpo:hover .cag__cursor { opacity: 1; }
.cag--v3 .cag__titulo { font-size: clamp(40px, 5.4vw, 74px); }
.cag--v3 .cag__destaque { display: contents; }
.cag--v3 .cag__cartao { grid-area: cartao; flex-direction: column; align-items: stretch; animation: cag-sobe 1s var(--cag-ease) 660ms both; }
.cag--v3 .cag__cartao-logo { width: 100%; max-width: 400px; margin: 0 auto; }
.cag--v3 .cag__cartao-texto { display: none; }
.cag--v3 .cag__dia { grid-area: dia; animation: cag-sobe 1s var(--cag-ease) 560ms both; }
.cag--v3 .cag__contas { padding-top: 18px; border-top: 1px solid var(--nu-cream-line); }
.cag--v3 .cag__conta { background: var(--nu-cream); box-shadow: none; }
.cag--v3 .cag__conta-logo { background: var(--nu-white); }
.cag--v3 .cag__olho:hover { background: var(--nu-cream); }
.cag--v3 .cag__pilula--oculta { background: var(--nu-cream); box-shadow: inset 0 0 0 1px var(--nu-navy-06); }
.cag--v3 .cag__alerta { margin-top: 2px; }
.cag--v3 .cag__pe { border-top: 0; margin-top: 20px; padding-top: 0; }

/* ════════ a partir do tablet: as composições ════════ */
@media (min-width: 900px) {
  .cag--v1 .cag__corpo {
    grid-template-columns: minmax(0, 1.25fr) minmax(340px, .75fr);
    grid-template-areas: "frase destaque" "alerta destaque" "contas destaque";
    gap: 22px clamp(32px, 4vw, 64px); align-items: center;
  }
  .cag--v1 .cag__alerta { align-self: start; max-width: 640px; }
  .cag--v1 .cag__contas { align-self: start; }

  .cag--v2 .cag__corpo {
    grid-template-columns: minmax(0, 1.2fr) minmax(340px, .8fr);
    grid-template-areas: "alerta alerta" "frase destaque" "contas destaque";
    gap: 24px clamp(32px, 4vw, 64px);
  }
  .cag--v2 .cag__miolo { align-self: center; }
  .cag--v2 .cag__alerta { padding: 14px 14px 14px 16px; }

  .cag--v3 .cag__corpo {
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr);
    grid-template-areas: "alerta alerta" "frase cartao" "dia cartao" "contas contas";
    gap: 22px clamp(28px, 4vw, 56px);
  }
  .cag--v3 .cag__miolo { align-self: end; }
  .cag--v3 .cag__dia { align-self: start; }
  .cag--v3 .cag__cartao { align-self: center; }
}
@media (max-width: 899px) {
  .cag__corpo { grid-template-areas: "frase" "alerta" "destaque" "contas"; }
  .cag--v3 .cag__corpo { grid-template-areas: "frase" "alerta" "cartao" "dia" "contas"; }
  .cag--v1 .cag__corpo { gap: 26px; }
}
@media (max-width: 560px) {
  .cag { padding-left: 20px; padding-right: 20px; }
  .cag--v1 { min-height: 0; }
  .cag--v3 { padding-left: 14px; padding-right: 14px; }
  .cag--v3 .cag__corpo { padding: 22px 18px; }
  .cag--v3 .cag__pe { padding: 0 6px; }
  /* o papel: o nome em cima, o % ao lado, o "Por que caiu?" embaixo inteiro */
  .cag__alerta-pct { font-size: var(--nu-fs-xl); }
  .cag__porque { flex: 1 1 100%; justify-content: center; }
  .cag--v3 .cag__cartao-logo { max-width: 320px; }
}

@media (prefers-reduced-motion: reduce) {
  .cag__estado, .cag__linha, .cag__alerta, .cag__destaque, .cag__contas, .cag__pe, .cag__palavra,
  .cag__luz, .cag--v3 .cag__corpo, .cag--v3 .cag__corpo::before, .cag--v3 .cag__cartao, .cag--v3 .cag__dia,
  .cag--v2 .cag__alerta::after, .cag__linha--analisando { animation: none; }
  .cag__cursor { display: none; }
}
</style>
