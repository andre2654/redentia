<script setup lang="ts">
// Herói do resumo das 7h30 (canvas "Cadastro sem muro", 21/10/2026): o céu
// clareia, as estrelas somem, o sol sobe atrás do "7:30" e a primeira frase do
// resumo de verdade aparece. Sem cartão nem balão; na folha ocupa o topo.
// Parado, fica o céu claro.
const props = defineProps<{ frase: string | null }>()

const texto = computed(() => (props.frase ? `Bom dia. ${props.frase}` : 'Bom dia. O resumo do mercado chega aqui, todo dia útil.'))
</script>

<template>
  <div class="chr" aria-hidden="true">
    <div class="chr__sol" />
    <div class="chr__nevoa" />
    <div class="chr__noite" />
    <span class="chr__estrela" style="left: 12%; top: 14%" />
    <span class="chr__estrela" style="left: 26%; top: 34%" />
    <span class="chr__estrela" style="left: 62%; top: 10%" />
    <span class="chr__estrela" style="left: 78%; top: 22%" />
    <span class="chr__estrela" style="left: 90%; top: 40%" />
    <div class="chr__relogio">7:30</div>
    <p class="chr__frase">{{ texto }}</p>
  </div>
</template>

<style scoped>
.chr {
  position: relative; overflow: hidden; height: 100%; min-height: 224px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 30px 40px 24px; box-sizing: border-box;
  /* o amanhecer na paleta da Aportou: carvão, cobalto, azul claro e a areia do creme */
  background: linear-gradient(180deg, var(--nu-ink) 0%, color-mix(in srgb, var(--nu-blue-deep) 62%, var(--nu-ink)) 34%, var(--nu-blue) 60%, var(--nu-blue-soft) 82%, var(--nu-amber-soft) 100%);
  color: var(--nu-cream-text);
}
.chr__sol {
  position: absolute; left: 50%; bottom: -84px; width: 200px; height: 200px; margin-left: -100px; border-radius: 50%;
  background: radial-gradient(circle, var(--nu-white) 0%, var(--nu-amber-soft) 30%, color-mix(in srgb, var(--nu-amber-soft) 40%, transparent) 52%, transparent 70%);
}
.chr__nevoa { position: absolute; left: 0; right: 0; bottom: 0; height: 60px; background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--nu-amber-soft) 40%, transparent) 100%); }
.chr__noite { position: absolute; inset: 0; background: var(--nu-ink); opacity: 0; }
.chr__estrela { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: var(--nu-cream-text); opacity: 0; }
.chr__relogio {
  position: relative; font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.05em; line-height: 1;
  text-shadow: 0 2px 24px color-mix(in srgb, var(--nu-ink) 35%, transparent);
}
.chr__frase {
  position: relative; margin: 18px 0 0; max-width: 40ch;
  font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.45;
  text-shadow: 0 1px 12px color-mix(in srgb, var(--nu-ink) 50%, transparent);
}

/* o laço (10 s): noite → amanhecer. Parado, fica o céu claro com a frase. */
.chr { --chr-ciclo: 10s; }
.chr__noite { animation: chr-noite var(--chr-ciclo) ease infinite; }
.chr__estrela { animation: chr-estrela var(--chr-ciclo) ease infinite; }
.chr__sol { animation: chr-sol var(--chr-ciclo) cubic-bezier(.2, .7, .2, 1) infinite; }
.chr__relogio { animation: chr-relogio var(--chr-ciclo) ease infinite; }
.chr__frase { animation: chr-frase var(--chr-ciclo) ease infinite; }
@keyframes chr-noite { 0% { opacity: .62; } 38%, 92% { opacity: 0; } 100% { opacity: .62; } }
@keyframes chr-estrela { 0%, 8% { opacity: .9; } 34%, 94% { opacity: 0; } 100% { opacity: .9; } }
@keyframes chr-sol { 0% { transform: translateY(70px); opacity: .5; } 40%, 92% { transform: none; opacity: 1; } 100% { transform: translateY(70px); opacity: .5; } }
@keyframes chr-relogio { 0%, 6% { opacity: 0; transform: translateY(8px); } 20%, 92% { opacity: 1; transform: none; } 100% { opacity: 0; } }
@keyframes chr-frase { 0%, 34% { opacity: 0; clip-path: inset(0 100% 0 0); } 50%, 92% { opacity: 1; clip-path: inset(0 0 0 0); } 100% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .chr__noite, .chr__estrela, .chr__sol, .chr__relogio, .chr__frase { animation: none; }
}
@media (max-width: 760px) {
  .chr { padding: 26px 22px 20px; }
}
</style>
