<script setup lang="ts">
/**
 * Fechamento da /business (#contato). Todos os CTAs da página apontam para cá.
 *
 * Até aqui o botão abria um mailto e nada ficava gravado. O formulário manda
 * POST /api/backend/business/leads (o Laravel, pelo proxy; redentia-api#88).
 * Se o POST não volta 2xx, a seção diz isso e oferece o mailto de
 * relacionamento@redentia.com.br com o que a pessoa preencheu. "Pedido
 * recebido" só aparece depois do await, ou na prévia (`?demo=1` fora de
 * produção), que não chama a rede.
 *
 * Obrigado fica nesta seção, e não em /business/obrigado. Os CTAs são âncoras
 * #contato, e o evento GA4 `business_lead` é a conversão. Uma URL nova só
 * passaria a valer quando o LinkedIn Insight entrar, e isso ficou para depois.
 * Nenhuma tag nova, e GA4/GTM/Clarity existentes não mudam.
 *
 * A foto de fundo saiu: com formulário, texto em cima da imagem não se sustenta.
 * A banda é creme, o cartão é branco, o botão é azul, o texto é navy.
 */
import {
  CONSENT_BEFORE,
  CONSENT_LINK_LABEL,
  EMAIL_RELACIONAMENTO,
  TAMANHOS_DE_MESA,
  TIPOS_DE_CASA,
  capturarAtribuicao,
  demoDeLeadDisponivel,
  dispararEventoBusinessLead,
  emailPessoal,
  falhaDoEnvio,
  mailtoDoPedido,
  montarAtribuicao,
  montarPayload,
  statusDoErro,
  temErro,
  validarLead,
  type AtribuicaoBusiness,
  type ErrosLead,
  type LeadFormulario,
} from '~/utils/business-lead'

const { publicFetch } = useApi()
const route = useRoute()

const name = ref('')
const email = ref('')
const phone = ref('')
const company = ref('')
const firmType = ref('')
const teamSize = ref('')
const message = ref('')
const consent = ref(false)
const website = ref('')

const erros = ref<ErrosLead>({})
const enviando = ref(false)
const estado = ref<'form' | 'ok'>('form')
const falha = ref<ReturnType<typeof falhaDoEnvio> | null>(null)
const okTitulo = ref<HTMLElement | null>(null)

const demo = computed(() => demoDeLeadDisponivel() && route.query.demo === '1')
const avisoEmail = computed(() => emailPessoal(email.value) && !erros.value.email)

function formulario(): LeadFormulario {
  return {
    name: name.value,
    email: email.value,
    phone: phone.value,
    company: company.value,
    firmType: firmType.value,
    teamSize: teamSize.value,
    message: message.value,
    consent: consent.value,
    website: website.value,
  }
}

const mailtoFalha = computed(() => mailtoDoPedido(formulario()))

function atribuicaoDoEnvio(): AtribuicaoBusiness {
  try {
    return capturarAtribuicao(window.sessionStorage, window.location, document.referrer)
  }
  catch {
    return montarAtribuicao(window.location, document.referrer)
  }
}

const FOCO: Record<keyof ErrosLead, string> = {
  name: 'rbct-nome',
  email: 'rbct-email',
  phone: 'rbct-telefone',
  company: 'rbct-empresa',
  firmType: 'rbct-tipo',
  teamSize: 'rbct-tamanho',
  message: 'rbct-mensagem',
  consent: 'rbct-consent',
}

function focarPrimeiro(e: ErrosLead) {
  const ordem = Object.keys(FOCO) as (keyof ErrosLead)[]
  for (const k of ordem) {
    if (e[k]) {
      document.getElementById(FOCO[k])?.focus()
      return
    }
  }
}

async function enviar() {
  if (enviando.value || estado.value === 'ok') return
  const achados = validarLead(formulario())
  erros.value = achados
  falha.value = null
  if (temErro(achados)) {
    focarPrimeiro(achados)
    return
  }

  const payload = montarPayload(formulario(), atribuicaoDoEnvio())
  enviando.value = true
  try {
    // Prévia: o bundle de produção grava o interruptor como false, então
    // este ramo não confirma um pedido no ar. Não dispara o GA4.
    if (demo.value) {
      estado.value = 'ok'
      return
    }
    const signal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(20000) : undefined
    await publicFetch('/business/leads', {
      method: 'POST',
      body: payload,
      signal,
    })
    estado.value = 'ok'
    dispararEventoBusinessLead(payload.firm_type, payload.attribution.utm_source)
  }
  catch (e) {
    falha.value = falhaDoEnvio(statusDoErro(e))
    await nextTick()
    document.getElementById('rbct-falha')?.focus()
  }
  finally {
    enviando.value = false
  }
}

watch(estado, async (v) => {
  if (v !== 'ok') return
  await nextTick()
  okTitulo.value?.focus()
})
</script>

<template>
  <section id="contato" class="rbct">
    <div class="rbct__miolo">
      <div class="rbct__intro">
        <h2 class="rbct__titulo">Uma hora pra saber se dá.</h2>
        <p class="rbct__dek">
          A gente conecta o assistente da mesa e roda uma carteira de vocês num
          cenário. Se não fizer sentido, termina aí.
        </p>
      </div>

      <div v-if="estado === 'ok'" class="rbct__ok" role="status">
        <h3 ref="okTitulo" class="rbct__ok-titulo" tabindex="-1">Pedido recebido.</h3>
        <p class="rbct__ok-texto">
          A gente responde no e-mail que você deixou para marcar a hora.
        </p>
        <p v-if="demo" class="rbct__previa">Prévia deste ambiente: nada saiu daqui.</p>
      </div>

      <form v-else class="rbct__card" novalidate :aria-busy="enviando" @submit.prevent="enviar">
        <div class="rbct__isca" aria-hidden="true">
          <label>
            Site
            <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" autocapitalize="off">
          </label>
        </div>

        <div class="rbct__grade">
          <div class="rbct__campo">
            <label class="rbct__rotulo" for="rbct-nome">Nome</label>
            <input
              id="rbct-nome"
              v-model="name"
              class="rbct__input"
              :class="{ 'rbct__input--erro': erros.name }"
              type="text"
              name="name"
              autocomplete="name"
              maxlength="120"
              required
              aria-required="true"
              :aria-invalid="erros.name ? 'true' : undefined"
              :aria-describedby="erros.name ? 'rbct-nome-erro' : undefined"
              data-clarity-mask="true"
            >
            <p v-if="erros.name" id="rbct-nome-erro" class="rbct__erro">{{ erros.name }}</p>
          </div>

          <div class="rbct__campo">
            <label class="rbct__rotulo" for="rbct-email">E-mail de trabalho</label>
            <input
              id="rbct-email"
              v-model="email"
              class="rbct__input"
              :class="{ 'rbct__input--erro': erros.email }"
              type="email"
              name="email"
              inputmode="email"
              autocomplete="email"
              maxlength="180"
              spellcheck="false"
              required
              aria-required="true"
              :aria-invalid="erros.email ? 'true' : undefined"
              :aria-describedby="[erros.email ? 'rbct-email-erro' : null, avisoEmail ? 'rbct-email-nota' : null].filter(Boolean).join(' ') || undefined"
              data-clarity-mask="true"
            >
            <p v-if="erros.email" id="rbct-email-erro" class="rbct__erro">{{ erros.email }}</p>
            <p v-else-if="avisoEmail" id="rbct-email-nota" class="rbct__nota">
              Este parece um e-mail pessoal. Se tiver o do escritório, a resposta chega melhor.
            </p>
          </div>

          <div class="rbct__campo">
            <label class="rbct__rotulo" for="rbct-telefone">
              Telefone ou WhatsApp <span class="rbct__opc">opcional</span>
            </label>
            <input
              id="rbct-telefone"
              v-model="phone"
              class="rbct__input"
              :class="{ 'rbct__input--erro': erros.phone }"
              type="tel"
              name="phone"
              inputmode="tel"
              autocomplete="tel"
              maxlength="40"
              :aria-invalid="erros.phone ? 'true' : undefined"
              :aria-describedby="erros.phone ? 'rbct-telefone-erro' : undefined"
              data-clarity-mask="true"
            >
            <p v-if="erros.phone" id="rbct-telefone-erro" class="rbct__erro">{{ erros.phone }}</p>
          </div>

          <div class="rbct__campo">
            <label class="rbct__rotulo" for="rbct-empresa">Escritório ou empresa</label>
            <input
              id="rbct-empresa"
              v-model="company"
              class="rbct__input"
              :class="{ 'rbct__input--erro': erros.company }"
              type="text"
              name="organization"
              autocomplete="organization"
              maxlength="160"
              required
              aria-required="true"
              :aria-invalid="erros.company ? 'true' : undefined"
              :aria-describedby="erros.company ? 'rbct-empresa-erro' : undefined"
              data-clarity-mask="true"
            >
            <p v-if="erros.company" id="rbct-empresa-erro" class="rbct__erro">{{ erros.company }}</p>
          </div>

          <div class="rbct__campo">
            <label class="rbct__rotulo" for="rbct-tipo">Tipo de casa</label>
            <div class="rbct__select">
              <select
                id="rbct-tipo"
                v-model="firmType"
                class="rbct__input"
                :class="{ 'rbct__input--vazio': !firmType, 'rbct__input--erro': erros.firmType }"
                name="firm_type"
                required
                aria-required="true"
                :aria-invalid="erros.firmType ? 'true' : undefined"
                :aria-describedby="erros.firmType ? 'rbct-tipo-erro' : undefined"
              >
                <option value="">Escolha</option>
                <option v-for="t in TIPOS_DE_CASA" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
              <svg class="rbct__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            <p v-if="erros.firmType" id="rbct-tipo-erro" class="rbct__erro">{{ erros.firmType }}</p>
          </div>

          <div class="rbct__campo">
            <label class="rbct__rotulo" for="rbct-tamanho">Tamanho aproximado</label>
            <span id="rbct-tamanho-ajuda" class="rbct__ajuda">Número de assessores ou de pessoas na mesa.</span>
            <div class="rbct__select">
              <select
                id="rbct-tamanho"
                v-model="teamSize"
                class="rbct__input"
                :class="{ 'rbct__input--vazio': !teamSize, 'rbct__input--erro': erros.teamSize }"
                name="team_size"
                required
                aria-required="true"
                :aria-invalid="erros.teamSize ? 'true' : undefined"
                :aria-describedby="[erros.teamSize ? 'rbct-tamanho-erro' : null, 'rbct-tamanho-ajuda'].filter(Boolean).join(' ')"
              >
                <option value="">Escolha</option>
                <option v-for="t in TAMANHOS_DE_MESA" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
              <svg class="rbct__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            <p v-if="erros.teamSize" id="rbct-tamanho-erro" class="rbct__erro">{{ erros.teamSize }}</p>
          </div>

          <div class="rbct__campo rbct__campo--cheio">
            <label class="rbct__rotulo" for="rbct-mensagem">
              Mensagem <span class="rbct__opc">opcional</span>
            </label>
            <textarea
              id="rbct-mensagem"
              v-model="message"
              class="rbct__area"
              :class="{ 'rbct__area--erro': erros.message }"
              name="message"
              rows="4"
              maxlength="2000"
              :aria-invalid="erros.message ? 'true' : undefined"
              :aria-describedby="erros.message ? 'rbct-mensagem-erro' : undefined"
              data-clarity-mask="true"
            />
            <p v-if="erros.message" id="rbct-mensagem-erro" class="rbct__erro">{{ erros.message }}</p>
          </div>

          <div class="rbct__campo rbct__campo--cheio">
            <div class="rbct__aceite">
              <input
                id="rbct-consent"
                v-model="consent"
                type="checkbox"
                name="consent"
                :aria-invalid="erros.consent ? 'true' : undefined"
                :aria-describedby="erros.consent ? 'rbct-consent-erro' : 'rbct-consent-texto'"
              >
              <p id="rbct-consent-texto" class="rbct__aceite-texto">
                <label for="rbct-consent">{{ CONSENT_BEFORE }}</label><NuxtLink to="/institucional/privacy">{{ CONSENT_LINK_LABEL }}</NuxtLink>.
              </p>
            </div>
            <p v-if="erros.consent" id="rbct-consent-erro" class="rbct__erro">{{ erros.consent }}</p>
          </div>

          <div v-if="falha" class="rbct__campo rbct__campo--cheio">
            <p id="rbct-falha" class="rbct__falha" role="alert" tabindex="-1">
              {{ falha.antes }}<a :href="mailtoFalha">{{ EMAIL_RELACIONAMENTO }}</a>{{ falha.depois }}
            </p>
          </div>

          <div class="rbct__campo rbct__campo--cheio">
            <button class="rbct__enviar" type="submit" :disabled="enviando">
              {{ enviando ? 'Enviando…' : 'Agendar 1 hora com a gente' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.rbct {
  scroll-margin-top: var(--nuh-h, 76px);
  background: var(--nu-cream);
  padding: clamp(72px, 9vw, 120px) clamp(22px, 5.5vw, 80px);
}
.rbct__miolo {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(32px, 4vw, 72px);
  align-items: start;
}
.rbct__intro, .rbct__card, .rbct__ok, .rbct__campo { min-width: 0; }

.rbct__titulo {
  margin: 0;
  color: var(--nu-navy);
  font-size: var(--nu-fs-h2);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
}
.rbct__dek {
  margin: 18px 0 0;
  max-width: 36ch;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-dek);
  font-weight: 500;
  line-height: 1.55;
}

.rbct__card {
  position: relative;
  background: var(--nu-white);
  border-radius: var(--nu-r-card);
  padding: clamp(20px, 3vw, 36px);
  box-shadow: 0 0 0 1px var(--nu-cream-line);
}
.rbct__grade {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.rbct__campo { display: flex; flex-direction: column; gap: 6px; }

.rbct__rotulo {
  color: var(--nu-navy);
  font-size: var(--nu-fs-sm);
  font-weight: 700;
  line-height: 1.3;
}
.rbct__opc { color: var(--nu-gray); font-weight: 500; }
.rbct__ajuda {
  margin: 0;
  color: var(--nu-gray);
  font-size: var(--nu-fs-dense);
  font-weight: 500;
  line-height: 1.4;
}

.rbct__input, .rbct__area {
  width: 100%;
  box-sizing: border-box;
  background: var(--nu-white);
  color: var(--nu-ink);
  border: 1.5px solid var(--nu-cream-2);
  border-radius: var(--nu-r-input);
  padding: 12px 14px;
  min-height: 48px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  outline: none;
}
.rbct__input::placeholder, .rbct__area::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.rbct__input:focus, .rbct__area:focus {
  border-color: var(--nu-blue);
  box-shadow: 0 0 0 3px var(--nu-blue-tint);
}
.rbct__input--erro, .rbct__area--erro { border-color: var(--nu-navy); }
.rbct__input--erro:focus, .rbct__area--erro:focus { border-color: var(--nu-blue); }
.rbct__input--vazio { color: var(--nu-gray); }
.rbct__area {
  display: block;
  min-height: 120px;
  resize: vertical;
  padding-top: 12px;
}

.rbct__select { position: relative; }
.rbct__select .rbct__input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 44px;
  cursor: pointer;
}
.rbct__chev {
  position: absolute;
  right: 14px;
  top: 24px;
  transform: translateY(-50%);
  color: var(--nu-gray);
  pointer-events: none;
}

.rbct__erro {
  margin: 0;
  color: var(--nu-navy);
  font-size: var(--nu-fs-dense);
  font-weight: 700;
  line-height: 1.4;
}
.rbct__nota {
  margin: 0;
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-dense);
  font-weight: 500;
  line-height: 1.45;
}

.rbct__aceite { display: flex; align-items: flex-start; gap: 12px; }
.rbct__aceite input {
  width: 20px;
  height: 20px;
  margin: 2px 0 0;
  flex-shrink: 0;
  accent-color: var(--nu-blue);
  cursor: pointer;
}
.rbct__aceite input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbct__aceite-texto {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm);
  font-weight: 500;
  line-height: 1.55;
}
.rbct__aceite-texto label { cursor: pointer; }
.rbct__aceite-texto a {
  color: var(--nu-blue);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.rbct__aceite-texto a:hover { color: var(--nu-blue-hover); }
.rbct__aceite-texto a:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbct__falha {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--nu-cream);
  color: var(--nu-navy);
  font-size: var(--nu-fs-sm);
  font-weight: 500;
  line-height: 1.5;
}
.rbct__falha:focus { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbct__falha a {
  color: var(--nu-blue);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}
.rbct__falha a:hover { color: var(--nu-blue-hover); }
.rbct__falha a:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbct__enviar {
  width: 100%;
  min-height: 52px;
  margin-top: 4px;
  padding: 14px 22px;
  border: 0;
  border-radius: var(--nu-r-pill);
  background: var(--nu-blue);
  color: var(--nu-white);
  font-family: inherit;
  font-size: var(--nu-fs-md);
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
  transition: background .2s;
}
.rbct__enviar:hover { background: var(--nu-blue-hover); }
.rbct__enviar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbct__enviar:disabled { opacity: .65; cursor: default; }

.rbct__ok {
  background: var(--nu-white);
  border-radius: var(--nu-r-card);
  padding: clamp(28px, 4vw, 40px);
  box-shadow: inset 4px 0 0 var(--nu-blue), 0 0 0 1px var(--nu-cream-line);
}
.rbct__ok-titulo {
  margin: 0;
  color: var(--nu-navy);
  font-size: var(--nu-fs-2xl);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
}
.rbct__ok-titulo:focus { outline: none; }
.rbct__ok-texto {
  margin: 14px 0 0;
  max-width: 42ch;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-md);
  font-weight: 500;
  line-height: 1.55;
}
.rbct__previa {
  margin: 16px 0 0;
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm);
  font-weight: 500;
  line-height: 1.45;
}

.rbct__isca {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 1100px) {
  .rbct__grade { grid-template-columns: 1fr 1fr; column-gap: 18px; }
  .rbct__campo--cheio { grid-column: 1 / -1; }
}
@media (max-width: 860px) {
  .rbct__miolo { grid-template-columns: 1fr; gap: 28px; }
}
</style>
