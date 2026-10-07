<script setup lang="ts">
/**
 * /cliente/convite/[token] — a porta do CLIENTE FINAL de um escritório, no
 * molde do Pluggy Connect (pesquisa em scratchpad pluggy-ref/NOTAS.md).
 *
 * O escritório (pelo painel ou pelo assistente, com create_client_invite)
 * gera um link de uso único. Quem abre é o cliente, e o que ele vê é o
 * widget de conexão: cartão central no desktop, tela cheia no mobile, com
 * os passos de uma conexão Open Finance —
 *
 *   intro → instituição → CPF → redirecionamento → aguardando → conectando → sucesso
 *
 * NÃO existe tela de consentimento separada: o aceite é a linha "Ao
 * continuar, você concorda com os Termos de compartilhamento" da primeira
 * tela, com o termo inteiro (C5 `terms_text`) numa folha. O servidor entra
 * uma vez só, no POST de consentimento (C6) disparado no passo "conectando",
 * com a instituição escolhida. O CPF nunca sai do navegador.
 *
 * O `mode` do C5 só escolhe o fluxo e nunca aparece na tela. 'demo' (só em
 * conta interna da Redentia; o servidor trava isso): o servidor gera a
 * carteira no consentimento e a espera pela autorização avança sozinha. O
 * widget não leva marca, logo nem nome do Pluggy. 'pluggy' (ainda não
 * implementado): o servidor responde 409 mode_unavailable, e a página mostra
 * o estado de conexão indisponível antes do fluxo, não depois do CPF.
 *
 * 100% CLIENT, de propósito: o token está na URL e o link de gestão é
 * segredo. O SSR renderiza só a casca com skeleton; o onMounted consulta o
 * backend. A rota é private/no-store, Referrer-Policy no-referrer e
 * noindex/nofollow no nuxt.config (/cliente/**); analytics não carrega aqui
 * (utils/analytics-privacy). Nada do convite entra em useState.
 *
 * Contrato: SPEC Contrato C, rotas C5 e C6.
 */
import type { ClientInviteInfo } from '~/types/clientes'

definePageMeta({ layout: false })

usePageSeo({
  title: 'Conectar ao seu escritório · Redentia',
  description: 'Escolha a instituição e autorize o seu escritório a acompanhar as suas posições de investimento.',
  path: '/cliente/convite',
  robots: 'noindex, nofollow',
})
useHead({
  titleTemplate: null,
  // Reforço do header Referrer-Policy (nuxt.config): o token está na URL e não
  // pode vazar para nenhum link externo que a pessoa clicar daqui.
  meta: [{ name: 'referrer', content: 'no-referrer' }],
})

const route = useRoute()
const { publicFetch } = useApi()

const token = computed(() => (typeof route.params.token === 'string' ? route.params.token : ''))

type Estado = 'carregando' | 'invalido' | 'fluxo' | 'cancelado'
const estado = ref<Estado>('carregando')
const motivo = ref<string>('not_found')
const info = ref<ClientInviteInfo | null>(null)
const termoAberto = ref(false)

/** Frase completa com saída, por motivo de recusa do servidor. */
const MOTIVOS: Record<string, { titulo: string, texto: string }> = {
  used: {
    titulo: 'Este convite já foi usado.',
    texto: 'Cada link vale uma vez. Se foi você quem conectou, use o link de gestão que apareceu na hora. Se não foi, avise o seu escritório.',
  },
  expired: {
    titulo: 'Este convite venceu.',
    texto: 'O link vale 7 dias. Peça um novo ao seu escritório, se ainda quiser conectar.',
  },
  revoked: {
    titulo: 'Este convite foi cancelado.',
    texto: 'O escritório cancelou o link. Se ainda faz sentido, peça um novo a quem te mandou.',
  },
  account_disabled: {
    titulo: 'O escritório não pode receber conexões agora.',
    texto: 'A conta do escritório na Redentia não está liberada para isso. Fale com quem te mandou o link.',
  },
  clients_disabled: {
    titulo: 'O escritório não pode receber conexões agora.',
    texto: 'A conexão de clientes não está habilitada na conta do escritório. Fale com quem te mandou o link.',
  },
  mode_unavailable: {
    titulo: 'A conexão com a sua instituição ainda não está disponível.',
    texto: 'Nada foi conectado e nenhuma posição sua foi lida. Avise o seu escritório para combinar o próximo passo.',
  },
  not_found: {
    titulo: 'Este link não abre.',
    texto: 'Confira se ele foi colado inteiro. Se veio do seu escritório, peça para mandar de novo.',
  },
  erro: {
    titulo: 'Não conseguimos abrir o convite agora.',
    texto: 'Tente de novo em instantes. Se seguir assim, escreva pra contato@redentia.com.',
  },
}

/** depois de "Concluir": "Tudo certo", ainda com o copiar do link de gestão */
const fim = ref(false)

function invalido(m: string) {
  motivo.value = MOTIVOS[m] ? m : 'erro'
  estado.value = 'invalido'
}

const conexao = useClienteConexao({ token, info, onRecusa: invalido })

// onMounted registrado ANTES de qualquer await (o await mora dentro dele).
onMounted(async () => {
  if (!CLIENT_TOKEN_RE.test(token.value)) return invalido('not_found')
  try {
    const r = await publicFetch<ClientInviteInfo>(`/business/client-invites/${token.value}`)
    info.value = r
    if (!r.valid) return invalido(r.reason ?? 'erro')
    // A conexão pelo Pluggy ainda não existe: melhor dizer agora do que deixar
    // a pessoa escolher o banco, digitar o CPF e levar o 409 no fim.
    if (r.mode === 'pluggy') return invalido('mode_unavailable')
    if (r.mode !== 'demo') return invalido('clients_disabled')
    estado.value = 'fluxo'
  }
  catch (e: unknown) {
    const st = (e as { response?: { status?: number } })?.response?.status
    invalido(st === 404 ? 'not_found' : 'erro')
  }
})

const escritorio = computed(() => info.value?.office?.name ?? null)
const passo = conexao.passo
const inst = conexao.instituicao

/** chave do conteúdo do cartão: muda → transição + foco no título */
const chave = computed(() => (estado.value === 'fluxo' ? `fluxo:${passo.value}${fim.value ? ':fim' : ''}` : estado.value))
const podeVoltar = computed(() => estado.value === 'fluxo' && ['instituicao', 'cpf', 'redirect', 'aguardando'].includes(passo.value))
const podeFechar = computed(() => estado.value === 'fluxo' && !['sincronizando', 'sucesso'].includes(passo.value))

function fechar() {
  if (!podeFechar.value) return
  conexao.reiniciar()
  estado.value = 'cancelado'
}
function reabrir() {
  estado.value = 'fluxo'
}
function recarregar() {
  if (import.meta.client) window.location.reload()
}
</script>

<template>
  <ClienteConnect :passo="chave" :pode-voltar="podeVoltar" :pode-fechar="podeFechar" @voltar="conexao.voltar" @fechar="fechar">
    <ClienteConnectEstado v-if="estado === 'carregando'" variante="carregando" />

    <ClienteConnectEstado v-else-if="estado === 'invalido'" variante="invalido" :titulo="MOTIVOS[motivo]?.titulo" :texto="MOTIVOS[motivo]?.texto" />

    <ClienteConnectEstado
      v-else-if="estado === 'cancelado'"
      variante="cancelado"
      titulo="Conexão cancelada."
      texto="Nada foi conectado. O link continua válido: você pode reabrir quando quiser."
      @reabrir="reabrir"
    />

    <template v-else-if="info">
      <ClienteConnectIntro
        v-if="passo === 'intro'"
        :escritorio="escritorio"
        :assessor="info.advisor_label"
        :cliente-nome="info.client_name"
        @continuar="conexao.continuar"
        @termo="termoAberto = true"
      />
      <ClienteConnectInstituicoes v-else-if="passo === 'instituicao'" @escolher="conexao.escolher" />
      <ClienteConnectCpf v-else-if="passo === 'cpf' && inst" :inst="inst" @continuar="conexao.cpfConfirmado" @trocar="conexao.voltar" />
      <ClienteConnectRedirect v-else-if="passo === 'redirect' && inst" :inst="inst" @ir="conexao.irParaBanco" />
      <ClienteConnectAguardando v-else-if="passo === 'aguardando' && inst" :inst="inst" @autorizei="conexao.autorizado" />
      <ClienteConnectSync
        v-else-if="passo === 'sincronizando' && inst"
        :inst="inst"
        :etapas="conexao.etapas.value"
        :erro="conexao.erro.value"
        :recarregar="conexao.precisaRecarregar.value"
        @tentar="conexao.tentarDeNovo"
        @recarregar="recarregar"
        @inicio="conexao.reiniciar"
      />
      <ClienteConnectSucesso
        v-else-if="passo === 'sucesso' && inst"
        :inst="inst"
        :escritorio="escritorio"
        :assessor="info.advisor_label"
        :manage-url="conexao.resultado.value?.manage_url ?? null"
        :fim="fim"
        @concluir="fim = true"
      />
    </template>
  </ClienteConnect>

  <ClienteConnectTermo :open="termoAberto" :texto="info?.terms_text ?? ''" :versao="info?.terms_version ?? ''" @close="termoAberto = false" />
</template>
