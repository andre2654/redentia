<template>
  <NuxtLayout name="default" title="Calculadora de Aposentadoria">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        :back-link="{ to: '/calculadora', label: 'Todas as calculadoras' }"
        icon="i-lucide-piggy-bank"
        icon-color="secondary"
        title="Calculadora de Aposentadoria 2026: Quanto Preciso para Me Aposentar?"
        description="Esta calculadora estima quanto você precisa investir hoje pra se aposentar com a renda mensal desejada. Aplica a regra dos 4% (saque seguro): patrimônio = renda mensal × 12 ÷ 0,04. Exemplo: pra ter R$ 5.000 por mês na aposentadoria, você precisa de R$ 1,5 milhão investidos. Considera INSS, inflação, idade atual e expectativa de vida."
        :chips="[
          { icon: 'i-lucide-check-circle', label: '100% gratuito', color: 'positive' },
          { icon: 'i-lucide-zap', label: 'Cálculo instantâneo', color: 'primary' },
          { icon: 'i-lucide-flame', label: 'Regra dos 4% e FIRE', color: 'primary' },
          { icon: 'i-lucide-share-2', label: 'Link compartilhável', color: 'primary' },
        ]"
        :meta="`Última atualização: ${ lastUpdatedText }`"
      />

      <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text-muted)' }">
        Descubra na hora quanto patrimônio você precisa pra aposentar com R$ 5.000, R$ 10.000 ou R$ 20.000 por mês. Calculadora completa com regra dos 4%, INSS, expectativa de vida, ajuste pela inflação e simulação FIRE (Lean, Regular e Fat). Ideal pra planejar aposentadoria antecipada ou complementar o INSS, gratuito, sem cadastro.
      </p>

      <!-- Calculadora -->
      <CalculatorRetirement />

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. Retirement.vue le `?age=`, `?retire=`, `?income=`,
        `?monthly=`, `?inss=` e ja dispara o calculo no mount. Long-tails
        miradas: "aposentar com 5000 reais por mes", "FIRE Brasil",
        "aposentar aos 50", "regra dos 4%".
      -->
      <div
        class="flex flex-col gap-3 rounded-lg border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de aposentadoria</h2>
        <p class="text-sm">
          Veja na hora o patrimônio necessário e o aporte mensal pra cada cenário, basta clicar e a simulação carrega já preenchida.
        </p>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <NuxtLink
            v-for="s in popularScenarios"
            :key="s.label"
            :to="s.to"
            class="group flex flex-col gap-0.5 rounded-xl border px-3 py-3 transition hover:border-secondary/40 hover:bg-secondary/10"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon :name="s.icon" class="size-4 text-secondary" />
              {{ s.label }}
            </span>
            <span class="text-[11px] line-clamp-1" :style="{ color: 'var(--brand-text-muted)' }">{{ s.sub }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="quiet-prose max-w-none">
        <h2>Simulador de Aposentadoria grátis e online</h2>
        <h2>Como Planejar sua Aposentadoria no Brasil</h2>
        <p class="leading-relaxed">
          Aposentadoria não acontece por acaso, é resultado de planejamento, disciplina e juros compostos trabalhando por décadas. Quanto mais cedo você começar a planejar, mais confortável será sua aposentadoria e menor será o aporte mensal exigido.
        </p>
        <p class="leading-relaxed">
          Esta calculadora considera todas as variáveis críticas: idade atual e desejada de aposentadoria, expectativa de vida, renda mensal desejada, patrimônio atual, aporte mensal, retorno esperado na fase de acumulação e na fase de fruição, inflação anual e estimativa de INSS. O resultado é o cenário completo: viabilidade, patrimônio projetado vs necessário, e duração do patrimônio na aposentadoria.
        </p>

        <h3>Os 3 Pilares do Planejamento de Aposentadoria</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              1. Tempo de Acumulação
            </h4>
            <p class="text-sm">
              O fator mais poderoso. Cada década adicional de investimento dobra ou triplica o patrimônio final por conta dos juros compostos. Quem começa aos 25 acumula 3x mais que quem começa aos 35.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              2. Taxa de Aporte
            </h4>
            <p class="text-sm">
              O percentual da renda investido define a velocidade. 10% leva a aposentadoria padrão aos 65, 25% leva a Regular FIRE aos 55, 50%+ leva a aposentadoria antecipada agressiva (Lean ou Fat FIRE).
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              3. Retorno dos Investimentos
            </h4>
            <p class="text-sm">
              Trocar 8% por 12% a.a. (acréscimo de 4 pontos) reduz o tempo até a meta em ~35%. Carteira diversificada com rebalanceamento anual entrega historicamente 10-12% líquidos no Brasil.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              4. Custo de Vida na Aposentadoria
            </h4>
            <p class="text-sm">
              Subestimar o custo de vida pós-aposentadoria é o erro mais comum. Lazer, saúde, viagens e gastos médicos crescem com a idade. Use 70-90% da renda atual como base, não 50%.
            </p>
          </div>
        </div>

        <h2>Reserva de Emergência: Pré-requisito da Aposentadoria</h2>
        <p class="leading-relaxed">
          Antes de pensar em FIRE, regra dos 4% ou previdência privada, monte uma reserva de emergência. Ela é o que evita você sacar seus investimentos de longo prazo em momentos ruins (perda de emprego, problema de saúde, despesa inesperada) e quebrar o efeito dos juros compostos.
        </p>
        <p class="leading-relaxed">
          A reserva ideal cobre 6 a 12 meses de despesas, alocada em renda fixa de alta liquidez (Tesouro Selic, CDB com liquidez diária de bancão grande). Vem ANTES dos investimentos de longo prazo porque é seguro de carreira e tranquilidade emocional, não rentabilidade.
        </p>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-3">Tabela rápida de referência</h4>
          <ul class="space-y-2 text-sm">
            <li>Renda mensal R$ 5.000, reserva R$ 30.000 a R$ 60.000.</li>
            <li>Renda mensal R$ 10.000, reserva R$ 60.000 a R$ 120.000.</li>
            <li>Renda mensal R$ 20.000, reserva R$ 120.000 a R$ 240.000.</li>
          </ul>
          <p class="mt-3 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
            Quem é CLT estável: 6 meses. Autônomo, freelancer ou empresário: 9 a 12 meses. Casal com 2 rendas estáveis: pode usar 4 a 6.
          </p>
        </div>

        <h2>A Regra dos 4% (Safe Withdrawal Rate)</h2>
        <p class="leading-relaxed">
          A regra dos 4%, derivada do Trinity Study (1998), é o pilar matemático da aposentadoria moderna. Ela diz que você pode sacar 4% do seu patrimônio inicial por ano (corrigido pela inflação) com altíssima probabilidade de não acabar o dinheiro em 30 anos. No Brasil, com taxas reais mais altas, a regra é até mais confortável.
        </p>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Patrimônio necessário = Renda mensal desejada × 12 ÷ 0.04 (ou × 300)
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>Exemplo 1:</strong> Para R$ 5.000/mês, preciso de R$ 1,5 milhão (R$ 5.000 × 300)</p>
            <p><strong>Exemplo 2:</strong> Para R$ 10.000/mês, preciso de R$ 3 milhões</p>
            <p><strong>Exemplo 3:</strong> Para R$ 20.000/mês (Fat FIRE), preciso de R$ 6 milhões</p>
            <p><strong>Variação:</strong> Quem usa 3,5% (mais conservador) precisa multiplicar por 343. Quem usa 5% (mais agressivo) multiplica por 240.</p>
          </div>
        </div>

        <h2>Taxa de Retirada Segura (SWR) e Regra dos 4%</h2>
        <p class="leading-relaxed">
          A Safe Withdrawal Rate (SWR) é o percentual que você pode sacar do patrimônio por ano sem o risco de acabar o dinheiro durante a aposentadoria. A regra dos 4% nasceu do Trinity Study de 1998, que rodou simulações com dados históricos do mercado americano de 1925 a 1995 e concluiu que 4% real (ajustado pela inflação) por 30 anos tem altíssima taxa de sucesso.
        </p>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-2 text-secondary">Variações da SWR</h4>
          <ul class="space-y-2 text-sm">
            <li><strong>3,5%:</strong> mais conservador, indicado pra FIRE longo (40+ anos de retirada). Multiplique a despesa anual por ~285.</li>
            <li><strong>4%:</strong> regra clássica do Trinity Study, calibrada pra horizonte de 30 anos. Multiplique por 300.</li>
            <li><strong>4,5% a 5%:</strong> indicado pra horizontes de 20 a 25 anos. Multiplique por 240 a 267.</li>
            <li><strong>5% a 6% (Brasil):</strong> alguns autores defendem essa faixa porque a taxa real brasileira é historicamente maior que a americana (Selic real costuma ficar acima do treasury real). Use com cautela e revise a cada 3 a 5 anos.</li>
          </ul>
          <p class="mt-3 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
            Importante: a SWR é aplicada sobre o saldo INICIAL e ajustada pela inflação a cada ano, não recalculada sobre o saldo do ano corrente.
          </p>
        </div>

        <h2>Movimento FIRE: Aposentadoria Antecipada no Brasil</h2>
        <p class="leading-relaxed">
          FIRE (Financial Independence, Retire Early) é um movimento global que prega independência financeira e aposentadoria antecipada através de poupança agressiva (50-70% da renda) e investimentos disciplinados. No Brasil, com Selic alta e ferramentas como Tesouro Direto, FIRE é matematicamente viável.
        </p>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Lean FIRE</h4>
            <p class="text-sm">
              Aposentar com o mínimo necessário, estilo de vida frugal. Renda alvo: R$ 3-4 mil/mês. Patrimônio: R$ 900 mil a R$ 1,2 milhão. Ideal pra quem prioriza tempo livre sobre conforto material.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Regular FIRE</h4>
            <p class="text-sm">
              Manter padrão de vida classe média confortável. Renda alvo: R$ 6-10 mil/mês. Patrimônio: R$ 1,8 a 3 milhões. Maioria dos adeptos brasileiros mira nesse cenário.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Fat FIRE</h4>
            <p class="text-sm">
              Aposentar com alto padrão de vida e folga ampla. Renda alvo: R$ 20 mil+/mês. Patrimônio: R$ 6 milhões+. Exige renda alta na fase ativa ou negócio próprio bem-sucedido.
            </p>
          </div>
        </div>

        <h2>Quanto Preciso Acumular para Cada Renda na Aposentadoria</h2>
        <p class="leading-relaxed">
          Tabela de referência rápida usando a regra dos 4%, sem considerar INSS e sem ajuste pela inflação. Para projeções com inflação, use a calculadora acima.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Renda mensal</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Renda anual</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Patrimônio (4%)</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Aporte 25 anos (10% a.a.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 3.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 36.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 900.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 681/mês</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 5.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 60.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.500.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.135/mês</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 8.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 96.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.400.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.819/mês</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 10.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 120.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 3.000.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.270/mês</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 15.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 180.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 4.500.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 3.405/mês</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 20.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 240.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 6.000.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 4.540/mês</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm">
          Note como o Lean FIRE (R$ 3-5 mil/mês) é viável com aporte de R$ 700-1.200/mês durante 25 anos. Já o Fat FIRE (R$ 20 mil/mês) exige R$ 4.500/mês de aporte, geralmente só viável com renda alta.
        </p>

        <h2>Cenários Reais de Aposentadoria</h2>

        <h3>Cenário 1: Aposentadoria Padrão aos 65</h3>
        <div
          class="brand-card border p-4"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-2">Perfil</h4>
          <ul class="text-sm">
            <li>35 anos hoje, aposentadoria aos 65 (30 anos de acumulação)</li>
            <li>Renda desejada: R$ 8.000/mês (já considerando INSS de R$ 2.500)</li>
            <li>Aporte mensal: R$ 1.800</li>
            <li>Retorno: 10% a.a.</li>
          </ul>
          <div class="mt-3 rounded-lg bg-secondary/20 p-3">
            <p class="text-sm">
              Patrimônio projetado: R$ 4,07 milhões. Patrimônio necessário (regra dos 4%): R$ 1,65 milhão. Plano viável com folga.
            </p>
          </div>
        </div>

        <h3>Cenário 2: Lean FIRE aos 50</h3>
        <div
          class="brand-card border p-4"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-2">Perfil</h4>
          <ul class="text-sm">
            <li>30 anos hoje, aposentadoria aos 50 (20 anos)</li>
            <li>Renda desejada: R$ 4.000/mês (estilo de vida frugal)</li>
            <li>Aporte mensal: R$ 3.000 (50% da renda)</li>
            <li>Retorno: 11% a.a.</li>
          </ul>
          <div class="mt-3 rounded-lg bg-secondary/20 p-3">
            <p class="text-sm">
              Patrimônio projetado: R$ 2,52 milhões. Patrimônio necessário: R$ 1,2 milhão. Aposentadoria antecipada viável.
            </p>
          </div>
        </div>

        <h3>Cenário 3: Fat FIRE aos 45</h3>
        <div
          class="brand-card border p-4"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-2">Perfil</h4>
          <ul class="text-sm">
            <li>30 anos hoje, aposentadoria aos 45 (15 anos)</li>
            <li>Renda desejada: R$ 20.000/mês (alto padrão)</li>
            <li>Aporte mensal: R$ 12.000 (renda alta + side hustles)</li>
            <li>Retorno: 12% a.a.</li>
          </ul>
          <div class="mt-3 rounded-lg bg-secondary/20 p-3">
            <p class="text-sm">
              Patrimônio projetado: R$ 5,49 milhões. Patrimônio necessário: R$ 6 milhões. Quase lá, precisa esticar 2 anos ou aumentar aporte em 15%.
            </p>
          </div>
        </div>

        <h2>Como Usar a Calculadora de Aposentadoria</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Defina sua Idade Atual e Idade de Aposentadoria</h4>
              <p class="text-sm">
                A diferença entre as duas é o tempo de acumulação. Aposentadoria padrão no Brasil é 65 (homem) e 62 (mulher). FIRE costuma ser 45-55. Quanto mais cedo, mais ambicioso o plano.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Defina a Renda Mensal Desejada</h4>
              <p class="text-sm">
                Quanto você quer receber por mês depois de aposentado, em valor de hoje. A calculadora ajusta pela inflação. Pense em 70-90% da sua renda atual como referência.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Calcule o Patrimônio Necessário</h4>
              <p class="text-sm">
                A calculadora aplica a regra dos 4% (ou a taxa que você definir) sobre a renda anual ajustada pela inflação. O resultado é o patrimônio total que você precisa ter ao se aposentar.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Verifique a Viabilidade do Plano</h4>
              <p class="text-sm">
                Com seu aporte mensal e retorno esperado, a calculadora projeta o patrimônio que você terá ao se aposentar e compara com o necessário. Se for menor, mostra o gap e os cenários alternativos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Ajuste o Aporte Mensal</h4>
              <p class="text-sm">
                Se o plano não for viável, aumente o aporte, estenda o tempo até aposentar ou reduza a renda desejada. A calculadora mostra cenários (trabalhar mais 3 anos, aumentar aporte 20%, reduzir renda 20%) pra ajudar na decisão.
              </p>
            </div>
          </div>
        </div>

        <h2>Previdência Privada (PGBL e VGBL) vs Investimentos Diretos</h2>
        <p class="leading-relaxed">
          Previdência privada complementa o INSS e funciona como veículo automatizado de aposentadoria, com débito mensal e benefício fiscal. PGBL e VGBL são os dois principais formatos no Brasil, cada um indicado pra um perfil específico de declaração de Imposto de Renda. Saber qual escolher (e se vale escolher algum) muda bastante o resultado de longo prazo.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">PGBL (Plano Gerador de Benefício Livre)</h4>
            <p class="text-sm">
              Os aportes são dedutíveis da base de cálculo do IR, até 12% da renda bruta tributável anual. No resgate, a tributação incide sobre o TOTAL acumulado (principal + rendimentos). Indicado pra quem declara o IR no modelo COMPLETO e quer reduzir o imposto da fase ativa. Ganho fiscal forte na entrada, custo no resgate.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">VGBL (Vida Gerador de Benefício Livre)</h4>
            <p class="text-sm">
              Os aportes NÃO são dedutíveis. Em compensação, a tributação no resgate incide só sobre os RENDIMENTOS, não sobre o principal. Indicado pra quem declara IR no modelo SIMPLIFICADO ou já estourou o limite de 12% do PGBL. Também é a escolha pra planejamento sucessório, valores não entram em inventário e pagam ITCMD reduzido.
            </p>
          </div>
        </div>
        <p class="leading-relaxed">
          Investir direto em Tesouro IPCA+, FIIs e ações tem custos menores e flexibilidade maior, mas exige disciplina pra manter os aportes. Previdência privada é boa pra quem quer débito automático e benefício fiscal, mas só vale a pena com taxa de administração abaixo de 1% ao ano e fundo com bom histórico.
        </p>

        <MoleculesFAQ
          title="Perguntas Frequentes sobre Aposentadoria"
          :items="faqItems"
        />

        <h2>Dicas para Acelerar sua Aposentadoria</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              1. Aumente a Taxa de Poupança
            </h4>
            <p class="text-sm">
              A variável mais poderosa do FIRE é a taxa de poupança. Cada 5% a mais reduz o tempo até a meta em 2-3 anos. Vale mais que perseguir retorno extra com risco alto.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              2. Reduza Custos Recorrentes
            </h4>
            <p class="text-sm">
              Cortar R$ 500/mês de gasto recorrente equivale a aumentar R$ 500 de aporte. Em 20 anos a 10% a.a., são R$ 380 mil a mais no patrimônio.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              3. Diversifique a Carteira
            </h4>
            <p class="text-sm">
              Carteira balanceada (Tesouro IPCA+, FIIs, ações dividendos, ETFs) entrega 10-12% a.a. com volatilidade administrável. Renda fixa pura é segura demais pra metas longas.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              4. Use Previdência Privada com Cuidado
            </h4>
            <p class="text-sm">
              PGBL e VGBL fazem sentido pra quem aproveita dedução do IR ou perfil agressivo de longo prazo. Mas sempre compare taxa de administração, plano com taxa &gt;1% a.a. quase nunca vale.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              5. Não Subestime a Saúde
            </h4>
            <p class="text-sm">
              Plano de saúde de R$ 800/mês aos 35 vira R$ 3.500/mês aos 65. Calcule isso na renda desejada da aposentadoria, gastos médicos crescem exponencialmente com a idade.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              6. Revise o Plano Anualmente
            </h4>
            <p class="text-sm">
              Aumento salarial, mudança de objetivo, novo filho, herança, crise econômica, todos exigem ajuste no plano. Recalcule pelo menos uma vez por ano e em todo evento de vida relevante.
            </p>
          </div>
        </div>
      </div>

      <!-- Rankings Relacionados -->
      <div
        class="mt-8 flex flex-col gap-4 rounded-lg p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <div>
          <h2>Rankings Relacionados</h2>
          <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
            Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            v-for="r in relatedRankings"
            :key="r.to"
            :to="r.to"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon :name="r.icon" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>{{ r.title }}</h3>
              <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">{{ r.sub }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Calculadoras Relacionadas -->
      <div
        class="flex flex-col gap-4 rounded-lg p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outras Calculadoras</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/quanto-investir"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-wallet" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Quanto Investir por Mês</h3>
              <p class="text-sm">Calcule o aporte para suas metas</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Juros Compostos</h3>
              <p class="text-sm">Simule a evolução do patrimônio</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Autoria e E-E-A-T -->
      <aside
        class="flex flex-col gap-3 rounded-2xl border p-6 md:flex-row md:items-center md:gap-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <div class="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary/20">
          <UIcon name="i-lucide-book-open-check" class="size-7 text-secondary" />
        </div>
        <div class="flex flex-col gap-1 text-sm">
          <p>
            Metodologia revisada pela equipe de análise da {{ brand.name }}
          </p>
          <p>
            Cálculos baseados na regra dos 4% do Trinity Study (1998), na fórmula de anuidade dos juros compostos e em médias históricas do mercado brasileiro (CDI, Ibovespa, IPCA, INPC, INSS). Projeções consideram capitalização mensal, ajuste pela inflação anual e duas fases (acumulação e fruição) com retornos distintos.
          </p>
          <p class="text-xs">
            Fontes: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">Banco Central do Brasil</a>,
            <a href="https://www.gov.br/inss" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">INSS</a>,
            <a href="https://www.ibge.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">IBGE</a>,
            <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">B3</a>.
          </p>
        </div>
      </aside>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Acompanhe seus investimentos pra aposentadoria"
        :description="`Monitore seu progresso rumo à independência financeira na ${brand.name} com análises em tempo real e IA.`"
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver mais calculadoras', to: '/calculadora', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

// Rankings relacionados — pontes pra carteiras de renda passiva e
// dividendos, alvo natural de quem planeja aposentadoria.
const relatedRankings = [
  {
    to: '/ranking/maiores-dividend-yield',
    icon: 'i-lucide-coins',
    title: 'Maiores pagadores de dividendos',
    sub: 'Top 50 ações e FIIs por DY na B3',
  },
  {
    to: '/ranking/buy-and-hold',
    icon: 'i-lucide-shield-check',
    title: 'Carteira Buy and Hold',
    sub: 'Score Redent pra horizonte longo',
  },
] as const

// Data de atualização dinâmica para sinal de frescor pro Google.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// ====================================================================
// Cenarios populares — long-tail SEO via deep-links.
// Cada cenario combina idade+aposentadoria+renda+aporte em uma URL
// canonica que Retirement.vue ja le no mount (via parseNumberParam) e
// dispara o calculo automaticamente. Long-tails miradas:
// "aposentar com 5000 reais", "FIRE Brasil", "regra dos 4%",
// "aposentar aos 50", "renda passiva FIIs aposentadoria".
// ====================================================================
const popularScenarios = [
  { label: 'Aposentar com R$ 5.000/mês', sub: 'Padrão classe média', icon: 'i-lucide-piggy-bank', to: '/calculadora/aposentadoria?age=35&retire=65&income=5000&monthly=1500&rate=10' },
  { label: 'Aposentar com R$ 10.000/mês', sub: 'Renda confortável', icon: 'i-lucide-trending-up', to: '/calculadora/aposentadoria?age=35&retire=65&income=10000&monthly=3000&rate=10' },
  { label: 'Aposentar aos 50 anos', sub: 'FIRE antecipado', icon: 'i-lucide-flame', to: '/calculadora/aposentadoria?age=30&retire=50&income=6000&monthly=4000&rate=11' },
  { label: 'Lean FIRE, R$ 3.000/mês', sub: 'Vida frugal', icon: 'i-lucide-leaf', to: '/calculadora/aposentadoria?age=30&retire=50&income=3000&monthly=2500&rate=11' },
  { label: 'Fat FIRE, R$ 20.000/mês', sub: 'Alto padrão', icon: 'i-lucide-gem', to: '/calculadora/aposentadoria?age=30&retire=45&income=20000&monthly=12000&rate=12' },
  { label: 'Renda passiva FIIs R$ 8.000/mês', sub: 'Foco em dividendos', icon: 'i-lucide-building', to: '/calculadora/aposentadoria?age=35&retire=60&income=8000&monthly=2500&rate=10' },
  { label: 'Aposentar em 20 anos a partir dos 30', sub: 'Plano agressivo', icon: 'i-lucide-rocket', to: '/calculadora/aposentadoria?age=30&retire=50&income=8000&monthly=5000&rate=11' },
  { label: 'Aposentar em 15 anos com aporte agressivo', sub: 'FIRE agressivo', icon: 'i-lucide-zap', to: '/calculadora/aposentadoria?age=35&retire=50&income=10000&monthly=8000&rate=12' },
  { label: 'Complementar INSS R$ 3.000', sub: 'Foco no extra', icon: 'i-lucide-plus-circle', to: '/calculadora/aposentadoria?age=40&retire=65&income=8000&monthly=1200&rate=10&inss=3000' },
  { label: 'FIRE aos 45 com R$ 5k aporte', sub: 'Quem ganha bem', icon: 'i-lucide-sun', to: '/calculadora/aposentadoria?age=30&retire=45&income=8000&monthly=5000&rate=12' },
  { label: 'Aposentar em 10 anos (Fat FIRE)', sub: 'Curto prazo extremo', icon: 'i-lucide-trophy', to: '/calculadora/aposentadoria?age=40&retire=50&income=15000&monthly=15000&rate=12' },
  { label: 'Calcular meta com 4% de saque seguro', sub: 'Regra dos 4%', icon: 'i-lucide-percent', to: '/calculadora/aposentadoria?age=35&retire=60&income=6000&monthly=2000&rate=10&withdrawal=4' },
  { label: 'Aposentar com previdência privada (PGBL)', sub: 'Aporte com benefício fiscal', icon: 'i-lucide-shield', to: '/calculadora/aposentadoria?age=35&retire=60&income=8000&monthly=2000&rate=10' },
] as const

// FAQs duplicados aqui pra manter a fonte unica entre o HTML
// (renderizado nos `<details>`) e o FAQPage schema (mainEntity).
const faqItems = [
  {
    question: 'Quanto preciso acumular para me aposentar?',
    answer: 'Use a regra dos 4%: multiplique sua despesa mensal desejada por 300. Para R$ 5.000/mês, você precisa de R$ 1,5 milhão. Para R$ 10.000/mês, R$ 3 milhões. Para R$ 20.000/mês (Fat FIRE), R$ 6 milhões. Ajuste pelo INSS que vai receber e considere a inflação acumulada até a aposentadoria, pode ser que R$ 5.000 daqui a 25 anos exija renda nominal de R$ 12.000 pra preservar o poder de compra.',
  },
  {
    question: 'É possível se aposentar aos 40 ou 45 anos no Brasil (FIRE)?',
    answer: 'Sim, mas exige disciplina extrema e algumas condições. Você precisa: 1) Poupar 50-70% da renda durante 15-20 anos, 2) Começar cedo (idealmente aos 22-25 anos), 3) Ter renda alta ou múltiplas fontes (side hustles, freelas), 4) Investir bem (carteira diversificada com 11-12% a.a.), 5) Viver de forma frugal e estabelecer um padrão sustentável pro resto da vida. É desafiador mas comprovadamente viável, há comunidade FIRE crescente no Brasil.',
  },
  {
    question: 'Devo contar com o INSS no planejamento da aposentadoria?',
    answer: 'Depende muito da sua idade. Se você tem 45+ anos e contribui regularmente há 20+ anos, pode contar com INSS como complemento confiável (R$ 1.500-7.500 dependendo do salário de contribuição). Se tem 25-40 anos, seja conservador, o sistema previdenciário brasileiro pode mudar muito até você se aposentar (idade mínima, fator previdenciário, alíquotas). Trate o INSS como bônus de R$ 1.000-3.000/mês, não como pilar do seu plano.',
  },
  {
    question: 'O que é a regra dos 4% (Safe Withdrawal Rate)?',
    answer: 'A regra dos 4% diz que você pode sacar 4% do seu patrimônio inicial por ano, corrigido pela inflação, com altíssima probabilidade (95%+) do dinheiro durar 30+ anos. Vem do Trinity Study (1998), que analisou dados históricos do mercado americano. Quem é mais conservador usa 3,5% (multiplicar despesa anual por ~285). Quem aceita mais risco de erosão usa 5% (multiplicar por 240). No Brasil, com taxa real de juros mais alta, a regra é até mais segura.',
  },
  {
    question: 'Qual a taxa de retirada segura no Brasil?',
    answer: 'A regra clássica é 4% (Trinity Study, EUA). No Brasil, com Selic real historicamente maior, autores defendem 5% a 6% pra horizonte de 25 a 30 anos. Pra FIRE longo (40+ anos de retirada), use 3,5% pra ter mais segurança. Importante: 4% é sobre o saldo INICIAL, ajustado por inflação a cada ano, não recalculado sobre o saldo do ano corrente. Reavalie a SWR a cada 3 a 5 anos conforme o ambiente macro mudar.',
  },
  {
    question: 'PGBL ou VGBL para aposentadoria?',
    answer: 'PGBL se você declara o IR completo, pode deduzir até 12% da renda bruta tributável (benefício fiscal forte na fase de aporte). VGBL se você declara simplificada OU quer planejamento sucessório (não entra em inventário, paga ITCMD reduzido). PGBL tributa sobre o TOTAL resgatado, VGBL só sobre os rendimentos. Tabela regressiva (10 anos = 10% de IR final) compensa muito a longo prazo. Em ambos, fuja de planos com taxa de administração acima de 1% ao ano.',
  },
  {
    question: 'Qual a diferença entre Lean FIRE, Regular FIRE e Fat FIRE?',
    answer: 'Lean FIRE: aposentar com renda mínima e estilo frugal (R$ 3-4 mil/mês, patrimônio R$ 900 mil a R$ 1,2 milhão). Regular FIRE: padrão médio de classe média (R$ 6-10 mil/mês, R$ 1,8 a 3 milhões de patrimônio). Fat FIRE: alto padrão de vida com folga (R$ 20 mil+/mês, R$ 6 milhões+ de patrimônio). A escolha depende do seu padrão atual, expectativas e quanto sacrifício você aceita na fase de acumulação.',
  },
  {
    question: 'Como a inflação afeta o planejamento de aposentadoria?',
    answer: 'A inflação corrói brutalmente o poder de compra ao longo de 20-30 anos. Com inflação anual de 4,5% (média histórica brasileira), R$ 5.000 hoje viram R$ 16.500 em 25 anos só pra manter o mesmo padrão. Por isso a calculadora ajusta a renda desejada pela inflação até a aposentadoria, e em fase de fruição calcula o saque crescente nominal pra preservar o real. Sempre pense em renda real, não nominal.',
  },
  {
    question: 'Por que retorno na acumulação é diferente do retorno na fruição?',
    answer: 'Na acumulação você pode ter carteira mais agressiva (60% renda variável, 40% renda fixa) com retorno esperado de 10-12% a.a., porque tem 20-30 anos pra absorver volatilidade. Na fruição (já aposentado), prioridade é preservação de capital e renda estável, então a carteira fica mais conservadora (30% renda variável, 70% renda fixa) com retorno menor (5-8% a.a.). A calculadora separa as duas fases pra projetar com mais realismo.',
  },
  {
    question: 'Vale a pena ter previdência privada (PGBL/VGBL)?',
    answer: 'Em casos específicos: PGBL faz sentido pra quem declara IR no modelo completo e quer reduzir base tributária no presente (até 12% da renda bruta). VGBL é melhor pra quem usa modelo simplificado ou já estourou o limite do PGBL. Em ambos, fuja de planos com taxa de administração acima de 1% a.a., a maioria entrega rendimento pior que Tesouro Direto comprado direto. Compare sempre o líquido após taxa.',
  },
  {
    question: 'Quanto preciso poupar por mês pra aposentar com R$ 5.000/mês?',
    answer: 'Depende do prazo: Em 30 anos a 10% a.a. (do zero), você precisa aportar R$ 745/mês. Em 25 anos, R$ 1.135/mês. Em 20 anos, R$ 1.973/mês. Em 15 anos, R$ 3.601/mês. Em 10 anos, R$ 7.221/mês. Note como cada década adicional reduz o aporte em 40-50%. Quem começa cedo tem vantagem desproporcional sobre quem começa tarde.',
  },
  {
    question: 'É melhor focar em acumular ou em renda passiva imediata (FIIs)?',
    answer: 'Depende do seu prazo e perfil. Quem tem 20+ anos pra aposentar deve focar em acumulação total (juros compostos sobre o patrimônio inteiro). Quem está perto da aposentadoria ou já aposentado deve gradualmente migrar pra ativos pagadores de renda (FIIs, ações dividendos, Tesouro IPCA+). Estratégia híbrida: 70% acumulação durante 20-30 anos, depois rebalanceia pra 50-50 nos últimos 5 anos antes de parar de trabalhar.',
  },
  {
    question: 'O que faço se a calculadora mostrar que meu plano não é viável?',
    answer: 'Você tem 5 alavancas: 1) Aumentar aporte mensal (revisão do orçamento, side hustle), 2) Estender prazo até aposentar (trabalhar 3-5 anos a mais reduz drasticamente o aporte exigido), 3) Reduzir renda desejada (Fat FIRE para Regular, Regular para Lean), 4) Buscar maior retorno (carteira mais agressiva, com mais risco), 5) Aumentar a renda atual (promoção, mudança de carreira, empreendedorismo). A calculadora mostra os 3 cenários alternativos pra ajudar a escolher.',
  },
  {
    question: 'Como compartilhar uma simulação específica de aposentadoria?',
    answer: `Basta copiar a URL com os parâmetros: ${brand.url || 'https://redentia.com.br'}/calculadora/aposentadoria?age=30&retire=55&income=8000&monthly=4000&rate=11 já abre a calculadora preenchida e calcula automaticamente. Útil pra mandar para o cônjuge, planejador financeiro ou salvar diferentes cenários (otimista, realista, pessimista) nos favoritos.`,
  },
] as const

const pageTitle = `Calculadora de Aposentadoria 2026 - Grátis | ${brand.name}`
const pageDescription =
  'Calcule quanto investir para se aposentar com R$ 5.000, R$ 10.000 ou R$ 20.000/mês. PGBL, VGBL, regra dos 4%, FIRE, INSS. Grátis.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/aposentadoria',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Aposentadoria', path: '/calculadora/aposentadoria' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de Aposentadoria ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento de aposentadoria',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de aposentadoria com regra dos 4% (Safe Withdrawal Rate), considerando idade, expectativa de vida, INSS, ajuste pela inflação e duas fases (acumulação e fruição). Projeta viabilidade do plano, duração do patrimônio e cenários FIRE (Lean, Regular, Fat). Deep-link compartilhável.',
      featureList: [
        'Cálculo do patrimônio necessário com regra dos 4%',
        'Suporte a Lean FIRE, Regular FIRE e Fat FIRE',
        'Considera INSS, expectativa de vida e ajuste pela inflação',
        'Duas fases de retorno: acumulação e fruição',
        'Cenários alternativos (trabalhar 3 anos a mais, aumentar aporte 20%, reduzir renda 20%)',
        'Cálculo de duração do patrimônio na aposentadoria',
        'Análise de viabilidade em tempo real',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (Aposentar aos 50, Fat FIRE, Lean FIRE)',
        'Pt-BR com formatação brasileira e contexto local',
      ],
      about: [
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
      ],
    },
    // FAQPage schema é emitido pelo <MoleculesFAQ> via useHead — fonte unica.
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>
