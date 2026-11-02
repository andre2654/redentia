<script setup lang="ts">
// O quiz do "Conectar carteira" (pedido do dono, 31/10/2026): seis perguntas
// rápidas, uma por tela, dois respiros (o aviso de exemplo e os 2.000
// cenários se desenhando), a montagem do plano e o resultado, que termina no
// preço de lançamento e, para quem ainda não tem CPF na conta, nos dados do
// titular (CPF e WhatsApp) antes do pagamento (login,
// Checkout da Stripe). As regras e as frases estão em utils/quizAssinatura.
//
// Gestos: escolha única avança sozinha (com um respiro de 0,22 s para o toque
// aparecer); escolha múltipla tem "Continuar". Voltar no canto, Esc fecha.
// No celular ocupa a tela; no computador, um cartão no meio.
// Acessibilidade do NuDayModal: useModalA11y (Tab preso + foco devolvido).
import type { AppleCredencial } from '~/composables/useAppleAuth'
import { TEXTO_ACEITE_WHATSAPP, DIAS_GRATIS, PRECO_MENSAL, cpfValido, dataDaPrimeiraCobranca, formatarCelular, formatarCpf, normalizarCelular } from '~/utils/assinatura'
import { INSTITUICOES } from '~/content/instituicoes'
import {
  passosDoQuiz,
  alternarBanco,
  fraseDosAvisos,
  fraseDosCenarios,
  guardarBancosDoQuiz,
  resultadoDoQuiz,
  tituloDoResultado,
  type Opcao,
  type Pergunta,
  type Respostas,
} from '~/utils/quizAssinatura'

const { aberto, direto, montado, fechar, evento } = useQuizAssinatura()
const assinatura = useAssinatura()
const { erro, primeiraAssinatura, abrindo } = assinatura

// os dados do titular (01/11/2026): o CPF é obrigatório no pagamento (o teste
// é um por e-mail e por CPF) e o WhatsApp é o canal do onboarding. Pedidos no
// fim, só para quem ainda não tem CPF na conta, depois de ver o plano e o preço.
const pedirDados = ref(false)
const cpf = ref('')
const celular = ref('')
// o "sim" do WhatsApp é um gesto: a caixa começa desmarcada (LGPD)
const aceiteWhatsapp = ref(false)
const erroDados = ref<string | null>(null)
const precisaDosDados = computed(() => assinatura.ent.value?.precisa_cpf !== false)
async function irParaPagamento() {
  evento('quiz_oferta')
  erroDados.value = null
  if (precisaDosDados.value) {
    pedirDados.value = true
    evento('quiz_dados_aberto')
    return
  }
  if ((await assinatura.comecar()) === 'dados') pedirDados.value = true
}
async function enviarDados() {
  erroDados.value = null
  if (!cpfValido(cpf.value)) {
    erroDados.value = 'Confira o CPF: os números não batem.'
    return
  }
  const cel = celular.value.trim() ? normalizarCelular(celular.value) : null
  if (celular.value.trim() && !cel) {
    erroDados.value = 'Confira o celular, com o DDD: (11) 98765-4321.'
    return
  }
  evento('quiz_dados_enviados', { whatsapp: !!cel && aceiteWhatsapp.value })
  await assinatura.comecar({ cpf: cpf.value.replace(/\D/g, ''), ...(cel ? { celular: cel, whatsapp_opt_in: aceiteWhatsapp.value } : {}) })
}
onMounted(() => { montado.value = true })
onBeforeUnmount(() => { montado.value = false })
const { displayName, isAuthenticated } = useAuthState()
// sem conta, o e-mail vem antes do resultado (passosDoQuiz); a conta nasce aqui
// mesmo, com o código de 6 números (o mesmo cadastro da folha e do /login)
const comConta = ref(false)
const PASSOS_ = computed(() => passosDoQuiz(comConta.value))
const cad = useCadastroInline()
const email = ref('')
const codigo = ref('')
const isca = ref('')
// o onboarding obrigatório da conta nova espera o quiz fechar (como espera a folha)
const naFolha = useState<boolean>('nu:onb-na-folha', () => false)

const indice = ref(0)
const respostas = ref<Respostas>({})
const indo = ref<'frente' | 'tras'>('frente')
const passo = computed(() => PASSOS_.value[indice.value]!)
const totalPerguntas = PASSOS_.value.filter((p) => p.tipo === 'pergunta').length
// a barra: quantas perguntas já ficaram para trás (os respiros não contam)
const feitas = computed(() => PASSOS_.value.slice(0, indice.value).filter((p) => p.tipo === 'pergunta').length)
const progresso = computed(() => (passo.value.tipo === 'resultado' ? 1 : passo.value.tipo === 'montando' ? 0.96 : passo.value.tipo === 'conta' ? 0.9 : feitas.value / totalPerguntas))

const instituicao = (slug: string) => INSTITUICOES.find((i) => i.slug === slug)
const nomeDoBanco = (slug: string) => instituicao(slug)?.name ?? slug

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, aberto)
const tituloId = useId()

function marcados(p: Pergunta): string[] {
  return respostas.value[p.id] ?? []
}
let atraso: ReturnType<typeof setTimeout> | null = null
function escolher(p: Pergunta, o: Opcao) {
  if (p.multipla) {
    const atual = marcados(p)
    respostas.value = {
      ...respostas.value,
      [p.id]: p.forma === 'bancos' ? alternarBanco(atual, o.id) : atual.includes(o.id) ? atual.filter((x) => x !== o.id) : [...atual, o.id],
    }
    return
  }
  respostas.value = { ...respostas.value, [p.id]: [o.id] }
  if (atraso) clearTimeout(atraso)
  atraso = setTimeout(avancar, 220)
}

function avancar() {
  if (indice.value >= PASSOS_.value.length - 1) return
  indo.value = 'frente'
  indice.value++
  const p = passo.value
  evento('quiz_passo', { passo: indice.value, nome: p.tipo === 'pergunta' ? p.pergunta.id : p.tipo === 'respiro' ? p.id : p.tipo })
  if (p.tipo === 'resultado') {
    evento('quiz_resultado')
    // a carteira vazia começa pelos bancos que a pessoa contou aqui
    guardarBancosDoQuiz(respostas.value.bancos)
  }
}
function voltar() {
  // nos dados, voltar é voltar ao plano (quem abriu direto nos dados fecha)
  if (pedirDados.value) {
    if (direto.value === 'dados') return fechar()
    pedirDados.value = false
    return
  }
  if (indice.value === 0) return
  indo.value = 'tras'
  indice.value--
  // a montagem não tem volta, e a conta já feita também não: pula até a última pergunta
  while (indice.value > 0 && (passo.value.tipo === 'montando' || (passo.value.tipo === 'conta' && isAuthenticated.value))) indice.value--
}
const podeVoltar = computed(() => pedirDados.value || (indice.value > 0 && passo.value.tipo !== 'montando'))

// o passo da conta: o e-mail, o código e, confirmado, o resultado
async function pedirCodigo() {
  if (await cad.pedirCodigo(email.value, '/assinar', isca.value)) {
    codigo.value = ''
    evento('quiz_conta_codigo')
  }
}
async function confirmarCodigo() {
  const feito = await cad.confirmar(codigo.value)
  if (!feito) return
  evento('quiz_conta_feita', { nova: feito.novaConta })
  avancar()
}
const socialNoQuiz = !!(useGoogleAuth().clientId || useAppleAuth().clientId)
// Apple ou Google: a conta nasce sem sair do quiz e sem esperar o código
async function entrarSocial(provedor: 'google' | 'apple', credencial: string | AppleCredencial) {
  const feito = await cad.entrarSocial(provedor, credencial)
  if (!feito) return
  evento('quiz_conta_feita', { nova: feito.novaConta, via: provedor })
  avancar()
}

// a montagem: as quatro linhas se acendem e o resultado entra sozinho. Nada é
// calculado aqui, então as linhas não fingem trabalho: são o plano anotado a
// partir das respostas, o que a Redentia vai fazer depois de conectar.
const linhasDaMontagem = computed(() => {
  const bancos = (respostas.value.bancos ?? []).filter((b) => b !== 'nenhum' && b !== 'outro').map(nomeDoBanco)
  const preocupa = respostas.value.preocupa ?? []
  return [
    bancos.length ? `Ler ${bancos.length > 2 ? `${bancos.slice(0, 2).join(', ')} e mais ${bancos.length - 2}` : bancos.join(' e ')} pelo Open Finance` : 'Começar a carteira com você',
    'Testar a carteira em 2.000 cenários',
    preocupa.includes('queda') ? 'Avisar numa queda forte' : 'Avisar só quando importar',
    'Mandar o resumo do pregão, todo dia útil',
  ]
})
const acesas = ref(0)
let relogio: ReturnType<typeof setInterval> | null = null
watch(() => passo.value.tipo, (tipo) => {
  if (relogio) clearInterval(relogio)
  if (tipo !== 'montando') return
  acesas.value = 0
  const reduzido = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  relogio = setInterval(() => {
    acesas.value++
    if (acesas.value > linhasDaMontagem.value.length) {
      if (relogio) clearInterval(relogio)
      avancar()
    }
  }, reduzido ? 180 : 620)
})

const avisos = computed(() => fraseDosAvisos(respostas.value))
const cenarios = computed(() => fraseDosCenarios(respostas.value))
const itens = computed(() => resultadoDoQuiz(respostas.value, nomeDoBanco))
const titulo = computed(() => tituloDoResultado(respostas.value, displayName.value))
const primeira = dataDaPrimeiraCobranca()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') fechar()
}
watch(aberto, (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  naFolha.value = open
  if (open) {
    comConta.value = !isAuthenticated.value
    cad.trocarContato()
    pedirDados.value = direto.value === 'dados'
    erroDados.value = null
    aceiteWhatsapp.value = false
    indice.value = direto.value === 'dados' ? PASSOS_.value.length - 1 : 0
    respostas.value = {}
    indo.value = 'frente'
    document.addEventListener('keydown', onKey)
  }
  else {
    document.removeEventListener('keydown', onKey)
    if (relogio) clearInterval(relogio)
  }
})
onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
  if (relogio) clearInterval(relogio)
  if (atraso) clearTimeout(atraso)
  fechar()
})

// os desenhos das opções: traço simples, um por resposta
const ICONES: Record<string, string> = {
  arvore: 'M12 21v-7M12 14c-3.5 0-6-2.4-6-5.6C6 5.4 8.7 3 12 3s6 2.4 6 5.4c0 3.2-2.5 5.6-6 5.6ZM9 21h6',
  broto: 'M12 21v-8M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6ZM12 11c0-3 2.4-5.5 5.5-5.5 0 3-2.4 5.5-5.5 5.5ZM8 21h8',
  semente: 'M12 20c-3.9 0-7-3.1-7-7 0-4.5 7-10 7-10s7 5.5 7 10c0 3.9-3.1 7-7 7ZM12 20v-6',
  sol: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  calendario: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2',
  nuvem: 'M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z',
  lua: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  queda: 'M3 6l6 6 4-4 8 8M21 10v6h-6',
  bussola: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
  moeda: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.6 0-2.7.8-2.7 2s1.1 1.7 2.7 2c1.6.3 2.7.9 2.7 2.1s-1.2 1.9-2.7 1.9c-1.2 0-2.2-.5-2.7-1.3M12 6.5v1.5M12 16v1.5',
  pecas: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  certo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.7 2.7L16 9.8',
  talvez: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12h8',
  pergunta: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  sobe: 'M3 18l6-6 4 4 8-8M21 8v6M21 8h-6',
  escudo: 'M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="aqz">
      <div v-if="aberto" class="aqz" @click="fechar">
        <div ref="cardRef" class="aqz__card" :class="{ 'aqz__card--escuro': passo.tipo === 'respiro' }" role="dialog" aria-modal="true" :aria-labelledby="tituloId" tabindex="-1" @click.stop>
          <!-- o topo: voltar, a barra e fechar -->
          <div class="aqz__topo">
            <button type="button" class="aqz__icone-btn" :class="{ 'aqz__icone-btn--fora': !podeVoltar }" aria-label="Voltar" :disabled="!podeVoltar" @click="voltar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div class="aqz__barra" role="progressbar" aria-label="Andamento do quiz" :aria-valuenow="Math.round(progresso * 100)" aria-valuemin="0" aria-valuemax="100">
              <span class="aqz__barra-cheia" :style="{ transform: `scaleX(${progresso})` }" />
            </div>
            <button type="button" class="aqz__icone-btn" aria-label="Fechar" @click="fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          <div class="aqz__corpo">
            <Transition :name="indo === 'frente' ? 'aqz-frente' : 'aqz-tras'" mode="out-in">
              <!-- uma pergunta -->
              <section v-if="passo.tipo === 'pergunta'" :key="`p-${indice}`" class="aqz__passo">
                <p class="aqz__conta">{{ feitas + 1 }} de {{ totalPerguntas }}</p>
                <h2 :id="tituloId" class="aqz__titulo">{{ passo.pergunta.titulo }}</h2>
                <p v-if="passo.pergunta.sub" class="aqz__sub">{{ passo.pergunta.sub }}</p>

                <!-- os bancos: os logos -->
                <div v-if="passo.pergunta.forma === 'bancos'" class="aqz__bancos">
                  <button
                    v-for="o in passo.pergunta.opcoes" :key="o.id" type="button" class="aqz__banco"
                    :class="{ 'aqz__banco--sim': marcados(passo.pergunta).includes(o.id), 'aqz__banco--texto': !instituicao(o.id) }"
                    :aria-pressed="marcados(passo.pergunta).includes(o.id)"
                    @click="escolher(passo.pergunta, o)"
                  >
                    <ClienteInstLogo v-if="instituicao(o.id)" :inst="instituicao(o.id)!" :size="34" />
                    <span class="aqz__banco-nome">{{ instituicao(o.id)?.name ?? o.t }}</span>
                    <span class="aqz__marca" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                  </button>
                </div>

                <!-- a grade: três cartões altos com o desenho grande -->
                <div v-else-if="passo.pergunta.forma === 'grade'" class="aqz__grade">
                  <button
                    v-for="o in passo.pergunta.opcoes" :key="o.id" type="button" class="aqz__cartao"
                    :class="{ 'aqz__cartao--sim': marcados(passo.pergunta).includes(o.id) }"
                    :aria-pressed="marcados(passo.pergunta).includes(o.id)"
                    @click="escolher(passo.pergunta, o)"
                  >
                    <span class="aqz__desenho" :class="`aqz__desenho--${o.icone}`" aria-hidden="true">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="ICONES[o.icone ?? ''] ?? ''" /></svg>
                    </span>
                    <span class="aqz__cartao-t">{{ o.t }}</span>
                  </button>
                </div>

                <!-- a lista -->
                <div v-else class="aqz__lista">
                  <button
                    v-for="o in passo.pergunta.opcoes" :key="o.id" type="button" class="aqz__opcao"
                    :class="{ 'aqz__opcao--sim': marcados(passo.pergunta).includes(o.id) }"
                    :aria-pressed="marcados(passo.pergunta).includes(o.id)"
                    @click="escolher(passo.pergunta, o)"
                  >
                    <span class="aqz__opcao-icone" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="ICONES[o.icone ?? ''] ?? ''" /></svg>
                    </span>
                    <span class="aqz__opcao-t">{{ o.t }}</span>
                    <span v-if="passo.pergunta.multipla" class="aqz__marca" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                  </button>
                </div>

                <button
                  v-if="passo.pergunta.multipla" type="button" class="aqz__seguir"
                  :disabled="!marcados(passo.pergunta).length" @click="avancar"
                >Continuar</button>
              </section>

              <!-- respiro 1: o aviso de exemplo -->
              <section v-else-if="passo.tipo === 'respiro' && passo.id === 'avisos'" :key="`r-${indice}`" class="aqz__passo aqz__passo--escuro">
                <h2 :id="tituloId" class="aqz__titulo aqz__titulo--claro">{{ avisos.titulo }}</h2>
                <p class="aqz__sub aqz__sub--claro">{{ avisos.texto }}</p>
                <div class="aqz__celular" aria-label="Exemplo de aviso da Redentia" role="img">
                  <span class="aqz__exemplo">Exemplo de aviso</span>
                  <div class="aqz__aviso">
                    <span class="aqz__aviso-logo" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /></svg>
                    </span>
                    <span class="aqz__aviso-txt">
                      <span class="aqz__aviso-topo"><strong>Redentia</strong><span>agora</span></span>
                      <span class="aqz__aviso-msg">Sua carteira caiu 3,1% hoje, mais que a bolsa (−1,2%). Os bancos puxaram.</span>
                    </span>
                  </div>
                  <div class="aqz__aviso aqz__aviso--atras">
                    <span class="aqz__aviso-logo" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /></svg>
                    </span>
                    <span class="aqz__aviso-txt">
                      <span class="aqz__aviso-topo"><strong>Redentia</strong><span>ontem</span></span>
                      <span class="aqz__aviso-msg">Tudo normal. Sua carteira subiu 0,4%; a bolsa, 0,3%.</span>
                    </span>
                  </div>
                </div>
                <button type="button" class="aqz__seguir aqz__seguir--claro" @click="avancar">Continuar</button>
              </section>

              <!-- respiro 2: os 2.000 cenários se desenhando -->
              <section v-else-if="passo.tipo === 'respiro'" :key="`r-${indice}`" class="aqz__passo aqz__passo--escuro">
                <h2 :id="tituloId" class="aqz__titulo aqz__titulo--claro">{{ cenarios.titulo }}</h2>
                <p class="aqz__sub aqz__sub--claro">{{ cenarios.texto }}</p>
                <div class="aqz__leque">
                  <AssinaturaExemploCaminhos :altura="230" />
                </div>
                <button type="button" class="aqz__seguir aqz__seguir--claro" @click="avancar">Continuar</button>
              </section>

              <!-- a conta: para onde mandamos o plano (só para quem chega sem conta) -->
              <section v-else-if="passo.tipo === 'conta'" :key="`c-${indice}`" class="aqz__passo">
                <template v-if="cad.etapa.value === 'contato'">
                  <h2 :id="tituloId" class="aqz__titulo">Para onde mandamos o seu plano?</h2>
                  <p class="aqz__sub">{{ socialNoQuiz ? 'Com a sua conta Apple ou Google, num toque. Ou pelo e-mail, com um código de 6 números, sem senha.' : 'O seu e-mail. Mandamos um código de 6 números para confirmar, sem senha.' }}</p>
                  <LoginSocial
                    class="aqz__social" divisor="ou com o e-mail" :disabled="cad.enviando.value"
                    @google="entrarSocial('google', $event)" @apple="entrarSocial('apple', $event)" @error="cad.erro.value = $event"
                  />
                  <form class="aqz__form" @submit.prevent="pedirCodigo">
                    <label class="aqz__rotulo" for="aqz-email">E-mail</label>
                    <input id="aqz-email" v-model="email" class="aqz__campo" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com" required>
                    <input v-model="isca" class="aqz__isca" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
                    <p v-if="cad.erro.value" class="aqz__erro-claro" role="alert">{{ cad.erro.value }}</p>
                    <button type="submit" class="aqz__seguir" :disabled="cad.enviando.value || !email.trim()">
                      {{ cad.enviando.value ? 'Enviando o código' : 'Ver o meu plano' }}
                    </button>
                  </form>
                  <p class="aqz__miudo">Ao continuar, você cria a sua conta na Redentia e aceita os <NuxtLink to="/institucional/terms" target="_blank">Termos</NuxtLink> e a <NuxtLink to="/institucional/privacy" target="_blank">Privacidade</NuxtLink>.</p>
                </template>
                <template v-else>
                  <h2 :id="tituloId" class="aqz__titulo">Confira o seu e-mail.</h2>
                  <p class="aqz__sub">Mandamos um código de 6 números para <strong>{{ cad.contato.value }}</strong>.</p>
                  <form class="aqz__form" @submit.prevent="confirmarCodigo">
                    <label class="aqz__rotulo" for="aqz-codigo">Código</label>
                    <input id="aqz-codigo" v-model="codigo" class="aqz__campo aqz__campo--codigo" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" required>
                    <p v-if="cad.erro.value" class="aqz__erro-claro" role="alert">{{ cad.erro.value }}</p>
                    <button type="submit" class="aqz__seguir" :disabled="cad.enviando.value || codigo.replace(/\D/g, '').length !== 6">
                      {{ cad.enviando.value ? 'Confirmando' : 'Confirmar' }}
                    </button>
                  </form>
                  <p class="aqz__miudo">
                    <button type="button" class="aqz__link" :disabled="cad.reenviarEm.value > 0" @click="cad.reenviar('/assinar')">
                      {{ cad.reenviarEm.value > 0 ? `Reenviar em ${cad.reenviarEm.value} s` : 'Reenviar o código' }}
                    </button>
                    ·
                    <button type="button" class="aqz__link" @click="cad.trocarContato()">Trocar o e-mail</button>
                  </p>
                </template>
              </section>

              <!-- a montagem -->
              <section v-else-if="passo.tipo === 'montando'" :key="`m-${indice}`" class="aqz__passo aqz__passo--centro">
                <h2 :id="tituloId" class="aqz__titulo">Anotando o seu plano.</h2>
                <ol class="aqz__montagem" aria-live="polite">
                  <li v-for="(l, i) in linhasDaMontagem" :key="i" class="aqz__linha" :class="{ 'aqz__linha--acesa': i < acesas, 'aqz__linha--agora': i === acesas }">
                    <span class="aqz__linha-marca" aria-hidden="true">
                      <svg v-if="i < acesas" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    {{ l }}
                  </li>
                </ol>
              </section>

              <!-- o resultado e a oferta -->
              <!-- os dados do titular: CPF e WhatsApp, antes do pagamento -->
              <section v-else-if="pedirDados" key="dados" class="aqz__passo">
                <h2 :id="tituloId" class="aqz__titulo">Falta pouco.</h2>
                <p class="aqz__sub">O CPF confirma que o teste grátis é seu. O WhatsApp é por onde a Redentia te avisa.</p>
                <form class="aqz__form" @submit.prevent="enviarDados">
                  <label class="aqz__rotulo" for="aqz-cpf">CPF</label>
                  <input id="aqz-cpf" :value="cpf" class="aqz__campo" type="text" inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" required @input="cpf = formatarCpf(($event.target as HTMLInputElement).value)">
                  <label class="aqz__rotulo aqz__rotulo--depois" for="aqz-cel">WhatsApp <span>(opcional)</span></label>
                  <input id="aqz-cel" :value="celular" class="aqz__campo" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(11) 98765-4321" @input="celular = formatarCelular(($event.target as HTMLInputElement).value)">
                  <label class="aqz__aceite">
                    <input v-model="aceiteWhatsapp" type="checkbox" class="aqz__aceite-caixa">
                    <span>{{ TEXTO_ACEITE_WHATSAPP }}</span>
                  </label>
                  <p v-if="erroDados || erro" class="aqz__erro-claro" role="alert">{{ erroDados || erro }}</p>
                  <button type="submit" class="aqz__seguir" :disabled="abrindo || cpf.replace(/\D/g, '').length !== 11">
                    {{ abrindo ? 'Abrindo o pagamento' : primeiraAssinatura ? 'Começar 3 dias grátis' : 'Ir para o pagamento' }}
                  </button>
                </form>
                <p class="aqz__miudo">O pagamento é na Stripe, com o cartão. O CPF fica guardado com segurança e não aparece para ninguém.</p>
              </section>

              <section v-else :key="`f-${indice}`" class="aqz__passo">
                <h2 :id="tituloId" class="aqz__titulo">{{ titulo }}</h2>
                <p class="aqz__sub">O que a Redentia vai fazer pela sua carteira:</p>
                <ul class="aqz__itens">
                  <li v-for="it in itens" :key="it.id" class="aqz__item">
                    <span class="aqz__item-marca" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    <span>
                      <strong class="aqz__item-t">{{ it.titulo }}</strong>
                      <span class="aqz__item-d">{{ it.texto }}</span>
                    </span>
                  </li>
                </ul>

                <div class="aqz__oferta">
                  <span class="aqz__oferta-selo">Preço de lançamento</span>
                  <div class="aqz__oferta-preco">
                    <strong>{{ PRECO_MENSAL }}</strong><span>por mês</span>
                  </div>
                  <p class="aqz__oferta-letra">
                    <template v-if="primeiraAssinatura">
                      {{ DIAS_GRATIS }} dias grátis para testar. A primeira cobrança é no dia {{ primeira }}.
                      Cancele quando quiser, em Configurações: cancelou antes, não paga nada.
                    </template>
                    <template v-else>Cobrança hoje, no cartão, e depois uma vez por mês. Cancele quando quiser.</template>
                  </p>
                  <button type="button" class="aqz__pagar" :disabled="abrindo" @click="irParaPagamento">
                    {{ abrindo ? 'Abrindo o pagamento' : primeiraAssinatura ? 'Começar 3 dias grátis' : `Assinar por ${PRECO_MENSAL}/mês` }}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                  <p v-if="erro" class="aqz__erro" role="alert">{{ erro }}</p>
                </div>
              </section>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.aqz {
  position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px;
  background: rgba(8, 14, 26, 0.62); backdrop-filter: blur(6px);
}
.aqz__card {
  position: relative; display: flex; flex-direction: column; width: min(640px, 100%); height: min(760px, calc(100dvh - 48px));
  background: var(--nu-cream); border-radius: var(--nu-r-card-lg); box-shadow: var(--nu-shadow-float); overflow: hidden; outline: none;
}
/* nos respiros o cartão inteiro vira azul-marinho */
.aqz__card { transition: background .3s ease; }
.aqz__card--escuro { background: var(--nu-navy); }
.aqz__card--escuro .aqz__icone-btn { background: var(--nu-navy-2); color: var(--nu-cream-text); box-shadow: none; }
.aqz__card--escuro .aqz__barra { background: var(--nu-cream-text-12); }
.aqz__card--escuro .aqz__barra-cheia { background: var(--nu-blue-soft); }
.aqz__topo { display: flex; align-items: center; gap: 14px; padding: 18px 20px 6px; }
.aqz__icone-btn {
  display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border: 0; border-radius: 50%;
  background: var(--nu-white); color: var(--nu-ink); cursor: pointer; box-shadow: var(--nu-shadow-pos-nav); transition: opacity .2s;
}
.aqz__icone-btn--fora { opacity: 0; pointer-events: none; }
.aqz__icone-btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.aqz__barra { flex: 1; height: 6px; border-radius: var(--nu-r-pill); background: var(--nu-cream-line); overflow: hidden; }
.aqz__barra-cheia { display: block; height: 100%; background: var(--nu-blue); border-radius: inherit; transform-origin: left; transition: transform .45s cubic-bezier(.22, 1, .36, 1); }

.aqz__corpo { flex: 1; overflow-y: auto; overflow-x: hidden; }
.aqz__passo { display: flex; flex-direction: column; min-height: 100%; padding: 22px clamp(22px, 5vw, 44px) 32px; }
.aqz__passo--centro { justify-content: center; }
.aqz__passo--escuro { background: var(--nu-navy); }
.aqz__conta { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.aqz__titulo { margin: 10px 0 0; color: var(--nu-ink); font-size: clamp(28px, 4.4vw, 38px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; text-wrap: balance; }
.aqz__titulo:focus { outline: none; }
.aqz__titulo--claro { color: var(--nu-cream-text); margin-top: 18px; }
.aqz__sub { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.aqz__sub--claro { color: var(--nu-cream-text-70); }

/* a lista */
.aqz__lista { display: flex; flex-direction: column; gap: 10px; margin-top: 26px; }
.aqz__opcao {
  display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; text-align: left;
  border: 0; border-radius: var(--nu-r-tile); background: var(--nu-white); box-shadow: inset 0 0 0 1.5px transparent, var(--nu-shadow-pos-nav);
  color: var(--nu-ink); font-family: inherit; cursor: pointer; transition: box-shadow .15s, transform .15s;
}
.aqz__opcao:hover { transform: translateY(-1px); }
.aqz__opcao:active { transform: scale(.99); }
.aqz__opcao:focus-visible, .aqz__cartao:focus-visible, .aqz__banco:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.aqz__opcao--sim { box-shadow: inset 0 0 0 2px var(--nu-blue), var(--nu-shadow-pos-nav); }
.aqz__opcao-icone { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; border-radius: 12px; background: var(--nu-blue-tint); color: var(--nu-blue-text); }
.aqz__opcao--sim .aqz__opcao-icone { background: var(--nu-blue); color: var(--nu-white); }
.aqz__opcao-t { flex: 1; font-size: var(--nu-fs-lg); font-weight: 700; }

/* o visto da escolha múltipla */
.aqz__marca {
  display: grid; place-items: center; width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--nu-cream-line); color: transparent; transition: background .15s, color .15s;
}
.aqz__opcao--sim .aqz__marca, .aqz__banco--sim .aqz__marca { background: var(--nu-blue); color: var(--nu-white); box-shadow: none; }

/* a grade da primeira pergunta */
.aqz__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 28px; }
.aqz__cartao {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 12px 20px; text-align: center;
  border: 0; border-radius: var(--nu-r-card); background: var(--nu-white); box-shadow: inset 0 0 0 1.5px transparent, var(--nu-shadow-pos-nav);
  font-family: inherit; cursor: pointer; transition: box-shadow .15s, transform .15s;
}
.aqz__cartao:hover { transform: translateY(-2px); }
.aqz__cartao--sim { box-shadow: inset 0 0 0 2px var(--nu-blue), var(--nu-shadow-pos-nav); }
.aqz__desenho { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; }
.aqz__desenho--arvore { background: var(--nu-green-bg); color: var(--nu-green-2); }
.aqz__desenho--broto { background: var(--nu-blue-tint); color: var(--nu-blue-text); }
.aqz__desenho--semente { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.aqz__cartao-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; line-height: 1.25; }

/* os bancos */
.aqz__bancos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 24px; }
.aqz__banco {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px 8px 8px; text-align: left;
  border: 0; border-radius: var(--nu-r-tile); background: var(--nu-white); box-shadow: inset 0 0 0 1.5px transparent, var(--nu-shadow-pos-nav);
  font-family: inherit; cursor: pointer; transition: box-shadow .15s;
}
.aqz__banco--texto { padding-left: 16px; min-height: 50px; }
.aqz__banco--sim { box-shadow: inset 0 0 0 2px var(--nu-blue), var(--nu-shadow-pos-nav); }
.aqz__banco :deep(.cil) { border-radius: 10px; }
.aqz__banco-nome { flex: 1; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* continuar */
.aqz__seguir {
  margin-top: auto; align-self: stretch; min-height: 56px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-family: inherit; font-size: var(--nu-fs-lg); font-weight: 800; cursor: pointer;
  transition: background .2s, opacity .2s;
}
.aqz__lista + .aqz__seguir, .aqz__bancos + .aqz__seguir { margin-top: 24px; }
.aqz__seguir:disabled { opacity: .35; cursor: default; }
.aqz__seguir:hover:not(:disabled) { background: var(--nu-blue-hover); }
.aqz__seguir:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.aqz__seguir--claro { background: var(--nu-cream); color: var(--nu-navy); margin-top: 28px; }
.aqz__seguir--claro:hover:not(:disabled) { background: var(--nu-white); }

/* a conta */
.aqz__social { margin-top: 26px; }
.aqz__social + .aqz__form { margin-top: 18px; }
.aqz__form { display: flex; flex-direction: column; gap: 10px; margin-top: 26px; }
.aqz__rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.aqz__campo {
  min-height: 56px; padding: 0 18px; border: 0; border-radius: var(--nu-r-tile); background: var(--nu-white);
  box-shadow: inset 0 0 0 1.5px var(--nu-cream-line); color: var(--nu-ink); font-family: inherit; font-size: var(--nu-fs-lg); font-weight: 700;
}
.aqz__campo:focus { outline: none; box-shadow: inset 0 0 0 2px var(--nu-blue); }
.aqz__campo--codigo { letter-spacing: .4em; font-variant-numeric: tabular-nums; }
.aqz__rotulo--depois { margin-top: 8px; }
.aqz__rotulo span { color: var(--nu-gray); font-weight: 500; }
.aqz__miudo--junto { margin-top: 0; }
.aqz__aceite { display: flex; align-items: flex-start; gap: 10px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; cursor: pointer; }
.aqz__aceite-caixa { flex: none; width: 20px; height: 20px; margin: 0; accent-color: var(--nu-blue); cursor: pointer; }
.aqz__pagar {
  display: inline-flex; align-items: center; justify-content: center; gap: 11px; width: 100%; min-height: 58px; border: 0;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-family: inherit;
  font-size: var(--nu-fs-lg); font-weight: 800; cursor: pointer; transition: background .2s;
}
.aqz__pagar:hover:not(:disabled) { background: var(--nu-blue-hover); }
.aqz__pagar:disabled { opacity: .7; cursor: progress; }
.aqz__pagar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.aqz__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.aqz__form .aqz__seguir { margin-top: 14px; }
.aqz__erro-claro { margin: 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.aqz__miudo { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.aqz__miudo a, .aqz__link { color: var(--nu-blue-text); font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.aqz__link { padding: 0; border: 0; background: none; font-family: inherit; font-size: inherit; cursor: pointer; }
.aqz__link:disabled { color: var(--nu-gray); text-decoration: none; cursor: default; }

/* o aviso de exemplo */
.aqz__celular { position: relative; display: flex; flex-direction: column; gap: 10px; margin-top: 32px; padding: 22px 18px; border-radius: 28px; background: var(--nu-navy-2); }
.aqz__exemplo { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.aqz__aviso {
  display: flex; gap: 12px; padding: 14px; border-radius: 18px; background: rgba(245, 241, 234, 0.95); color: var(--nu-ink);
  animation: aqz-aviso .6s cubic-bezier(.22, 1, .36, 1) .25s backwards;
}
.aqz__aviso--atras { opacity: .55; transform: scale(.97); animation-delay: .1s; }
.aqz__aviso-logo { display: grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; background: var(--nu-blue); color: var(--nu-white); }
.aqz__aviso-txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.aqz__aviso-topo { display: flex; justify-content: space-between; gap: 8px; font-size: var(--nu-fs-sm); }
.aqz__aviso-topo span { color: var(--nu-gray); font-weight: 500; }
.aqz__aviso-msg { font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4; }
@keyframes aqz-aviso { from { opacity: 0; transform: translateY(-14px) scale(.98); } }

.aqz__leque { margin-top: 26px; }

/* a montagem */
.aqz__montagem { list-style: none; margin: 28px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.aqz__linha { display: flex; align-items: center; gap: 12px; color: var(--nu-gray); font-size: var(--nu-fs-lg); font-weight: 700; transition: color .3s; }
.aqz__linha--acesa, .aqz__linha--agora { color: var(--nu-ink); }
.aqz__linha-marca { display: grid; place-items: center; width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; box-shadow: inset 0 0 0 2px var(--nu-cream-line); color: var(--nu-white); transition: background .3s, box-shadow .3s; }
.aqz__linha--acesa .aqz__linha-marca { background: var(--nu-green); box-shadow: none; }
.aqz__linha--agora .aqz__linha-marca { box-shadow: inset 0 0 0 2px var(--nu-blue); animation: aqz-pulso 1s ease-in-out infinite; }
@keyframes aqz-pulso { 50% { box-shadow: inset 0 0 0 2px var(--nu-blue), 0 0 0 5px var(--nu-blue-tint); } }

/* o resultado */
.aqz__itens { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.aqz__item { display: flex; gap: 12px; animation: aqz-entra .45s cubic-bezier(.22, 1, .36, 1) backwards; }
.aqz__item:nth-child(2) { animation-delay: .08s; }
.aqz__item:nth-child(3) { animation-delay: .16s; }
.aqz__item:nth-child(4) { animation-delay: .24s; }
.aqz__item-marca { display: grid; place-items: center; width: 24px; height: 24px; flex-shrink: 0; margin-top: 1px; border-radius: 50%; background: var(--nu-green); color: var(--nu-white); }
.aqz__item-t { display: block; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.aqz__item-d { display: block; margin-top: 2px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.aqz__oferta { display: flex; flex-direction: column; gap: 12px; margin-top: 26px; padding: 22px; border-radius: var(--nu-r-card); background: var(--nu-navy); animation: aqz-entra .5s cubic-bezier(.22, 1, .36, 1) .3s backwards; }
.aqz__oferta-selo { align-self: flex-start; padding: 5px 12px; border-radius: var(--nu-r-pill); background: color-mix(in srgb, var(--nu-blue-soft) 18%, transparent); color: var(--nu-blue-soft); font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.aqz__oferta-preco { display: flex; align-items: baseline; gap: 8px; }
.aqz__oferta-preco strong { color: var(--nu-cream-text); font-size: clamp(36px, 5vw, 46px); font-weight: 800; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; line-height: 1; }
.aqz__oferta-preco span { color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 700; }
.aqz__oferta-letra { margin: 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.aqz__erro { margin: 0; color: var(--nu-red-soft); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
@keyframes aqz-entra { from { opacity: 0; transform: translateY(10px); } }

/* as trocas de passo */
.aqz-frente-enter-active, .aqz-frente-leave-active, .aqz-tras-enter-active, .aqz-tras-leave-active { transition: opacity .22s ease, transform .26s cubic-bezier(.22, 1, .36, 1); }
.aqz-frente-enter-from { opacity: 0; transform: translateX(28px); }
.aqz-frente-leave-to { opacity: 0; transform: translateX(-28px); }
.aqz-tras-enter-from { opacity: 0; transform: translateX(-28px); }
.aqz-tras-leave-to { opacity: 0; transform: translateX(28px); }
.aqz-enter-active, .aqz-leave-active { transition: opacity .25s ease; }
.aqz-enter-active .aqz__card, .aqz-leave-active .aqz__card { transition: transform .3s cubic-bezier(.22, 1, .36, 1); }
.aqz-enter-from, .aqz-leave-to { opacity: 0; }
.aqz-enter-from .aqz__card { transform: translateY(24px) scale(.98); }

/* no celular, a tela inteira */
@media (max-width: 640px) {
  .aqz { padding: 0; }
  .aqz__card { width: 100%; height: 100dvh; border-radius: 0; }
  .aqz__grade { grid-template-columns: minmax(0, 1fr); }
  /* os bancos em duas colunas: o nome inteiro vale mais que o visto (a borda azul já marca) */
  .aqz__banco .aqz__marca { display: none; }
  .aqz__banco { gap: 8px; padding-right: 8px; }
  .aqz__banco-nome { font-size: var(--nu-fs-xs); }
  .aqz__cartao { flex-direction: row; padding: 14px 16px; gap: 14px; text-align: left; }
  .aqz__desenho { width: 56px; height: 56px; }
  .aqz__desenho svg { width: 28px; height: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .aqz-frente-enter-active, .aqz-frente-leave-active, .aqz-tras-enter-active, .aqz-tras-leave-active,
  .aqz-enter-active, .aqz-leave-active, .aqz__barra-cheia { transition: none; }
  .aqz__aviso, .aqz__item, .aqz__oferta, .aqz__linha--agora .aqz__linha-marca { animation: none; }
}
</style>
