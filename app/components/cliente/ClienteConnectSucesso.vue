<script setup lang="ts">
/**
 * Passo 7 — sucesso, no padrão do Pluggy: o check animado, "{banco}
 * conectado", uma linha de subtítulo e o botão "Concluir". Embaixo, um bloco
 * discreto com o link de gestão (obrigatório pela LGPD: é por ele que a
 * pessoa vê quem consultou e revoga), com "Copiar link" e "Abrir". A URL
 * não aparece em texto. "Concluir" leva ao estado final "Tudo certo", que
 * mantém o copiar: o link aparece SÓ nesta tela, uma vez.
 *
 * O subtítulo é o mesmo em qualquer fluxo e não afirma nada sobre a carteira:
 * diz quem passa a acompanhar e que o acompanhamento é o que a pessoa
 * autorizou.
 */
import type { Instituicao } from '~/content/instituicoes'

const props = defineProps<{
  inst: Instituicao
  escritorio: string | null
  assessor: string | null
  manageUrl: string | null
  /** estado final, depois de "Concluir" */
  fim: boolean
}>()
const emit = defineEmits<{ concluir: [] }>()

/** Quem passa a acompanhar, abrindo a frase: o assessor, o escritório ou, sem nenhum dos dois, "O escritório". */
const quem = computed(() => props.assessor?.trim() || props.escritorio?.trim() || 'O escritório')

const copiado = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
async function copiar(url: string) {
  try { await navigator.clipboard?.writeText(url) }
  catch { /* clipboard bloqueado: o "Abrir" continua ao lado */ }
  copiado.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { copiado.value = false }, 1600)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="ccok">
    <div class="ccok__check" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path class="ccok__traco" d="M4.5 12.5l5 5L19.5 7" /></svg>
    </div>

    <template v-if="!fim">
      <div class="ccok__inst"><ClienteInstLogo :inst="inst" :size="22" /><span>{{ inst.name }}</span></div>
      <h1 data-cc-titulo tabindex="-1" class="ccok__h1">{{ inst.name }} conectado</h1>
      <p class="ccok__p">{{ quem }} já pode acompanhar as posições de investimento que você autorizou.</p>
    </template>
    <template v-else>
      <h1 data-cc-titulo tabindex="-1" class="ccok__h1 ccok__h1--fim">Tudo certo.</h1>
      <p class="ccok__p">Você já pode fechar esta página.</p>
    </template>

    <div v-if="manageUrl" class="ccok__gestao" data-clarity-mask="true">
      <span class="ccok__chave" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M15 8l3 3M18 5l2 2" /></svg>
      </span>
      <div class="ccok__gestao-c">
        <p class="ccok__gestao-t">{{ fim ? 'O link de gestão aparece só aqui.' : 'Guarde o link para gerenciar ou revogar o acesso quando quiser.' }}</p>
        <div class="ccok__acoes">
          <button type="button" class="ccok__copiar" @click="copiar(manageUrl)">{{ copiado ? 'Copiado' : (fim ? 'Copiar link de gestão' : 'Copiar link') }}</button>
          <a :href="manageUrl" rel="noreferrer" class="ccok__abrir">Abrir</a>
        </div>
      </div>
    </div>

    <footer v-if="!fim" class="ccok__foot">
      <ClienteConnectButton @click="emit('concluir')">Concluir</ClienteConnectButton>
    </footer>
  </section>
</template>

<style scoped>
.ccok { flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; text-align: center; }
.ccok__check {
  width: 76px; height: 76px; margin-top: 18px; border-radius: 50%;
  background: var(--nu-green-bg); color: var(--nu-green-2);
  display: flex; align-items: center; justify-content: center;
  animation: ccok-pop .4s cubic-bezier(.2, .9, .3, 1.3) both;
}
.ccok__traco { stroke-dasharray: 30; stroke-dashoffset: 30; animation: ccok-traco .45s ease-out .25s forwards; }
@keyframes ccok-pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes ccok-traco { to { stroke-dashoffset: 0; } }
.ccok__inst { margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray); font-size: 12.5px; font-weight: 700; }

.ccok__h1 { margin: 10px 0 0; color: var(--nu-ink); font-size: 22px; font-weight: 800; letter-spacing: -.03em; line-height: 1.2; outline: none; }
.ccok__h1--fim { margin-top: 22px; }
.ccok__p { margin: 8px 0 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.5; }

.ccok__gestao {
  width: 100%; margin-top: 22px; padding: 14px; border-radius: 12px; background: var(--nu-cream);
  display: flex; align-items: flex-start; gap: 12px; text-align: left;
}
.ccok__chave {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 9px; background: var(--nu-white); color: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.ccok__gestao-c { min-width: 0; flex: 1 1 auto; }
.ccok__gestao-t { margin: 0; color: var(--nu-ink); font-size: 13px; font-weight: 600; line-height: 1.45; }
.ccok__acoes { margin-top: 10px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ccok__copiar {
  min-height: 36px; padding: 0 14px; border: 1.5px solid var(--nu-cream-line); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-ink); font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; transition: background .2s;
}
.ccok__copiar:hover { background: var(--nu-cream-2); }
.ccok__copiar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ccok__abrir { color: var(--nu-blue); font-size: 13px; font-weight: 800; }
.ccok__abrir:hover { color: var(--nu-blue-hover); }
.ccok__abrir:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 3px; }

.ccok__foot { width: 100%; margin-top: auto; padding-top: 18px; }
</style>
