<script setup lang="ts">
/**
 * O que o plano inclui (um painel da banda "Conta"), em linhas: o que a chave
 * alcança, o que aparece no assistente, o limite e a regra da carteira de
 * cliente. Substitui a banda de cartões (RbKeysScope), sem o link para o
 * pack de skills: o servidor já ensina o assistente na conexão.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

const props = defineProps<{ conta: BusinessAccountStatus }>()
defineEmits<{ (e: 'conectar'): void }>()

const NOMES: Record<string, string> = { mercado: 'mercado', teses: 'teses', news: 'notícias', cenarios: 'cenários', carteira: 'carteira' }
const escopos = computed(() => (props.conta.scopes ?? []).filter(s => s !== 'clientes').map(s => NOMES[s] ?? s))
const lista = computed(() => {
  const e = escopos.value
  if (!e.length) return 'O catálogo da Redentia'
  const t = e.length === 1 ? e[0]! : `${e.slice(0, -1).join(', ')} e ${e.at(-1)}`
  return t.charAt(0).toUpperCase() + t.slice(1)
})
const clientesLigado = computed(() => (props.conta.clients_mode ?? 'off') !== 'off')
const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')

const linhas = computed(() => [
  { t: 'Alcance', d: `${lista.value}, só de leitura. Cenário é faixa com premissas abertas, nunca previsão.` },
  {
    t: 'No assistente',
    d: clientesLigado.value
      ? 'Telas prontas no Claude e no ChatGPT: clientes, carteira, cenário e cotações, com os próximos passos em botões e o relatório do cliente.'
      // Sem clientes, só o get_quotes tem tela: o cenário de carteira colada ainda não tem.
      : 'Respostas prontas no Claude e no ChatGPT, com as cotações numa tela e os próximos passos em botões.',
  },
  { t: 'Limite', d: props.conta.quota.day ? `${num(props.conta.quota.day)} por dia e ${num(props.conta.quota.minute)} por minuto.` : `Sem teto diário: o uso conta só no limite por minuto, de ${num(props.conta.quota.minute)} pedidos somando as chaves.` },
  { t: 'Carteira', d: 'Clientes do escritório é ligado pela Redentia, conta a conta. A carteira só entra com o consentimento do próprio cliente, e cada leitura fica no registro de acesso, que ele vê.' },
])
</script>

<template>
  <article class="rbpp">
    <h3 class="rbpp__h3">O que está incluído</h3>
    <div v-for="l in linhas" :key="l.t" class="rbpp__linha">
      <span class="rbpp__t">{{ l.t }}</span>
      <span class="rbpp__d">{{ l.d }}</span>
    </div>
    <button type="button" class="rbpp__link" @click="$emit('conectar')">Como conectar no Claude ou no ChatGPT</button>
  </article>
</template>

<style scoped>
.rbpp { height: 100%; padding: 28px; border-radius: var(--nu-r-card); background: var(--rbp-painel); }
.rbpp__h3 { margin: 0 0 8px; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.02em; }
.rbpp__linha { display: grid; grid-template-columns: 110px 1fr; gap: 4px 16px; padding: 14px 0; border-top: 1px solid var(--rbp-linha); }
.rbpp__t { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; }
.rbpp__d { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rbpp__link {
  margin-top: 14px; min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-blue); font: inherit; font-size: var(--nu-fs-md); font-weight: 800;
}
.rbpp__link::after { content: ' →'; }
.rbpp__link:hover { color: var(--nu-blue-hover); }
.rbpp__link:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 3px; border-radius: 8px; }
@media (max-width: 560px) { .rbpp__linha { grid-template-columns: 1fr; } }
</style>
