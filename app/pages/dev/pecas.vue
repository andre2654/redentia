<script setup lang="ts">
// SÓ NO DEV (11/11/2026, robustez): as peças da base que toda tela usa, em
// cada tom e tamanho, sobre o creme, o branco e o carvão, com os estados que
// dá para ver parado (escolhida, desabilitada, ocupado, aberto). O hover não
// fica numa foto; o foco, sim: o foto-tempo.mjs foca com --foco="seletor".
// Fora do `nuxi dev` a rota nem existe: o nuxt.config tira pages/dev/ da
// lista (pages:extend). O middleware de 404 fica como segunda trava.
import type { OpcaoDoTrilho } from '~/components/nu/NuTrilho.vue'

definePageMeta({
  layout: false,
  middleware: [() => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
  }],
})
useSeoMeta({ title: 'Peças da base (dev)', robots: 'noindex, nofollow' })

/* ————— NuTrilho ————— */
type Periodo = '1mo' | '6mo' | '12mo' | '5y'
const PERIODOS: OpcaoDoTrilho<Periodo>[] = [
  { valor: '1mo', rotulo: '1M', extenso: '1 mês' },
  { valor: '6mo', rotulo: '6M', extenso: '6 meses' },
  { valor: '12mo', rotulo: '12M', extenso: '12 meses' },
  { valor: '5y', rotulo: '5A', extenso: '5 anos' },
]
const TIPOS: OpcaoDoTrilho<string>[] = [
  { valor: 'todos', rotulo: 'Todos', contagem: 48 },
  { valor: 'acoes', rotulo: 'Ações', contagem: 31 },
  { valor: 'fiis', rotulo: 'FIIs', contagem: 12 },
  { valor: 'bdrs', rotulo: 'BDRs', contagem: 5 },
  { valor: 'rf', rotulo: 'Renda fixa', contagem: 0, desabilitada: true },
]
const LENTES: OpcaoDoTrilho<string>[] = [
  { valor: 'ativos', rotulo: 'Ativos', controla: 'pecas-lente' },
  { valor: 'mundo', rotulo: 'No mundo', controla: 'pecas-lente' },
  { valor: 'cadeia', rotulo: 'Na cadeia', controla: 'pecas-lente' },
  { valor: 'riscos', rotulo: 'Riscos', controla: 'pecas-lente' },
]
const MUITOS: OpcaoDoTrilho<string>[] = ['Tudo', 'Sua carteira', 'Ações', 'Macro', 'FIIs', 'Tesouro', 'Cripto', 'Exterior'].map((r) => ({ valor: r, rotulo: r }))
const periodo = ref<Periodo>('12mo')
const periodoP = ref<Periodo>('6mo')
const periodoEsc = ref<Periodo>('12mo')
const periodoEscP = ref<Periodo>('1mo')
const tipo = ref('todos')
const tipoBranco = ref('acoes')
const lente = ref('ativos')
const lenteLarga = ref('mundo')
const muitos = ref('Macro')
const ocupado = ref(false)
function trocarOcupado() {
  ocupado.value = true
  setTimeout(() => { ocupado.value = false }, 1600)
}

/* ————— NuAcordeao ————— */
const aberto1 = ref(true)
const aberto2 = ref(false)
const FAQ = [
  { q: 'A Aportou diz o que comprar?', a: 'Não. A Aportou explica em português claro o que os números dizem; a decisão é sua.' },
  { q: 'De onde vêm os dados?', a: 'Da B3, da CVM e das empresas, com a data de cada número ao lado dele.' },
]

const TONS = ['neutro', 'azul', 'verde', 'vermelho', 'ambar', 'carvao', 'contorno'] as const
const CARTOES = ['Petrobras', 'Itaú', 'Vale', 'WEG', 'Ambev', 'Copel', 'Itaúsa', 'Taesa', 'BB']
</script>

<template>
  <main class="pec">
    <header class="pec__topo">
      <NuEyebrow como="p">Dev · robustez</NuEyebrow>
      <h1 class="pec__h1">Peças da base.</h1>
      <p class="pec__dek">NuTrilho, NuSelo, NuLinkSeta, NuMais, NuAcordeao, v-revelar e as classes globais, em cada tom e tamanho, sobre o creme, o branco e o carvão.</p>
    </header>

    <!-- ————— NuTrilho ————— -->
    <section id="trilho" class="pec__sec">
      <h2 class="pec__h2">NuTrilho</h2>
      <p class="pec__nota">Clique ou use as setas: a pílula desliza (520ms, <code>--nu-ease-troca</code>) e a letra troca de cor onde ela passa.</p>
      <div class="pec__grade">
        <div class="pec__sup pec__sup--creme">
          <p class="pec__rot">creme · claro m (com contagem e desabilitada)</p>
          <NuTrilho id="pec-tipo" v-model="tipo" :opcoes="TIPOS" rotulo="Tipo de ativo" />
          <p class="pec__rot">claro p</p>
          <NuTrilho id="pec-periodo-p" v-model="periodoP" :opcoes="PERIODOS" tamanho="p" rotulo="Período (p)" />
          <p class="pec__rot">claro m · abas (papel tablist, idBase)</p>
          <NuTrilho id="pec-lente" v-model="lente" :opcoes="LENTES" papel="tablist" id-base="pecas-aba" rotulo="Lentes" />
          <p id="pecas-lente" class="pec__legenda" role="tabpanel" :aria-labelledby="`pecas-aba-${lente}`">Painel da lente: {{ lente }}</p>
        </div>
        <div class="pec__sup pec__sup--branco">
          <p class="pec__rot">branco · claro m</p>
          <NuTrilho id="pec-periodo" v-model="periodo" :opcoes="PERIODOS" rotulo="Período (m)" />
          <p class="pec__rot">claro m · ocupado (o dado chegando)</p>
          <div class="pec__linha">
            <NuTrilho v-model="tipoBranco" :opcoes="TIPOS.slice(0, 4)" :ocupado="ocupado" rotulo="Tipo, ocupado" />
            <NuLinkSeta tom="tinta" @click="trocarOcupado">{{ ocupado ? 'Ocupado…' : 'Simular 1,6s ocupado' }}</NuLinkSeta>
          </div>
          <p class="pec__rot">largo (divide igual)</p>
          <NuTrilho v-model="lenteLarga" :opcoes="LENTES" largo rotulo="Lentes, largo" />
        </div>
        <div class="pec__sup pec__sup--carvao">
          <p class="pec__rot">carvão · escuro m</p>
          <NuTrilho id="pec-esc" v-model="periodoEsc" :opcoes="PERIODOS" tom="escuro" rotulo="Período (escuro m)" />
          <p class="pec__rot">escuro p</p>
          <NuTrilho id="pec-esc-p" v-model="periodoEscP" :opcoes="PERIODOS" tom="escuro" tamanho="p" rotulo="Período (escuro p)" />
          <p class="pec__rot">escuro m · largo no celular</p>
          <NuTrilho v-model="periodoEsc" :opcoes="PERIODOS" tom="escuro" largo="celular" rotulo="Período (largo no celular)" />
        </div>
      </div>
      <div class="pec__sup pec__sup--creme pec__estreito">
        <p class="pec__rot">não cabe: rola de lado por dentro, as pontas esmaecem, a escolhida vem para a vista</p>
        <NuTrilho id="pec-muitos" v-model="muitos" :opcoes="MUITOS" rotulo="Categorias" />
      </div>
    </section>

    <!-- ————— NuSelo ————— -->
    <section id="selo" class="pec__sec">
      <h2 class="pec__h2">NuSelo</h2>
      <div class="pec__grade">
        <div class="pec__sup pec__sup--creme">
          <p class="pec__rot">m (28px) · sobre creme</p>
          <div class="pec__selos"><NuSelo v-for="t in TONS" :key="t" :tom="t">{{ t }}</NuSelo></div>
          <p class="pec__rot">p (22px)</p>
          <div class="pec__selos"><NuSelo v-for="t in TONS" :key="t" :tom="t" tamanho="p">{{ t }}</NuSelo></div>
          <p class="pec__rot">com ponto</p>
          <div class="pec__selos">
            <NuSelo tom="verde" ponto>Bolsa aberta</NuSelo>
            <NuSelo tom="ambar" ponto>Pede atenção</NuSelo>
            <NuSelo tom="neutro" ponto>Bolsa fechada</NuSelo>
            <NuSelo tom="vermelho" ponto tamanho="p">Em risco</NuSelo>
          </div>
        </div>
        <div class="pec__sup pec__sup--branco">
          <p class="pec__rot">sobre branco</p>
          <div class="pec__selos"><NuSelo v-for="t in TONS" :key="t" :tom="t">{{ t === 'carvao' ? 'PETR4' : t === 'verde' ? '+1,39%' : t === 'vermelho' ? '−0,42%' : t }}</NuSelo></div>
          <p class="pec__rot">corrido (no meio da frase)</p>
          <p class="pec__texto">Caiu 6,37% em 5 de novembro e a tese segue de pé (<NuSelo tom="verde" tamanho="p" corrido>SELL-SIDE A FAVOR</NuSelo>, recomposição de margem <NuSelo tom="ambar" tamanho="p" corrido>PENDENTE</NuSelo>), com o guidance revisto para cima no 3T26 e a data do próximo resultado já marcada.</p>
        </div>
        <div class="pec__sup pec__sup--carvao">
          <p class="pec__rot">sobre carvão (sobre="escuro")</p>
          <div class="pec__selos"><NuSelo v-for="t in TONS" :key="t" :tom="t" sobre="escuro">{{ t }}</NuSelo></div>
          <div class="pec__selos"><NuSelo v-for="t in TONS" :key="t" :tom="t" sobre="escuro" tamanho="p" ponto>{{ t }}</NuSelo></div>
        </div>
      </div>
    </section>

    <!-- ————— NuLinkSeta ————— -->
    <section id="link" class="pec__sec">
      <h2 class="pec__h2">NuLinkSeta</h2>
      <div class="pec__grade">
        <div class="pec__sup pec__sup--creme">
          <p class="pec__rot">azul (padrão) · tinta · button · desabilitado</p>
          <p class="pec__links">
            <NuLinkSeta id="pec-link" to="/teses">Ver todas as teses</NuLinkSeta>
            <NuLinkSeta to="/rankings" tom="tinta">Abrir os rankings</NuLinkSeta>
            <NuLinkSeta>Ler tudo</NuLinkSeta>
            <NuLinkSeta disabled>Indisponível</NuLinkSeta>
          </p>
          <p class="pec__texto">No meio do texto o alvo cresce para 44px sem empurrar a linha: <NuLinkSeta to="/glossario">o glossário</NuLinkSeta> explica cada termo, e a linha de baixo fica onde estava.</p>
        </div>
        <div class="pec__sup pec__sup--branco">
          <p class="pec__rot">externo (outra aba, seta diagonal)</p>
          <p class="pec__links">
            <NuLinkSeta href="https://www.b3.com.br" externo>Site da B3</NuLinkSeta>
            <NuLinkSeta href="https://www.gov.br/cvm" externo tom="tinta">Fonte: CVM</NuLinkSeta>
          </p>
        </div>
        <div class="pec__sup pec__sup--carvao">
          <p class="pec__rot">claro (sobre carvão)</p>
          <p class="pec__links">
            <NuLinkSeta id="pec-link-claro" to="/carteira" tom="claro">Abrir a carteira</NuLinkSeta>
            <NuLinkSeta href="https://www.b3.com.br" externo tom="claro">Site da B3</NuLinkSeta>
          </p>
        </div>
      </div>
    </section>

    <!-- ————— NuMais + NuAcordeao ————— -->
    <section id="acordeao" class="pec__sec">
      <h2 class="pec__h2">NuMais e NuAcordeao</h2>
      <div class="pec__grade">
        <div class="pec__sup pec__sup--creme">
          <p class="pec__rot">NuMais 28 · 32 · 36, fechado e aberto</p>
          <div class="pec__mais">
            <NuMais :tamanho="28" /><NuMais :tamanho="32" /><NuMais :tamanho="36" />
            <NuMais :tamanho="28" aberto /><NuMais :tamanho="32" aberto /><NuMais :tamanho="36" aberto />
          </div>
          <p class="pec__rot">no &lt;details&gt; (gira sozinho)</p>
          <details class="pec__det" open><summary>Fontes do relatório <NuMais :tamanho="28" /></summary><p class="pec__legenda">B3, CVM, relatórios trimestrais.</p></details>
        </div>
        <div class="pec__sup pec__sup--branco">
          <p class="pec__rot">NuAcordeao (v-model:aberto, fio)</p>
          <NuAcordeao id="pec-acordeao" v-model:aberto="aberto1" fio>
            <template #titulo>Como a Aportou lê a carteira?</template>
            <p class="pec__p">Ela junta as contas conectadas, separa por classe e mostra o que mudou desde ontem, com a data de cada número.</p>
          </NuAcordeao>
          <NuAcordeao v-model:aberto="aberto2" fio :tamanho-mais="28">
            <template #titulo>E se uma conta parar de atualizar?</template>
            <p class="pec__p">O aviso aparece no topo da carteira, com o botão para reconectar.</p>
          </NuAcordeao>
          <NuAcordeao fio como="h3">
            <template #titulo>Sem v-model, como h3</template>
            <p class="pec__p">Guarda o próprio estado.</p>
          </NuAcordeao>
        </div>
        <div class="pec__sup pec__sup--carvao">
          <p class="pec__rot">NuMais tom="claro" sobre carvão</p>
          <div class="pec__mais"><NuMais tom="claro" :tamanho="28" /><NuMais tom="claro" /><NuMais tom="claro" :tamanho="36" aberto /></div>
        </div>
      </div>
      <div class="pec__sup pec__sup--creme">
        <p class="pec__rot">NuFaqAccordion (agora com o NuAcordeao por dentro)</p>
        <NuFaqAccordion :items="FAQ" :schema="false" />
      </div>
    </section>

    <!-- ————— classes globais ————— -->
    <section id="classes" class="pec__sec">
      <h2 class="pec__h2">.nu-cartao, .nu-num, .nu-legenda</h2>
      <div class="pec__cartoes">
        <div class="nu-cartao pec__cartao"><p class="pec__rot">.nu-cartao</p><p class="nu-num pec__num">R$ 340.826</p><p class="nu-legenda">fechamento de 06/11 · B3</p></div>
        <div class="nu-cartao nu-cartao--branco pec__cartao"><p class="pec__rot">.nu-cartao--branco</p><p class="nu-num pec__num">117%</p><p class="nu-legenda">do CDI em 12 meses</p></div>
        <NuxtLink to="/teses" class="nu-cartao nu-cartao--vivo pec__cartao" id="pec-vivo"><p class="pec__rot">.nu-cartao--vivo (link)</p><p class="nu-num pec__num">8 ativos</p><p class="nu-legenda">sobe 2px no hover, afunda ao apertar</p></NuxtLink>
      </div>
      <p class="pec__nota">.nu-sr: <span class="nu-sr">texto só para o leitor de tela</span>(há um texto escondido aqui, só para o leitor de tela).</p>
    </section>

    <!-- ————— v-revelar ————— -->
    <section id="revelar" class="pec__sec pec__sec--revelar">
      <h2 v-revelar class="pec__h2">v-revelar</h2>
      <p v-revelar class="pec__nota">Abaixo da dobra: entra ao chegar perto (720ms, de 14px abaixo e desfocado até o lugar). O que já está na tela ao abrir a página fica parado.</p>
      <ul v-revelar="{ alvo: 'filhos', passo: 60 }" class="pec__cartoes pec__lista">
        <li v-for="c in CARTOES" :key="c" class="nu-cartao pec__cartao"><p class="nu-num pec__num">{{ c }}</p><p class="nu-legenda">filho em cascata (60ms; para no 8º)</p></li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.pec { min-height: 100vh; padding: 0 var(--nu-coluna) 160px; background: var(--nu-page); color: var(--nu-ink); }
.pec__topo { padding: 56px 0 24px; }
.pec__h1 { margin: 16px 0 0; font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; }
.pec__dek { margin: 16px 0 0; max-width: 62ch; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); line-height: 1.45; }
.pec__sec { padding: 40px 0; border-top: 1px solid var(--nu-line); }
.pec__sec--revelar { margin-top: 70vh; }
.pec__h2 { margin: 0 0 8px; font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.pec__nota { margin: 0 0 20px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.pec__nota code { font-size: .95em; }
.pec__grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 16px; }
.pec__sup { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; min-width: 0; padding: 24px; border-radius: var(--nu-r-card); }
.pec__sup--creme { background: var(--nu-page); box-shadow: inset 0 0 0 1px var(--nu-line-2); }
.pec__sup--branco { background: var(--nu-white); box-shadow: var(--nu-shadow-branco); }
.pec__sup--carvao { background: var(--nu-ink); color: var(--nu-white); box-shadow: var(--nu-shadow-escuro); }
.pec__sup--branco :deep(.nac) { align-self: stretch; }
.pec__estreito { max-width: 420px; margin-top: 16px; }
.pec__sup--creme + .pec__sup--creme, .pec__grade + .pec__sup { margin-top: 16px; }
.pec__sup--creme :deep(.nfa) { align-self: stretch; }
.pec__rot { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
.pec__sup--carvao .pec__rot { color: var(--nu-on-dark-2); }
.pec__rot:first-child { margin-top: 0; }
.pec__linha { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 20px; width: 100%; }
.pec__legenda { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); }
.pec__selos { display: flex; flex-wrap: wrap; gap: 8px; }
.pec__texto { margin: 0; max-width: 56ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.6; }
.pec__links { display: flex; flex-wrap: wrap; gap: 8px 28px; margin: 0; font-size: 15px; }
.pec__mais { display: flex; align-items: center; gap: 12px; }
.pec__det summary { display: flex; align-items: center; gap: 12px; cursor: pointer; list-style: none; font-weight: var(--nu-w-medio); }
.pec__det summary::-webkit-details-marker { display: none; }
.pec__p { margin: 0; }
.pec__cartoes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; margin: 0; padding: 0; list-style: none; }
.pec__cartao { display: block; padding: 24px; color: inherit; }
#classes .pec__nota { margin-top: 20px; }
.pec__num { margin: 8px 0 4px; font-size: 32px; font-weight: var(--nu-w-display); line-height: 1.1; }
</style>
