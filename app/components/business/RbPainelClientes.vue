<script setup lang="ts">
/**
 * Clientes do escritório, em resumo (um painel da banda "Conta"): quantos
 * estão conectados, quantos convites esperam e quantos consentimentos vencem
 * em 30 dias. O detalhe e o registro de acesso ficam em /business/clientes.
 *
 * Como o /business/clientes, este resumo NUNCA mostra valor de carteira: o
 * painel do dono é de gestão do consentimento, não de patrimônio.
 *
 * Sem o recurso ligado, o painel diz como ligar, sem prometer conexão que a
 * conta não tem.
 */
import type { BusinessClientsList } from '~/types/clientes'

const props = defineProps<{ ligado: boolean, clientes: BusinessClientsList | null }>()

const DIA_MS = 86_400_000
const lista = computed(() => props.clientes?.clients ?? [])
const conectados = computed(() => lista.value.filter(c => c.status === 'active'))
const pendentes = computed(() => lista.value.filter(c => c.status === 'pending').length)
const vencendo = computed(() => conectados.value.filter((c) => {
  if (!c.consent_expires_at) return false
  const dias = (new Date(c.consent_expires_at).getTime() - Date.now()) / DIA_MS
  return dias >= 0 && dias <= 30
}).length)
</script>

<template>
  <article class="rbpk">
    <h3 class="rbpk__h3">Clientes do escritório</h3>
    <p class="rbpk__dek">
      {{ ligado
        ? 'Cada cliente conectou a própria carteira por um link e revoga quando quiser.'
        : 'Com o recurso ligado, o cliente conecta a própria carteira por um link, com consentimento, e o assistente da casa passa a ler a carteira dele.' }}
    </p>
    <template v-if="ligado && !lista.length">
      <p class="rbpk__vazio">Nenhum cliente ainda. O primeiro convite leva um minuto: o cliente recebe um link, lê o termo e conecta a carteira.</p>
      <NuxtLink to="/business/clientes" class="rbpk__btn">Convidar o primeiro cliente</NuxtLink>
    </template>
    <template v-else-if="ligado">
      <div class="rbpk__numeros">
        <div><b>{{ conectados.length }}</b><span>{{ conectados.length === 1 ? 'conectado' : 'conectados' }}</span></div>
        <div><b>{{ pendentes }}</b><span>{{ pendentes === 1 ? 'convite esperando' : 'convites esperando' }}</span></div>
        <div><b>{{ vencendo }}</b><span>{{ vencendo === 1 ? 'vence em 30 dias' : 'vencem em 30 dias' }}</span></div>
      </div>
      <NuxtLink to="/business/clientes" class="rbpk__btn">Convidar e acompanhar os clientes</NuxtLink>
    </template>
    <a v-else href="mailto:relacionamento@redentia.com.br?subject=Clientes%20do%20escrit%C3%B3rio" class="rbpk__btn">Ligar na implantação</a>
  </article>
</template>

<style scoped>
.rbpk { display: flex; flex-direction: column; height: 100%; padding: 28px; border-radius: var(--nu-r-card); background: var(--rbp-painel); }
.rbpk__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.02em; }
.rbpk__dek { margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rbpk__numeros { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0 0; padding: 20px 0; border-top: 1px solid var(--rbp-linha); border-bottom: 1px solid var(--rbp-linha); }
.rbpk__numeros div { display: grid; gap: 4px; }
.rbpk__numeros b { color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.rbpk__numeros span { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }
.rbpk__btn {
  align-self: flex-start; margin-top: auto; padding-top: 0; display: inline-flex; align-items: center; min-height: 46px; padding: 0 22px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); text-decoration: none;
  font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s;
}
.rbpk__numeros + .rbpk__btn, .rbpk__dek + .rbpk__btn { margin-top: 24px; }
.rbpk__btn:hover { background: var(--nu-blue-hover); }
.rbpk__btn:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 3px; }

.rbpk__vazio { margin: 22px 0 0; padding: 18px; border-radius: var(--nu-r-tile); background: var(--nu-white); color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rbpk__btn { gap: 8px; transition: background .2s, transform .12s; }
.rbpk__btn::after { content: '→'; transition: transform .2s ease; }
.rbpk__btn:hover::after { transform: translateX(3px); }
.rbpk__btn:active { transform: scale(.98); }
</style>
