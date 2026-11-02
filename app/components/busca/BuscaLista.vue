<script setup lang="ts">
// A lista da /busca (redesenho de 02/11/2026): grupos de linhas numa coluna
// só, na ordem em que se lê e em que as setas andam, e por último a linha
// "Perguntar à Redentia". A marcação é um índice só para a lista inteira
// (grupos + pergunta), dono na página: o campo segura o foco e as setas
// mexem aqui (padrão combobox, aria-activedescendant).
import type { BuscaGrupo, BuscaItem } from '~/composables/useBuscaIndex'

const props = defineProps<{
  grupos: BuscaGrupo[]
  /** índice marcado na lista inteira; -1 nenhum */
  ativo: number
  /** linhas de skeleton no lugar dos grupos (0 = nenhuma) */
  carregando?: number
  /** a linha de perguntar, com a busca entre aspas; null sem texto */
  pergunta?: { texto: string; logado: boolean } | null
  /** grupo com a ação "Limpar" no cabeçalho (as recentes) */
  limpavel?: string | null
}>()
const emit = defineEmits<{
  (e: 'escolher', item: BuscaItem): void
  (e: 'perguntar'): void
  (e: 'marcar', i: number): void
  (e: 'limpar'): void
}>()

/** início de cada grupo na contagem corrida */
const inicios = computed(() => {
  let n = 0
  return props.grupos.map((g) => { const i = n; n += g.itens.length; return i })
})
const total = computed(() => props.grupos.reduce((n, g) => n + g.itens.length, 0))
</script>

<template>
  <div id="busca-lista" class="bli" role="listbox" aria-label="Resultados da busca">
    <div v-if="props.carregando" class="bli__grupo" aria-hidden="true">
      <div class="bli__cab"><NuSkeleton variant="line" width="88px" height="12px" radius="chip" /></div>
      <div v-for="i in props.carregando" :key="i" class="bli__sk">
        <NuSkeleton variant="block" width="40px" height="40px" radius="chip" />
        <span class="bli__sk-id">
          <NuSkeleton variant="line" width="72px" height="15px" radius="chip" />
          <NuSkeleton variant="line" width="150px" height="12px" radius="chip" />
        </span>
        <span class="bli__sk-num">
          <NuSkeleton variant="line" width="70px" height="15px" radius="chip" />
          <NuSkeleton variant="line" width="44px" height="12px" radius="chip" />
        </span>
      </div>
    </div>

    <div
      v-for="(g, gi) in props.grupos" :key="g.id" class="bli__grupo" role="group"
      :aria-labelledby="g.titulo ? `busca-g-${g.id}` : undefined"
    >
      <div v-if="g.titulo" class="bli__cab">
        <span :id="`busca-g-${g.id}`" class="bli__rotulo">{{ g.titulo }}</span>
        <button
          v-if="props.limpavel === g.id" type="button" class="bli__limpar"
          @click="emit('limpar')"
        >Limpar</button>
      </div>
      <ul class="bli__linhas">
        <li v-for="(it, i) in g.itens" :key="it.id">
          <BuscaLinha
            :id="`busca-op-${inicios[gi]! + i}`"
            :item="it"
            :posicao="inicios[gi]! + i"
            :ativo="props.ativo === inicios[gi]! + i"
            @escolher="emit('escolher', it)"
            @marcar="emit('marcar', inicios[gi]! + i)"
          />
        </li>
      </ul>
    </div>

    <div v-if="props.pergunta" class="bli__grupo bli__grupo--pergunta">
      <button
        :id="`busca-op-${total}`"
        type="button"
        class="bli__perguntar"
        :class="{ 'bli__perguntar--ativo': props.ativo === total }"
        role="option"
        :aria-selected="props.ativo === total"
        @click="emit('perguntar')"
        @mousemove="props.ativo !== total && emit('marcar', total)"
      >
        <span class="bli__balao" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-3 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" /></svg>
        </span>
        <span class="bli__perg-id">
          <span class="bli__perg-titulo">Perguntar à Redentia: <q class="bli__perg-q">{{ props.pergunta.texto }}</q></span>
          <span class="bli__perg-sub">{{ props.pergunta.logado ? 'A resposta abre ao lado, no chat.' : 'Entre na sua conta para perguntar.' }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bli { display: flex; flex-direction: column; gap: 28px; }
.bli__cab {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  min-height: 24px; margin-bottom: 4px;
}
.bli__rotulo {
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.bli__limpar {
  background: none; border: none; padding: 8px 0 8px 12px; margin: -8px 0;
  color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer;
}
.bli__limpar:hover { color: var(--nu-blue-hover); }
.bli__limpar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 6px; }

.bli__linhas { list-style: none; margin: 0; padding: 0; }
.bli__linhas > li + li { border-top: 1px solid var(--nu-cream-2); }

/* skeleton espelha a linha: tile 40, ticker + nome, preço + variação */
.bli__sk { display: flex; align-items: center; gap: 14px; min-height: 64px; padding: 10px 0; }
.bli__sk + .bli__sk { border-top: 1px solid var(--nu-cream-2); }
.bli__sk-id { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.bli__sk-num { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; }

/* a pergunta: última linha, separada da lista por um fio */
.bli__grupo--pergunta { border-top: 1px solid var(--nu-cream-2); padding-top: 8px; margin-top: -12px; }
.bli__perguntar {
  display: flex; align-items: center; gap: 14px; width: calc(100% + 24px);
  min-height: 64px; padding: 10px 12px; margin: 0 -12px;
  background: none; border: none; border-radius: 14px; text-align: left; cursor: pointer;
  color: var(--nu-ink); transition: background .15s;
}
.bli__perguntar--ativo { background: var(--nu-cream); }
.bli__perguntar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bli__balao {
  flex: none; width: 40px; height: 40px; border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue-tint); color: var(--nu-blue-text);
}
.bli__perg-id { flex: 1; min-width: 0; }
.bli__perg-titulo {
  display: block; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 800; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bli__perg-q { color: var(--nu-ink); quotes: '“' '”'; }
.bli__perg-sub { display: block; margin-top: 2px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }
</style>
