<script setup lang="ts">
/**
 * Passo 2 — "Selecione a instituição", como no Pluggy Connect: busca com
 * filtro instantâneo, abas por tipo (lá: Pessoal / Empresas / Corretoras;
 * aqui: Todas / Bancos / Corretoras), lista de linhas com o avatar quadrado
 * e o nome, hairline entre elas. Estado vazio da busca com saída.
 *
 * A lista é a de app/content/instituicoes.ts (espelho da config do
 * Backend, que valida o slug no C6).
 */
import { filtrarInstituicoes, type FiltroTipo, type Instituicao } from '~/content/instituicoes'

const emit = defineEmits<{ escolher: [inst: Instituicao] }>()

const busca = ref('')
const tipo = ref<FiltroTipo>('todas')
const ABAS: { v: FiltroTipo, l: string }[] = [
  { v: 'todas', l: 'Todas' },
  { v: 'banco', l: 'Bancos' },
  { v: 'corretora', l: 'Corretoras' },
]
const lista = computed(() => filtrarInstituicoes(busca.value, tipo.value))
const buscaId = useId()
</script>

<template>
  <section class="ccl">
    <h1 data-cc-titulo tabindex="-1" class="ccl__h1">Selecione a instituição</h1>

    <div class="ccl__busca">
      <input
        :id="buscaId"
        v-model="busca"
        type="search"
        class="ccl__input"
        placeholder="Encontre a sua instituição"
        aria-label="Encontre a sua instituição"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        enterkeyhint="search"
      >
      <svg class="ccl__lupa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
    </div>

    <div class="ccl__abas" role="tablist" aria-label="Tipo de instituição">
      <button
        v-for="a in ABAS"
        :key="a.v"
        type="button"
        role="tab"
        class="ccl__aba"
        :class="{ 'ccl__aba--on': tipo === a.v }"
        :aria-selected="tipo === a.v"
        @click="tipo = a.v"
      >{{ a.l }}</button>
    </div>

    <ul v-if="lista.length" class="ccl__lista" role="list">
      <li v-for="i in lista" :key="i.slug">
        <button type="button" class="ccl__item" @click="emit('escolher', i)">
          <ClienteInstLogo :inst="i" :size="28" />
          <span class="ccl__nome">{{ i.name }}</span>
          <svg class="ccl__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </li>
    </ul>
    <p v-else class="ccl__vazio" role="status">
      Nenhuma instituição com "{{ busca.trim() }}"<template v-if="tipo !== 'todas'"> nesta aba</template>.
      Tente outro nome ou a sigla, como "BB" ou "XP"<template v-if="tipo !== 'todas'">, ou veja em "Todas"</template>.
    </p>
  </section>
</template>

<style scoped>
.ccl { flex: 1 1 auto; display: flex; flex-direction: column; }
.ccl__h1 { margin: 0; color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -.02em; outline: none; }

.ccl__busca { position: relative; margin-top: 14px; }
.ccl__input {
  width: 100%; height: 44px; padding: 0 40px 0 14px; border-radius: 10px;
  border: 1.5px solid var(--nu-cream-line); background: var(--nu-white); color: var(--nu-ink);
  font-size: 14px; font-weight: 600; outline: none; transition: border-color .2s;
  -webkit-appearance: none; appearance: none;
}
.ccl__input::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.ccl__input:focus { border-color: var(--nu-blue); }
.ccl__input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
.ccl__lupa { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--nu-gray); pointer-events: none; }

.ccl__abas { margin-top: 10px; display: flex; gap: 2px; border-bottom: 1px solid var(--nu-cream-line); }
.ccl__aba {
  position: relative; padding: 9px 10px 10px; border: none; background: none; color: var(--nu-gray);
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: color .2s;
}
.ccl__aba::after {
  content: ''; position: absolute; left: 6px; right: 6px; bottom: -1px; height: 2px; border-radius: 2px;
  background: transparent; transition: background .2s;
}
.ccl__aba--on { color: var(--nu-ink); }
.ccl__aba--on::after { background: var(--nu-blue); }
.ccl__aba:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; border-radius: 6px; }

.ccl__lista { list-style: none; margin: 4px -8px 0; padding: 0; }
.ccl__item {
  display: flex; align-items: center; gap: 12px; width: 100%; min-height: 50px; padding: 0 8px;
  border: none; border-radius: 10px; background: none; text-align: left; color: var(--nu-ink);
  font-family: inherit; cursor: pointer; transition: background .2s;
}
.ccl__lista li + li .ccl__item { box-shadow: inset 0 1px 0 var(--nu-cream-2); }
.ccl__item:hover { background: var(--nu-cream); }
.ccl__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; }
.ccl__nome { flex: 1 1 auto; min-width: 0; font-size: 14.5px; font-weight: 600; }
.ccl__seta { color: var(--nu-sand); flex-shrink: 0; }

.ccl__vazio { margin: 22px 4px 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.55; }
</style>
