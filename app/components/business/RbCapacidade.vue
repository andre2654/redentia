<script setup lang="ts">
/**
 * Trilho do topo — a régua fina entre o header e o hero.
 *
 * HISTÓRICO DO DESENHO (pra ninguém ressuscitar o que já morreu): nasceu como
 * a V5 do estudo de variações (corte diagonal, docs/redentia-business/
 * variacoes-banda.html), o dono aprovou a copy mas reprovou o desenho em
 * 2026-08-01 ("ainda não gosto do design desse banner"). Diagnóstico aceito:
 * era o elemento mais barulhento da página carregando a mensagem menos
 * importante, terceira massa azul da primeira dobra, e a diagonal sem barra
 * de referência lia como decoração. Virou o trilho fino.
 *
 * ⚠️ O PLACAR "3 DE 5 ESCRITÓRIOS JÁ FECHARAM" SAIU (11/10/2026), e não volta
 * sem prova. Em outubro havia um escritório pagante, não três, e o número era
 * manual: placar que ninguém atualiza é a página mentindo em público, na frente
 * de quem acabou de sair de uma call de venda e vai conferir. A regra agora é a
 * do resto da página: só entra aqui o que o dono prova AO VIVO numa call.
 *
 * O que entrou é exatamente isso: a call roda no Claude ou no ChatGPT, com a
 * chave do escritório e o dado do dia. Quem lê confere na própria reunião, e a
 * frase não envelhece (não tem número que precise de atualização manual).
 *
 * Se um dia o placar voltar, ele volta com fonte: contrato assinado que o
 * cliente autorizou citar. Nunca com "vagas abertas" como escassez de enfeite.
 *
 * O trilho inteiro continua LINK para #contato: frase sem porta é frustração.
 * A seta na ponta diz que ele anda.
 */
</script>

<template>
  <a
    href="#contato"
    class="rbcp"
    aria-label="Ao vivo: a apresentação roda no Claude ou no ChatGPT, com dado do dia. Marcar a call."
  >
    <span class="rbcp__row" aria-hidden="true">
      <span class="rbcp__label">Ao vivo</span>
      <span class="rbcp__fact">A apresentação roda no Claude ou no ChatGPT, com dado do dia. Sem slide.</span>
      <span class="rbcp__end">
        Marcar a call
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
