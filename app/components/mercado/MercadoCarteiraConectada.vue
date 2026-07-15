<script setup lang="ts">
// "Sua carteira, conectada." (PR-R5): banda azul que substitui os value-props
// antigos ("Investir com a Redentia é diferente"). Coluna esquerda com h2 + dek
// + fileira de avatares de banco (CSS puro, sem imagem) + CTA outline pro /login;
// coluna direita com imagem lifestyle (aspect 4/3). Copy e cores exatas do
// contrato: designs-v2/Redentia Mercado Nu.dc.html.
//
// Avatares = logos reais das marcas (tiles cheios em public/icons/*.webp),
// clipados em círculo (object-fit:cover), sobrepostos com margin negativo e
// borda 3px da cor da banda (--nu-blue). O "+110" segue como círculo de texto.
const banks = [
  { name: 'Nubank', logo: '/icons/logo-nubank.webp' },
  { name: 'Itaú', logo: '/icons/logo-itau.webp' },
  { name: 'Bradesco', logo: '/icons/logo-bradesco.webp' },
  { name: 'Santander', logo: '/icons/logo-santander.webp' },
] as const

// Imagem lifestyle real: solte o arquivo em public/img/mercado/carteira-conectada.webp.
// Enquanto o arquivo não existir, o @error cai pro placeholder on-brand embaixo.
const photoFailed = ref(false)
</script>

<template>
  <section class="mcc">
    <div class="mcc__cols">
      <div class="mcc__left">
        <h2 class="mcc__title">Sua carteira,<br>conectada.</h2>
        <div class="mcc__dek">Conecte contas de qualquer banco ou corretora e a Redentia importa seus ativos automaticamente, sem planilha.</div>
        <div class="mcc__banks">
          <span
            v-for="(b, i) in banks" :key="b.name"
            class="mcc__bank"
            :class="{ 'mcc__bank--overlap': i > 0 }"
          >
            <img :src="b.logo" :alt="b.name" class="mcc__bank-img" width="46" height="46">
          </span>
          <span class="mcc__bank mcc__bank--overlap mcc__bank--more">+110</span>
        </div>

        <!-- Teaser do Redentia MCP: a carteira conectada não fica presa no app;
             o investidor conversa com ela direto no assistente de IA. -->
        <div class="mcc__mcp">
          <span class="mcc__mcp-badge">Novo</span>
          <span class="mcc__mcp-txt">E não só aqui: converse com a sua carteira direto no Claude, ChatGPT ou Cursor com o <strong>Redentia MCP</strong>.</span>
        </div>

        <NuxtLink to="/login" class="mcc__cta">
          Conectar minha carteira<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
        </NuxtLink>
      </div>

      <div class="mcc__right">
        <!-- TODO(asset): imagem lifestyle real "carteira conectada" (André). Até
             lá, placeholder on-brand: gradiente navy/azul + glow + glifo de
             carteira/conexão. Mantém o aspect-ratio 4/3 do design. -->
        <div class="mcc__media" role="img" aria-label="Ilustração: carteira conectada">
          <!-- foto real quando existir; some pro placeholder se faltar o arquivo -->
          <!-- :src dinâmico (não estático) — senão o Vite tenta resolver o asset
               em build e falha enquanto o arquivo não existe em public/ -->
          <img
            v-show="!photoFailed" :src="'/img/mercado/carteira-conectada.webp'" alt=""
            class="mcc__media-photo" loading="lazy" @error="photoFailed = true"
          >
          <div class="mcc__media-glow" aria-hidden="true" />
          <svg class="mcc__media-art" viewBox="0 0 260 200" fill="none" aria-hidden="true">
            <!-- nós de conta orbitando -->
            <g stroke="var(--nu-blue-soft)" stroke-width="1.4" opacity="0.5">
              <path d="M70 62 L130 100" />
              <path d="M190 58 L130 100" />
              <path d="M64 138 L130 100" />
              <path d="M196 142 L130 100" />
            </g>
            <g fill="var(--nu-blue-soft)" opacity="0.85">
              <circle cx="70" cy="62" r="7" />
              <circle cx="190" cy="58" r="7" />
              <circle cx="64" cy="138" r="7" />
              <circle cx="196" cy="142" r="7" />
            </g>
            <!-- carteira central -->
            <rect x="96" y="78" width="68" height="46" rx="9" fill="var(--nu-white-14)" stroke="var(--nu-cream-text)" stroke-width="2" />
            <rect x="96" y="90" width="68" height="10" fill="var(--nu-cream-text)" opacity="0.9" />
            <circle cx="150" cy="107" r="4.5" fill="var(--nu-cream-text)" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mcc { background: var(--nu-blue); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mcc__cols { display: flex; gap: clamp(36px, 5vw, 80px); align-items: center; flex-wrap: wrap; }
.mcc__left { flex: 1 1 400px; min-width: min(320px, 100%); }
.mcc__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(40px, 5vw, 74px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.0;
}
.mcc__dek {
  color: var(--nu-cream-text-82); font-size: clamp(16px, 1.6vw, 20px); font-weight: 500;
  line-height: 1.62; margin-top: 26px; max-width: 480px;
}
.mcc__banks { display: flex; align-items: center; margin-top: 28px; }
.mcc__bank {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  overflow: hidden; background: var(--nu-cream); border: 3px solid var(--nu-blue);
}
.mcc__bank-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mcc__bank--overlap { margin-left: -14px; }
.mcc__bank--more {
  background: var(--nu-cream-text-22); color: var(--nu-cream-text);
  font-size: 12.5px; font-weight: 800;
}

/* teaser do Redentia MCP */
.mcc__mcp {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  margin-top: 26px; max-width: 480px;
}
.mcc__mcp-badge {
  flex-shrink: 0; background: var(--nu-cream-text-14); color: var(--nu-cream-text);
  font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
  padding: 5px 11px; border-radius: var(--nu-r-pill);
}
.mcc__mcp-txt { color: var(--nu-cream-text-82); font-size: 15px; font-weight: 500; line-height: 1.55; }
.mcc__mcp-txt strong { color: var(--nu-cream-text); font-weight: 800; }
.mcc__cta {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-cream-text);
  border: 1.6px solid var(--nu-cream-text-55); border-radius: var(--nu-r-pill); padding: 16px 34px;
  font-size: 16.5px; font-weight: 800; margin-top: 34px;
  transition: background .2s, border-color .2s, transform .15s;
}
.mcc__cta:hover { background: var(--nu-cream-text-12); border-color: var(--nu-cream-text); color: var(--nu-cream-text); transform: translateY(-2px); }

.mcc__right { flex: 1 1 520px; min-width: min(320px, 100%); }
.mcc__media {
  /* sem border-radius: o design usa um retângulo full-bleed (aspect 4/3) */
  position: relative; width: 100%; aspect-ratio: 4 / 3; overflow: hidden;
  background: var(--nu-img-placeholder);
  display: flex; align-items: center; justify-content: center;
}
.mcc__media-photo { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; object-fit: cover; display: block; }
.mcc__media-glow { position: absolute; inset: 0; background: var(--nu-img-glow); pointer-events: none; }
.mcc__media-art { position: relative; width: min(60%, 320px); height: auto; }
</style>
