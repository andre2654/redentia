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
// Robustez (11/11/2026): o véu do contrato (--nu-veu) e o cartão que sobe em
// --nu-dur-lenta; fechar é mais rápido que abrir. O campo tem hover, o anel que
// aperta e o erro no próprio campo; o código é o mesmo do /login (LoginCodigo:
// o número pousa, o erro acena, conferindo respira); o canal do resumo é o
// NuTrilho; os links são NuLinkSeta; o "pronto" é contido (o check de 44px).
// Montada uma vez no layout; quem abre é useCadastroFolha().abrir().
import type { DadosAtivo, DadosResumo } from '~/composables/useCadastroDados'
import type { CadastroFeito } from '~/composables/useCadastroFolha'
import type { AppleCredencial } from '~/composables/useAppleAuth'
import { ICONES } from '~/utils/cadastro'
import LoginCodigo from '~/components/login/LoginCodigo.vue'

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
// de onde veio o erro: só o do contato pinta o campo de vermelho (o da Apple ou
// do Google aparece só na frase)
const erroDoSocial = ref(false)
const campoComErro = computed(() => !!cad.erro.value && !erroDoSocial.value)


/* ——— abrir: zera a folha e busca o dado do herói ——— */
const cardRef = ref<HTMLElement | null>(null)
const campoRef = ref<HTMLInputElement | null>(null)
const codigoRef = ref<{ focar: () => void } | null>(null)
useModalA11y(cardRef, aberto)
const CANAIS = [{ valor: 'whatsapp', rotulo: 'WhatsApp' }, { valor: 'email', rotulo: 'E-mail' }] as const

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
  erroDoSocial.value = false
  const ok = await cad.pedirCodigo(valor.value, voltar.value, isca.value)
  if (!ok) return
  codigo.value = ''
  await nextTick()
  codigoRef.value?.focar()
}

// o sexto número confere sozinho (LoginCodigo emite o código inteiro)
function aoCompletarCodigo(v: string) {
  codigo.value = v
  void confirmarCodigo()
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
  erroDoSocial.value = true
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
                @google="entrarSocial('google', $event)" @apple="entrarSocial('apple', $event)" @error="erroDoSocial = true; cad.erro.value = $event"
              />
              <form class="ncf__form" @submit.prevent="enviarContato">
                <NuTrilho
                  v-if="gesto === 'resumo' && !cad.whatsappFora.value" class="ncf__canais" :model-value="cad.canal.value" :opcoes="CANAIS"
                  rotulo="Onde receber" largo @update:model-value="trocarCanal"
                />
                <label class="ncf__rotulo" for="ncf-contato">{{ ehWhats ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
                <input
                  id="ncf-contato" ref="campoRef" v-model="valor" class="ncf__campo" :class="{ 'ncf__campo--erro': campoComErro }" required
                  :type="ehWhats ? 'tel' : 'email'" :inputmode="ehWhats ? 'tel' : 'email'"
                  :autocomplete="ehWhats ? 'tel-national' : 'email'"
                  :placeholder="ehWhats ? '(11) 90000-0000' : 'seu@email.com'"
                  :aria-invalid="campoComErro" :aria-describedby="cad.erro.value ? 'ncf-erro' : undefined"
                >
                <input v-model="isca" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" class="ncf__isca">
                <NuBotaoSeta type="submit" largo class="ncf__botao" :loading="cad.enviando.value">{{ cad.enviando.value ? 'Enviando…' : texto.botao }}</NuBotaoSeta>
              </form>
              <Transition name="ncf-erro">
                <p v-if="cad.erro.value" id="ncf-erro" class="ncf__erro" role="alert">
                  <svg class="ncf__erro-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
                  <span>{{ cad.erro.value }}</span>
                </p>
              </Transition>
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
              <LoginCodigo ref="codigoRef" class="ncf__codigo" :verifying="cad.enviando.value" :error="cad.erro.value" @submit="aoCompletarCodigo" />
              <!-- a ajuda, o "confirmando" e o erro moram na mesma linha: nada pula -->
              <p class="ncf__nota" aria-live="polite">
                <Transition name="ncf-troca" mode="out-in">
                  <span v-if="cad.erro.value" key="erro" class="ncf__nota-in ncf__nota--erro" role="alert">
                    <svg class="ncf__erro-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
                    <span>{{ cad.erro.value }}</span>
                  </span>
                  <span v-else-if="cad.enviando.value" key="confirmando" class="ncf__nota-in">Confirmando…</span>
                  <span v-else key="ajuda" class="ncf__nota-in">Com os 6 números, a conta é criada e {{ fimDoCodigo }}. Não precisa apertar nada.</span>
                </Transition>
              </p>
              <div class="ncf__links">
                <span v-if="cad.reenviarEm.value > 0" class="ncf__espera">Reenviar em {{ cad.reenviarEm.value }} s</span>
                <NuLinkSeta v-else @click="cad.reenviar(voltar)">Reenviar código</NuLinkSeta>
                <NuLinkSeta tom="tinta" @click="cad.trocarContato()">{{ ehWhats ? 'Trocar o número' : 'Trocar o e-mail' }}</NuLinkSeta>
              </div>
            </template>

            <!-- 3 · pronto: o check se desenha, uma vez -->
            <template v-else>
              <div class="ncf__festa">
                <span class="ncf__check" :class="{ 'ncf__check--aviso': acaoFalhou }" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
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
/* acima do conteúdo e dos modais Nu (9999). O véu do contrato, com o desfoque leve */
.ncf {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 24px 16px;
  background: var(--nu-veu); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) backwards;
}
.ncf__card {
  position: relative; width: min(520px, 100%); max-height: calc(100dvh - 48px); overflow-y: auto; overscroll-behavior: contain;
  background: var(--nu-page); color: var(--nu-ink); border-radius: var(--nu-r-card-lg); box-shadow: var(--nu-shadow-float); outline: none;
  animation: nu-subir var(--nu-dur-lenta) var(--nu-ease-saida) backwards;
}
/* o herói: um cartão carvão dentro do cartão creme, com a luz cobalto no canto
   (raio concêntrico: o do cartão menos a margem de 8px) */
.ncf__heroi {
  position: relative; overflow: hidden; min-height: 200px; margin: 8px 8px 0; border-radius: calc(var(--nu-r-card-lg) - 8px);
  background:
    radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, var(--nu-blue) 46%, transparent) 0%, transparent 62%),
    var(--nu-ink);
}
.ncf__heroi--ceu { background: none; }
.ncf__alca { display: none; }
.ncf__fechar {
  position: absolute; top: 12px; right: 12px; z-index: 1; width: 36px; height: 36px; border-radius: 50%; border: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-white-14); color: var(--nu-white);
  transition: background var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
/* o alvo de toque tem 44px, o círculo fica em 36 */
.ncf__fechar::after { content: ''; position: absolute; inset: -4px; }
.ncf__fechar:hover { background: var(--nu-white-30); }
.ncf__fechar:active { transform: scale(.94); }
.ncf__fechar:focus-visible { outline: 3px solid var(--nu-blue-soft); outline-offset: 2px; }

/* o corpo: 32px dos lados; a troca de etapa sobe com fade */
.ncf__corpo { padding: 24px 32px 24px; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) backwards; }
.ncf__titulo { margin: 16px 0 0; color: var(--nu-ink); font-size: clamp(28px, 3vw, 36px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.04; text-wrap: balance; }
.ncf__apoio { margin: 12px 0 0; color: var(--nu-gray-3); font-size: 17px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; }
.ncf__apoio b { color: var(--nu-ink); font-weight: var(--nu-w-medio); overflow-wrap: anywhere; }
.ncf__linhas { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.ncf__linha { display: flex; gap: 16px; align-items: flex-start; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) backwards; }
.ncf__linha:nth-child(1) { animation-delay: 60ms; }
.ncf__linha:nth-child(2) { animation-delay: 120ms; }
.ncf__linha:nth-child(3) { animation-delay: 180ms; }
.ncf__icone { flex: none; width: 40px; height: 40px; border-radius: var(--nu-r-chip); display: grid; place-items: center; background: var(--nu-blue-bg); color: var(--nu-blue); }
.ncf__linha b { display: block; color: var(--nu-ink); font-size: 16px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.ncf__linha span span { display: block; margin-top: 2px; color: var(--nu-gray); font-size: 14px; font-weight: var(--nu-w-texto); line-height: 1.45; }

.ncf__social { margin-top: 24px; }
.ncf__social :deep(.lab__pilula), .ncf__social :deep(.lgb__pilula) { min-height: 56px; font-size: 16px; }
.ncf__social + .ncf__form { margin-top: 16px; }
.ncf__form { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 24px; }
.ncf__canais { margin-bottom: 8px; }
.ncf__rotulo { font-size: 14px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
/* o campo da Aportou: hover escurece a borda; o foco acende o anel de 3px, que aperta de 4 para 1px */
.ncf__campo {
  width: 100%; height: 56px; box-sizing: border-box; padding: 0 18px; border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: 17px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  outline: 3px solid transparent; outline-offset: 4px;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), outline-color var(--nu-dur-rapida) var(--nu-ease-cor), outline-offset var(--nu-dur-media) var(--nu-ease-saida);
}
.ncf__campo::placeholder { color: var(--nu-placeholder); }
.ncf__campo:hover { border-color: color-mix(in srgb, var(--nu-borda-campo), var(--nu-ink) 30%); }
.ncf__campo:focus { outline-color: var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.ncf__campo--erro, .ncf__campo--erro:hover { border-color: var(--nu-red); }
.ncf__campo--erro:focus { border-color: var(--nu-red); outline-color: var(--nu-red); }
.ncf__botao { margin-top: 8px; }
.ncf__botao--fim { margin-top: 24px; }
.ncf__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
/* o erro: a frase com o ícone, no vermelho, logo abaixo do botão */
.ncf__erro { display: flex; align-items: flex-start; gap: 6px; margin: 12px 0 0; color: var(--nu-red-text); font-size: 14px; font-weight: var(--nu-w-medio); line-height: 1.45; }
.ncf__erro-icone { flex: none; margin-top: 1px; }
.ncf-erro-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-saida), transform var(--nu-dur-media) var(--nu-ease-saida); }
.ncf-erro-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.ncf-erro-enter-from { opacity: 0; transform: translateY(-3px); }
.ncf-erro-leave-to { opacity: 0; }
.ncf__aceite { margin: 16px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.5; }
.ncf__aceite a { color: inherit; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ncf__aceite a:hover { color: var(--nu-ink); }
.ncf__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap;
  margin-top: 16px; padding-top: 8px; border-top: 1px solid var(--nu-line-2);
  color: var(--nu-gray); font-size: 14px; font-weight: var(--nu-w-texto);
}
.ncf__pe a {
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio);
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.ncf__pe a:hover { color: var(--nu-blue-deep); }
.ncf__agora-nao {
  min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-gray-3); font: inherit; font-weight: var(--nu-w-medio);
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-rapida) var(--nu-ease-cor);
}
.ncf__agora-nao:hover { color: var(--nu-ink); text-decoration-color: currentColor; }
.ncf__agora-nao:active { opacity: .72; }

/* o código: as seis casas do /login (LoginCodigo) */
.ncf__codigo { margin-top: 24px; }
.ncf__nota { margin: 12px 0 0; min-height: 1.45em; color: var(--nu-gray); font-size: 14px; font-weight: var(--nu-w-texto); line-height: 1.45; }
.ncf__nota-in { display: flex; align-items: flex-start; gap: 6px; }
.ncf__nota--erro { color: var(--nu-red-text); font-weight: var(--nu-w-medio); }
.ncf-troca-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-saida), transform var(--nu-dur-media) var(--nu-ease-saida); }
.ncf-troca-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.ncf-troca-enter-from { opacity: 0; transform: translateY(-3px); }
.ncf-troca-leave-to { opacity: 0; }
.ncf__links { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0 24px; min-height: 44px; margin-top: 16px; font-size: 15px; }
.ncf__espera { color: var(--nu-gray); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }

/* pronto: o check verde se desenha (uma vez) e o eyebrow diz o que aconteceu */
.ncf__festa { display: flex; align-items: center; gap: 12px; }
.ncf__check {
  flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-green-bg); color: var(--nu-green-text);
  animation: ncf-pousa var(--nu-dur-lenta) var(--nu-ease-saida) backwards;
}
.ncf__check--aviso { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.ncf__check path { stroke-dasharray: 1; stroke-dashoffset: 0; animation: ncf-desenha var(--nu-dur-lenta) var(--nu-ease-troca) 160ms backwards; }
@keyframes ncf-pousa { from { opacity: 0; transform: scale(.86); } }
@keyframes ncf-desenha { from { stroke-dashoffset: 1; } }

/* fechar: o inverso, mais rápido que abrir (entrar é a animação do próprio cartão) */
.ncf-leave-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.ncf-leave-active .ncf__card { transition: transform var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-media) var(--nu-ease-cor); }
.ncf-leave-to { opacity: 0; }
.ncf-leave-to .ncf__card { transform: translateY(8px) scale(.99); opacity: 0; }

/* celular: a folha sobe do pé, com a alça */
@media (max-width: 760px) {
  .ncf { align-items: flex-end; padding: 0; }
  .ncf__card {
    width: 100%; max-height: 92dvh; border-radius: var(--nu-r-card) var(--nu-r-card) 0 0; padding-bottom: env(safe-area-inset-bottom);
    animation: ncf-sobe var(--nu-dur-lenta) var(--nu-ease-saida) backwards;
  }
  .ncf__alca { display: block; width: 40px; height: 4px; margin: 8px auto 0; border-radius: var(--nu-r-pill); background: var(--nu-line); }
  .ncf__heroi { margin: 8px 8px 0; border-radius: calc(var(--nu-r-card) - 8px); }
  .ncf__corpo { padding: 24px 24px 24px; }
  .ncf-leave-to .ncf__card { transform: translateY(100%); opacity: 1; }
}
@keyframes ncf-sobe { from { transform: translateY(100%); } }
@media (prefers-reduced-motion: reduce) {
  .ncf, .ncf__card, .ncf__corpo, .ncf__linha, .ncf__check, .ncf__check path { animation: none; }
  .ncf-leave-active .ncf__card { transition: none; }
}
</style>
