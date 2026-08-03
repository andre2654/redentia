<script setup lang="ts">
/**
 * Banda D: o que a chave alcança, e o que ela não alcança.
 *
 * Fecha a página com o CONTRATO em vez de nota de rodapé. Na versão anterior
 * esses fatos eram uma tabela de especificações colada no fim, e o próximo
 * passo do produto inteiro era uma linha cinza de 13,5px. Aqui os escopos são
 * os do payload (não uma lista escrita à mão que pode divergir do servidor) e
 * o próximo passo é um botão.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

defineProps<{ conta: BusinessAccountStatus }>()

const FATOS = [
  { t: 'Incluído', d: 'Mercado, teses e notícias: cotações, busca de ativos, resumo do dia e briefing.' },
  { t: 'Carteira', d: 'Fora do plano para escritórios. O servidor recusa dado de carteira nessas chaves.' },
  { t: 'Revogação', d: 'Desligar ou revogar vale em até um minuto. A chave revogada some do painel e o uso dela fica no histórico.' },
  { t: 'Sobre o número', d: 'O uso é contado para o escritório se enxergar, não para cobrar. Um reinício do serviço pode perder até um minuto de contagem.' },
]
</script>

<template>
  <section class="rbks">
    <div class="rbks__in">
      <NuSectionHeading eyebrow="Limites">
        O que a chave<br>alcança.
        <template #dek>
          Três escopos, e nada além deles. O resto o servidor recusa, não é uma
          configuração que alguém pode ligar.
        </template>
      </NuSectionHeading>

      <div v-if="conta.scopes?.length" class="rbks__scopes">
        <span v-for="s in conta.scopes" :key="s" class="rbks__scope">{{ s }}</span>
      </div>

      <dl class="rbks__fatos">
        <div v-for="f in FATOS" :key="f.t" class="rbks__fato">
          <dt>{{ f.t }}</dt>
          <dd>{{ f.d }}</dd>
        </div>
      </dl>

      <NuxtLink to="/business/comecar" class="rbks__cta">Conectar ao seu assistente</NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.rbks { background: var(--nu-white); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.rbks__in { max-width: 1120px; }

.rbks__scopes { display: flex; flex-wrap: wrap; gap: 12px; margin-top: clamp(28px, 3.5vw, 40px); }
.rbks__scope {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 14px 18px;
  color: var(--nu-ink); font-size: 15px; font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .01em;
}

.rbks__fatos { margin: clamp(28px, 3.2vw, 36px) 0 0; }
.rbks__fato { display: grid; grid-template-columns: 150px 1fr; gap: 20px; padding: 18px 0; border-top: 1px solid var(--nu-cream-2); }
.rbks__fato dt { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding-top: 3px; }
.rbks__fato dd { margin: 0; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600; line-height: 1.6; }

.rbks__cta {
  display: inline-flex; align-items: center; margin-top: clamp(32px, 4vw, 44px);
  background: transparent; color: var(--nu-blue); border: 2px solid var(--nu-blue);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 16.5px; font-weight: 700;
  transition: background .2s;
}
.rbks__cta:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.rbks__cta:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }

@media (max-width: 620px) { .rbks__fato { grid-template-columns: 1fr; gap: 6px; } }
</style>
