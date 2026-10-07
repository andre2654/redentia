<script setup lang="ts">
/**
 * Passo 4 — o aviso de redirecionamento do Open Finance: "vamos te levar para
 * o ambiente do banco" (no Pluggy, a pessoa é levada à página de login Open
 * Finance da instituição num pop-up) com como funciona em três linhas e o
 * botão "Ir para o {banco}". A tela é a mesma no demo: o selo do cabeçalho
 * já diz que é demonstração.
 */
import type { Instituicao } from '~/content/instituicoes'

defineProps<{ inst: Instituicao }>()
const emit = defineEmits<{ ir: [] }>()
</script>

<template>
  <section class="ccr">
    <div class="ccr__fluxo" aria-hidden="true">
      <span class="ccr__nos ccr__nos--nu"><img src="/logo-branca.svg" alt="" width="22" height="22"></span>
      <span class="ccr__tracos"><i /><i /><i /></span>
      <ClienteInstLogo :inst="inst" :size="44" />
    </div>

    <h1 data-cc-titulo tabindex="-1" class="ccr__h1">
      Vamos te levar para o ambiente do {{ inst.name }} para você autorizar o compartilhamento
    </h1>

    <ol class="ccr__passos">
      <li><span class="ccr__n">1</span><span>Você entra com as suas credenciais no próprio {{ inst.name }}, nunca aqui.</span></li>
      <li><span class="ccr__n">2</span><span>Lá você escolhe o que compartilhar: só posições de investimento.</span></li>
      <li><span class="ccr__n">3</span><span>Ao confirmar, você volta para esta tela e a conexão termina sozinha.</span></li>
    </ol>

    <footer class="ccr__foot">
      <ClienteConnectButton @click="emit('ir')">Ir para o {{ inst.name }}</ClienteConnectButton>
    </footer>
  </section>
</template>

<style scoped>
.ccr { flex: 1 1 auto; display: flex; flex-direction: column; }
.ccr__fluxo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; }
.ccr__nos--nu {
  width: 44px; height: 44px; border-radius: 12px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.ccr__nos--nu img { display: block; }
.ccr__tracos { display: inline-flex; gap: 4px; }
.ccr__tracos i { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-sand); animation: ccr-pulsa 1.2s ease-in-out infinite; }
.ccr__tracos i:nth-child(2) { animation-delay: .2s; }
.ccr__tracos i:nth-child(3) { animation-delay: .4s; }
@keyframes ccr-pulsa { 0%, 100% { opacity: .35; } 50% { opacity: 1; background: var(--nu-blue); } }

.ccr__h1 {
  margin: 18px 0 0; text-align: center; color: var(--nu-ink);
  font-size: 18px; font-weight: 800; letter-spacing: -.025em; line-height: 1.28; text-wrap: balance; outline: none;
}
.ccr__passos { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ccr__passos li { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.5; }
.ccr__n {
  width: 24px; height: 24px; flex-shrink: 0; border-radius: 8px; margin-top: -1px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream); color: var(--nu-ink); font-size: 12px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.ccr__foot { margin-top: auto; padding-top: 22px; }
</style>
