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
//
// 07/11, com a resposta real: o backend diz o estado de cada aviso
// (`Aviso.estado`). O que chegou desde a última vez leva o selo "Novo"; abrir
// os avisos grava `visto` (o mesmo PATCH), e o selo fica até a página
// recarregar. O título e o texto não quebram a linha entre o R$ e o número, e
// o título também esconde o R$ com o olho fechado.
//
// 08/11/2026, as notas: a ideia que traz `notas` (o antes → depois das 4 notas
// do relatório) ganha uma faixa logo abaixo do texto, uma célula por pilar: o
// nome, os números, a barra do relatório com o ganho num azul mais claro e o
// +N. É a resposta, de relance, ao "pequenas mudanças que melhorariam todos os
// índices" do dono. Nota não é R$: não passa pelo olho. O "Ver o relatório"
// só troca o hash, e o VisaoRelatorio abre sozinho.
//
// Embaixo da faixa (08/11, o "só 1 número?" do dono quando só uma nota subia):
// uma linha com os indicadores do relatório que mudam ("Sharpe −0,05 → −0,01 ·
// Volatilidade 10,6% → 10,5%"), com a seta e o depois em verde quando melhora e
// em vermelho quando piora. Na linha, até 8 e no máximo 2 linhas no desktop; o
// resto vai para o "Como calculei", atrás do "e mais N".
import type { AcaoAviso, Aviso, AvisosVisao } from '~/types/carteiraVisao'
import { gruposDeAvisos, quandoAtualizou, semQuebraNoReal, textoDosRetidos, tituloDosAvisos } from '~/utils/carteiraVisao'
import { topicosDosAvisos, type TopicoCarteira } from '~/utils/avisosCanais'
import { celulasDasNotas, indicadoresQueMudam, linhasDosAjustes, quantosNaLinha, type CelulaDaNota } from '~/utils/notasDoAviso'
import TopoBotao from '~/components/ativo/topo/TopoBotao.vue'
import FraseDestaque from './FraseDestaque.vue'

// semBotao (06/11): sem o botão redondo; o modal abre pelos próprios itens e pelo "+N".
// botaoOculto (07/11): o botão existe, mas fica invisível e fora do Tab. É o topo
// recolhido da tela nova, que tem o "+N"; aberto, o "+N" some e o sino volta. Guardar
// o lugar evita que o olho ao lado pule na abertura
const props = defineProps<{ avisos: AvisosVisao; ativos: number; dadosDe: string | null; semBotao?: boolean; botaoOculto?: boolean; mock?: boolean }>()

const { hidden } = useHiddenValues()
const semValor = (t: string) => (hidden.value ? t.replace(/R\$\s?[\d.,]+( mil)?/g, 'R$ ••••') : t)
/** o texto na tela: sem o R$ com o olho fechado, e sem quebrar 'R$ 6.645' em duas linhas */
const naTela = (t: string) => semQuebraNoReal(semValor(t))

const resolvidos = ref<Set<string>>(new Set())
const grupos = computed(() => gruposDeAvisos(props.avisos, resolvidos.value))
const titulo = computed(() => tituloDosAvisos(grupos.value.atencao.length, grupos.value.saber.length))
const pontos = computed(() => grupos.value.atencao.length)
// com fonte velha, a assinatura diz de quando é o dado, não só de quando olhou
const olhou = computed(() => `Olhei ${props.ativos} ativos ${quandoAtualizou(props.avisos.olhouEm)}${props.dadosDe ? `, com os dados de ${props.dadosDe}` : ''}`)

const CONFIANCA: Record<Aviso['confianca'], string> = { certeza: 'Conta fechada', estimativa: 'Estimativa', incompleto: 'Falta um dado' }

/* ————— as notas da ideia (08/11): uma vez por resposta, e não passam pelo olho ————— */
const notasPorAviso = computed(() => new Map(props.avisos.itens.map((a) => [a.id, celulasDasNotas(a.notas)])))
const notasDe = (a: Aviso) => notasPorAviso.value.get(a.id) ?? []
/** a faixa que muda na barra: 2 px depois do trecho cheio, e larga o bastante para um +1 aparecer */
const faixa = (n: CelulaDaNota) => ({ left: `calc(${n.base}% + 2px)`, width: `max(4px, calc(${n.topo - n.base}% - 2px))` })
// os indicadores que mudam: na linha, até 8 e no máximo 2 linhas no desktop (quantosNaLinha); o resto, no "Como calculei"
const indicadoresPorAviso = computed(() => new Map(props.avisos.itens.map((a) => {
  const todos = indicadoresQueMudam(a.indicadores)
  return [a.id, { todos, naLinha: quantosNaLinha(todos) }]
})))
const indicadoresDe = (a: Aviso) => indicadoresPorAviso.value.get(a.id)?.todos ?? []
/** a lista numerada dos ajustes (08/11), com dois ou mais */
const ajustesDe = (a: Aviso) => linhasDosAjustes(a.ajustes)
const naLinha = (a: Aviso) => indicadoresPorAviso.value.get(a.id)?.naLinha ?? 0

/* ————— o modal ————— */
const aberto = ref(false)
const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, aberto)
const idTitulo = useId()
/* O modal no jeito "uma coisa por vez" (10/11, o dono: "pense como a Nubank
   deixaria esse modal"). Com um aviso só, ele é a manchete e abre inteiro. Com
   vários, cada um é uma linha e só um fica aberto: o que a pessoa tocou no
   topo, ou o primeiro. A conta (a prova) aparece direto quando é curta (até 6
   linhas, um comprovante); a longa fica a um toque.
   Depois (10/11, o dono: "dá para tirar esses textos? para deixar menos
   complexidade"): a confiança, a fonte e a ressalva saem da frente e moram
   atrás do "Como calculei", junto da conta longa. Uma exceção: com um dado
   faltando ('incompleto'), a ressalva continua à vista, porque é ela que diz
   que a conta não fechou. */
const todos = computed<Aviso[]>(() => [...grupos.value.atencao, ...grupos.value.saber])
const unico = computed(() => todos.value.length === 1)
const expandido = ref<string | null>(null)
const estaAberto = (a: Aviso) => unico.value || expandido.value === a.id
function alternar(id: string) { expandido.value = expandido.value === id ? null : id }
const ROTULO: Record<Aviso['gravidade'], string> = { alta: 'Pede atenção', media: 'Vale olhar', info: 'Bom saber', bom: 'Boa notícia' }
const CONTA_CURTA = 6
const comoAberto = ref<Set<string>>(new Set())
const provaVisivel = (a: Aviso) => a.prova.length <= CONTA_CURTA || comoAberto.value.has(a.id)
/** o aviso retido aparece como algo a caminho, com o esqueleto e o que ele espera (textoDosRetidos) */
const retidosTxt = computed(() => textoDosRetidos(props.avisos.retidos, props.avisos.retidosPor, props.dadosDe))
function abrir(id?: string | null) {
  aberto.value = true
  expandido.value = id ?? todos.value[0]?.id ?? null
  marcarVistos()
  if (!props.mock) void canais.carregar()
  if (id) nextTick(() => document.getElementById(`cav-${id}`)?.scrollIntoView({ block: 'nearest' }))
}
function fechar() { aberto.value = false }
// `acionar` roda a primeira ação de um aviso sem abrir o modal: a pílula do cartão de atenção do topo
// (CarteiraHeroi) faz o mesmo que o botão azul daqui de dentro
defineExpose({ abrir, acionar: (id: string) => { const a = props.avisos.itens.find((x) => x.id === id); if (a?.acoes[0]) agir(a, a.acoes[0]) } })
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

function alternarProva(id: string) {
  const t = new Set(comoAberto.value)
  if (t.has(id)) t.delete(id)
  else t.add(id)
  comoAberto.value = t
}
/** o "e mais N" dos indicadores abre o "Como calculei", onde está o resto */
function abrirProva(id: string) {
  if (!comoAberto.value.has(id)) alternarProva(id)
}
/**
 * Linha da prova com valor de frase (o "Por que parei" dos ajustes, 08/11):
 * lado a lado, o rótulo era espremido em três linhas. Acima de 60
 * caracteres, o valor desce para baixo do rótulo.
 */
const provaLonga = (valor: string) => valor.length > 60

/* ————— "Já sei" e "desfazer", gravados ————— */
const { gravar } = useAvisoEstado()

/* ————— novo e visto ————— */
// o `visto` de cada aviso novo, gravado uma vez por página; o "Já sei" espera
// ele terminar, para o `resolvido` nunca chegar antes e ser desfeito por ele
const vistos = new Map<string, Promise<unknown>>()
function marcarVistos() {
  if (props.mock) return
  for (const a of props.avisos.itens) {
    if (a.estado !== 'novo' || vistos.has(a.id)) continue
    vistos.set(a.id, gravar(a.id, 'visto').catch(() => { vistos.delete(a.id) }))
  }
}
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
    await vistos.get(id)
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
const route = useRoute()
// O aviso que vai junto da pergunta (Perguntar e Simular, 07/11/2026). O chip
// do campo é a parte que aparece na tela: segue o olho. O texto, só o modelo
// lê, e vai com os números: sem eles, "Simule trocar R$ 10 mil…" com o olho
// fechado chegava como "R$ ••••" e a simulação saía às cegas. O texto do site
// não leva ticker no movimento (o motor manda só a classe), e o id do aviso,
// que leva, não vai. As notas e os indicadores da ideia (08/11) vão como a
// pessoa os vê na faixa e na linha.
const MOTOR_CALCULOU = 'Os números abaixo foram calculados pelo motor de avisos da Aportou sobre a carteira desta pessoa (notas do relatório, imposto, cenários de 5 anos). '
  + 'Use-os como estão: não recalcule imposto, notas nem cenários. Se faltar um número, diga que ele não está disponível. Explique sem recomendar compra ou venda.'
function contextoDe(a: Aviso) {
  const notas = notasDe(a).map((n) => n.aria).join('; ')
  const indicadores = indicadoresDe(a).map((i) => i.aria).join('; ')
  return {
    id: `carteira:aviso:${a.id}`, tipo: 'carteira', rotulo: semValor(a.titulo),
    texto: [
      // 09/11 (a revisão do benchmark de IA): sem isto, o modelo lia os números como um
      // trecho qualquer e refazia a conta, e a reserva do chat erra IR. As contas são do motor.
      MOTOR_CALCULOU,
      a.titulo, a.texto, a.ressalva ?? '', ...a.prova.map((p) => `${p.rotulo}: ${p.valor}`),
      notas ? `Notas do relatório, antes e depois: ${notas}` : '',
      indicadores ? `Indicadores do relatório que mudam: ${indicadores}` : '', `Fonte: ${a.fonte}`,
    ].filter(Boolean).join('\n'),
  }
}
function agir(a: Aviso, acao: AcaoAviso) {
  fechar()
  if (acao.tipo === 'ver') {
    if (acao.alvo.startsWith('lente:')) {
      lente.value = acao.alvo.slice(6)
      nextTick(() => document.getElementById('onde')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else if (acao.alvo.startsWith('#')) {
      // com a query de agora: o hash sozinho tirava o ?cenario= do dev (e qualquer outra) da página.
      // O VisaoRelatorio abre sozinho com o hash dele (#relatorio, #movimentacoes…)
      void navigateTo({ query: route.query, hash: acao.alvo })
      nextTick(() => document.getElementById(acao.alvo.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else if (/^https?:\/\//i.test(acao.alvo)) {
      // a notícia do fato relevante é de outro site: o navigateTo recusa URL de fora sem external
      void navigateTo(acao.alvo, { external: true, open: { target: '_blank' } })
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
    aria-haspopup="dialog" :aria-expanded="aberto" class="cav__b" :class="{ 'cav__b--oculto': botaoOculto }"
    :aria-hidden="botaoOculto || undefined" :tabindex="botaoOculto ? -1 : undefined" @click="abrir()"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    <span v-if="pontos" class="cav__selo">{{ pontos }}</span>
  </TopoBotao>

  <Teleport to="body">
    <div v-if="aberto" class="cav" @click="fechar">
      <div ref="cardRef" class="cav__card" role="dialog" aria-modal="true" :aria-labelledby="idTitulo" tabindex="-1" data-clarity-mask="true" @click.stop>
        <span class="cav__alca" aria-hidden="true" />
        <div class="cav__cab">
          <p class="cav__olhou">{{ olhou }}</p>
          <button type="button" class="cav__fechar" aria-label="Fechar" @click="fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <!-- com um aviso só, a manchete é ele (lá embaixo); com vários ou nenhum, o resumo -->
        <h2 v-if="!unico" :id="idTitulo" class="cav__h2">{{ titulo }}</h2>

        <ul v-if="todos.length" class="cav__lista" :class="{ 'cav__lista--unico': unico }">
          <li v-for="a in todos" :id="`cav-${a.id}`" :key="a.id" class="cav__item" :class="[`cav__item--${a.gravidade}`, { 'cav__item--aberto': estaAberto(a) }]">
            <p class="cav__tipo">
              <i aria-hidden="true" />{{ ROTULO[a.gravidade] }}
              <span v-if="a.estado === 'novo'" class="cav__novo">Novo</span>
              <span v-if="a.prazo" class="cav__prazo">{{ a.prazo }}</span>
            </p>
            <h2 v-if="unico" :id="idTitulo" class="cav__h2 cav__h2--aviso"><FraseDestaque :texto="naTela(a.titulo)" /></h2>
            <button v-else type="button" class="cav__linha" :aria-expanded="estaAberto(a)" @click="alternar(a.id)">
              <span class="cav__t"><FraseDestaque :texto="naTela(a.titulo)" /></span>
              <span v-if="a.emJogo" class="cav__v">{{ semValor(a.emJogo) }}</span>
              <svg class="cav__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            <div v-if="estaAberto(a)" class="cav__det">
                  <!-- 08/11: os ajustes do plano, numerados ("não deixa claro os ajustes"); o valor passa pelo olho -->
                  <ol v-if="ajustesDe(a).length" class="cav__ajustes" :aria-label="`Os ${ajustesDe(a).length} ajustes`">
                    <li v-for="(j, k) in ajustesDe(a)" :key="k" class="cav__aj">
                      <span class="cav__aj-n" aria-hidden="true">{{ k + 1 }}</span>
                      <span v-if="j.valor" class="cav__aj-t"><span class="cav__aj-v">{{ semValor(j.valor) }}</span><span class="cav__aj-d">{{ j.de }}<span class="cav__aj-seta" aria-hidden="true"> → </span><span class="cav__sr"> por </span>{{ j.para }}</span></span>
                      <span v-else class="cav__aj-t">{{ naTela(j.texto) }}</span>
                    </li>
                  </ol>
              <p class="cav__x">{{ naTela(a.texto) }}</p>
                  <!-- 08/11: o placar da ideia, as notas e os indicadores que mudam; tudo se lê pelo aria-label e nada passa pelo olho -->
                  <div v-if="notasDe(a).length || indicadoresDe(a).length" class="cav__placar">
                    <div v-if="notasDe(a).length" class="cav__notas" role="group" aria-label="As notas do relatório, antes e depois">
                      <div v-for="n in notasDe(a)" :key="n.pilar" class="cav__nota" role="img" :aria-label="n.aria">
                        <span class="cav__nota-n">{{ n.nome }}</span>
                        <span class="cav__nota-v">
                          <template v-if="n.igual"><b>{{ n.depois }}</b><span class="cav__nota-igual">igual</span></template>
                          <template v-else>
                            <span class="cav__nota-a">{{ n.antes ?? '—' }}</span><span class="cav__nota-seta">→</span><b>{{ n.depois ?? '—' }}</b>
                            <span v-if="n.deltaTxt" class="cav__nota-d" :class="{ 'cav__nota-d--cai': !n.sobe }">{{ n.deltaTxt }}</span>
                          </template>
                        </span>
                        <span class="cav__nota-b">
                          <i :style="{ width: `${n.base}%` }" />
                          <i v-if="n.topo > n.base" class="cav__nota-f" :class="{ 'cav__nota-f--cai': !n.sobe }" :style="faixa(n)" />
                        </span>
                      </div>
                    </div>
                    <div v-if="indicadoresDe(a).length" class="cav__inds" role="group" aria-label="Os indicadores do relatório que mudam">
                      <span v-for="i in indicadoresDe(a).slice(0, naLinha(a))" :key="i.chave" class="cav__ind" role="img" :aria-label="i.aria">
                        <span class="cav__ind-n">{{ i.nome }}</span> {{ i.antes }} <span class="cav__ind-d" :class="i.melhora ? 'cav__ind-d--melhora' : 'cav__ind-d--piora'">→ {{ i.depois }}</span>
                      </span>
                      <button
                        v-if="indicadoresDe(a).length > naLinha(a)" type="button" class="cav__ind-mais"
                        :aria-label="`Mais ${indicadoresDe(a).length - naLinha(a)} indicadores, no Como calculei`" @click="abrirProva(a.id)"
                      >e mais {{ indicadoresDe(a).length - naLinha(a) }}</button>
                    </div>
                  </div>

              <!-- a conta, como um comprovante: curta, aparece; longa, fica a um toque -->
              <div v-if="provaVisivel(a)" class="cav__prova">
                      <dl>
                        <div v-for="p in a.prova" :key="p.rotulo" class="cav__prova-l" :class="{ 'cav__prova-l--frase': provaLonga(p.valor) }"><dt>{{ p.rotulo }}</dt><dd>{{ semValor(p.valor) }}</dd></div>
                        <!-- os indicadores que não couberam na linha do placar -->
                        <div v-for="i in indicadoresDe(a).slice(naLinha(a))" :key="i.chave" class="cav__prova-l">
                          <dt>{{ i.nome }}</dt>
                          <dd><span role="img" :aria-label="i.aria">{{ i.antes }} <span class="cav__ind-d" :class="i.melhora ? 'cav__ind-d--melhora' : 'cav__ind-d--piora'">→ {{ i.depois }}</span></span></dd>
                        </div>
                      </dl>
              </div>
              <!-- com um dado faltando, a ressalva fica à vista: é ela que diz que a conta não fechou -->
              <p v-if="a.ressalva && a.confianca === 'incompleto'" class="cav__ressalva">{{ a.ressalva }}</p>
              <button type="button" class="cav__como" :aria-expanded="comoAberto.has(a.id)" @click="alternarProva(a.id)">
                Como calculei
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div v-if="comoAberto.has(a.id)" class="cav__notas-conta">
                <p class="cav__conf" :class="`cav__conf--${a.confianca}`">{{ CONFIANCA[a.confianca] }}</p>
                <p v-if="a.ressalva && a.confianca !== 'incompleto'">{{ a.ressalva }}</p>
                <p>Fonte: {{ a.fonte }}</p>
              </div>

              <div class="cav__acoes">
                <button
                  v-for="(ac, i) in a.acoes" :key="ac.rotulo" type="button" class="cav__acao" :class="{ 'cav__acao--1': i === 0 }"
                  @click="agir(a, ac)"
                >{{ ac.rotulo }}</button>
                <!-- a conexão não se "já sabe": ela sai quando volta a atualizar -->
                <button v-if="!a.detector.startsWith('conexao')" type="button" class="cav__acao cav__ja" @click="resolver(a.id)">Já sei</button>
              </div>
            </div>
            <p v-if="erroEstado?.id === a.id" class="cav__erro cav__erro--item" role="status">{{ erroEstado.texto }}</p>
          </li>
        </ul>
        <!-- o aviso que ainda espera um dado: a caminho, em esqueleto (loading é sempre esqueleto) -->
        <div v-if="retidosTxt" class="cav__espera" role="status">
          <span class="cav__espera-esq" aria-hidden="true">
            <NuSkeleton width="min(340px, 70%)" height="22px" radius="chip" />
            <NuSkeleton width="min(480px, 92%)" height="14px" radius="chip" />
          </span>
          <p class="cav__retidos">{{ retidosTxt }}</p>
        </div>

        <p v-if="erroEstado && !erroNaLista" class="cav__erro" role="status">{{ erroEstado.texto }}</p>
        <p v-if="grupos.resolvidos.length" class="cav__resolvidos">
          <template v-for="(a, i) in grupos.resolvidos" :key="a.id">
            <span>{{ i ? ' · ' : 'Você já sabia: ' }}{{ naTela(a.curto.replace(/\.$/, '')) }} </span>
            <button type="button" class="cav__desfazer" @click="desfazer(a.id)">desfazer</button>
          </template>
        </p>

        <details v-if="avisos.descartados.length" class="cav__dobra">
          <summary>
            <span class="cav__dobra-t">Considerei e não sugeri</span>
            <span class="cav__dobra-s">{{ avisos.descartados.length }} movimentos barrados</span>
            <svg class="cav__dobra-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <ul class="cav__desc">
            <li v-for="d in avisos.descartados" :key="d.id">
              <p class="cav__desc-m">{{ d.movimento }}</p>
              <p class="cav__desc-v">{{ d.veto }}</p>
            </li>
          </ul>
        </details>

        <details class="cav__dobra">
          <summary>
            <span class="cav__dobra-t">O que eu olhei</span>
            <span class="cav__dobra-s">{{ avisos.olhados.filter((o) => o.ok).length }} de {{ avisos.olhados.length }} sem nada a dizer</span>
            <svg class="cav__dobra-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
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
          <p v-if="canaisProntos && !canais.optIn.value" class="cav__canais-dica">O WhatsApp fica desligado até você aceitar receber a Aportou por lá.</p>
        </div>

        <p class="cav__pe">São fatos e simulações sobre a sua carteira, não recomendação de compra ou venda. Quem decide é você.</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ——— o botão do topo ——— */
.cav__b :deep(.tac__c) { position: relative; }
.cav__b--oculto { visibility: hidden; }
.cav__selo {
  position: absolute; top: -3px; right: -5px; display: grid; place-items: center; min-width: 19px; height: 19px; padding: 0 5px;
  border-radius: var(--nu-r-pill); background: var(--nu-amber-fill); color: var(--nu-ink);
  font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1;
  box-shadow: 0 0 0 2px var(--nu-ink);
}

/* ——— o modal: o mesmo painel de CarteiraIdeias. Na Aportou (11/11): creme da página,
   o fundo surge (nu-surgir) e o cartão sobe (nu-subir); a folha do celular sobe de baixo ——— */
.cav {
  position: fixed; inset: 0; z-index: 9999; background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 32px; animation: nu-surgir .2s ease both;
}
.cav__card {
  position: relative; isolation: isolate; width: min(720px, 92vw); max-height: 86vh; overflow: auto; box-sizing: border-box; overscroll-behavior: contain;
  background: var(--nu-page); border-radius: var(--nu-r-card-lg); padding: 32px 40px 28px; box-shadow: var(--nu-shadow-day-modal);
  animation: nu-subir .32s cubic-bezier(.2, .8, .2, 1) both;
}
.cav__card:focus { outline: none; }
.cav__alca { display: none; }
.cav__cab { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.cav__olhou { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.cav__fechar { flex: 0 0 auto; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: none; background: var(--nu-cream-2); color: var(--nu-ink); cursor: pointer; transition: background .2s, transform .2s; }
.cav__fechar:hover { background: var(--nu-line-2); transform: rotate(90deg); }
.cav__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.025em; line-height: 1.05; text-wrap: balance; font-variant-numeric: tabular-nums; }
.cav__h2--aviso { margin-top: 12px; font-size: var(--nu-fs-h2-sm); letter-spacing: -0.03em; line-height: 1.04; }
.cav__espera { padding: 18px 0 4px; border-top: 1.5px solid var(--nu-line); }
.cav__lista--unico + .cav__espera { margin-top: 22px; }
.cav__espera-esq { display: grid; gap: 8px; }
.cav__retidos { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }

.cav__lista { list-style: none; margin: 18px 0 0; padding: 0; }
.cav__lista--unico { margin-top: 14px; }
.cav__item { position: relative; padding: 18px 0 16px; border-top: 1.5px solid var(--nu-line); scroll-margin: 24px; }
.cav__lista--unico .cav__item { padding-top: 0; border-top: 0; }
.cav__tipo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-dense); font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
.cav__tipo i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-gray); }
.cav__item--alta .cav__tipo i { background: var(--nu-red-text); }
.cav__item--media .cav__tipo i { background: var(--nu-amber); }
.cav__item--info .cav__tipo i { background: var(--nu-blue); }
.cav__item--bom .cav__tipo i { background: var(--nu-green); }
.cav__prazo { color: var(--nu-gray); font-weight: 600; letter-spacing: 0; text-transform: none; }
.cav__linha { display: flex; align-items: baseline; gap: 16px; width: 100%; min-height: 44px; margin-top: 4px; padding: 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.cav__linha:focus-visible { outline-offset: 3px; border-radius: 6px; }
.cav__seta { flex-shrink: 0; align-self: center; color: var(--nu-gray); transition: transform .2s; }
.cav__linha[aria-expanded='true'] .cav__seta { transform: rotate(180deg); }
.cav__det { animation: nu-fade .25s ease both; }
.cav__t { flex: 1; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; font-variant-numeric: tabular-nums; }
.cav__v { flex-shrink: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cav__x { margin: 12px 0 0; max-width: 62ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
.cav__ajustes { list-style: none; margin: 14px 0 0; padding: 0; max-width: 64ch; display: grid; grid-template-columns: auto max-content minmax(0, 1fr); column-gap: 10px; row-gap: 6px; }
.cav__aj { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid; align-items: baseline; font-size: var(--nu-fs-md); line-height: 1.4; }
.cav__aj-n { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; transform: translateY(-1px); }
/* com troca, o valor e o de → para ocupam as duas colunas (subgrid); sem troca, a frase ocupa as duas */
.cav__aj-t { grid-column: 2 / -1; display: grid; grid-template-columns: subgrid; align-items: baseline; min-width: 0; color: var(--nu-ink); font-weight: 600; }
.cav__aj-t:not(:has(.cav__aj-v)) { display: block; }
.cav__aj-v { font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cav__aj-d { min-width: 0; color: var(--nu-ink); }
.cav__aj-seta { color: var(--nu-gray); }
.cav__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cav__ressalva { margin: 14px 0 0; max-width: 62ch; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }

/* ——— o placar da ideia (08/11): as notas, uma célula por pilar com a barra do relatório (.vrl__barra), e os indicadores que mudam ——— */
.cav__placar { display: flex; flex-direction: column; gap: 12px; margin: 14px 0 0; max-width: 64ch; font-size: var(--nu-fs-md); }
.cav__notas { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px 16px; }
.cav__nota { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.cav__nota-n { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.3; overflow-wrap: break-word; hyphens: auto; }
.cav__nota-v { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 5px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; line-height: 1.15; font-variant-numeric: tabular-nums; }
.cav__nota-v b { font-weight: 800; }
.cav__nota-a { color: var(--nu-gray-2); font-weight: 700; }
.cav__nota-seta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cav__nota-d, .cav__nota-igual { margin-left: 3px; font-size: var(--nu-fs-xs); }
.cav__nota-d { color: var(--nu-green-text); font-weight: 800; }
.cav__nota-d--cai { color: var(--nu-red-text); }
.cav__nota-igual { color: var(--nu-gray); font-weight: 700; }
.cav__nota-b { position: relative; display: block; height: 8px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); overflow: hidden; }
.cav__nota-b i { position: absolute; inset: 0 auto 0 0; border-radius: inherit; background: var(--nu-blue); }
/* o que muda: o mesmo azul, mais claro (o vermelho, se cair), 2 px depois do que já está */
.cav__nota-b .cav__nota-f { background: color-mix(in srgb, var(--nu-blue) 45%, var(--nu-white)); transform-origin: left; animation: cavnota .6s cubic-bezier(.22, 1, .36, 1) .3s both; }
.cav__nota-b .cav__nota-f--cai { background: color-mix(in srgb, var(--nu-red) 45%, var(--nu-white)); }
@keyframes cavnota { from { transform: scaleX(0); } }
/* os indicadores que mudam: a linha quebra entre eles, nunca no meio de um; a cor é só a do texto */
.cav__inds { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.cav__ind { white-space: nowrap; }
.cav__ind:not(:last-child)::after { content: '·'; margin-left: 8px; color: var(--nu-gray); }
.cav__ind-n { color: var(--nu-gray-3); font-weight: 700; }
.cav__ind-d { font-weight: 700; }
.cav__ind-d--melhora { color: var(--nu-green-text); }
.cav__ind-d--piora { color: var(--nu-red-text); }
.cav__ind-mais { padding: 0; border: 0; background: none; color: var(--nu-blue-text); font: inherit; font-weight: 700; white-space: nowrap; cursor: pointer; }
.cav__ind-mais:focus-visible { border-radius: 4px; }
.cav__novo { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; border-radius: var(--nu-r-tag); background: var(--nu-blue-bg); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0; text-transform: none; }
.cav__conf { display: flex; align-items: center; gap: 6px; font-weight: 700; }
.cav__conf::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--nu-green); }
.cav__conf--estimativa::before { background: var(--nu-blue); }
.cav__conf--incompleto::before { background: var(--nu-amber); }
.cav__como { display: inline-flex; align-items: center; gap: 4px; margin: 14px 0 0; padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; }
.cav__como:hover { color: var(--nu-ink); }
.cav__notas-conta { display: grid; gap: 6px; margin: 10px 0 0; max-width: 62ch; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; animation: cavfade .2s ease; }
.cav__notas-conta p { margin: 0; }
.cav__como[aria-expanded='true'] svg { transform: rotate(180deg); }
.cav__como svg { transition: transform .2s; }
.cav__como:focus-visible { border-radius: 4px; }
.cav__prova { margin: 18px 0 0; border-top: 1.5px solid var(--nu-line); border-bottom: 1.5px solid var(--nu-line); animation: cavfade .2s ease; }
.cav__prova dl { margin: 0; }
.cav__prova-l { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 12px 0; border-top: 1.5px solid var(--nu-line); font-size: var(--nu-fs-md); }
.cav__prova-l:first-child { border-top: 0; }
.cav__prova-l dt { color: var(--nu-gray-2); font-weight: 500; }
.cav__prova-l dd { margin: 0; color: var(--nu-ink); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
/* o valor curto não quebra ('R$ 387,91' partia em duas linhas no celular); o de frase quebra à vontade */
.cav__prova-l:not(.cav__prova-l--frase) dd { flex-shrink: 0; white-space: nowrap; }
/* a última linha da conta curta é o total: o número que a frase destacou */
.cav__prova-l:last-child:not(:first-child):not(.cav__prova-l--frase) dt { color: var(--nu-ink); font-weight: 700; }
.cav__prova-l:last-child:not(:first-child):not(.cav__prova-l--frase) dd { font-weight: 800; }
.cav__prova-l--frase { flex-direction: column; gap: 2px; }
.cav__prova-l--frase dd { text-align: left; font-weight: 600; }
.cav__acoes { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin: 22px 0 0; }
.cav__acao {
  height: 52px; padding: 0 26px; border-radius: var(--nu-r-pill); border: 0; background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.cav__acao:hover { background: var(--nu-row-hover); }
.cav__acao:active { transform: scale(.98); }
/* a ação principal é azul; o "Já sei" é discreto: só texto, sem contorno */
.cav__acao--1 { background: var(--nu-blue); color: var(--nu-white); box-shadow: none; }
.cav__acao--1:hover { background: var(--nu-blue-hover); }
.cav__ja { background: none; box-shadow: none; padding: 0 14px; color: var(--nu-gray); font-weight: 600; }
.cav__ja:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.cav__resolvidos { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
.cav__desfazer { padding: 0; border: 0; background: none; color: var(--nu-blue-text); font: inherit; font-weight: 700; cursor: pointer; }

.cav__dobra { margin-top: 18px; border-top: 1.5px solid var(--nu-line); }
.cav__dobra summary { display: flex; align-items: center; gap: 12px; padding: 16px 0; cursor: pointer; list-style: none; }
.cav__dobra summary::-webkit-details-marker { display: none; }
.cav__dobra summary:focus-visible { border-radius: 4px; }
.cav__dobra-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.cav__dobra-s { margin-left: auto; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; text-align: right; }
.cav__dobra-seta { flex-shrink: 0; color: var(--nu-gray); transition: transform .2s; }
.cav__dobra[open] .cav__dobra-seta { transform: rotate(180deg); }
.cav__desc { list-style: none; margin: 4px 0 0; padding: 0; }
.cav__desc li { padding: 10px 0; border-top: 1.5px solid var(--nu-line); }
.cav__desc li:first-child { border-top: 0; }
.cav__desc-m { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 700; text-decoration: line-through; text-decoration-color: var(--nu-gray-2); text-decoration-thickness: 1px; }
.cav__desc-v { margin: 4px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.cav__olhados { list-style: none; margin: 0 0 8px; padding: 0; }
.cav__olhados li { display: grid; grid-template-columns: 20px minmax(110px, 200px) minmax(0, 1fr); align-items: baseline; gap: 10px; padding: 7px 0; font-size: var(--nu-fs-sm); }
.cav__check { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--nu-green-bg, var(--nu-cream)); color: var(--nu-green-text, var(--nu-green)); transform: translateY(3px); font-weight: 800; font-size: 11px; }
.cav__olhado--nao .cav__check { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cav__olhado-r { color: var(--nu-ink); font-weight: 700; }
.cav__olhado-v { color: var(--nu-gray-3); font-weight: 500; font-variant-numeric: tabular-nums; }
.cav__erro { margin: 12px 0 0; color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5; }
.cav__erro--item { margin: 8px 0 0; }
.cav__erro--canal { flex-basis: 100%; margin: 0; }

/* ——— por onde receber: o segmentado claro das lentes, com mais de uma escolha ——— */
.cav__canais { margin-top: 18px; padding-top: 16px; border-top: 1.5px solid var(--nu-line); }
.cav__canais-t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.cav__canais-l { list-style: none; margin: 6px 0 0; padding: 0; }
.cav__canal { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; padding: 8px 0; }
.cav__canal + .cav__canal { border-top: 1.5px solid var(--nu-line); }
.cav__canal-n { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; }
.cav__canal-op { display: inline-flex; padding: 4px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); }
.cav__op {
  height: 40px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill); background: transparent; white-space: nowrap;
  color: var(--nu-gray-3); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; transition: background .2s, color .2s;
}
.cav__op:hover:not(:disabled) { color: var(--nu-ink); }
.cav__op[aria-pressed='true'] { background: var(--nu-ink); color: var(--nu-white); }
.cav__op:disabled { color: var(--nu-gray); opacity: .55; cursor: not-allowed; }
.cav__canais-dica { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }

.cav__pe { margin: 22px 0 0; padding-top: 16px; border-top: 1.5px solid var(--nu-line); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }

@keyframes cavfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cavsobe { from { transform: translateY(100%); } to { transform: none; } }
@media (max-width: 640px) {
  .cav { padding: 0; align-items: flex-end; }
  .cav__card { width: 100%; max-height: 90vh; max-height: 90dvh; border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; padding: 12px 20px calc(20px + env(safe-area-inset-bottom)); animation: cavsobe .32s cubic-bezier(.2, .8, .2, 1); }
  .cav__alca { display: block; width: 40px; height: 4px; margin: 0 auto 14px; border-radius: 2px; background: var(--nu-line); }
  .cav__h2 { margin-top: 16px; font-size: var(--nu-fs-2xl); }
  .cav__h2--aviso { font-size: var(--nu-fs-h3); }
  .cav__linha { flex-wrap: wrap; gap: 2px 12px; }
  .cav__t { flex-basis: calc(100% - 34px); font-size: var(--nu-fs-lg); }
  .cav__v { order: 3; flex-basis: 100%; }
  .cav__acoes { flex-direction: column; align-items: stretch; }
  .cav__dobra summary { flex-wrap: wrap; gap: 2px 12px; }
  .cav__dobra-t { flex: 1; }
  .cav__dobra-s { order: 3; flex-basis: 100%; margin-left: 0; text-align: left; }
  .cav__olhados li { grid-template-columns: 20px minmax(0, 1fr); }
  .cav__olhado-v { grid-column: 2; }
  .cav__canal { flex-direction: column; align-items: stretch; }
  .cav__canal-op { align-self: stretch; }
  .cav__op { flex: 1; padding: 0 8px; }
}
/* as notas em 2 × 2: em 4 colunas, cada célula ficaria estreita demais para "Diversificação" e "99 → 100 +1" */
@media (max-width: 520px) {
  .cav__notas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .cav, .cav__card, .cav__prova, .cav__det, .cav__nota-b .cav__nota-f { animation: none; }
  .cav__seta, .cav__dobra-seta { transition: none; }
  .cav__op { transition: none; }
}
</style>
