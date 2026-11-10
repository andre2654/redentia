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
watch(estado, async (e) => {
  if (e !== 'pronto' || route.hash !== '#futuro') return
  await nextTick()
  setTimeout(() => raiz.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
})
/** a resposta numa frase, com um número só (o meio); a faixa vai no apoio */
const fraseDoMeio = computed(() => {
  const v = vm.value
  if (!v) return null
  const n = dados.value?.paths
  return { antes: `Em ${v.horizonte} anos, o meio dos ${n ? `${nfInt.format(n)} ` : ''}caminhos dá `, valor: v.fins.meio, depois: '.' }
})
const apoio = computed(() => {
  const v = vm.value
  if (!v) return ''
  return `8 em cada 10 terminam entre ${v.fins.pessimista} e ${v.fins.otimista}, em dinheiro de hoje.`
})
</script>

<template>
  <section v-if="estado !== 'vazio' && estado !== 'bloqueado'" ref="raiz" class="cfu" aria-labelledby="cfu-titulo" data-clarity-mask="true">
    <template v-if="estado === 'pronto' && vm && dados">
      <div class="cfu__head">
        <div class="cfu__texto">
          <span class="cfu__eyebrow">E daqui a {{ vm.horizonte }} anos?</span>
          <h2 v-if="fraseDoMeio" id="cfu-titulo" class="cfu__frase">{{ fraseDoMeio.antes }}<b>{{ fraseDoMeio.valor }}</b>{{ fraseDoMeio.depois }}</h2>
          <p class="cfu__sub">{{ apoio }}</p>
        </div>
        <NuxtLink :to="pergunta" class="cfu__perguntar" @click.prevent="painel.abrir(PERGUNTA)">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cfu__losango-miolo" /></svg>
          Como proteger o lado pessimista
        </NuxtLink>
      </div>

      <div v-contexto-chat="{ id: 'carteira:futuro', tipo: 'grafico', rotulo: `Carteira em ${vm.horizonte} anos`, texto: [`Daqui a ${vm.horizonte} anos: ${vm.frase}`, `${vm.cenarios} Em dinheiro de hoje.`, vm.cobertura, vm.disclaimer].filter(Boolean).join('\n') }" class="cfu__grafico">
        <CarteiraLequeCaminhos
          v-if="caminhos"
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
      <span class="cfu__eyebrow">E daqui a 5 anos?</span>
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
  </section>
</template>

<style scoped>
.cfu {
  background: var(--nu-navy);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px) clamp(44px, 5.5vw, 72px);
  animation: nu-fade .5s ease both;
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.cfu__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.cfu__texto { min-width: 0; max-width: 820px; }
.cfu__eyebrow { color: var(--nu-cream-text-70); font-size: var(--nu-fs-eyebrow); font-weight: 600; }
.cfu__frase {
  margin: 12px 0 0; color: var(--nu-cream-text);
  font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.035em; line-height: 1.06;
  font-variant-numeric: tabular-nums; text-wrap: balance;
}
.cfu__frase b { color: var(--nu-blue-soft); font-weight: 700; white-space: nowrap; }
.cfu__sub { margin: 16px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.cfu__perguntar {
  display: inline-flex; align-items: center; gap: 9px; flex-shrink: 0;
  color: var(--nu-cream-text); background: var(--nu-navy-2);
  border-radius: var(--nu-r-pill); padding: 12px 20px;
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, transform .15s;
}
.cfu__perguntar:hover { background: var(--nu-navy-3); color: var(--nu-cream-text); transform: translateY(-2px); }
.cfu__perguntar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.cfu__losango-miolo { fill: var(--nu-navy-2); }
.cfu__grafico { margin-top: clamp(32px, 4vw, 52px); }
.cfu__nota {
  margin: clamp(22px, 3vw, 32px) 0 0; max-width: 760px;
  display: flex; flex-direction: column; gap: 4px;
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
}
.cfu__cobertura { color: var(--nu-cream-text-78); }

.cfu__esq { display: flex; flex-direction: column; gap: 14px; }
.cfu__esq-frase { margin-top: 4px; }
.cfu__esq-leque { margin-top: clamp(20px, 3vw, 36px); }

.cfu__erro { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.cfu__erro-frase { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.02em; line-height: 1.15; max-width: 640px; }
.cfu__erro-sub { margin: 0; max-width: 620px; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.cfu__tentar {
  border: none; cursor: pointer; background: var(--nu-cream); color: var(--nu-navy);
  border-radius: var(--nu-r-pill); padding: 13px 24px; font-size: var(--nu-fs-sm); font-weight: 700;
  transition: background .2s;
}
.cfu__tentar:hover { background: var(--nu-white); }
.cfu__tentar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
</style>
