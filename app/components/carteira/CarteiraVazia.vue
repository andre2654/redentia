<script setup lang="ts">
// A /carteira de quem assina e ainda não conectou banco (31/10/2026). Mesmo
// topo calmo do Agora: uma frase, um gesto. O gesto é o Pluggy Connect de
// sempre (CarteiraConnect → usePluggyConnect), com os bancos que a pessoa
// reconhece logo abaixo (os SVGs oficiais de public/instituicoes).
import { INSTITUICOES } from '~/content/instituicoes'

const emit = defineEmits<{ (e: 'connected'): void }>()

const VITRINE = ['nubank', 'itau', 'bradesco', 'bb', 'santander', 'inter', 'xp', 'btg', 'c6', 'rico']
const bancos = VITRINE.map((s) => INSTITUICOES.find((i) => i.slug === s)).filter((i): i is (typeof INSTITUICOES)[number] => !!i && i.logo)

// a frase dos logos: os três que todo mundo reconhece e quantos mais
const quemConecta = (() => {
  const nomes = bancos.slice(0, 3).map((b) => b.name)
  const resto = bancos.length - nomes.length
  return resto > 0
    ? `${nomes.join(', ')} e mais ${resto} bancos e corretoras.`
    : `${nomes.join(', ')}.`
})()

const passos = [
  { t: 'Escolha o banco', d: 'Banco ou corretora onde estão os seus investimentos.' },
  { t: 'Autorize no app dele', d: 'A autorização é sua e vale só para leitura.' },
  { t: 'A carteira aparece aqui', d: 'Com os 2.000 cenários, os proventos e a IA.' },
]
</script>

<template>
  <section class="cvz" aria-labelledby="cvz-titulo">
    <div class="cvz__miolo">
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
        <CarteiraConnect @connected="emit('connected')" />
        <p class="cvz__seguro">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
          Regulado pelo Banco Central.
        </p>
      </div>
    </div>

    <ol class="cvz__passos">
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
