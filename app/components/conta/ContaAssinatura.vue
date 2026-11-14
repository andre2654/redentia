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
      <NuBotaoSeta variante="contorno" tamanho="m" @click="carregar">Tentar de novo</NuBotaoSeta>
    </div>

    <div v-else class="cas">
      <div class="cas__linha">
        <NuSelo :tom="resumo.tom">{{ resumo.selo }}</NuSelo>
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
        <NuLinkSeta v-if="!semAssinatura" to="/carteira" class="cas__link">Abrir a carteira</NuLinkSeta>
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
.cas { animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) backwards; }
.cas__linha { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.cas__plano { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums; }
.cas__texto { margin: 14px 0 0; max-width: 560px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.55; font-variant-numeric: tabular-nums; }
.cas__acoes { display: flex; align-items: center; gap: 16px 24px; flex-wrap: wrap; margin-top: 24px; }
.cas__link { font-size: var(--nu-fs-md); }
.cas__erro p { margin: 0 0 14px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); }
.cas__erro-txt { margin: 12px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.cas__nota { margin: 16px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
@media (prefers-reduced-motion: reduce) {
  .cas { animation: none; }
}
</style>
