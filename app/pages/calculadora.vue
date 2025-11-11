<template>
  <div>
    <NuxtLayout title="Calculadora Inteligente">
      <div class="flex h-full flex-col gap-6 px-6 pb-8 pt-6">
        <!-- Descrição -->
        <div class="flex flex-col">
          <h2 class="text-[18px] font-bold">Planejamento financeiro</h2>
          <p class="text-[13px] font-extralight">
            Simule investimentos com juros compostos ou analise o histórico real
            de ações e FIIs.
          </p>
        </div>

        <!-- Selector de calculadora -->
        <div class="flex items-center justify-between gap-5 max-md:flex-col">
          <h2 class="text-lg font-semibold">Selecione a calculadora</h2>
          <UButtonGroup orientation="horizontal" variant="soft">
            <UButton
              color="neutral"
              :variant="selectedCalculator === 'compound' ? 'soft' : 'link'"
              label="Juros Compostos"
              @click="selectedCalculator = 'compound'"
            />
            <UButton
              color="neutral"
              :variant="selectedCalculator === 'stock' ? 'soft' : 'link'"
              label="Histórico de Ações"
              @click="selectedCalculator = 'stock'"
            />
            <UButton
              color="neutral"
              :variant="selectedCalculator === 'planning' ? 'soft' : 'link'"
              label="Planejamento"
              @click="selectedCalculator = 'planning'"
            />
          </UButtonGroup>
        </div>

        <!-- Calculadora de Juros Compostos -->
        <div v-if="selectedCalculator === 'compound'" class="space-y-6">
          <div
            class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-trending-up"
                class="text-secondary size-6"
              />
              <h2 class="text-xl font-bold text-white">
                Simulação de Investimento
              </h2>
            </div>

            <!-- Formulário -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UFormField label="Valor Inicial (R$)" name="initialValue">
                <UInputNumber
                  v-model="compoundForm.initialValue"
                  placeholder="10000"
                  size="lg"
                  variant="soft"
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Aporte Mensal (R$)" name="monthlyValue">
                <UInputNumber
                  v-model="compoundForm.monthlyValue"
                  placeholder="500"
                  size="lg"
                  variant="soft"
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Taxa de Juros (%)" name="interestRate">
                <div class="flex gap-2">
                  <UInput
                    v-model="compoundForm.interestRate"
                    type="number"
                    step="0.01"
                    variant="soft"
                    placeholder="10.5"
                    size="lg"
                    class="flex-1"
                  />
                  <USelectMenu
                    v-model="compoundForm.interestPeriod"
                    :items="[
                      { label: 'Ao ano', value: 'year' },
                      { label: 'Ao mês', value: 'month' },
                    ]"
                    size="lg"
                    :ui="{ base: 'min-w-[120px]' }"
                    variant="soft"
                  />
                </div>
              </UFormField>

              <UFormField label="Período" name="period">
                <div class="flex gap-2">
                  <UInput
                    v-model="compoundForm.period"
                    type="number"
                    placeholder="12"
                    size="lg"
                    variant="soft"
                    class="flex-1"
                  />
                  <USelectMenu
                    v-model="compoundForm.periodType"
                    :items="[
                      { label: 'Meses', value: 'months' },
                      { label: 'Anos', value: 'years' },
                    ]"
                    size="lg"
                    :ui="{ base: 'min-w-[120px]' }"
                    variant="soft"
                  />
                </div>
              </UFormField>
            </div>

            <UButton
              color="secondary"
              size="xl"
              block
              icon="i-lucide-calculator"
              @click="calculateCompoundInterest"
            >
              Calcular Simulação
            </UButton>
          </div>

          <!-- Resultados -->
          <div
            v-if="compoundResult"
            class="flex flex-col gap-6 rounded-[30px] p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-bar-chart-3"
                class="text-secondary size-6"
              />
              <h3 class="text-xl font-bold text-white">
                Resultados da Simulação
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total Investido
                </p>
                <p class="text-2xl font-bold text-white">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(compoundResult.totalInvested)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total de Juros
                </p>
                <p class="text-2xl font-bold text-green-400">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(compoundResult.totalInterest)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Valor Final
                </p>
                <p class="text-secondary text-2xl font-bold">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(compoundResult.finalValue)
                  }}
                </p>
              </div>
            </div>

            <!-- Gráfico -->
            <div class="flex flex-col gap-2">
              <h4 class="text-[16px] font-semibold">Evolução do Patrimônio</h4>
              <div class="h-[350px]">
                <AtomsGraphLine
                  :data="compoundResult.chartData"
                  :height="350"
                  :legend="[{ label: 'Patrimônio', color: '#00D9A5' }]"
                  :colors="['#00D9A5']"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Calculadora de Histórico de Ações -->
        <div v-if="selectedCalculator === 'stock'" class="space-y-6">
          <div
            class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-chart-line" class="text-secondary size-6" />
              <h2 class="text-xl font-bold text-white">
                Análise de Histórico Real
              </h2>
            </div>

            <!-- Formulário -->
            <div class="space-y-4">
              <!-- Seletor de Ação -->
              <UFormField label="Selecione a Ação ou FII" name="ticker">
                <USelectMenu
                  v-model="selectedAsset"
                  :items="assetitems"
                  searchable
                  searchable-placeholder="Buscar ação ou FII..."
                  placeholder="Selecione um ativo"
                  size="lg"
                  class="w-full"
                  variant="soft"
                  :loading="assetsLoading"
                />
              </UFormField>

              <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <UFormField
                  label="Valor Inicial de Aporte (R$)"
                  name="initialInvestment"
                >
                  <UInputNumber
                    v-model="stockForm.initialInvestment"
                    placeholder="10000"
                    size="lg"
                    :format-options="{
                      style: 'currency',
                      currency: 'BRL',
                    }"
                    class="w-full"
                    variant="soft"
                  />
                </UFormField>

                <UFormField label="Data Inicial" name="startDate">
                  <UInput
                    v-model="stockForm.startDate"
                    type="date"
                    size="lg"
                    :max="today"
                    class="w-full"
                    variant="soft"
                  />
                </UFormField>

                <UFormField label="Aporte Mensal (R$)" name="monthlyInvestment">
                  <UInputNumber
                    v-model="stockForm.monthlyInvestment"
                    placeholder="500"
                    size="lg"
                    :format-options="{
                      style: 'currency',
                      currency: 'BRL',
                    }"
                    variant="soft"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Data Final" name="endDate">
                  <UInput
                    v-model="stockForm.endDate"
                    type="date"
                    size="lg"
                    :max="today"
                    variant="soft"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField name="reinvestDividends">
                <UCheckbox
                  v-model="stockForm.reinvestDividends"
                  label="Reinvestir proventos automaticamente"
                />
              </UFormField>
            </div>

            <UButton
              color="secondary"
              size="xl"
              block
              icon="i-lucide-calculator"
              :loading="calculatingStock"
              :disabled="!selectedAsset"
              @click="calculateStockHistory"
            >
              Calcular Histórico
            </UButton>

            <!-- Aviso de erro -->
            <UAlert
              v-if="stockError"
              color="red"
              variant="subtle"
              icon="i-lucide-alert-circle"
              :title="stockError"
            />
          </div>

          <!-- Resultados -->
          <div
            v-if="stockResult"
            class="flex flex-col gap-6 rounded-[30px] p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-bar-chart-3"
                class="text-secondary size-6"
              />
              <h3 class="text-xl font-bold text-white">
                Resultados do Investimento
              </h3>
            </div>

            <!-- Resumo Principal -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total Investido
                </p>
                <p class="text-xl font-bold text-white">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.totalInvested)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Valor Final
                </p>
                <p class="text-secondary text-xl font-bold">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.finalValue)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Rentabilidade
                </p>
                <p
                  class="text-xl font-bold"
                  :class="
                    stockResult.return >= 0 ? 'text-green-400' : 'text-red-400'
                  "
                >
                  {{ stockResult.return >= 0 ? '+' : ''
                  }}{{ stockResult.return.toFixed(2) }}%
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total de Proventos
                </p>
                <p class="text-xl font-bold text-green-400">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.totalDividends)
                  }}
                </p>
              </div>
            </div>

            <!-- Detalhes Adicionais -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Preço Médio de Compra
                </p>
                <p class="text-lg font-semibold text-white">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.averagePrice)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Quantidade de Ações
                </p>
                <p class="text-lg font-semibold text-white">
                  {{ stockResult.totalShares.toFixed(2) }}
                </p>
              </div>
            </div>

            <!-- Gráfico -->
            <div class="flex flex-col gap-2">
              <h4 class="text-[16px] font-semibold">
                Evolução do Investimento
              </h4>
              <div class="h-[350px]">
                <AtomsGraphLine
                  :data="stockResult.chartData"
                  :height="350"
                  :legend="[{ label: 'Investimento', color: '#00D9A5' }]"
                  :colors="['#00D9A5']"
                />
              </div>
            </div>

            <!-- Tabela de Dividendos -->
            <div
              v-if="stockForm.reinvestDividends && stockResult.dividendsHistory && stockResult.dividendsHistory.length > 0"
              class="flex flex-col gap-4"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-table"
                  class="text-secondary size-6"
                />
                <h3 class="text-xl font-bold text-white">
                  Histórico de Proventos
                </h3>
              </div>
              
              <!-- Estatísticas resumidas -->
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                  <p class="text-[13px] font-extralight text-gray-400">
                    Total de Pagamentos
                  </p>
                  <p class="text-xl font-bold text-white">
                    {{ stockResult.dividendsHistory.length }}
                  </p>
                </div>
                <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                  <p class="text-[13px] font-extralight text-gray-400">
                    Total Recebido
                  </p>
                  <p class="text-xl font-bold text-green-400">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(stockResult.totalDividends)
                    }}
                  </p>
                </div>
                <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                  <p class="text-[13px] font-extralight text-gray-400">
                    Média por Pagamento
                  </p>
                  <p class="text-xl font-bold text-white">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(
                        stockResult.totalDividends / stockResult.dividendsHistory.length
                      )
                    }}
                  </p>
                </div>
              </div>

              <div class="max-h-[500px] overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/30">
                <table class="w-full">
                  <thead class="sticky top-0 z-10 bg-gray-800">
                    <tr class="border-b border-gray-700">
                      <th class="px-4 py-3 text-left text-sm font-semibold">Data de Pagamento</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold">Valor por Ação</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold">Qtd. Ações</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold">Total Recebido</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(dividend, index) in stockResult.dividendsHistory"
                      :key="index"
                      class="border-b border-gray-700/50 hover:bg-white/5"
                    >
                      <td class="px-4 py-3 text-sm">
                        {{ new Date(dividend.payment_date).toLocaleDateString('pt-BR') }}
                      </td>
                      <td class="px-4 py-3 text-sm font-medium text-gray-300">
                        {{
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          }).format(parseFloat(dividend.rate))
                        }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-400">
                        {{ (dividend.sharesAtTime || 0).toFixed(2) }}
                      </td>
                      <td class="px-4 py-3 text-sm font-bold text-green-400">
                        {{
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(dividend.totalReceived || 0)
                        }}
                      </td>
                      <td class="px-4 py-3">
                        <span
                          class="rounded-full px-2 py-1 text-xs font-medium"
                          :class="
                            dividend.label === 'JCP'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          "
                        >
                          {{ dividend.label }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

         <!-- Calculadora de Planejamento -->
      <div v-if="selectedCalculator === 'planning'" class="space-y-6">
        <div
          class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-target" class="text-secondary size-6" />
            <h2 class="text-xl font-bold text-white">
              Planejamento de Patrimônio
            </h2>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <UFormField label="Meta financeira (R$)" name="goalValue">
              <UInputNumber
                v-model="planningForm.goalValue"
                placeholder="500000"
                size="lg"
                variant="soft"
                class="w-full"
                :format-options="{
                  style: 'currency',
                  currency: 'BRL',
                }"
              />
            </UFormField>

            <UFormField label="Aporte mensal (R$)" name="monthlyContribution">
              <UInputNumber
                v-model="planningForm.monthlyContribution"
                placeholder="1500"
                size="lg"
                variant="soft"
                class="w-full"
                :format-options="{
                  style: 'currency',
                  currency: 'BRL',
                }"
              />
            </UFormField>
          </div>

          <div class="flex flex-col gap-3">
            <p class="text-sm font-semibold text-white">Estratégia</p>
            <div class="flex gap-3 max-sm:flex-col">
              <UButton
                color="secondary"
                :variant="planningForm.strategy === 'rentabilidade' ? 'soft' : 'link'"
                class="flex-1 justify-start"
                icon="i-lucide-rocket"
                @click="planningForm.strategy = 'rentabilidade'"
              >
                Maior rentabilidade
              </UButton>
              <UButton
                color="secondary"
                :variant="planningForm.strategy === 'seguranca' ? 'soft' : 'link'"
                class="flex-1 justify-start"
                icon="i-lucide-shield"
                @click="planningForm.strategy = 'seguranca'"
              >
                Maior segurança
              </UButton>
            </div>
            <p class="text-xs text-gray-400">
              Escolha entre maximizar ganhos com ativos de alta performance ou
              priorizar estabilidade com setores defensivos, FIIs consolidados e
              10% de renda fixa.
            </p>
          </div>

          <UButton
            color="secondary"
            size="xl"
            block
            icon="i-lucide-calendar-clock"
            :loading="planningLoading"
            @click="calculatePlanningStrategy"
          >
            Calcular Planejamento
          </UButton>

          <UAlert
            v-if="planningError"
            color="red"
            variant="subtle"
            icon="i-lucide-alert-circle"
            :title="planningError"
          />
        </div>

        <div
          v-if="planningResult"
          class="flex flex-col gap-6 rounded-[30px] p-6"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-timer"
              class="text-secondary size-6"
            />
            <h3 class="text-xl font-bold text-white">
              Plano recomendado
            </h3>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Tempo estimado para alcançar a meta
              </p>
              <p class="text-xl font-bold text-white">
                {{ planningResult.timeToGoalLabel }}
              </p>
              <p class="text-xs text-gray-400">
                Aproximadamente até {{ planningResult.targetDateLabel }}
              </p>
            </div>
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Aportes totais até a meta
              </p>
              <p class="text-xl font-bold text-white">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(planningResult.totalInvestedUntilGoal)
                }}
              </p>
            </div>
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Resultado projetado
              </p>
              <p class="text-secondary text-xl font-bold">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(planningResult.estimatedFinalValue)
                }}
              </p>
              <p class="text-xs text-green-400">
                Ganho estimado de {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(planningResult.estimatedProfit)
                }}
              </p>
            </div>
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Rentabilidade média mensal esperada
              </p>
              <p class="text-xl font-bold text-white">
                {{ (planningResult.monthlyReturnRate * 100).toFixed(2) }}%
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-1 gap-4 md:grid-cols-2 rounded-2xl bg-white/5 p-4"
          >
            <div class="flex flex-col gap-2">
              <p class="text-sm font-semibold text-white">
                Se tivesse investido nos últimos {{ planningResult.historicalYears.toFixed(1) }} anos
              </p>
              <p class="text-xs text-gray-400">
                Considerando o mesmo aporte mensal e a carteira recomendada.
              </p>
              <div class="mt-2 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-400">Total investido</span>
                  <span class="text-sm font-semibold text-white">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(planningResult.historicalInvested)
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-400">Valor final</span>
                  <span class="text-sm font-semibold text-secondary">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(planningResult.historicalFinalValue)
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-400">Lucro histórico</span>
                  <span class="text-sm font-semibold text-green-400">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(planningResult.historicalProfit)
                    }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-sm font-semibold text-white">
                Projeção de patrimônio
              </p>
              <div class="h-[240px]">
                <AtomsGraphLine
                  :data="planningResult.chartData"
                  :height="240"
                  :legend="[{ label: 'Patrimônio projetado', color: '#00D9A5' }]"
                  :colors="['#00D9A5']"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-layers" class="text-secondary size-5" />
              <h4 class="text-lg font-semibold text-white">Carteira sugerida</h4>
            </div>
            <p class="text-xs text-gray-400">
              Distribuição baseada no desempenho histórico e nos critérios da
              estratégia escolhida.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="asset in planningResult.recommendedAssets"
              :key="`${asset.ticker}-${asset.category}`"
              class="flex flex-col gap-4 rounded-2xl bg-white/5 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[11px] uppercase tracking-wide text-gray-400">
                    {{ asset.category }}
                  </p>
                  <h5 class="text-lg font-semibold text-white">
                    {{ asset.ticker }}
                  </h5>
                  <p class="text-xs text-gray-400">
                    {{ asset.name }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-400">Peso</p>
                  <p class="text-2xl font-bold text-secondary">
                    {{ (asset.weight * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-400">Retorno {{ planningResult.historicalYears.toFixed(0) }} anos</p>
                  <p
                    class="font-semibold"
                    :class="asset.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'"
                  >
                    {{ (asset.totalReturn * 100).toFixed(1) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-400">CAGR anual</p>
                  <p class="font-semibold text-white">
                    {{ (asset.cagr * 100).toFixed(1) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-400">Retorno mensal</p>
                  <p class="font-semibold text-white">
                    {{ (asset.monthlyRate * 100).toFixed(2) }}%
                  </p>
                </div>
                <div>
                  <p class="text-gray-400">
                    Dividendos reinvestidos
                  </p>
                  <p class="font-semibold text-green-400">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(asset.totalDividends)
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Recomendação baseada em dados históricos. Rentabilidades passadas
            não garantem resultados futuros. Ajuste sempre sua carteira conforme
            o seu perfil de risco.
          </div>
        </div>
      </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import type { IChartDataPoint } from '~/types/chart'

const { getAssets, assetHistoricPrices, getTickerDividends, getTopStocks, getTopReits } =
  useAssetsService()

// Estado da UI
const selectedCalculator = ref<'compound' | 'stock' | 'planning'>('compound')

// Data de hoje para limitar seleção de datas
const today = new Date().toISOString().split('T')[0]

// ===== CALCULADORA DE JUROS COMPOSTOS =====
const compoundForm = ref({
  initialValue: 10000,
  monthlyValue: 500,
  interestRate: '10.5',
  interestPeriod: { label: 'Ao ano', value: 'year' },
  period: '10',
  periodType: { label: 'Anos', value: 'years' },
})

const compoundResult = ref<{
  totalInvested: number
  totalInterest: number
  finalValue: number
  chartData: IChartDataPoint[]
} | null>(null)

function calculateCompoundInterest() {
  const initial = Number(compoundForm.value.initialValue) || 0
  const monthly = Number(compoundForm.value.monthlyValue) || 0
  let rate = parseFloat(compoundForm.value.interestRate) || 0
  let months =
    compoundForm.value.periodType.value === 'years'
      ? parseInt(compoundForm.value.period) * 12
      : parseInt(compoundForm.value.period)

  // Converter taxa para mensal se for anual
  if (compoundForm.value.interestPeriod.value === 'year') {
    rate = Math.pow(1 + rate / 100, 1 / 12) - 1
  } else {
    rate = rate / 100
  }

  let balance = initial
  const chartData: IChartDataPoint[] = []
  let totalInvested = initial

  // Adicionar ponto inicial
  const startDate = new Date()
  chartData.push({
    date: startDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    value: balance,
    timestamp: startDate.getTime(),
  })

  // Calcular mês a mês
  for (let i = 1; i <= months; i++) {
    balance = balance * (1 + rate) + monthly
    totalInvested += monthly

    // Adicionar ponto no gráfico a cada mês
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    chartData.push({
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      value: balance,
      timestamp: date.getTime(),
    })
  }

  const finalValue = balance
  const totalInterest = finalValue - totalInvested

  compoundResult.value = {
    totalInvested,
    totalInterest,
    finalValue,
    chartData,
  }
}

// ===== CALCULADORA DE HISTÓRICO DE AÇÕES =====
const stockForm = ref({
  initialInvestment: 10000,
  startDate: '',
  monthlyInvestment: 500,
  endDate: '',
  reinvestDividends: true,
})

const selectedAsset = ref<IAsset | null>(null)
const calculatingStock = ref(false)
const stockError = ref('')
const assetsLoading = ref(false)

interface DividendHistoryItem {
  ticker: string
  payment_date: string
  rate: string
  label: string
  'label '?: string  // API retorna com espaço
  totalReceived: number  // Valor total recebido no dividendo
  sharesAtTime: number   // Quantidade de ações na época
}

const stockResult = ref<{
  totalInvested: number
  finalValue: number
  return: number
  totalDividends: number
  totalShares: number
  averagePrice: number
  chartData: IChartDataPoint[]
  dividendsHistory: DividendHistoryItem[]
} | null>(null)

// Colunas da tabela de dividendos
const dividendsColumns = [
  {
    key: 'payment_date',
    label: 'Data de Pagamento',
  },
  {
    key: 'rate',
    label: 'Valor por Ação',
  },
  {
    key: 'label',
    label: 'Tipo',
  },
]

// Carregar lista de ativos (utilizado em todas as calculadoras)
const { data: allAssets } = await useAsyncData('assets-calculator', () =>
  getAssets()
)

type PlanningStrategy = 'rentabilidade' | 'seguranca'

interface PlanningAssetPerformance {
  ticker: string
  name: string
  category: string
  type: string
  totalReturn: number
  cagr: number
  monthlyRate: number
  growthFactor: number
  totalDividends: number
  periodYears: number
}

interface PlanningRecommendedAsset extends PlanningAssetPerformance {
  weight: number
}

interface PlanningResult {
  strategy: PlanningStrategy
  goalValue: number
  monthlyContribution: number
  monthsToGoal: number
  timeToGoalLabel: string
  targetDateLabel: string
  totalInvestedUntilGoal: number
  estimatedFinalValue: number
  estimatedProfit: number
  monthlyReturnRate: number
  historicalFinalValue: number
  historicalInvested: number
  historicalProfit: number
  historicalYears: number
  recommendedAssets: PlanningRecommendedAsset[]
  chartData: IChartDataPoint[]
}

const normalizeTicker = (ticker: string) => (ticker || '').toUpperCase().trim()

const priceHistoryCache = new Map<string, any[]>()
const dividendsCache = new Map<string, any[] | null>()

const planningForm = ref({
  goalValue: 500000,
  monthlyContribution: 1500,
  strategy: 'rentabilidade' as PlanningStrategy,
})

const planningLoading = ref(false)
const planningError = ref('')
const planningResult = ref<PlanningResult | null>(null)

const planningUniverse = {
  rentabilidade: {
    fallbackStocks: ['PETR4', 'VALE3', 'PRIO3', 'WEGE3', 'LREN3', 'ITUB4'],
    fallbackFiis: ['HGLG11', 'KNRI11', 'XPML11', 'VISC11', 'BCFF11'],
    minimumAssets: 3,
    priorityTickers: [
      'PETR4',
      'VALE3',
      'PRIO3',
      'WEGE3',
      'ITUB4',
      'BBAS3',
      'ABEV3',
      'SUZB3',
    ],
  },
  seguranca: {
    categories: {
      energy: ['TAEE11', 'EQTL3', 'ENBR3', 'NEOE3'],
      sanitation: ['SBSP3', 'CSMG3', 'SAPR11'],
      banks: ['ITUB4', 'BBAS3', 'BBDC4', 'SANB11'],
      fiis: ['HGLG11', 'KNRI11', 'BCFF11', 'VISC11'],
    },
    categoryLabels: {
      energy: 'Energia',
      sanitation: 'Saneamento',
      banks: 'Bancos',
      fiis: 'FII consolidado',
    },
    fixedIncomeWeight: 0.1,
    fixedIncomeAnnualRate: 0.1,
  },
}

const fallbackPerformanceMetrics: Record<
  string,
  {
    cagr: number
    dividendYield?: number
    periodYears?: number
  }
> = {
  PETR4: { cagr: 0.18, dividendYield: 0.08, periodYears: 5 },
  VALE3: { cagr: 0.15, dividendYield: 0.07, periodYears: 5 },
  PRIO3: { cagr: 0.28, dividendYield: 0.03, periodYears: 5 },
  WEGE3: { cagr: 0.2, dividendYield: 0.015, periodYears: 5 },
  LREN3: { cagr: 0.11, dividendYield: 0.022, periodYears: 5 },
  ITUB4: { cagr: 0.09, dividendYield: 0.05, periodYears: 5 },
  BBAS3: { cagr: 0.1, dividendYield: 0.06, periodYears: 5 },
  ABEV3: { cagr: 0.07, dividendYield: 0.025, periodYears: 5 },
  SUZB3: { cagr: 0.13, dividendYield: 0.015, periodYears: 5 },
  HGLG11: { cagr: 0.095, dividendYield: 0.1, periodYears: 5 },
  KNRI11: { cagr: 0.085, dividendYield: 0.095, periodYears: 5 },
  XPML11: { cagr: 0.088, dividendYield: 0.09, periodYears: 5 },
  VISC11: { cagr: 0.082, dividendYield: 0.092, periodYears: 5 },
  BCFF11: { cagr: 0.078, dividendYield: 0.1, periodYears: 5 },
  TAEE11: { cagr: 0.12, dividendYield: 0.09, periodYears: 5 },
  EQTL3: { cagr: 0.13, dividendYield: 0.035, periodYears: 5 },
  ENBR3: { cagr: 0.1, dividendYield: 0.045, periodYears: 5 },
  NEOE3: { cagr: 0.095, dividendYield: 0.05, periodYears: 5 },
  SBSP3: { cagr: 0.085, dividendYield: 0.03, periodYears: 5 },
  CSMG3: { cagr: 0.08, dividendYield: 0.035, periodYears: 5 },
  SAPR11: { cagr: 0.075, dividendYield: 0.04, periodYears: 5 },
  BBDC4: { cagr: 0.082, dividendYield: 0.057, periodYears: 5 },
  SANB11: { cagr: 0.078, dividendYield: 0.05, periodYears: 5 },
}

const assetsByTicker = computed(() => {
  const map = new Map<string, IAsset>()
  if (!allAssets.value) return map
  for (const asset of allAssets.value) {
    const key = normalizeTicker(asset.ticker || asset.stock || '')
    if (!key) continue
    if (!map.has(key)) {
      map.set(key, asset)
    }
  }
  return map
})

function resolveAssetCategory(asset?: IAsset | null) {
  if (!asset) return 'Ativo'
  const type = (asset.type || '').toString().toUpperCase()
  if (type.includes('REIT') || type === 'FUND') return 'FII'
  if (type.includes('STOCK')) return 'Ação'
  if (type.includes('ETF')) return 'ETF'
  if (type.includes('BDR')) return 'BDR'
  return 'Ativo'
}

function getAssetInfo(ticker: string) {
  const normalized = normalizeTicker(ticker)
  const asset = assetsByTicker.value.get(normalized)
  const displayName =
    asset?.name ||
    asset?.stock ||
    asset?.ticker ||
    normalized
  const category = resolveAssetCategory(asset)
  return {
    name: displayName,
    category,
    type: category,
  }
}

function formatTimeLabel(months: number) {
  if (months <= 0) return 'menos de 1 mês'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const parts: string[] = []
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  }
  if (remainingMonths > 0) {
    parts.push(
      `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
    )
  }
  return parts.join(' e ')
}

function buildFallbackPerformance(
  ticker: string,
  categoryLabel?: string
): PlanningAssetPerformance | null {
  const normalized = normalizeTicker(ticker)
  const fallback = fallbackPerformanceMetrics[normalized]
  if (!fallback || !Number.isFinite(fallback.cagr)) {
    return null
  }

  const periodYears = fallback.periodYears && fallback.periodYears > 0 ? fallback.periodYears : 5
  const cagr = fallback.cagr

  if (!Number.isFinite(cagr) || cagr <= -1) {
    return null
  }

  const growthFactor = Math.pow(1 + cagr, periodYears)
  if (!Number.isFinite(growthFactor) || growthFactor <= 0) {
    return null
  }

  const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1
  const totalReturn = growthFactor - 1
  const estimatedDividends =
    fallback.dividendYield && fallback.dividendYield > 0
      ? fallback.dividendYield * periodYears * 100
      : 0

  const assetInfo = getAssetInfo(normalized)

  return {
    ticker: normalized,
    name: assetInfo.name,
    category: categoryLabel || assetInfo.category,
    type: assetInfo.type,
    totalReturn,
    cagr,
    monthlyRate,
    growthFactor,
    totalDividends: estimatedDividends,
    periodYears,
  }
}

function buildProjectionChart(
  months: number,
  monthlyContribution: number,
  monthlyRate: number
) {
  const points: IChartDataPoint[] = []
  const startDate = new Date()
  let balance = 0
  const step = Math.max(1, Math.ceil(months / 120))

  for (let month = 0; month <= months; month++) {
    if (month > 0) {
      if (monthlyRate > 0) {
        balance = balance * (1 + monthlyRate) + monthlyContribution
      } else {
        balance += monthlyContribution
      }
    }

    if (month === 0 || month === months || month % step === 0) {
      const currentDate = new Date(startDate)
      currentDate.setMonth(currentDate.getMonth() + month)
      points.push({
        date: currentDate.toLocaleDateString('pt-BR', {
          month: '2-digit',
          year: 'numeric',
        }),
        value: balance,
        timestamp: currentDate.getTime(),
      })
    }
  }

  return points
}

function computeProjectionTotals(
  monthlyContribution: number,
  months: number,
  monthlyRate: number
) {
  const totalInvested = monthlyContribution * months
  let finalValue = totalInvested
  if (monthlyRate > 0) {
    finalValue =
      monthlyContribution *
      ((1 + monthlyRate) ** months - 1) /
      monthlyRate
  }

  return {
    totalInvested,
    finalValue,
  }
}

function computeMonthsToGoal(
  goalValue: number,
  monthlyContribution: number,
  monthlyRate: number
) {
  if (goalValue <= 0 || monthlyContribution <= 0) return 0
  if (monthlyRate <= 0) {
    return Math.ceil(goalValue / monthlyContribution)
  }

  const ratio = (goalValue * monthlyRate) / monthlyContribution + 1
  if (ratio <= 1) {
    return Math.ceil(goalValue / monthlyContribution)
  }

  const months = Math.log(ratio) / Math.log(1 + monthlyRate)
  if (!Number.isFinite(months) || months <= 0) {
    return Math.ceil(goalValue / monthlyContribution)
  }

  return Math.ceil(months)
}

async function getPriceHistory(ticker: string) {
  const normalized = normalizeTicker(ticker)
  if (priceHistoryCache.has(normalized)) {
    return priceHistoryCache.get(normalized) || []
  }
  try {
    const history = await assetHistoricPrices(normalized, '5y')
    priceHistoryCache.set(normalized, history || [])
    return history || []
  } catch (error) {
    console.warn(`Falha ao obter histórico de preços para ${normalized}:`, error)
    priceHistoryCache.set(normalized, [])
    return []
  }
}

async function getDividends(ticker: string) {
  const normalized = normalizeTicker(ticker)
  if (dividendsCache.has(normalized)) {
    return dividendsCache.get(normalized) || []
  }
  try {
    const data = await getTickerDividends(normalized)
    dividendsCache.set(normalized, data || [])
    return data || []
  } catch (error) {
    console.warn(`Falha ao obter dividendos para ${normalized}:`, error)
    dividendsCache.set(normalized, null)
    return []
  }
}

async function simulateAssetPerformance(
  ticker: string,
  {
    reinvestDividends = true,
    categoryLabel,
  }: {
    reinvestDividends?: boolean
    categoryLabel?: string
  } = {}
): Promise<PlanningAssetPerformance | null> {
  const normalizedTicker = normalizeTicker(ticker)
  if (!normalizedTicker) return null

  const priceHistoryRaw = await getPriceHistory(normalizedTicker)
  if (!priceHistoryRaw || priceHistoryRaw.length < 2) {
    return buildFallbackPerformance(normalizedTicker, categoryLabel)
  }

  const priceHistory = priceHistoryRaw
    .map((item: any) => ({
      date: new Date(item.price_at),
      price: Number(item.market_price),
    }))
    .filter((entry) => Number.isFinite(entry.price) && entry.price > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (priceHistory.length < 2) {
    const fallback = buildFallbackPerformance(normalizedTicker, categoryLabel)
    if (fallback) return fallback
    return null
  }

  const dividendsRaw = reinvestDividends ? await getDividends(normalizedTicker) : []
  const dividends = (dividendsRaw || [])
    .map((dividend: any) => ({
      date: new Date(dividend.payment_date),
      rate: parseFloat(dividend.rate) || 0,
    }))
    .filter((dividend) => Number.isFinite(dividend.rate) && dividend.rate > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const initialEntry = priceHistory[0]
  const finalEntry = priceHistory[priceHistory.length - 1]
  const initialPrice = initialEntry.price
  const finalPrice = finalEntry.price

  let shares = 1
  let totalDividends = 0

  if (dividends.length) {
    for (const dividend of dividends) {
      if (dividend.date < initialEntry.date || dividend.date > finalEntry.date) continue
      const matchingPrice =
        priceHistory.find((price) => price.date >= dividend.date) ?? finalEntry
      if (!matchingPrice || matchingPrice.price <= 0) continue
      const dividendValue = shares * dividend.rate
      totalDividends += dividendValue
      if (reinvestDividends) {
        const newShares = dividendValue / matchingPrice.price
        shares += newShares
      }
    }
  }

  const finalValue = shares * finalPrice
  if (!Number.isFinite(finalValue) || finalValue <= 0 || initialPrice <= 0) {
    const fallback = buildFallbackPerformance(normalizedTicker, categoryLabel)
    if (fallback) return fallback
    return null
  }

  const growthFactor = finalValue / initialPrice
  const periodYears =
    (finalEntry.date.getTime() - initialEntry.date.getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)

  const safePeriodYears = Number.isFinite(periodYears) && periodYears > 0 ? periodYears : 5
  const cagr = Math.pow(growthFactor, 1 / safePeriodYears) - 1
  const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1

  const assetInfo = getAssetInfo(normalizedTicker)

  return {
    ticker: normalizedTicker,
    name: assetInfo.name,
    category: categoryLabel || assetInfo.category,
    type: assetInfo.type,
    totalReturn: growthFactor - 1,
    cagr,
    monthlyRate,
    growthFactor,
    totalDividends,
    periodYears: safePeriodYears,
  }
}

async function calculatePlanningStrategy() {
  const goalValue = Number(planningForm.value.goalValue) || 0
  const monthlyContribution = Number(planningForm.value.monthlyContribution) || 0

  if (goalValue <= 0) {
    planningError.value = 'Informe uma meta financeira válida.'
    return
  }

  if (monthlyContribution <= 0) {
    planningError.value = 'Informe um aporte mensal válido.'
    return
  }

  planningLoading.value = true
  planningError.value = ''
  planningResult.value = null

  try {
    let recommendedAssets: PlanningRecommendedAsset[] = []
    let monthlyReturnRate = 0
    let analysisYears = 5

    if (planningForm.value.strategy === 'rentabilidade') {
      let topStocks: IAsset[] = []
      let topReits: IAsset[] = []

      try {
        topStocks = await getTopStocks('top', 12)
      } catch (error) {
        console.warn('Não foi possível carregar top stocks, usando fallback.', error)
      }

      try {
        topReits = await getTopReits('top', 10)
      } catch (error) {
        console.warn('Não foi possível carregar top FIIs, usando fallback.', error)
      }

      const candidateMap = new Map<
        string,
        {
          ticker: string
          categoryLabel: string
        }
      >()

      const addCandidate = (rawTicker: string | undefined | null, categoryLabel: string) => {
        const normalized = normalizeTicker(rawTicker || '')
        if (!normalized) return
        if (!candidateMap.has(normalized)) {
          candidateMap.set(normalized, {
            ticker: normalized,
            categoryLabel,
          })
        }
      }

      planningUniverse.rentabilidade.priorityTickers.forEach((ticker) =>
        addCandidate(ticker, 'Ação')
      )

      topStocks.forEach((asset) =>
        addCandidate(asset.ticker || asset.stock, 'Ação')
      )

      planningUniverse.rentabilidade.fallbackStocks.forEach((ticker) =>
        addCandidate(ticker, 'Ação')
      )

      topReits.forEach((asset) => addCandidate(asset.ticker || asset.stock, 'FII'))

      planningUniverse.rentabilidade.fallbackFiis.forEach((ticker) =>
        addCandidate(ticker, 'FII')
      )

      const candidates = Array.from(candidateMap.values())

      const performances = (
        await Promise.all(
          candidates.map((candidate) =>
            simulateAssetPerformance(candidate.ticker, {
              reinvestDividends: true,
              categoryLabel: candidate.categoryLabel,
            })
          )
        )
      ).filter((asset): asset is PlanningAssetPerformance => Boolean(asset))

      if (performances.length < planningUniverse.rentabilidade.minimumAssets) {
        throw new Error(
          'Não encontramos dados históricos suficientes para montar a carteira de maior rentabilidade.'
        )
      }

      performances.sort((a, b) => b.totalReturn - a.totalReturn)
      const selectedAssets = performances.slice(
        0,
        Math.max(
          planningUniverse.rentabilidade.minimumAssets,
          Math.min(5, performances.length)
        )
      )

      const positiveReturnSum = selectedAssets.reduce(
        (sum, asset) => sum + Math.max(asset.totalReturn, 0),
        0
      )

      if (positiveReturnSum > 0) {
        recommendedAssets = selectedAssets.map((asset) => ({
          ...asset,
          weight: Math.max(asset.totalReturn, 0) / positiveReturnSum,
        }))
      } else {
        const equalWeight = selectedAssets.length > 0 ? 1 / selectedAssets.length : 0
        recommendedAssets = selectedAssets.map((asset) => ({
          ...asset,
          weight: equalWeight,
        }))
      }

      analysisYears = selectedAssets.reduce(
        (min, asset) => Math.min(min, asset.periodYears),
        selectedAssets[0]?.periodYears ?? analysisYears
      )

      monthlyReturnRate = recommendedAssets.reduce(
        (sum, asset) => sum + asset.weight * asset.monthlyRate,
        0
      )
    } else {
      const selectedCategoryAssets: PlanningAssetPerformance[] = []
      const { categories, categoryLabels, fixedIncomeAnnualRate, fixedIncomeWeight } =
        planningUniverse.seguranca

      for (const [categoryKey, tickers] of Object.entries(categories)) {
        const performances = (
          await Promise.all(
            tickers.map((ticker) =>
              simulateAssetPerformance(ticker, {
                reinvestDividends: true,
                categoryLabel:
                  categoryLabels[
                    categoryKey as keyof typeof categoryLabels
                  ] || categoryKey,
              })
            )
          )
        ).filter((asset): asset is PlanningAssetPerformance => Boolean(asset))

        if (performances.length === 0) continue
        performances.sort((a, b) => b.cagr - a.cagr)
        selectedCategoryAssets.push(performances[0])
      }

      if (selectedCategoryAssets.length === 0) {
        throw new Error(
          'Não encontramos dados históricos suficientes para montar a carteira defensiva.'
        )
      }

      analysisYears = selectedCategoryAssets.reduce(
        (min, asset) => Math.min(min, asset.periodYears),
        selectedCategoryAssets[0]?.periodYears ?? analysisYears
      )

      const variableWeight = 1 - fixedIncomeWeight
      const weightPerAsset =
        selectedCategoryAssets.length > 0
          ? variableWeight / selectedCategoryAssets.length
          : 0

      recommendedAssets = selectedCategoryAssets.map((asset) => ({
        ...asset,
        weight: weightPerAsset,
      }))

      const fixedIncomeMonthlyRate = Math.pow(1 + fixedIncomeAnnualRate, 1 / 12) - 1
      const fixedIncomeGrowthFactor = Math.pow(
        1 + fixedIncomeMonthlyRate,
        Math.max(Math.round(analysisYears * 12), 1)
      )

      const fixedIncomeAsset: PlanningRecommendedAsset = {
        ticker: 'RF-10%',
        name: 'Renda Fixa (estimativa 10% a.a.)',
        category: 'Renda Fixa',
        type: 'Renda Fixa',
        totalReturn: fixedIncomeGrowthFactor - 1,
        cagr: fixedIncomeAnnualRate,
        monthlyRate: fixedIncomeMonthlyRate,
        growthFactor: fixedIncomeGrowthFactor,
        totalDividends: 0,
        periodYears: analysisYears,
        weight: fixedIncomeWeight,
      }

      recommendedAssets.push(fixedIncomeAsset)

      monthlyReturnRate = recommendedAssets.reduce(
        (sum, asset) => sum + asset.weight * asset.monthlyRate,
        0
      )
    }

    if (!Number.isFinite(analysisYears) || analysisYears <= 0) {
      analysisYears = 5
    }

    const totalWeight = recommendedAssets.reduce((sum, asset) => sum + asset.weight, 0)
    if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.001) {
      recommendedAssets = recommendedAssets.map((asset) => ({
        ...asset,
        weight: asset.weight / totalWeight,
      }))
    }

    const periodMonths = Math.max(Math.round(analysisYears * 12), 1)
    const monthsToGoal = computeMonthsToGoal(
      goalValue,
      monthlyContribution,
      monthlyReturnRate
    )
    const totals = computeProjectionTotals(
      monthlyContribution,
      monthsToGoal,
      monthlyReturnRate
    )
    const historicalTotals = computeProjectionTotals(
      monthlyContribution,
      periodMonths,
      monthlyReturnRate
    )

    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + monthsToGoal)

    planningResult.value = {
      strategy: planningForm.value.strategy,
      goalValue,
      monthlyContribution,
      monthsToGoal,
      timeToGoalLabel: formatTimeLabel(monthsToGoal),
      targetDateLabel: targetDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      totalInvestedUntilGoal: totals.totalInvested,
      estimatedFinalValue: totals.finalValue,
      estimatedProfit: totals.finalValue - totals.totalInvested,
      monthlyReturnRate,
      historicalFinalValue: historicalTotals.finalValue,
      historicalInvested: historicalTotals.totalInvested,
      historicalProfit: historicalTotals.finalValue - historicalTotals.totalInvested,
      historicalYears: analysisYears,
      recommendedAssets,
      chartData: buildProjectionChart(
        monthsToGoal,
        monthlyContribution,
        monthlyReturnRate
      ),
    }
  } catch (error: any) {
    console.error('Erro ao calcular planejamento:', error)
    planningError.value =
      error?.message ||
      'Não foi possível calcular o planejamento. Tente novamente.'
  } finally {
    planningLoading.value = false
  }
}

const assetitems = computed(() => {
  if (!allAssets.value) return []
  return (
    allAssets.value
      .filter((asset) => asset.type === 'STOCK' || asset.type === 'FUND')
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        avatar: { src: item.logo },
      })) || []
  )
})

async function calculateStockHistory() {
  if (!selectedAsset.value) return

  calculatingStock.value = true
  stockError.value = ''
  stockResult.value = null

  try {
    const ticker = selectedAsset.value.id
    const initialInvestment = Number(stockForm.value.initialInvestment) || 0
    const monthlyInvestment = Number(stockForm.value.monthlyInvestment) || 0
    const startDate = new Date(stockForm.value.startDate)
    const endDate = new Date(stockForm.value.endDate)

    if (!startDate || !endDate || startDate >= endDate) {
      stockError.value = 'Por favor, selecione datas válidas'
      return
    }

    // Buscar histórico de preços completo (12 meses)
    const priceHistory = await assetHistoricPrices(ticker, 'full')

    console.log('Histórico de preços:', priceHistory?.slice(0, 3)) // Debug: primeiros 3 itens

    if (!priceHistory || priceHistory.length === 0) {
      stockError.value =
        'Não foi possível obter o histórico de preços para este ativo'
      return
    }

    // Buscar dividendos se opção estiver marcada
    let dividends: any[] = []
    if (stockForm.value.reinvestDividends) {
      try {
        const dividendsData = await getTickerDividends(ticker)
        dividends = dividendsData || []
        console.log('Dividendos encontrados:', dividends?.slice(0, 3)) // Debug: primeiros 3 itens
      } catch (error) {
        console.warn('Não foi possível obter dividendos:', error)
      }
    }

    // Calcular investimento
    let totalShares = 0
    let totalInvested = 0
    let totalDividends = 0
    const chartData: IChartDataPoint[] = []
    const dividendsHistory: DividendHistoryItem[] = []

    // Filtrar histórico de preços dentro do período
    const relevantPrices = priceHistory.filter((price: any) => {
      const priceDate = new Date(price.price_at)
      return priceDate >= startDate && priceDate <= endDate
    })

    if (relevantPrices.length === 0) {
      stockError.value =
        'Não há dados de preço disponíveis para o período selecionado'
      return
    }

    // Preço inicial - compra inicial
    const firstPrice = relevantPrices[0]
    const initialPrice = firstPrice.market_price
    const initialShares = initialInvestment / initialPrice
    totalShares = initialShares
    totalInvested = initialInvestment

    // Adicionar ponto inicial
    const firstDate = new Date(firstPrice.price_at)
    chartData.push({
      date: firstDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      value: initialInvestment,
      timestamp: firstDate.getTime(),
    })

    // Processar dados ao longo do tempo
    let lastMonthProcessed = new Date(startDate).getMonth()
    let lastYearProcessed = new Date(startDate).getFullYear()

    for (let priceIndex = 1; priceIndex < relevantPrices.length; priceIndex++) {
      const currentPrice = relevantPrices[priceIndex]
      const priceDate = new Date(currentPrice.price_at)
      const priceValue = currentPrice.market_price
      const currentMonth = priceDate.getMonth()
      const currentYear = priceDate.getFullYear()

      // Verificar se mudou de mês para adicionar aporte mensal
      if (
        monthlyInvestment > 0 &&
        (currentMonth !== lastMonthProcessed ||
          currentYear !== lastYearProcessed)
      ) {
        const newShares = monthlyInvestment / priceValue
        totalShares += newShares
        totalInvested += monthlyInvestment
        lastMonthProcessed = currentMonth
        lastYearProcessed = currentYear
      }

      // Processar dividendos até esta data
      if (stockForm.value.reinvestDividends && dividends.length > 0) {
        const previousDate = new Date(relevantPrices[priceIndex - 1].price_at)
        const relevantDividends = dividends.filter((div: any) => {
          const divDate = new Date(div.payment_date)
          return divDate > previousDate && divDate <= priceDate
        })

        for (const dividend of relevantDividends) {
          const dividendRate = parseFloat(dividend.rate) || 0
          const dividendValue = totalShares * dividendRate
          totalDividends += dividendValue

          // Adicionar ao histórico de dividendos para o gráfico
          dividendsHistory.push({
            ticker: ticker,
            payment_date: dividend.payment_date,
            rate: dividend.rate,
            label: (dividend['label '] || dividend.label || 'Dividendo').trim(),
            totalReceived: dividendValue,
            sharesAtTime: totalShares,
          })

          // Reinvestir dividendos
          if (stockForm.value.reinvestDividends) {
            const newShares = dividendValue / priceValue
            totalShares += newShares
          }
        }
      }

      // Calcular valor atual da carteira
      const portfolioValue = totalShares * priceValue

      // Adicionar ponto no gráfico (apenas alguns pontos para não sobrecarregar)
      // Adiciona um ponto a cada ~7 dias ou no último dia
      if (priceIndex % 7 === 0 || priceIndex === relevantPrices.length - 1) {
        const currentDate = new Date(currentPrice.price_at)
        chartData.push({
          date: currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          value: portfolioValue,
          timestamp: currentDate.getTime(),
        })
      }
    }

    // Calcular resultados finais
    const lastPrice = relevantPrices[relevantPrices.length - 1]
    const finalPrice = lastPrice.market_price
    const finalValue = totalShares * finalPrice
    const returnPercentage =
      totalInvested > 0
        ? ((finalValue - totalInvested) / totalInvested) * 100
        : 0
    const averagePrice = totalShares > 0 ? totalInvested / totalShares : 0

    console.log('Resultados finais:', {
      totalShares,
      totalInvested,
      finalValue,
      finalPrice,
      returnPercentage,
      totalDividends,
    })

    // Ordenar dividendos por data (do mais antigo para o mais recente)
    const sortedDividendsHistory = dividendsHistory
      .filter(d => d.totalReceived !== undefined && d.sharesAtTime !== undefined)
      .sort((a, b) => {
        return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
      })

    stockResult.value = {
      totalInvested,
      finalValue,
      return: returnPercentage,
      totalDividends,
      totalShares,
      averagePrice,
      chartData,
      dividendsHistory: sortedDividendsHistory,
    }
  } catch (error: any) {
    console.error('Erro ao calcular histórico:', error)
    stockError.value = error.message || 'Erro ao calcular. Tente novamente.'
  } finally {
    calculatingStock.value = false
  }
}

// Definir datas padrão (últimos 2 anos)
onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setFullYear(start.getFullYear() - 2)

  stockForm.value.endDate = end.toISOString().split('T')[0]
  stockForm.value.startDate = start.toISOString().split('T')[0]
})
</script>
