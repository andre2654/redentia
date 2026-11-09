<script setup lang="ts">
// As perguntas que travam a decisão (31/10/2026), respondidas sem rodeio. O
// topo não diz preço (o "Conectar carteira" abre o quiz), mas quem pergunta
// "Quanto custa?" lê a resposta direta (revisão de funil, 01/11/2026: esconder
// o preço de quem procura por ele tira confiança). Nada recomenda investimento.
import { DIAS_GRATIS, PRECO_MENSAL } from '~/utils/assinatura'
// No mesmo dia, o dono pediu o modelo do FAQ da home: o texto à esquerda e o
// NuFaqAccordion à direita (cartões brancos no creme). O JSON-LD fica com o da
// home: o /assinar é privado e não precisa de um FAQPage a mais.
import type { NuFaqItem } from '~/types/market'

const PERGUNTAS: NuFaqItem[] = [
  {
    q: 'Funciona com o meu banco?',
    a: 'Funciona com os bancos e corretoras do Open Finance: Nubank, Itaú, Bradesco, Banco do Brasil, Santander, Inter, XP, BTG e mais de cem outros.',
  },
  {
    q: 'É seguro conectar?',
    a: 'É só leitura. Você autoriza no app do seu banco, a senha nunca passa pela Redentia, e a conexão é pelo Open Finance, regulado pelo Banco Central.',
  },
  {
    q: 'Quanto custa?',
    a: `${PRECO_MENSAL} por mês, preço de lançamento. Na primeira assinatura são ${DIAS_GRATIS} dias grátis para testar, e você cancela quando quiser, em Configurações.`,
  },
  {
    q: 'A Redentia diz o que eu devo comprar?',
    a: 'Não. Ela mostra o que a sua carteira tem, como ela se mexe e o que pode vir pela frente. A decisão é sempre sua.',
  },
  {
    q: 'E se eu ainda não investir?',
    a: 'Dá para começar do zero: quando o primeiro investimento cair na sua conta, a carteira aparece aqui.',
  },
]
</script>

<template>
  <section class="apg" aria-labelledby="apg-titulo">
    <div class="apg__cols">
      <div class="apg__esq">
        <NuSectionHeading id="apg-titulo">Antes de <br>conectar.</NuSectionHeading>
        <p class="apg__copy">O que a Redentia vê, como fica o seu dinheiro e o que acontece depois do quiz.</p>
        <div class="apg__acao">
          <AssinaturaConectar origem="perguntas" />
        </div>
      </div>
      <div class="apg__dir">
        <NuFaqAccordion :items="PERGUNTAS" :schema="false" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* o mesmo FAQ da home (HomeContent .mfq), o texto à esquerda; aqui no branco com os cartões creme (alterna com o MCP) */
.apg { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); }
.apg__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.apg__esq { flex: 1 1 300px; min-width: min(280px, 100%); }
.apg__copy { margin: 22px 0 0; max-width: 420px; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; }
.apg__acao { margin-top: clamp(24px, 3vw, 32px); }
.apg__dir { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
