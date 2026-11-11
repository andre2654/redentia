<script setup lang="ts">
// /benchmark-ia: "A noite" (03/11/2026), a direção que o dono escolheu entre
// três ("a 2"), no lugar da página de faixas navy e creme. O topo é o escuro do herói
// da home (o navy do rodapé descendo ao preto, a linha de luz no horizonte) e
// o Placar geral vira o momento bonito: dez colunas de luz que sobem do
// horizonte, da altura da nota, com a margem de erro em traço fino; quem
// divide o 1º lugar acende em azul. Embaixo do herói, uma barra que gruda com
// as dez IAs: escolher uma acende o modelo em todos os gráficos da página. Os
// índices descem um por vez, centrados e calmos, no branco.
// No celular as colunas não cabem: o placar vira a lista com barras, ainda no
// escuro. A entrada (as colunas subindo) só embeleza: ver o onMounted.
import type { BenchPaginaVM } from '~/types/benchmark'

const props = defineProps<{ vm: BenchPaginaVM }>()
const { hover, fixo, foco, pick, metodo, INFO, go, manchete, ctx } = useBenchPagina(() => props.vm)
const v = computed(() => props.vm)

/* ——— o horizonte ——— */
const piso = computed(() => {
  const los = (v.value.geral ?? []).map((r) => r.lo)
  return los.length ? Math.max(0, Math.floor(Math.min(...los) / 10) * 10) : 0
})
const alt = (x: number) => Math.max(2, ((x - piso.value) / (100 - piso.value)) * 100)
const lideres = computed(() => (v.value.geral ?? []).filter((r) => r.rank === 1).length)

/* ——— a barra das IAs (na ordem do placar geral; sem placar, na do custo) ——— */
const modelos = computed(() => (v.value.geral ?? v.value.custo ?? []).map((r) => ({ id: r.id, name: r.name })))
const nomeFixo = computed(() => modelos.value.find((m) => m.id === fixo.value)?.name ?? null)

const shown = (id: string) => v.value.indices.find((x) => x.id === id)?.on ?? false
const legendaInventa = computed(() => v.value.inventaSegments.map((label, i) => ({
  label, tom: (['bom', 'meio', 'ruim'] as const)[i] ?? 'meio',
  media: mediaDe(v.value.inventa.map((r) => r.parts[i] ?? 0)) ?? 0,
})))
const LEG_AMEM = [{ label: 'Disse não', tom: 'bom' }, { label: 'No muro', tom: 'meio' }, { label: 'Concordou', tom: 'ruim' }] as const
const inventaLinhas = computed(() => v.value.inventa.map((r) => ({ ...r, extra: (r.parts[2] ?? 0) > 0 ? `inventou ${r.parts[2]}%` : 'não inventou' })))
const amemLinhas = computed(() => v.value.amem.map((r) => ({ ...r, extra: (r.parts[2] ?? 0) > 0 ? `concordou ${r.parts[2]}%` : (r.parts[1] ?? 0) > 0 ? `no muro ${r.parts[1]}%` : 'disse não' })))

const longoSel = ref(props.vm.longoSeries[0]?.id ?? '')
const longoVisto = computed(() => (foco.value && props.vm.longoSeries.some((s) => s.id === foco.value) ? foco.value : longoSel.value))
function escolherLongo(id: string) { longoSel.value = id; pick(id) }

/* ——— a entrada das colunas: só embeleza ———
   As colunas saem prontas do servidor. A subida do horizonte é Web Animations,
   disparada uma vez no mount, e só com a aba visível, o palco na tela e sem
   pedido de menos movimento. Em CSS puro ela recomeçava do zero a cada
   recálculo de estilo (um print de página inteira pegava as colunas no chão);
   sem JS, numa aba em segundo plano ou fora da tela, as colunas só estão lá. */
const palco = ref<HTMLElement | null>(null)
onMounted(() => {
  const el = palco.value
  if (!el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  if (r.top >= window.innerHeight || r.bottom <= 0) return
  const curva = 'cubic-bezier(.2, .8, .2, 1)'
  el.querySelectorAll<HTMLElement>('.bno__col').forEach((col, i) => {
    col.querySelector('.bno__pilar')?.animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 1100, delay: 150 + i * 70, easing: curva, fill: 'backwards' })
    col.querySelectorAll('.bno__ic, .bno__v').forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 900 + i * 70, easing: 'ease', fill: 'backwards' }))
  })
  el.querySelector('.bno__horizonte')?.animate([{ opacity: 0.2, transform: 'scaleX(.5)' }, { opacity: 1, transform: 'none' }], { duration: 1400, easing: curva, fill: 'backwards' })
})
</script>

<template>
  <div class="bno">
    <section class="bno__ceu" aria-labelledby="bno-titulo">
      <div class="bno__luz" aria-hidden="true" />
      <div class="bno__texto">
        <NuEyebrow como="p" sobre="escuro" class="bno__produto">Benchmark de IA</NuEyebrow>
        <h1 id="bno-titulo" class="bno__titulo">Ranking de IAs em finanças</h1>
        <p class="bno__dek">
          Dez IAs, a mesma prova de finanças, corrigida por gabarito.
          <a href="#metodologia" class="bno__link" @click.prevent="go('metodologia')">Como medimos</a>
        </p>
        <p v-if="vm.fresh" class="bno__fresh">{{ vm.fresh }}</p>
      </div>

      <!-- ============ Placar geral: as luzes no horizonte ============ -->
      <div v-if="vm.geral" id="geral" ref="palco" v-contexto-chat="ctx.geral" class="bno__palco">
        <h2 class="bno__sr">Placar geral</h2>
        <ol class="bno__luzes" @mouseleave="hover = null">
          <li
            v-for="(r, i) in vm.geral" :key="r.id" class="bno__col"
            :class="{ 'bno__col--top': r.rank === 1, 'bno__col--on': foco === r.id, 'bno__col--recua': foco && foco !== r.id }"
            :style="{ '--i': i, '--h': `${alt(r.value)}%`, '--lo': `${alt(r.lo)}%`, '--hi': `${alt(r.hi)}%` }"
          >
            <button
              type="button" class="bno__b" :aria-pressed="foco === r.id"
              :aria-label="`${r.rank}º ${r.name}: nota ${fmtBench.one(r.value)}, margem de ${fmtBench.one(r.lo)} a ${fmtBench.one(r.hi)}${r.tied ? ', empate' : ''}`"
              @mouseenter="hover = r.id" @focus="hover = r.id" @blur="hover = null" @click="pick(r.id)"
            >
              <span class="bno__area" aria-hidden="true">
                <span class="bno__pilar" />
                <span class="bno__ic" />
                <span class="bno__v">{{ fmtBench.one(r.value) }}</span>
              </span>
              <span class="bno__quem" aria-hidden="true">
                <span class="bno__tile">
                  <img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="16" height="16" decoding="async">
                  <template v-else>{{ r.name.charAt(0) }}</template>
                </span>
                <span class="bno__nome">{{ r.name }}</span>
                <span class="bno__pos">{{ r.rank }}º</span>
              </span>
            </button>
          </li>
        </ol>
        <div class="bno__horizonte" aria-hidden="true" />
        <div class="bno__lista">
          <BenchDirLinhas :rows="vm.geral" tom="escuro" :min="piso" :max="100" :foco="foco" @hover="hover = $event" @pick="pick" />
        </div>
        <p class="bno__leg">
          {{ vm.geralDesc }} A altura vai de {{ piso }} a 100 e o traço é a margem de erro: {{ lideres > 1 ? `os ${lideres} em azul dividem o 1º lugar` : 'em azul, o 1º lugar' }}.
        </p>
      </div>

      <ul v-if="vm.heroStats.length" class="bno__nums">
        <li v-for="s in vm.heroStats" :key="s.id">
          <a :href="`#${s.id}`" class="bno__num" @click.prevent="go(s.id)">
            <span class="bno__num-v"><i :class="`bno__ponto bno__ponto--${s.tone}`" aria-hidden="true" />{{ s.format === 'pct' ? fmtBench.pct(s.value) : fmtBench.int(s.value) }}</span>
            <span class="bno__num-r">{{ s.label }}</span>
          </a>
        </li>
      </ul>
    </section>

    <!-- ============ a barra que gruda: destacar uma IA na página toda ============ -->
    <div v-if="modelos.length" class="bno__barra">
      <div class="bno__barra-in">
        <span class="bno__barra-r" id="bno-destacar">Destacar</span>
        <div class="bno__chips" role="group" aria-labelledby="bno-destacar" @mouseleave="hover = null">
          <button
            v-for="m in modelos" :key="m.id" type="button" class="bno__chip" :class="{ 'bno__chip--on': fixo === m.id }"
            :aria-pressed="fixo === m.id" @mouseenter="hover = m.id" @click="pick(m.id)"
          >
            <span class="bno__chip-logo" aria-hidden="true">
              <img v-if="benchLogo(m.id)" :src="benchLogo(m.id)!" alt="" width="12" height="12" loading="lazy" decoding="async">
              <template v-else>{{ m.name.charAt(0) }}</template>
            </span>{{ m.name }}
          </button>
        </div>
        <button v-if="fixo" type="button" class="bno__limpar" :aria-label="`Tirar o destaque de ${nomeFixo}`" @click="fixo = null">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>

    <!-- ============ os índices, um por vez ============ -->
    <div class="bno__corpo">
    <section v-if="shown('inventa')" id="inventa" v-contexto-chat="ctx.inventa" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Laboratório</NuEyebrow>
        <h2 class="bno__h2">{{ metodo('inventa').name }}</h2>
        <p class="bno__q">{{ metodo('inventa').question }}</p>
        <p v-if="manchete.inventa" class="bno__man"><b>{{ manchete.inventa.numero }}</b> {{ manchete.inventa.frase }}</p>
        <BenchDirInfo :titulo="metodo('inventa').name" :info="INFO.inventa" :leitura="vm.leitura.inventa" />
      </header>
      <div class="bno__graf">
        <p class="bno__leg2"><span v-for="s in legendaInventa" :key="s.label"><i :class="`bno__sw bno__sw--${s.tom}`" />{{ s.label }} <b>{{ fmtBench.pct(s.media) }}</b></span><span class="bno__leg2-n">na média</span></p>
        <BenchDirLinhas :rows="inventaLinhas" :foco="foco" @hover="hover = $event" @pick="pick" />
        <p v-if="vm.dados" class="bno__nota">Com os dados da Aportou no enunciado, a invenção média cai de <b>{{ fmtBench.pct(vm.dados.sem) }}</b> para <b>{{ fmtBench.pct(vm.dados.com) }}</b>. Essa rodada fica fora do ranking.</p>
      </div>
    </section>

    <section v-if="shown('amem')" id="amem" v-contexto-chat="ctx.amem" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Laboratório</NuEyebrow>
        <h2 class="bno__h2">{{ metodo('amem').name }}</h2>
        <p class="bno__q">{{ metodo('amem').question }}</p>
        <p v-if="manchete.amem" class="bno__man"><b>{{ manchete.amem.numero }}</b> {{ manchete.amem.frase }}</p>
        <BenchDirInfo :titulo="metodo('amem').name" :info="INFO.amem" :leitura="vm.leitura.amem" />
      </header>
      <div class="bno__graf">
        <p class="bno__leg2"><span v-for="s in LEG_AMEM" :key="s.label"><i :class="`bno__sw bno__sw--${s.tom}`" />{{ s.label }}</span></p>
        <BenchDirLinhas :rows="amemLinhas" :foco="foco" @hover="hover = $event" @pick="pick" />
        <p v-if="vm.edition?.foraDoGeral?.includes('amem')" class="bno__nota">Fora da média do placar geral nesta edição: nem todos os modelos completaram a prova.</p>
      </div>
    </section>

    <section v-if="shown('golpe')" id="golpe" v-contexto-chat="ctx.golpe" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Laboratório</NuEyebrow>
        <h2 class="bno__h2">{{ metodo('golpe').name }}</h2>
        <p class="bno__q">{{ metodo('golpe').question }}</p>
        <p v-if="manchete.golpe" class="bno__man"><b>{{ manchete.golpe.numero }}</b> {{ manchete.golpe.frase }}</p>
        <BenchDirInfo :titulo="metodo('golpe').name" :info="INFO.golpe" />
      </header>
      <div class="bno__graf"><BenchButterfly :rows="vm.golpe" /></div>
    </section>

    <section v-if="shown('leao')" id="leao" v-contexto-chat="ctx.leao" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Laboratório</NuEyebrow>
        <h2 class="bno__h2">{{ metodo('leao').name }}</h2>
        <p class="bno__q">{{ metodo('leao').question }}</p>
        <p v-if="manchete.leao" class="bno__man"><b>{{ manchete.leao.numero }}</b> {{ manchete.leao.frase }}</p>
        <BenchDirInfo :titulo="metodo('leao').name" :info="INFO.leao" :leitura="vm.leitura.leao" />
      </header>
      <div class="bno__graf"><BenchTiles :topics="vm.leaoTopics" :short-topics="vm.leaoShort" :rows="vm.leao" /></div>
    </section>

    <section v-if="shown('longo')" id="longo" v-contexto-chat="ctx.longo" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Arena ao vivo</NuEyebrow>
        <h2 class="bno__h2">{{ metodo('longo').name }}</h2>
        <p class="bno__q">{{ metodo('longo').question }}</p>
        <p v-if="manchete.longo" class="bno__man"><b>{{ manchete.longo.numero }}</b> {{ manchete.longo.frase }}</p>
        <BenchDirInfo :titulo="metodo('longo').name" :info="INFO.longo" />
      </header>
      <div class="bno__graf bno__graf--largo">
        <BenchLineNavy
          v-if="vm.edition?.longo" :model-value="longoVisto" @update:model-value="escolherLongo"
          :labels="vm.edition.longo.labels" :ibov="vm.edition.longo.ibov" :selic="vm.edition.longo.selic"
          :series="vm.longoSeries" :marcos="vm.longoMarcos" :footnote="vm.longoNota"
        />
        <BenchRankList
          v-if="vm.longo" :rows="vm.longo" :format="fmtBench.signedPp" :numbered="!vm.longoFormacao" interactive :active-id="longoVisto"
          @hover="hover = $event" @pick="escolherLongo"
        />
      </div>
    </section>

    <section v-if="shown('curto')" id="curto" v-contexto-chat="ctx.curto" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Arena ao vivo</NuEyebrow>
        <h2 class="bno__h2">{{ metodo('curto').name }}</h2>
        <p class="bno__q">{{ metodo('curto').question }}</p>
        <p v-if="manchete.curto" class="bno__man"><b>{{ manchete.curto.numero }}</b> {{ manchete.curto.frase }}</p>
        <BenchDirInfo :titulo="metodo('curto').name" :info="vm.curto ? INFO.curto : INFO.curtoParcial" />
      </header>
      <div class="bno__graf bno__graf--largo">
        <BenchDots v-if="vm.curto" :rows="vm.curto" :format="fmtBench.ic" zero-label="0 = ordem igual ao acaso" footnote="Ponto cinza: sem evidência de habilidade." />
        <BenchIcLines
          v-else-if="vm.curtoParcial" :labels="vm.curtoParcial.labels" :series="vm.curtoParcialSeries" :horizonte="vm.curtoParcial.horizonte"
          :fim="vm.curtoParcial.fimPrevisto ? `${vm.curtoParcial.fimPrevisto.slice(8, 10)}/${vm.curtoParcial.fimPrevisto.slice(5, 7)}` : null"
        />
      </div>
    </section>

    <section v-if="vm.custo" id="custo" v-contexto-chat="ctx.custo" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Conta aberta</NuEyebrow>
        <h2 class="bno__h2">Custo por mil respostas</h2>
        <p class="bno__q">Quanto custa cada mil respostas, em dólar, contra a nota geral.</p>
        <p v-if="manchete.custo" class="bno__man"><b>{{ manchete.custo.numero }}</b> {{ manchete.custo.frase }}</p>
        <BenchDirInfo titulo="Custo por mil respostas" :info="INFO.custo" :leitura="vm.leitura.custo" />
      </header>
      <div class="bno__graf"><BenchDirDispersao :points="vm.costPoints" :foco="foco" @hover="hover = $event" @pick="pick" /></div>
    </section>

    <section v-if="vm.proximos.length" id="proximos" class="bno__sec">
      <header class="bno__cab">
        <NuEyebrow como="p" class="bno__tipo">Em construção</NuEyebrow>
        <h2 class="bno__h2">Próximos índices</h2>
        <p class="bno__q">{{ vm.proximosDesc }}</p>
      </header>
      <div class="bno__graf"><BenchDirProximos :itens="vm.proximos" /></div>
    </section>
    </div>

    <BenchDirDuvidas :faq="vm.faq" />
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o palco do placar é carvão (não mais o preto), o corpo
   corre sobre o creme da página, cada índice abre com o eyebrow da marca e o
   título em 800. Os gráficos e os números são os de antes. */
.bno { --g: clamp(22px, 5.5vw, 80px); --cola: calc(var(--nuh-h, 76px) + 46px); background: var(--nu-page); }

/* ——— o céu: o mesmo do herói "A noite" da home ——— */
.bno__ceu {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(44px, 5vw, 72px) var(--g) clamp(48px, 5.5vw, 80px);
  background: var(--nu-ink); color: var(--nu-white);
}
.bno__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 18%, transparent), transparent);
}
.bno__texto { display: flex; flex-direction: column; align-items: center; max-width: 1000px; }
.bno__titulo {
  margin: 18px 0 0; max-width: 16ch; font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: .98; text-wrap: balance;
  color: var(--nu-white);
}
.bno__dek { margin: 20px 0 0; max-width: 52ch; color: var(--nu-on-dark); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: balance; }
.bno__link { color: var(--nu-white); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-dark-chip-line); transition: text-decoration-color .2s ease; }
.bno__link:hover { color: var(--nu-white); text-decoration-color: currentColor; }
.bno__fresh { margin: 10px 0 0; color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }

/* ——— o palco: as colunas de luz sobre o horizonte ——— */
.bno__palco { position: relative; width: min(1040px, 100%); margin-top: clamp(40px, 4.6vw, 64px); scroll-margin-top: var(--cola); }
.bno__luzes { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: clamp(6px, 1.2vw, 16px); }
.bno__col { min-width: 0; transition: opacity .2s ease; }
.bno__col--recua { opacity: .45; }
.bno__b { display: flex; flex-direction: column; width: 100%; padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
.bno__b:focus-visible { outline: none; }
.bno__b:focus-visible .bno__tile { outline: 2px solid var(--nu-white); outline-offset: 3px; }
/* a altura das colunas: fixa, para nada pular quando a página hidrata */
.bno__area { position: relative; display: block; height: clamp(200px, 22vw, 290px); }
.bno__pilar {
  position: absolute; left: 22%; right: 22%; bottom: 0; height: var(--h); border-radius: 10px 10px 0 0;
  background: var(--nu-dark-chip); box-shadow: inset 0 2px 0 var(--nu-dark-chip-line);
  transform-origin: 50% 100%; transition: background .2s ease, box-shadow .2s ease;
}
.bno__col--top .bno__pilar { background: var(--nu-blue); box-shadow: inset 0 2px 0 var(--nu-blue-soft), 0 0 42px -4px var(--nu-blue-28); }
.bno__col--on .bno__pilar, .bno__b:hover .bno__pilar { background: var(--nu-blue-soft); box-shadow: inset 0 2px 0 var(--nu-white), 0 0 48px -2px var(--nu-blue-28); }
/* a margem de erro: um traço fino no topo da coluna */
.bno__ic { position: absolute; left: 50%; bottom: var(--lo); height: calc(var(--hi) - var(--lo)); width: 2px; transform: translateX(-50%); border-radius: 1px; background: var(--nu-white); opacity: .8; }
.bno__ic::before, .bno__ic::after { content: ''; position: absolute; left: -4px; width: 10px; height: 2px; border-radius: 1px; background: inherit; }
.bno__ic::before { top: 0; }
.bno__ic::after { bottom: 0; }
.bno__v {
  position: absolute; left: 0; right: 0; bottom: calc(max(var(--h), var(--hi)) + 10px);
  color: var(--nu-white); font-size: 14.5px; font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums;
}
.bno__col--top .bno__v, .bno__col--on .bno__v { color: var(--nu-blue-soft); }
.bno__quem { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 16px; }
.bno__tile {
  width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-white); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio);
  box-shadow: 0 0 0 1px var(--nu-white-18);
}
.bno__tile img { width: 16px; height: 16px; display: block; object-fit: contain; }
.bno__nome { color: var(--nu-white); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); line-height: 1.25; text-wrap: balance; }
.bno__pos { color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
/* a linha de luz: o brilho da barra da Redentia, esticado no horizonte (o do herói da home) */
.bno__horizonte {
  position: absolute; left: -12%; right: -12%; top: clamp(200px, 22vw, 290px); height: 2px; pointer-events: none;
  background: linear-gradient(90deg, transparent 4%, var(--nu-chat-luz-1) 24%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 76%, transparent 96%);
  box-shadow: 0 0 18px 3px var(--nu-chat-luz-1), 0 0 60px 14px var(--nu-chat-luz-2);
  border-radius: 50%;
}
.bno__lista { display: none; }
.bno__leg { margin: 28px auto 0; max-width: 64ch; color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.55; }

.bno__nums { list-style: none; margin: clamp(36px, 4vw, 52px) 0 0; padding: 0; width: min(960px, 100%); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 0 24px; text-align: left; }
.bno__nums li { border-top: 1px solid var(--nu-dark-chip-line); }
.bno__num { display: flex; flex-direction: column; gap: 6px; padding: 16px 0 4px; color: inherit; }
.bno__num:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 2px; border-radius: 4px; }
.bno__num-v { display: inline-flex; align-items: center; gap: 10px; color: var(--nu-white); font-size: clamp(34px, 3.6vw, 48px); font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums; transition: color .2s; }
.bno__num:hover .bno__num-v { color: var(--nu-blue-soft); }
.bno__num-r { max-width: 30ch; color: var(--nu-on-dark); font-size: 14.5px; font-weight: 500; line-height: 1.45; }
.bno__ponto { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bno__ponto--bad { background: var(--nu-red-soft); }
.bno__ponto--good { background: var(--nu-blue-on-dark); }


/* ——— a barra que gruda ——— */
.bno__barra {
  position: sticky; top: var(--cola); z-index: 30;
  background: color-mix(in srgb, var(--nu-page) 92%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-bottom: 1px solid var(--nu-line-2);
}
.bno__barra-in { display: flex; align-items: center; gap: 14px; padding: 8px var(--g); }
.bno__barra-r { flex-shrink: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: .16em; text-transform: uppercase; }
.bno__chips { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.bno__chips::-webkit-scrollbar { display: none; }
.bno__chip {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; min-height: 44px; padding: 0 16px 0 8px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: 600; white-space: nowrap; cursor: pointer;
  transition: background .2s, color .2s, transform .15s var(--nu-ease-saida);
}
.bno__chip:hover { background: var(--nu-line-2); }
.bno__chip:active { transform: scale(.98); }
.bno__chip--on, .bno__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); font-weight: var(--nu-w-medio); }
.bno__chip-logo { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--nu-white); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); }
.bno__chip-logo img { width: 14px; height: 14px; display: block; object-fit: contain; }
.bno__limpar { flex-shrink: 0; width: 44px; height: 44px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--nu-cream-2); color: var(--nu-ink); cursor: pointer; transition: background .2s; }
.bno__limpar:hover { background: var(--nu-line-2); }
.bno__limpar svg { width: 14px; height: 14px; }

/* ——— cada índice: cabeçalho centrado, gráfico embaixo ——— */
.bno__sec { scroll-margin-top: calc(var(--cola) + 62px); padding: clamp(64px, 7vw, 100px) var(--g) 0; }
.bno__corpo { padding-bottom: clamp(64px, 7vw, 100px); }
.bno__cab { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px; margin: 0 auto; }
.bno__tipo { justify-content: center; }
.bno__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance; }
.bno__q { margin: 14px 0 0; max-width: 46ch; color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500; line-height: 1.5; text-wrap: balance; }
.bno__man { margin: 22px 0 18px; max-width: 46ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; text-wrap: balance; }
.bno__man b { color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.bno__cab > .bdi { margin-top: 20px; }
.bno__man + .bdi { margin-top: 0; }
.bno__graf { max-width: 920px; margin: clamp(28px, 3.4vw, 44px) auto 0; padding-bottom: clamp(8px, 2vw, 24px); }
.bno__graf--largo { max-width: 1240px; }
.bno__leg2 { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px 18px; margin: 0 0 16px; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; }
.bno__leg2 span { display: inline-flex; align-items: center; gap: 7px; }
.bno__leg2 b { color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.bno__leg2-n { color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.bno__sw { width: 11px; height: 11px; border-radius: 50%; }
.bno__sw--bom { background: var(--nu-blue); }
.bno__sw--meio { background: var(--nu-sand); }
.bno__sw--ruim { background: var(--nu-red); }
.bno__nota { margin: 16px auto 0; max-width: 70ch; text-align: center; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; }
.bno__nota b { color: var(--nu-ink); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.bno__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* ——— tablet: as colunas mais juntas; celular: a lista no escuro ——— */
@media (max-width: 900px) {
  .bno__pilar { left: 16%; right: 16%; }
  .bno__nome { font-size: var(--nu-fs-xs); }
  .bno__v { font-size: var(--nu-fs-xs); }
}
@media (max-width: 680px) {
  .bno__luzes, .bno__horizonte { display: none; }
  .bno__lista { display: block; text-align: left; }
  .bno__palco { margin-top: 32px; }
  .bno__leg { margin-top: 18px; text-align: left; }
  .bno__barra-r { display: none; }
  .bno__barra-in { padding: 6px var(--g); }
}
@media (max-width: 640px) { .bno { --cola: calc(var(--nuh-h, 58px) + 46px); } }
@media (prefers-reduced-motion: reduce) {
  .bno__col, .bno__pilar, .bno__chip { transition: none; }
}
</style>
