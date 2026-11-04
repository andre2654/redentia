<script setup lang="ts">
/**
 * O painel "Clientes do escritório" (pages/business/clientes.vue), recortado
 * fiel para a /business: o convite (nome do cliente, chave responsável, "Criar
 * e gerar link"), a linha do cliente com os mesmos campos da tela (Status,
 * Chave responsável, Instituição, Conectado em, Expira em, Última leitura) e o
 * "Registro de acesso" com os rótulos de verdade (utils/clientes.ts). O cliente
 * é o mesmo nome de exemplo do site (Mariana Ribeiro Costa) e as datas batem
 * com o consentimento de 12 meses; o canto da janela diz "Exemplo".
 *
 * `etapa`: 'convite' mostra o botão sendo usado e o link enviado; 'cliente'
 * mostra o cliente ativo com o registro. `tocar` faz o registro chegar linha a
 * linha, uma vez.
 */
import { clientActionLabel, clientActorLabel, clientStatusLabel } from '~/utils/clientes'

withDefaults(defineProps<{ tocar?: boolean; etapa?: 'convite' | 'cliente' | 'tudo' }>(), { tocar: false, etapa: 'tudo' })

const CHAVE = 'Mesa principal'
const REGISTRO = [
  { acao: 'consent_granted', ator: 'client', quando: '07/10/2026, 14:02' },
  { acao: 'portfolio_read', ator: 'key', quando: '04/11/2026, 09:12' },
  { acao: 'simulation_run', ator: 'key', quando: '04/11/2026, 09:14' },
]
</script>

<template>
  <div class="btl" :class="{ 'btl--tocar': tocar }">
    <div v-if="etapa !== 'cliente'" class="btl__a">
      <p class="btl__eyebrow">Clientes do escritório</p>
      <p v-if="etapa === 'tudo'" class="btl__titulo">Carteira de cliente, só com o consentimento dele.</p>
      <div class="btl__form">
        <div class="btl__campo"><span>Nome do cliente</span><b>Mariana Ribeiro Costa</b></div>
        <div class="btl__campo"><span>Chave responsável</span><b>{{ CHAVE }}</b></div>
        <span class="btl__btn">Criar e gerar link</span>
      </div>
      <div class="btl__link">
        <span class="btl__link-l">Link de convite · Mariana Ribeiro Costa</span>
        <span class="btl__link-url">redentia.com.br/cliente/convite/…</span>
        <span class="btl__copy">Copiar link</span>
      </div>
    </div>

    <div v-if="etapa !== 'convite'" class="btl__b">
      <p class="btl__h2">Clientes</p>
      <div class="btl__item">
        <div class="btl__top"><b>Mariana Ribeiro Costa</b><span class="btl__act">Gerenciar</span></div>
        <dl class="btl__meta">
          <div><dt>Status</dt><dd class="btl__st">{{ clientStatusLabel('active') }}</dd></div>
          <div><dt>Chave responsável</dt><dd>{{ CHAVE }}</dd></div>
          <div><dt>Instituição</dt><dd>XP Investimentos</dd></div>
          <div><dt>Conectado em</dt><dd>07/10/2026</dd></div>
          <div><dt>Expira em</dt><dd>07/10/2027</dd></div>
          <div><dt>Última leitura</dt><dd>04/11, 09:12</dd></div>
        </dl>
        <p class="btl__h3">Registro de acesso</p>
        <ol class="btl__log">
          <li v-for="(r, i) in REGISTRO" :key="r.acao" :style="{ '--i': i }">
            <span class="btl__log-a">{{ clientActionLabel(r.acao) }}</span>
            <span class="btl__log-m">{{ clientActorLabel(r.ator) }}<template v-if="r.ator === 'key'"> ({{ CHAVE }})</template> · {{ r.quando }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btl { color: var(--nu-ink); font-variant-numeric: tabular-nums; }
.btl__a { padding: 22px 24px; background: var(--nu-cream); }
.btl__eyebrow { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.btl__titulo { margin: 6px 0 0; max-width: 24ch; font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.btl__form { display: grid; grid-template-columns: 1.2fr 1fr auto; gap: 10px; align-items: end; margin-top: 16px; padding: 14px; border-radius: var(--nu-r-tile); background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line); }
.btl__campo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.btl__campo span { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.btl__campo b { height: 36px; display: flex; align-items: center; padding: 0 10px; border-radius: 10px; box-shadow: inset 0 0 0 1.5px var(--nu-cream-2); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btl__btn { height: 36px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.btl__link { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; margin-top: 10px; padding: 12px 14px; border-radius: var(--nu-r-tile); background: var(--nu-green-bg); }
.btl__link-l { grid-column: 1 / -1; color: var(--nu-green-text); font-size: var(--nu-fs-xs); font-weight: 700; }
.btl__link-url { color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.btl__copy { padding: 5px 12px; border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.btl__b { padding: 20px 24px 22px; background: var(--nu-white); }
.btl__h2 { margin: 0; font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.03em; }
.btl__item { margin-top: 12px; padding: 16px 18px; border-radius: var(--nu-r-tile); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.btl__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: var(--nu-fs-md); }
.btl__act { padding: 5px 12px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-14); font-size: var(--nu-fs-dense); font-weight: 700; }
.btl__meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 16px; margin: 12px 0 0; }
.btl__meta dt { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.btl__meta dd { margin: 2px 0 0; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.btl__st { color: var(--nu-green-text); }
.btl__h3 { margin: 16px 0 6px; padding-top: 12px; border-top: 1px solid var(--nu-cream-line); font-size: var(--nu-fs-sm); font-weight: 800; }
.btl__log { margin: 0; padding: 0; list-style: none; }
.btl__log li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 12px; padding: 7px 0; font-size: var(--nu-fs-dense); }
.btl__log-a { font-weight: 700; }
.btl__log-m { color: var(--nu-gray); font-weight: 500; }
.btl--tocar .btl__log li { animation: btl-entra .5s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(400ms + var(--i) * 260ms); }
.btl--tocar .btl__link { animation: btl-entra .5s cubic-bezier(.2, .8, .2, 1) backwards .5s; }
@keyframes btl-entra { from { opacity: 0; transform: translateY(6px); } }
@media (max-width: 560px) {
  .btl__form { grid-template-columns: 1fr; }
  .btl__meta { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .btl * { animation: none !important; } }
</style>
