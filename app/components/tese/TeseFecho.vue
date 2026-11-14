<script setup lang="ts">
// O fecho da tese (11/11/2026, docs/aportou/tese.md): UM painel azul só, no
// fim da página, para acompanhar a tese (quem entrou) ou criar a conta (o
// visitante), e a linha que diz o que uma tese é. O comportamento do botão é o
// de seguir de sempre (useThesisFollow, na página): o visitante vai ao /login
// com a volta para esta tese.
// `painel: false` deixa só o aviso (o convite do visitante já está logo acima)
// Robustez (11/11/2026): o painel entra ao rolar (v-revelar), na coluna de 1240.
withDefaults(defineProps<{ following: boolean; pending: boolean; visitante: boolean; painel?: boolean }>(), { painel: true })
const emit = defineEmits<{ acompanhar: [] }>()
</script>

<template>
  <section class="tfe" :class="{ 'tfe--so': !painel }">
    <div v-if="painel" v-revelar class="tfe__painel">
      <MarcaCorte class="tfe__corte nu-corte-fundo" :largura="520" cor="var(--nu-white)" />
      <div class="tfe__texto">
        <NuEyebrow como="p" sobre="azul">Acompanhar</NuEyebrow>
        <h2 class="tfe__h2">Acompanhe esta tese.</h2>
        <p class="tfe__p">A tese é revalidada todo dia pela Aportou. Acompanhe e receba alertas.</p>
      </div>
      <div class="tfe__acao">
        <NuBotaoSeta variante="creme" tamanho="g" :aria-pressed="visitante ? undefined : following" :aria-busy="pending || undefined" @click="emit('acompanhar')">
          {{ visitante ? 'Criar conta grátis' : following ? 'Acompanhando' : 'Acompanhar esta tese' }}
        </NuBotaoSeta>
        <span v-if="visitante" class="tfe__micro">Grátis, sem cartão de crédito</span>
      </div>
    </div>
    <p class="tfe__aviso">Tese é estudo, não é recomendação de compra ou venda.</p>
  </section>
</template>

<style scoped>
.tfe {
  background: var(--nu-page);
  padding: clamp(40px, 4.4vw, 64px) var(--nu-coluna) clamp(56px, 6vw, 96px);
}
.tfe__painel {
  position: relative; overflow: hidden; border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
  padding: clamp(32px, 3.8vw, 56px); display: flex; align-items: center; justify-content: space-between; gap: 32px 48px; flex-wrap: wrap;
}
/* o corte gigante, branco a 8%, no canto (posição e tamanho: a classe global .nu-corte-fundo) */
.tfe__corte { --corte-l: 520px; opacity: .08; }
.tfe__texto { position: relative; flex: 1 1 420px; min-width: min(300px, 100%); }
.tfe__h2 { margin: 16px 0 0; font-size: var(--nu-fs-h2-sm); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; text-wrap: balance; }
.tfe__p { margin: 16px 0 0; max-width: 44ch; color: var(--nu-blue-on-blue); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); line-height: 1.45; }
.tfe__acao { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.tfe__micro { color: var(--nu-blue-on-blue-2); font-size: 13px; font-weight: var(--nu-w-texto); }
.tfe--so { padding-top: 0; }
.tfe--so .tfe__aviso { margin-top: 0; }
.tfe__aviso { margin: 24px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); text-align: center; }
@media (max-width: 560px) {
  .tfe__painel { border-radius: var(--nu-r-card-lg); }
  .tfe__acao, .tfe__acao :deep(.nbs) { width: 100%; }
  .tfe__acao :deep(.nbs) { display: flex; }
}

</style>
