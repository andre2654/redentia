<script setup lang="ts">
// "O que mudou": o diário da tese (11/11/2026, docs/aportou/tese.md). A seção
// carvão com os estudos em LINHA DO TEMPO, do mais novo ao mais velho. Cada
// estudo: a data, o selo da `tag` (FUNDAMENTO, MACRO, DADOS, RISCO), o título
// em até 3 linhas (18px, 700; o título de um estudo é uma frase de ~200
// caracteres), o tempo de leitura e a convicção do dia. O mais novo leva o
// resumo, em até 3 linhas. À vista os 5 mais novos; "Ver os N anteriores" abre
// o resto (um <details>: os títulos seguem no HTML do servidor).
//
// Abrir um estudo usa o leitor de sempre (o NuDayModal da Home/"O dia no
// mercado"), vestido: o título e o resumo, as decisões (rótulo + detalhe), a
// tabela dos ativos (código, decisão em selo, avaliação e porquê) e as fontes
// em chips de contorno. O modal recebe HTML pronto: o texto passa por
// escapeHtml/briefingHtml e as classes `tdl-*` moram no <style> global deste
// arquivo (o modal vai por Teleport ao <body>).
//
// PAYWALL (dono, 14/07/2026), a MESMA regra: para o visitante o diário entra
// embaçado e sem clique; o título da seção fica nítido para dar o gancho.
// Quem entrou vê tudo e abre o leitor.
import type { NuDayBlock } from '~/types/market'
import type { TeseDecisionVariant, TeseDiaryVM, TeseEvalBadgeVariant, TeseStudyVM } from '~/types/tese'

const props = defineProps<{ diary: TeseDiaryVM }>()

const { isAuthenticated } = useAuthState()

const A_VISTA = 5
const recentes = computed(() => props.diary.studies.slice(0, A_VISTA))
// o visitante não recebe a lista inteira: o diário é de quem entrou
const anteriores = computed(() => (isAuthenticated.value ? props.diary.studies.slice(A_VISTA) : []))

const selectedId = ref<TeseStudyVM['id']>(props.diary.studies[0]!.id)
const open = ref(false)
const selected = computed<TeseStudyVM>(
  () => props.diary.studies.find((s) => s.id === selectedId.value) ?? props.diary.studies[0]!,
)

function openStudy(id: TeseStudyVM['id']) {
  selectedId.value = id
  open.value = true
}

const TOM_DA_TAG: Record<string, 'azul' | 'ambar' | 'verde' | 'neutro'> = { FUNDAMENTO: 'verde', MACRO: 'azul', DADOS: 'neutro', RISCO: 'ambar' }
const tomDaTag = (tag: string) => TOM_DA_TAG[tag.toUpperCase()] ?? 'neutro'
const conviccao = (s: TeseStudyVM) => (!s.conv ? null : s.conv.changed ? `Convicção ${s.conv.from} → ${s.conv.to}` : `Convicção ${s.conv.to}`)

// ————— conteúdo do leitor (contrato NuDayBlock do NuDayModal) —————

const DECISION_COLOR: Record<TeseDecisionVariant, string> = {
  green: 'var(--nu-green-text)',
  blue: 'var(--nu-blue-text)',
  red: 'var(--nu-red-text)',
  neutral: 'var(--nu-gray)',
}
const SELO_DA_DECISAO: Record<TeseEvalBadgeVariant, string> = { green: 'verde', blue: 'azul', 'blue-solid': 'azul', red: 'vermelho', neutral: 'neutro' }

const modalTitle = computed(() =>
  selected.value.isToday ? 'O estudo do dia' : `Estudo de ${selected.value.rowDate}`,
)

const modalDateLine = computed(() => {
  const c = selected.value.conv
  const conv = !c
    ? 'Revalidação automática da IA'
    : c.changed
      ? `Convicção ${c.from} → ${c.to}`
      : `Convicção mantida em ${c.to}`
  const leitura = selected.value.minutes ? ` · ${selected.value.minutes} min de leitura` : ''
  return `${selected.value.dateBadge} · ${conv}${leitura}`
})

const modalBlocks = computed<NuDayBlock[]>(() => {
  const s = selected.value
  const blocks: NuDayBlock[] = []
  const titulo = s.title ? `<b class="tdl-titulo">${escapeHtml(s.title)}</b>` : ''
  if (titulo || s.summary) blocks.push({ label: 'O estudo', color: 'var(--nu-blue-text)', html: `${titulo}${s.summary ? briefingHtml(s.summary) : ''}` })
  for (const d of s.decisions) {
    blocks.push({ label: d.tag, color: DECISION_COLOR[d.variant] ?? 'var(--nu-gray)', html: briefingHtml(d.txt) })
  }
  if (s.assets?.length) {
    const html = s.assets.map((a) => [
      '<span class="tdl-ativo">',
      `<span class="tdl-ativo-topo"><span class="tdl-ticker">${escapeHtml(a.ticker)}</span>`,
      a.name ? `<span class="tdl-nome">${escapeHtml(a.name)}</span>` : '',
      a.decision ? `<span class="tdl-selo tdl-selo--${SELO_DA_DECISAO[a.variant] ?? 'neutro'}">${escapeHtml(a.decision)}</span>` : '',
      '</span>',
      a.assessment ? `<b class="tdl-avaliacao">${escapeHtml(a.assessment)}</b>` : '',
      a.why ? `<span class="tdl-porque">${escapeHtml(a.why)}</span>` : '',
      '</span>',
    ].join('')).join('')
    blocks.push({ label: 'Os ativos', color: 'var(--nu-ink)', html: `<span class="tdl-ativos">${html}</span>` })
  }
  if (s.sources.length) {
    const html = s.sources
      .map((f) => {
        const miolo = `<span class="tdl-fonte-t">${escapeHtml(f.title)}</span>${f.meta ? `<span class="tdl-fonte-m">${escapeHtml(f.meta)}</span>` : ''}`
        return f.url
          ? `<a class="tdl-fonte" href="${escapeHtml(f.url)}" target="_blank" rel="noopener noreferrer">${miolo}</a>`
          : `<span class="tdl-fonte">${miolo}</span>`
      })
      .join('')
    blocks.push({ label: 'Fontes consultadas', color: 'var(--nu-gray)', html: `<span class="tdl-fontes">${html}</span>` })
  }
  return blocks
})
</script>

<template>
  <section id="mudou" class="tdi">
    <div class="tdi__cab">
      <NuEyebrow como="p" sobre="escuro">Diário da tese</NuEyebrow>
      <h2 class="tdi__h2">O que mudou.</h2>
      <p class="tdi__meta">{{ diary.metaLine }}</p>
      <p class="tdi__sig">
        <MarcaCorte :largura="20" cor="var(--nu-blue-on-dark)" />
        <span>Estudo gerado pela IA na revalidação diária da tese.</span>
      </p>
    </div>

    <div class="tdi__miolo" :class="{ 'tdi__locked': !isAuthenticated }" :aria-hidden="!isAuthenticated || undefined">
      <ol class="tdi__tempo">
        <li v-for="(s, i) in recentes" :key="s.id" class="tdi__item" :class="{ 'tdi__item--novo': i === 0 }" :style="{ '--i': i }">
          <button type="button" class="tdi__estudo" :tabindex="isAuthenticated ? undefined : -1" @click="openStudy(s.id)">
            <span class="tdi__linha">
              <span class="tdi__data">{{ s.dateBadge }}</span>
              <TeseSelo v-if="s.tag" :tom="tomDaTag(s.tag)" tamanho="p" sobre="escuro">{{ s.tag }}</TeseSelo>
              <span v-if="s.minutes" class="tdi__dado">{{ s.minutes }} min de leitura</span>
              <span v-if="conviccao(s)" class="tdi__dado">{{ conviccao(s) }}</span>
            </span>
            <h3 class="tdi__titulo">{{ s.title }}</h3>
            <span v-if="i === 0 && s.summary" class="tdi__resumo">{{ s.summary }}</span>
            <span class="tdi__seta" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </button>
        </li>
      </ol>

      <details v-if="anteriores.length" class="tdi__antes">
        <summary class="tdi__antes-b">
          <span class="tdi__antes-f">{{ anteriores.length === 1 ? 'Ver o anterior' : `Ver os ${anteriores.length} anteriores` }}</span>
          <span class="tdi__antes-a">Recolher os anteriores</span>
          <TeseMais :tamanho="28" sobre="escuro" />
        </summary>
        <ol class="tdi__tempo tdi__tempo--antes">
          <li v-for="s in anteriores" :key="s.id" class="tdi__item">
            <button type="button" class="tdi__estudo" @click="openStudy(s.id)">
              <span class="tdi__linha">
                <span class="tdi__data">{{ s.dateBadge }}</span>
                <TeseSelo v-if="s.tag" :tom="tomDaTag(s.tag)" tamanho="p" sobre="escuro">{{ s.tag }}</TeseSelo>
                <span v-if="s.minutes" class="tdi__dado">{{ s.minutes }} min de leitura</span>
                <span v-if="conviccao(s)" class="tdi__dado">{{ conviccao(s) }}</span>
              </span>
              <h3 class="tdi__titulo">{{ s.title }}</h3>
              <span class="tdi__seta" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
            </button>
          </li>
        </ol>
      </details>
    </div>

    <NuDayModal
      :open="open"
      eyebrow="Diário da tese · Aportou"
      :title="modalTitle"
      :date-line="modalDateLine"
      :blocks="modalBlocks"
      @close="open = false"
    />
  </section>
</template>

<style scoped>
.tdi {
  background: var(--nu-ink); color: var(--nu-white); scroll-margin-top: 120px;
  padding: clamp(56px, 5.6vw, 80px) max(clamp(20px, 4vw, 56px), calc((100% - 1240px) / 2));
  display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(24px, 3vw, 36px) clamp(36px, 5vw, 88px);
}
.tdi__cab { min-width: 0; animation: nu-fade .5s ease both; }
.tdi__h2 { margin: 18px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.tdi__meta { margin: 18px 0 0; max-width: 30ch; color: var(--nu-on-dark); font-size: clamp(17px, 1.4vw, 19px); font-weight: 500; line-height: 1.45; }
.tdi__sig { display: flex; align-items: flex-start; gap: 10px; margin: 20px 0 0; max-width: 34ch; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 600; line-height: 1.45; }
.tdi__sig :deep(.mkc) { margin-top: 2px; }

.tdi__miolo { min-width: 0; }
/* embaçado (visitante): o diário fica atrás do cadastro, sem clique */
.tdi__locked { filter: blur(7px); opacity: .55; pointer-events: none; user-select: none; }

/* a linha do tempo: o fio à esquerda, um ponto por estudo */
.tdi__tempo { list-style: none; margin: 0; padding: 0; }
.tdi__item { position: relative; padding: 0 0 6px 28px; animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms); }
.tdi__item::before {
  content: ''; position: absolute; left: 0; top: 19px; width: 11px; height: 11px; border-radius: 50%;
  background: var(--nu-ink); box-shadow: inset 0 0 0 2.5px var(--nu-on-dark-2);
}
.tdi__item--novo::before { background: var(--nu-blue-on-dark); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-blue-on-dark) 22%, transparent); }
.tdi__item::after { content: ''; position: absolute; left: 4.75px; top: 38px; bottom: -14px; width: 1.5px; background: var(--nu-dark-line); }
.tdi__tempo > .tdi__item:last-child::after { display: none; }
.tdi__tempo--antes .tdi__item { animation: none; }

.tdi__estudo {
  position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; width: 100%; text-align: left;
  padding: 12px 56px 14px 16px; margin: 0; border: 0; border-radius: var(--nu-r-tile); background: transparent; color: inherit; font: inherit; cursor: pointer;
  transition: background .2s ease;
}
.tdi__estudo:hover { background: var(--nu-dark-chip); }
.tdi__linha { display: flex; align-items: center; gap: 6px 12px; flex-wrap: wrap; }
.tdi__data { color: var(--nu-white); font-size: 14.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.tdi__dado { color: var(--nu-on-dark-2); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.tdi__dado::before { content: '·'; margin-right: 12px; }
.tdi__titulo {
  margin: 0; color: var(--nu-white); font-size: 18px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.35; text-wrap: pretty;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.tdi__resumo {
  color: var(--nu-on-dark); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
/* a seta do "abrir": no canto, anda 3px no hover */
.tdi__seta {
  position: absolute; right: 12px; top: 50%; display: grid; place-items: center; width: 36px; height: 36px; margin-top: -18px; border-radius: 50%;
  color: var(--nu-on-dark-2); transition: transform .2s ease, color .2s ease, background .2s ease;
}
.tdi__estudo:hover .tdi__seta { color: var(--nu-white); transform: translateX(3px); }

/* "Ver os N anteriores" */
.tdi__antes { margin: 12px 0 0; interpolate-size: allow-keywords; }
.tdi__antes::details-content { block-size: 0; overflow: clip; transition: block-size .4s cubic-bezier(.2, .8, .2, 1), content-visibility .4s allow-discrete; }
.tdi__antes[open]::details-content { block-size: auto; }
.tdi__antes-b {
  /* o botão recua até o texto dos estudos; a lista de dentro segue no fio da linha do tempo */
  display: inline-flex; align-items: center; gap: 12px; min-height: 44px; margin-left: 28px; padding: 0 8px 0 18px; list-style: none; cursor: pointer;
  border-radius: var(--nu-r-pill); background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line);
  color: var(--nu-white); font-size: 14.5px; font-weight: 700; transition: background .2s ease;
}
.tdi__antes-b::-webkit-details-marker { display: none; }
.tdi__antes-b:hover { background: var(--nu-dark-chip-line); }
.tdi__antes-a { display: none; }
.tdi__antes[open] > .tdi__antes-b .tdi__antes-f { display: none; }
.tdi__antes[open] > .tdi__antes-b .tdi__antes-a { display: inline; }
.tdi__antes[open] > .tdi__antes-b :deep(.tma) { transform: rotate(45deg); }
.tdi__antes[open] > .tdi__tempo { margin: 16px 0 0; animation: nu-fade .3s ease both; }

/* no computador: o título da seção à esquerda (gruda), a linha do tempo à direita */
@media (min-width: 1000px) {
  .tdi { grid-template-columns: minmax(0, .42fr) minmax(0, 1fr); align-items: start; }
  .tdi__cab { position: sticky; top: calc(var(--nuh-h, 76px) + 72px); }
}
@media (max-width: 560px) {
  /* no celular os dados quebram de linha: sem o ponto na frente */
  .tdi__dado::before { content: none; }
  .tdi__item { padding-left: 22px; }
  .tdi__estudo { padding: 12px 40px 14px 8px; }
  .tdi__seta { right: 0; }
  .tdi__antes-b { margin-left: 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .tdi__cab, .tdi__item, .tdi__antes[open] > .tdi__tempo { animation: none; }
  .tdi__estudo, .tdi__seta { transition: none; }
  .tdi__estudo:hover .tdi__seta { transform: none; }
  .tdi__antes::details-content { transition: none; }
}
</style>

<!-- o miolo do leitor (NuDayModal): o HTML entra por v-html num Teleport, fora do escopo -->
<style>
.tdl-titulo { display: block; margin-bottom: 12px; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.25; }
.tdl-ativos { display: block; margin-top: 4px; }
.tdl-ativo { display: block; padding: 14px 0; border-top: 1.5px solid var(--nu-line-2); }
.tdl-ativo:first-child { border-top: 0; padding-top: 4px; }
.tdl-ativo-topo { display: flex; align-items: center; gap: 8px 10px; flex-wrap: wrap; }
.tdl-ticker { display: inline-flex; align-items: center; height: 26px; padding: 0 9px; border-radius: var(--nu-r-tag); background: var(--nu-ink); color: var(--nu-white); font-size: 13.5px; font-weight: 800; letter-spacing: .04em; }
.tdl-nome { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.tdl-selo { display: inline-flex; align-items: center; min-height: 26px; padding: 0 9px; margin-left: auto; border-radius: var(--nu-r-tag); font-size: 13.5px; font-weight: 700; line-height: 1.2; }
.tdl-selo--verde { background: var(--nu-green-bg); color: var(--nu-green-text); }
.tdl-selo--azul { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.tdl-selo--vermelho { background: var(--nu-red-bg); color: var(--nu-red-text); }
.tdl-selo--neutro { background: var(--nu-cream-2); color: var(--nu-ink); }
.tdl-avaliacao { display: block; margin-top: 10px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.4; }
.tdl-porque { display: block; margin-top: 4px; color: var(--nu-gray-3); font-size: 15px; font-weight: 500; line-height: 1.55; }
.tdl-fontes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.tdl-fonte {
  display: inline-flex; flex-direction: column; gap: 2px; max-width: 100%; padding: 9px 14px; border-radius: var(--nu-r-chip);
  box-shadow: inset 0 0 0 1.5px var(--nu-line); color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.35; text-decoration: none;
  transition: box-shadow .2s ease, color .2s ease;
}
a.tdl-fonte:hover { box-shadow: inset 0 0 0 1.5px var(--nu-blue); color: var(--nu-blue-text); }
.tdl-fonte-m { color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
</style>
