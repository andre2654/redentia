<script setup lang="ts">
// A /carteira de quem assina e ainda não conectou banco (31/10/2026). Mesmo
// topo calmo do Agora: uma frase, um gesto. O gesto é o Pluggy Connect de
// sempre (CarteiraConnect → usePluggyConnect), com os bancos que a pessoa
// reconhece logo abaixo (os SVGs oficiais de public/instituicoes).
//
// Dois cuidados do caminho até a carteira (01/11/2026):
//  - quem respondeu o quiz da assinatura vê primeiro os bancos que contou lá
//    (bancosDoQuiz, no localStorage), lidos só no navegador;
//  - conectado o banco, a Pluggy ainda leva de 1 a 3 minutos para ler as
//    posições. Em vez de voltar ao "Conecte seu banco", a tela fica lendo:
//    esqueleto da carteira e o GET /pluggy/connections a cada 4 s, até a
//    conexão ficar UPDATED (aí o pai recarrega a carteira) ou dar erro.
import { INSTITUICOES } from '~/content/instituicoes'
import { bancosDoQuiz } from '~/utils/quizAssinatura'
import type { PluggyConnection } from '~/types/pluggy'

const emit = defineEmits<{ (e: 'connected'): void }>()

const VITRINE = ['nubank', 'itau', 'bradesco', 'bb', 'santander', 'inter', 'xp', 'btg', 'c6', 'rico']
const instituicao = (s: string) => INSTITUICOES.find((i) => i.slug === s)
const doQuiz = ref<string[]>([])
onMounted(() => { doQuiz.value = bancosDoQuiz() })

const bancos = computed(() => {
  const ordem = [...doQuiz.value, ...VITRINE.filter((s) => !doQuiz.value.includes(s))]
  return ordem.map(instituicao).filter((i): i is (typeof INSTITUICOES)[number] => !!i && i.logo)
})

const nomesEmPalavras = (nomes: string[]) => (nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}` : nomes[0] ?? '')

// a frase dos logos: os do quiz ("você contou"), ou os três que todo mundo reconhece e quantos mais
const quemConecta = computed(() => {
  const contados = doQuiz.value.map((s) => instituicao(s)?.name).filter((n): n is string => !!n)
  if (contados.length) {
    return contados.length > 1
      ? `Você contou que investe em ${nomesEmPalavras(contados.slice(0, 3))}. Comece por um deles; os outros entram depois.`
      : `Você contou que investe em ${contados[0]}. Comece por ele.`
  }
  const nomes = bancos.value.slice(0, 3).map((b) => b.name)
  const resto = bancos.value.length - nomes.length
  return resto > 0 ? `${nomes.join(', ')} e mais ${resto} bancos e corretoras.` : `${nomes.join(', ')}.`
})

const passos = [
  { t: 'Escolha o banco', d: 'Banco ou corretora onde estão os seus investimentos.' },
  { t: 'Autorize no app dele', d: 'A autorização é sua e vale só para leitura.' },
  { t: 'A carteira aparece aqui', d: 'Com os 2.000 cenários, os proventos e a IA.' },
]

/* ——— depois de conectar: lendo as posições ——— */
const { listConnections } = usePluggy()
const lendo = ref(false)
const banco = ref('')
const situacao = ref<'lendo' | 'demorando' | 'erro'>('lendo')
let relogio: ReturnType<typeof setTimeout> | null = null
let tentativas = 0
const INTERVALO = 4000
const LIMITE = 45 // 3 minutos

const PRONTO: PluggyConnection['status'][] = ['UPDATED']
const ERRO: PluggyConnection['status'][] = ['LOGIN_ERROR', 'WAITING_USER_INPUT', 'ERROR', 'ITEM_NOT_FOUND']

async function conferir() {
  tentativas++
  try {
    const conexoes = await listConnections()
    const ultima = [...conexoes].sort((a, b) => b.id - a.id)[0]
    if (ultima?.institution_name) banco.value = ultima.institution_name
    if (ultima && PRONTO.includes(ultima.status)) {
      emit('connected')
      return
    }
    if (ultima && ERRO.includes(ultima.status)) {
      situacao.value = 'erro'
      return
    }
  }
  catch { /* rede piscou: tenta na próxima volta */ }
  if (tentativas >= LIMITE) {
    situacao.value = 'demorando'
    return
  }
  relogio = setTimeout(conferir, INTERVALO)
}

function conectou() {
  lendo.value = true
  situacao.value = 'lendo'
  tentativas = 0
  if (relogio) clearTimeout(relogio)
  relogio = setTimeout(conferir, 1500)
}

function verDeNovo() {
  situacao.value = 'lendo'
  tentativas = 0
  void conferir()
}

onBeforeUnmount(() => { if (relogio) clearTimeout(relogio) })

const tituloLendo = computed(() => (banco.value ? `Lendo o seu ${banco.value}.` : 'Lendo a sua carteira.'))
</script>

<template>
  <section class="cvz" aria-labelledby="cvz-titulo">
    <div class="cvz__miolo">
      <template v-if="lendo">
        <h1 id="cvz-titulo" class="cvz__titulo cvz__titulo--lendo">{{ tituloLendo }}</h1>
        <p v-if="situacao === 'lendo'" class="cvz__linha" aria-live="polite">
          A conexão está feita. Os investimentos levam de 1 a 3 minutos para chegar,
          e aparecem aqui sozinhos.
        </p>
        <p v-else-if="situacao === 'demorando'" class="cvz__linha" aria-live="polite">
          Está levando mais que o normal. Pode sair desta tela: quando a leitura
          terminar, a carteira aparece aqui.
        </p>
        <p v-else class="cvz__linha" aria-live="polite">
          O banco pediu uma confirmação ou recusou a leitura. Conecte de novo e
          autorize no app dele.
        </p>

        <!-- a carteira chegando: o esqueleto com a forma dela -->
        <div v-if="situacao !== 'erro'" class="cvz__esqueleto" aria-hidden="true">
          <span class="cvz__osso cvz__osso--eyebrow" />
          <span class="cvz__osso cvz__osso--total" />
          <span class="cvz__osso cvz__osso--barra" />
          <span v-for="n in 3" :key="n" class="cvz__osso cvz__osso--linha" />
        </div>

        <div class="cvz__acao">
          <button v-if="situacao === 'demorando'" type="button" class="cvz__de-novo" @click="verDeNovo">Ver de novo</button>
          <CarteiraConnect v-else-if="situacao === 'erro'" @connected="conectou" />
        </div>
      </template>

      <template v-else>
      <h1 id="cvz-titulo" class="cvz__titulo">Conecte <br>seu banco.</h1>
      <p class="cvz__linha">
        A Redentia lê os seus investimentos automaticamente, testa a carteira em
        2.000 cenários e alerta quando algo acontece.
      </p>

      <!-- os bancos numa fila só: os logos encostados e, ao lado, quem são -->
      <div class="cvz__bancos">
        <ul class="cvz__logos" aria-hidden="true">
          <li v-for="b in bancos" :key="b.slug" class="cvz__logo" :title="b.name">
            <ClienteInstLogo :inst="b" :size="28" />
          </li>
        </ul>
        <p class="cvz__bancos-txt">{{ quemConecta }}</p>
      </div>

      <div class="cvz__acao">
        <CarteiraConnect @connected="conectou" />
        <p class="cvz__seguro">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
          Regulado pelo Banco Central.
        </p>
      </div>
      </template>
    </div>

    <ol v-if="!lendo" class="cvz__passos">
      <li v-for="(p, i) in passos" :key="p.t" class="cvz__passo">
        <span class="cvz__num" aria-hidden="true">{{ i + 1 }}</span>
        <span class="cvz__passo-t">{{ p.t }}</span>
        <span class="cvz__passo-d">{{ p.d }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.cvz {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 112px) clamp(22px, 5.5vw, 80px) clamp(44px, 6vw, 80px);
  animation: nu-fade .5s ease both;
}
.cvz__titulo { margin: 0; color: var(--nu-ink); font-size: clamp(52px, 8.4vw, 120px); font-weight: 800; letter-spacing: -0.05em; line-height: 0.96; }
.cvz__linha { margin: clamp(16px, 2vw, 24px) 0 0; max-width: 640px; color: var(--nu-gray-2); font-size: clamp(18px, 2vw, 22px); font-weight: 500; line-height: 1.5; }

.cvz__bancos { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: clamp(28px, 4vw, 44px); }
.cvz__logos { list-style: none; margin: 0; padding: 0 0 0 8px; display: flex; }
.cvz__logo {
  display: grid; place-items: center; width: 44px; height: 44px; margin-left: -8px;
  border-radius: 50%; overflow: hidden; background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-cream), var(--nu-shadow-pos-nav);
  transition: transform .2s cubic-bezier(.22, 1, .36, 1);
}
.cvz__logo :deep(.cil) { border: 0; border-radius: 7px; }
@media (max-width: 420px) {
  .cvz__logo { width: 38px; height: 38px; margin-left: -9px; }
  .cvz__logo :deep(.cil) { width: 24px !important; height: 24px !important; }
}
.cvz__logo:hover { transform: translateY(-3px); }
.cvz__bancos-txt { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
@media (prefers-reduced-motion: reduce) { .cvz__logo { transition: none; } }

.cvz__acao { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; margin-top: clamp(28px, 4vw, 40px); }
.cvz__seguro { display: inline-flex; align-items: center; gap: 8px; margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cvz__seguro svg { color: var(--nu-green); flex-shrink: 0; }

.cvz__titulo--lendo { font-size: clamp(44px, 6.4vw, 92px); }
.cvz__esqueleto {
  display: flex; flex-direction: column; gap: 14px; max-width: 560px; margin-top: clamp(28px, 4vw, 44px);
  padding: 26px; border-radius: var(--nu-r-card); background: var(--nu-white);
}
.cvz__osso {
  display: block; height: 16px; border-radius: 10px;
  background: linear-gradient(90deg, var(--nu-cream) 0%, var(--nu-cream-line) 50%, var(--nu-cream) 100%);
  background-size: 200% 100%; animation: cvz-osso 1.4s ease-in-out infinite;
}
.cvz__osso--eyebrow { width: 28%; height: 12px; }
.cvz__osso--total { width: 56%; height: 40px; border-radius: 14px; }
.cvz__osso--barra { width: 100%; height: 12px; margin: 6px 0 4px; }
.cvz__osso--linha { width: 100%; height: 44px; border-radius: 14px; }
@keyframes cvz-osso { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .cvz__osso { animation: none; } }
.cvz__de-novo {
  border: 0; border-radius: var(--nu-r-pill); padding: 16px 28px; background: var(--nu-blue); color: var(--nu-white);
  font-family: inherit; font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer;
}
.cvz__de-novo:hover { background: var(--nu-blue-hover); }

.cvz__passos {
  list-style: none; margin: clamp(44px, 6vw, 72px) 0 0; padding: clamp(24px, 3vw, 32px) 0 0;
  border-top: 1px solid var(--nu-cream-line);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: clamp(18px, 3vw, 36px);
}
.cvz__passo { display: grid; grid-template-columns: auto 1fr; column-gap: 14px; row-gap: 4px; align-items: start; }
.cvz__num {
  grid-row: span 2; width: 32px; height: 32px; border-radius: 50%;
  background: var(--nu-white); color: var(--nu-blue-text);
  display: inline-flex; align-items: center; justify-content: center; font-size: var(--nu-fs-sm); font-weight: 800;
}
.cvz__passo-t { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
.cvz__passo-d { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
</style>
