<script setup lang="ts">
/**
 * A moldura das telas de produto da /business (04/11/2026). Duas:
 *  - `painel`: o navegador com o painel do escritório (redentia.com.br/business/...),
 *    a barra com os três pontos e o endereço;
 *  - `assistente`: a conversa no assistente da mesa, onde as telas do Redentia
 *    MCP aparecem. Sem logo de ninguém: a barra diz "Assistente da mesa" e a
 *    legenda da página diz que é o Claude ou o ChatGPT que o escritório usa.
 * `rotulo` é a etiqueta honesta ("Exemplo"): dado de exemplo nunca aparece
 * sem ela. No assistente ela vem colada ao nome, à esquerda, e não no canto:
 * a janela grande do hero vaza pela borda direita e a etiqueta sumia junto.
 */
withDefaults(defineProps<{ tipo?: 'painel' | 'assistente'; endereco?: string; rotulo?: string; escuro?: boolean; composer?: boolean }>(), {
  tipo: 'painel', endereco: 'redentia.com.br/business', rotulo: 'Exemplo', escuro: false, composer: false,
})
</script>

<template>
  <div class="bzj" :class="[`bzj--${tipo}`, { 'bzj--escuro': escuro }]">
    <div class="bzj__barra" aria-hidden="true">
      <span class="bzj__pontos"><i /><i /><i /></span>
      <span v-if="tipo === 'painel'" class="bzj__end">{{ endereco }}</span>
      <span v-else class="bzj__quem"><img src="/logo-azul.svg" alt="" width="14" height="14">Assistente da mesa</span>
      <span class="bzj__rot">{{ rotulo }}</span>
    </div>
    <div class="bzj__corpo"><slot /></div>
    <div v-if="composer" class="bzj__composer" aria-hidden="true">
      <span>Pergunte ao assistente do escritório</span>
      <i class="bzj__enviar" />
    </div>
  </div>
</template>

<style scoped>
.bzj {
  position: relative; display: flex; flex-direction: column; overflow: hidden;
  border-radius: var(--nu-r-panel); background: var(--nu-white);
  box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 40px 90px -36px rgba(12, 21, 36, .55), 0 12px 24px -16px rgba(12, 21, 36, .25);
}
.bzj--escuro { box-shadow: 0 0 0 1px var(--nu-white-14), 0 50px 110px -40px rgba(0, 0, 0, .85), 0 0 80px -30px color-mix(in srgb, var(--nu-blue) 45%, transparent); }
.bzj__barra {
  flex-shrink: 0; display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 14px;
  background: var(--nu-tela-bloco); border-bottom: 1px solid var(--nu-tela-linha);
}
.bzj__pontos { display: flex; gap: 6px; }
.bzj__pontos i { width: 10px; height: 10px; border-radius: 50%; background: var(--nu-tela-linha); }
.bzj__end {
  flex: 1; min-width: 0; max-width: 340px; margin: 0 auto; height: 24px; padding: 0 12px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  background: var(--nu-white); color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500;
}
.bzj__quem { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.bzj--assistente .bzj__rot { margin-right: auto; }
.bzj__rot {
  flex-shrink: 0; padding: 2px 9px; border-radius: var(--nu-r-pill); background: var(--nu-white);
  color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 700; box-shadow: inset 0 0 0 1px var(--nu-tela-linha);
}
.bzj__corpo { position: relative; flex: 1; min-height: 0; }
.bzj__composer {
  flex-shrink: 0; display: flex; align-items: center; gap: 12px; margin: 0 14px 14px; height: 46px; padding: 0 8px 0 16px;
  border-radius: var(--nu-r-pill); background: var(--nu-tela-bloco); color: var(--nu-tela-nota); font-size: var(--nu-fs-sm); font-weight: 500;
}
.bzj__composer span { flex: 1; }
.bzj__enviar { width: 30px; height: 30px; border-radius: 50%; background: var(--nu-blue); }
</style>
