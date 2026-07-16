<script setup lang="ts">
// Banner "converse com a sua carteira" (dono 2026-07-16): faixa baixa entre
// Posições e o Raio-X convidando pro Redentia MCP (perguntar sobre a própria
// carteira direto do ChatGPT/Claude/Cursor). Mesma linguagem visual do card
// MCP de /conta (ContaMcp: gradiente azul + glow mint + tiles dos apps, cores
// exatas do design, não tokens --nu-*). Só apresentação: o CTA leva pra
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
  <section class="cmb" aria-label="Redentia MCP">
    <NuxtLink to="/conta#mcp" class="cmb__card">
      <div class="cmb__glow" aria-hidden="true" />

      <div class="cmb__txt">
        <div class="cmb__eyebrow">
          <span class="cmb__badge">Novo</span>
          <span class="cmb__brand">Redentia MCP</span>
        </div>
        <h2 class="cmb__title">Converse com a sua carteira.</h2>
        <p class="cmb__sub">Pergunte sobre seus investimentos direto no ChatGPT, Claude ou Cursor. Seus dados, no seu assistente de IA.</p>
      </div>

      <div class="cmb__side">
        <div class="cmb__apps" aria-hidden="true">
          <span v-for="a in apps" :key="a.name" class="cmb__app" :title="a.name">
            <img :src="a.logo" :alt="a.name" class="cmb__app-img" width="34" height="34">
          </span>
        </div>
        <span class="cmb__cta">
          Ativar o MCP
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
        </span>
      </div>
    </NuxtLink>
  </section>
</template>

<style scoped>
/* faixa baixa: o padding-top fica por conta da banda de Posições (cream) acima */
.cmb { background: var(--nu-cream); padding: 0 clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 72px); }

.cmb__card {
  position: relative; overflow: hidden; display: flex; align-items: center;
  justify-content: space-between; gap: clamp(20px, 3vw, 44px); flex-wrap: wrap;
  border-radius: 26px; padding: clamp(24px, 3vw, 34px) clamp(24px, 3.4vw, 44px);
  background: linear-gradient(150deg, #123A8F 0%, #1E4FC2 46%, #2F6BFF 100%);
  transition: transform .18s ease, box-shadow .18s ease;
}
.cmb__card:hover { transform: translateY(-2px); box-shadow: 0 18px 44px rgba(18, 58, 143, .28); }
.cmb__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.cmb__glow {
  position: absolute; top: -110px; right: -60px; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(143, 240, 181, .26) 0%, rgba(143, 240, 181, 0) 70%);
  pointer-events: none;
}

.cmb__txt { position: relative; max-width: 640px; }
.cmb__eyebrow { display: flex; align-items: center; gap: 10px; }
.cmb__badge {
  display: inline-flex; align-items: center;
  background: rgba(143, 240, 181, .92); color: #0A2050;
  font-size: 10.5px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px;
}
.cmb__brand { color: rgba(245, 241, 234, .72); font-size: 12.5px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.cmb__title { margin: 12px 0 0; color: #fff; font-size: clamp(22px, 2.4vw, 30px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.cmb__sub { margin: 8px 0 0; color: rgba(245, 241, 234, .8); font-size: 15px; font-weight: 600; line-height: 1.55; text-wrap: pretty; }

.cmb__side { position: relative; display: flex; align-items: center; gap: clamp(16px, 2vw, 26px); flex-wrap: wrap; }
/* tiles dos apps empilhados (mesmas cores do ContaMcp), leve overlap de stack */
.cmb__apps { display: flex; align-items: center; }
.cmb__app {
  width: 34px; height: 34px; border-radius: 10px; background: #fff; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(30, 79, 194, .9); margin-left: -8px;
  transition: transform .18s ease;
}
.cmb__app:first-child { margin-left: 0; }
.cmb__app-img { width: 100%; height: 100%; object-fit: contain; padding: 5px; display: block; }
.cmb__card:hover .cmb__app { transform: translateY(-1px); }

.cmb__cta {
  display: inline-flex; align-items: center; gap: 9px;
  background: #fff; color: #123A8F;
  border-radius: 999px; padding: 13px 24px; font-size: 15px; font-weight: 800;
  white-space: nowrap; transition: background .18s ease;
}
.cmb__card:hover .cmb__cta { background: #8FF0B5; color: #0A2050; }
</style>
