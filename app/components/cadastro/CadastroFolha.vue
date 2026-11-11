<script setup lang="ts">
// A folha de cadastro (canvas "Cadastro sem muro", aprovado pelo dono em
// 21/10/2026). Quem clica em algo que pede conta não vai mais para o /login:
// sobe esta folha com o que a pessoa pediu já funcionando (o herói, com dado
// real), três motivos e o campo do e-mail (ou do WhatsApp, no resumo). O
// código de 6 números chega na mesma folha; confirmado, a conta é criada, a
// ação do gatilho roda sozinha. As duas perguntas do onboarding (objetivo e
// experiência) saíram em 02/11/2026, a pedido do dono: o quiz da assinatura
// já pergunta o que importa.
// No computador é um cartão no centro; no celular, uma folha que sobe do pé.
// Em 11/11/2026 vestiu a Aportou: cartão creme, o herói num cartão carvão, o
// eyebrow com o corte, campo de 56px, a pílula com a seta e, no fim, um check
// que se desenha.
// Montada uma vez no layout; quem abre é useCadastroFolha().abrir().
import type { DadosAtivo, DadosResumo } from '~/composables/useCadastroDados'
import type { CadastroFeito } from '~/composables/useCadastroFolha'
import type { AppleCredencial } from '~/composables/useAppleAuth'
import { ICONES } from '~/utils/cadastro'

const { aberta, fechar: fecharFolha } = useCadastroFolha()
const cad = useCadastroInline()
const dados = useCadastroDados()

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

const ativo = ref<DadosAtivo | null>(null)
const resumo = ref<DadosResumo | null>(null)

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
  cad.trocarContato()
  cad.canal.value = gesto.value === 'resumo' ? 'whatsapp' : 'email'
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

// Só no dev (como o ?entrar-estado= do /login): ?folha-estado=codigo|pronto|falhou
// mostra as etapas que só existem depois de um request, sem request nenhum.
if (import.meta.dev) {
  const forcar = String(useRoute().query['folha-estado'] ?? '')
  watch(aberto, async (a) => {
    if (!a || !forcar) return
    await nextTick()
    await nextTick()
    cad.contato.value = 'voce@email.com'
    if (forcar === 'codigo') cad.etapa.value = 'codigo'
    if (forcar === 'pronto' || forcar === 'falhou') {
      feito.value = { canal: 'email', novaConta: true, contato: 'voce@email.com' }
      acaoFalhou.value = forcar === 'falhou'
      finalizado.value = true
    }
  })
}

function fechar() {
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

/* ——— código → conta → ação ———
 * (o onboarding de objetivo e experiência saiu em 02/11/2026: o quiz da
 * assinatura já pergunta o que importa) */
async function confirmarCodigo() {
  const f = await cad.confirmar(codigo.value)
  if (!f) {
    codigo.value = ''
    return
  }
  await contaFeita(f)
}

// Google ou Apple: a conta nasce sem código e segue o mesmo fim
async function entrarSocial(provedor: 'google' | 'apple', credencial: string | AppleCredencial) {
  const f = await cad.entrarSocial(provedor, credencial)
  if (f) await contaFeita(f)
}

async function contaFeita(f: CadastroFeito) {
  feito.value = f
  eventoCadastro('cadastro_folha_conta', { gesto: gesto.value, canal: f.canal, nova: f.novaConta })
  try {
    acaoFalhou.value = (await aberta.value?.acao(f)) === false
  }
  catch {
    acaoFalhou.value = true
  }
  finalizado.value = true
}

async function concluir() {
  const depois = aberta.value?.depois
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
  carteira: 'você segue para conectar a carteira',
  pergunta: 'a pergunta segue para a Aportou',
}[gesto.value]))

const pronto = computed(() => {
  const f = feito.value
  const onde = f ? (f.canal === 'whatsapp' ? 'no seu WhatsApp' : f.contato ? `em ${f.contato}` : 'no seu e-mail') : ''
  if (acaoFalhou.value) {
    return { titulo: 'Sua conta está criada.', linha: 'Só não conseguimos terminar o que você pediu agora. Tente de novo na página.' }
  }
  return {
    seguir: { titulo: `Pronto. Você segue ${ticker.value}.`, linha: `O resumo das 19h chega ${onde}, no fim de cada pregão.` },
    resumo: { titulo: 'Pronto. O resumo chega às 7h30.', linha: `A partir do próximo dia útil, ${onde}.` },
    simulacao: { titulo: 'Pronto. A conta está guardada.', linha: 'Ela fica no Histórico desta calculadora, pronta para reabrir.' },
    aposentadoria: { titulo: 'Pronto. A conta está guardada.', linha: 'Ela fica no Histórico desta calculadora, pronta para reabrir.' },
    conta: { titulo: 'Pronto. A conta está guardada.', linha: 'Ela fica no Histórico desta calculadora, pronta para reabrir.' },
    carteira: { titulo: 'Pronto. Agora é conectar.', linha: 'Na sua carteira, toque em "Conectar pelo Open Finance" e autorize no app do seu banco.' },
    pergunta: { titulo: 'Pronto. Sua conta está criada.', linha: 'A pergunta segue guardada. Continue para a Aportou responder.' },
  }[gesto.value]
})
const botaoFinal = computed(() => (gesto.value === 'carteira' ? 'Ir para a carteira' : 'Continuar'))
const linkLogin = computed(() => `/login?redirect=${encodeURIComponent(voltar.value)}`)
// com Apple ou Google na folha, o rodapé só aponta o celular
const socialNaFolha = !!(useGoogleAuth().clientId || useAppleAuth().clientId)
// o eyebrow de cada etapa (Aportou, 11/11/2026): diz o que a folha pede e, no fim, o que aconteceu
const eyebrow = computed(() => {
  if (etapa.value === 'codigo') return 'Código'
  if (etapa.value === 'pronto') return feito.value?.novaConta === false ? 'Você entrou' : 'Conta criada'
  return 'Conta grátis'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ncf">
      <div v-if="aberta" class="ncf" @click.self="fechar">
        <section
          ref="cardRef" class="ncf__card" role="dialog" aria-modal="true" aria-labelledby="ncf-titulo"
          tabindex="-1" @keydown.esc="fechar"
        >
          <span class="ncf__alca" aria-hidden="true" />
          <div class="ncf__heroi" :class="{ 'ncf__heroi--ceu': gesto === 'resumo' }">
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
            <CadastroHeroiCarteira v-else-if="ctx?.gesto === 'carteira'" :pronta="etapa === 'pronto' && !acaoFalhou" />
            <CadastroHeroiPergunta v-else-if="ctx?.gesto === 'pergunta'" :pergunta="ctx.pergunta" />
            <button type="button" class="ncf__fechar" aria-label="Fechar" @click="fechar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div :key="etapa" class="ncf__corpo">
            <!-- 1 · o contato -->
            <template v-if="etapa === 'contato'">
              <NuEyebrow>{{ eyebrow }}</NuEyebrow>
              <h2 id="ncf-titulo" class="ncf__titulo">{{ texto.titulo }}</h2>
              <p class="ncf__apoio">{{ texto.apoio }}</p>
              <ul class="ncf__linhas">
                <li v-for="l in texto.linhas" :key="l.titulo" class="ncf__linha">
                  <span class="ncf__icone"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in ICONES[l.icone]" :key="d" :d="d" /></svg></span>
                  <span><b>{{ l.titulo }}</b><span>{{ l.texto }}</span></span>
                </li>
              </ul>

              <LoginSocial
                v-if="!ehWhats" class="ncf__social" divisor="ou com o e-mail" :disabled="cad.enviando.value"
                @google="entrarSocial('google', $event)" @apple="entrarSocial('apple', $event)" @error="cad.erro.value = $event"
              />
              <form class="ncf__form" @submit.prevent="enviarContato">
                <div v-if="gesto === 'resumo' && !cad.whatsappFora.value" class="ncf__canais" role="radiogroup" aria-label="Onde receber">
                  <button type="button" role="radio" :aria-checked="ehWhats" class="ncf__canal" :class="{ 'ncf__canal--on': ehWhats }" @click="trocarCanal('whatsapp')">WhatsApp</button>
                  <button type="button" role="radio" :aria-checked="!ehWhats" class="ncf__canal" :class="{ 'ncf__canal--on': !ehWhats }" @click="trocarCanal('email')">E-mail</button>
                </div>
                <label class="ncf__rotulo" for="ncf-contato">{{ ehWhats ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
                <input
                  id="ncf-contato" ref="campoRef" v-model="valor" class="ncf__campo" required
                  :type="ehWhats ? 'tel' : 'email'" :inputmode="ehWhats ? 'tel' : 'email'"
                  :autocomplete="ehWhats ? 'tel-national' : 'email'"
                  :placeholder="ehWhats ? '(11) 90000-0000' : 'seu@email.com'"
                >
                <input v-model="isca" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" class="ncf__isca">
                <NuBotaoSeta type="submit" largo class="ncf__botao" :loading="cad.enviando.value">{{ cad.enviando.value ? 'Enviando…' : texto.botao }}</NuBotaoSeta>
              </form>
              <p v-if="cad.erro.value" class="ncf__erro" role="alert">{{ cad.erro.value }}</p>
              <p class="ncf__aceite">Grátis, sem cartão. Mandamos um código de 6 números para confirmar {{ ehWhats ? 'o número' : 'o e‑mail' }}. {{ texto.aceite }} <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink></p>
              <div class="ncf__pe">
                <button type="button" class="ncf__agora-nao" @click="fechar">Agora não</button>
                <!-- no resumo o WhatsApp já está no seletor: sobra só quem já tem conta -->
                <span v-if="gesto === 'resumo'">Já tem conta? <NuxtLink :to="linkLogin" @click="fechar">Entrar</NuxtLink></span>
                <span v-else-if="socialNaFolha">Ou entre com o <NuxtLink :to="linkLogin" @click="fechar">celular</NuxtLink></span>
                <span v-else>Ou entre com <NuxtLink :to="linkLogin" @click="fechar">Google</NuxtLink> ou <NuxtLink :to="linkLogin" @click="fechar">celular</NuxtLink></span>
              </div>
            </template>

            <!-- 2 · o código, na mesma folha -->
            <template v-else-if="etapa === 'codigo'">
              <NuEyebrow>{{ eyebrow }}</NuEyebrow>
              <h2 id="ncf-titulo" class="ncf__titulo">Digite o código.</h2>
              <p class="ncf__apoio">Enviamos 6 números {{ ehWhats ? 'pelo WhatsApp para' : 'para' }} <b>{{ cad.contato.value }}</b>. Eles valem 10 minutos.</p>
              <div class="ncf__codigo" @click="codigoRef?.focus()">
                <span
                  v-for="i in 6" :key="i" class="ncf__digito"
                  :class="{ 'ncf__digito--vez': codigo.length === i - 1 && !cad.enviando.value, 'ncf__digito--cheio': !!codigo[i - 1] }"
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

            <!-- 3 · pronto: o check se desenha, uma vez -->
            <template v-else>
              <div class="ncf__festa">
                <span class="ncf__check" :class="{ 'ncf__check--aviso': acaoFalhou }" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                <NuEyebrow>{{ eyebrow }}</NuEyebrow>
              </div>
              <h2 id="ncf-titulo" class="ncf__titulo">{{ pronto.titulo }}</h2>
              <p class="ncf__apoio">{{ pronto.linha }}</p>
              <NuBotaoSeta largo class="ncf__botao ncf__botao--fim" @click="concluir">{{ botaoFinal }}</NuBotaoSeta>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* acima do conteúdo e dos modais Nu (9999) */
.ncf {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 24px 16px;
  background: color-mix(in srgb, var(--nu-ink) 58%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: nu-surgir .2s ease backwards;
}
.ncf__card {
  position: relative; width: min(520px, 100%); max-height: calc(100dvh - 48px); overflow-y: auto; overscroll-behavior: contain;
  background: var(--nu-page); color: var(--nu-ink); border-radius: var(--nu-r-card-lg); box-shadow: var(--nu-shadow-escuro); outline: none;
  animation: nu-subir .32s cubic-bezier(.2, .8, .2, 1) backwards;
}
/* o herói: um cartão carvão dentro do cartão creme, com a luz cobalto no canto */
.ncf__heroi {
  position: relative; overflow: hidden; min-height: 200px; margin: 10px 10px 0; border-radius: 22px;
  background:
    radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, var(--nu-blue) 46%, transparent) 0%, transparent 62%),
    var(--nu-ink);
}
.ncf__heroi--ceu { background: none; }
.ncf__alca { display: none; }
.ncf__fechar {
  position: absolute; top: 12px; right: 12px; z-index: 1; width: 36px; height: 36px; border-radius: 50%; border: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-white-14); color: var(--nu-white);
  transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
/* o alvo de toque tem 44px, o círculo fica em 36 */
.ncf__fechar::after { content: ''; position: absolute; inset: -4px; }
.ncf__fechar:hover { background: var(--nu-white-30); }
.ncf__fechar:active { transform: scale(.94); }
.ncf__fechar:focus-visible { outline: 3px solid var(--nu-blue-soft); outline-offset: 2px; }

.ncf__corpo { padding: 26px 34px 24px; animation: nu-fade .35s cubic-bezier(.2, .8, .2, 1) backwards; }
.ncf__titulo { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(28px, 3vw, 36px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance; }
.ncf__apoio { margin: 10px 0 0; color: var(--nu-gray-3); font-size: 17px; font-weight: 500; line-height: 1.45; }
.ncf__apoio b { color: var(--nu-ink); font-weight: 700; overflow-wrap: anywhere; }
.ncf__linhas { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.ncf__linha { display: flex; gap: 14px; align-items: flex-start; animation: nu-fade .4s ease backwards; }
.ncf__linha:nth-child(2) { animation-delay: 60ms; }
.ncf__linha:nth-child(3) { animation-delay: 120ms; }
.ncf__icone { flex: none; width: 38px; height: 38px; border-radius: var(--nu-r-chip); display: grid; place-items: center; background: var(--nu-blue-bg); color: var(--nu-blue); }
.ncf__linha b { display: block; color: var(--nu-ink); font-size: 16px; font-weight: 700; }
.ncf__linha span span { display: block; margin-top: 2px; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.4; }

.ncf__social { margin-top: 24px; }
.ncf__social :deep(.lab__pilula), .ncf__social :deep(.lgb__pilula) { min-height: 56px; font-size: 17px; }
.ncf__social + .ncf__form { margin-top: 18px; }
.ncf__form { position: relative; display: flex; flex-direction: column; gap: 7px; margin-top: 24px; }
.ncf__canais { display: flex; padding: 4px; margin-bottom: 8px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); }
.ncf__canal {
  flex: 1; min-height: 44px; border: 0; border-radius: var(--nu-r-pill); background: transparent; cursor: pointer;
  color: var(--nu-gray); font: inherit; font-size: 15px; font-weight: 700; transition: background .2s, color .2s;
}
.ncf__canal--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-quente); }
.ncf__rotulo { font-size: 15px; font-weight: 700; }
.ncf__campo {
  width: 100%; height: 56px; box-sizing: border-box; padding: 0 18px; border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: 17px; font-weight: 500; transition: border-color .2s;
}
.ncf__campo::placeholder { color: var(--nu-placeholder); }
.ncf__campo:focus { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.ncf__botao { margin-top: 9px; }
.ncf__botao--fim { margin-top: 26px; }
.ncf__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.ncf__erro { margin: 12px 0 0; color: var(--nu-red-text); font-size: 14.5px; font-weight: 700; }
.ncf__aceite { margin: 14px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.5; }
.ncf__aceite a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.ncf__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap;
  margin-top: 14px; padding-top: 8px; border-top: 1.5px solid var(--nu-line-2);
  color: var(--nu-gray); font-size: 15px; font-weight: 500;
}
.ncf__pe a { color: var(--nu-blue-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.ncf__agora-nao {
  min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-gray-3); font: inherit; font-weight: 700;
  transition: color .2s;
}
.ncf__agora-nao:hover { color: var(--nu-ink); text-decoration: underline; text-underline-offset: 3px; }

/* o código: as seis casas na linguagem do campo */
.ncf__codigo { position: relative; display: flex; gap: 8px; margin-top: 24px; cursor: text; }
.ncf__digito {
  flex: 1; min-width: 0; height: 64px; box-sizing: border-box; display: grid; place-items: center; border-radius: var(--nu-r-input);
  background: var(--nu-white); border: 1.5px solid var(--nu-borda-campo);
  color: var(--nu-ink); font-size: clamp(26px, 7vw, 32px); font-weight: 800; font-variant-numeric: tabular-nums; transition: border-color .2s;
}
.ncf__digito--cheio { border-color: var(--nu-ink); }
.ncf__digito--vez { border-color: var(--nu-blue); outline: 3px solid var(--nu-blue); outline-offset: 1px; }
/* o campo de verdade fica por cima das caixas, invisível: teclado, colar e o código do SMS/e-mail funcionam */
.ncf__codigo-campo {
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.01; border: 0; outline: none;
  font-size: 16px; color: transparent; background: transparent; caret-color: transparent; letter-spacing: 2em;
}
.ncf__nota { margin: 14px 0 0; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.45; }
.ncf__links { display: flex; flex-wrap: wrap; gap: 0 22px; margin-top: 12px; }
.ncf__links button {
  min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-size: 15px; font-weight: 700;
  text-decoration: underline; text-underline-offset: 3px;
}
.ncf__links button:disabled { color: var(--nu-gray); cursor: default; text-decoration: none; }

/* pronto: o check verde se desenha (uma vez) e o eyebrow diz o que aconteceu */
.ncf__festa { display: flex; align-items: center; gap: 14px; }
.ncf__check {
  flex: none; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-green-bg); color: var(--nu-green-text);
  animation: ncf-pousa .45s cubic-bezier(.2, .8, .2, 1) backwards;
}
.ncf__check--aviso { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.ncf__check path { stroke-dasharray: 1; stroke-dashoffset: 0; animation: ncf-desenha .5s cubic-bezier(.65, 0, .35, 1) .2s backwards; }
@keyframes ncf-pousa { from { opacity: 0; transform: scale(.6); } }
@keyframes ncf-desenha { from { stroke-dashoffset: 1; } }

/* fechar: o inverso, em 0,18s (entrar é a animação do próprio cartão) */
.ncf-leave-active { transition: opacity .18s ease; }
.ncf-leave-active .ncf__card { transition: transform .18s ease; }
.ncf-leave-to { opacity: 0; }
.ncf-leave-to .ncf__card { transform: translateY(14px) scale(.985); }

/* celular: a folha sobe do pé, com a alça */
@media (max-width: 760px) {
  .ncf { align-items: flex-end; padding: 0; }
  .ncf__card {
    width: 100%; max-height: 92dvh; border-radius: 28px 28px 0 0; padding-bottom: env(safe-area-inset-bottom);
    animation: ncf-sobe .36s cubic-bezier(.2, .8, .2, 1) backwards;
  }
  .ncf__alca { display: block; width: 40px; height: 5px; margin: 8px auto 0; border-radius: var(--nu-r-pill); background: var(--nu-line); }
  .ncf__heroi { margin: 8px 8px 0; border-radius: 20px; }
  .ncf__corpo { padding: 22px 22px 24px; }
  .ncf-leave-to .ncf__card { transform: translateY(100%); }
}
@keyframes ncf-sobe { from { transform: translateY(100%); } }
@media (prefers-reduced-motion: reduce) {
  .ncf, .ncf__card, .ncf__corpo, .ncf__linha, .ncf__check, .ncf__check path { animation: none; }
  .ncf-leave-active .ncf__card { transition: none; }
}
</style>
