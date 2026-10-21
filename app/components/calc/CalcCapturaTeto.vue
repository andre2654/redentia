<script setup lang="ts">
// Captura no resultado da preço teto (21/10/2026). A página traz ~40 cliques
// por dia, e quase todo mundo calcula e vai embora. Aqui a pessoa pode voltar:
//  - o alerta "avise quando cruzar o preço teto" pede conta e sai no e-mail das
//    19h dos ativos seguidos, no pregão em que o fechamento cruzar o alvo
//    (useAlertaPrecoTeto, Backend: WatchlistDigestComposer);
//  - a newsletter da semana pede só o e-mail e mora no beehiiv
//    (server/api/newsletter.post.ts). Sem a conta ligada, o formulário não
//    aparece: a página não promete um e-mail que não sai.
// Título, H1, URL e os rótulos do resultado não mudam: o dono liberou mexer
// na página só para isto. O HTML cacheado na borda é o mesmo para todo mundo;
// sessão, alerta criado e inscrição só existem depois do mount.
const props = defineProps<{
  ticker: string
  /** o preço teto médio do resultado; null some com o alerta */
  alvo: number | null
}>()

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const papel = computed(() => props.ticker.trim().toUpperCase())
const alvoFmt = computed(() => (props.alvo != null && props.alvo > 0 ? brl.format(props.alvo) : null))

const { pending, criar, criado, confirmacao, erro, etapa, emailPendente, enviando, erroEntrega, pedirCodigo, confirmarCodigo, ligarResumo } = useAlertaPrecoTeto(papel, () => props.alvo)
const emailAlerta = ref('')
const codigo = ref('')
const entrega = computed(() => criado.value?.entrega ?? null)
// O alerta deste papel foi criado nesta visita: a confirmação fica. Se o alvo
// da calculadora já é outro (slider mexido, ou a volta do login recalculou),
// aparece também a troca para o valor de agora.
const confirmado = computed(() => !!criado.value && criado.value.ticker === papel.value)
const alvoMudou = computed(() => confirmado.value && props.alvo != null && Math.abs(criado.value!.alvo - props.alvo) >= 0.005)

const newsletterLigada = useRuntimeConfig().public.newsletterLigada === true
const email = ref('')
/** isca para robô: gente não vê nem preenche */
const isca = ref('')
const estado = ref<'idle' | 'enviando' | 'ok' | 'erro'>('idle')

async function assinar() {
  if (estado.value === 'enviando') return
  estado.value = 'enviando'
  try {
    await $fetch('/api/newsletter', { method: 'POST', body: { email: email.value.trim(), origem: 'preco-teto', site: isca.value } })
    estado.value = 'ok'
  }
  catch {
    estado.value = 'erro'
  }
}
</script>

<template>
  <div class="cct">
    <div v-if="alvoFmt" class="cct__bloco">
      <p class="cct__titulo">Avise quando {{ papel }} cruzar {{ alvoFmt }}</p>
      <p class="cct__texto">Um e-mail no fim do pregão em que a cotação passar o preço teto que você calculou. Grátis, com a sua conta.</p>
      <p v-if="confirmado" :class="entrega === 'email' ? 'cct__ok' : 'cct__nota'" role="status">{{ confirmacao }}</p>

      <!-- Sem e-mail confirmado (entrou pelo celular): confirma um aqui. -->
      <template v-if="confirmado && entrega === 'sem-email'">
        <form v-if="etapa === 'email'" class="cct__linha" @submit.prevent="pedirCodigo(emailAlerta)">
          <input v-model="emailAlerta" type="email" required autocomplete="email" inputmode="email" placeholder="seu@email.com" aria-label="Seu e-mail" class="cct__input">
          <button type="submit" class="cct__btn cct__btn--linha" :disabled="enviando">{{ enviando ? 'Enviando…' : 'Enviar código' }}</button>
        </form>
        <form v-else class="cct__linha" @submit.prevent="confirmarCodigo(codigo)">
          <p class="cct__texto cct__texto--cheio">Mandamos um código para {{ emailPendente }}. Ele vale 10 minutos.</p>
          <input v-model="codigo" type="text" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Código de 6 dígitos" aria-label="Código" class="cct__input">
          <button type="submit" class="cct__btn cct__btn--linha" :disabled="enviando">{{ enviando ? 'Confirmando…' : 'Confirmar' }}</button>
        </form>
      </template>
      <button v-if="confirmado && entrega === 'desligado'" type="button" class="cct__btn" :disabled="enviando" @click="ligarResumo()">
        {{ enviando ? 'Ligando…' : 'Ligar o resumo por e-mail' }}
      </button>
      <p v-if="erroEntrega" class="cct__erro" role="alert">{{ erroEntrega }}</p>

      <button v-if="!confirmado || alvoMudou" type="button" class="cct__btn" :disabled="pending" @click="criar()">
        {{ pending ? 'Criando o alerta…' : alvoMudou ? `Trocar o alerta para ${alvoFmt}` : 'Criar alerta' }}
      </button>
      <p v-if="erro" class="cct__erro" role="alert">{{ erro }}</p>
    </div>

    <form v-if="newsletterLigada" class="cct__bloco" @submit.prevent="assinar">
      <p class="cct__titulo">O mercado da semana no seu e-mail</p>
      <p class="cct__texto">Toda sexta, o resumo da semana na bolsa. Dá para sair em um clique.</p>
      <p v-if="estado === 'ok'" class="cct__ok" role="status">Inscrição feita. Confira sua caixa de entrada.</p>
      <template v-else>
        <div class="cct__linha">
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            inputmode="email"
            placeholder="seu@email.com"
            aria-label="Seu e-mail"
            class="cct__input"
          >
          <button type="submit" class="cct__btn cct__btn--linha" :disabled="estado === 'enviando'">
            {{ estado === 'enviando' ? 'Enviando…' : 'Assinar' }}
          </button>
        </div>
        <input v-model="isca" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" class="cct__isca">
        <p class="cct__legal">Ao assinar, você aceita receber o e-mail semanal da Redentia. <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>.</p>
        <p v-if="estado === 'erro'" class="cct__erro" role="alert">Não conseguimos inscrever agora. Tente de novo em instantes.</p>
      </template>
    </form>
  </div>
</template>

<style scoped>
.cct { display: grid; gap: 12px; margin-top: 20px; }
.cct__bloco {
  position: relative;
  background: var(--nu-cream); border-radius: 18px; padding: 18px 22px;
}
.cct__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -.1px; }
.cct__texto { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.cct__btn {
  margin-top: 14px; background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 11px 20px; font-size: var(--nu-fs-sm); font-weight: 800;
  cursor: pointer; transition: background .2s;
}
.cct__btn:hover { background: var(--nu-blue-hover); }
.cct__btn:disabled { opacity: .6; cursor: default; }
.cct__btn--linha { margin-top: 0; flex-shrink: 0; }
.cct__linha { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.cct__input {
  flex: 1 1 200px; min-width: 0;
  background: var(--nu-white); color: var(--nu-ink);
  border: 1px solid var(--nu-cream-line); border-radius: var(--nu-r-pill);
  padding: 10px 16px; font-size: var(--nu-fs-sm); font-weight: 500;
}
.cct__input:focus { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.cct__legal { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 500; }
.cct__legal a { color: inherit; text-decoration: underline; }
.cct__ok { margin: 12px 0 0; color: var(--nu-green-2); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.5; }
.cct__nota { margin: 12px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.5; }
.cct__texto--cheio { flex: 1 1 100%; margin: 0; }
.cct__erro { margin: 10px 0 0; color: var(--nu-red); font-size: var(--nu-fs-sm); font-weight: 700; }
.cct__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
</style>
