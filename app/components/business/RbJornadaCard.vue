<script setup lang="ts">
/**
 * Um card de produto por momento do dia da mesa (RbJornada). Mostra o que a
 * Redentia devolve, com dado de verdade e datado, nunca número inventado:
 *
 *  lista     get_quotes de 15/10/2026 (preço, variação, pagamento do dia)
 *  porque    list_news de 15/10/2026, 11:16 (leitura da casa sobre a Vale)
 *  cenario   simulate_scenario de 12/10/2026, motor 3.4.1, a mesma carteira
 *            colada da animação antiga do assistente (R$ 1 milhão, expansão
 *            fiscal, 1 ano)
 *  reuniao   a pauta que o comando preparar-reuniao monta (estrutura, sem número)
 *  cliente   o painel de um cliente conectado da conta da Redentia
 *
 * Cada card diz a própria data no rótulo (a legenda de datas embaixo do palco
 * saiu no enxugamento de 15/10/2026). Se trocar um número, troque a data junto.
 * Enxugados na mesma rodada: quatro linhas na lista, três na pauta e no cliente.
 */
defineProps<{ id: 'lista' | 'porque' | 'cenario' | 'reuniao' | 'cliente' }>()

const LISTA = [
  { t: 'PETR4', p: '57,77', v: -0.59 },
  { t: 'VALE3', p: '66,55', v: -0.25 },
  { t: 'ITUB4', p: '48,93', v: -0.10 },
  { t: 'HGLG11', p: '156,30', v: 0.19, ev: 'paga R$ 1,17 hoje' },
]
const pct = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}%`
</script>

<template>
  <div class="rjc">
    <template v-if="id === 'lista'">
      <span class="rjc__label">Sua lista · 15/10</span>
      <ul class="rjc__rows">
        <li v-for="r in LISTA" :key="r.t" class="rjc__row">
          <span class="rjc__tk">{{ r.t }}</span>
          <span class="rjc__px">R$ {{ r.p }}</span>
          <span class="rjc__var" :class="r.v > 0 ? 'rjc__var--pos' : r.v < 0 ? 'rjc__var--neg' : ''">{{ pct(r.v) }}</span>
          <span v-if="r.ev" class="rjc__ev">{{ r.ev }}</span>
        </li>
      </ul>
    </template>

    <template v-else-if="id === 'porque'">
      <span class="rjc__label">VALE3 · por que caiu</span>
      <p class="rjc__head">−1,06% às 11h10, com o minério em queda</p>
      <p class="rjc__body">
        Minério em Dalian a 671,5 yuans, pressionado pela margem fraca das
        siderúrgicas chinesas.
      </p>
      <p class="rjc__src">Valor Investe · 15/10, 11:16 · leitura da Redentia</p>
    </template>

    <template v-else-if="id === 'cenario'">
      <span class="rjc__label">Carteira de R$ 1 milhão · 12/10</span>
      <p class="rjc__cen">Expansão fiscal pós-2026, em 1 ano</p>
      <p class="rjc__faixa">R$ 875 mil a R$ 1,16 milhão</p>
      <p class="rjc__faixa-leg">em 80% dos caminhos, em reais de hoje</p>
      <ul class="rjc__rows">
        <li class="rjc__row"><span class="rjc__tk">Pesa mais</span><span class="rjc__px">LREN3</span><span class="rjc__var rjc__var--neg">−30%</span></li>
        <li class="rjc__row"><span class="rjc__tk">Segura</span><span class="rjc__px">IVVB11</span><span class="rjc__var rjc__var--pos">+9%</span></li>
      </ul>
    </template>

    <template v-else-if="id === 'reuniao'">
      <span class="rjc__label">Pauta · Mariana · 16/10</span>
      <ol class="rjc__pauta">
        <li>O que mudou desde a última conversa</li>
        <li>Os FIIs que pagam esta semana</li>
        <li>A carteira no cenário fiscal</li>
      </ol>
    </template>

    <template v-else>
      <span class="rjc__label">Cliente conectado</span>
      <p class="rjc__head">Mariana Ribeiro Costa</p>
      <dl class="rjc__dl">
        <div><dt>instituição</dt><dd>Nubank</dd></div>
        <div><dt>consentimento</dt><dd>até 07/10/2027</dd></div>
        <div><dt>última leitura</dt><dd>hoje, 09:12</dd></div>
      </dl>
    </template>
  </div>
</template>

<style scoped>
.rjc {
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 14px; padding: 22px;
}
.rjc__label {
  display: block; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px; line-height: 1.4;
}
.rjc__rows { margin: 14px 0 0; padding: 0; list-style: none; }
.rjc__row {
  display: grid; grid-template-columns: 1fr auto auto; align-items: baseline; gap: 4px 14px;
  padding: 10px 0; border-top: 1px solid var(--nu-cream-line);
  font-variant-numeric: tabular-nums;
}
.rjc__tk { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.rjc__px { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; text-align: right; }
.rjc__var { min-width: 64px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; text-align: right; }
.rjc__var--pos { color: var(--nu-green); }
.rjc__var--neg { color: var(--nu-red); }
.rjc__ev {
  grid-column: 1 / -1; justify-self: start;
  padding: 2px 8px; border-radius: 5px; background: var(--nu-cream);
  color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700;
}
.rjc__head { margin: 12px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; line-height: 1.35; }
.rjc__body { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rjc__src {
  margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500;
}
.rjc__cen { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.rjc__faixa { margin: 6px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.rjc__faixa-leg { margin: 2px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.rjc__pauta { margin: 14px 0 0; padding-left: 20px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.rjc__pauta li { padding: 6px 0; }
.rjc__pauta li::marker { color: var(--nu-blue-deep); font-weight: 800; }
.rjc__dl { margin: 12px 0 0; }
.rjc__dl > div {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 10px 0; border-top: 1px solid var(--nu-cream-line);
}
.rjc__dl dt { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.rjc__dl dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
</style>
