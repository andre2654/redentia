<script setup lang="ts">
// PR10 — tabela do conteúdo SEO dentro de um card do design (radius 26,
// max-width 1080 centrado, mesma moldura do card de steps): th eyebrow
// uppercase, linhas com hairline, coluna de destaque azul, tabular-nums,
// scroll horizontal próprio no mobile (regra do app: a página nunca
// scrolla lateralmente). Fundo do card alterna com a banda via tone.
defineProps<{
  columns: string[]
  rows: string[][]
  /** índice da coluna destacada em azul (ex.: Montante Final) */
  accentCol?: number
  /** nota pequena abaixo da tabela (texto verbatim do SEO antigo) */
  note?: string
  tone?: 'cream' | 'white'
  /**
   * Até 600 px, troca a tabela por cartões empilhados (um por linha, rótulo
   * acima do valor): nada de rolagem lateral escondida. Opt-in por página.
   */
  cardsMobile?: boolean
}>()
</script>

<template>
  <div class="ctc" :class="{ 'ctc--cream': tone === 'cream', 'ctc--cards': cardsMobile }">
    <ul v-if="cardsMobile" class="ctc__cards">
      <li v-for="(r, i) in rows" :key="i" class="ctc__card">
        <p class="ctc__card-head">{{ r[0] }}</p>
        <dl class="ctc__card-grid">
          <div v-for="(cell, j) in r.slice(1)" :key="j" class="ctc__card-item">
            <dt>{{ columns[j + 1] }}</dt>
            <dd :class="{ 'ctc__td--accent': j + 1 === accentCol }">{{ cell }}</dd>
          </div>
        </dl>
      </li>
    </ul>
    <div class="ctc__scroll">
      <table class="ctc__table">
        <thead>
          <tr><th v-for="c in columns" :key="c">{{ c }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i">
            <td v-for="(cell, j) in r" :key="j" :class="{ 'ctc__td--accent': j === accentCol }">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="note" class="ctc__note">{{ note }}</p>
  </div>
</template>

<style scoped>
.ctc {
  background: var(--nu-white);
  border-radius: var(--nu-r-card-lg);
  padding: clamp(22px, 3.5vw, 44px) clamp(20px, 4vw, 54px);
  max-width: 1080px;
  margin: 0 auto;
}
.ctc--cream { background: var(--nu-cream); }
.ctc__scroll { overflow-x: auto; }
.ctc__table { width: 100%; border-collapse: collapse; min-width: 520px; }
.ctc__table th {
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase; text-align: left;
  padding: 10px 18px 12px 0; white-space: nowrap;
}
.ctc__table td {
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500;
  padding: 14px 18px 14px 0; border-top: 1.5px solid var(--nu-cream-line-2);
  font-variant-numeric: tabular-nums; line-height: 1.5;
}
.ctc__table td:first-child { color: var(--nu-ink); font-weight: 800; }
.ctc__td--accent { color: var(--nu-blue-text) !important; font-weight: 800 !important; }
.ctc__cards { display: none; }
@media (max-width: 600px) {
  .ctc--cards .ctc__scroll { display: none; }
  .ctc--cards .ctc__cards {
    display: flex; flex-direction: column; gap: 12px;
    list-style: none; margin: 0; padding: 0;
  }
  .ctc__card {
    background: var(--nu-cream); border-radius: 18px; padding: 16px 18px;
  }
  .ctc--cream .ctc__card { background: var(--nu-white); }
  .ctc__card-head {
    margin: 0 0 10px; color: var(--nu-ink); font-size: var(--nu-fs-md);
    font-weight: 800; font-variant-numeric: tabular-nums;
  }
  .ctc__card-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin: 0;
  }
  .ctc__card-item { min-width: 0; }
  .ctc__card-item dt {
    color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase; line-height: 1.3;
  }
  .ctc__card-item dd {
    margin: 2px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md);
    font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1.4;
    overflow-wrap: anywhere;
  }
}
.ctc__note {
  margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm);
  font-weight: 500; line-height: 1.6;
}
</style>
