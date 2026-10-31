<script setup lang="ts">
// A /carteira de quem assina e ainda não conectou banco (31/10/2026). Mesmo
// topo calmo do Agora: uma frase, um gesto. O gesto é o Pluggy Connect de
// sempre (CarteiraConnect → usePluggyConnect), com os bancos que a pessoa
// reconhece logo abaixo (os SVGs oficiais de public/instituicoes).
import { INSTITUICOES } from '~/content/instituicoes'

const emit = defineEmits<{ (e: 'connected'): void }>()

const VITRINE = ['nubank', 'itau', 'bradesco', 'bb', 'santander', 'inter', 'xp', 'btg', 'c6', 'rico']
const bancos = VITRINE.map((s) => INSTITUICOES.find((i) => i.slug === s)).filter((i): i is (typeof INSTITUICOES)[number] => !!i && i.logo)

const passos = [
  { t: 'Escolha o banco', d: 'Banco ou corretora onde estão os seus investimentos.' },
  { t: 'Autorize no app dele', d: 'A autorização é sua e vale só para leitura.' },
  { t: 'A carteira aparece aqui', d: 'Com os 2.000 cenários, os proventos e a IA.' },
]
</script>

<template>
  <section class="cvz" aria-labelledby="cvz-titulo">
    <div class="cvz__miolo">
      <span class="cvz__estado"><span class="cvz__ponto" aria-hidden="true" />Falta um passo</span>
      <h1 id="cvz-titulo" class="cvz__titulo">Conecte <br>seu banco.</h1>
      <p class="cvz__linha">
        A Redentia lê os seus investimentos pelo Open Finance, testa a carteira em
        2.000 cenários e avisa quando algo pede você.
      </p>

      <ul class="cvz__bancos" aria-label="Alguns dos bancos e corretoras que conectam">
        <li v-for="b in bancos" :key="b.slug" class="cvz__banco" :title="b.name">
          <ClienteInstLogo :inst="b" :size="32" />
          <span class="cvz__banco-nome">{{ b.name }}</span>
        </li>
      </ul>

      <div class="cvz__acao">
        <CarteiraConnect @connected="emit('connected')" />
        <p class="cvz__seguro">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
          Regulado pelo Banco Central. A Redentia só lê: não movimenta nada.
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
.cvz__estado { display: inline-flex; align-items: center; gap: 9px; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.cvz__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-blue); box-shadow: 0 0 0 4px var(--nu-blue-tint); }
.cvz__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(52px, 8.4vw, 120px); font-weight: 800; letter-spacing: -0.05em; line-height: 0.96; }
.cvz__linha { margin: clamp(16px, 2vw, 24px) 0 0; max-width: 640px; color: var(--nu-gray-2); font-size: clamp(18px, 2vw, 22px); font-weight: 500; line-height: 1.5; }

.cvz__bancos { list-style: none; margin: clamp(28px, 4vw, 44px) 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
.cvz__banco {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--nu-white); border-radius: var(--nu-r-pill); padding: 6px 16px 6px 6px;
  box-shadow: var(--nu-shadow-pos-nav);
}
.cvz__banco-nome { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }

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
