<script setup lang="ts">
// O esqueleto das tabelas de mercado (robustez, 11/11/2026): a mesma pele das
// tabelas (tabela-mercado.css), com o cabeçalho, as linhas de 56px, a posição,
// o logo, o ticker e o nome à esquerda e os números à direita. Fica no lugar
// da tabela só enquanto a lista chega pela primeira vez (a navegação dentro do
// site; o servidor já manda a tabela pronta). Numa troca de filtro quem fica é
// a tabela de antes, esmaecida. As larguras variam de linha a linha, como o
// texto de verdade, e o número de linhas cobre a tela: o que vem embaixo já
// está fora da vista quando a tabela chega.
//   <MercadoEsqueleto :colunas="4" />                  ranking e setor
//   <MercadoEsqueleto :colunas="4" :posicao="false" :logo="false" rotulo="Carregando as taxas" />   Tesouro
withDefaults(defineProps<{
  /** linhas do esqueleto */
  linhas?: number
  /** colunas de número à direita (as do dado; a seta não conta) */
  colunas?: number
  /** a coluna da posição (#) */
  posicao?: boolean
  /** o logo do ativo (o Tesouro não tem) */
  logo?: boolean
  /** o que o leitor de tela ouve */
  rotulo?: string
}>(), { linhas: 10, colunas: 4, posicao: true, logo: true, rotulo: 'Carregando a lista' })

// larguras que se alternam, para o esqueleto ler como texto e não como grade
const NOME = ['148px', '112px', '172px', '96px', '136px']
const NUM = ['64px', '52px', '72px', '58px']
</script>

<template>
  <div class="rkt rkt--esqueleto" :class="{ 'rkt--sem-pos': !posicao }" role="status" aria-busy="true" :aria-label="rotulo">
    <table class="rkt__table" aria-hidden="true">
      <thead>
        <tr>
          <th v-if="posicao" class="rkt__th rkt__th--pos"><NuSkeleton variant="line" width="10px" height="10px" radius="pill" /></th>
          <th class="rkt__th rkt__th--asset" :class="{ 'rkt__sk-borda': !posicao }"><NuSkeleton variant="line" width="52px" height="10px" radius="pill" /></th>
          <th v-for="c in colunas" :key="c" class="rkt__th rkt__th--num"><NuSkeleton class="rkt__sk-num" variant="line" :width="c === 1 ? '76px' : '60px'" height="10px" radius="pill" /></th>
          <td class="rkt__th rkt__th--ir" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in linhas" :key="l" class="rkt__row">
          <td v-if="posicao" class="rkt__cell rkt__cell--pos"><NuSkeleton variant="line" width="14px" height="12px" radius="pill" /></td>
          <td class="rkt__cell rkt__cell--asset" :class="{ 'rkt__sk-borda': !posicao }">
            <span class="rkt__asset">
              <NuSkeleton v-if="logo" class="rkt__logo" variant="block" width="32px" height="32px" radius="10px" />
              <span class="rkt__asset-id">
                <NuSkeleton variant="line" :width="logo ? '46px' : NOME[l % NOME.length]" :height="logo ? '22px' : '14px'" :radius="logo ? '6px' : 'pill'" />
                <NuSkeleton v-if="logo" class="rkt__sk-nome" variant="line" :width="NOME[l % NOME.length]" height="12px" radius="pill" />
              </span>
            </span>
          </td>
          <td v-for="c in colunas" :key="c" class="rkt__cell rkt__cell--num">
            <NuSkeleton class="rkt__sk-num" variant="line" :width="NUM[(l + c) % NUM.length]" :height="c === 1 ? '16px' : '13px'" radius="pill" />
          </td>
          <td class="rkt__cell rkt__cell--ir" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped src="./tabela-mercado.css"></style>
<style scoped>
/* o esqueleto não é clicável: nada acende sob o ponteiro */
.rkt--esqueleto .rkt__row { cursor: default; pointer-events: none; }
.rkt__sk-num { margin-left: auto; }
.rkt__sk-borda { padding-left: var(--rkt-borda); }
@media (max-width: 760px) {
  .rkt__sk-nome { max-width: 96px; }
}
</style>
