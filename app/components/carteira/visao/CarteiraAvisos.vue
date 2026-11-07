<script setup lang="ts">
// Os avisos do motor no topo da /carteira nova (06/11/2026). O botão redondo
// do topo (o "Ideias" que o dono escolheu em 05/11) vira "Avisos", com o selo
// de quantos pedem atenção, e abre o mesmo modal do /asset (o shell de
// CarteiraIdeias: Teleport, foco preso, Esc, folha no celular).
//
// O que muda é o conteúdo, que agora vem do motor (GET /me/carteira/visao):
//  - cada aviso é um fato com número, com o que está em jogo à direita, o prazo
//    e a confiança, e com "Como calculei", que abre a prova linha a linha;
//  - quando o motor não sabe tudo (sem preço médio), a frase diz o que sabe e
//    a ressalva aparece em âmbar, nunca escondida;
//  - "Já sei" tira o aviso da lista (no backend vira o estado `resolvido`, e o
//    mesmo aviso não volta), com desfazer;
//  - "Considerei e não sugeri": os movimentos que um veto barrou e o motivo,
//    para a pessoa ver que o motor não sugere vender o que protege a carteira
//    ou tem sinal de alta;
//  - "O que eu olhei": o checklist, que é o "Sigo de olho" com prova.
// Nada aqui manda comprar ou vender: são fatos e simulações (CVM). Simular e
// Perguntar só PREENCHEM o chat; quem envia é a pessoa.
//
// 07/11/2026, de verdade: "Já sei" grava `resolvido` e "desfazer" grava
// `visto` (PATCH /me/carteira/avisos/{chave}); a tela troca na hora e, se a
// gravação falhar, volta e diz numa linha. No pé, "Receber estes avisos por":
// WhatsApp, e-mail ou só aqui, por tópico (o detector diz qual), no mesmo
// lugar das preferências de /conta. No mock do dev nada é gravado.
import type { AcaoAviso, Aviso, AvisosVisao } from '~/types/carteiraVisao'
import { gruposDeAvisos, quandoAtualizou, tituloDosAvisos } from '~/utils/carteiraVisao'
import { topicosDosAvisos, type TopicoCarteira } from '~/utils/avisosCanais'
import TopoBotao from '~/components/ativo/topo/TopoBotao.vue'

// semBotao (06/11): o topo recolhido abre o modal pelos próprios itens e pelo "+N"; o botão redondo sai
const props = defineProps<{ avisos: AvisosVisao; ativos: number; dadosDe: string | null; semBotao?: boolean; mock?: boolean }>()

const { hidden } = useHiddenValues()
const semValor = (t: string) => (hidden.value ? t.replace(/R\$\s?[\d.,]+( mil)?/g, 'R$ ••••') : t)

const resolvidos = ref<Set<string>>(new Set())
const grupos = computed(() => gruposDeAvisos(props.avisos, resolvidos.value))
const titulo = computed(() => tituloDosAvisos(grupos.value.atencao.length, grupos.value.saber.length))
const pontos = computed(() => grupos.value.atencao.length)
// com fonte velha, a assinatura diz de quando é o dado, não só de quando olhou
const olhou = computed(() => `Olhei ${props.ativos} ativos ${quandoAtualizou(props.avisos.olhouEm)}${props.dadosDe ? `, com os dados de ${props.dadosDe}` : ''}`)

const CONFIANCA: Record<Aviso['confianca'], string> = { certeza: 'Conta fechada', estimativa: 'Estimativa', incompleto: 'Falta um dado' }

/* ————— o modal ————— */
const aberto = ref(false)
const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, aberto)
const idTitulo = useId()
const provaAberta = ref<string | null>(null)
function abrir(id?: string | null) {
  aberto.value = true
  provaAberta.value = id ?? null
  if (!props.mock) void canais.carregar()
  if (id) nextTick(() => document.getElementById(`cav-${id}`)?.scrollIntoView({ block: 'nearest' }))
}
function fechar() { aberto.value = false }
defineExpose({ abrir })
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') fechar() }
watch(aberto, (o) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) {
    document.addEventListener('keydown', onKey)
    nextTick(() => cardRef.value?.focus())
  } else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

function alternarProva(id: string) { provaAberta.value = provaAberta.value === id ? null : id }

/* ————— "Já sei" e "desfazer", gravados ————— */
const { gravar } = useAvisoEstado()
// a linha de erro sai onde o aviso está agora: no próprio item (voltou para a lista) ou junto do "Você já sabia"
const erroEstado = ref<{ id: string; texto: string } | null>(null)
const erroNaLista = computed(() => !!erroEstado.value && !resolvidos.value.has(erroEstado.value.id))
// a última troca de cada aviso: se a pessoa mudou de novo, a falha da anterior não desfaz a atual
const versao = new Map<string, number>()
function aplicar(id: string, resolvido: boolean) {
  const s = new Set(resolvidos.value)
  if (resolvido) s.add(id)
  else s.delete(id)
  resolvidos.value = s
}
async function marcar(id: string, resolvido: boolean) {
  const v = (versao.get(id) ?? 0) + 1
  versao.set(id, v)
  aplicar(id, resolvido)
  erroEstado.value = null
  if (props.mock) return
  try {
    await gravar(id, resolvido ? 'resolvido' : 'visto')
  } catch {
    if (versao.get(id) !== v) return
    aplicar(id, !resolvido)
    erroEstado.value = { id, texto: resolvido ? 'Não consegui guardar o “Já sei”. O aviso voltou para a lista.' : 'Não consegui desfazer agora. Tente de novo.' }
  }
}
const resolver = (id: string) => marcar(id, true)
const desfazer = (id: string) => marcar(id, false)

/* ————— por onde receber: um tópico por detector ————— */
const canais = usePreferenciasDaCarteira()
const topicos = computed(() => topicosDosAvisos(props.avisos.itens))
const canaisProntos = computed(() => props.mock || canais.estado.value === 'pronto')
const canaisFalharam = computed(() => !props.mock && canais.estado.value === 'erro')
const soAqui = (t: TopicoCarteira) => !canais.prefs.value[t].email && !canais.prefs.value[t].whatsapp
function alternarCanal(t: TopicoCarteira, canal: 'email' | 'whatsapp') {
  const atual = canais.prefs.value[t]
  void canais.salvar(t, { ...atual, [canal]: !atual[canal] }, { local: props.mock })
}
function ficarAqui(t: TopicoCarteira) {
  void canais.salvar(t, { email: false, whatsapp: false }, { local: props.mock })
}

/* ————— as ações ————— */
const painel = useChatPainel()
const lente = useState<string>('carteira:lente', () => 'ativos')
function contextoDe(a: Aviso) {
  return {
    id: `carteira:aviso:${a.id}`, tipo: 'carteira', rotulo: a.titulo,
    texto: [a.titulo, semValor(a.texto), a.ressalva ?? '', ...a.prova.map((p) => `${p.rotulo}: ${semValor(p.valor)}`), `Fonte: ${a.fonte}`].filter(Boolean).join('\n'),
  }
}
function agir(a: Aviso, acao: AcaoAviso) {
  fechar()
  if (acao.tipo === 'ver') {
    if (acao.alvo.startsWith('lente:')) {
      lente.value = acao.alvo.slice(6)
      nextTick(() => document.getElementById('onde')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else if (acao.alvo.startsWith('#')) {
      void navigateTo({ hash: acao.alvo })
      nextTick(() => document.getElementById(acao.alvo.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else void navigateTo(acao.alvo)
    return
  }
  painel.anexar(contextoDe(a))
  painel.preencher(semValor(acao.alvo))
}
</script>

<template>
  <TopoBotao
    v-if="!semBotao"
    rotulo="Avisos" :aria-label="pontos ? `Avisos da carteira: ${pontos} pedem atenção` : 'Avisos da carteira'" :title="pontos ? `${pontos} pedem atenção` : 'Avisos da carteira'"
    aria-haspopup="dialog" :aria-expanded="aberto" class="cav__b" @click="abrir()"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    <span v-if="pontos" class="cav__selo">{{ pontos }}</span>
  </TopoBotao>

  <Teleport to="body">
    <div v-if="aberto" class="cav" @click="fechar">
      <div ref="cardRef" class="cav__card" role="dialog" aria-modal="true" :aria-labelledby="idTitulo" tabindex="-1" data-clarity-mask="true" @click.stop>
        <span class="cav__alca" aria-hidden="true" />
        <div class="cav__cab">
          <p class="cav__assinatura">
            <span class="cav__marca"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia</span>
            <span class="cav__olhou">{{ olhou }}</span>
          </p>
          <button type="button" class="cav__fechar" aria-label="Fechar" @click="fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <h2 :id="idTitulo" class="cav__h2">{{ titulo }}</h2>
        <p v-if="avisos.retidos" class="cav__retidos">
          Outros {{ avisos.retidos }} avisos esperam a conexão voltar. Com dado de {{ dadosDe }}, eu prefiro não arriscar.
        </p>

        <template v-for="g in ([['Pede atenção', grupos.atencao], ['Bom saber', grupos.saber]] as const)" :key="g[0]">
          <div v-if="g[1].length" class="cav__grupo">
            <p class="cav__grupo-t">{{ g[0] }}</p>
            <ul class="cav__lista">
              <li v-for="a in g[1]" :id="`cav-${a.id}`" :key="a.id" class="cav__item" :class="`cav__item--${a.gravidade}`">
                <div class="cav__linha">
                  <p class="cav__t">{{ a.titulo }}</p>
                  <p v-if="a.emJogo" class="cav__v">{{ semValor(a.emJogo) }}</p>
                </div>
                <p class="cav__x">{{ semValor(a.texto) }}</p>
                <p v-if="a.ressalva" class="cav__ressalva">{{ a.ressalva }}</p>
                <p class="cav__meta">
                  <span class="cav__conf" :class="`cav__conf--${a.confianca}`">{{ CONFIANCA[a.confianca] }}</span>
                  <span v-if="a.prazo">{{ a.prazo }}</span>
                  <button type="button" class="cav__como" :aria-expanded="provaAberta === a.id" @click="alternarProva(a.id)">
                    Como calculei
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </p>
                <div v-if="provaAberta === a.id" class="cav__prova">
                  <dl>
                    <div v-for="p in a.prova" :key="p.rotulo" class="cav__prova-l"><dt>{{ p.rotulo }}</dt><dd>{{ semValor(p.valor) }}</dd></div>
                  </dl>
                  <p class="cav__fonte">Fonte: {{ a.fonte }}</p>
                </div>
                <div class="cav__acoes">
                  <button
                    v-for="(ac, i) in a.acoes" :key="ac.rotulo" type="button" class="cav__acao" :class="{ 'cav__acao--1': i === 0 }"
                    @click="agir(a, ac)"
                  >{{ ac.rotulo }}</button>
                  <!-- a conexão não se "já sabe": ela sai quando volta a atualizar -->
                  <button v-if="!a.detector.startsWith('conexao')" type="button" class="cav__ja" @click="resolver(a.id)">Já sei</button>
                </div>
                <p v-if="erroEstado?.id === a.id" class="cav__erro cav__erro--item" role="status">{{ erroEstado.texto }}</p>
              </li>
            </ul>
          </div>
        </template>

        <p v-if="erroEstado && !erroNaLista" class="cav__erro" role="status">{{ erroEstado.texto }}</p>
        <p v-if="grupos.resolvidos.length" class="cav__resolvidos">
          <template v-for="(a, i) in grupos.resolvidos" :key="a.id">
            <span>{{ i ? ' · ' : 'Você já sabia: ' }}{{ a.curto.replace(/\.$/, '') }} </span>
            <button type="button" class="cav__desfazer" @click="desfazer(a.id)">desfazer</button>
          </template>
        </p>

        <details v-if="avisos.descartados.length" class="cav__dobra">
          <summary>
            <span class="cav__dobra-t">Considerei e não sugeri</span>
            <span class="cav__dobra-s">{{ avisos.descartados.length }} movimentos barrados</span>
          </summary>
          <ul class="cav__desc">
            <li v-for="d in avisos.descartados" :key="d.id">
              <p class="cav__desc-m">{{ d.movimento }}</p>
              <p class="cav__desc-v">{{ d.veto }}</p>
            </li>
          </ul>
        </details>

        <details class="cav__dobra" :open="!grupos.atencao.length">
          <summary>
            <span class="cav__dobra-t">O que eu olhei</span>
            <span class="cav__dobra-s">{{ avisos.olhados.filter((o) => o.ok).length }} de {{ avisos.olhados.length }} sem nada a dizer</span>
          </summary>
          <ul class="cav__olhados">
            <li v-for="o in avisos.olhados" :key="o.rotulo" :class="{ 'cav__olhado--nao': !o.ok }">
              <span class="cav__check" aria-hidden="true">
                <svg v-if="o.ok" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span v-else>!</span>
              </span>
              <span class="cav__olhado-r">{{ o.rotulo }}</span>
              <span class="cav__olhado-v">{{ semValor(o.resultado) }}</span>
            </li>
          </ul>
        </details>

        <div v-if="topicos.length" class="cav__canais">
          <p class="cav__canais-t">Receber estes avisos por</p>
          <p v-if="canaisFalharam" class="cav__erro">Não consegui ler por onde você recebe agora. Tente de novo mais tarde.</p>
          <ul v-else class="cav__canais-l">
            <li v-for="t in topicos" :key="t.id" class="cav__canal">
              <span class="cav__canal-n">{{ t.nome }}</span>
              <span v-if="!canaisProntos" class="cav__canal-op" aria-hidden="true"><NuSkeleton width="232px" height="38px" radius="pill" /></span>
              <span v-else class="cav__canal-op" role="group" :aria-label="`${t.nome}: por onde receber`">
                <button type="button" class="cav__op" :aria-pressed="canais.prefs.value[t.id].whatsapp" :disabled="!canais.optIn.value" @click="alternarCanal(t.id, 'whatsapp')">WhatsApp</button>
                <button type="button" class="cav__op" :aria-pressed="canais.prefs.value[t.id].email" @click="alternarCanal(t.id, 'email')">E-mail</button>
                <button type="button" class="cav__op" :aria-pressed="soAqui(t.id)" @click="ficarAqui(t.id)">Só aqui</button>
              </span>
              <p v-if="canais.erro.value?.topico === t.id" class="cav__erro cav__erro--canal" role="status">{{ canais.erro.value.texto }}</p>
            </li>
          </ul>
          <p v-if="canaisProntos && !canais.optIn.value" class="cav__canais-dica">O WhatsApp fica desligado até você aceitar receber a Redentia por lá.</p>
        </div>

        <p class="cav__pe">São fatos e simulações sobre a sua carteira, não recomendação de compra ou venda. Quem decide é você.</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ——— o botão do topo ——— */
.cav__b :deep(.tac__c) { position: relative; }
.cav__selo {
  position: absolute; top: -3px; right: -5px; display: grid; place-items: center; min-width: 19px; height: 19px; padding: 0 5px;
  border-radius: var(--nu-r-pill); background: var(--nu-amber-fill); color: var(--nu-navy);
  font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1;
  box-shadow: 0 0 0 2px var(--nu-navy);
}

/* ——— o modal: o mesmo painel de CarteiraIdeias ——— */
.cav {
  position: fixed; inset: 0; z-index: 9999; background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 32px; animation: cavfade .18s ease;
}
.cav__card {
  position: relative; isolation: isolate; width: min(720px, 92vw); max-height: 86vh; overflow: auto; box-sizing: border-box; overscroll-behavior: contain;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg); padding: 32px 40px 28px; box-shadow: var(--nu-shadow-day-modal);
  animation: cavrise .24s cubic-bezier(.2, .8, .2, 1);
}
.cav__card:focus { outline: none; }
.cav__alca { display: none; }
.cav__cab { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.cav__assinatura { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; margin: 0; min-width: 0; }
.cav__marca { display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 9px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.cav__olhou { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.cav__fechar { flex: 0 0 auto; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--nu-day-close); color: var(--nu-ink); cursor: pointer; transition: background .2s; }
.cav__fechar:hover { background: var(--nu-day-close-hover); }
.cav__fechar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cav__h2 { margin: 20px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; text-wrap: pretty; }
.cav__retidos { margin: 10px 0 0; color: var(--nu-amber-text); font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.5; }

.cav__grupo { margin-top: 22px; }
.cav__grupo-t { margin: 0 0 4px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.cav__lista { list-style: none; margin: 0; padding: 0; }
.cav__item { position: relative; padding: 16px 0 12px; border-top: 1px solid var(--nu-cream-line); scroll-margin: 24px; }
.cav__item::before { content: ''; position: absolute; inset: 0 -14px; z-index: -1; border-radius: 12px; background: var(--nu-ink-04); opacity: 0; transition: opacity .2s ease; }
.cav__item:hover::before, .cav__item:focus-within::before { opacity: 1; }
.cav__linha { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.cav__t { display: flex; align-items: baseline; gap: 10px; margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; line-height: 1.35; }
.cav__t::before { content: ''; flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--nu-gray); transform: translateY(-2px); }
.cav__item--alta .cav__t::before { background: var(--nu-red-text); }
.cav__item--media .cav__t::before { background: var(--nu-amber); }
.cav__item--info .cav__t::before { background: var(--nu-blue); }
.cav__item--bom .cav__t::before { background: var(--nu-green); }
.cav__v { flex-shrink: 0; margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cav__x { margin: 6px 0 0 18px; max-width: 64ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
.cav__ressalva { margin: 8px 0 0 18px; max-width: 64ch; padding-left: 12px; border-left: 2px solid var(--nu-amber); color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5; }
.cav__meta { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px; margin: 10px 0 0 18px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.cav__conf { display: inline-flex; align-items: center; gap: 6px; }
.cav__conf::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--nu-green); }
.cav__conf--estimativa::before { background: var(--nu-blue); }
.cav__conf--incompleto::before { background: var(--nu-amber); }
.cav__como { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-weight: 700; }
.cav__como[aria-expanded='true'] svg { transform: rotate(180deg); }
.cav__como svg { transition: transform .2s; }
.cav__como:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.cav__prova { margin: 10px 0 0 18px; padding: 12px 14px; border-radius: 12px; background: var(--nu-cream); animation: cavfade .2s ease; }
.cav__prova dl { margin: 0; }
.cav__prova-l { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; border-top: 1px solid var(--nu-cream-line); font-size: var(--nu-fs-sm); }
.cav__prova-l:first-child { border-top: 0; }
.cav__prova-l dt { color: var(--nu-gray-3); font-weight: 500; }
.cav__prova-l dd { margin: 0; color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; }
.cav__fonte { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.cav__acoes { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 12px 0 0 18px; }
.cav__acao {
  height: 34px; padding: 0 14px; border-radius: var(--nu-r-pill); border: 1px solid var(--nu-cream-line); background: var(--nu-white);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; transition: background .2s, border-color .2s;
}
.cav__acao:hover { background: var(--nu-cream); }
.cav__acao--1 { background: var(--nu-ink); border-color: var(--nu-ink); color: var(--nu-white); }
.cav__acao--1:hover { background: var(--nu-navy); }
.cav__acao:focus-visible, .cav__ja:focus-visible, .cav__desfazer:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cav__ja { margin-left: auto; padding: 6px 4px; border: 0; background: none; color: var(--nu-gray); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; }
.cav__ja:hover { color: var(--nu-ink); }
.cav__resolvidos { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
.cav__desfazer { padding: 0; border: 0; background: none; color: var(--nu-blue-text); font: inherit; font-weight: 700; cursor: pointer; }

.cav__dobra { margin-top: 18px; border-top: 1px solid var(--nu-day-divider); }
.cav__dobra summary { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 16px 0 4px; cursor: pointer; list-style: none; }
.cav__dobra summary::-webkit-details-marker { display: none; }
.cav__dobra summary:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.cav__dobra-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.cav__dobra-t::after { content: ' ›'; color: var(--nu-gray); display: inline-block; transition: transform .2s; }
.cav__dobra[open] .cav__dobra-t::after { transform: rotate(90deg); }
.cav__dobra-s { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.cav__desc { list-style: none; margin: 4px 0 0; padding: 0; }
.cav__desc li { padding: 10px 0; border-top: 1px solid var(--nu-cream-line); }
.cav__desc li:first-child { border-top: 0; }
.cav__desc-m { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 700; text-decoration: line-through; text-decoration-color: var(--nu-gray-2); text-decoration-thickness: 1px; }
.cav__desc-v { margin: 4px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.cav__olhados { list-style: none; margin: 6px 0 0; padding: 0; }
.cav__olhados li { display: grid; grid-template-columns: 20px minmax(110px, 200px) minmax(0, 1fr); align-items: baseline; gap: 10px; padding: 7px 0; font-size: var(--nu-fs-sm); }
.cav__check { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--nu-green-bg, var(--nu-cream)); color: var(--nu-green-text, var(--nu-green)); transform: translateY(3px); font-weight: 800; font-size: 11px; }
.cav__olhado--nao .cav__check { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cav__olhado-r { color: var(--nu-ink); font-weight: 700; }
.cav__olhado-v { color: var(--nu-gray-3); font-weight: 500; font-variant-numeric: tabular-nums; }
.cav__erro { margin: 12px 0 0; color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5; }
.cav__erro--item { margin: 8px 0 0 18px; }
.cav__erro--canal { flex-basis: 100%; margin: 0; }

/* ——— por onde receber: o segmentado claro das lentes, com mais de uma escolha ——— */
.cav__canais { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--nu-day-divider); }
.cav__canais-t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.cav__canais-l { list-style: none; margin: 6px 0 0; padding: 0; }
.cav__canal { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; padding: 8px 0; }
.cav__canal + .cav__canal { border-top: 1px solid var(--nu-cream-line); }
.cav__canal-n { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; }
.cav__canal-op { display: inline-flex; padding: 3px; border-radius: var(--nu-r-pill); background: var(--nu-cream); }
.cav__op {
  height: 32px; padding: 0 14px; border: 0; border-radius: var(--nu-r-pill); background: transparent; white-space: nowrap;
  color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; transition: background .2s, color .2s, box-shadow .2s;
}
.cav__op:hover:not(:disabled) { color: var(--nu-ink); }
.cav__op[aria-pressed='true'] { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 1px 3px var(--nu-ink-14); }
.cav__op:disabled { color: var(--nu-gray); opacity: .55; cursor: not-allowed; }
.cav__op:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cav__canais-dica { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }

.cav__pe { margin: 22px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-day-divider); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }

@keyframes cavfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cavrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes cavsobe { from { transform: translateY(100%); } to { transform: none; } }
@media (max-width: 640px) {
  .cav { padding: 0; align-items: flex-end; }
  .cav__card { width: 100%; max-height: 90vh; max-height: 90dvh; border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; padding: 12px 20px calc(20px + env(safe-area-inset-bottom)); animation: cavsobe .32s cubic-bezier(.2, .8, .2, 1); }
  .cav__alca { display: block; width: 40px; height: 4px; margin: 0 auto 14px; border-radius: 2px; background: var(--nu-cream-line); }
  .cav__h2 { margin-top: 16px; font-size: var(--nu-fs-2xl); }
  .cav__linha { flex-direction: column; gap: 2px; }
  .cav__v { margin-left: 18px; font-size: var(--nu-fs-md); }
  .cav__olhados li { grid-template-columns: 20px minmax(0, 1fr); }
  .cav__olhado-v { grid-column: 2; }
  .cav__canal { flex-direction: column; align-items: stretch; }
  .cav__canal-op { align-self: stretch; }
  .cav__op { flex: 1; padding: 0 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .cav, .cav__card, .cav__prova { animation: none; }
  .cav__op { transition: none; }
}
</style>
