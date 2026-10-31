<script setup lang="ts">
// "O que vem na assinatura." (31/10/2026): as quatro coisas que a pessoa
// ganha, em palavras simples — a carteira de qualquer banco (Open Finance), o
// teste de 2.000 cenários, a IA que conhece a carteira e os avisos. Um cartão
// por coisa, ícone, título e duas linhas. Os bancos são os SVGs oficiais de
// public/instituicoes (o mesmo seletor do Pluggy Connect).
import { INSTITUICOES } from '~/content/instituicoes'

withDefaults(defineProps<{ titulo?: boolean }>(), { titulo: true })

const VITRINE = ['nubank', 'itau', 'bradesco', 'bb', 'santander', 'inter', 'xp', 'btg']
const bancos = VITRINE.map((s) => INSTITUICOES.find((i) => i.slug === s)).filter((i): i is (typeof INSTITUICOES)[number] => !!i && i.logo)

const itens = [
  {
    icone: 'banco',
    t: 'Sua carteira de qualquer banco',
    d: 'Conecte pelo Open Finance e veja ações, FIIs, Tesouro, CDBs e cripto num lugar só. A Redentia só lê: não movimenta nada.',
  },
  {
    icone: 'leque',
    t: '2.000 cenários para os próximos 5 anos',
    d: 'O motor roda a sua carteira em 2.000 caminhos e mostra o otimista, o meio e o pessimista, em dinheiro de hoje.',
  },
  {
    icone: 'ia',
    t: 'Uma IA que conhece a sua carteira',
    d: 'Pergunte por que caiu, quanto rende ou o que mudar. A resposta vem com os seus números, não com a média do mercado.',
  },
  {
    icone: 'aviso',
    t: 'Aviso só quando importa',
    d: 'Um papel seu despencou? Você fica sabendo. No resto do tempo, a Redentia fica quieta e vigia por você.',
  },
] as const
</script>

<template>
  <section class="abn" aria-labelledby="abn-titulo">
    <h2 v-if="titulo" id="abn-titulo" class="abn__titulo">O que vem <br>na assinatura.</h2>
    <h2 v-else id="abn-titulo" class="abn__sr">O que vem na assinatura</h2>
    <ul class="abn__grade">
      <li v-for="it in itens" :key="it.t" class="abn__card">
        <span class="abn__icone" aria-hidden="true">
          <svg v-if="it.icone === 'banco'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M12 3l9 5H3l9-5Z" /></svg>
          <svg v-else-if="it.icone === 'leque'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c5 0 9-4 18-8M3 13c6 0 10-1 18-1M3 13c5 0 9 3 18 7" /><circle cx="3" cy="13" r="1.5" fill="currentColor" /></svg>
          <svg v-else-if="it.icone === 'ia'" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="abn__miolo" /></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
        </span>
        <h3 class="abn__t">{{ it.t }}</h3>
        <p class="abn__d">{{ it.d }}</p>
        <ul v-if="it.icone === 'banco'" class="abn__bancos" aria-label="Alguns dos bancos e corretoras que conectam">
          <li v-for="b in bancos" :key="b.slug" :title="b.name"><ClienteInstLogo :inst="b" :size="30" /></li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.abn__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.abn__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.abn__grade {
  list-style: none; margin: clamp(28px, 4vw, 48px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: clamp(14px, 1.6vw, 20px);
}
.abn__card { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: clamp(22px, 2.6vw, 30px); display: flex; flex-direction: column; }
.abn__icone {
  width: 48px; height: 48px; border-radius: var(--nu-r-tile);
  background: var(--nu-white); color: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.abn__miolo { fill: var(--nu-white); }
.abn__t { margin: 20px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.015em; line-height: 1.2; }
.abn__d { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.abn__bancos { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
</style>
