<script setup lang="ts">
/**
 * Trilho de capacidade — a régua fina entre o header e o hero.
 *
 * HISTÓRICO DO DESENHO (pra ninguém ressuscitar o que já morreu): nasceu como
 * a V5 do estudo de variações (corte diagonal, docs/redentia-business/
 * variacoes-banda.html), o dono aprovou a copy mas reprovou o desenho em
 * 2026-08-01 ("ainda não gosto do design desse banner"). Diagnóstico aceito:
 * era o elemento mais barulhento da página carregando a mensagem menos
 * importante, terceira massa azul da primeira dobra, e a diagonal sem barra
 * de referência lia como decoração. Virou o trilho fino, que é onde as três
 * rodadas de crítica da landing prototipada também tinham chegado.
 *
 * COPY REVISADA E APROVADA (2026-08-01, revisão de conversão):
 *  - "já fecharam com a gente": sem o objeto, "escritórios fecharam" lê como
 *    FALIRAM na primeira passada de 1 segundo. O objeto mata a ambiguidade e
 *    "com a gente" já é a voz da página (o CTA é "Falar com a gente").
 *  - O trilho inteiro é LINK para #contato: escassez sem porta é frustração.
 *    A seta na ponta diz que ele anda.
 *
 * ⚠️ O NÚMERO É MANUAL. Fechou ou perdeu um escritório, atualiza FECHADOS
 * aqui no mesmo dia — placar desatualizado é a página mentindo em público.
 * O comentário do RbProva aponta pra cá como o único lugar do placar.
 */
const FECHADOS = 3
const TOTAL = 5
const VAGAS = TOTAL - FECHADOS
</script>

<template>
  <a
    href="#contato"
    class="rbcp"
    :aria-label="`Capacidade: ${FECHADOS} de ${TOTAL} escritórios já fecharam com a gente,
      ${VAGAS} vagas abertas. Falar com a gente`"
  >
    <span class="rbcp__row" aria-hidden="true">
      <span class="rbcp__label">Capacidade</span>
      <span class="rbcp__fact">{{ FECHADOS }} de {{ TOTAL }} escritórios já fecharam com a gente.</span>
      <span class="rbcp__end">
        {{ VAGAS }} vagas abertas
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
    </span>
  </a>
</template>

<style scoped>
/* régua, não cartaz: uma linha de navy sob o header, na altura de uma barra
   de sistema. Quem grita nesta página é o hero. */
.rbcp { display: block; background: var(--nu-navy); }
.rbcp:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: -3px; }

.rbcp__row {
  min-height: 52px; padding: 14px clamp(22px, 5.5vw, 80px);
  display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 16px;
}
.rbcp__label {
  color: var(--nu-cream-text-55); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
.rbcp__fact {
  color: var(--nu-cream-text); font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
/* a ponta é a ação: no hover ela acende e a seta anda */
.rbcp__end {
  margin-left: auto; display: inline-flex; align-items: center; gap: 7px;
  color: var(--nu-blue-soft); font-size: 14.5px; font-weight: 800;
  white-space: nowrap; font-variant-numeric: tabular-nums;
  transition: color .2s;
}
.rbcp__end svg { transition: transform .2s; align-self: center; }
.rbcp:hover .rbcp__end { color: var(--nu-white); }
.rbcp:hover .rbcp__end svg { transform: translateX(3px); }

/* no estreito o rótulo sai (a frase já diz o que é) e a ponta desce pra
   segunda linha, alinhada à esquerda como o resto */
@media (max-width: 640px) {
  .rbcp__label { display: none; }
  .rbcp__end { margin-left: 0; }
}
</style>
