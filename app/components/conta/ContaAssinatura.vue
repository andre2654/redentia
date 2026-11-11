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
const plano = computed(() => (ent.value?.plan?.slug && ent.value.plan.slug !== 'unlimited' ? `Aportou · ${PRECO_MENSAL} por mês` : 'Aportou'))
</script>

<template>
  <ContaSection title="Assinatura" subtitle="Seu plano, a próxima cobrança e o cartão.">
    <div v-if="!carregado" class="cas__esq" aria-busy="true">
      <NuSkeleton width="120px" height="32px" radius="8px" />
      <NuSkeleton width="min(420px, 90%)" height="18px" radius="chip" />
      <NuSkeleton width="230px" height="52px" radius="pill" />
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
        <NuBotaoSeta
          v-if="resumo.gerenciavel"
          variante="carvao"
          tamanho="m"
          :loading="abrindoPortal"
          @click="gerenciar"
        >
          {{ abrindoPortal ? 'Abrindo o portal' : 'Gerenciar assinatura' }}
        </NuBotaoSeta>
        <AssinaturaBotao v-else-if="semAssinatura" tamanho="medio" />
        <NuxtLink v-if="!semAssinatura" to="/carteira" class="cas__link">Abrir a carteira<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></NuxtLink>
      </div>
      <p v-if="erroPortal" class="cas__erro-txt" role="alert">{{ erroPortal }}</p>
      <p v-if="resumo.gerenciavel" class="cas__nota">
        O portal é da Stripe, que guarda o cartão. A Aportou nunca vê o número dele.
      </p>
    </div>
  </ContaSection>
</template>

<style scoped>
.cas__esq { display: flex; flex-direction: column; gap: 14px; }
/* sobre o cartão creme o esqueleto padrão (areia e creme) quase some: um tom acima, com o mesmo brilho */
.cas__esq :deep(.nusk) { --esq: color-mix(in srgb, var(--nu-ink) 9%, var(--nu-card)); background-image: linear-gradient(100deg, var(--esq) 25%, var(--nu-white) 50%, var(--esq) 75%); }
.cas { animation: nu-fade .25s ease both; }
.cas__linha { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
/* o selo da marca: raio 8, 13,5px, 700 */
.cas__selo { border-radius: var(--nu-r-tag); padding: 6px 11px; font-size: 13.5px; font-weight: 700; line-height: 1.3; }
.cas__selo--verde { background: var(--nu-green-bg); color: var(--nu-green-text); }
.cas__selo--azul { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.cas__selo--ambar { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cas__selo--neutro { background: var(--nu-cream-2); color: var(--nu-gray-tag); }
.cas__plano { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.cas__texto { margin: 14px 0 0; max-width: 560px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
.cas__acoes { display: flex; align-items: center; gap: 14px 22px; flex-wrap: wrap; margin-top: 24px; }
.cas__botao {
  display: inline-flex; align-items: center; gap: 10px; min-height: 48px;
  border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-ink); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 0 24px; font-size: var(--nu-fs-md); font-weight: 700;
  transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.cas__botao:hover:not(:disabled) { background: var(--nu-ink-hover); }
.cas__botao:active { transform: scale(.98); }
.cas__botao--quieto { background: var(--nu-white); color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink); }
.cas__botao--quieto:hover:not(:disabled) { background: var(--nu-row-hover); }
.cas__link { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.cas__link:hover { color: var(--nu-blue-hover); }
.cas__link svg { transition: transform .2s; }
.cas__link:hover svg { transform: translateX(3px); }
.cas__erro p { margin: 0 0 14px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
.cas__erro-txt { margin: 12px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 600; }
.cas__nota { margin: 16px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.5; }
@media (prefers-reduced-motion: reduce) {
  .cas { animation: none; }
  .cas__link svg { transition: none; }
}
</style>
