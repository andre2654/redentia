<script setup lang="ts">
// /estudo/wealth-2030 — estudo WEALTH 2030. O miolo vem só do documento.
// Header, ticker e rodapé são o layout default. O hub /estudo continua 404.
import {
  WEALTH_2030,
  relatorioJsonLd,
  type Bloco,
  type Secao,
} from '../../content/estudo/wealth-2030'

const doc = WEALTH_2030
const origin = useSiteOrigin()
const tocItems = doc.secoes.map((secao) => ({ label: secao.toc, targetId: secao.id }))
const noCorpo = doc.secoes.filter((secao) => secao.id !== 'fechamento')
const fechamento = doc.secoes.find((secao) => secao.id === 'fechamento')

usePageSeo({
  title: doc.titleSeo,
  description: doc.description,
  path: doc.path,
  dateModified: doc.datePublished,
  structuredData: [relatorioJsonLd(origin)],
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: doc.titulo, path: doc.path },
  ],
})

function blocos(secao: Secao): Bloco[] {
  return secao.blocos
}

function paragrafos(bloco: Bloco): string[] {
  return bloco.tipo === 'p' ? bloco.paragrafos : []
}
</script>

<template>
  <div class="w30">
    <NuArticleHero
      :breadcrumbs="doc.breadcrumbs"
      :title="doc.titulo"
      :dek="doc.dek"
      :author="doc.autor"
      :meta-line="doc.metaLinha"
    />

    <div class="w30-top">
      <a class="w30-dl" :href="doc.pdfPath" download>{{ doc.download }}</a>
      <p class="w30-aviso">{{ doc.aviso }}</p>
    </div>

    <div class="w30-cols">
      <NuTocSidebar :items="tocItems" label="Neste estudo" />

      <article class="w30-article">
        <section
          v-for="secao in noCorpo"
          :id="secao.id"
          :key="secao.id"
          class="w30-sec"
        >
          <p class="w30-kicker">{{ secao.kicker }}</p>
          <h2>{{ secao.titulo }}</h2>
          <template v-for="(bloco, bi) in blocos(secao)" :key="`${secao.id}-${bi}`">
            <p v-for="(paragrafo, pi) in paragrafos(bloco)" :key="`${secao.id}-${bi}-p-${pi}`" class="w30-p">
              {{ paragrafo }}
            </p>
            <div v-if="bloco.tipo === 'numeros'" class="w30-nums">
              <article
                v-for="(item, ni) in bloco.itens"
                :key="`${secao.id}-${bi}-n-${ni}`"
                class="w30-num"
                :class="`w30-num--${item.direcao}`"
              >
                <p class="w30-num__valor" :class="{ 'w30-num__valor--fixo': item.variacao }">{{ item.valor }}</p>
                <p v-if="item.variacao" class="w30-num__var">{{ item.variacao }}</p>
                <p class="w30-num__rotulo">{{ item.rotulo }}</p>
                <p class="w30-num__fonte">Fonte: {{ item.fonte }}</p>
              </article>
            </div>
            <blockquote v-else-if="bloco.tipo === 'citacao'" class="w30-quote">
              <p>{{ bloco.citacao.texto }}</p>
              <footer>{{ bloco.citacao.atribuicao }}</footer>
            </blockquote>
            <aside v-else-if="bloco.tipo === 'nota'" class="w30-nota">
              <p class="w30-p">{{ bloco.texto }}</p>
              <p class="w30-num__fonte">Fonte: {{ bloco.fonte }}</p>
            </aside>
            <ul v-else-if="bloco.tipo === 'lista'" class="w30-list">
              <li v-for="item in bloco.itens" :key="item">{{ item }}</li>
            </ul>
          </template>
        </section>
      </article>
    </div>

    <section v-if="fechamento" :id="fechamento.id" class="w30-close">
      <div class="w30-close__inner">
        <p class="w30-kicker w30-kicker--inv">{{ fechamento.kicker }}</p>
        <h2>{{ fechamento.titulo }}</h2>
        <template v-for="(bloco, bi) in blocos(fechamento)" :key="`fech-${bi}`">
          <p v-for="(paragrafo, pi) in paragrafos(bloco)" :key="`fech-${bi}-p-${pi}`" class="w30-p">
            {{ paragrafo }}
          </p>
          <div v-if="bloco.tipo === 'numeros'" class="w30-nums">
            <article
              v-for="(item, ni) in bloco.itens"
              :key="`fech-${bi}-n-${ni}`"
              class="w30-num"
              :class="`w30-num--${item.direcao}`"
            >
              <p class="w30-num__valor" :class="{ 'w30-num__valor--fixo': item.variacao }">{{ item.valor }}</p>
              <p v-if="item.variacao" class="w30-num__var">{{ item.variacao }}</p>
              <p class="w30-num__rotulo">{{ item.rotulo }}</p>
              <p class="w30-num__fonte">Fonte: {{ item.fonte }}</p>
            </article>
          </div>
          <blockquote v-else-if="bloco.tipo === 'citacao'" class="w30-quote w30-quote--inv">
            <p>{{ bloco.citacao.texto }}</p>
            <footer>{{ bloco.citacao.atribuicao }}</footer>
          </blockquote>
        </template>
        <a class="w30-dl" :href="doc.pdfPath" download>{{ doc.download }}</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.w30 {
  background: #f5f1ea;
  color: #0c1524;
  font-family: var(--nu-font);
  overflow-wrap: break-word;
}
.w30-top {
  width: min(920px, calc(100% - 40px));
  margin: 0 auto;
  padding: 4px 0 8px;
}
.w30-dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  min-height: 52px;
  padding: 14px 22px;
  border-radius: 999px;
  background: #2f6aff;
  color: #fff;
  font-family: var(--nu-font);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-decoration: none;
}
.w30-dl:hover { background: #2258db; color: #fff; }
.w30-dl:focus-visible { outline: 3px solid #0c1524; outline-offset: 3px; }
.w30-aviso {
  margin: 16px 0 0;
  max-width: 68ch;
  color: #3a3733;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.55;
}
.w30-cols {
  display: flex;
  gap: clamp(28px, 4vw, 72px);
  align-items: flex-start;
  width: min(1180px, calc(100% - 40px));
  margin: 28px auto 0;
  padding-bottom: 72px;
}
.w30-article { flex: 1; min-width: 0; max-width: 760px; }
.w30-sec { margin-top: 56px; scroll-margin-top: 140px; }
.w30-sec:first-child { margin-top: 0; }
.w30-kicker {
  margin: 0;
  color: #2f6aff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.w30-kicker--inv { color: #9ec8ff; }
.w30 h2 {
  margin: 8px 0 0;
  color: #0c1524;
  font-family: var(--nu-font);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.12;
}
.w30-p {
  margin: 16px 0 0;
  color: #3a3733;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.65;
}
.w30-nums {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 22px;
}
.w30-num {
  min-width: 0;
  background: #fff;
  border-radius: 20px;
  padding: 18px 18px 16px;
}
.w30-num__valor,
.w30-num__var {
  margin: 0;
  color: #0c1524;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.w30-num__var { margin-top: 4px; font-size: clamp(22px, 3vw, 28px); }
.w30-num--alta .w30-num__valor:not(.w30-num__valor--fixo),
.w30-num--alta .w30-num__var { color: #148f4e; }
.w30-num--baixa .w30-num__valor:not(.w30-num__valor--fixo),
.w30-num--baixa .w30-num__var { color: #d6323b; }
.w30-num__rotulo {
  margin: 10px 0 0;
  color: #0c1524;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
}
.w30-num__fonte {
  margin: 8px 0 0;
  color: #57534a;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
}
.w30-quote {
  margin: 22px 0 0;
  padding: 2px 0 2px 16px;
  border-left: 3px solid #2f6aff;
}
.w30-quote p {
  margin: 0;
  color: #0c1524;
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.02em;
}
.w30-quote footer {
  margin-top: 10px;
  color: #57534a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}
.w30-nota {
  margin-top: 18px;
  padding: 16px 16px 14px;
  background: #fff;
  border-radius: 16px;
}
.w30-nota .w30-p { margin-top: 0; }
.w30-list {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}
.w30-list li {
  position: relative;
  margin-top: 12px;
  padding-left: 18px;
  color: #3a3733;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
}
.w30-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: #2f6aff;
}
.w30-close {
  background: #0c1524;
  color: #f5f1ea;
  scroll-margin-top: 140px;
}
.w30-close__inner {
  width: min(760px, calc(100% - 40px));
  margin: 0 auto;
  padding: 64px 0 72px;
}
.w30-close h2 { color: #f5f1ea; }
.w30-close .w30-p { color: rgba(245, 241, 234, 0.86); }
.w30-quote--inv { border-left-color: #2f6aff; }
.w30-quote--inv p { color: #f5f1ea; }
.w30-quote--inv footer { color: rgba(245, 241, 234, 0.72); }
.w30-close .w30-dl { margin-top: 28px; }

@media (max-width: 720px) {
  .w30-dl { width: 100%; }
  .w30-top,
  .w30-cols,
  .w30-close__inner { width: calc(100% - 32px); }
  .w30-cols { margin-top: 24px; padding-bottom: 48px; }
  .w30-sec { margin-top: 44px; }
  .w30-close__inner { padding: 48px 0 56px; }
}

@media (min-width: 720px) {
  .w30-nums { grid-template-columns: 1fr 1fr; }
}
</style>
