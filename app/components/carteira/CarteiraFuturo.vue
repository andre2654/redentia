<script setup lang="ts">
// "Daqui a 5 anos" (31/10/2026): o momento assinatura da /carteira. O motor
// roda 2.000 caminhos da carteira da pessoa em 5 anos, em dinheiro de hoje
// (GET /me/carteira/futuro), e a banda navy responde numa frase: "Entre R$ X
// e R$ Y." Embaixo, o leque com otimista, meio e pessimista: os 2.000
// caminhos em canvas, com hover (CarteiraLequeCaminhos), ou, se a resposta
// não trouxer os caminhos, as faixas (CarteiraLeque).
//
// Um momento assinatura por tela (dono, 16/10): o resto da carteira fica no
// creme calmo. Carregando → esqueleto na forma do leque; sem posições → some;
// nada simulável → a frase do que ficou de fora; motor fora do ar → frase com
// "Tentar de novo"; carteira que o motor recusa → frase calma. Nunca cartão
// quebrado nem espaço vazio sem explicação.
// Na linha "A frase" (10/11/2026, o dono: "na carteira precisamos colocar a
// simulação da carteira nos 2.000 caminhos"): a seção entra na /carteira nova
// com a pergunta em cima ("E daqui a 5 anos?") e a resposta numa frase com um
// número só, o meio dos 2.000 caminhos ("Em 5 anos, o meio dos 2.000 caminhos
// dá R$ 960 mil."); a faixa de 8 em 10 vai na linha de apoio. A banda navy
// fica: é o momento assinatura da tela.
// Depois (mesmo dia, o dono: "temos que de algum jeito mostrar o impacto da
// Redentia de testar em 2.000 cenários"): o teste aparece como teste. A
// manchete diz o mais provável em linguagem de gente; o apoio abre com
// "Testamos a sua carteira em 2.000 futuros possíveis"; embaixo do leque, "O que o teste encontrou", contado nos
// caminhos do próprio motor (resultadoDoTeste): em quantos ela termina acima
// de hoje, em quantos passa por uma queda de 10% no caminho e em quantos dobra.
// Depois (mesmo dia, "pode seguir"): cada número acende os seus caminhos no
// leque (passar o mouse, focar ou tocar), o "dobram" deu lugar a "terminam
// abaixo de hoje" (o risco com o mesmo peso do lado bom, cada um com a cor que
// tem no leque), o contador dos futuros testados mora no próprio leque, o apoio
// encurtou e o "Como proteger" foi para o fim, depois dos números.
// Na Aportou (11/11/2026): o momento de destaque veste a FAIXA DA MARCA. A banda
// navy de ponta a ponta virou o cartão carvão com a aba cobalto (NuFaixaMarca),
// e a pergunta mora na aba. O leque segue o mesmo: o canvas lê os tokens
// (--nu-cream-text, --nu-green-soft, --nu-red-soft, --nu-navy = carvão). O
// número da frase vai no cobalto que lê sobre carvão; a chamada é a pílula com
// a seta ("Perguntar à IA…").
import { mascaraDoGrupo, resultadoDoTeste, type GrupoDoTeste } from '~/utils/futuro'

const { estado, dados, vm, caminhos, fora, carregar } = useCarteiraFuturo()

const PERGUNTA = 'O que mais pesa no cenário pessimista da minha carteira nos próximos 5 anos, e como eu protejo esse lado?'
const pergunta = '/busca?chat=1&q=' + encodeURIComponent(PERGUNTA)
// abre o painel do chat nesta página (02/11/2026); o href fica para outra aba
const painel = useChatPainel()
const nfInt = new Intl.NumberFormat('pt-BR')

// quem chega por /carteira#futuro (o botão da home): a seção nasce no cliente e
// as de cima ainda crescem enquanto carregam, então a rolagem espera o leque
const route = useRoute()
const raiz = ref<HTMLElement | null>(null)
// só no dev: ?leque=posicao mostra a cor de antes (a posição entre os 2.000), para comparar
const corDoLeque = computed(() => (import.meta.dev && route.query.leque === 'posicao' ? 'posicao' : 'hoje'))
watch(estado, async (e) => {
  if (e !== 'pronto' || route.hash !== '#futuro') return
  await nextTick()
  setTimeout(() => raiz.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
})
/** a resposta numa frase, com um número só (o mais provável); a faixa vai no apoio */
const fraseDoMeio = computed(() => {
  const v = vm.value
  if (!v) return null
  return { antes: `Em ${v.horizonte} anos, o mais provável é `, valor: v.fins.meio, depois: '.' }
})
/** o que o teste encontrou, contado nos caminhos do motor; null sem os caminhos (o leque de faixas) */
const teste = computed(() => (dados.value ? resultadoDoTeste(caminhos.value, dados.value.today_value) : null))
type CorDoFato = 'verde' | 'vermelho' | 'creme'
const fatosDoTeste = computed<{ k: GrupoDoTeste; n: string; de: string; texto: string; cor: CorDoFato }[]>(() => {
  const t = teste.value
  if (!t) return []
  const de = `de ${nfInt.format(t.n)}`
  return [
    { k: 'acima', n: nfInt.format(t.acimaDeHoje), de, texto: 'terminam acima do que você tem hoje', cor: 'verde' },
    { k: 'queda', n: nfInt.format(t.quedaDe10), de, texto: 'passam por uma queda de 10% ou mais no caminho', cor: 'creme' },
    { k: 'abaixo', n: nfInt.format(t.abaixoDeHoje), de, texto: 'terminam abaixo do que você tem hoje', cor: 'vermelho' },
  ]
})
/* cada número acende os seus caminhos no leque: o mouse e o foco acendem; o toque liga e desliga */
const grupoAceso = ref<GrupoDoTeste | null>(null)
const fixo = ref(false)
const mascaras = computed(() => {
  const t = teste.value
  return t ? { acima: mascaraDoGrupo(t, 'acima'), queda: mascaraDoGrupo(t, 'queda'), abaixo: mascaraDoGrupo(t, 'abaixo'), dobra: mascaraDoGrupo(t, 'dobra') } : null
})
const destaque = computed(() => {
  const g = grupoAceso.value
  const m = mascaras.value
  const f = fatosDoTeste.value.find((x) => x.k === g)
  return g && m && f ? { mascara: m[g], cor: f.cor } : null
})
function acender(g: GrupoDoTeste) { if (!fixo.value) grupoAceso.value = g }
function apagar() { if (!fixo.value) grupoAceso.value = null }
function alternarFixo(g: GrupoDoTeste) {
  if (fixo.value && grupoAceso.value === g) { fixo.value = false; grupoAceso.value = null; return }
  fixo.value = true
  grupoAceso.value = g
}
const apoio = computed(() => {
  const v = vm.value
  if (!v) return ''
  return `8 em cada 10 terminam entre ${v.fins.pessimista} e ${v.fins.otimista}, em dinheiro de hoje.`
})
</script>

<template>
  <section v-if="estado !== 'vazio' && estado !== 'bloqueado'" ref="raiz" class="cfu" aria-labelledby="cfu-titulo" data-clarity-mask="true">
    <NuFaixaMarca :rotulo="`E daqui a ${vm?.horizonte ?? 5} anos?`" como="p" :raio="32" class="cfu__cartao">
    <div class="cfu__miolo">
    <template v-if="estado === 'pronto' && vm && dados">
      <div class="cfu__head">
        <div class="cfu__texto">
          <h2 v-if="fraseDoMeio" id="cfu-titulo" class="cfu__frase">{{ fraseDoMeio.antes }}<b>{{ fraseDoMeio.valor }}</b>{{ fraseDoMeio.depois }}</h2>
          <p class="cfu__sub">{{ apoio }}</p>
        </div>
      </div>

      <div v-contexto-chat="{ id: 'carteira:futuro', tipo: 'grafico', rotulo: `Carteira em ${vm.horizonte} anos`, texto: [`Daqui a ${vm.horizonte} anos: ${vm.frase}`, `${vm.cenarios} Em dinheiro de hoje.`, vm.cobertura, vm.disclaimer].filter(Boolean).join('\n') }" class="cfu__grafico">
        <CarteiraLequeCaminhos
          v-if="caminhos"
          :cor="corDoLeque"
          :destaque="destaque"
          :dados="dados"
          :caminhos="caminhos"
          :fins="vm.fins"
          :eixo="{ hoje: `hoje · ${vm.hoje}`, fim: vm.anoFinal, anos: vm.anosDoMeio }"
          :altura="420"
        />
        <CarteiraLeque
          v-else
          :dados="dados"
          :fins="vm.fins"
          :eixo="{ hoje: `hoje · ${vm.hoje}`, fim: vm.anoFinal, anos: vm.anosDoMeio }"
          :altura="420"
        />
      </div>

      <!-- o que o teste encontrou: contado nos caminhos do motor, em reais de hoje -->
      <div v-if="fatosDoTeste.length" class="cfu__teste">
        <p class="cfu__teste-t">O que o teste encontrou <span class="cfu__teste-dica">· passe o mouse ou toque para ver no gráfico</span></p>
        <ul class="cfu__fatos" @pointerleave="apagar">
          <li v-for="f in fatosDoTeste" :key="f.k">
            <button
              type="button" class="cfu__fato" :class="[`cfu__fato--${f.cor}`, { 'cfu__fato--on': grupoAceso === f.k, 'cfu__fato--apagado': grupoAceso && grupoAceso !== f.k }]"
              :aria-pressed="grupoAceso === f.k" :aria-label="`${f.n} ${f.de} ${f.texto}. Mostrar esses caminhos no gráfico`"
              @pointerenter="(e) => e.pointerType !== 'touch' && acender(f.k)" @focus="acender(f.k)" @blur="apagar" @click="alternarFixo(f.k)"
            >
              <span class="cfu__fato-n"><b>{{ f.n }}</b> {{ f.de }}</span>
              <span class="cfu__fato-t">{{ f.texto }}</span>
            </button>
          </li>
        </ul>
      </div>
      <NuBotaoSeta :to="pergunta" variante="creme" tamanho="m" class="cfu__perguntar" @click.prevent="painel.abrir(PERGUNTA)">
        Perguntar à IA como proteger o lado ruim
      </NuBotaoSeta>


      <p class="cfu__nota">
        <span v-if="vm.cobertura" class="cfu__cobertura">{{ vm.cobertura }}</span>
        <span>{{ vm.disclaimer }}</span>
      </p>
    </template>

    <!-- esqueleto na forma do que chega: eyebrow, frase, leque, nota -->
    <div v-else-if="estado === 'carregando'" class="cfu__esq" aria-busy="true" aria-label="Rodando os cenários da sua carteira">
      <NuSkeleton tone="navy" width="128px" height="18px" radius="chip" />
      <NuSkeleton tone="navy" width="min(620px, 92%)" height="56px" radius="input" class="cfu__esq-frase" />
      <NuSkeleton tone="navy" width="min(340px, 70%)" height="18px" radius="chip" />
      <NuSkeleton tone="navy" width="100%" height="clamp(276px, 34vw, 454px)" radius="card" class="cfu__esq-leque" />
    </div>

    <div v-else class="cfu__erro" role="status">
      <template v-if="estado === 'fora'">
        <p class="cfu__erro-frase">O que você tem hoje fica fora do motor de cenários.</p>
        <p class="cfu__erro-sub">
          Cripto, COE, fundos sem registro e renda fixa sem indexador ainda não entram na simulação.
          <template v-if="fora">Fica de fora: {{ fora }}.</template>
        </p>
      </template>
      <template v-else-if="estado === 'invalida'">
        <p class="cfu__erro-frase">O motor de cenários não fechou a conta desta carteira.</p>
        <p class="cfu__erro-sub">O resto da sua carteira continua aqui embaixo, completo.</p>
      </template>
      <template v-else>
        <p class="cfu__erro-frase">O motor de cenários não respondeu agora.</p>
        <p class="cfu__erro-sub">Costuma voltar em alguns minutos. Nada mudou na sua carteira.</p>
        <button type="button" class="cfu__tentar" @click="carregar">Tentar de novo</button>
      </template>
    </div>
    </div>
    </NuFaixaMarca>
  </section>
</template>

<style scoped>
/* a seção é a página; o destaque é o cartão carvão com a faixa da marca */
.cfu {
  background: var(--nu-page);
  padding: clamp(8px, 2vw, 24px) var(--cvi-g, clamp(20px, 5.5vw, 80px)) clamp(56px, 7.5vw, 96px);
  animation: nu-fade .5s ease both;
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.cfu__miolo { padding: clamp(24px, 3.4vw, 44px) clamp(18px, 4vw, 56px) clamp(28px, 4vw, 52px); }
.cfu__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.cfu__texto { min-width: 0; max-width: 860px; }
.cfu__frase {
  margin: 0; color: var(--nu-white);
  font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
  font-variant-numeric: tabular-nums; text-wrap: balance;
}
.cfu__frase b { color: var(--nu-blue-on-dark); font-weight: inherit; white-space: nowrap; }
.cfu__sub { margin: 18px 0 0; color: var(--nu-on-dark); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; }
/* a chamada: a pílula creme com a seta (NuBotaoSeta); no celular o texto quebra em vez de vazar */
.cfu__perguntar { margin-top: clamp(22px, 3vw, 32px); max-width: 100%; white-space: normal; text-align: left; }
.cfu__grafico { margin-top: clamp(32px, 4vw, 52px); }
.cfu__teste { margin-top: clamp(28px, 3.4vw, 44px); }
.cfu__teste-t { margin: 0; color: var(--nu-white); font-size: var(--nu-fs-marca); font-weight: var(--nu-w-medio); letter-spacing: 0.16em; text-transform: uppercase; line-height: 1.5; }
.cfu__teste-dica { color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 500; letter-spacing: 0; text-transform: none; }
.cfu__fatos { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 0 clamp(20px, 3vw, 44px); margin: 10px 0 0; padding: 0; }
.cfu__fato {
  display: flex; flex-direction: column; gap: 6px; width: 100%; height: 100%; padding: 16px 0 6px; border: 0; border-top: 1px solid var(--nu-dark-chip-line);
  background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; transition: opacity .25s, border-color .25s;
}
.cfu__fato-n { color: var(--nu-on-dark-2); font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; }
.cfu__fato-n b { color: var(--nu-white); font-size: clamp(34px, 3.6vw, 48px); font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: 1; }
.cfu__fato--verde .cfu__fato-n b { color: var(--nu-green-soft); }
.cfu__fato--vermelho .cfu__fato-n b { color: var(--nu-red-soft); }
.cfu__fato-t { color: var(--nu-on-dark); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.cfu__fato--on { border-top-color: var(--nu-white); }
.cfu__fato--verde.cfu__fato--on { border-top-color: var(--nu-green-soft); }
.cfu__fato--vermelho.cfu__fato--on { border-top-color: var(--nu-red-soft); }
.cfu__fato--apagado { opacity: .45; }
.cfu__fato:focus-visible { outline-color: var(--nu-blue-on-dark); outline-offset: 4px; border-radius: 4px; }
.cfu__nota {
  margin: clamp(22px, 3vw, 32px) 0 0; max-width: 760px;
  display: flex; flex-direction: column; gap: 4px;
  color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 500; line-height: 1.55;
}
.cfu__cobertura { color: var(--nu-on-dark); }

.cfu__esq { display: flex; flex-direction: column; gap: 14px; }
.cfu__esq-frase { margin-top: 4px; }
.cfu__esq-leque { margin-top: clamp(20px, 3vw, 36px); }

.cfu__erro { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.cfu__erro-frase { margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.08; max-width: 640px; }
.cfu__erro-sub { margin: 0; max-width: 620px; color: var(--nu-on-dark); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.cfu__tentar {
  border: none; cursor: pointer; background: var(--nu-creme); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); min-height: 48px; padding: 0 24px; font: inherit; font-size: 15px; font-weight: var(--nu-w-medio);
  transition: background .2s, transform .15s;
}
.cfu__tentar:hover { background: var(--nu-white); }
.cfu__tentar:active { transform: scale(.98); }
.cfu__tentar:focus-visible { outline-color: var(--nu-blue-on-dark); }
</style>
