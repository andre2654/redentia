<script setup lang="ts">
// Vinhetas do painel da nav (NuHeader) — miniaturas ILUSTRATIVAS de cada
// destino, no espírito da referência enviada pelo dono (2026-08-20): lista à
// esquerda, preview elegante à direita trocando no hover.
// Regra de ouro respeitada à risca: tudo abstrato (barras, formas, typing
// dots) — NENHUM número ou ticker fingindo ser dado real (regra 7 do DS).
// Cores 100% por token; branco sobre creme (o view do painel é creme).
defineProps<{ name: string }>()
</script>

<template>
  <!-- root único: comentários entre v-if na raiz viram fragmento e o
       <Transition> do header não anima fragmento -->
  <div class="nuvw">
  <!-- MCP: a conversa da referência — pergunta do usuário + a casa "digitando" -->
  <div v-if="name === 'mcp'" class="nuv nuv--mcp">
    <div class="nuv__bubble nuv__bubble--user">Quanto de Apple tem no IVVB11?</div>
    <div class="nuv__bubble nuv__bubble--ai">
      <span class="nuv__brandword">Redentia MCP</span>
      <span class="nuv__dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
    <div class="nuv__bubble nuv__bubble--user nuv__bubble--ghost">Por que a minha carteira caiu hoje?</div>
  </div>

  <!-- Calculadoras: a curva de juros compostos, sem números -->
  <div v-else-if="name === 'calculadoras'" class="nuv nuv--calc">
    <div class="nuv__card">
      <div class="nuv__chiprow">
        <span class="nuv__chip">aportes</span>
        <span class="nuv__chip nuv__chip--blue">juros compostos</span>
      </div>
      <svg class="nuv__curve" viewBox="0 0 320 150" fill="none" aria-hidden="true">
        <path d="M8 142 C 90 138, 160 128, 210 100 S 290 30, 312 14" stroke="var(--nu-blue)" stroke-width="3.5" stroke-linecap="round" />
        <path d="M8 142 C 100 140, 190 136, 312 118" stroke="var(--nu-sand)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7" />
        <circle cx="312" cy="14" r="6" fill="var(--nu-blue)" />
        <circle cx="312" cy="14" r="11" fill="var(--nu-blue)" opacity=".18" />
      </svg>
      <div class="nuv__axis" />
    </div>
  </div>

  <!-- Dividend yields: pódio onde cada linha paga — pílula verde no fim -->
  <div v-else-if="name === 'rank-yield'" class="nuv nuv--rank">
    <div class="nuv__card nuv__card--pad">
      <div v-for="n in 3" :key="n" class="nuv__rankrow">
        <span class="nuv__rankpos" :class="{ 'nuv__rankpos--top': n === 1 }">{{ n }}º</span>
        <span class="nuv__ranklabel" :style="{ width: `${80 - n * 12}px` }" />
        <span class="nuv__rankbar"><i :style="{ width: `${94 - (n - 1) * 26}%` }" /></span>
        <span class="nuv__yield" :style="{ width: `${52 - (n - 1) * 8}px` }">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6" /></svg>
        </span>
      </div>
    </div>
  </div>

  <!-- Graham: preço justo vs preço de tela, com a margem de segurança no vão -->
  <div v-else-if="name === 'rank-graham'" class="nuv nuv--graham">
    <div class="nuv__card nuv__card--pad">
      <div class="nuv__gbar-group">
        <span class="nuv__chip nuv__chip--blue">preço justo</span>
        <span class="nuv__gbar nuv__gbar--justo" />
      </div>
      <div class="nuv__gbar-group">
        <span class="nuv__chip">preço de tela</span>
        <span class="nuv__gbar nuv__gbar--tela" />
      </div>
      <div class="nuv__ggap" aria-hidden="true">
        <span class="nuv__ggap-line" />
        <span class="nuv__chip nuv__chip--green">margem de segurança</span>
      </div>
    </div>
  </div>

  <!-- Bazin: o teto de preço filtrando — passa quem rende abaixo da linha -->
  <div v-else-if="name === 'rank-bazin'" class="nuv nuv--bazin">
    <div class="nuv__card nuv__card--pad nuv__bazincard">
      <div class="nuv__teto">
        <span class="nuv__teto-line" />
        <span class="nuv__chip">teto de preço</span>
      </div>
      <div class="nuv__bdots" aria-hidden="true">
        <i class="nuv__bdot nuv__bdot--out" style="left: 12%; top: 8%" />
        <i class="nuv__bdot nuv__bdot--out" style="left: 58%; top: 16%" />
        <i class="nuv__bdot" style="left: 26%; top: 58%" />
        <i class="nuv__bdot" style="left: 48%; top: 76%" />
        <i class="nuv__bdot" style="left: 74%; top: 62%" />
        <i class="nuv__bdot nuv__bdot--best" style="left: 88%; top: 84%" />
      </div>
    </div>
  </div>

  <!-- Todos os rankings: a galeria de cortes -->
  <div v-else-if="name === 'rank-todos'" class="nuv nuv--rtodos">
    <div class="nuv__rgrid">
      <div v-for="g in 4" :key="g" class="nuv__card nuv__minirank" :class="{ 'nuv__minirank--hot': g === 1 }">
        <span v-for="r in 3" :key="r" class="nuv__minirow">
          <i class="nuv__minipos" :class="{ 'nuv__minipos--top': r === 1 }" />
          <i class="nuv__minibar" :style="{ width: `${74 - r * 16}%` }" />
        </span>
      </div>
    </div>
  </div>

  <!-- Guias: a trilha passo a passo, do primeiro aporte até o check -->
  <div v-else-if="name === 'guias'" class="nuv nuv--guias">
    <div class="nuv__card nuv__card--pad nuv__guidecard">
      <span class="nuv__chip nuv__chip--blue">passo a passo</span>
      <div class="nuv__steps">
        <div class="nuv__step">
          <span class="nuv__stepdot nuv__stepdot--done">1</span>
          <span class="nuv__line" style="width: 64%" />
        </div>
        <div class="nuv__step">
          <span class="nuv__stepdot nuv__stepdot--now">2</span>
          <span class="nuv__line" style="width: 48%" />
        </div>
        <div class="nuv__step">
          <span class="nuv__stepdot">3</span>
          <span class="nuv__line nuv__line--soft" style="width: 56%" />
        </div>
        <div class="nuv__step">
          <span class="nuv__stepdot nuv__stepdot--goal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L20 7" /></svg>
          </span>
          <span class="nuv__line nuv__line--soft" style="width: 38%" />
        </div>
      </div>
    </div>
  </div>

  <!-- Notícias: manchete + a leitura editorial da casa -->
  <div v-else-if="name === 'noticias'" class="nuv nuv--news">
    <div class="nuv__card nuv__card--pad">
      <span class="nuv__line nuv__line--bold" style="width: 88%" />
      <span class="nuv__line nuv__line--bold" style="width: 64%" />
      <div class="nuv__quote">
        <span class="nuv__brandword">Leitura da Redentia</span>
        <span class="nuv__line nuv__line--soft" style="width: 92%" />
        <span class="nuv__line nuv__line--soft" style="width: 70%" />
      </div>
    </div>
  </div>

  <!-- Setores: o mapa de calor da bolsa -->
  <div v-else-if="name === 'setores'" class="nuv nuv--map">
    <div class="nuv__grid">
      <i v-for="(t, i) in ['g','g2','s','r','g','s','g2','s','r2','g','s','g2']" :key="i" :class="`nuv__tile nuv__tile--${t}`" />
    </div>
  </div>

  <!-- Glossário: os termos que o investidor esbarra todo dia, um aberto -->
  <div v-else-if="name === 'glossario'" class="nuv nuv--gloss">
    <div class="nuv__glosschips">
      <span class="nuv__chip nuv__chip--lg">P/L</span>
      <span class="nuv__chip nuv__chip--lg nuv__chip--blue">DY</span>
      <span class="nuv__chip nuv__chip--lg">P/VP</span>
      <span class="nuv__chip nuv__chip--lg">ROE</span>
    </div>
    <div class="nuv__card nuv__card--pad nuv__glosscard">
      <span class="nuv__glossterm">DY <em>dividend yield</em></span>
      <span class="nuv__line nuv__line--soft" style="width: 88%" />
      <span class="nuv__line nuv__line--soft" style="width: 62%" />
    </div>
  </div>

  <!-- Teses: convicção da casa -->
  <div v-else-if="name === 'teses'" class="nuv nuv--teses">
    <div class="nuv__card nuv__card--pad">
      <div class="nuv__tiles" aria-hidden="true"><i /><i /><i /><i /></div>
      <span class="nuv__line" style="width: 74%" />
      <div class="nuv__convrow">
        <span class="nuv__convlabel">Convicção</span>
        <span class="nuv__convbar"><i /></span>
      </div>
      <span class="nuv__line nuv__line--soft" style="width: 86%" />
    </div>
  </div>

  <!-- Carteira: composição + o dia lido pela casa -->
  <div v-else-if="name === 'carteira'" class="nuv nuv--port">
    <div class="nuv__card nuv__card--pad nuv__portcard">
      <span class="nuv__donut" aria-hidden="true"><i /></span>
      <div class="nuv__portlegend">
        <span class="nuv__legrow"><i class="nuv__dot nuv__dot--blue" /><span class="nuv__line nuv__line--soft" style="width: 74px" /></span>
        <span class="nuv__legrow"><i class="nuv__dot nuv__dot--soft" /><span class="nuv__line nuv__line--soft" style="width: 58px" /></span>
        <span class="nuv__legrow"><i class="nuv__dot nuv__dot--sand" /><span class="nuv__line nuv__line--soft" style="width: 64px" /></span>
        <span class="nuv__up" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6" /></svg>
          hoje
        </span>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.nuvw { position: absolute; inset: 0; }
.nuv {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 26px;
}
.nuv__card {
  background: var(--nu-white); border-radius: var(--nu-r-tile);
  box-shadow: 0 14px 34px -18px rgba(12, 21, 36, 0.22);
}
.nuv__card--pad { padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }

/* blocos de texto abstratos (nunca dado falso) */
.nuv__line { display: block; height: 9px; border-radius: 999px; background: var(--nu-ink-14); }
.nuv__line--bold { height: 12px; background: var(--nu-ink-30); }
.nuv__line--soft { background: var(--nu-ink-04); height: 8px; background: var(--nu-cream-3); }
.nuv__chiprow { display: flex; gap: 6px; }
.nuv__chip {
  display: inline-flex; align-self: flex-start; padding: 4px 10px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-gray-2); font-size: 11.5px; font-weight: 700;
}
.nuv__chip--blue { background: var(--nu-blue-tint); color: var(--nu-blue); }
.nuv__brandword { color: var(--nu-blue); font-size: 11.5px; font-weight: 800; letter-spacing: 0.01em; }

/* ——— MCP (chat) ——— */
.nuv--mcp { align-items: stretch; justify-content: center; }
.nuv__bubble {
  max-width: 78%; padding: 11px 15px; border-radius: 16px;
  background: var(--nu-white); box-shadow: 0 10px 26px -16px rgba(12, 21, 36, 0.24);
  font-size: 13.5px; font-weight: 600; color: var(--nu-gray-3); line-height: 1.35;
}
.nuv__bubble--user { align-self: flex-end; border-bottom-right-radius: 6px; }
.nuv__bubble--ai {
  align-self: flex-start; border-bottom-left-radius: 6px;
  display: flex; align-items: center; gap: 10px;
}
.nuv__bubble--ghost { opacity: 0.45; }
.nuv__dots { display: inline-flex; gap: 4px; }
.nuv__dots i {
  width: 6px; height: 6px; border-radius: 50%; background: var(--nu-blue);
  animation: nuv-dot 1.1s ease-in-out infinite;
}
.nuv__dots i:nth-child(2) { animation-delay: 0.15s; }
.nuv__dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes nuv-dot { 0%, 60%, 100% { opacity: 0.25; transform: none; } 30% { opacity: 1; transform: translateY(-3px); } }

/* ——— Calculadoras ——— */
.nuv--calc .nuv__card { padding: 16px 16px 12px; width: min(340px, 100%); }
.nuv__curve { display: block; width: 100%; height: auto; }
.nuv__axis { height: 2px; border-radius: 999px; background: var(--nu-cream-2); margin-top: 4px; }

/* ——— Dividend yields (pódio que paga) ——— */
.nuv--rank .nuv__card { width: min(340px, 100%); gap: 14px; }
.nuv__rankrow { display: flex; align-items: center; gap: 12px; }
.nuv__rankpos {
  width: 30px; height: 30px; border-radius: 10px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream); color: var(--nu-gray-2); font-size: 12.5px; font-weight: 800;
}
.nuv__rankpos--top { background: var(--nu-blue-tint); color: var(--nu-blue); }
.nuv__ranklabel { height: 9px; border-radius: 999px; background: var(--nu-ink-14); flex-shrink: 0; }
.nuv__rankbar { flex: 1; height: 10px; border-radius: 999px; background: var(--nu-cream); overflow: hidden; }
.nuv__rankbar i { display: block; height: 100%; border-radius: 999px; background: var(--nu-blue); opacity: 0.9; }
.nuv__yield {
  height: 22px; border-radius: 999px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-green-bg); color: var(--nu-green-2);
}

/* ——— Graham (justo vs tela + margem) ——— */
.nuv--graham .nuv__card { width: min(330px, 100%); gap: 12px; }
.nuv__gbar-group { display: flex; flex-direction: column; gap: 7px; }
.nuv__gbar { display: block; height: 14px; border-radius: 999px; }
.nuv__gbar--justo { width: 92%; background: var(--nu-blue); opacity: 0.92; }
.nuv__gbar--tela { width: 58%; background: var(--nu-sand-2); }
.nuv__ggap { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.nuv__ggap-line {
  width: 58px; height: 0; flex-shrink: 0;
  border-top: 2.5px dashed var(--nu-sand);
}
.nuv__chip--green { background: var(--nu-green-bg); color: var(--nu-green-2); }

/* ——— Bazin (teto filtrando) ——— */
.nuv__bazincard { width: min(330px, 100%); gap: 0; }
.nuv__teto { display: flex; align-items: center; gap: 10px; }
.nuv__teto-line { flex: 1; height: 0; border-top: 2.5px dashed var(--nu-red); opacity: 0.55; }
.nuv__bdots { position: relative; height: 118px; margin-top: 6px; }
.nuv__bdot {
  position: absolute; width: 15px; height: 15px; border-radius: 50%;
  background: var(--nu-blue); opacity: 0.9;
}
.nuv__bdot--out { background: var(--nu-sand-2); opacity: 1; }
.nuv__bdot--best {
  background: var(--nu-green); width: 18px; height: 18px;
  box-shadow: 0 0 0 5px var(--nu-green-bg);
}

/* ——— Todos os rankings (galeria) ——— */
.nuv__rgrid { display: grid; grid-template-columns: repeat(2, 150px); gap: 10px; }
.nuv__minirank { padding: 13px 14px; display: flex; flex-direction: column; gap: 9px; }
.nuv__minirank--hot { outline: 2.5px solid var(--nu-blue); outline-offset: -2.5px; }
.nuv__minirow { display: flex; align-items: center; gap: 7px; }
.nuv__minipos { width: 12px; height: 12px; border-radius: 4px; background: var(--nu-cream); flex-shrink: 0; }
.nuv__minipos--top { background: var(--nu-blue-tint); }
.nuv__minibar { height: 7px; border-radius: 999px; background: var(--nu-cream-3); }
.nuv__minirank--hot .nuv__minibar { background: var(--nu-blue-tint); }
.nuv__minirank--hot .nuv__minirow:first-child .nuv__minibar { background: var(--nu-blue); opacity: 0.85; }

/* ——— Guias (trilha passo a passo) ——— */
.nuv__guidecard { width: min(300px, 100%); gap: 14px; }
.nuv__steps { position: relative; display: flex; flex-direction: column; gap: 16px; }
.nuv__steps::before {
  content: ''; position: absolute; left: 14px; top: 10px; bottom: 10px;
  width: 2.5px; border-radius: 999px; background: var(--nu-cream-2);
}
.nuv__step { display: flex; align-items: center; gap: 12px; position: relative; }
.nuv__stepdot {
  width: 29px; height: 29px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream); color: var(--nu-gray-2);
  font-size: 12.5px; font-weight: 800;
  box-shadow: 0 0 0 3px var(--nu-white);
}
.nuv__stepdot--done { background: var(--nu-blue); color: var(--nu-white); }
.nuv__stepdot--now { background: var(--nu-blue-tint); color: var(--nu-blue); }
.nuv__stepdot--goal { background: var(--nu-green-bg); color: var(--nu-green-2); }

/* ——— Notícias ——— */
.nuv--news .nuv__card { width: min(330px, 100%); }
.nuv__quote {
  border-left: 3px solid var(--nu-blue); padding: 4px 0 4px 12px; margin-top: 4px;
  display: flex; flex-direction: column; gap: 8px;
}

/* ——— Setores (heatmap) ——— */
.nuv__grid { display: grid; grid-template-columns: repeat(4, 58px); gap: 8px; }
.nuv__tile { height: 46px; border-radius: 12px; }
.nuv__tile--g { background: var(--nu-green-bg); }
.nuv__tile--g2 { background: var(--nu-green-tint); }
.nuv__tile--s { background: var(--nu-sand-2); }
.nuv__tile--r { background: var(--nu-red-tint); }
.nuv__tile--r2 { background: var(--nu-red-tint); opacity: 0.55; }

/* ——— Glossário (termos do dia a dia, um aberto) ——— */
.nuv--gloss { gap: 12px; }
.nuv__glosschips { display: flex; gap: 7px; }
.nuv__chip--lg { padding: 7px 14px; font-size: 13px; font-weight: 800; }
.nuv__glosscard { width: min(290px, 100%); }
.nuv__glossterm {
  color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -0.01em;
  display: flex; align-items: baseline; gap: 8px;
}
.nuv__glossterm em { font-style: normal; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— Teses ——— */
.nuv--teses .nuv__card { width: min(320px, 100%); }
.nuv__tiles { display: flex; gap: 6px; }
.nuv__tiles i { width: 26px; height: 26px; border-radius: 8px; background: var(--nu-amber); opacity: 0.9; }
.nuv__tiles i:nth-child(2) { opacity: 0.65; }
.nuv__tiles i:nth-child(3) { opacity: 0.45; }
.nuv__tiles i:nth-child(4) { opacity: 0.3; }
.nuv__convrow { display: flex; align-items: center; gap: 10px; }
.nuv__convlabel { font-size: 11.5px; font-weight: 800; color: var(--nu-gray-2); text-transform: uppercase; letter-spacing: 0.06em; }
.nuv__convbar { flex: 1; height: 10px; border-radius: 999px; background: var(--nu-cream); overflow: hidden; }
.nuv__convbar i { display: block; height: 100%; width: 82%; border-radius: 999px; background: var(--nu-blue); }

/* ——— Carteira ——— */
.nuv__portcard { flex-direction: row; align-items: center; gap: 20px; }
.nuv__donut {
  width: 104px; height: 104px; border-radius: 50%; flex-shrink: 0; position: relative;
  background: conic-gradient(var(--nu-blue) 0 46%, var(--nu-blue-soft) 46% 68%, var(--nu-sand-2) 68% 86%, var(--nu-cream-3) 86% 100%);
}
.nuv__donut i {
  position: absolute; inset: 26px; border-radius: 50%; background: var(--nu-white);
}
.nuv__portlegend { display: flex; flex-direction: column; gap: 10px; }
.nuv__legrow { display: flex; align-items: center; gap: 8px; }
.nuv__dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.nuv__dot--blue { background: var(--nu-blue); }
.nuv__dot--soft { background: var(--nu-blue-soft); }
.nuv__dot--sand { background: var(--nu-sand); }
.nuv__up {
  margin-top: 2px; display: inline-flex; align-items: center; gap: 4px; align-self: flex-start;
  padding: 3px 9px; border-radius: var(--nu-r-pill); background: var(--nu-green-bg);
  color: var(--nu-green-2); font-size: 11px; font-weight: 800;
}
</style>
