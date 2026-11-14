<script setup lang="ts">
// "Sua carteira, dentro do ChatGPT e do Claude." (31/10/2026, pedido do dono:
// mostrar que dá para conectar a IA pelo MCP, com a animação do /mcp). O
// filme é o McpHeroDemo (o Claude chamando a Aportou e respondendo com a
// carteira). O ChatGPT conecta pelo modo desenvolvedor, como diz o /mcp.
// Robustez (11/11/2026): entra ao rolar (v-revelar); os assistentes são NuSelo
// de contorno e "Como funciona o MCP" é o NuLinkSeta (a ação secundária).
</script>

<template>
  <section class="amc" aria-labelledby="amc-titulo">
    <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="amc__cols">
      <div class="amc__texto">
        <NuEyebrow>Aportou MCP</NuEyebrow>
        <h2 id="amc-titulo" class="amc__titulo">Sua carteira, dentro <br>do ChatGPT e do Claude.</h2>
        <p class="amc__dek">
          Conecte a Aportou à IA que você já usa. Ela passa a responder com a sua carteira,
          as cotações da B3, as teses e as notícias, e a rodar cenários sobre ela.
        </p>
        <ul class="amc__ias" aria-label="Assistentes compatíveis">
          <NuSelo v-for="ia in ['ChatGPT', 'Claude', 'Cursor', 'Raycast']" :key="ia" como="li" tom="contorno">{{ ia }}</NuSelo>
        </ul>
        <div class="amc__acao">
          <AssinaturaConectar origem="mcp" />
          <NuLinkSeta to="/mcp" tom="tinta" class="amc__link">Como funciona o MCP</NuLinkSeta>
        </div>
      </div>
      <div class="amc__lado">
        <McpHeroDemo />
      </div>
    </div>
  </section>
</template>

<style scoped>
.amc { background: var(--nu-band); padding: clamp(72px, 8vw, 128px) var(--nu-coluna); }
.amc__cols { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); align-items: center; }
.amc__titulo { margin: 16px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; }
.amc__dek { margin: 16px 0 0; max-width: 54ch; color: var(--nu-gray-3); font-size: var(--nu-fs-dek); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.55; }
.amc__ias { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.amc__acao { display: flex; align-items: center; gap: 16px 24px; flex-wrap: wrap; margin-top: clamp(24px, 3.2vw, 40px); }
.amc__link { font-size: 16px; }
.amc__lado { display: flex; justify-content: center; }
@media (max-width: 900px) {
  .amc__cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .amc__titulo br { display: none; }
}
</style>
