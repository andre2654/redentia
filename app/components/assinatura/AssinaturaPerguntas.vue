<script setup lang="ts">
// As perguntas que travam a decisão (31/10/2026), respondidas sem rodeio. O
// preço não aparece aqui: ele vem no fim do quiz, antes de qualquer pagamento
// (decisão do dono, o topo é o "Conectar carteira"). Nada recomenda investimento.
const PERGUNTAS = [
  {
    p: 'Funciona com o meu banco?',
    r: 'Funciona com os bancos e corretoras do Open Finance: Nubank, Itaú, Bradesco, Banco do Brasil, Santander, Inter, XP, BTG e mais de cem outros.',
  },
  {
    p: 'É seguro conectar?',
    r: 'É só leitura. Você autoriza no app do seu banco, a senha nunca passa pela Redentia, e a conexão é pelo Open Finance, regulado pelo Banco Central.',
  },
  {
    p: 'Quanto custa?',
    r: 'Você vê o preço de lançamento no fim do quiz, antes de qualquer pagamento. Na primeira assinatura dá para testar antes, e você cancela quando quiser, em Configurações.',
  },
  {
    p: 'A Redentia diz o que eu devo comprar?',
    r: 'Não. Ela mostra o que a sua carteira tem, como ela se mexe e o que pode vir pela frente. A decisão é sempre sua.',
  },
  {
    p: 'E se eu ainda não investir?',
    r: 'Dá para começar do zero: quando o primeiro investimento cair na sua conta, a carteira aparece aqui.',
  },
]
</script>

<template>
  <section class="apg" aria-labelledby="apg-titulo">
    <h2 id="apg-titulo" class="apg__titulo">Antes de conectar.</h2>
    <div class="apg__lista">
      <details v-for="(q, i) in PERGUNTAS" :key="q.p" class="apg__item" :open="i === 0">
        <summary class="apg__p">
          {{ q.p }}
          <span class="apg__mais" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
        </summary>
        <p class="apg__r">{{ q.r }}</p>
      </details>
    </div>
    <div class="apg__acao">
      <AssinaturaConectar origem="perguntas" />
    </div>
  </section>
</template>

<style scoped>
.apg { background: var(--nu-white); padding: clamp(64px, 8.5vw, 112px) clamp(22px, 5.5vw, 80px); }
.apg__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.apg__lista { display: flex; flex-direction: column; gap: 10px; max-width: 860px; margin-top: clamp(32px, 4vw, 48px); }
.apg__item { border-radius: var(--nu-r-card); background: var(--nu-cream); }
.apg__p {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 24px;
  color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.015em; cursor: pointer; list-style: none;
}
.apg__p::-webkit-details-marker { display: none; }
.apg__p:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: var(--nu-r-card); }
.apg__mais { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%; background: var(--nu-white); color: var(--nu-ink); transition: transform .25s ease; }
.apg__item[open] .apg__mais { transform: rotate(45deg); }
.apg__r { margin: 0; padding: 0 24px 24px; max-width: 64ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.apg__acao { display: flex; justify-content: flex-start; margin-top: clamp(32px, 4vw, 48px); }
@media (prefers-reduced-motion: reduce) { .apg__mais { transition: none; } }
</style>
