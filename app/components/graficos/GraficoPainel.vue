<script setup lang="ts">
import { codigoEmbed, AVISO, type Grafico } from '~/utils/graficos'
import { alturaDoGrafico } from '~/utils/graficos-svg'

const props = defineProps<{ grafico: Grafico }>()
const codigo = computed(() => codigoEmbed(props.grafico, alturaDoGrafico(props.grafico)))
const copiado = ref(false)

async function copiar() {
  try {
    await navigator.clipboard.writeText(codigo.value)
    copiado.value = true
  } catch {
    copiado.value = false
  }
}
</script>

<template>
  <section :id="grafico.ancora" class="gp">
    <h2>{{ grafico.titulo }}</h2>
    <p class="gp-linha">{{ grafico.linha }}</p>
    <div class="gp-chart" role="list">
      <div v-for="barra in grafico.barras" :key="barra.rotulo" class="gp-row" role="listitem">
        <span class="gp-rotulo">{{ barra.rotulo }}</span>
        <span class="gp-trilho" aria-hidden="true">
          <span class="gp-fill" :style="{ width: `${Math.round(barra.preenchimento * 1000) / 10}%` }" />
        </span>
        <span class="gp-valor">{{ barra.valorTexto }}</span>
      </div>
    </div>
    <p class="gp-fonte">{{ grafico.fonte }}</p>
    <p class="gp-data">{{ grafico.dataTexto }}</p>
    <p class="gp-nota">{{ grafico.nota }}</p>
    <p class="gp-aviso">{{ AVISO }}</p>
    <p class="gp-marca">redentia.com.br</p>
    <div class="gp-acoes">
      <a class="gp-baixar" :href="grafico.pngPath" download>Baixar PNG</a>
    </div>
    <div class="gp-embed">
      <p class="gp-embed-rotulo">Código para incorporar. Uso livre com crédito.</p>
      <textarea class="gp-code" readonly rows="3" :value="codigo" />
      <button type="button" class="gp-copiar" @click="copiar">
        {{ copiado ? 'Copiado' : 'Copiar código' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.gp {
  scroll-margin-top: 120px;
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(36px, 6vw, 72px) 0;
}
h2 {
  margin: 0;
  color: var(--nu-navy);
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.08;
}
.gp-linha {
  margin: 12px 0 0;
  max-width: 62ch;
  color: var(--nu-navy);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
}
.gp-chart { margin-top: 28px; }
.gp-row {
  display: grid;
  grid-template-columns: minmax(140px, 220px) minmax(0, 1fr) auto;
  column-gap: 16px;
  row-gap: 8px;
  align-items: center;
  margin-top: 16px;
}
.gp-row:first-child { margin-top: 0; }
.gp-rotulo, .gp-valor {
  color: var(--nu-navy);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}
.gp-valor { font-weight: 800; white-space: nowrap; }
.gp-trilho {
  display: block;
  width: 100%;
  min-width: 0;
  height: 14px;
  border-radius: 999px;
  background: rgba(12, 21, 36, 0.08);
  overflow: hidden;
}
.gp-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #2f6aff;
}
.gp-fonte, .gp-data, .gp-nota, .gp-aviso, .gp-marca {
  margin: 14px 0 0;
  max-width: 68ch;
  color: var(--nu-navy);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}
.gp-aviso, .gp-marca { font-weight: 800; }
.gp-acoes { margin-top: 22px; }
.gp-baixar, .gp-copiar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 18px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
}
.gp-baixar {
  background: #2f6aff;
  color: #fff;
  text-decoration: none;
}
.gp-baixar:hover { background: #2258db; color: #fff; }
.gp-baixar:focus-visible, .gp-copiar:focus-visible {
  outline: 3px solid #0c1524;
  outline-offset: 3px;
}
.gp-embed { margin-top: 22px; }
.gp-embed-rotulo {
  margin: 0 0 8px;
  color: var(--nu-navy);
  font-size: 14px;
  font-weight: 700;
}
.gp-code {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid rgba(12, 21, 36, 0.16);
  border-radius: 16px;
  background: #fff;
  color: var(--nu-navy);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.45;
  resize: vertical;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.gp-copiar {
  margin-top: 10px;
  border: 1px solid #0c1524;
  background: transparent;
  color: #0c1524;
}
.gp-copiar:hover { background: rgba(12, 21, 36, 0.06); }

@media (max-width: 720px) {
  .gp-row { grid-template-columns: minmax(0, 1fr) auto; }
  .gp-rotulo { grid-column: 1; grid-row: 1; }
  .gp-valor { grid-column: 2; grid-row: 1; justify-self: end; }
  .gp-trilho { grid-column: 1 / -1; grid-row: 2; }
}
</style>
