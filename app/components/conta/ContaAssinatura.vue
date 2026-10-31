<script setup lang="ts">
// Seção Assinatura de /conta (31/10/2026): o estado do plano único (teste
// grátis, ativa, pagamento pendente, cancelada), a data que importa (fim do
// teste ou próxima cobrança) e "Gerenciar assinatura", que abre o portal da
// Stripe (cartão, faturas, cancelamento). Sem assinatura, o botão do teste.
// Client-side no mount (a /conta já é atrás de login); carregando →
// esqueleto; falhou → frase com "Tentar de novo".
import { PRECO_MENSAL, resumoDaAssinatura } from '~/utils/assinatura'

const assinatura = useAssinatura()
const { ent, carregado, abrindoPortal, erroPortal, gerenciar } = assinatura
const falhou = ref(false)

async function carregar() {
  falhou.value = false
  const e = await assinatura.carregar(true)
  falhou.value = !e
}
onMounted(carregar)

const resumo = computed(() => resumoDaAssinatura(ent.value))
const semAssinatura = computed(() => assinatura.situacao.value === 'sem')
const plano = computed(() => (ent.value?.plan?.slug && ent.value.plan.slug !== 'unlimited' ? `Redentia · ${PRECO_MENSAL} por mês` : 'Redentia'))
</script>

<template>
  <ContaSection title="Assinatura" subtitle="Seu plano, a próxima cobrança e o cartão.">
    <div v-if="!carregado" class="cas__esq" aria-busy="true">
      <NuSkeleton width="120px" height="30px" radius="pill" />
      <NuSkeleton width="min(420px, 90%)" height="18px" radius="chip" />
      <NuSkeleton width="200px" height="48px" radius="pill" />
    </div>

    <div v-else-if="falhou" class="cas__erro" role="status">
      <p>Não conseguimos ler a sua assinatura agora.</p>
      <button type="button" class="cas__botao cas__botao--quieto" @click="carregar">Tentar de novo</button>
    </div>

    <div v-else class="cas">
      <div class="cas__linha">
        <span class="cas__selo" :class="`cas__selo--${resumo.tom}`">{{ resumo.selo }}</span>
        <span class="cas__plano">{{ plano }}</span>
      </div>
      <p class="cas__texto">{{ resumo.linha }}</p>

      <div class="cas__acoes">
        <button
          v-if="resumo.gerenciavel"
          type="button"
          class="cas__botao"
          :disabled="abrindoPortal"
          :aria-busy="abrindoPortal"
          @click="gerenciar"
        >
          <span v-if="abrindoPortal" class="cas__giro" aria-hidden="true" />
          {{ abrindoPortal ? 'Abrindo o portal' : 'Gerenciar assinatura' }}
        </button>
        <AssinaturaBotao v-else-if="semAssinatura" tamanho="medio" />
        <NuxtLink v-if="!semAssinatura" to="/carteira" class="cas__link">Abrir a carteira ›</NuxtLink>
      </div>
      <p v-if="erroPortal" class="cas__erro-txt" role="alert">{{ erroPortal }}</p>
      <p v-if="resumo.gerenciavel" class="cas__nota">
        O portal é da Stripe, que guarda o cartão. A Redentia nunca vê o número dele.
      </p>
    </div>
  </ContaSection>
</template>

<style scoped>
.cas__esq { display: flex; flex-direction: column; gap: 14px; }
.cas__linha { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.cas__selo { border-radius: var(--nu-r-pill); padding: 7px 14px; font-size: var(--nu-fs-sm); font-weight: 800; }
.cas__selo--verde { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cas__selo--azul { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.cas__selo--ambar { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cas__selo--neutro { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
.cas__plano { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
.cas__texto { margin: 14px 0 0; max-width: 560px; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
.cas__acoes { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 24px; }
.cas__botao {
  display: inline-flex; align-items: center; gap: 10px; min-height: 48px;
  border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-ink); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 13px 24px; font-size: var(--nu-fs-md); font-weight: 700;
  transition: background .2s, transform .15s;
}
.cas__botao:hover:not(:disabled) { background: var(--nu-ink-hover); transform: translateY(-1px); }
.cas__botao:disabled { cursor: progress; opacity: .9; }
.cas__botao:focus-visible, .cas__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cas__botao--quieto { background: var(--nu-cream); color: var(--nu-ink); }
.cas__botao--quieto:hover:not(:disabled) { background: var(--nu-cream-hover); }
.cas__giro {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2.5px solid var(--nu-white-35); border-top-color: var(--nu-white);
  animation: cas-giro .8s linear infinite;
}
@keyframes cas-giro { to { transform: rotate(360deg); } }
.cas__link { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.cas__link:hover { color: var(--nu-blue-hover); }
.cas__erro p { margin: 0 0 14px; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
.cas__erro-txt { margin: 12px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; }
.cas__nota { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
</style>
