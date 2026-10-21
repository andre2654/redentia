<script setup lang="ts">
// A folha de cadastro (canvas "Cadastro sem muro", aprovado pelo dono em
// 21/10/2026). Quem clica em algo que pede conta não vai mais para o /login:
// sobe esta folha com o que a pessoa pediu já funcionando (o herói, com dado
// real), três motivos e o campo do e-mail (ou do WhatsApp, no resumo). O
// código de 6 números chega na mesma folha; confirmado, a conta é criada, a
// ação do gatilho roda sozinha e, se a conta é nova, as duas perguntas do
// onboarding obrigatório vêm aqui mesmo, sem um segundo modal por cima.
// No computador é um cartão no centro; no celular, uma folha que sobe do pé.
// Montada uma vez no layout; quem abre é useCadastroFolha().abrir().
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'
import type { DadosAtivo, DadosResumo } from '~/composables/useCadastroDados'
import type { CadastroFeito } from '~/composables/useCadastroFolha'
import type { CadastroIcone } from '~/utils/cadastro'

const { aberta, fechar: fecharFolha } = useCadastroFolha()
const cad = useCadastroInline()
const dados = useCadastroDados()
const { authFetch } = useApi()
const meCliente = useMeCliente()
// o onboarding obrigatório espera a folha (NuOnboardingModal)
const naFolha = useState<boolean>('nu:onb-na-folha', () => false)
const gate = useState<'unknown' | 'needed' | 'done'>('nu:onb-gate', () => 'unknown')

const ctx = computed(() => aberta.value?.contexto ?? null)
const gesto = computed(() => ctx.value?.gesto ?? 'pergunta')
const aberto = computed(() => !!aberta.value)
const voltar = computed(() => aberta.value?.voltar ?? '/')
const ticker = computed(() => (ctx.value?.gesto === 'seguir' ? ctx.value.ticker.toUpperCase() : ''))

// contato e código são do cadastro (useCadastroInline); "pronto" é da folha
const finalizado = ref(false)
const etapa = computed(() => (finalizado.value ? 'pronto' : cad.etapa.value))
const valor = ref('')
const codigo = ref('')
/** isca para robô: gente não vê nem preenche */
const isca = ref('')
const feito = ref<CadastroFeito | null>(null)
const acaoFalhou = ref(false)
/** onboarding obrigatório: null = não precisa; depois o passo em que está */
const onboarding = ref<null | 'objetivo' | 'experiencia'>(null)
const objetivo = ref<string | null>(null)
const salvando = ref(false)
const erroOnboarding = ref('')

const ativo = ref<DadosAtivo | null>(null)
const resumo = ref<DadosResumo | null>(null)
const OBJETIVOS = ONBOARDING_OBJETIVOS
const EXPERIENCIAS = ONBOARDING_EXPERIENCIAS

const texto = computed(() => {
  const c = ctx.value
  return textoDoGesto(gesto.value, {
    ticker: ticker.value,
    minutos: resumo.value?.minutos,
    aposentaAos: c?.gesto === 'aposentadoria' ? c.aposentaAos : undefined,
    mensal: c?.gesto === 'simulacao' ? c.mensal : undefined,
    pergunta: c?.gesto === 'conta' ? c.pergunta : undefined,
  })
})
const ehWhats = computed(() => cad.canal.value === 'whatsapp')

const ICONES: Record<CadastroIcone, string[]> = {
  envelope: ['M5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9A2.5 2.5 0 0 1 5.5 5z', 'M3.5 7l8.5 6 8.5-6'],
  jornal: ['M5 4h11a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2z', 'M7 9h8M7 13h8M7 17h5'],
  calendario: ['M6 5h12a2.5 2.5 0 0 1 2.5 2.5v10A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-10A2.5 2.5 0 0 1 6 5z', 'M3.5 10h17M8 3v4M16 3v4'],
  relogio: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', 'M12 7.5V12l3 2'],
  conversa: ['M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z'],
  carteira: ['M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z', 'M15 3.8A8.5 8.5 0 0 1 20.2 9H15z'],
  marcador: ['M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1z'],
  ajuste: ['M4 7h10M18 7h2M4 17h4M12 17h8', 'M16 4.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z', 'M10 14.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z'],
  brilho: ['M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z', 'M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z'],
  grafico: ['M4 19h16', 'M5 15l4-4 3 3 6-7'],
  historico: ['M4 12a8 8 0 1 0 2.4-5.7', 'M4 4v4h4', 'M12 8v4l3 2'],
}

/* ——— abrir: zera a folha e busca o dado do herói ——— */
const cardRef = ref<HTMLElement | null>(null)
const campoRef = ref<HTMLInputElement | null>(null)
const codigoRef = ref<HTMLInputElement | null>(null)
useModalA11y(cardRef, aberto)

watch(() => aberta.value?.id, async (id) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = id ? 'hidden' : ''
  if (!id) return
  finalizado.value = false
  valor.value = ''
  codigo.value = ''
  isca.value = ''
  feito.value = null
  acaoFalhou.value = false
  onboarding.value = null
  objetivo.value = null
  erroOnboarding.value = ''
  cad.trocarContato()
  cad.canal.value = gesto.value === 'resumo' ? 'whatsapp' : 'email'
  naFolha.value = true
  ativo.value = null
  resumo.value = null
  await nextTick()
  campoRef.value?.focus()
  const c = aberta.value?.contexto
  if (!c) return
  if (c.gesto === 'resumo') void cad.conferirCanais()
  if (c.gesto === 'seguir') {
    const d = await dados.ativo(c.ticker)
    if (aberta.value?.id === id) ativo.value = d
  }
  if (c.gesto === 'resumo') {
    const d = await dados.resumo()
    if (aberta.value?.id === id) resumo.value = d
  }
})

function fechar() {
  // fechar no meio vale: sem as respostas, o onboarding obrigatório volta a valer
  naFolha.value = false
  fecharFolha()
}

function trocarCanal(c: 'email' | 'whatsapp') {
  if (cad.canal.value === c) return
  cad.canal.value = c
  valor.value = ''
  cad.erro.value = null
  void nextTick(() => campoRef.value?.focus())
}

/* ——— contato → código ——— */
async function enviarContato() {
  const ok = await cad.pedirCodigo(valor.value, voltar.value, isca.value)
  if (!ok) return
  codigo.value = ''
  await nextTick()
  codigoRef.value?.focus()
}

function aoDigitarCodigo(e: Event) {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
  codigo.value = v
  if (v.length === 6) void confirmarCodigo()
}

/* ——— código → conta → ação → onboarding ——— */
async function precisaDoOnboarding(): Promise<boolean> {
  const me = await meCliente.load()
  if (!me?.user || me.user.investor_goal) return false
  try {
    const biz = await authFetch<BusinessAccountStatus>('/me/business', {}, { redirectOnAuthError: false })
    return !biz?.has_account
  }
  catch {
    return false
  }
}

async function confirmarCodigo() {
  const f = await cad.confirmar(codigo.value)
  if (!f) {
    codigo.value = ''
    return
  }
  feito.value = f
  eventoCadastro('cadastro_folha_conta', { gesto: gesto.value, canal: f.canal, nova: f.novaConta })
  try {
    acaoFalhou.value = (await aberta.value?.acao(f)) === false
  }
  catch {
    acaoFalhou.value = true
  }
  onboarding.value = (await precisaDoOnboarding()) ? 'objetivo' : null
  finalizado.value = true
}

function escolherObjetivo(v: string) {
  objetivo.value = v
  onboarding.value = 'experiencia'
}

async function escolherExperiencia(v: string) {
  if (salvando.value) return
  salvando.value = true
  erroOnboarding.value = ''
  try {
    await authFetch('/auth/profile', { method: 'PUT', body: { investor_goal: objetivo.value, investor_experience: v } }, { redirectOnAuthError: false })
    gate.value = 'done'
    onboarding.value = null
  }
  catch {
    erroOnboarding.value = 'Não conseguimos salvar agora. Confira sua conexão e toque de novo na opção.'
  }
  finally {
    salvando.value = false
  }
}

async function concluir() {
  const depois = aberta.value?.depois
  naFolha.value = false
  fecharFolha()
  await depois?.()
}

/* ——— textos de cada etapa ——— */
const fimDoCodigo = computed(() => ({
  seguir: `${ticker.value} fica seguida`,
  resumo: 'o resumo fica ligado',
  simulacao: 'a conta fica guardada',
  aposentadoria: 'a conta fica guardada',
  conta: 'a conta fica guardada',
  pergunta: 'a pergunta segue para a Redentia',
}[gesto.value]))

const pronto = computed(() => {
  const f = feito.value
  const onde = f ? (f.canal === 'whatsapp' ? 'no seu WhatsApp' : `em ${f.contato}`) : ''
  if (acaoFalhou.value) {
    return { titulo: 'Sua conta está criada.', linha: 'Só não conseguimos terminar o que você pediu agora. Tente de novo na página.' }
  }
  return {
    seguir: { titulo: `Pronto. Você segue ${ticker.value}.`, linha: `O resumo das 19h chega ${onde}, no fim de cada pregão.` },
    resumo: { titulo: 'Pronto. O resumo chega às 7h30.', linha: `A partir do próximo dia útil, ${onde}.` },
    simulacao: { titulo: 'Pronto. A conta está guardada.', linha: 'Ela fica no Histórico desta calculadora, pronta para reabrir.' },
    aposentadoria: { titulo: 'Pronto. A conta está guardada.', linha: 'Ela fica no Histórico desta calculadora, pronta para reabrir.' },
    conta: { titulo: 'Pronto. A conta está guardada.', linha: 'Ela fica no Histórico desta calculadora, pronta para reabrir.' },
    pergunta: { titulo: 'Pronto. Sua conta está criada.', linha: 'A resposta abre assim que você continuar.' },
  }[gesto.value]
})
const botaoFinal = computed(() => (gesto.value === 'pergunta' ? 'Ver a resposta' : 'Continuar'))
const linkLogin = computed(() => `/login?redirect=${encodeURIComponent(voltar.value)}`)
</script>

<template>
  <Teleport to="body">
    <Transition name="ncf">
      <div v-if="aberta" class="ncf" @click.self="fechar">
        <section
          ref="cardRef" class="ncf__card" role="dialog" aria-modal="true" aria-labelledby="ncf-titulo"
          tabindex="-1" @keydown.esc="fechar"
        >
          <div class="ncf__heroi" :class="{ 'ncf__heroi--ceu': gesto === 'resumo' }">
            <span class="ncf__alca" aria-hidden="true" />
            <CadastroHeroiAtivo v-if="ctx?.gesto === 'seguir'" :dados="ativo" :seguindo="etapa === 'pronto' && !acaoFalhou" />
            <CadastroHeroiResumo v-else-if="ctx?.gesto === 'resumo'" :frase="resumo?.frase ?? null" />
            <CadastroHeroiSimulacao
              v-else-if="ctx?.gesto === 'simulacao'"
              :conta="{ inicial: ctx.inicial, mensal: ctx.mensal, taxa: ctx.taxa, anos: ctx.anos }"
              :guardada="etapa === 'pronto' && !acaoFalhou"
            />
            <CadastroHeroiAposentadoria
              v-else-if="ctx?.gesto === 'aposentadoria'"
              :conta="{ idade: ctx.idade, aposentaAos: ctx.aposentaAos, total: ctx.total, necessario: ctx.necessario, serie: ctx.serie }"
              :guardada="etapa === 'pronto' && !acaoFalhou"
            />
            <CadastroHeroiConta
              v-else-if="ctx?.gesto === 'conta'"
              :conta="ctx"
              :guardada="etapa === 'pronto' && !acaoFalhou"
            />
            <CadastroHeroiPergunta v-else-if="ctx?.gesto === 'pergunta'" :pergunta="ctx.pergunta" />
            <button type="button" class="ncf__fechar" aria-label="Fechar" @click="fechar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div class="ncf__corpo">
            <!-- 1 · o contato -->
            <template v-if="etapa === 'contato'">
              <h2 id="ncf-titulo" class="ncf__titulo">{{ texto.titulo }}</h2>
              <p class="ncf__apoio">{{ texto.apoio }}</p>
              <ul class="ncf__linhas">
                <li v-for="l in texto.linhas" :key="l.titulo" class="ncf__linha">
                  <span class="ncf__icone"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in ICONES[l.icone]" :key="d" :d="d" /></svg></span>
                  <span><b>{{ l.titulo }}</b><span>{{ l.texto }}</span></span>
                </li>
              </ul>

              <form class="ncf__form" @submit.prevent="enviarContato">
                <div v-if="gesto === 'resumo' && !cad.whatsappFora.value" class="ncf__canais" role="radiogroup" aria-label="Onde receber">
                  <button type="button" role="radio" :aria-checked="ehWhats" class="ncf__canal" :class="{ 'ncf__canal--on': ehWhats }" @click="trocarCanal('whatsapp')">WhatsApp</button>
                  <button type="button" role="radio" :aria-checked="!ehWhats" class="ncf__canal" :class="{ 'ncf__canal--on': !ehWhats }" @click="trocarCanal('email')">E-mail</button>
                </div>
                <label class="ncf__so-leitor" for="ncf-contato">{{ ehWhats ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
                <input
                  id="ncf-contato" ref="campoRef" v-model="valor" class="ncf__campo" required
                  :type="ehWhats ? 'tel' : 'email'" :inputmode="ehWhats ? 'tel' : 'email'"
                  :autocomplete="ehWhats ? 'tel-national' : 'email'"
                  :placeholder="ehWhats ? '(11) 90000-0000' : 'seu@email.com'"
                >
                <input v-model="isca" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" class="ncf__isca">
                <button type="submit" class="ncf__botao" :disabled="cad.enviando.value">{{ cad.enviando.value ? 'Enviando…' : texto.botao }}</button>
              </form>
              <p v-if="cad.erro.value" class="ncf__erro" role="alert">{{ cad.erro.value }}</p>
              <p class="ncf__aceite">Grátis, sem cartão. Mandamos um código de 6 números para confirmar {{ ehWhats ? 'o número' : 'o e‑mail' }}. {{ texto.aceite }} <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink></p>
              <div class="ncf__pe">
                <button type="button" class="ncf__agora-nao" @click="fechar">Agora não</button>
                <!-- no resumo o WhatsApp já está no seletor: sobra só quem já tem conta -->
                <span v-if="gesto === 'resumo'">Já tem conta? <NuxtLink :to="linkLogin" @click="fechar">Entrar</NuxtLink></span>
                <span v-else>Ou entre com <NuxtLink :to="linkLogin" @click="fechar">Google</NuxtLink> ou <NuxtLink :to="linkLogin" @click="fechar">celular</NuxtLink></span>
              </div>
            </template>

            <!-- 2 · o código, na mesma folha -->
            <template v-else-if="etapa === 'codigo'">
              <h2 id="ncf-titulo" class="ncf__titulo">Digite o código.</h2>
              <p class="ncf__apoio">Enviamos 6 números {{ ehWhats ? 'pelo WhatsApp para' : 'para' }} <b>{{ cad.contato.value }}</b>. Eles valem 10 minutos.</p>
              <div class="ncf__codigo" @click="codigoRef?.focus()">
                <span
                  v-for="i in 6" :key="i" class="ncf__digito"
                  :class="{ 'ncf__digito--vez': codigo.length === i - 1 && !cad.enviando.value }"
                >{{ codigo[i - 1] ?? '' }}</span>
                <input
                  ref="codigoRef" class="ncf__codigo-campo" :value="codigo" inputmode="numeric" autocomplete="one-time-code"
                  maxlength="6" aria-label="Código de 6 números" @input="aoDigitarCodigo"
                >
              </div>
              <p v-if="cad.erro.value" class="ncf__erro" role="alert">{{ cad.erro.value }}</p>
              <p v-else class="ncf__nota" aria-live="polite">{{ cad.enviando.value ? 'Confirmando…' : `Com os 6 números, a conta é criada e ${fimDoCodigo}. Não precisa apertar nada.` }}</p>
              <div class="ncf__links">
                <button type="button" :disabled="cad.reenviarEm.value > 0" @click="cad.reenviar(voltar)">{{ cad.reenviarEm.value > 0 ? `Reenviar em ${cad.reenviarEm.value} s` : 'Reenviar código' }}</button>
                <button type="button" @click="cad.trocarContato()">{{ ehWhats ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
              </div>
            </template>

            <!-- 3 · pronto, e o onboarding junto -->
            <template v-else>
              <h2 id="ncf-titulo" class="ncf__titulo">{{ pronto.titulo }}</h2>
              <p class="ncf__apoio">{{ pronto.linha }}</p>
              <div v-if="onboarding" class="ncf__onb">
                <template v-if="onboarding === 'objetivo'">
                  <div class="ncf__onb-titulo">O que te trouxe à Redentia?</div>
                  <div class="ncf__onb-apoio">Uma resposta, e a Redentia se organiza em volta dela.</div>
                  <div class="ncf__opcoes">
                    <button v-for="o in OBJETIVOS" :key="o.value" type="button" class="ncf__opcao" @click="escolherObjetivo(o.value)">{{ o.label }}</button>
                  </div>
                </template>
                <template v-else>
                  <div class="ncf__onb-titulo">Qual sua experiência com investimentos?</div>
                  <div class="ncf__onb-apoio">Ajusta o tom das explicações.</div>
                  <div class="ncf__opcoes ncf__opcoes--tres">
                    <button v-for="o in EXPERIENCIAS" :key="o.value" type="button" class="ncf__opcao" :disabled="salvando" @click="escolherExperiencia(o.value)">{{ salvando ? 'Salvando…' : o.label }}</button>
                  </div>
                  <p v-if="erroOnboarding" class="ncf__erro" role="alert">{{ erroOnboarding }}</p>
                </template>
              </div>
              <button v-else type="button" class="ncf__botao ncf__botao--fim" @click="concluir">{{ botaoFinal }}</button>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* acima do conteúdo e dos modais Nu (9999); abaixo só do onboarding (10000),
   que de todo modo espera a folha fechar */
.ncf {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 24px 16px;
  background: rgba(5, 7, 15, 0.46); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.ncf__card {
  position: relative; width: min(520px, 100%); max-height: calc(100dvh - 48px); overflow-y: auto; overscroll-behavior: contain;
  background: var(--nu-white); border-radius: 28px; box-shadow: 0 40px 90px -30px rgba(5, 10, 25, 0.6); outline: none;
}
.ncf__heroi {
  position: relative; min-height: 200px;
  background: var(--nu-orb-deep) url('/email/brilho.jpg') center top / cover no-repeat;
}
.ncf__heroi--ceu { background: none; }
.ncf__alca { display: none; }
.ncf__fechar {
  position: absolute; top: 14px; right: 14px; z-index: 1; width: 32px; height: 32px; border-radius: 50%; border: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-cream-text-12); color: var(--nu-cream-text-85);
  transition: background .2s, color .2s;
}
.ncf__fechar:hover { background: var(--nu-cream-text-18); color: var(--nu-white); }
.ncf__fechar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

.ncf__corpo { padding: 26px 36px 24px; }
.ncf__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; }
.ncf__apoio { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.ncf__apoio b { color: var(--nu-ink); font-weight: 700; }
.ncf__linhas { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.ncf__linha { display: flex; gap: 14px; align-items: flex-start; }
.ncf__icone { flex: none; width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: var(--nu-cream); color: var(--nu-blue); }
.ncf__linha b { display: block; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.ncf__linha span span { display: block; margin-top: 2px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4; }

.ncf__form { position: relative; display: flex; flex-direction: column; gap: 10px; margin-top: 22px; }
.ncf__canais { display: flex; padding: 4px; border-radius: var(--nu-r-pill); background: var(--nu-cream); }
.ncf__canal {
  flex: 1; height: 38px; border: 0; border-radius: var(--nu-r-pill); background: transparent; cursor: pointer;
  color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
}
.ncf__canal--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 2px 8px -4px rgba(10, 10, 12, 0.3); }
.ncf__campo {
  height: 52px; box-sizing: border-box; padding: 0 22px; border: 1.5px solid var(--nu-cream-line); border-radius: var(--nu-r-pill);
  font: inherit; font-size: var(--nu-fs-md); font-weight: 500; color: var(--nu-ink); outline: none; background: var(--nu-white);
}
.ncf__campo:focus { border-color: var(--nu-blue); }
.ncf__botao {
  height: 52px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); cursor: pointer;
  font: inherit; font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s;
}
.ncf__botao:hover { background: var(--nu-blue-hover); }
.ncf__botao:disabled { opacity: .6; cursor: default; }
.ncf__botao--fim { width: 100%; margin-top: 24px; }
.ncf__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.ncf__so-leitor { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.ncf__erro { margin: 12px 0 0; color: var(--nu-red); font-size: var(--nu-fs-sm); font-weight: 700; }
.ncf__aceite { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; text-align: center; }
.ncf__aceite a { color: inherit; text-decoration: underline; }
.ncf__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--nu-cream-2);
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500;
}
.ncf__pe a { color: var(--nu-blue); font-weight: 700; }
.ncf__agora-nao { padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-gray-2); font: inherit; font-weight: 700; }

.ncf__codigo { position: relative; display: flex; gap: 10px; margin-top: 24px; cursor: text; }
.ncf__digito {
  flex: 1; height: 62px; box-sizing: border-box; display: grid; place-items: center; border-radius: 14px;
  background: var(--nu-cream); border: 2px solid transparent;
  color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; font-variant-numeric: tabular-nums;
}
.ncf__digito--vez { background: var(--nu-white); border-color: var(--nu-blue); }
/* o campo de verdade fica por cima das caixas, invisível: teclado, colar e o código do SMS/e-mail funcionam */
.ncf__codigo-campo {
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.01; border: 0; outline: none;
  font-size: 16px; color: transparent; background: transparent; caret-color: transparent; letter-spacing: 2em;
}
.ncf__nota { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.45; }
.ncf__links { display: flex; gap: 20px; margin-top: 22px; }
.ncf__links button { padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-blue); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; }
.ncf__links button:disabled { color: var(--nu-gray); cursor: default; }

.ncf__onb { margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--nu-cream-2); }
.ncf__onb-titulo { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
.ncf__onb-apoio { margin-top: 4px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ncf__opcoes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.ncf__opcoes--tres { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ncf__opcao {
  min-height: 56px; padding: 10px 14px; border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-tile); background: var(--nu-white);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; text-align: left; cursor: pointer;
  transition: border-color .15s, background .15s;
}
.ncf__opcao:hover { border-color: var(--nu-blue); background: var(--nu-blue-tint-2); }
.ncf__opcao:disabled { opacity: .6; cursor: default; }

/* entrada: o fundo escurece, o cartão sobe */
.ncf-enter-active, .ncf-leave-active { transition: opacity .25s ease; }
.ncf-enter-active .ncf__card, .ncf-leave-active .ncf__card { transition: transform .35s cubic-bezier(.2, .8, .2, 1); }
.ncf-enter-from, .ncf-leave-to { opacity: 0; }
.ncf-enter-from .ncf__card, .ncf-leave-to .ncf__card { transform: translateY(24px); }

/* celular: a folha sobe do pé, com a alça */
@media (max-width: 760px) {
  .ncf { align-items: flex-end; padding: 0; }
  .ncf__card { width: 100%; max-height: 92dvh; border-radius: 28px 28px 0 0; padding-bottom: env(safe-area-inset-bottom); }
  .ncf__alca { display: block; position: absolute; top: 8px; left: 50%; z-index: 1; width: 36px; height: 5px; margin-left: -18px; border-radius: var(--nu-r-pill); background: var(--nu-cream-text-45); }
  .ncf__corpo { padding: 22px 22px 26px; }
  .ncf__opcoes--tres { grid-template-columns: 1fr; }
  .ncf-enter-from .ncf__card, .ncf-leave-to .ncf__card { transform: translateY(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .ncf-enter-active .ncf__card, .ncf-leave-active .ncf__card { transition: none; }
}
</style>
