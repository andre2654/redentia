<script setup lang="ts">
// "Sua carteira, dentro do ChatGPT e do Claude." (31/10/2026, pedido do dono:
// mostrar que dá para conectar a IA pelo MCP, com a animação do /mcp). O
// filme é o McpHeroDemo (o Claude chamando a Aportou e respondendo com a
// carteira). O ChatGPT conecta pelo modo desenvolvedor, como diz o /mcp.
</script>

<template>
  <section class="amc" aria-labelledby="amc-titulo">
    <div class="amc__cols">
      <div class="amc__texto">
        <NuEyebrow>Aportou MCP</NuEyebrow>
        <h2 id="amc-titulo" class="amc__titulo">Sua carteira, dentro <br>do ChatGPT e do Claude.</h2>
        <p class="amc__dek">
          Conecte a Aportou à IA que você já usa. Ela passa a responder com a sua carteira,
          as cotações da B3, as teses e as notícias, e a rodar cenários sobre ela.
        </p>
        <ul class="amc__ias" aria-label="Assistentes compatíveis">
          <li>ChatGPT</li><li>Claude</li><li>Cursor</li><li>Raycast</li>
        </ul>
        <div class="amc__acao">
          <AssinaturaConectar origem="mcp" />
          <NuxtLink to="/mcp" class="amc__link">Como funciona o MCP</NuxtLink>
        </div>
      </div>
      <div class="amc__lado">
        <McpHeroDemo />
      </div>
    </div>
  </section>
</template>

<style scoped>
.amc { background: var(--nu-band); padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)); }
.amc__cols { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); align-items: center; }
.amc__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02; }
.amc__dek { margin: 20px 0 0; max-width: 54ch; color: var(--nu-gray-3); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.amc__ias { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.amc__ias li { padding: 7px 13px; border-radius: var(--nu-r-tag); background: var(--nu-white); color: var(--nu-ink); font-size: 14px; font-weight: var(--nu-w-medio); box-shadow: var(--nu-shadow-quente); }
.amc__acao { display: flex; align-items: center; gap: 14px 22px; flex-wrap: wrap; margin-top: clamp(26px, 3.2vw, 36px); }
.amc__link { display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; transition: color .2s; }
.amc__link:hover { color: var(--nu-blue-text); }
.amc__lado { display: flex; justify-content: center; }
@media (max-width: 900px) {
  .amc__cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .amc__titulo br { display: none; }
}
</style>
