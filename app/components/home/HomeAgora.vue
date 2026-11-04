<script setup lang="ts">
// O topo da home para quem está logado (31/10/2026): a tela Início do Agora
// dos apps, no site. Uma pergunta só, "está tudo normal?".
// Segunda versão no mesmo dia: o dono achou a primeira feia ("o Ibovespa ali
// em cima, um botão de Detalhes que não faz sentido, já poderia mostrar as
// informações"). A nova saiu de uma conversa entre uma investidora do público,
// uma especialista de produto da Apple e uma de UX, e o dono escolheu:
//  - à esquerda, o texto: a sobrelinha com a data, o título que só diz "Tudo
//    normal." quando é verdade, o veredito ("Caiu menos que a bolsa.") e uma
//    causa que nunca elogia (utils/diaDaCarteira.ts);
//  - à direita, os anéis do relógio (HomeAneis): você contra a bolsa e o
//    provento do dia;
//  - embaixo, uma faixa com três números (patrimônio, o dia, proventos em 12
//    meses), em R$ escondido até o olho, que vale só para a visita
//    (useValoresVisiveis), e o "Abrir minha carteira".
// Saíram a pílula do Ibovespa, o "Detalhes", o score e o contador de atenção
// (são da /carteira, não do dia).
// Estados (dado que falta some, nunca vira zero):
//  - 'patrimonio' com assinatura: o dia, como acima;
//  - 'connect' (sem Open Finance, o caso de 96% das contas): "Conecte a sua
//    carteira." + a mesma chamada do visitante, que leva ao /assinar;
//  - carteira sem assinatura: o passo que falta é assinar;
//  - resumo indisponível (API fora): "Olá, Nome." + o caminho da carteira.
import type { Component } from 'vue'
import type { CarteiraResumoVM } from '~/types/carteira'
import { frasesDoDia } from '~/utils/diaDaCarteira'
import { estadoDoPregao } from '~/utils/pregao'
import HomeAneis from './HomeAneis.vue'

const props = defineProps<{ resumo: CarteiraResumoVM | null }>()

// ESBOÇO (03/11/2026, o dono: "esse está muito perto do ícone de gym da
// Apple"): quatro alternativas para os anéis, trocadas só no dev por ?aneis=1
// (a régua do zero), ?aneis=2 (as colunas de luz), ?aneis=3 (o losango da
// marca) e ?aneis=4 (o placar). Mesmas props do HomeAneis. Em produção
// import.meta.dev é false, o mapa fica vazio (nem entra no bundle) e seguem os
// anéis de hoje. Lado a lado, com os casos extremos: /dev/aneis (só no dev).
const route = useRoute()
const ESBOCOS_ANEIS: Record<string, Component> = import.meta.dev
  ? {
      '1': defineAsyncComponent(() => import('./aneis/HomeAneisRegua.vue')),
      '2': defineAsyncComponent(() => import('./aneis/HomeAneisColunas.vue')),
      '3': defineAsyncComponent(() => import('./aneis/HomeAneisLosango.vue')),
      '4': defineAsyncComponent(() => import('./aneis/HomeAneisPlacar.vue')),
    }
  : {}
const esbocoAneis = computed(() => ESBOCOS_ANEIS[String(route.query.aneis ?? '')] ?? HomeAneis)

const { firstName } = useAuthState()

// O snapshot da assinatura não entra no SSR da home (a borda cacheia a página):
// sai do cliente, e até ele chegar o topo é esqueleto. Os onMounted vêm antes
// do await, senão não registram.
const assinatura = useAssinatura()
const { visiveis, alternar } = useValoresVisiveis()
// o relógio da bolsa também é do cliente: a página sai da borda com a hora de quem a cacheou
const agora = ref<Date | null>(null)
onMounted(() => {
  void assinatura.carregar()
  agora.value = new Date()
})
const podeVerNumeros = computed(() => assinatura.carregado.value && assinatura.assinante.value)
const naoAssina = computed(() => assinatura.carregado.value && !assinatura.assinante.value)

// o Ibovespa da home sai de uma fonte só (a mesma da seção da bolsa)
const { bolsa } = await useBolsaDoDia()
const momento = useState('home:momento-bolsa', () => momentoDaBolsa())
onMounted(() => { momento.value = momentoDaBolsa() })

const comCarteira = computed(() => props.resumo?.state === 'patrimonio' && !naoAssina.value)
// sem assinatura, o passo que falta é assinar; com o gate do servidor ligado o
// resumo volta null (402), e a frase não promete carteira que não se viu
const carteiraSemAssinatura = computed(() => naoAssina.value && props.resumo?.state !== 'connect')
const tituloSemAssinatura = computed(() =>
  props.resumo?.state === 'patrimonio' ? 'A sua carteira está pronta.' : 'Teste a sua carteira.')
const subSemAssinatura = computed(() => props.resumo?.state === 'patrimonio'
  ? 'Ela já chegou do seu banco. Assine para a Redentia testar a carteira em 2.000 cenários e vigiar todo dia por você.'
  : 'Assine para a Redentia juntar os seus bancos, testar a carteira em 2.000 cenários e vigiar todo dia por você.')
const semCarteira = computed(() => props.resumo?.state === 'connect')

// o dia: a bolsa vem casada pelo dia de preço; com a bolsa aberta e a série
// ainda sem o ponto de hoje, o snapshot do Ibovespa entra de reserva, se for
// do mesmo dia de preço da carteira
const estado = computed(() => (agora.value ? estadoDoPregao(agora.value).estado : null))
const dia = computed(() => {
  const d = props.resumo?.dia ?? null
  const ib = bolsa.value?.ibov
  if (!d || d.bolsaPct != null || estado.value !== 'aberta' || !ib || ib.data !== d.priceDate) return d
  return { ...d, bolsaPct: ib.pct }
})
const frases = computed(() => (dia.value && estado.value && agora.value ? frasesDoDia(dia.value, estado.value, agora.value) : null))

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ESCONDIDO = 'R$ ••••••'
// os três números da faixa: cada um leva à seção da /carteira que o explica
const fatos = computed(() => {
  const r = props.resumo
  if (!r || r.state !== 'patrimonio') return []
  const lista: { k: string; rotulo: string; valor: string; to: string; tom?: 'up' | 'down'; olho?: boolean }[] = []
  if (r.patrimonio) lista.push({ k: 'patrimonio', rotulo: 'Patrimônio', valor: visiveis.value ? r.patrimonio : ESCONDIDO, to: '/carteira#posicoes', olho: true })
  const v = dia.value?.diaValor
  if (v != null && frases.value) {
    lista.push({
      k: 'dia', rotulo: frases.value.diaRotulo, to: '/carteira',
      valor: visiveis.value ? `${v > 0 ? '+' : v < 0 ? '−' : ''}R$ ${nf2.format(Math.abs(v))}` : ESCONDIDO,
      tom: visiveis.value && Math.abs(v) >= 0.005 ? (v < 0 ? 'down' : 'up') : undefined,
    })
  }
  if (r.proventos12m) lista.push({ k: 'proventos', rotulo: 'Proventos em 12 meses', valor: visiveis.value ? r.proventos12m : ESCONDIDO, to: '/carteira#renda-passiva' })
  return lista
})
// os anéis como contexto do chat: as duas variações do dia, como o anel mostra
const contextoAneis = computed(() => {
  const d = dia.value
  if (!podeVerNumeros.value || !d || d.carteiraPct == null) return null
  const f = (n: number) => `${n > 0 ? '+' : ''}${nf2.format(n)}%`
  return {
    id: 'home:aneis', tipo: 'carteira', rotulo: 'Você e a bolsa hoje',
    texto: [`Sua carteira: ${f(d.carteiraPct)}`, d.bolsaPct != null ? `Ibovespa: ${f(d.bolsaPct)}` : '', d.provento ? 'Caiu provento' : ''].filter(Boolean).join('\n'),
  }
})
const proventoSub = computed(() => (frases.value ? `${dia.value?.provento ? 'caiu' : 'nenhum'} ${frases.value.quando}` : null))
</script>

<template>
  <section class="hag" aria-labelledby="hag-titulo">
    <div class="hag__tela">
      <!-- com carteira: o dia, o anel e os três números -->
      <template v-if="comCarteira">
        <div class="hag__painel">
          <div v-contexto-chat="podeVerNumeros && frases ? { id: 'home:dia', tipo: 'carteira', rotulo: 'Seu dia', texto: [frases.sobrelinha, frases.titulo, frases.veredito, frases.apoio].filter(Boolean).join('\n') } : null" class="hag__texto" aria-live="polite">
            <template v-if="podeVerNumeros && frases">
              <p class="hag__sobre" :class="`hag__sobre--${frases.sobrelinhaTom}`">{{ frases.sobrelinha }}</p>
              <h1 id="hag-titulo" class="hag__frase">{{ frases.titulo }}</h1>
              <p class="hag__veredito">{{ frases.veredito }}</p>
              <p v-if="frases.apoio" class="hag__apoio">{{ frases.apoio }}</p>
            </template>
            <template v-else-if="podeVerNumeros">
              <p class="hag__sobre">{{ momento.rotulo }}</p>
              <h1 id="hag-titulo" class="hag__frase">Olá{{ firstName ? `, ${firstName}` : '' }}.</h1>
              <p class="hag__veredito">O resultado de hoje ainda não chegou.</p>
            </template>
            <template v-else>
              <h1 id="hag-titulo" class="hag__sr">A sua carteira hoje</h1>
              <NuSkeleton tone="navy" variant="line" width="min(300px, 70%)" height="18px" radius="chip" />
              <NuSkeleton tone="navy" variant="block" width="min(420px, 90%)" height="72px" radius="tile" class="hag__esq-titulo" />
              <NuSkeleton tone="navy" variant="line" width="min(380px, 80%)" height="28px" radius="chip" class="hag__esq-veredito" />
              <NuSkeleton tone="navy" variant="text" :lines="2" last-width="60%" class="hag__esq-apoio" />
            </template>
          </div>
          <div v-if="!podeVerNumeros || dia?.carteiraPct != null" v-contexto-chat="contextoAneis" class="hag__anel">
            <component
              :is="esbocoAneis"
              :voce="dia?.carteiraPct ?? null" :bolsa="dia?.bolsaPct ?? null"
              :provento="!!dia?.provento" :provento-sub="proventoSub"
              :esmaecido="!!frases?.esmaecido" :carregando="!podeVerNumeros || !frases"
            />
          </div>
        </div>

        <div class="hag__faixa">
          <ul v-if="podeVerNumeros" class="hag__fatos">
            <li v-for="f in fatos" :key="f.k" class="hag__fato">
              <NuxtLink v-contexto-chat="{ id: `home:fato:${f.k}`, tipo: 'carteira', rotulo: f.rotulo, texto: `${f.rotulo}: ${f.valor}` }" :to="f.to" class="hag__fato-link">
                <span class="hag__fato-rotulo">{{ f.rotulo }}</span>
                <span class="hag__fato-valor" :class="[f.tom && `hag__fato-valor--${f.tom}`, { 'hag__fato-valor--escondido': !visiveis }]">{{ f.valor }}</span>
              </NuxtLink>
              <button
                v-if="f.olho" type="button" class="hag__olho" :aria-pressed="visiveis"
                :aria-label="visiveis ? 'Esconder valores' : 'Mostrar valores'" :title="visiveis ? 'Esconder valores' : 'Mostrar valores'"
                @click="alternar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1.6 12 C3.9 7.3 7.7 4.9 12 4.9 C16.3 4.9 20.1 7.3 22.4 12 C20.1 16.7 16.3 19.1 12 19.1 C7.7 19.1 3.9 16.7 1.6 12 Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
                  <circle cx="12" cy="12" r="3.9" fill="currentColor" />
                  <template v-if="!visiveis">
                    <path d="M3.6 3.6 L20.4 20.4" class="hag__olho-corte" stroke-width="4.6" stroke-linecap="round" />
                    <path d="M3.6 3.6 L20.4 20.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
                  </template>
                </svg>
              </button>
            </li>
          </ul>
          <ul v-else class="hag__fatos" aria-hidden="true">
            <li v-for="i in 3" :key="i" class="hag__fato hag__fato--esqueleto">
              <NuSkeleton tone="navy" variant="line" width="88px" height="12px" radius="chip" />
              <NuSkeleton tone="navy" variant="line" width="150px" height="24px" radius="chip" />
            </li>
          </ul>
          <div class="hag__acoes">
            <NuxtLink v-if="podeVerNumeros && dia?.alerta" to="/carteira#posicoes" class="hag__alerta">
              Ver {{ dia.alerta.ticker }} na carteira
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
            <NuxtLink to="/carteira" class="hag__carteira">
              Abrir minha carteira
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
          </div>
        </div>
      </template>
      <!-- carteira conectada, sem assinatura: o passo que falta é assinar -->
      <template v-else-if="carteiraSemAssinatura">
        <div class="hag__meio">
          <p class="hag__estado hag__estado--azul">Falta um passo</p>
          <h1 id="hag-titulo" class="hag__frase">{{ tituloSemAssinatura }}</h1>
          <p class="hag__sub">{{ subSemAssinatura }}</p>
        </div>
        <HomeChamada
          tom="escuro" :centro="false" class="hag__chamada"
          :rotulo="resumo?.state === 'patrimonio' ? 'Ver a minha carteira' : 'Conectar carteira'"
        />
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
  background: var(--nu-agora-bg);
}
.hag__tela {
  flex: 1; width: 100%;
  display: flex; flex-direction: column; justify-content: center; gap: clamp(32px, 4.4vw, 56px);
  padding: clamp(28px, 4vw, 56px) clamp(22px, 5.5vw, 80px) clamp(32px, 4.4vw, 56px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
  animation: nu-fade .5s ease both;
}
.hag__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* o painel: o texto à esquerda e o anel à direita */
.hag__painel {
  margin-top: auto;
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 24px clamp(24px, 3vw, 48px);
}
.hag__texto { min-width: 0; }
.hag__anel { justify-self: end; width: min(100%, 620px); }

.hag__sobre { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-eyebrow); font-weight: 700; font-variant-numeric: tabular-nums; }
.hag__sobre--verde { color: var(--nu-agora-verde); }
.hag__sobre--ambar { color: var(--nu-agora-ambar); }
.hag__sobre--ambar::before { content: '●'; margin-right: 8px; }
.hag__estado { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); font-weight: 700; }
.hag__estado--verde { color: var(--nu-agora-verde); }
.hag__estado--azul { color: var(--nu-agora-azul); }
.hag__frase {
  margin: 12px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-hero); font-weight: 800;
  letter-spacing: -0.05em; line-height: 1; text-wrap: balance;
}
.hag__veredito { margin: 18px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; }
.hag__apoio { margin: 16px 0 0; max-width: 52ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; text-wrap: pretty; }
.hag__sub { margin: 18px 0 0; max-width: 52ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }
.hag__esq-titulo { margin-top: 18px; }
.hag__esq-veredito { margin-top: 20px; }
.hag__esq-apoio { margin-top: 18px; max-width: 460px; }

/* a faixa: uma linha fina, os três números e o botão */
.hag__faixa {
  margin-top: auto; padding-top: clamp(20px, 2.4vw, 28px); border-top: 1px solid var(--nu-agora-linha);
  display: flex; align-items: flex-end; justify-content: space-between; gap: 20px 32px; flex-wrap: wrap;
}
.hag__fatos { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px clamp(12px, 2.4vw, 40px); }
.hag__fato { display: flex; align-items: flex-end; gap: 2px; }
.hag__fato--esqueleto { flex-direction: column; align-items: flex-start; gap: 10px; padding: 12px 14px; }
/* largura fixa: abrir o olho não empurra os vizinhos */
.hag__fato-link {
  position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 196px; padding: 12px 34px 12px 14px; border-radius: 14px;
  color: var(--nu-agora-texto); transition: background .2s;
}
.hag__fato-link::after {
  content: '→'; position: absolute; right: 14px; bottom: 14px; color: var(--nu-agora-sub);
  font-size: var(--nu-fs-md); font-weight: 700; opacity: 0; transform: translateX(-4px); transition: opacity .2s, transform .2s;
}
.hag__fato-link:hover { background: var(--nu-agora-cartao); color: var(--nu-agora-texto); }
.hag__fato-link:hover::after { opacity: 1; transform: none; }
.hag__fato-link:focus-visible { outline: 2px solid var(--nu-agora-azul); outline-offset: 2px; }
.hag__fato-rotulo { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; }
.hag__fato-valor { font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hag__fato-valor--up { color: var(--nu-agora-verde); }
.hag__fato-valor--down { color: var(--nu-agora-vermelho); }
.hag__fato-valor--escondido { color: var(--nu-agora-sub); letter-spacing: .04em; }
.hag__olho {
  display: grid; place-items: center; width: 44px; height: 44px; margin: 0 0 6px -30px; padding: 0; border: 0; border-radius: 50%;
  background: transparent; color: var(--nu-agora-sub); cursor: pointer; transition: background .2s, color .2s;
  position: relative; z-index: 1;
}
.hag__olho:hover { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); }
.hag__olho:focus-visible { outline: 2px solid var(--nu-agora-azul); outline-offset: 2px; }
.hag__olho-corte { stroke: var(--nu-agora-bg); }
/* o patrimônio tem o olho no lugar da seta */
.hag__fato:has(.hag__olho) .hag__fato-link { padding-right: 40px; }
.hag__fato:has(.hag__olho) .hag__fato-link::after { content: none; }

.hag__base, .hag__chamada { margin-top: auto; }
.hag__base { display: flex; align-items: center; justify-content: space-between; gap: 18px 28px; flex-wrap: wrap; }
.hag__meio { margin-top: auto; }
.hag__acoes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.hag__carteira, .hag__alerta {
  display: inline-flex; align-items: center; gap: 8px; min-height: 52px; padding: 0 22px; border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; transition: background .2s, color .2s;
}
.hag__carteira { background: var(--nu-agora-texto); color: var(--nu-agora-bg); }
.hag__carteira:hover { background: var(--nu-white); color: var(--nu-agora-bg); }
.hag__carteira svg, .hag__alerta svg { transition: transform .2s ease; }
.hag__carteira:hover svg, .hag__alerta:hover svg { transform: translateX(3px); }
.hag__alerta { background: color-mix(in srgb, var(--nu-agora-ambar) 16%, transparent); color: var(--nu-agora-ambar); }
.hag__alerta:hover { background: color-mix(in srgb, var(--nu-agora-ambar) 24%, transparent); color: var(--nu-agora-ambar); }
.hag__carteira:focus-visible, .hag__alerta:focus-visible { outline: 2px solid var(--nu-agora-azul); outline-offset: 3px; }

/* abaixo de 960 px: o anel em cima, centrado, e o texto embaixo */
@media (max-width: 959px) {
  .hag__painel { grid-template-columns: minmax(0, 1fr); }
  .hag__anel { order: -1; justify-self: center; width: min(100%, 460px); }
}
@media (max-width: 560px) {
  .hag__tela { gap: 28px; }
  .hag__veredito { font-size: var(--nu-fs-2xl); }
  .hag__apoio { font-size: var(--nu-fs-md); }
  /* os números viram linhas: o rótulo à esquerda, o valor à direita */
  .hag__faixa { flex-direction: column; align-items: stretch; }
  .hag__fatos { flex-direction: column; gap: 0; }
  .hag__fato { align-items: center; }
  .hag__fato-link { flex: 1; min-width: 0; flex-direction: row; align-items: center; justify-content: space-between; padding: 10px 12px; }
  /* o lugar do olho nas outras linhas, para os valores alinharem à direita */
  .hag__fato:not(:has(.hag__olho))::after { content: ''; flex: none; width: 44px; }
  .hag__fato:has(.hag__olho) .hag__fato-link { padding-right: 12px; }
  .hag__fato-link::after { content: none; }
  .hag__fato-valor { font-size: var(--nu-fs-xl); }
  .hag__olho { margin: 0; }
  .hag__acoes { flex-direction: column; align-items: stretch; }
  .hag__carteira, .hag__alerta { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .hag__tela { animation: none; }
}
</style>
