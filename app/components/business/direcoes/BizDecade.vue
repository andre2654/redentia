<script setup lang="ts">
/**
 * /business, direção 1 (?biz=1, 04/11/2026): A DECADE MODERNIZADA.
 *
 * Os gestos que o dono escolheu em 13/08 e defendeu em 15/10 (ver
 * business-visual-decade-e-escolha-do-dono): o hero dividido, o Venn escuro
 * ("O assessor decide. A Redentia prepara."), o scroll travado do dia de mesa
 * em cinco momentos com dado real datado, a segurança, o plano, o FAQ e o
 * fecho. Mesma ordem, mesmas frases e mesmos números da página de hoje; muda
 * a pele, que passa a ser a do idioma desta branch (o herói "A noite" da home,
 * o /benchmark-ia, o /login "A linha", a /teses):
 *  - títulos em peso leve (500), grandes, com tracking −0,05em;
 *  - cartões com raio 22–24, anel de 1px e a sombra navy grande, no lugar da
 *    borda creme e da sombra curta;
 *  - o Venn vai para o escuro, como o da Decade (traço claro sobre navy);
 *  - o momento bonito é o do dia de mesa: a foto fica parada e os cartões
 *    sobem por cima dela, um por momento.
 *
 * O SCROLL TRAVADO SEM DUPLICAR O TEXTO. O RbJornada desenha cada cartão duas
 * vezes no HTML (o do palco e o do celular), o que dobra ~130 palavras no SSR.
 * Aqui cada momento é uma linha da grade com duas células, o texto à direita e
 * o cartão à esquerda; o cartão é sticky dentro da própria linha e a foto é
 * sticky na coluna inteira. No celular a grade vira uma coluna e o cartão cai
 * embaixo do texto, sem segunda cópia. Nada depende de IntersectionObserver:
 * ele só acende a régua e esmaece os passos fora de foco depois do mount.
 *
 * O hero, o plano e o fecho são os componentes de hoje (RbHero, RbProva,
 * RbContato), restilizados daqui por :deep, para a animação do hero, a
 * calculadora e o formulário continuarem sendo um código só.
 */
const MOMENTOS = [
  { id: 'lista', quando: 'Antes do pregão', titulo: 'O que mudou na sua lista.', texto: 'Uma pergunta e até 50 ativos voltam com preço, notícia e data-com.' },
  { id: 'porque', quando: 'No meio do dia', titulo: 'Por que o ativo mexeu.', texto: 'A notícia, a hora e o que muda para quem tem o papel.' },
  { id: 'cenario', quando: 'Quando o cliente liga', titulo: 'E se o fiscal piorar depois da eleição?', texto: 'Cole a carteira, sem nome, e veja a faixa do patrimônio em um ano.' },
  { id: 'reuniao', quando: 'Antes da reunião', titulo: 'A conversa já chega pronta.', texto: 'O que mudou desde a última conversa e o cenário que vale mostrar.' },
  { id: 'cliente', quando: 'Com o cliente dentro', titulo: 'A carteira do cliente, com o sim dele.', texto: 'Ele conecta o banco por Open Finance e revoga quando quiser.', tag: 'na implantação' },
] as const

const ASSESSOR = ['Conhece o cliente pelo nome', 'Decide o que cabe em cada perfil', 'Segura a conversa na queda', 'Assina a recomendação']
const REDENTIA = ['Lê o mercado o dia inteiro', 'Testa a carteira em segundos', 'Explica cada movimento, com fonte', 'Deixa a pauta da reunião pronta']

/* As frases do RbSeguranca, cada uma no seu essencial (o detalhe está no FAQ,
   grupo "Segurança, LGPD e responsabilidade"); conferidas no mesmo código. */
const SEGURANCA = [
  { t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { t: 'Cliente só entra com o sim dele.', d: 'Cada leitura fica registrada.' },
  { t: 'A IA é a da sua casa.', d: 'O Claude ou o ChatGPT do escritório.' },
]

const ctx = {
  venn: { id: 'business:divisao', tipo: 'bloco', rotulo: 'O assessor decide. A Redentia prepara.' },
  dia: { id: 'business:dia', tipo: 'bloco', rotulo: 'Um dia de mesa com a Redentia' },
  seg: { id: 'business:seguranca', tipo: 'bloco', rotulo: 'Segurança do Redentia For Business' },
  plano: { id: 'business:plano', tipo: 'bloco', rotulo: 'O plano do Redentia For Business' },
}

/* id derivado, nunca literal (dois SVG com o mesmo id de pattern na página) */
const uid = useId()
const hachura = `bzd-hachura-${uid}`
const esmaece = `bzd-esmaece-${uid}`
const mascara = `bzd-mascara-${uid}`

/* ——— a régua do dia: só embeleza ——— */
const ativo = ref(0)
const vivo = ref(false)
const grade = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
/* pelo data-i, não por ref de v-for (a ordem do array de ref não é garantida) */
const passos = () => Array.from(grade.value?.querySelectorAll<HTMLElement>('[data-i]') ?? [])
onMounted(() => {
  vivo.value = true
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) ativo.value = Number((e.target as HTMLElement).dataset.i)
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 })
  passos().forEach((el) => io!.observe(el))
})
onBeforeUnmount(() => { io?.disconnect(); io = null })
function irPara(i: number) {
  const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  passos()[i]?.scrollIntoView({ block: 'center', behavior: suave ? 'smooth' : 'auto' })
}
</script>

<template>
  <div class="bzd">
    <RbHero />

    <!-- ——— o Venn, no escuro ——— -->
    <section id="divisao" v-contexto-chat="ctx.venn" class="bzd-venn">
      <h2 class="bzd-venn__titulo">O assessor decide.<br>A Redentia prepara.</h2>
      <div class="bzd-venn__quadro">
        <div class="bzd-venn__col">
          <h3 class="bzd-venn__quem">O assessor</h3>
          <ul class="bzd-venn__lista">
            <li v-for="r in ASSESSOR" :key="r">{{ r }}</li>
          </ul>
        </div>
        <div class="bzd-venn__meio" aria-hidden="true">
          <!-- a geometria do RbDivisao (r=88, centros a 72): a lente tem 104 de
               largura e cada círculo mantém metade de si de fora -->
          <svg viewBox="0 0 260 240" fill="none">
            <defs>
              <pattern :id="hachura" width="4" height="4" patternUnits="userSpaceOnUse">
                <line x1="2" y1="0" x2="2" y2="4" stroke="var(--nu-cream)" stroke-width="1" />
              </pattern>
              <radialGradient :id="esmaece" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stop-color="var(--nu-white)" stop-opacity="1" />
                <stop offset="100%" stop-color="var(--nu-white)" stop-opacity=".1" />
              </radialGradient>
              <mask :id="mascara" maskContentUnits="userSpaceOnUse">
                <path d="M130,39.7 A88,88 0 0,1 130,200.3 A88,88 0 0,1 130,39.7" :fill="`url(#${esmaece})`" />
              </mask>
            </defs>
            <circle cx="94" cy="120" r="88" stroke="var(--nu-cream-text-35)" stroke-width="1.2" />
            <circle cx="166" cy="120" r="88" stroke="var(--nu-cream-text-35)" stroke-width="1.2" />
            <path d="M130,39.7 A88,88 0 0,1 130,200.3 A88,88 0 0,1 130,39.7" :fill="`url(#${hachura})`" fill-opacity=".7" :mask="`url(#${mascara})`" />
          </svg>
        </div>
        <div class="bzd-venn__col bzd-venn__col--dir">
          <h3 class="bzd-venn__quem">A Redentia</h3>
          <ul class="bzd-venn__lista">
            <li v-for="r in REDENTIA" :key="r">{{ r }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ——— o dia de mesa: o scroll travado ——— -->
    <section id="dia" v-contexto-chat="ctx.dia" class="bzd-dia" :class="{ 'bzd-dia--vivo': vivo }" aria-labelledby="bzd-dia-t">
      <h2 id="bzd-dia-t" class="bzd__sr">Um dia de mesa com a Redentia</h2>
      <div ref="grade" class="bzd-dia__grade">
        <!-- a foto: sticky na coluna inteira; anotando.webp não tem rosto -->
        <div class="bzd-dia__foto">
          <div class="bzd-dia__cena">
            <img src="/business-hero/anotando.webp" alt="" width="620" height="620" loading="lazy" decoding="async">
            <span class="bzd-dia__scrim" aria-hidden="true" />
            <div class="bzd-dia__regua" role="group" aria-label="Ir para um dos cinco momentos">
              <button
                v-for="(m, i) in MOMENTOS" :key="m.id" type="button" class="bzd-dia__dot"
                :class="{ 'bzd-dia__dot--on': i === ativo }" :aria-pressed="i === ativo" @click="irPara(i)"
              >
                <span class="bzd-dia__dot-l" aria-hidden="true" /><span class="bzd__sr">{{ m.titulo }}</span>
              </button>
            </div>
          </div>
        </div>
        <template v-for="(m, i) in MOMENTOS" :key="m.id">
          <div :data-i="i" class="bzd-dia__texto" :class="{ 'bzd-dia__texto--on': i === ativo }" :style="{ gridRow: i + 1 }">
            <span class="bzd-dia__n">{{ String(i + 1).padStart(2, '0') }} · {{ m.quando }}</span>
            <h3 class="bzd-dia__titulo">{{ m.titulo }}</h3>
            <p class="bzd-dia__frase">
              {{ m.texto }}
              <span v-if="'tag' in m" class="bzd-dia__tag">{{ m.tag }}</span>
            </p>
          </div>
          <div class="bzd-dia__celula" :style="{ gridRow: i + 1 }">
            <div class="bzd-dia__cartao"><RbJornadaCard :id="m.id" /></div>
          </div>
        </template>
      </div>
    </section>

    <!-- ——— segurança: três frases, sem cartão ——— -->
    <section id="seguranca" v-contexto-chat="ctx.seg" class="bzd-seg">
      <p class="bzd__eyebrow">Segurança</p>
      <h2 class="bzd__h2">Seu compliance pergunta.<br>A gente mostra.</h2>
      <ol class="bzd-seg__lista">
        <li v-for="(s, i) in SEGURANCA" :key="s.t" class="bzd-seg__item">
          <span class="bzd-seg__n">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="bzd-seg__t">{{ s.t }}</h3>
          <p class="bzd-seg__d">{{ s.d }}</p>
        </li>
      </ol>
    </section>

    <div v-contexto-chat="ctx.plano"><RbProva /></div>
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bzd { --g: clamp(22px, 5.5vw, 80px); --sombra: 0 0 0 1px rgba(12, 21, 36, .07), 0 30px 70px -28px rgba(12, 21, 36, .42); }
.bzd__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.bzd__eyebrow { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.bzd__h2 { margin: 12px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; }

/* ——— o hero de hoje, no idioma novo ——— */
.bzd :deep(.rbh0__title) { font-size: clamp(42px, 5.2vw, 76px); font-weight: 500; letter-spacing: -0.055em; line-height: 1.02; }
.bzd :deep(.rbh0__destaque) { font-weight: 500; }
.bzd :deep(.rbh0__dek) { color: var(--nu-gray-2); font-size: var(--nu-fs-dek); line-height: 1.5; }
.bzd :deep(.rbh0__cta) { font-weight: 700; box-shadow: var(--nu-home-sombra-botao); }
.bzd :deep(.rbh0c) { border: 0; border-radius: var(--nu-r-card); box-shadow: 0 0 0 1px var(--nu-white-14), 0 40px 90px -30px rgba(5, 10, 25, .7); }
.bzd :deep(.rbh0c__nome) { font-weight: 700; }
.bzd :deep(.rbh0c__botao) { border-radius: var(--nu-r-pill); }

/* ——— o Venn no escuro ——— */
.bzd-venn {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  position: relative; isolation: isolate; overflow: hidden;
  padding: clamp(72px, 9vw, 128px) var(--g);
  background: var(--nu-navy); color: var(--nu-cream-text); text-align: center;
}
.bzd-venn::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(50% 60% at 50% 62%, color-mix(in srgb, var(--nu-blue) 18%, transparent), transparent);
}
.bzd-venn__titulo { margin: 0 auto; max-width: 16ch; color: var(--nu-cream-text); font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; }
.bzd-venn__quadro {
  margin: clamp(44px, 5vw, 72px) auto 0; max-width: 1120px; text-align: left;
  display: grid; align-items: center; grid-template-columns: 1fr minmax(200px, 280px) 1fr; gap: clamp(18px, 3vw, 48px);
}
.bzd-venn__col { align-self: center; }
.bzd-venn__col--dir { text-align: right; }
.bzd-venn__quem { margin: 0; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 700; }
.bzd-venn__lista { margin: 14px 0 0; padding: 0; list-style: none; }
.bzd-venn__lista li {
  padding: 16px 0; border-top: 1px solid var(--nu-cream-text-14);
  color: var(--nu-cream-text-92); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.45;
}
.bzd-venn__meio svg { display: block; width: 100%; height: auto; }
@media (max-width: 900px) {
  .bzd-venn__quadro { grid-template-columns: 1fr; gap: 28px; }
  .bzd-venn__col--dir { text-align: left; }
  .bzd-venn__meio { display: none; }
}

/* ——— o dia de mesa ——— */
.bzd-dia { scroll-margin-top: var(--nuh-h, 76px); background: var(--nu-cream); padding: 0 var(--g); }
.bzd-dia__grade { position: relative; display: grid; grid-template-columns: 1fr 1fr; column-gap: clamp(32px, 5vw, 76px); }
.bzd-dia__foto { grid-column: 1; grid-row: 1 / span 5; margin-left: calc(-1 * var(--g)); }
.bzd-dia__cena {
  position: sticky; top: var(--nuh-h, 76px); height: calc(100vh - var(--nuh-h, 76px)); overflow: clip;
  background: var(--nu-navy);
}
.bzd-dia__cena img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.bzd-dia__scrim { position: absolute; inset: 0; background: rgba(12, 21, 36, .5); }
.bzd-dia__texto {
  grid-column: 2; min-height: 82vh; max-width: 46ch;
  display: flex; flex-direction: column; justify-content: center;
  transition: opacity .4s ease;
}
/* só depois do mount: no SSR (e sem JS) os cinco passos ficam acesos */
.bzd-dia--vivo .bzd-dia__texto:not(.bzd-dia__texto--on) { opacity: .4; }
.bzd-dia__n { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bzd-dia__titulo { margin: 12px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.06; }
.bzd-dia__frase { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55; }
.bzd-dia__tag {
  display: inline-block; margin-left: 6px; vertical-align: 2px; padding: 3px 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap;
}
/* o cartão: na coluna da foto, sticky dentro da própria linha. Quando a linha
   acaba ele sobe com ela, e o do momento seguinte entra por baixo. */
.bzd-dia__celula { grid-column: 1; position: relative; z-index: 3; display: flex; justify-content: center; }
.bzd-dia__cartao { position: sticky; top: calc(50vh - 90px); align-self: flex-start; width: min(360px, 82%); margin: calc(50vh - 170px) 0; }
.bzd :deep(.rjc) { border: 0; border-radius: var(--nu-r-panel); box-shadow: 0 0 0 1px var(--nu-white-14), 0 40px 90px -30px rgba(5, 10, 25, .75); }
.bzd :deep(.rjc__faixa), .bzd :deep(.rjc__head) { font-weight: 700; }

.bzd-dia__regua {
  position: absolute; left: 50%; bottom: 16px; z-index: 2; transform: translateX(-50%);
  display: flex; gap: 4px;
}
.bzd-dia__dot { appearance: none; border: 0; background: none; cursor: pointer; width: 40px; min-height: 44px; padding: 0; display: flex; align-items: center; }
.bzd-dia__dot-l { display: block; width: 100%; height: 3px; border-radius: 2px; background: var(--nu-cream-text-35); transition: background .2s; }
.bzd-dia__dot--on .bzd-dia__dot-l { background: var(--nu-cream-text); }
.bzd-dia__dot:hover .bzd-dia__dot-l { background: var(--nu-cream-text-70); }
.bzd-dia__dot:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

@media (max-width: 900px) {
  .bzd-dia { padding-block: clamp(28px, 6vw, 48px); }
  .bzd-dia__grade { grid-template-columns: 1fr; }
  .bzd-dia__foto, .bzd-dia__regua { display: none; }
  .bzd-dia__texto, .bzd-dia__celula { grid-column: 1; grid-row: auto !important; }
  .bzd-dia__texto { min-height: 0; max-width: none; padding-top: clamp(30px, 5vw, 40px); border-top: 1px solid var(--nu-cream-line); }
  .bzd-dia__texto[data-i="0"] { border-top: 0; padding-top: 0; }
  .bzd-dia--vivo .bzd-dia__texto:not(.bzd-dia__texto--on) { opacity: 1; }
  .bzd-dia__celula { justify-content: stretch; padding: 20px 0 clamp(30px, 5vw, 40px); }
  .bzd-dia__cartao { position: static; width: 100%; margin: 0; }
  .bzd :deep(.rjc) { box-shadow: var(--sombra); }
}

/* ——— segurança ——— */
.bzd-seg { scroll-margin-top: calc(var(--nuh-h, 76px) + 24px); background: var(--nu-white); padding: clamp(72px, 9vw, 128px) var(--g); }
.bzd-seg__lista { margin: clamp(40px, 5vw, 64px) 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(24px, 3vw, 48px); }
.bzd-seg__item { padding-top: 20px; border-top: 1px solid var(--nu-ink); }
.bzd-seg__n { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bzd-seg__t { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.12; }
.bzd-seg__d { margin: 12px 0 0; max-width: 34ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
@media (max-width: 860px) { .bzd-seg__lista { grid-template-columns: 1fr; } }

/* ——— o plano de hoje, no idioma novo ——— */
.bzd :deep(.rbpv .nsh__title), .bzd :deep(.rbpv h2) { font-weight: 500; letter-spacing: -0.05em; }
.bzd :deep(.rbpv__card) { border: 0; border-radius: var(--nu-r-card); box-shadow: var(--sombra); }
.bzd :deep(.rbpv__card--navy) { box-shadow: 0 0 0 1px var(--nu-navy), 0 30px 70px -28px rgba(12, 21, 36, .6); }
.bzd :deep(.rbpv__titulo) { font-weight: 500; letter-spacing: -0.04em; }
.bzd :deep(.rbpv__valor) { font-weight: 500; letter-spacing: -0.05em; }
.bzd :deep(.rbpv__cta) { font-weight: 700; }

/* ——— o fecho de hoje: banda branca (o FAQ acima é creme) ——— */
.bzd :deep(.rbct) { background: var(--nu-white); }
.bzd :deep(.rbct__titulo) { font-weight: 500; letter-spacing: -0.05em; }
.bzd :deep(.rbct__card) { border-radius: var(--nu-r-card); box-shadow: var(--sombra); }

@media (prefers-reduced-motion: reduce) {
  .bzd-dia__texto { transition: none; }
}
</style>
