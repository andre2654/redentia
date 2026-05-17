<!--
  HomeFaqBlock — FAQ pública da home (extraída de /mercado-completo).
  11 perguntas/respostas sobre a Redentia, defaults vêm de `homeFaqItems`
  e podem ser overrideadas pelo brand.faq.items (per-tenant). Schema
  FAQPage emitido pelo próprio MoleculesFAQ.
  Usado em / e /mercado-completo.
-->
<template>
  <section class="quiet-section relative" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="mx-auto max-w-3xl px-6">
      <MoleculesFAQ
        :eyebrow="brand.faq?.eyebrow || 'Dúvidas comuns'"
        :title="brand.faq?.title || `Perguntas frequentes sobre a ${brand.name}`"
        :items="resolvedFaqItems"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

// 11 perguntas/respostas com keywords longtail (semantic SEO).
const homeFaqItems = computed(() => [
  {
    question: `O que é a ${brand.name}?`,
    answer: `${brand.name} é uma plataforma brasileira de análise de investimentos com inteligência artificial integrada. Reúne dados em tempo real da B3 e Tesouro Direto, calculadoras financeiras (juros compostos, dividend yield, preço teto, IR), rankings de ações e FIIs, simuladores de carteira e um assistente IA que responde sobre qualquer ativo, setor ou estratégia em português. Acesso 100% online, sem instalação.`,
  },
  {
    question: `A ${brand.name} é gratuita?`,
    answer: `Sim. A ${brand.name} oferece acesso gratuito a calculadoras, rankings, cotações da B3, glossário, guias e ferramentas básicas de análise. Os planos pagos (${brand.name} Pro e ${brand.name} Max) liberam recursos avançados de IA, análise de carteira em tempo real, alertas customizados, exportação de relatórios e integração com corretora. Veja a comparação completa na página de planos.`,
  },
  {
    question: `A ${brand.name} é segura e confiável?`,
    answer: `Sim. A ${brand.name} não recebe nem custodia dinheiro, é uma plataforma de informação e análise. Os dados de mercado vêm de fontes oficiais (B3, Tesouro Direto, Banco Central, CVM). A plataforma usa criptografia HTTPS em todas as conexões, autenticação OAuth e armazenamento seguro de dados. Não pedimos senha de corretora nem credenciais bancárias para mostrar análises.`,
  },
  {
    question: `Por que a ${brand.name} é considerada a melhor plataforma de investimentos?`,
    answer: `A ${brand.name} se destaca por três pilares: (1) IA conversacional treinada em metodologias clássicas de análise (Graham, Bazin, Buffett) que explica decisões em português, sem jargão; (2) framework proprietário de carteira em 9 camadas que valida composição, retorno esperado, correlação e stress-test antes de qualquer recomendação; (3) cobertura unificada de ações, FIIs, ETFs, BDRs, Tesouro Direto e cripto numa interface única, sem precisar trocar de site.`,
  },
  {
    question: `Como funciona a inteligência artificial da ${brand.name}?`,
    answer: `O assistente IA da ${brand.name} responde perguntas sobre qualquer ativo, setor ou estratégia consultando dados em tempo real da B3, fundamentos das empresas, histórico de dividendos e notícias. Diferente de chatbots genéricos, ele segue um framework de carteira em 9 camadas (perfil, diversificação geográfica, validação de retorno, stress-test, etc.) e cita fontes para tudo que afirma. Funciona em planos Pro e Max.`,
  },
  {
    question: `Como começar a usar a ${brand.name}?`,
    answer: `Basta criar uma conta gratuita com email ou Google em menos de 30 segundos. Depois você pode buscar qualquer ticker (PETR4, VALE3, HGLG11), usar as calculadoras, fazer simulações de carteira e tirar dúvidas com a IA. Não precisa cartão de crédito para começar, o trial Pro de 7 dias é opcional e sem cobrança automática.`,
  },
  {
    question: `Quais ativos posso analisar na ${brand.name}?`,
    answer: `Todos os ativos negociados na bolsa brasileira (B3): mais de 400 ações, todos os FIIs (fundos imobiliários), ETFs, BDRs, e o universo completo do Tesouro Direto (Selic, Prefixado, IPCA+). A plataforma também cobre criptomoedas (Bitcoin, Ethereum, etc.) e indicadores macro (Selic, IPCA, dólar, IBOV, IFIX) atualizados diariamente após o pregão.`,
  },
  {
    question: `A ${brand.name} substitui minha corretora?`,
    answer: `Não. A ${brand.name} é uma plataforma de análise e decisão, ela ajuda você a escolher o que comprar e quando rebalancear. Para executar a ordem (compra ou venda), você ainda usa sua corretora preferida (XP, Rico, Clear, Inter, NuInvest, etc.). Pense na ${brand.name} como o "cérebro" que orienta as decisões, e a corretora como o "braço" que executa.`,
  },
  {
    question: `Posso conectar minha carteira de outra corretora?`,
    answer: `Sim. A ${brand.name} importa carteira de qualquer corretora brasileira via planilha CEI (B3) ou upload manual de operações. Importação direta com algumas corretoras (XP, Rico, Clear, BTG, Inter) está em rollout no plano Pro+. Após importar, você vê alocação, performance, dividendos recebidos e análise de risco da carteira completa.`,
  },
  {
    question: `A ${brand.name} tem aplicativo para celular?`,
    answer: `Sim, a ${brand.name} é uma PWA (Progressive Web App), funciona como app nativo em iPhone e Android sem precisar baixar da App Store. Basta abrir no Safari/Chrome e adicionar à tela de início. Inclui notificações push para alertas de preço, dividendos e relatórios.`,
  },
  {
    question: `Como cancelar minha assinatura na ${brand.name}?`,
    answer: `O cancelamento é feito direto no painel da conta, em Configurações → Gerenciar plano, em 2 cliques. Sem ligação, sem retenção. Você mantém acesso ao plano pago até o fim do período já pago e depois volta automaticamente para o plano gratuito, sem perder histórico nem carteiras importadas.`,
  },
])

// FAQ resolvido: prefere brand.faq.items quando configurado, fallback p/ defaults.
// Substitui {name}/{brand} pelo brand.name em strings vindas do admin.
const resolvedFaqItems = computed(() => {
  const items = (brand as any).faq?.items
  if (!Array.isArray(items) || items.length === 0) {
    return homeFaqItems.value
  }
  const sub = (s: string) => typeof s === 'string'
    ? s.replace(/\{name\}/g, brand.name).replace(/\{brand\}/g, brand.name)
    : s
  return items
    .filter((it: any) => it && it.question && it.answer)
    .map((it: any) => ({ question: sub(it.question), answer: sub(it.answer) }))
})
</script>
