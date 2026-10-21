<script setup lang="ts">
// "Toda tese, revisada todo dia." (21/10/2026): a faixa de teses da home
// refeita no jeito da Apple (dono: "refatore essa seção com um olhar da
// Apple"). Saem os painéis-imagem sanfonados, com o rótulo na vertical e o
// carrossel automático de 8 s. Fica um objeto só: a tese em destaque como um
// cartão vivo, com a capa, o desempenho desde o lançamento e a convicção dia a
// dia, desenhando a linha que sobe e desce com os fatos (a promessa da faixa:
// "revalidadas todos os dias, com convicção que sobe e desce conforme os
// fatos"). Embaixo, as quatro teses para escolher, sem rodar sozinhas.
// Dados: useNuTheses (a lista, a mesma de antes) e useNuTesesTrajetoria (a
// convicção e o desempenho, cacheados no servidor). Sem trajetória, o cartão
// mostra só os números da lista. O gating é o de antes: a 1ª tese abre a
// página dela; as outras convidam a criar conta (logado, abre direto).
const { theses, loading } = useNuTheses()
const slugs = computed(() => (loading.value ? [] : theses.value.map((t) => t.slug)))
const { porSlug } = useNuTesesTrajetoria(slugs)

const idx = ref(0)
const atual = computed(() => theses.value[idx.value] ?? theses.value[0]!)
const trajeto = computed(() => porSlug.value[atual.value.slug] ?? null)
const capaFalhou = ref<Record<string, boolean>>({})
watch(() => theses.value.length, () => { if (idx.value >= theses.value.length) idx.value = 0 })

const nome = (t: (typeof theses.value)[number]) => `${t.titlePre}${t.titleHi}${t.titlePost}`.trim()

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
function diaCurto(iso: string | null | undefined): string {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${Number(d)} ${MESES[Number(m) - 1] ?? ''}`
}
// "Revisada hoje": o dia do estudo contra o dia de hoje em Brasília (só no navegador: a lista da API só chega lá)
function revisada(iso: string | null | undefined): string | null {
  if (!iso) return null
  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const ontem = new Date(Date.now() - 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  if (iso === hoje) return 'Revisada hoje'
  if (iso === ontem) return 'Revisada ontem'
  return `Revisada em ${diaCurto(iso)}`
}

const conviccao = computed(() => trajeto.value?.conviccao ?? (atual.value.conviction != null ? { atual: atual.value.conviction, inicio: null, desde: null, serie: [] as number[] } : null))
const delta = computed(() => {
  const c = conviccao.value
  if (!c || c.inicio == null) return null
  const d = c.atual - c.inicio
  return { d, txt: `${d > 0 ? '▲' : d < 0 ? '▼' : '='} ${d === 0 ? 'igual' : Math.abs(d)} desde ${diaCurto(c.desde)}`, dir: d > 0 ? 'alta' : d < 0 ? 'queda' : 'igual' }
})
const desdeDesempenho = computed(() => trajeto.value?.desempenho?.desde ?? null)

/* ——— a linha da convicção: degraus (ela muda de patamar quando um fato muda) ——— */
const W = 560
const H = 132
const M = 6
const linha = computed(() => {
  const s = conviccao.value?.serie ?? []
  if (s.length < 2) return null
  const lo = Math.min(...s) - 2
  const hi = Math.max(...s) + 2
  const x = (i: number) => M + ((W - 2 * M) * i) / (s.length - 1)
  const y = (v: number) => M + ((H - 2 * M) * (hi - v)) / (hi - lo)
  let d = `M${x(0).toFixed(1)} ${y(s[0]!).toFixed(1)}`
  for (let i = 1; i < s.length; i++) {
    d += ` H${x(i).toFixed(1)}`
    if (s[i] !== s[i - 1]) d += ` V${y(s[i]!).toFixed(1)}`
  }
  const fim: [number, number] = [x(s.length - 1), y(s[s.length - 1]!)]
  return { d, area: `${d} V${H} H${M} Z`, fim, mudancas: s.slice(1).filter((v, i) => v !== s[i]).length }
})
const id = useId()
</script>

<template>
  <!-- âncora #teses: destino do link 'Explorar teses' da Home -->
  <section id="teses" class="tstz" aria-labelledby="tstz-titulo">
    <div class="tstz__cabeca">
      <div class="tstz__eyebrow">Teses Redentia</div>
      <h2 id="tstz-titulo" class="tstz__title">Toda tese,<br>revisada todo dia.</h2>
      <p class="tstz__dek">
        Pesquisa profunda que não fica velha: a IA da Redentia relê os fatos de cada tese <strong>todos os dias</strong>, e a convicção sobe ou desce com eles.
      </p>
    </div>

    <div v-if="loading" class="tstz__cartao tstz__cartao--sk" aria-hidden="true">
      <NuSkeleton tone="navy" variant="block" width="100%" height="100%" radius="card" />
    </div>
    <template v-else>
      <article :id="`${id}-tese`" class="tstz__cartao" role="tabpanel" :aria-label="nome(atual)">
        <div class="tstz__capa">
          <img
            v-if="atual.image && !capaFalhou[atual.slug]" :key="atual.slug" :src="atual.image" alt=""
            class="tstz__img" loading="lazy" @error="capaFalhou[atual.slug] = true"
          >
        </div>
        <div :key="atual.slug" class="tstz__corpo">
          <div class="tstz__topo">
            <span class="tstz__cat">{{ atual.cat }}</span>
            <span v-if="atual.rank" class="tstz__rank">{{ atual.rank }}</span>
          </div>
          <h3 class="tstz__nome">{{ nome(atual) }}</h3>
          <p class="tstz__desc">{{ atual.desc }}</p>

          <div class="tstz__numeros">
            <div v-if="atual.perf" class="tstz__numero">
              <span class="tstz__valor tstz__valor--alta">{{ atual.perf }}</span>
              <span class="tstz__rotulo">{{ desdeDesempenho ? `desde ${desdeDesempenho}` : 'desde o lançamento' }}</span>
            </div>
            <div v-if="conviccao" class="tstz__numero">
              <span class="tstz__valor">{{ conviccao.atual }}<small>/100</small></span>
              <span class="tstz__rotulo">convicção hoje</span>
              <b v-if="delta" class="tstz__delta" :class="`tstz__delta--${delta.dir}`">{{ delta.txt }}</b>
            </div>
          </div>

          <figure v-if="linha" class="tstz__trajeto" :aria-label="`Convicção de ${conviccao!.inicio} a ${conviccao!.atual}, com ${linha.mudancas} mudanças desde ${diaCurto(conviccao!.desde)}`">
            <div class="tstz__plot">
            <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="tstz__grafico" aria-hidden="true">
              <defs>
                <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" class="tstz__stop-alto" />
                  <stop offset="1" class="tstz__stop-baixo" />
                </linearGradient>
              </defs>
              <path :d="linha.area" :fill="`url(#${id}-area)`" class="tstz__area" />
              <path :d="linha.d" class="tstz__linha" vector-effect="non-scaling-stroke" />
            </svg>
            <span class="tstz__ponto" :style="{ left: `${(linha.fim[0] / W) * 100}%`, top: `${(linha.fim[1] / H) * 100}%` }" aria-hidden="true" />
            </div>
            <figcaption class="tstz__eixo"><span>{{ diaCurto(conviccao!.desde) }}</span><span>hoje</span></figcaption>
          </figure>

          <div class="tstz__pe">
            <ul v-if="atual.tickerList?.length" class="tstz__tickers" aria-label="Ativos da tese">
              <li v-for="tk in atual.tickerList.slice(0, 4)" :key="tk">{{ tk }}</li>
              <li v-if="atual.extraTickers" class="tstz__mais">+{{ atual.extraTickers }}</li>
            </ul>
            <span v-if="revisada(atual.lastStudyDate)" class="tstz__revisada">
              <span class="tstz__pulso" aria-hidden="true" />{{ revisada(atual.lastStudyDate) }}<template v-if="atual.sourcesCount"> · {{ atual.sourcesCount }} fontes</template>
            </span>
          </div>
          <NuxtLink :to="atual.ctaHref" class="tstz__cta">
            {{ atual.cta }}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </NuxtLink>
        </div>
      </article>

      <!-- as teses, para escolher: quem manda é a pessoa, nada roda sozinho -->
      <div class="tstz__escolha" role="tablist" aria-label="Teses">
        <button
          v-for="(t, i) in theses" :key="t.slug" type="button" role="tab"
          class="tstz__aba" :class="{ 'tstz__aba--on': i === idx }"
          :aria-selected="i === idx" :aria-controls="`${id}-tese`" @click="idx = i"
        >
          <span class="tstz__miniatura">
            <img v-if="t.image && !capaFalhou[t.slug]" :src="t.image" alt="" loading="lazy" @error="capaFalhou[t.slug] = true">
          </span>
          <span class="tstz__aba-nome">{{ nome(t) }}</span>
          <b v-if="t.perf" class="tstz__aba-perf">{{ t.perf }}</b>
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.tstz { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); }
.tstz__cabeca { max-width: 1180px; margin: 0 auto; }
.tstz__eyebrow { color: var(--nu-blue); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.tstz__title { margin: 12px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.tstz__dek { color: var(--nu-gray); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; margin: 20px 0 0; max-width: 620px; }
.tstz__dek strong { color: var(--nu-ink); font-weight: 800; }

/* ——— o cartão da tese ——— */
.tstz__cartao {
  display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); max-width: 1180px; min-height: 480px;
  margin: clamp(32px, 4vw, 48px) auto 0; overflow: hidden; border-radius: 32px; background: var(--nu-white);
  box-shadow: 0 30px 80px -40px rgba(10, 10, 12, 0.35), 0 0 0 1px var(--nu-cream-2);
}
.tstz__cartao--sk { display: block; height: 480px; box-shadow: none; }
.tstz__capa { position: relative; min-height: 260px; background: var(--nu-navy); overflow: hidden; }
.tstz__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: tstz-surge .7s ease both; }
.tstz__corpo { display: flex; flex-direction: column; min-width: 0; padding: clamp(26px, 3vw, 40px) clamp(24px, 3.2vw, 44px); animation: tstz-entra .6s cubic-bezier(.22, 1, .36, 1) both; }
.tstz__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tstz__cat { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.tstz__rank { padding: 5px 11px; border-radius: var(--nu-r-pill); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 700; }
.tstz__nome { margin: 8px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.tstz__desc { margin: 10px 0 0; max-width: 46ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }

.tstz__numeros { display: flex; flex-wrap: wrap; gap: 14px 40px; margin-top: 26px; }
.tstz__numero { display: flex; flex-direction: column; }
.tstz__valor { color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.tstz__valor small { margin-left: 2px; color: var(--nu-gray); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: 0; }
.tstz__valor--alta { color: var(--nu-green); }
.tstz__rotulo { margin-top: 6px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.tstz__delta { margin-top: 2px; font-size: var(--nu-fs-sm); font-weight: 700; }
.tstz__delta--alta { color: var(--nu-green); }
.tstz__delta--queda { color: var(--nu-red); }

/* a convicção dia a dia: degraus que sobem e descem com os fatos, desenhados na chegada */
.tstz__trajeto { margin: 22px 0 0; }
.tstz__plot { position: relative; height: 118px; animation: tstz-revela 1.6s cubic-bezier(.5, 0, .2, 1) .15s both; }
.tstz__grafico { display: block; width: 100%; height: 100%; overflow: visible; }
.tstz__stop-alto { stop-color: var(--nu-blue); stop-opacity: 0.16; }
.tstz__stop-baixo { stop-color: var(--nu-blue); stop-opacity: 0; }
.tstz__linha { fill: none; stroke: var(--nu-blue); stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.tstz__ponto {
  position: absolute; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--nu-blue);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--nu-blue) 18%, transparent); animation: tstz-surge .4s ease 1.6s both;
}
.tstz__eixo { display: flex; justify-content: space-between; margin-top: 8px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }

.tstz__pe { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; margin-top: 22px; }
.tstz__tickers { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.tstz__tickers li { padding: 6px 11px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.tstz__tickers .tstz__mais { background: transparent; color: var(--nu-gray); box-shadow: inset 0 0 0 1.5px var(--nu-cream-2); }
.tstz__revisada { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500; }
.tstz__pulso { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); box-shadow: 0 0 0 0 rgba(20, 143, 78, 0.45); animation: tstz-pulsa 2.2s ease-out infinite; }
.tstz__cta {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 24px;
  color: var(--nu-blue); font-size: var(--nu-fs-md); font-weight: 700;
}
.tstz__cta svg { transition: transform .2s ease; }
.tstz__cta:hover { color: var(--nu-blue-hover); }
.tstz__cta:hover svg { transform: translateX(3px); }

/* ——— as teses para escolher ——— */
.tstz__escolha {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; max-width: 1180px; margin: 16px auto 0;
}
.tstz__aba {
  display: flex; align-items: center; gap: 12px; min-width: 0; padding: 10px 14px 10px 10px; border: 0; border-radius: 20px; cursor: pointer;
  background: var(--nu-cream); color: var(--nu-gray-2); text-align: left; font: inherit;
  transition: background .2s ease, box-shadow .2s ease, color .2s ease;
}
.tstz__aba:hover { color: var(--nu-ink); }
.tstz__aba--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 10px 30px -16px rgba(10, 10, 12, 0.35), 0 0 0 1.5px var(--nu-ink); }
.tstz__aba:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.tstz__miniatura { flex: none; width: 44px; height: 44px; overflow: hidden; border-radius: 12px; background: var(--nu-navy); }
.tstz__miniatura img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tstz__aba-nome { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--nu-fs-sm); font-weight: 700; }
.tstz__aba-perf { flex: none; color: var(--nu-green); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }

/* a linha se revela da esquerda para a direita, do primeiro dia até hoje */
@keyframes tstz-revela { from { clip-path: inset(-12px 100% -12px 0); } to { clip-path: inset(-12px -12px -12px 0); } }
@keyframes tstz-surge { from { opacity: 0; } }
@keyframes tstz-entra { from { opacity: 0; transform: translateY(8px); } }
@keyframes tstz-pulsa { 70% { box-shadow: 0 0 0 7px rgba(20, 143, 78, 0); } 100% { box-shadow: 0 0 0 0 rgba(20, 143, 78, 0); } }

@media (max-width: 960px) {
  .tstz__cartao { grid-template-columns: 1fr; min-height: 0; }
  .tstz__capa { aspect-ratio: 16 / 9; min-height: 0; }
  .tstz__escolha { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 4px; margin-left: calc(-1 * clamp(22px, 5.5vw, 80px)); margin-right: calc(-1 * clamp(22px, 5.5vw, 80px)); padding-left: clamp(22px, 5.5vw, 80px); padding-right: clamp(22px, 5.5vw, 80px); scrollbar-width: none; }
  .tstz__escolha::-webkit-scrollbar { display: none; }
  /* a rolagem lateral também corta em cima e embaixo: a folga cabe a borda e a sombra da aba ativa */
  .tstz__escolha { scroll-padding-inline: clamp(22px, 5.5vw, 80px); padding-top: 8px; padding-bottom: 28px; margin-top: 8px; margin-bottom: -24px; }
  .tstz__aba { flex: none; width: min(78vw, 300px); scroll-snap-align: start; }
  .tstz__numeros { gap: 14px 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .tstz__img, .tstz__corpo, .tstz__plot, .tstz__ponto, .tstz__pulso { animation: none; }
}
</style>
