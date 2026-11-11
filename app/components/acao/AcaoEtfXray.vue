<script setup lang="ts">
// Raio-X de ETF — layout "duas bandas finas" (Opção B, escolhida pelo dono em
// 19/08/2026 no canvas de variantes). Anatomia das outras seções da página:
// H2 2 linhas à esquerda + conteúdo à direita, uma banda por assunto:
//   Banda 1 (branca) "Dentro do ETF."     — barra por tipo + top-5 posições
//   Banda 2 (creme)  "O custo e o movimento." — cards de custo (com o número
//     sentível de "10 anos"), taxa-sobre-taxa quando existe, correlação 12m
// O detalhe completo (carteira inteira, exposição look-through com "via",
// matriz 90d/12m, ficha cadastral, avisos) abre no AcaoEtfXrayModal — mesma
// decisão do Diário da tese: a página é o gancho, o modal é a leitura.
// as_of da CVM sempre visível; carteira >3 meses ganha badge de staleness.
// Robustez (11/11/2026): a 1ª banda abre com o eyebrow da seção (o mesmo rótulo
// da barra, "Por dentro"), como todas as outras do /asset; a data é o NuSelo de
// contorno e o "mais de 3 meses" o âmbar; cada linha leva ao ativo com uma seta
// discreta (que fica cobalto e anda no hover), no lugar do círculo azul cheio em
// toda linha; os cartões de custo são o branco, sem subir (não são clicáveis);
// as leituras são o NuSelo; "Ver a carteira completa" e a matriz abrem pelo
// NuLinkSeta; cada banda entra com o v-revelar (não mais com nu-fade no mount).
import type { AcaoEtfXrayVM, AcaoTag } from '~/types/acao'

defineProps<{ ticker: string; xray: AcaoEtfXrayVM; eyebrow?: string }>()

const open = ref(false)
const tomDoSelo = (v: AcaoTag['variant']) => (v === 'green' ? 'verde' : v === 'amber' ? 'ambar' : 'neutro')
</script>

<template>
  <div>
    <section v-contexto-chat="{ id: `etf-dentro:${ticker}`, tipo: 'grafico', rotulo: `Dentro do ${ticker}` }" class="axb axb--white">
      <div class="axb__cols">
        <div v-revelar class="axb__left">
          <NuEyebrow v-if="eyebrow" como="p">{{ eyebrow }}</NuEyebrow>
          <h2 class="axb__title">Dentro<br>do ETF.</h2>
          <div class="axb__sub">{{ xray.subLine }}</div>
          <div class="axb__badges">
            <NuSelo tom="contorno">{{ xray.asOfLabel }}</NuSelo>
            <NuSelo v-if="xray.stale" tom="ambar" ponto>Mais de 3 meses</NuSelo>
          </div>
        </div>

        <div v-revelar class="axb__content">
          <div v-if="xray.compBar.length" class="axb__bar">
            <span v-for="s in xray.compBar" :key="s.label" class="axb__bar-seg" :style="{ width: `${s.pct}%`, background: s.color }" />
          </div>
          <div v-if="xray.compBar.length" class="axb__legend">
            <span v-for="s in xray.compBar" :key="s.label" class="axb__legend-item">
              <span class="axb__legend-dot" :style="{ background: s.color }" />{{ s.label }} <b>{{ s.pctLabel }}</b>
            </span>
          </div>

          <div class="axb__rows">
            <component
              :is="h.ticker ? 'a' : 'div'"
              v-for="h in xray.top"
              :key="h.rank"
              v-bind="h.ticker ? { href: `/asset/${h.ticker}` } : {}"
              v-contexto-chat="h.ticker ? null : { id: `etf-posicao:${ticker}:${h.rank}`, tipo: 'posicao', rotulo: rotuloCurto(`${h.name} no ${ticker}`), texto: `${h.rank}º maior posição do ${ticker}: ${h.name}, ${h.pctLabel}` }"
              class="axb__row"
              :class="{ 'axb__row--link': h.ticker }"
            >
              <span class="axb__row-rank">{{ h.rank }}</span>
              <span class="axb__row-name">
                <b v-if="h.ticker">{{ h.ticker }}</b>
                <span class="axb__row-sub">{{ h.name }}</span>
              </span>
              <span class="axb__row-bar"><span class="axb__row-fill" :style="{ width: `${(h.pct / Math.max(xray.top[0]?.pct ?? 1, 0.01)) * 100}%` }" /></span>
              <span class="axb__row-pct">{{ h.pctLabel }}</span>
              <span v-if="h.ticker" class="axb__go" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
              </span>
              <span v-else class="axb__go axb__go--vazio" aria-hidden="true" />
            </component>
          </div>

          <div class="axb__foot">
            <span v-if="xray.moreCount > 0" class="axb__more-label">+ {{ xray.moreCount }} posições menores</span>
            <NuLinkSeta @click="open = true">Ver a carteira completa</NuLinkSeta>
          </div>
        </div>
      </div>
    </section>

    <section v-if="xray.feeCards.length || xray.pageCorr.length" v-contexto-chat="{ id: `etf-custo:${ticker}`, tipo: 'grafico', rotulo: `Custo do ${ticker}` }" class="axb axb--cream">
      <div class="axb__cols">
        <div v-revelar class="axb__left">
          <h2 class="axb__title">O custo e<br>o movimento.</h2>
          <div class="axb__sub">A taxa que sai da cota todo dia, e o que o fundo realmente diversifica.</div>
        </div>

        <div v-revelar class="axb__content">
          <div v-if="xray.feeCards.length" class="axb__cards">
            <div
              v-for="c in xray.feeCards" :key="c.label"
              v-contexto-chat="{ id: `etf-taxa:${ticker}:${c.label}`, tipo: 'grafico', rotulo: rotuloCurto(`${c.label} ${ticker}`), texto: [`${c.label} (${ticker}): ${c.value}`, c.tag?.text].filter(Boolean).join('\n') }"
              class="axb__card"
            >
              <div class="axb__card-label">{{ c.label }}</div>
              <div class="axb__card-value">{{ c.value }}</div>
              <NuSelo v-if="c.tag" :tom="tomDoSelo(c.tag.variant)" class="axb__card-selo">{{ c.tag.text }}</NuSelo>
              <div v-if="c.label.startsWith('Em 10 anos')" class="axb__card-note">só de taxa, sem juros compostos</div>
            </div>
          </div>

          <template v-if="xray.feeNested.length">
            <div class="axb__lbl">Taxa sobre taxa: os fundos investidos</div>
            <NuStatList :rows="xray.feeNested" />
          </template>
          <p v-if="xray.feeNote" class="axb__note">{{ xray.feeNote }}</p>

          <template v-if="xray.pageCorr.length">
            <div class="axb__lbl">Correlação · 12 meses</div>
            <div v-contexto-chat="{ id: `etf-correlacao:${ticker}`, tipo: 'grafico', rotulo: `Correlação ${ticker}`, texto: `Correlação de 12 meses do ${ticker}: ${xray.pageCorr.map((r) => `${r.symbol} ${r.corrLabel} (${r.tag.text})`).join('; ')}` }" class="axb__corr">
              <div v-for="r in xray.pageCorr" :key="r.symbol" class="axb__corr-row">
                <span class="axb__corr-sym">{{ r.symbol }}</span>
                <span class="axb__corr-track">
                  <span class="axb__corr-mid" />
                  <span class="axb__corr-fill" :class="{ 'axb__corr-fill--neg': r.neg }" :style="r.neg ? { right: '50%', width: `${r.magPct / 2}%` } : { left: '50%', width: `${r.magPct / 2}%` }" />
                </span>
                <span class="axb__corr-val" :class="{ 'axb__corr-val--neg': r.neg }">{{ r.corrLabel }}</span>
                <NuSelo :tom="tomDoSelo(r.tag.variant)" tamanho="p" class="axb__corr-selo">{{ r.tag.text }}</NuSelo>
              </div>
            </div>
            <p class="axb__mais"><NuLinkSeta @click="open = true">Matriz completa e exposição por setor</NuLinkSeta></p>
          </template>
        </div>
      </div>
    </section>

    <AcaoEtfXrayModal :open="open" :ticker="ticker" :as-of-label="xray.asOfLabel" :modal="xray.modal" @close="open = false" />
  </div>
</template>

<style scoped>
/* a mesma coluna de 1240px do resto da página do ativo */
.axb { padding: clamp(72px, 8vw, 128px) var(--nu-coluna); }
/* Aportou: não existe faixa branca de ponta a ponta. A 1ª banda é o creme da
   página; a 2ª, a faixa quente (branco é só o cartão) */
.axb--white { background: var(--nu-page); }
.axb--cream { background: var(--nu-band); }
.axb__cols { display: flex; gap: clamp(32px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.axb__left { flex: 1 1 300px; min-width: min(280px, 100%); display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
/* o eyebrow e o título a 16px; o título e o texto de apoio, a 16 também */
.axb__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 58px);
  font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02;
}
.axb__sub { color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; }
.axb__badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.axb__content { flex: 1.35 1 420px; min-width: min(340px, 100%); }

.axb__bar { display: flex; height: 26px; border-radius: 15px; overflow: hidden; gap: 4px; }
.axb__bar-seg { height: 100%; border-radius: 5px; }
.axb__legend { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 12px; }
.axb__legend-item { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-2); font-size: 13.5px; font-weight: var(--nu-w-texto); }
.axb__legend-item b { color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.axb__legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.axb__rows { position: relative; isolation: isolate; margin-top: 16px; }
.axb__row {
  position: relative; display: flex; align-items: center; gap: 14px; min-height: 52px; padding: 8px 0; border-top: 1px solid var(--nu-line-2);
  text-decoration: none; -webkit-tap-highlight-color: transparent;
}
/* a linha que leva ao ativo acende inteira (um fundo que vaza um pouco da coluna); a seta fica cobalto e anda */
.axb__row--link::before {
  content: ''; position: absolute; inset: 3px -10px; z-index: -1; border-radius: var(--nu-r-tag); background: var(--nu-cream-2);
  opacity: 0; transition: opacity var(--nu-dur-media) var(--nu-ease-cor), background-color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.axb__row--link:hover::before, .axb__row--link:focus-visible::before { opacity: 1; }
.axb__row--link:active::before { background: var(--nu-line-2); }
.axb__row--link:hover .axb__row-name b { color: var(--nu-blue-text); }
.axb__row--link:focus-visible { outline: none; }
.axb__row--link:focus-visible::before { box-shadow: 0 0 0 3px var(--nu-blue); }
.axb__row-rank { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); width: 22px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.axb__row-name { flex: 1.1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.axb__row-name b { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.axb__row-sub { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.axb__row-bar { flex: 1; height: 6px; background: var(--nu-line-2); border-radius: var(--nu-r-pill); overflow: hidden; min-width: 70px; }
.axb__row-fill { display: block; height: 100%; background: var(--nu-blue); border-radius: var(--nu-r-pill); }
.axb__row-pct { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); min-width: 60px; text-align: right; font-variant-numeric: tabular-nums; }
/* a seta discreta: diz que a linha abre o ativo sem pintar a coluna de azul */
.axb__go {
  width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--nu-gray);
  transition: color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.axb__row--link:hover .axb__go, .axb__row--link:focus-visible .axb__go { color: var(--nu-blue-text); transform: translateX(3px); }

.axb__foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 16px; flex-wrap: wrap; font-size: var(--nu-fs-sm); }
.axb__more-label { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.axb__mais { margin: 16px 0 0; font-size: var(--nu-fs-sm); }

/* os cartões de custo: o branco sobre a faixa; não são clicáveis, então não sobem */
.axb__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 12px; }
.axb__card { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 24px; box-shadow: var(--nu-shadow-branco); }
.axb__card-label { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.axb__card-value { color: var(--nu-ink); font-size: clamp(26px, 2.4vw, 34px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); margin-top: 12px; font-variant-numeric: tabular-nums; }
.axb__card-selo { margin-top: 12px; }
.axb__card-note { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); margin-top: 12px; }

.axb__lbl { color: var(--nu-ink); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; margin-top: 32px; }
.axb__note { color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.55; margin: 12px 0 0; max-width: 620px; }

.axb__corr { margin-top: 8px; }
.axb__corr-row { display: flex; align-items: center; gap: 16px; min-height: 48px; padding: 8px 0; border-top: 1px solid var(--nu-line-2); }
.axb__corr-sym { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); width: 74px; flex-shrink: 0; }
.axb__corr-selo { flex: none; min-width: 112px; justify-content: center; }
.axb__corr-track { position: relative; flex: 1; height: 10px; background: var(--nu-line-2); border-radius: var(--nu-r-pill); }
.axb__corr-mid { position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; background: var(--nu-sand); border-radius: 1px; }
.axb__corr-fill { position: absolute; top: 0; bottom: 0; background: var(--nu-green); border-radius: var(--nu-r-pill); }
.axb__corr-fill--neg { background: var(--nu-red); }
.axb__corr-val { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); width: 48px; text-align: right; font-variant-numeric: tabular-nums; }
.axb__corr-val--neg { color: var(--nu-red-text); }

@media (max-width: 700px) {
  .axb__row-bar { min-width: 46px; }
  .axb__corr-selo { min-width: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .axb__row--link::before, .axb__go, .axb__row-name b { transition: none; }
  .axb__row--link:hover .axb__go { transform: none; }
}
</style>
