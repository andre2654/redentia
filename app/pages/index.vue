<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <h1 class="sr-only">
      Redentia: invista em ações e fundos imobiliários com IA
    </h1>
    <!-- CTA Section -->
    <section v-if="!authStore.isAuthenticated">
      <div
        class="from-secondary/20 relative overflow-hidden bg-gradient-to-br to-transparent px-6 py-14 text-center text-white md:rounded-3xl"
      >
        <div class="relative">
          <IconLogoFull class="mx-auto mb-10 h-9 fill-white md:h-12" />
          <h2
            class="mb-3 text-xl font-semibold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl"
          >
            Pronto para começar a investir melhor?
          </h2>
          <p
            class="mb-6 px-2 text-base leading-relaxed text-gray-300 sm:text-lg md:mb-8 md:text-xl"
          >
            Crie sua conta gratuitamente e tenha acesso a todas as ferramentas
          </p>
          <div class="flex items-center justify-center gap-2">
            <UButton
              to="/auth/register"
              color="secondary"
              size="xl"
              icon="i-lucide-user-plus"
              class="hover:shadow-secondary/50 w-full px-4 text-sm transition-all hover:scale-110 hover:shadow-2xl sm:w-auto sm:px-6"
              :ui="{
                leadingIcon: 'max-md:hidden',
              }"
            >
              Criar Conta Grátis
            </UButton>
            <UButton
              to="/auth/login"
              color="white"
              variant="outline"
              size="xl"
              icon="i-lucide-log-in"
              class="hover:shadow-secondary/50 w-full px-4 text-sm transition-all hover:scale-110 hover:shadow-2xl sm:w-auto sm:px-6"
              :ui="{
                leadingIcon: 'max-md:hidden',
              }"
            >
              Já tenho conta
            </UButton>
          </div>
          <p class="mt-4 text-xs text-gray-400 md:mt-6 md:text-sm">
            Sem taxa de inscrição • Cancele quando quiser • Suporte 24/7
          </p>
        </div>
      </div>
    </section>

    <AtomsTickerCarousel
      class="mt-5 w-full max-md:hidden"
      big
      no-control
      :items="tickerCarouselItems"
    />
    <AtomsTickerCarousel
      class="mt-5 w-full md:hidden"
      no-control
      :items="tickerCarouselItems"
    />

    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col gap-8">
        <div v-if="!authStore.isAuthenticated" class="text-center">
          <h2
            class="my-8 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl"
          >
            Acompanhe o Mercado em Tempo Real
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Dados atualizados de ações, FIIs e muito mais
          </p>
        </div>

        <div class="flex flex-col gap-4 px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-lg shadow-blue-500/50 md:h-3 md:w-3"
              />
              <span
                class="text-xs font-medium uppercase tracking-wider text-green-400 md:text-sm"
                >Ao Vivo</span
              >
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex flex-col gap-2">
              <h3
                class="font-regular mb-1 flex items-center gap-2 text-xl text-white md:mb-2 md:text-2xl"
              >
                IBOVESPA
              </h3>
              <p
                class="mb-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl md:text-5xl"
              >
                {{ ibovIndicator }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3
                class="font-regular mb-1 flex items-center gap-2 text-xl text-white md:mb-2 md:text-2xl"
              >
                IFIX
              </h3>
              <p
                class="mb-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl md:text-5xl"
              >
                {{ ifixIndicator }}
              </p>
            </div>
          </div>
        </div>

        <MoleculesSearchAssets
          class="w-full rounded-none bg-white/10 py-4 md:rounded-full"
        />
      </div>

      <div class="flex w-full flex-col">
        <div class="flex w-full items-center justify-between p-6 pb-0">
          <div class="flex flex-col gap-4">
            <h2 class="text-[30px] font-semibold">
              {{
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(ibovLastPrice)
              }}
            </h2>
            <p class="mb-4 opacity-70">Cotação do IBOV</p>
          </div>
          <MoleculesPeriodSelector
            v-model="selectedTimeRange"
            :loading="loading"
          />
        </div>
        <AtomsGraphLine
          :data="ibovChartData"
          :legend="ibovChartLabel"
          :height="350"
          :loading="loading"
        />
      </div>

      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Rankings</h2>
        <p class="text-[13px] font-extralight">
          Veja os destaques de altas e baixas do dia. Ative o mapa para
          visualizar o desempenho por setor.
        </p>
        <label
          for="map-toggle"
          class="hover:bg-secondary/10 mt-3 flex max-w-fit items-center justify-between gap-4 rounded-full border px-3 py-2 transition"
          :class="{
            'bg-tertiary/60 !border-tertiary': showMap,
          }"
        >
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-secondary select-none">Mostrar mapa</h2>
          <USwitch
            id="map-toggle"
            v-model="showMap"
            color="secondary"
            checked-icon="lucide-check"
            :ui="{ base: 'data-[state=checked]:border-secondary' }"
          />
        </label>
      </div>

      <div v-if="showMap" class="mb-6 flex flex-col">
        <UButtonGroup
          orientation="horizontal"
          variant="soft"
          class="mx-auto mb-5 mt-6 max-md:px-6"
        >
          <UButton
            color="neutral"
            :variant="treemapFilter === 'all' ? 'soft' : 'link'"
            label="Todos"
            @click="treemapFilter = 'all'"
          />
          <UButton
            color="neutral"
            :variant="treemapFilter === 'positive' ? 'soft' : 'link'"
            label="Altas"
            @click="treemapFilter = 'positive'"
          />
          <UButton
            color="neutral"
            :variant="treemapFilter === 'negative' ? 'soft' : 'link'"
            label="Baixas"
            @click="treemapFilter = 'negative'"
          />
        </UButtonGroup>
        <AtomsGraphTreemap
          :data="stocksData"
          :height="550"
          :show-positive="
            treemapFilter === 'all' || treemapFilter === 'positive'
          "
          :show-negative="
            treemapFilter === 'all' || treemapFilter === 'negative'
          "
        />
      </div>
      <template v-else>
        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4' }"
        >
          <div class="flex w-full flex-col gap-3 rounded-[30px] py-6">
            <h2 class="text-[25px] font-bold max-md:text-center md:text-[18px]">
              {{ item.label }}
            </h2>
            <p class="mx-auto mb-5 text-[16px] opacity-70 md:hidden">
              Maiores altas
            </p>
            <div class="flex flex-col gap-1 overflow-hidden rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
              class="text-[20px] transition hover:underline max-md:text-center md:text-[15px]"
            >
              Ver todos
            </NuxtLink>
          </div>
        </UCarousel>

        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4' }"
        >
          <div class="flex w-full flex-col gap-3 rounded-[30px] py-6">
            <h2 class="text-[25px] font-bold max-md:text-center md:text-[18px]">
              {{ item.label }}
            </h2>
            <p class="mx-auto mb-5 text-[16px] opacity-70 md:hidden">
              Maiores baixas
            </p>
            <div class="flex flex-col gap-1 overflow-hidden rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{
                path: '/search',
                query: rankingLinkQueries.bottom[item.key],
              }"
              class="text-[20px] transition hover:underline max-md:text-center md:text-[15px]"
            >
              Ver todos
            </NuxtLink>
          </div>
        </UCarousel>
      </template>

      <div
        class="text-secondary bg-tertiary/40 flex w-full flex-col gap-3 px-6 py-4 md:rounded-[30px]"
      >
        <div class="flex items-center gap-2 px-3 py-2">
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-lg font-semibold">Filtros inteligentes</h2>
        </div>
        <div class="flex w-full flex-wrap gap-3 px-6 max-md:flex-col">
          <NuxtLink
            :to="{ path: '/search', query: { p_max: 20 } }"
            class="hover:underline"
          >
            Preço até R$ 20
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { mc_max: 2000000000 } }"
            class="hover:underline"
          >
            Small Caps (MC ≤ R$ 2 bi)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_min: 0 } }"
            class="hover:underline"
          >
            Alta no dia (> 0%)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_max: 0 } }"
            class="hover:underline"
          >
            Queda no dia (< 0%)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, bdr: 0 } }"
            class="hover:underline"
          >
            Somente FIIs
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, reit: 0 } }"
            class="hover:underline"
          >
            Somente BDRs
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { p_min: 10, p_max: 50 } }"
            class="hover:underline"
          >
            Preço entre R$ 10 e R$ 50
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Seção Invista por Categoria -->
    <section class="mt-12 px-6">
      <div class="flex flex-col gap-6">
        <div class="text-center">
          <h2 class="mb-2 text-2xl font-bold md:text-3xl">
            Invista agora
          </h2>
          <p class="text-sm text-gray-400 md:text-base">
            Guias completos, estratégias e análises para cada tipo de ativo
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Ações -->
          <NuxtLink
            to="/acoes"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-trending-up" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">Ações</h3>
            </div>
            <p class="text-sm text-gray-400">
              Invista nas maiores empresas do Brasil. Potencial de crescimento e
              dividendos.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar ações</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- FIIs -->
          <NuxtLink
            to="/fiis"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-building-2" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">FIIs</h3>
            </div>
            <p class="text-sm text-gray-400">
              Renda passiva mensal com fundos imobiliários. Dividendos isentos de
              IR.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar FIIs</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- ETFs -->
          <NuxtLink
            to="/etfs"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-bar-chart-3" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">ETFs</h3>
            </div>
            <p class="text-sm text-gray-400">
              Diversificação instantânea. Invista no Ibovespa e S&P 500 com um
              clique.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar ETFs</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- Small Caps -->
          <NuxtLink
            to="/small-caps"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-rocket" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">
                Small Caps
              </h3>
            </div>
            <p class="text-sm text-gray-400">
              Empresas pequenas com alto potencial de crescimento. Risco maior,
              retorno maior.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar small caps</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- Dividendos -->
          <NuxtLink
            to="/dividendos"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">
                Dividendos
              </h3>
            </div>
            <p class="text-sm text-gray-400">
              Construa renda passiva mensal. Descubra os melhores pagadores de
              dividendos.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar dividendos</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- BDRs -->
          <NuxtLink
            to="/search?group=bdrs"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-globe" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">BDRs</h3>
            </div>
            <p class="text-sm text-gray-400">
              Invista em empresas estrangeiras (Apple, Google, Amazon) em reais.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar BDRs</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Seção Blog / Guias Educacionais -->
    <section class="mt-12 px-6">
      <div class="flex flex-col gap-8">
        <div class="text-center">
          <div class="mb-3 flex items-center justify-center gap-2">
            <UIcon name="i-lucide-newspaper" class="text-secondary h-6 w-6" />
          </div>
          <h2 class="mb-2 text-2xl font-bold md:text-3xl">
            Aprenda a investir
          </h2>
          <p class="text-sm text-gray-400 md:text-base">
            Guias completos, tutoriais práticos e análises para dominar o mercado financeiro
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MoleculesBlogCard
            titulo="Como Investir em Ações"
            descricao="Guia completo para iniciantes começarem a investir na bolsa de valores. Aprenda desde a abertura de conta até estratégias avançadas de investimento."
            to="/guias/como-investir-em-acoes-para-iniciantes"
            icon="i-lucide-trending-up"
            categoria="Ações"
            data="4 Jan 2026"
            :tempo-leitura="8"
          />

          <MoleculesBlogCard
            titulo="Melhores FIIs 2026"
            descricao="Fundos imobiliários mais promissores para este ano. Análise completa de segmentos, indicadores e estratégias para construir sua carteira ideal."
            to="/guias/melhores-fiis-para-investir-em-2026"
            icon="i-lucide-building-2"
            categoria="FIIs"
            data="4 Jan 2026"
            :tempo-leitura="10"
          />

          <MoleculesBlogCard
            titulo="Calculadora de Dividendos"
            descricao="Aprenda a calcular quanto investir para atingir sua meta de renda passiva. Fórmulas, exemplos práticos e estratégias de reinvestimento."
            to="/guias/calculadora-de-dividendos"
            icon="i-lucide-coins"
            categoria="Dividendos"
            data="4 Jan 2026"
            :tempo-leitura="7"
          />

          <MoleculesBlogCard
            titulo="Análise PETR4"
            descricao="Vale a pena investir em Petrobras? Análise fundamentalista completa com riscos, oportunidades e perspectivas para 2026."
            to="/guias/analise-petr4-vale-a-pena-investir"
            icon="i-lucide-chart-line"
            categoria="Análises"
            data="4 Jan 2026"
            :tempo-leitura="12"
          />

          <MoleculesBlogCard
            titulo="Small Caps: Guia Completo"
            descricao="Tudo sobre ações de pequenas empresas: como escolher, riscos envolvidos e estratégias para maximizar retornos com small caps."
            to="/guias/small-caps-guia-completo"
            icon="i-lucide-rocket"
            categoria="Ações"
            data="4 Jan 2026"
            :tempo-leitura="9"
          />

          <MoleculesBlogCard
            titulo="Calculadora de Juros Compostos"
            descricao="Simule quanto seus investimentos renderão com juros compostos. Ferramenta gratuita com gráficos e projeções detalhadas."
            to="/calculadora/juros-compostos"
            icon="i-lucide-trending-up"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Simulador de Ações"
            descricao="Descubra quanto você teria ganho investindo em ações da B3. Dados históricos reais com dividendos reinvestidos."
            to="/calculadora/acoes"
            icon="i-lucide-chart-line"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Planejamento Patrimonial"
            descricao="Calcule quanto investir para atingir suas metas financeiras. Receba carteira recomendada personalizada."
            to="/calculadora/planejamento"
            icon="i-lucide-target"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Preço Teto: Graham e Bazin"
            descricao="Descubra se uma ação está barata ou cara usando as fórmulas de Benjamin Graham e Décio Bazin."
            to="/calculadora/preco-teto"
            icon="i-lucide-target"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Calculadora de Aposentadoria"
            descricao="Planeje sua aposentadoria ou FIRE. Calcule quanto precisa investir considerando INSS e inflação."
            to="/calculadora/aposentadoria"
            icon="i-lucide-piggy-bank"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Dividend Yield"
            descricao="Calcule DY atual, projetado e on cost. Encontre as melhores ações e FIIs pagadores de dividendos."
            to="/calculadora/dividend-yield"
            icon="i-lucide-coins"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="4"
          />

          <MoleculesBlogCard
            titulo="Quanto Investir por Mês"
            descricao="Descubra quanto você precisa investir mensalmente para atingir qualquer meta financeira."
            to="/calculadora/quanto-investir"
            icon="i-lucide-wallet"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="4"
          />

          <MoleculesBlogCard
            titulo="Imposto de Renda sobre Ações"
            descricao="Calcule IR de swing trade e day trade. Gere DARF e compense prejuízos corretamente."
            to="/calculadora/imposto-renda"
            icon="i-lucide-receipt-text"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="4"
          />

          <!-- Card CTA para ver todos -->
          <NuxtLink
            to="/guias"
            class="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-8 transition-all hover:border-secondary/50 hover:from-secondary/20"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/30">
              <UIcon name="i-lucide-book-open" class="text-secondary h-7 w-7" />
            </div>
            <div class="text-center">
              <h3 class="mb-2 text-xl font-bold group-hover:text-secondary">
                Ver todos os guias
              </h3>
              <p class="text-sm text-gray-400">
                Mais conteúdo educacional sobre investimentos
              </p>
            </div>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-2"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="!authStore.isAuthenticated" class="mt-20">
      <div class="w-full">
        <div class="mb-8 text-center md:mb-12">
          <div class="mb-3 flex items-center justify-center gap-2 md:mb-4">
            <IconAi class="fill-secondary h-8 md:h-12" />
          </div>
          <h2
            class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl"
          >
            Assessoria com Inteligência Artificial
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Tire dúvidas, compare ativos e receba análises personalizadas
          </p>
        </div>

        <div class="relative w-full">
          <div
            v-if="blockChat"
            class="absolute inset-0 left-0 top-0 z-10 flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-black/60 p-4 backdrop-blur-md transition-all hover:bg-black/70 md:rounded-3xl"
            @click="redirectToLogin('chat')"
          >
            <div class="transform text-center transition-all hover:scale-105">
              <div class="relative mb-4 md:mb-6">
                <div class="absolute inset-0 animate-ping opacity-20">
                  <IconAi class="fill-secondary mx-auto h-12 md:h-16" />
                </div>
                <IconAi class="fill-secondary relative mx-auto h-12 md:h-16" />
              </div>
              <h3
                class="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl"
              >
                Converse com nossa IA
              </h3>
              <p
                class="mb-4 px-2 text-sm leading-relaxed text-gray-300 sm:text-base md:mb-6"
              >
                Faça login e tenha acesso ilimitado à assessoria inteligente
              </p>
              <UButton
                to="/auth/login"
                color="secondary"
                size="xl"
                icon="i-lucide-message-circle"
                class="hover:shadow-secondary/50 w-full px-6 transition-all hover:scale-110 hover:shadow-2xl sm:w-auto sm:px-8"
              >
                Acessar Assessoria
              </UButton>
              <p class="mt-3 text-xs text-gray-400 md:mt-4 md:text-sm">
                Respostas instantâneas • Análises personalizadas
              </p>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl md:rounded-3xl md:p-8"
            @click="handleChatCardClick"
          >
            <div class="mb-6 flex flex-col items-center gap-4">
              <h3 class="text-center text-2xl text-white">
                Faça alguma pergunta
              </h3>
              <p class="text-center text-[13px] font-light text-gray-400">
                Tire dúvidas sobre investimentos, compare ativos e peça análises
                em linguagem simples.
              </p>
            </div>

            <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              <div
                v-for="(suggestion, idx) in chatSuggestions"
                :key="idx"
                class="flex h-[120px] items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-3 text-[13px] font-medium opacity-70 transition-all hover:from-white/20 hover:opacity-100"
              >
                {{ suggestion }}
              </div>
            </div>

            <div class="space-y-4 opacity-60">
              <div class="flex items-start gap-3">
                <IconLogo class="mt-1 w-6 flex-shrink-0 fill-white" />
                <div class="flex-1 rounded-lg bg-white/5 p-4 backdrop-blur">
                  <p class="text-sm text-white">
                    Olá! Sou a assistente virtual da Redentia. Como posso ajudar
                    você hoje?
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 w-full rounded-lg bg-black/20 p-4 backdrop-blur">
              <UTextarea
                placeholder="Faça qualquer pergunta..."
                size="md"
                :rows="2"
                disabled
                class="w-full"
                :ui="{
                  base: 'text-[14px] bg-transparent hover:!bg-transparent focus:!bg-transparent focus-visible:!bg-transparent ring-0 !border-0 !shadow-none placeholder:text-white/40',
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import type { ChartTimeRange } from '~/types/chart'

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || 'https://www.redentia.com.br'
  return url.endsWith('/') ? url.slice(0, -1) : url
})
const canonicalUrl = computed(() => `${siteUrl.value}/`)
const metaDescription =
  'Use a Redentia para investir com inteligência: acompanhe ações, FIIs e índices em tempo real, receba análises com IA e utilize calculadoras avançadas.'
const navigationLinks = computed(() => [
  {
    name: 'Assessoria com IA',
    url: `${siteUrl.value}/help`,
  },
  {
    name: 'Calculadora de juros compostos',
    url: `${siteUrl.value}/calculadora`,
  },
  {
    name: 'Todas as ações',
    url: `${siteUrl.value}/search?group=stocks`,
  },
  {
    name: 'Todos os FIIs',
    url: `${siteUrl.value}/search?group=reits`,
  },
  {
    name: 'PETR4',
    url: `${siteUrl.value}/asset/petr4`,
  },
  {
    name: 'BBAS3',
    url: `${siteUrl.value}/asset/bbas3`,
  },
])

usePageSeo({
  title: 'Redentia: invista em ações e fundos imobiliários com IA',
  description: metaDescription,
  path: '/',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Redentia',
      url: siteUrl.value,
      logo: `${siteUrl.value}/512x512.png`,
      sameAs: [
        'https://www.instagram.com/redentia.app',
        'https://twitter.com/redentia_app',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'contato@redentia.com.br',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Redentia',
      url: siteUrl.value,
      description: metaDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl.value}/search?globalFilter={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Navegação principal da Redentia',
      itemListElement: navigationLinks.value.map((item, index) => ({
        '@type': 'SiteNavigationElement',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  ],
})

const {
  getTopStocks,
  getTopETFs,
  getTopReits,
  getTopBDRs,
  getIndiceHistoricPrices,
} = useAssetsService()

const selectedTimeRange = ref<ChartTimeRange>('month')
const showMap = ref(false)
const loading = ref(true)
const blockChat = ref(false)
const treemapFilter = ref<'all' | 'positive' | 'negative'>('all')

const rankingLinkQueries = {
  top: {
    stocks: { ch_min: 0, group: 'stocks', reit: 0, bdr: 0 },
    etfs: { ch_min: 0, group: 'etfs', reit: 0, bdr: 0 },
    reits: { ch_min: 0, group: 'reits', stock: 0, bdr: 0 },
    bdrs: { ch_min: 0, group: 'bdrs', stock: 0, reit: 0 },
  },
  bottom: {
    stocks: { ch_max: 0, group: 'stocks', reit: 0, bdr: 0 },
    etfs: { ch_max: 0, group: 'etfs', reit: 0, bdr: 0 },
    reits: { ch_max: 0, group: 'reits', stock: 0, bdr: 0 },
    bdrs: { ch_max: 0, group: 'bdrs', stock: 0, reit: 0 },
  },
} as const

const assetCategories = [
  { key: 'stocks', label: 'Ações' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'reits', label: 'Reits' },
  { key: 'bdrs', label: 'BDRs' },
] as const

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}

interface TreemapEntry {
  symbol: string
  name: string
  price: number
  change: number
  category: 'acoes' | 'fiis'
}

interface RankingBucket {
  stocks: IAsset[]
  etfs: IAsset[]
  reits: IAsset[]
  bdrs: IAsset[]
}

interface HomeMarketData {
  rankings: {
    top: RankingBucket
    bottom: RankingBucket
  }
  treemap: TreemapEntry[]
  ibovSeries: IndiceData[]
  ifixSeries: IndiceData[]
}

const stocksData = ref<TreemapEntry[]>([])
const { requestPermission, token: fcmToken } = useFirebaseNotifications()

const topAssets = ref<{
  top: RankingBucket
  bottom: RankingBucket
}>({
  top: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
  bottom: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
})

const RANKING_LIMIT = 8
const TREEMAP_LIMIT = 200

// Removido o await - agora carrega de forma não-bloqueante
const { data: homeMarketData } = useAsyncData<HomeMarketData>(
  'home-market-data',
  async () => {
    const [
      [topStocks, bottomStocks],
      [topETFs, bottomETFs],
      [topReits, bottomReits],
      [topBDRs, bottomBDRs],
      ibovSeries,
      ifixSeries,
    ] = await Promise.all([
      Promise.all([
        getTopStocks('top', 1000000),
        getTopStocks('bottom', 1000000),
      ]),
      Promise.all([getTopETFs('top', 1000000), getTopETFs('bottom', 1000000)]),
      Promise.all([
        getTopReits('top', 1000000),
        getTopReits('bottom', 1000000),
      ]),
      Promise.all([getTopBDRs('top', 1000000), getTopBDRs('bottom', 1000000)]),
      getIndiceHistoricPrices('ibov', '1mo'),
      getIndiceHistoricPrices('ifix', '1mo'),
    ])

    const clamp = (items: IAsset[] = []) =>
      Array.isArray(items) ? items.slice(0, RANKING_LIMIT) : []

    return {
      rankings: {
        top: {
          stocks: clamp(topStocks),
          etfs: clamp(topETFs),
          reits: clamp(topReits),
          bdrs: clamp(topBDRs),
        },
        bottom: {
          stocks: clamp(bottomStocks),
          etfs: clamp(bottomETFs),
          reits: clamp(bottomReits),
          bdrs: clamp(bottomBDRs),
        },
      },
      treemap: buildTreemapDataset(
        topStocks,
        bottomStocks,
        topReits,
        bottomReits
      ),
      ibovSeries: Array.isArray(ibovSeries) ? ibovSeries : [],
      ifixSeries: Array.isArray(ifixSeries) ? ifixSeries : [],
    }
  }
)

interface IndiceData {
  name: string
  market_price: number
  price_at: string
}

const ibovChartData = ref<ChartPoint[]>([])
const ibovIndicator = ref('+0,00%')
const ibovLastPrice = ref(0)
const ifixIndicator = ref('+0,00%')

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

const tickerCarouselItems = computed(() =>
  topAssets.value.top.stocks.slice(0, 40).map((asset) => ({
    logo: asset.logo || '/default-logo.png',
    ticker: asset.ticker,
    change: `${coerceNumber(asset.change_percent ?? asset.change).toFixed(2)}%`,
  }))
)

watchEffect(() => {
  const payload = homeMarketData.value
  if (!payload) return

  topAssets.value = payload.rankings
  stocksData.value = payload.treemap

  updateIndicatorsFromSeries(payload.ibovSeries, payload.ifixSeries)

  if (!ibovChartData.value.length && payload.ibovSeries.length) {
    ibovChartData.value = mapIndiceSeries(payload.ibovSeries)
    loading.value = false
  }
})

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapIndiceSeries(data: IndiceData[]): ChartPoint[] {
  return data.map((item) => ({
    date: item.price_at,
    value: coerceNumber(item.market_price),
    timestamp: new Date(item.price_at).getTime(),
  }))
}

function calculateSeriesStats(series?: IndiceData[]) {
  if (!Array.isArray(series) || series.length < 2) return null
  const lastPrice = coerceNumber(series[series.length - 1].market_price)
  const previousPrice = coerceNumber(series[series.length - 2].market_price)
  if (previousPrice === 0) return null
  const variation = ((lastPrice - previousPrice) / previousPrice) * 100
  return { lastPrice, variation }
}

function formatVariation(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function updateIndicatorsFromSeries(
  ibovSeries: IndiceData[],
  ifixSeries: IndiceData[]
) {
  const ibovStats = calculateSeriesStats(ibovSeries)
  if (ibovStats) {
    ibovLastPrice.value = ibovStats.lastPrice
    ibovIndicator.value = formatVariation(ibovStats.variation)
  }

  const ifixStats = calculateSeriesStats(ifixSeries)
  if (ifixStats) {
    ifixIndicator.value = formatVariation(ifixStats.variation)
  }
}

function buildTreemapDataset(
  topStocks: IAsset[] = [],
  bottomStocks: IAsset[] = [],
  topReits: IAsset[] = [],
  bottomReits: IAsset[] = []
): TreemapEntry[] {
  const limitPerGroup = Math.max(1, Math.floor(TREEMAP_LIMIT / 4))
  const dataset: TreemapEntry[] = []

  const pushAssets = (items: IAsset[], category: 'acoes' | 'fiis') => {
    if (!Array.isArray(items)) return
    items.slice(0, limitPerGroup).forEach((asset) => {
      if (!asset?.ticker) return
      dataset.push({
        symbol: asset.ticker,
        name: asset.name,
        price: coerceNumber(asset.market_price ?? asset.close),
        change: coerceNumber(asset.change_percent ?? asset.change),
        category,
      })
    })
  }

  pushAssets(topStocks, 'acoes')
  pushAssets(bottomStocks, 'acoes')
  pushAssets(topReits, 'fiis')
  pushAssets(bottomReits, 'fiis')

  return dataset
}

function handleChatCardClick() {
  blockChat.value = true
}

const ibovChartLabel = computed(() => {
  const lastPoint =
    ibovChartData.value.length > 0
      ? ibovChartData.value[ibovChartData.value.length - 1]
      : null

  return [
    {
      label: 'IBOV',
      color: '#10b981',
      value: lastPoint ? lastPoint.value.toFixed(2) : '0',
    },
  ]
})

async function fetchIbovChartData(
  range: ChartTimeRange = selectedTimeRange.value
) {
  loading.value = true
  let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' =
    '1mo'
  if (range === 'year') period = '12mo'
  else if (range === '3years') period = '3y'
  else if (range === 'full') period = 'full'

  const data = await getIndiceHistoricPrices('ibov', period)
  ibovChartData.value = mapIndiceSeries(Array.isArray(data) ? data : [])
  loading.value = false
}

function redirectToLogin(source: string) {
  navigateTo(
    `/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`
  )
}

watch(selectedTimeRange, (range) => {
  if (range === 'month' && homeMarketData.value?.ibovSeries?.length) {
    ibovChartData.value = mapIndiceSeries(homeMarketData.value.ibovSeries)
    loading.value = false
    return
  }

  fetchIbovChartData(range)
})

definePageMeta({
  isPublicRoute: true,
})
</script>

<style scoped>
.carousel-container {
  box-shadow: 0px 0px 80px 0px rgba(55, 77, 60, 0.6);
}
</style>
