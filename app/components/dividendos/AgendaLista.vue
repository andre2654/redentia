<script setup lang="ts">
// Lista da agenda, agrupada pela data de pagamento. No desktop é tabela;
// até 800 px vira cartão, para a página não rolar de lado nem sobrepor colunas.
import type { ClasseAgenda, DiaAgenda, EventoAgenda } from '~/utils/agendaDividendos'

const props = defineProps<{
  dias: DiaAgenda[]
  contagens: Record<ClasseAgenda, number>
}>()

const filtro = ref<'todos' | ClasseAgenda>('todos')

const filtros = computed(() => {
  const base: { id: 'todos' | ClasseAgenda, rotulo: string, n: number }[] = [
    { id: 'todos', rotulo: 'Todos', n: props.dias.reduce((n, d) => n + d.eventos.length, 0) },
    { id: 'acao', rotulo: 'Ações', n: props.contagens.acao },
    { id: 'fii', rotulo: 'FIIs', n: props.contagens.fii },
    { id: 'bdr', rotulo: 'BDRs', n: props.contagens.bdr },
  ]
  if (props.contagens.outro > 0) base.push({ id: 'outro', rotulo: 'Outros', n: props.contagens.outro })
  return base.filter((f) => f.id === 'todos' || f.n > 0)
})

function visivel(evento: EventoAgenda): boolean {
  return filtro.value === 'todos' || evento.classe === filtro.value
}

function diaVisivel(dia: DiaAgenda): boolean {
  return dia.eventos.some(visivel)
}

const algum = computed(() => props.dias.some(diaVisivel))
</script>

<template>
  <div class="agl">
    <div class="agl__filtros" role="group" aria-label="Filtrar por tipo de ativo">
      <button
        v-for="f in filtros"
        :key="f.id"
        type="button"
        class="agl__filtro"
        :aria-pressed="filtro === f.id"
        @click="filtro = f.id"
      >
        {{ f.rotulo }} <span class="agl__filtro-n">{{ f.n }}</span>
      </button>
    </div>

    <p v-if="!algum" class="agl__vazio">Nenhum provento deste tipo com pagamento neste mês.</p>

    <section v-for="dia in dias" v-show="diaVisivel(dia)" :key="dia.data" class="agl__dia">
      <h3 class="agl__dia-titulo">{{ dia.titulo }}</h3>

      <ul class="agl__cards">
        <li v-for="(evento, i) in dia.eventos" v-show="visivel(evento)" :key="`${dia.data}-c-${i}`" class="agl__card">
          <div class="agl__card-top">
            <NuAssetLogo :ticker="evento.ticker" :letter="evento.ticker.charAt(0) || '?'" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-gray-3)" :size="32" :radius="10" />
            <NuxtLink v-if="evento.href" :to="evento.href" class="agl__ticker">{{ evento.ticker }}</NuxtLink>
            <span v-else class="agl__ticker">{{ evento.ticker }}</span>
            <span class="agl__valor">{{ evento.valor }}</span>
          </div>
          <p class="agl__nome">{{ evento.nome }}</p>
          <dl class="agl__dl">
            <div><dt>Tipo</dt><dd>{{ evento.tipo }}</dd></div>
            <div><dt>Data com</dt><dd>{{ evento.dataComTexto }}</dd></div>
            <div><dt>Data ex</dt><dd>{{ evento.dataExTexto }}</dd></div>
            <div><dt>Pagamento</dt><dd>{{ evento.pagamentoTexto }}</dd></div>
          </dl>
        </li>
      </ul>

      <div class="agl__scroll" tabindex="0" role="region" :aria-label="`Pagamentos em ${dia.titulo}`">
        <table class="agl__table">
          <thead>
            <tr>
              <th scope="col">Ticker</th>
              <th scope="col">Nome</th>
              <th scope="col">Tipo</th>
              <th scope="col">Valor</th>
              <th scope="col">Data com</th>
              <th scope="col">Data ex</th>
              <th scope="col">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(evento, i) in dia.eventos" v-show="visivel(evento)" :key="`${dia.data}-t-${i}`">
              <td>
                <span class="agl__papel">
                  <NuAssetLogo :ticker="evento.ticker" :letter="evento.ticker.charAt(0) || '?'" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-gray-3)" :size="26" :radius="8" />
                  <NuxtLink v-if="evento.href" :to="evento.href" class="agl__ticker">{{ evento.ticker }}</NuxtLink>
                  <span v-else class="agl__ticker">{{ evento.ticker }}</span>
                </span>
              </td>
              <td class="agl__nome-td">{{ evento.nome }}</td>
              <td>{{ evento.tipo }}</td>
              <td class="agl__num">{{ evento.valor }}</td>
              <td class="agl__num">{{ evento.dataComTexto }}</td>
              <td>{{ evento.dataExTexto }}</td>
              <td class="agl__num">{{ evento.pagamentoTexto }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.agl__filtros { display: flex; flex-wrap: wrap; gap: 8px; max-width: 1080px; margin: 0 auto clamp(28px, 4vw, 40px); }
.agl__filtro {
  appearance: none; border: 1px solid var(--nu-line); background: transparent; color: var(--nu-ink);
  border-radius: 999px; padding: 8px 14px; font: inherit; font-size: 14px; font-weight: var(--nu-w-medio);
  letter-spacing: var(--nu-ls-texto); cursor: pointer;
}
.agl__filtro[aria-pressed="true"] { background: var(--nu-ink); color: var(--nu-white); border-color: var(--nu-ink); }
.agl__filtro:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.agl__filtro-n { font-variant-numeric: tabular-nums; opacity: .72; }

.agl__vazio {
  max-width: 1080px; margin: 0 auto; color: var(--nu-gray-3); font-size: var(--nu-fs-md); line-height: 1.5;
}

.agl__dia { max-width: 1080px; margin: 0 auto 28px; min-width: 0; }
.agl__dia-titulo {
  margin: 0 0 12px; color: var(--nu-ink); font-size: clamp(18px, 2vw, 22px);
  font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.2;
}

.agl__cards { display: none; list-style: none; margin: 0; padding: 0; }
.agl__card {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 16px 16px 14px;
  box-shadow: var(--nu-shadow-branco); min-width: 0;
}
.agl__card + .agl__card { margin-top: 10px; }
.agl__card-top { display: flex; align-items: center; gap: 10px; min-width: 0; }
.agl__valor { margin-left: auto; color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; white-space: nowrap; }
.agl__nome { margin: 8px 0 0; color: var(--nu-gray-3); font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.agl__dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin: 12px 0 0; }
.agl__dl div { min-width: 0; }
.agl__dl dt { margin: 0; color: var(--nu-gray); font-size: 12px; font-weight: var(--nu-w-medio); }
.agl__dl dd { margin: 2px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: var(--nu-w-medio); overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }

.agl__ticker { color: var(--nu-ink); font-weight: var(--nu-w-forte); letter-spacing: 0.01em; text-decoration: none; }
a.agl__ticker:hover { color: var(--nu-blue-text); }
a.agl__ticker:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; border-radius: 4px; }

.agl__scroll { overflow-x: auto; background: var(--nu-white); border-radius: var(--nu-r-card-lg); box-shadow: var(--nu-shadow-branco); }
.agl__table { width: 100%; border-collapse: collapse; min-width: 760px; }
.agl__table th {
  text-align: left; padding: 14px 12px; color: var(--nu-gray); font-size: 12px; font-weight: var(--nu-w-medio);
  letter-spacing: 0.04em; text-transform: uppercase; border-bottom: 1px solid var(--nu-line);
}
.agl__table td {
  padding: 12px; border-bottom: 1px solid var(--nu-line-2); color: var(--nu-ink);
  font-size: 14.5px; vertical-align: middle; overflow-wrap: anywhere;
}
.agl__table tr:last-child td { border-bottom: 0; }
.agl__num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.agl__nome-td { min-width: 140px; }
.agl__papel { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }

@media (max-width: 800px) {
  .agl__cards { display: flex; flex-direction: column; }
  .agl__scroll { display: none; }
}
@media (max-width: 420px) {
  .agl__dl { grid-template-columns: 1fr; }
  .agl__card { padding: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .agl__filtro { transition: none; }
}
</style>
