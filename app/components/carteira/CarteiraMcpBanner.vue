<script setup lang="ts">
// Banner "converse com a sua carteira" (dono 2026-07-16): faixa baixa entre
// Posições e o Raio-X convidando pro Aportou MCP (perguntar sobre a própria
// carteira direto do ChatGPT/Claude/Cursor). Mesma linguagem visual do card
// MCP de /conta (ContaMcp): desde 11/11/2026 o painel azul da Aportou, com o
// gradiente cobalto, o corte gigante branco no canto, o eyebrow com o corte e
// os tiles dos apps, tudo em tokens --nu-*. Só apresentação: o CTA leva pra
// /conta#mcp, onde a chave é gerada de verdade.
// Logos reais (public/icons, mesma fonte do ContaMcp/MercadoCarteiraConectada).
const apps = [
  { name: 'Claude', logo: '/icons/logo-claude.webp' },
  { name: 'ChatGPT', logo: '/icons/logo-chatgpt.webp' },
  { name: 'Cursor', logo: '/icons/logo-cursor.webp' },
  { name: 'Raycast', logo: '/icons/logo-raycast.webp' },
]
</script>

<template>
  <section class="cmb" aria-label="Aportou MCP">
    <NuxtLink to="/conta#mcp" class="cmb__card">
      <span class="cmb__corte nu-corte-fundo" aria-hidden="true"><MarcaCorte :largura="360" cor="var(--nu-white)" /></span>

      <div class="cmb__txt">
        <NuEyebrow sobre="azul">Aportou MCP</NuEyebrow>
        <h2 class="cmb__title">Converse com a sua carteira.</h2>
        <p class="cmb__sub">Pergunte sobre seus investimentos direto no ChatGPT, Claude ou Cursor. Seus dados, no seu assistente de IA.</p>
      </div>

      <div class="cmb__side">
        <div class="cmb__apps" aria-hidden="true">
          <span v-for="a in apps" :key="a.name" class="cmb__app">
            <span class="cmb__app-ic"><img :src="a.logo" :alt="a.name" class="cmb__app-img" width="22" height="22"></span>{{ a.name }}
          </span>
        </div>
        <span class="cmb__cta">
          Ativar o MCP
          <span class="cmb__bola" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </span>
      </div>
    </NuxtLink>
  </section>
</template>

<style scoped>
/* faixa baixa: o padding-top fica por conta da banda de Posições acima */
.cmb { background: var(--nu-page); padding: 0 max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(48px, 6vw, 72px); }

/* o painel azul da marca: gradiente cobalto, raio 32, o corte gigante branco a 8% no canto */
.cmb__card {
  position: relative; overflow: hidden; display: flex; align-items: center;
  justify-content: space-between; gap: clamp(20px, 3vw, 44px); flex-wrap: wrap;
  border-radius: var(--nu-r-card-lg); padding: clamp(24px, 3vw, 34px) clamp(24px, 3.4vw, 44px);
  background: var(--nu-grad-cobalto); color: var(--nu-white);
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.cmb__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); color: var(--nu-white); }
.cmb__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.cmb__corte { position: absolute; top: -40px; right: -70px; opacity: .08; pointer-events: none; }

.cmb__txt { position: relative; max-width: 640px; }
.cmb__title { margin: 14px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-titulo); line-height: 1.05; }
.cmb__sub { margin: 10px 0 0; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.5; text-wrap: pretty; }

.cmb__side { position: relative; display: flex; align-items: center; gap: clamp(16px, 2vw, 26px); flex-wrap: wrap; }
/* chips dos apps (logo real + nome) — mesmos do card MCP de /conta */
.cmb__apps { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cmb__app {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px;
  background: var(--nu-white-14); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
  padding: 0 15px 0 11px; border-radius: var(--nu-r-chip);
}
.cmb__app-ic {
  width: 24px; height: 24px; border-radius: 7px; background: var(--nu-white); overflow: hidden;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cmb__app-img { width: 100%; height: 100%; object-fit: contain; padding: 3px; display: block; }

/* a chamada: a pílula creme com a seta no círculo (o cartão inteiro é o link, por isso é um span) */
.cmb__cta {
  display: inline-flex; align-items: center; gap: 14px; min-height: 52px;
  background: var(--nu-creme); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 0 7px 0 24px; font-size: 16.5px; font-weight: var(--nu-w-medio);
  white-space: nowrap; transition: background var(--nu-dur-media) var(--nu-ease-cor);
}
.cmb__bola { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: var(--nu-ink); color: var(--nu-creme); }
.cmb__card:hover .cmb__cta { background: var(--nu-white); }
.cmb__card:hover .cmb__bola svg { animation: nu-seta var(--nu-dur-lenta) var(--nu-ease-cor); }
.cmb__card:active { transform: scale(.99); }

@media (max-width: 520px) {
  .cmb__corte { right: -160px; }
  .cmb__cta { width: 100%; justify-content: space-between; }
}
</style>
