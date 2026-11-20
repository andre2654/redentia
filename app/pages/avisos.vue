<script setup lang="ts">
// /avisos: "Escolher avisos" (canvas "WhatsApp: ative seus avisos", 20/11/2026,
// quadro 2). Os quatro avisos, cada um com WhatsApp e e-mail, e um Salvar.
// É a tela que o botão "Escolher avisos" do WhatsApp abre já na conta da
// pessoa, pelo link assinado (useAvisosDaTela). Sem link, com sessão, é a mesma
// escolha pelas preferências da conta; sem os dois, pede para entrar.
// As mesmas preferências moram em /conta#notificacoes (ContaNotificacoes).
// Pessoal: noindex e private/no-store (nuxt.config).
import { AVISOS_DA_TELA, CANAIS, alternar, ligado, type AvisoDaTela, type Canal } from '~/utils/avisosDaTela'

const tela = useAvisosDaTela()
const { estado, prefs, podeWhatsapp, nome, erroAoSalvar, peloLink } = tela

onMounted(() => { void tela.carregar() })

function tocar(aviso: AvisoDaTela, canal: Canal) {
  if (canal === 'whatsapp' && !podeWhatsapp.value) return
  tela.editar()
  prefs.value = alternar(prefs.value, aviso, canal, !ligado(prefs.value, aviso, canal), podeWhatsapp.value)
}

const comCartoes = computed(() => ['pronto', 'salvando', 'salvo'].includes(estado.value))
const dek = computed(() => nome.value ? `${nome.value}, escolha por onde cada aviso chega.` : 'Escolha por onde cada aviso chega.')

usePageSeo({
  title: 'Seus avisos',
  description: `Escolha quais avisos da sua carteira chegam pelo WhatsApp e por e-mail na ${MARCA.nome}.`,
  robots: 'noindex, nofollow',
})
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })
</script>

<template>
  <div class="av">
    <div class="av__col">
      <header class="av__topo">
        <NuEyebrow>AVISOS DA CARTEIRA</NuEyebrow>
        <h1 class="av__titulo">Seus avisos</h1>
        <p v-if="comCartoes || estado === 'carregando'" class="av__dek">{{ dek }}</p>
      </header>

      <!-- carregando: o esqueleto com a altura dos cartões -->
      <ul v-if="estado === 'carregando'" class="av__lista" aria-hidden="true">
        <li v-for="a in AVISOS_DA_TELA" :key="a.id" class="av__cartao">
          <div class="av__txt">
            <NuSkeleton width="132px" height="18px" radius="chip" />
            <NuSkeleton width="176px" height="14px" radius="chip" />
          </div>
          <div class="av__canais">
            <NuSkeleton width="92px" height="36px" radius="tile" />
            <NuSkeleton width="74px" height="36px" radius="tile" />
          </div>
        </li>
      </ul>

      <template v-else-if="comCartoes">
        <ul class="av__lista">
          <li v-for="a in AVISOS_DA_TELA" :key="a.id" class="av__cartao">
            <div class="av__txt">
              <span class="av__nome">{{ a.nome }}</span>
              <span class="av__quando">{{ a.quando }}</span>
            </div>
            <div class="av__canais" role="group" :aria-label="`${a.nome}: por onde chega`">
              <button
                v-for="c in CANAIS" :key="c.id" type="button" class="av__canal"
                :class="{ 'av__canal--on': ligado(prefs, a, c.id), 'av__canal--off': c.id === 'whatsapp' && !podeWhatsapp }"
                :aria-pressed="ligado(prefs, a, c.id)"
                :disabled="(c.id === 'whatsapp' && !podeWhatsapp) || estado === 'salvando'"
                :aria-label="`${a.nome} por ${c.nome}`"
                @click="tocar(a, c.id)"
              >
                {{ c.nome }}
              </button>
            </div>
          </li>
        </ul>

        <p class="av__nota">No WhatsApp sai no máximo um aviso por dia, entre 8h e 20h. O bom dia é o primeiro, às 8h.</p>
        <p v-if="!podeWhatsapp" class="av__nota">O WhatsApp fica desligado até você aceitar receber a Aportou por lá.</p>

        <div class="av__acao">
          <div v-if="estado === 'salvo'" class="av__salvo" role="status">
            <span class="av__check" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
            </span>
            <span>
              <strong>Pronto, seus avisos estão salvos.</strong>
              {{ peloLink ? ' Pode voltar ao WhatsApp. Para mudar de novo, escreva avisos por lá.' : ' Eles também aparecem em Conta, Notificações.' }}
            </span>
          </div>
          <NuBotaoSeta v-else largo :loading="estado === 'salvando'" @click="tela.salvar()">Salvar</NuBotaoSeta>
          <p v-if="erroAoSalvar" class="av__erro" role="status">{{ erroAoSalvar }}</p>
        </div>
      </template>

      <div v-else class="av__aviso" role="status">
        <template v-if="estado === 'vencido'">
          <p class="av__aviso-t">Este link venceu.</p>
          <p class="av__aviso-x">Escreva <strong>avisos</strong> no WhatsApp da Aportou para receber outro, ou entre na sua conta.</p>
          <NuBotaoSeta to="/login?redirect=/avisos" tamanho="m">Entrar</NuBotaoSeta>
        </template>
        <template v-else-if="estado === 'entrar'">
          <p class="av__aviso-t">Entre para escolher seus avisos.</p>
          <p class="av__aviso-x">Ou toque em <strong>Escolher avisos</strong> no WhatsApp da Aportou: o link já abre na sua conta.</p>
          <NuBotaoSeta to="/login?redirect=/avisos" tamanho="m">Entrar</NuBotaoSeta>
        </template>
        <template v-else>
          <p class="av__aviso-t">Não consegui abrir seus avisos agora.</p>
          <p class="av__aviso-x">Pode ser a conexão. Tente de novo em instantes.</p>
          <NuLinkSeta seta="nenhuma" @click="tela.carregar()">Tentar de novo</NuLinkSeta>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Uma coluna estreita no creme da página (o quadro 2 é a tela do celular):
   os cartões brancos com raio 16, os canais em selos de raio 8 que acendem no
   cobalto, a nota em legenda e o Salvar na largura da coluna. */
.av { background: var(--nu-page); padding: clamp(40px, 6vw, 88px) var(--nu-coluna) clamp(64px, 8vw, 112px); }
.av__col { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; }

.av__topo { display: flex; flex-direction: column; gap: 14px; }
.av__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); line-height: 1.05; letter-spacing: var(--nu-ls-display); }
.av__dek { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.5; }

.av__lista { list-style: none; margin: 32px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.av__cartao {
  display: flex; align-items: center; gap: 12px 16px; min-height: 76px; box-sizing: border-box;
  background: var(--nu-white); border-radius: var(--nu-r-tile); box-shadow: var(--nu-shadow-branco);
  padding: 14px 14px 14px 18px;
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both;
}
.av__lista .av__cartao:nth-child(2) { animation-delay: calc(var(--nu-passo-cascata) * 1); }
.av__lista .av__cartao:nth-child(3) { animation-delay: calc(var(--nu-passo-cascata) * 2); }
.av__lista .av__cartao:nth-child(4) { animation-delay: calc(var(--nu-passo-cascata) * 3); }
.av__txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.av__nome { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto); }
.av__quando { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); line-height: 1.4; }

.av__canais { flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
/* o selo tem 36px de altura; o alvo de toque chega a 44px pela área invisível em volta */
.av__canal {
  position: relative; min-height: 36px; padding: 0 12px; border: 0; border-radius: var(--nu-r-tag);
  background: var(--nu-cream-2); color: var(--nu-gray-3);
  font-family: inherit; font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  cursor: pointer;
  transition: background var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.av__canal::before { content: ''; position: absolute; inset: -4px -3px; }
.av__canal:hover:not(:disabled) { background: color-mix(in srgb, var(--nu-ink) 8%, var(--nu-cream-2)); }
.av__canal:active:not(:disabled) { transform: scale(0.97); }
.av__canal--on { background: var(--nu-blue); color: var(--nu-white); }
.av__canal--on:hover:not(:disabled) { background: var(--nu-blue-text); }
.av__canal--off { color: var(--nu-gray); cursor: not-allowed; opacity: 0.6; }
.av__canal:disabled:not(.av__canal--off) { cursor: progress; }

.av__nota { margin: 14px 4px 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); line-height: 1.5; }
.av__nota + .av__nota { margin-top: 6px; }

.av__acao { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
.av__salvo {
  display: flex; align-items: flex-start; gap: 12px; min-height: 56px; box-sizing: border-box;
  background: var(--nu-white); border-radius: var(--nu-r-tile); box-shadow: var(--nu-shadow-branco); padding: 16px 18px;
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5;
  animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) both;
}
.av__salvo strong { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.av__check { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--nu-green-bg); color: var(--nu-green-text); }
.av__erro { margin: 0; color: var(--nu-amber-text); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); line-height: 1.5; }

.av__aviso {
  margin-top: 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
  background: var(--nu-white); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-branco); padding: clamp(22px, 3vw, 32px);
  animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) both;
}
.av__aviso-t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.av__aviso-x { margin: 0 0 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.av__aviso-x strong { font-weight: var(--nu-w-forte); }

/* no celular estreito, o nome em cima e os canais embaixo, na largura toda */
@media (max-width: 380px) {
  .av__cartao { flex-direction: column; align-items: stretch; }
  .av__canais { justify-content: flex-start; }
}
</style>
