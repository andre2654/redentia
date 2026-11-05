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
import type { CarteiraAgoraVM } from '~/types/carteira'
import { fraseDaCarteira, rotuloDaPilula } from '~/utils/carteira-agora'
import { pctComSinal, subDoProvento } from '~/utils/diaDaCarteira'
import { quemNaFrente } from '~/utils/losangoDoDia'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'

const props = defineProps<{ agora: CarteiraAgoraVM }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

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

const perguntaPorque = computed(() => {
  const a = props.agora.alerta
  return a ? `Por que ${a.ticker} caiu ${quando.value ?? 'hoje'}? E o que isso muda na minha carteira?` : null
})
// os atalhos abrem o painel do chat nesta página (02/11/2026); o href da
// /busca fica para quem abre em outra aba
const porque = computed(() => (perguntaPorque.value ? `/busca?chat=1&q=${encodeURIComponent(perguntaPorque.value)}` : null))
</script>

<template>
  <section class="cag" :class="`cag--${frase.tom}`" aria-labelledby="cag-titulo">
    <div class="cag__topo">
      <div v-contexto-chat="{ id: 'carteira:hoje', tipo: 'carteira', rotulo: 'Carteira hoje', texto: [frase.titulo, frase.linha].filter(Boolean).join('\n') }" class="cag__miolo">
        <span class="cag__estado" :class="`cag__estado--${frase.tom === 'atencao' ? 'atencao' : pregao.estado}`">
          <span class="cag__ponto" aria-hidden="true" />
          {{ frase.tom === 'atencao' ? 'Pede atenção' : pregao.rotulo }}
        </span>
        <h1 id="cag-titulo" class="cag__titulo">{{ frase.titulo }}</h1>
        <p class="cag__linha" :class="{ 'cag__linha--analisando': frase.analisando }">{{ frase.linha }}</p>
        <NuxtLink v-if="porque" :to="porque" class="cag__porque" @click.prevent="painel.abrir(perguntaPorque!)">Por que caiu?</NuxtLink>
      </div>
    </div>

    <!-- o losango do dia: o logo pequeno num cartão, com os números ao lado -->
    <div v-if="temLosango" v-contexto-chat="contextoLosango" class="cag__cartao" :class="{ 'cag__cartao--esmaecido': esmaecido }" data-clarity-mask="true">
      <div class="cag__cartao-logo">
        <HomeLosango
          tema="dia" compacto link-dia="/carteira#posicoes" link-provento="/carteira#renda-passiva"
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
        <span class="cag__pilula-quando">{{ rotulo }}</span>
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
      <!-- o total ocupa o lugar dele mesmo escondido: revelar não empurra a tela -->
      <span class="cag__total" :class="{ 'cag__total--oculto': !revelado }" :aria-hidden="!revelado">
        Sua carteira vale <strong>{{ revelado ? agora.patrimonio : 'R$ ••••••' }}</strong>
      </span>
    </div>

    <div v-contexto-chat="{ id: 'carteira:contas', tipo: 'carteira', rotulo: 'Contas conectadas' }" class="cag__contas" data-clarity-mask="true">
      <template v-if="contasCarregando">
        <NuSkeleton v-for="i in 2" :key="i" width="132px" height="40px" radius="pill" />
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
    </div>
    <p v-if="conectou" class="cag__contas-aviso" role="status">Conta conectada. As posições dela chegam aqui em alguns minutos.</p>
    <p v-else-if="erroConexao" class="cag__contas-aviso cag__contas-aviso--erro" role="alert">{{ erroConexao }}</p>

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
.cag {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 112px) clamp(22px, 5.5vw, 80px) clamp(24px, 3vw, 36px);
  min-height: clamp(520px, calc(100svh - 150px), 760px);
  display: flex; flex-direction: column;
  animation: nu-fade .5s ease both;
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.cag__topo { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.cag__miolo { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }

.cag__estado {
  display: inline-flex; align-items: center; gap: 9px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 700;
}
.cag__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-sand); }
.cag__estado--aberta { color: var(--nu-green-text); }
.cag__estado--aberta .cag__ponto { background: var(--nu-green); box-shadow: 0 0 0 4px var(--nu-green-tint); }
.cag__estado--atencao { color: var(--nu-amber-text); }
.cag__estado--atencao .cag__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px var(--nu-amber-bg); }

.cag__titulo {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: clamp(56px, 9.4vw, 132px); font-weight: 800; letter-spacing: -0.05em; line-height: 0.96;
}
.cag__linha {
  margin: clamp(16px, 2vw, 24px) 0 0; max-width: 680px;
  color: var(--nu-gray-2); font-size: clamp(18px, 2vw, 24px); font-weight: 500; line-height: 1.45;
  font-variant-numeric: tabular-nums;
}
/* o brilho do "Estamos analisando…" do Agora: passa três vezes e para */
.cag__linha--analisando {
  background: linear-gradient(100deg, var(--nu-gray-2) 0%, var(--nu-gray-2) 38%, var(--nu-sand) 50%, var(--nu-gray-2) 62%, var(--nu-gray-2) 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: cag-brilho 2.6s linear 3 both;
}
@keyframes cag-brilho { from { background-position: 100% 0; } to { background-position: 0% 0; } }

.cag__porque {
  margin-top: 22px; display: inline-flex; align-items: center;
  background: var(--nu-amber-bg); color: var(--nu-amber-text);
  border-radius: var(--nu-r-pill); padding: 11px 20px; font-size: var(--nu-fs-sm); font-weight: 800;
  transition: transform .15s, filter .2s;
}
.cag__porque:hover { color: var(--nu-amber-text); transform: translateY(-2px); filter: brightness(.97); }
.cag__porque:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* a pílula do dia: escondida ao abrir */
.cag__dia { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: clamp(36px, 5vw, 56px); }
.cag__pilula {
  display: inline-flex; align-items: baseline; gap: 10px;
  border: none; cursor: pointer; font-family: inherit;
  border-radius: var(--nu-r-input); padding: 12px 18px 12px 16px;
  transition: background .25s, color .25s, transform .15s;
}
.cag__pilula:active { transform: translateY(1px); }
.cag__pilula:focus-visible, .cag__olho:focus-visible, .cag__perguntar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cag__pilula--oculta { background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-card); }
.cag__pilula--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cag__pilula--down { background: var(--nu-red-pill-bg); color: var(--nu-red-2); }
.cag__pilula-valor { font-size: clamp(24px, 2.6vw, 30px); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.cag__pilula-pct { font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.cag__pilula-quando { font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
.cag__olho {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; cursor: pointer;
  background: transparent; color: var(--nu-ink); border: 2px solid var(--nu-ink-16);
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .2s, border-color .2s;
}
.cag__olho:hover { background: var(--nu-white); border-color: var(--nu-ink-30); }
.cag__total { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; font-variant-numeric: tabular-nums; transition: opacity .25s, transform .25s; }
.cag__total strong { color: var(--nu-ink); font-weight: 800; }
.cag__total--oculto { opacity: 0; transform: translateX(-6px); visibility: hidden; }

/* as contas do Open Finance: um chip por banco e o "+" no fim da fila */
.cag__contas { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
.cag__conta {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-card);
  border-radius: var(--nu-r-pill); padding: 7px 16px 7px 7px;
  font-size: var(--nu-fs-sm); font-weight: 700;
}
.cag__conta-logo {
  width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream); color: var(--nu-gray-2);
}
.cag__conta-logo img { width: 100%; height: 100%; object-fit: cover; }
.cag__conta--reconectar { transition: transform .15s; }
.cag__conta--reconectar:hover { color: var(--nu-ink); transform: translateY(-1px); }
.cag__conta-status { color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 800; }
.cag__conta-mais {
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer; font-family: inherit;
  background: transparent; color: var(--nu-ink); border: 2px dashed var(--nu-ink-16);
  border-radius: var(--nu-r-pill); padding: 9px 16px;
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, border-color .2s;
}
.cag__conta-mais:hover:not(:disabled) { background: var(--nu-white); border-color: var(--nu-ink-30); }
.cag__conta-mais:disabled { cursor: progress; opacity: .7; }
.cag__conta-mais:focus-visible, .cag__conta--reconectar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cag__contas-aviso { margin: 12px 0 0; color: var(--nu-green-text); font-size: var(--nu-fs-sm); font-weight: 500; }
.cag__contas-aviso--erro { color: var(--nu-red-2); }

.cag__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin-top: clamp(32px, 5vw, 56px); padding-top: 20px; border-top: 1px solid var(--nu-cream-line);
}
.cag__meta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cag__perguntar {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-navy); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); padding: 11px 20px 11px 16px;
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, transform .15s;
}
.cag__perguntar:hover { background: var(--nu-navy-2); color: var(--nu-cream-text); transform: translateY(-2px); }
.cag__losango-miolo { fill: var(--nu-navy); }

/* ——— o losango do dia: o logo pequeno num cartão, com os números ao lado, em cima da pílula ——— */
.cag__cartao {
  display: flex; align-items: center; gap: clamp(12px, 2vw, 18px); width: fit-content; max-width: 100%;
  margin-top: clamp(36px, 5vw, 56px); padding: 12px 22px 12px 12px;
  background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-card);
}
/* o recorte das abas do logo usa o fundo de quem está atrás: o branco do cartão */
.cag__cartao-logo { flex: none; width: clamp(76px, 9vw, 96px); --hlo-fundo: var(--nu-white); }
.cag__cartao-texto { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.cag__cartao-nums { margin: 0; display: flex; flex-wrap: wrap; gap: 2px 16px; }
.cag__cartao-num { font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cag__cartao-num--up { color: var(--nu-green-text); }
.cag__cartao-num--down { color: var(--nu-red-text); }
.cag__cartao-num--bolsa { color: var(--nu-navy); }
.cag__cartao-quem { font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: 0; }
.cag__cartao-rel { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.cag__cartao-prov { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.cag__cartao-prov--aceso { color: var(--nu-ink); font-weight: 700; }
.cag__cartao-cifrao { color: var(--nu-green-text); font-weight: 800; }
.cag__cartao--esmaecido .cag__cartao-nums, .cag__cartao--esmaecido .cag__cartao-rel { opacity: .6; }
.cag__cartao + .cag__dia { margin-top: 14px; }

@media (max-width: 760px) {
  .cag { min-height: clamp(480px, calc(100svh - 140px), 680px); }
  .cag__cartao { width: 100%; padding-right: 16px; }
  .cag__cartao-num { font-size: var(--nu-fs-xl); }
}
</style>
