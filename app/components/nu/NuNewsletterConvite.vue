<script setup lang="ts">
// O convite de O mercado da semana: um bloco no fluxo, imediatamente antes
// do rodapé, em qualquer largura. Até 760px o formato do evento é
// bloco_mobile; acima, bloco_desktop. Os dois nascem no HTML e o CSS esconde
// um (display: none), para o SSR e o cliente pintarem a mesma árvore e o
// formulário escondido não receber foco. Some para quem já assinou, fechou
// (30 dias) ou está fora da página. Fica fora do /guias e das páginas de
// conta (utils/newsletter-lugares.ts).
import { CONTA_CONVITE_VISTO } from '~/composables/useConviteDaConta'
import { NEWSLETTER_ASSINOU } from '~/composables/useNewsletter'
import { conviteElegivel, conviteForaDaPagina, type FormatoConvite } from '~/utils/newsletter-lugares'

const { isAuthenticated } = useAuthState()
// a folha de cadastro vem antes: com ela aberta, ou depois de a folha de uma
// calculadora subir nesta visita, o convite da newsletter espera a próxima
const folhaCadastro = useCadastroFolha()
const route = useRoute()
const ligada = useRuntimeConfig().public.newsletterLigada === true

const FECHOU = 'nu:newsletter-convite-fechou'

/** localStorage e sessão, lidos depois da hidratação para não divergir do SSR */
const bloqueado = ref(false)
const blocos: FormatoConvite[] = ['bloco_mobile', 'bloco_desktop']

const blocoVisivel = computed(() => ligada
  && !isAuthenticated.value
  && !folhaCadastro.aberta.value
  && !conviteForaDaPagina(route.path)
  && !bloqueado.value)

function ler(chave: string, sessao = false): string | null {
  try {
    return (sessao ? sessionStorage : localStorage).getItem(chave)
  }
  catch {
    return null
  }
}
function gravar(chave: string, valor: string, sessao = false) {
  try {
    (sessao ? sessionStorage : localStorage).setItem(chave, valor)
  }
  catch { /* modo privado: vale só nesta visita */ }
}

function elegivel(): boolean {
  return conviteElegivel({
    ligada,
    autenticado: isAuthenticated.value,
    folhaAberta: !!folhaCadastro.aberta.value,
    contaConviteVisto: !!ler(CONTA_CONVITE_VISTO, true),
    caminho: route.path,
    assinou: !!ler(NEWSLETTER_ASSINOU),
    fechouEm: Number(ler(FECHOU)) || null,
    agora: Date.now(),
  })
}

function fechar() {
  bloqueado.value = true
  gravar(FECHOU, String(Date.now()))
}
function ocultarAssinante() {
  bloqueado.value = true
}

onMounted(() => {
  if (!elegivel()) bloqueado.value = true
})
</script>

<template>
  <section
    v-for="fmt in blocos"
    v-show="blocoVisivel"
    :key="fmt"
    class="nnb"
    :class="`nnb--${fmt}`"
    data-convite="bloco"
    :data-formato="fmt"
    :aria-labelledby="`nnb-titulo-${fmt}`"
  >
    <div class="nnb__cabeca">
      <div class="nnb__texto">
        <p class="nnb__eyebrow">Newsletter grátis</p>
        <h2 :id="`nnb-titulo-${fmt}`" class="nnb__titulo">O mercado da semana, toda sexta.</h2>
      </div>
      <button type="button" class="nnb__fechar" aria-label="Fechar" @click="fechar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    <p class="nnb__sub">O Ibovespa da semana, as notícias que mexeram nele e os proventos da semana que vem.</p>
    <NuNewsletterForm class="nnb__form" origem="convite" :formato="fmt" @ja-assinante="ocultarAssinante" />
  </section>
</template>

<style scoped>
/* bloco no fluxo. Sem fixed, absolute, sticky nem z-index. */
.nnb {
  margin: 20px 12px 0;
  padding: 22px 18px 18px;
  border-radius: var(--nu-r-card);
  background: var(--nu-navy) url('/email/brilho.jpg') center top / cover no-repeat;
  color: var(--nu-cream-text);
}
.nnb--bloco_desktop { display: none; }
.nnb__cabeca { display: flex; align-items: flex-start; gap: 12px; }
.nnb__texto { flex: 1; min-width: 0; }
.nnb__eyebrow {
  margin: 0; color: var(--nu-blue-soft);
  font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;
}
.nnb__titulo {
  margin: 8px 0 0; color: var(--nu-cream-text);
  font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.12;
}
.nnb__sub { margin: 10px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.nnb__form { margin-top: 18px; }
.nnb__fechar {
  flex: none; width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: var(--nu-cream-text-10); color: var(--nu-cream-text-78);
}
.nnb__fechar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

@media (min-width: 761px) {
  .nnb--bloco_mobile { display: none; }
  .nnb--bloco_desktop {
    display: block;
    width: min(720px, calc(100% - 48px));
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
