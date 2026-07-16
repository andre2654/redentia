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
}>()
</script>

<template>
  <div class="ctc" :class="{ 'ctc--cream': tone === 'cream' }">
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
  color: var(--nu-gray); font-size: 12px; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase; text-align: left;
  padding: 10px 18px 12px 0; white-space: nowrap;
}
.ctc__table td {
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600;
  padding: 14px 18px 14px 0; border-top: 1.5px solid var(--nu-cream-line-2);
  font-variant-numeric: tabular-nums; line-height: 1.5;
}
.ctc__table td:first-child { color: var(--nu-ink); font-weight: 800; }
.ctc__td--accent { color: var(--nu-blue) !important; font-weight: 800 !important; }
.ctc__note {
  margin: 18px 0 0; color: var(--nu-gray); font-size: 13.5px;
  font-weight: 500; line-height: 1.6;
}
</style>
