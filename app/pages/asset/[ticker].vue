<template>
  <NuxtLayout
    :name="layoutName"
    container-class="md:px-0"
  >
    <!-- ========== RESEARCH VARIANT (Investidor Sardinha, AUVP analyst desk) ========== -->
    <div
      v-if="brand.assetPage.variant === 'research'"
      class="relative z-10 flex flex-col"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- Paper masthead -->
      <div class="border-b" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto flex w-full max-w-6xl items-start justify-between gap-6 px-6 pt-10 md:px-10 md:pt-12">
          <div class="flex flex-col gap-0.5">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              AUVP RESEARCH · ESTUDO DE CASO
            </span>
            <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              {{ assetEditorialDate }}
            </span>
          </div>
          <span class="font-academic-mono text-[11px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
            {{ tickerUpper }} · B3 · BOLSA DE VALORES DE SÃO PAULO
          </span>
        </div>
      </div>

      <!-- Cover: ticker + name + price with inline panorama panel -->
      <div class="mx-auto w-full max-w-6xl px-6 py-14 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:py-20">
        <div class="md:col-span-7">
          <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
            {{ (asset?.type || 'AÇÃO').toString().toUpperCase() === 'REIT' ? 'fundo imobiliário' : 'ação ordinária' }} · código {{ tickerUpper }}
          </span>
          <h1
            class="font-academic-display mt-6"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)',
            }"
          >
            Estudo de caso: <span class="italic" :style="{ color: brand.colors.primary }">{{ asset?.name || tickerUpper }}</span>
          </h1>
          <p class="font-academic-body mt-4 text-[13px] italic" :style="{ color: brand.colors.textMuted }">
            Setor: {{ asset?.sector || '-' }}{{ asset?.industry ? ' · ' + asset.industry : '' }}
          </p>

          <hr class="dashed-rule mt-10 max-w-[8rem]" />

          <div class="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              Cotação de fechamento
            </span>
            <span class="font-academic-display tabular-nums" :style="{ color: brand.colors.text, fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }">
              R$ {{ formatPriceNumber(asset?.market_price) }}
            </span>
            <span
              class="font-academic-body text-lg italic"
              :style="{
                color: Number(asset?.change_percent) >= 0 ? brand.colors.positive : brand.colors.primary,
              }"
            >
              {{ Number(asset?.change_percent) >= 0 ? '+' : '−' }}{{ Math.abs(Number(asset?.change_percent) || 0).toFixed(2).replace('.', ',') }}% no último pregão
            </span>
          </div>

          <p
            v-if="editorialPriceNarration"
            class="font-academic-body mt-6 max-w-xl italic"
            :style="{ color: brand.colors.textMuted }"
          >
            <span class="red-pen">Nota do analista</span>, {{ editorialPriceNarration }}
          </p>
        </div>

        <!-- Right: compact data panel with key session metrics -->
        <div class="mt-10 md:col-span-5 md:mt-0">
          <div
            class="border p-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-start justify-between">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                Dados do pregão
              </span>
              <span class="font-academic-mono text-[10px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ assetEditorialDate }}
              </span>
            </div>
            <dl class="mt-6 flex flex-col divide-y" :style="{ borderColor: brand.colors.border }">
              <div
                v-for="row in researchAssetQuickPanel"
                :key="row.label"
                class="flex items-baseline justify-between py-3"
                :style="{ borderColor: brand.colors.border }"
              >
                <dt class="flex flex-col">
                  <span class="font-academic-display text-[14px]" :style="{ color: brand.colors.text }">
                    {{ row.label }}
                  </span>
                  <span v-if="row.note" class="font-academic-body text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                    {{ row.note }}
                  </span>
                </dt>
                <dd class="text-right">
                  <span class="font-academic-mono tabular-nums text-base" :style="{ color: brand.colors.text }">
                    {{ row.value }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §1 Histórico de preço -->
      <div class="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              §1 · Histórico de preço
            </span>
            <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
              A série histórica
            </h2>
            <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
              Série de fechamento diário. O gráfico é <span class="red-pen">insumo, não conclusão</span>, use para calibrar expectativa.<sup class="footnote-marker">¹</sup>
            </p>
          </div>
          <MoleculesPeriodSelector
            v-model="selectedTimeRange"
            :loading="isLoadingChart"
          />
        </div>
        <div class="mt-8">
          <AtomsGraphLine
            :data="chartData"
            :legend="chartLabel"
            :height="320"
            :loading="isLoadingChart"
            :markers="chartMarkers"
            @marker-click="onMarkerClick"
          />
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §2 Indicadores fundamentalistas, expanded research table -->
      <div
        v-if="brand.assetPage.showIndicators"
        class="py-14 md:py-16"
        :style="{ backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="mb-8">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              §2 · Indicadores fundamentalistas
            </span>
            <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
              Quadro sinótico
            </h2>
            <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
              Todos os múltiplos e retornos relevantes. Cada linha traz a <span class="red-pen-underline">leitura do analista</span> aplicada à realidade brasileira.<sup class="footnote-marker">²</sup>
            </p>
          </div>

          <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
            <thead>
              <tr class="border-b" :style="{ borderColor: brand.colors.border }">
                <th class="font-academic-label w-14 py-3 text-left" :style="{ color: brand.colors.textMuted }">§</th>
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Indicador</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">Valor</th>
                <th class="hidden font-academic-label py-3 text-right md:table-cell" :style="{ color: brand.colors.textMuted }">Leitura AUVP</th>
              </tr>
            </thead>
            <tbody v-if="basicIndicators">
              <tr
                v-for="(row, idx) in researchAssetIndicators"
                :key="row.label"
                class="border-b"
                :style="{ borderColor: brand.colors.border }"
              >
                <td class="py-3 pr-2">
                  <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                    2.{{ idx + 1 }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="flex flex-col">
                    <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                      {{ row.label }}
                    </span>
                    <span class="font-academic-body text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                      {{ row.code }}
                    </span>
                  </div>
                </td>
                <td class="py-3 text-right align-top">
                  <span class="font-academic-mono tabular-nums text-lg" :style="{ color: brand.colors.primary }">
                    {{ row.value || '-' }}
                  </span>
                </td>
                <td class="hidden py-3 pl-4 text-right align-top md:table-cell">
                  <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
                    {{ row.reading }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="4" class="py-8 text-center font-academic-body italic" :style="{ color: brand.colors.textMuted }">
                  Dados fundamentais indisponíveis para este ativo.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §3 Demonstrações financeiras: 3-col snapshot -->
      <div
        v-if="brand.assetPage.showFinancials && (cashFlowItems.length || balanceItems.length || incomeItems.length)"
        class="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-16"
      >
        <div class="mb-8">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §3 · Demonstrações financeiras
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            Último trimestre disponível
          </h2>
          <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
            Três janelas do balanço: fluxo de caixa, balanço patrimonial e DRE. Balanço sujo esconde tese torta.
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
          <!-- Cash flow -->
          <div>
            <div class="border-t pt-3" :style="{ borderColor: brand.colors.text }">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                3.1 · Fluxo de caixa
              </span>
            </div>
            <table class="mt-3 w-full font-academic-body text-[12px]">
              <tbody>
                <tr
                  v-for="(item, idx) in cashFlowItems.slice(0, 5)"
                  :key="`cf-${idx}-${item.label}`"
                  class="border-b"
                  :style="{ borderColor: brand.colors.border }"
                >
                  <td class="py-2 pr-2">
                    <span class="font-academic-body text-[12px]" :style="{ color: brand.colors.text }">
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-2 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: Number(item.rawValue || 0) >= 0 ? brand.colors.text : brand.colors.primary }">
                      {{ item.value }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Balance sheet -->
          <div>
            <div class="border-t pt-3" :style="{ borderColor: brand.colors.text }">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                3.2 · Balanço patrimonial
              </span>
            </div>
            <table class="mt-3 w-full font-academic-body text-[12px]">
              <tbody>
                <tr
                  v-for="(item, idx) in balanceItems.slice(0, 5)"
                  :key="`bs-${idx}-${item.label}`"
                  class="border-b"
                  :style="{ borderColor: brand.colors.border }"
                >
                  <td class="py-2 pr-2">
                    <span class="font-academic-body text-[12px]" :style="{ color: brand.colors.text }">
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-2 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                      {{ item.value }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Income statement -->
          <div>
            <div class="border-t pt-3" :style="{ borderColor: brand.colors.text }">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                3.3 · DRE
              </span>
            </div>
            <table class="mt-3 w-full font-academic-body text-[12px]">
              <tbody>
                <tr
                  v-for="(item, idx) in incomeItems.slice(0, 5)"
                  :key="`is-${idx}-${item.label}`"
                  class="border-b"
                  :style="{ borderColor: brand.colors.border }"
                >
                  <td class="py-2 pr-2">
                    <span class="font-academic-body text-[12px]" :style="{ color: brand.colors.text }">
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-2 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                      {{ item.value }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr v-if="brand.assetPage.showFinancials" class="dashed-rule mx-auto max-w-6xl" />

      <!-- §4 Histórico de proventos -->
      <div
        v-if="dividendsData.length > 0"
        class="py-14 md:py-16"
        :style="{ backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="mb-8">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              §4 · Histórico de proventos
            </span>
            <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
              Últimos pagamentos registrados
            </h2>
            <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
              Consistência de proventos é o que separa empresa madura de <span class="red-pen-underline">promessa de crescimento</span>.
            </p>
          </div>

          <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
            <thead>
              <tr class="border-b" :style="{ borderColor: brand.colors.border }">
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Data pagamento</th>
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Tipo</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">Valor por cota</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(d, idx) in researchAssetDividends"
                :key="`div-${idx}-${d.paymentDate}`"
                class="border-b"
                :style="{ borderColor: brand.colors.border }"
              >
                <td class="py-3">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    {{ d.paymentDate }}
                  </span>
                </td>
                <td class="py-3">
                  <span
                    class="font-academic-label"
                    :style="{ color: (d.label || '').toUpperCase().includes('JCP') || (d.label || '').toUpperCase().includes('JUROS') ? brand.colors.textMuted : brand.colors.primary }"
                  >
                    {{ d.label || 'Provento' }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    R$ {{ d.rate }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="dividendsData.length > researchAssetDividends.length" class="font-academic-body mt-4 text-[11px] italic" :style="{ color: brand.colors.textMuted }">
            Exibindo os {{ researchAssetDividends.length }} pagamentos mais recentes. Histórico completo disponível no portal interno.
          </p>
        </div>
      </div>

      <hr v-if="dividendsData.length > 0" class="dashed-rule mx-auto max-w-6xl" />

      <!-- §5 Veredicto AUVP: checklist de filtros passa / não passa -->
      <div class="mx-auto w-full max-w-6xl px-6 py-14 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:py-16">
        <div class="md:col-span-4">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §5 · Veredicto AUVP
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            O filtro do método
          </h2>
          <p class="font-academic-body mt-4 text-[13px] italic" :style="{ color: brand.colors.textMuted }">
            Esta é a passagem do ativo pelos <span class="red-pen">quatro filtros do método AUVP</span>. Não é recomendação, é verificação metodológica.
          </p>
        </div>
        <div class="mt-8 md:col-span-7 md:col-start-6 md:mt-0">
          <p class="font-academic-body academic-dropcap" :style="{ color: brand.colors.text }">
            {{ researchAssetThesis }}
          </p>

          <hr class="dashed-rule mt-10" />

          <ol class="mt-8 flex flex-col">
            <li
              v-for="(filter, idx) in researchAssetFilters"
              :key="filter.label"
              class="flex items-start gap-5 border-b py-5"
              :style="{ borderColor: brand.colors.border }"
            >
              <span
                class="font-academic-display text-2xl"
                :style="{ color: filter.passes ? brand.colors.positive : brand.colors.primary }"
              >
                {{ filter.passes ? '✓' : '✗' }}
              </span>
              <div class="flex flex-1 flex-col">
                <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                  {{ idx + 1 }}. {{ filter.label }}
                </span>
                <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
                  {{ filter.rule }} · observado: <span class="font-academic-mono" :style="{ color: brand.colors.text }">{{ filter.observed }}</span>
                </span>
              </div>
            </li>
          </ol>

          <div class="mt-10 border-t pt-6" :style="{ borderColor: brand.colors.border }">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              Veredicto final
            </span>
            <p class="font-academic-display mt-2 text-xl leading-tight" :style="{ color: brand.colors.text }">
              <span class="red-pen">{{ researchAssetVerdict }}</span>
            </p>
            <p class="font-academic-body mt-3 text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              Passar nos filtros não é sinal de compra. É sinal de que o ativo merece <span class="red-pen-underline">aprofundamento do estudo</span>.<sup class="footnote-marker">³</sup>
            </p>
          </div>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §6 Sobre a empresa -->
      <div v-if="brand.assetPage.showCompanyInfo" class="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div class="mb-8">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §6 · Identificação da empresa
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            Dados institucionais
          </h2>
        </div>

        <dl class="flex flex-col border-t" :style="{ borderColor: brand.colors.border }">
          <div v-if="asset?.sector" class="flex items-baseline gap-6 border-b py-4" :style="{ borderColor: brand.colors.border }">
            <dt class="font-academic-label w-40 shrink-0" :style="{ color: brand.colors.textMuted }">Setor</dt>
            <dd class="font-academic-body" :style="{ color: brand.colors.text }">{{ asset.sector }}</dd>
          </div>
          <div v-if="asset?.industry" class="flex items-baseline gap-6 border-b py-4" :style="{ borderColor: brand.colors.border }">
            <dt class="font-academic-label w-40 shrink-0" :style="{ color: brand.colors.textMuted }">Indústria</dt>
            <dd class="font-academic-body" :style="{ color: brand.colors.text }">{{ asset.industry }}</dd>
          </div>
          <div v-if="asset?.website" class="flex items-baseline gap-6 border-b py-4" :style="{ borderColor: brand.colors.border }">
            <dt class="font-academic-label w-40 shrink-0" :style="{ color: brand.colors.textMuted }">Site institucional</dt>
            <dd>
              <a
                :href="asset.website"
                target="_blank"
                rel="noopener noreferrer"
                class="font-academic-body border-b pb-[1px]"
                :style="{ color: brand.colors.text, borderColor: brand.colors.primary }"
              >
                {{ asset.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }} →
              </a>
            </dd>
          </div>
          <div class="flex items-baseline gap-6 border-b py-4" :style="{ borderColor: brand.colors.border }">
            <dt class="font-academic-label w-40 shrink-0" :style="{ color: brand.colors.textMuted }">Código B3</dt>
            <dd class="font-academic-mono" :style="{ color: brand.colors.text }">{{ tickerUpper }}</dd>
          </div>
        </dl>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §7 Próximos passos AUVP -->
      <div class="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div class="mb-8">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §7 · Aprofundar o estudo
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            Próximos passos no ecossistema AUVP
          </h2>
          <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
            Este estudo é a primeira camada. Para ir além, entender o método, comparar com pares, discutir com a comunidade, o caminho é o ecossistema.
          </p>
        </div>

        <div class="grid gap-px border md:grid-cols-3" :style="{ borderColor: brand.colors.text, backgroundColor: brand.colors.text }">
          <a
            v-for="(item, idx) in researchAssetNextSteps"
            :key="item.title"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex flex-col gap-3 p-6 transition-colors md:p-8"
            :style="{ backgroundColor: brand.colors.background }"
            @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.surface"
            @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.background"
          >
            <div class="flex items-start justify-between">
              <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.primary }">
                [{{ String(idx + 1).padStart(2, '0') }}]
              </span>
              <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
                {{ item.kind }}
              </span>
            </div>
            <h3
              class="font-academic-display"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                lineHeight: '1.1',
              }"
            >
              {{ item.title }}
            </h3>
            <p class="font-academic-body" :style="{ color: brand.colors.text, fontSize: '13px' }">
              {{ item.body }}
            </p>
            <span class="mt-auto font-academic-label transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
              {{ item.cta }} →
            </span>
          </a>
        </div>
      </div>

      <!-- Closing: signature + CTAs + footnotes -->
      <div
        class="py-16 md:py-20"
        :style="{ backgroundColor: brand.colors.surface, borderTop: `1px solid ${brand.colors.border}` }"
      >
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="flex flex-col gap-1">
              <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
                Compilado por
              </span>
              <span class="font-academic-display text-2xl" :style="{ color: brand.colors.text }">
                {{ brand.founder?.name || 'Raul Sena' }}
              </span>
              <span class="font-academic-body text-[13px] italic" :style="{ color: brand.colors.textMuted }">
                Fundador · AUVP, A Única Verdade Possível
              </span>
            </div>
            <div class="flex flex-col items-end gap-3">
              <NuxtLink
                to="/auth/register"
                class="inline-flex items-center gap-3 border-2 px-5 py-2.5 font-academic-label transition-colors"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.background,
                  borderColor: brand.colors.primary,
                }"
              >
                <span>ABRIR O TERMINAL</span>
                <span>→</span>
              </NuxtLink>
              <a
                href="https://auvp.com.br"
                target="_blank"
                rel="noopener noreferrer"
                class="font-academic-body text-[13px] italic transition-opacity hover:opacity-70"
                :style="{ color: brand.colors.text }"
              >
                Conhecer a AUVP Escola <span :style="{ color: brand.colors.primary }">→</span>
              </a>
            </div>
          </div>

          <div class="mt-12 border-t pt-6" :style="{ borderColor: brand.colors.border }">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              Notas de rodapé
            </span>
            <ol class="mt-4 flex flex-col gap-3">
              <li class="font-academic-body text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                <sup class="footnote-marker">¹</sup> Gráfico é fotografia do passado. Serve para calibrar expectativa, não para prever futuro.
              </li>
              <li class="font-academic-body text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                <sup class="footnote-marker">²</sup> Múltiplos fora do contexto setorial induzem a erro. Sempre compare com pares diretos e com a média histórica da própria empresa.
              </li>
              <li class="font-academic-body text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                <sup class="footnote-marker">³</sup> AUVP não opera recomendação individualizada. Oferece método e plataforma de estudo. A decisão, por princípio, é sempre do investidor.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== MENTOR VARIANT (Primo Rico, masterclass / book-cover) ========== -->
    <div
      v-else-if="brand.assetPage.variant === 'mentor'"
      class="relative z-10 flex flex-col"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- Top tape: thick orange strip with "MANUAL DO PRIMO · FICHA TÉCNICA" -->
      <div
        class="relative flex items-center gap-4 px-6 py-3 md:px-10"
        :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
      >
        <span class="font-mentor-eyebrow">MANUAL DO PRIMO · FICHA TÉCNICA</span>
        <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
        <span class="font-mentor-eyebrow">{{ tickerUpper }} · {{ (asset?.type || 'AÇÃO').toString().toUpperCase() === 'REIT' ? 'FII' : 'AÇÃO' }}</span>
      </div>

      <!-- HERO: asymmetric split with oversized ticker + price -->
      <div class="relative grid gap-0 md:grid-cols-12">
        <!-- Left column: logo + sector/industry block -->
        <div
          class="relative flex flex-col justify-end px-6 py-10 md:col-span-4 md:px-10 md:py-14"
          :style="{ backgroundColor: brand.colors.tertiary }"
        >
          <!-- Vertical orange strip on right edge -->
          <div class="absolute right-0 top-0 h-full w-1" :style="{ backgroundColor: brand.colors.primary }" />
          <img
            v-if="resolvedLogo && !isLoadingAsset"
            :src="resolvedLogo"
            :alt="`${assetName}`"
            class="mb-6 h-20 w-20 rounded-2xl object-cover shadow-2xl"
          />
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            O ATIVO
          </span>
          <h1
            class="font-mentor-display mt-2"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
              lineHeight: '0.85',
            }"
          >
            {{ assetName || tickerUpper }}
          </h1>
          <div class="mt-6 flex flex-col gap-1">
            <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
              SETOR
            </span>
            <span class="text-sm font-semibold uppercase" :style="{ color: `${brand.colors.text}CC` }">
              {{ asset?.sector || '-' }}
            </span>
          </div>
          <div v-if="asset?.industry" class="mt-4 flex flex-col gap-1">
            <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
              INDÚSTRIA
            </span>
            <span class="text-sm font-semibold uppercase" :style="{ color: `${brand.colors.text}CC` }">
              {{ asset.industry }}
            </span>
          </div>
        </div>

        <!-- Right column: price monumental + change + stats -->
        <div class="flex flex-col justify-center px-6 py-14 md:col-span-8 md:px-14 md:py-20">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            CAPÍTULO I · COTAÇÃO DE HOJE
          </span>

          <!-- Massive ticker as headline -->
          <h2
            class="font-mentor-display mt-4"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(4rem, 8.5vw, 8.5rem)',
              lineHeight: '0.85',
            }"
          >
            {{ tickerUpper }}
          </h2>

          <!-- Price block -->
          <div class="mt-8 flex flex-wrap items-baseline gap-6">
            <div class="flex flex-col">
              <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
                PREÇO ATUAL
              </span>
              <div class="mt-2 flex items-baseline gap-3">
                <span class="font-mentor-display text-xl" :style="{ color: `${brand.colors.text}80` }">
                  R$
                </span>
                <span
                  class="font-mentor-display tabular-nums"
                  :style="{
                    color: brand.colors.text,
                    fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                  }"
                >
                  {{ formatPriceNumber(asset?.market_price) }}
                </span>
              </div>
            </div>

            <div class="flex flex-col">
              <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
                HOJE
              </span>
              <span
                class="font-mentor-display mt-2 tabular-nums"
                :style="{
                  color: Number(asset?.change_percent) >= 0 ? brand.colors.positive : brand.colors.negative,
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                }"
              >
                {{ Number(asset?.change_percent) >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2).replace('.', ',') }}%
              </span>
            </div>
          </div>

          <!-- Chunky orange rule -->
          <hr
            class="mentor-rule mt-10 max-w-[6rem]"
            :style="{ backgroundColor: brand.colors.primary }"
          />

          <!-- Quick stats: 4 blocks numbered 01-04 -->
          <div
            class="mt-10 grid gap-px"
            :class="basicIndicators ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'"
            :style="{ backgroundColor: `${brand.colors.text}18` }"
          >
            <template v-if="basicIndicators">
              <div
                v-for="(item, idx) in mentorQuickStats"
                :key="item.label"
                class="flex flex-col gap-2 px-5 py-6"
                :style="{ backgroundColor: brand.colors.background }"
              >
                <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
                  [{{ String(idx + 1).padStart(2, '0') }}]
                </span>
                <span
                  class="font-mentor-display tabular-nums"
                  :style="{
                    color: brand.colors.text,
                    fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
                  }"
                >
                  {{ item.value || '-' }}
                </span>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider"
                  :style="{ color: `${brand.colors.text}99` }"
                >
                  {{ item.label }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Chart section, Chapter II -->
      <div
        class="border-t border-b py-16 md:py-20"
        :style="{ borderColor: `${brand.colors.text}15`, backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div class="flex flex-col gap-2">
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
                CAPÍTULO II
              </span>
              <h2
                class="font-mentor-display"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                }"
              >
                A TRAJETÓRIA
              </h2>
            </div>
            <MoleculesPeriodSelector
              v-model="selectedTimeRange"
              :loading="isLoadingChart"
            />
          </div>
          <AtomsGraphLine
            :data="chartData"
            :legend="chartLabel"
            :height="360"
            :loading="isLoadingChart"
            :markers="chartMarkers"
            @marker-click="onMarkerClick"
          />
        </div>
      </div>

      <!-- Mentor pull quote about decisions -->
      <div
        class="border-b py-20 md:py-24"
        :style="{ borderColor: `${brand.colors.text}15` }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            PAUSA PARA REFLEXÃO
          </span>
          <blockquote
            class="font-mentor-quote mt-6 leading-[0.9]"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2rem, 5.5vw, 5rem)',
            }"
          >
            "{{ mentorAssetQuote }}"
          </blockquote>
          <div class="mt-8 flex items-center gap-4">
            <div class="h-[2px] w-12" :style="{ backgroundColor: brand.colors.primary }" />
            <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}99` }">
              {{ (brand.founder?.name || 'THIAGO NIGRO').toUpperCase() }} · DO MIL AO MILHÃO
            </span>
          </div>
        </div>
      </div>

      <!-- Fundamentals, Chapter III, as a heavy register grid -->
      <div v-if="brand.assetPage.showIndicators" class="mx-auto w-full max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <div class="mb-12 flex flex-col gap-3">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            CAPÍTULO III
          </span>
          <h2
            class="font-mentor-display"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            }"
          >
            AS MÉTRICAS QUE IMPORTAM
          </h2>
          <p class="max-w-2xl text-base" :style="{ color: `${brand.colors.text}B3` }">
            Os números que um investidor disciplinado olha antes de apertar o botão. Sem ruído, sem hype.
          </p>
        </div>

        <!-- Fundamentals list: 6 numbered rows, chunky -->
        <div class="grid gap-0 border" :style="{ borderColor: `${brand.colors.text}15` }">
          <div
            v-for="(item, idx) in mentorFundamentalsList"
            :key="item.label"
            class="group grid items-start gap-6 border-t px-6 py-6 transition-colors md:grid-cols-12 md:gap-10 md:px-10 md:py-8"
            :class="idx === 0 && '!border-t-0'"
            :style="{ borderColor: `${brand.colors.text}15` }"
            @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = `${brand.colors.primary}0D`"
            @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
          >
            <!-- Number -->
            <div class="md:col-span-1">
              <span
                class="font-mentor-display"
                :style="{ color: brand.colors.primary, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }"
              >
                {{ String(idx + 1).padStart(2, '0') }}
              </span>
            </div>
            <!-- Label -->
            <div class="md:col-span-4 md:pl-2">
              <span
                class="font-mentor-display"
                :style="{ color: brand.colors.text, fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', lineHeight: '0.9' }"
              >
                {{ item.label }}
              </span>
              <span
                class="mt-2 block font-mentor-eyebrow"
                :style="{ color: `${brand.colors.text}66` }"
              >
                {{ item.shortCode }}
              </span>
            </div>
            <!-- Description -->
            <div class="md:col-span-5 md:pl-2">
              <p class="text-sm leading-relaxed md:text-base" :style="{ color: `${brand.colors.text}CC` }">
                {{ item.description }}
              </p>
            </div>
            <!-- Value, big block -->
            <div class="md:col-span-2 md:text-right">
              <span
                class="font-mentor-display tabular-nums"
                :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 3.5vw, 3rem)' }"
              >
                {{ item.value || '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chapter IV: The thesis -->
      <div
        class="border-t border-b py-20 md:py-24"
        :style="{ borderColor: `${brand.colors.text}15`, backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-12 md:px-10">
          <div class="md:col-span-4">
            <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
              CAPÍTULO IV
            </span>
            <h2
              class="font-mentor-display mt-3"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                lineHeight: '0.9',
              }"
            >
              A TESE
            </h2>
          </div>
          <div class="md:col-span-8">
            <p
              class="text-lg leading-relaxed md:text-xl"
              :style="{ color: `${brand.colors.text}E6` }"
            >
              {{ mentorThesisText }}
            </p>
            <hr class="mentor-rule mt-10 max-w-[4rem]" :style="{ backgroundColor: brand.colors.primary }" />
            <p class="mt-8 font-mentor-eyebrow" :style="{ color: `${brand.colors.text}80` }">
              RESUMO EM UMA LINHA
            </p>
            <p class="mt-2 font-mentor-display leading-tight" :style="{
              color: brand.colors.text,
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
            }">
              {{ mentorOneLiner }}
            </p>
          </div>
        </div>
      </div>

      <!-- Closing CTA: "DECIDA COM DADOS." -->
      <div class="mx-auto max-w-6xl px-6 py-24 text-center md:px-10 md:py-32">
        <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
          CAPÍTULO FINAL
        </span>
        <h2
          class="font-mentor-display mt-6"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(3rem, 9vw, 9rem)',
          }"
        >
          DECIDA
          <br />
          <span :style="{ color: brand.colors.primary }">COM DADOS.</span>
        </h2>
        <p class="mx-auto mt-8 max-w-xl text-base md:text-lg" :style="{ color: `${brand.colors.text}B3` }">
          Fundamentos, não opinião. Paciência, não timing. Método ARCA, não sorte.
        </p>
        <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <NuxtLink
            to="/auth/register"
            class="group inline-flex items-center gap-3 px-10 py-5 font-mentor-eyebrow text-[13px] transition-transform hover:-translate-y-0.5"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              letterSpacing: '0.18em',
            }"
          >
            <span>COMEÇAR A CONSTRUIR</span>
            <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
          </NuxtLink>
          <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
            GRÁTIS · SEM CARTÃO · ACESSO IMEDIATO
          </span>
        </div>
      </div>
    </div>

    <!-- ========== SHOWTIME VARIANT (Me Poupe!, TV show / pop magazine) ========== -->
    <div
      v-else-if="brand.assetPage.variant === 'showtime'"
      class="relative z-10 flex flex-col overflow-hidden"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- Top lower-third: "AO VIVO · AULA DE HOJE" -->
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-10 md:px-10 md:pt-12">
        <span class="lower-third">EM FOCO · {{ tickerUpper }}</span>
        <span class="font-showtime-label hidden sm:inline" :style="{ color: `${brand.colors.text}80` }">
          {{ assetEditorialDate }}
        </span>
      </div>

      <!-- SHOW COVER: headline framed as "A ficha da galera" + giant price -->
      <div class="relative mx-auto w-full max-w-6xl px-6 pb-10 pt-8 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:pb-14 md:pt-12">
        <!-- Decorative confetti -->
        <div class="pointer-events-none absolute inset-0 opacity-25">
          <div class="absolute left-[6%] top-[15%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          <div class="absolute left-[22%] top-[70%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary }" />
          <div class="absolute right-[12%] top-[8%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          <div class="absolute right-[30%] top-[55%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
        </div>

        <div class="relative md:col-span-7">
          <div class="mb-4 flex items-center gap-3">
            <USkeleton v-if="isLoadingAsset" class="size-14 rounded-2xl" />
            <div
              v-else-if="resolvedLogo"
              class="flex size-14 items-center justify-center overflow-hidden rounded-2xl p-1"
              :style="{ backgroundColor: brand.colors.surface, border: `2px solid ${brand.colors.primary}40` }"
            >
              <img :src="resolvedLogo" :alt="assetName" class="size-full object-contain" />
            </div>
            <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
              {{ (asset?.type || 'AÇÃO').toString().toUpperCase() === 'REIT' ? 'FUNDO IMOBILIÁRIO' : 'AÇÃO' }} · {{ tickerUpper }}
            </span>
          </div>

          <h1
            class="font-showtime-display chunky-shadow"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
            }"
          >
            A ficha da<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">{{ assetName || tickerUpper }}</span>
          </h1>

          <p v-if="!isLoadingAsset && asset?.sector" class="font-showtime-body mt-5 max-w-xl text-base" :style="{ color: `${brand.colors.text}CC` }">
            Setor: <strong :style="{ color: brand.colors.primary }">{{ asset?.sector }}</strong>{{ asset?.industry ? ' · ' + asset.industry : '' }}. Tudo que você precisa saber desse bicho num lugar só, criatura, sem jargão, sem cara feia.
          </p>

          <div class="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">
              PREÇO AGORA
            </span>
            <USkeleton v-if="isLoadingAsset" class="h-14 w-48" />
            <span
              v-else
              class="font-showtime-display tabular-nums"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }"
            >
              R$ {{ formatPriceNumber(asset?.market_price) }}
            </span>
            <span
              v-if="!isLoadingAsset"
              class="font-showtime-label rounded-full px-4 py-2 text-[12px]"
              :style="{
                backgroundColor: Number(asset?.change_percent) >= 0 ? `${brand.colors.positive}25` : `${brand.colors.negative}25`,
                color: Number(asset?.change_percent) >= 0 ? brand.colors.positive : brand.colors.negative,
              }"
            >
              {{ Number(asset?.change_percent) >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2).replace('.', ',') }}% hoje
            </span>
          </div>
        </div>

        <!-- Right: quick stats card tilted -->
        <div class="relative mt-10 md:col-span-5 md:mt-0">
          <div
            class="showtime-frame showtime-frame--tilt-right relative rounded-[28px] p-6"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <div class="washi-tape" />
            <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
              FICHA TÉCNICA
            </span>
            <h3 class="font-showtime-display mt-2" :style="{ color: brand.colors.text, fontSize: '1.5rem' }">
              O pregão de hoje
            </h3>
            <dl class="mt-5 flex flex-col gap-3">
              <div v-for="row in showtimeQuickPanel" :key="row.label" class="flex items-center justify-between">
                <dt class="flex items-center gap-2 font-showtime-label text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                  <UIcon :name="row.icon" class="size-3.5" :style="{ color: brand.colors.primary }" />
                  {{ row.label }}
                </dt>
                <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                  {{ row.value }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Margarete narration strip -->
      <div class="mx-auto w-full max-w-6xl px-6 pb-8 md:px-10">
        <div
          class="flex items-start gap-4 rounded-3xl border-2 border-dashed p-5"
          :style="{ borderColor: `${brand.colors.primary}60`, backgroundColor: `${brand.colors.primary}10` }"
        >
          <img src="/brand/mepoupe/margarete.svg" alt="Margarete" class="h-14 shrink-0" />
          <p class="font-showtime-body text-sm italic" :style="{ color: `${brand.colors.text}CC` }">
            <strong :style="{ color: brand.colors.primary }">Margarete diz:</strong>
            olha só, criatura, esses números ficam subindo e descendo todo dia, é normal. O importante não é o preço de HOJE, é o fundamento. Vamos destrinchar tudo aqui embaixo, beleza?
          </p>
        </div>
      </div>

      <!-- QUADRO 01: Evolução do preço (chart) -->
      <div class="relative py-16 md:py-20" :style="{ backgroundColor: brand.colors.surface }">
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span class="lower-third">QUADRO 01 · COMO ESSE BICHO ANDOU</span>
              <h2
                class="font-showtime-display mt-4"
                :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
              >
                A montanha-russa do<br />
                <span class="highlighter" :style="{ color: brand.colors.primary }">{{ tickerUpper }}</span>
              </h2>
            </div>
            <MoleculesPeriodSelector v-model="selectedTimeRange" :loading="isLoadingChart" />
          </div>

          <div
            class="showtime-frame rounded-[28px] p-5"
            :style="{ backgroundColor: brand.colors.background, transform: 'none' }"
          >
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLabel"
              :height="320"
              :loading="isLoadingChart"
              :markers="chartMarkers"
              @marker-click="onMarkerClick"
            />
          </div>
        </div>
      </div>

      <!-- Wooden spoon divider -->
      <div class="flex items-center justify-center gap-6 py-6">
        <div class="h-[2px] max-w-[180px] flex-1" :style="{ backgroundColor: `${brand.colors.primary}55` }" />
        <img src="/brand/mepoupe/margarete.svg" alt="Margarete" class="h-16" style="transform: rotate(90deg);" />
        <div class="h-[2px] max-w-[180px] flex-1" :style="{ backgroundColor: `${brand.colors.primary}55` }" />
      </div>

      <!-- QUADRO 02: Indicadores como "cartões colecionáveis" -->
      <div v-if="brand.assetPage.showIndicators" class="relative py-16 md:py-20">
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="mb-10 text-center">
            <span class="lower-third">QUADRO 02 · O QUE OS NÚMEROS DIZEM</span>
            <h2
              class="font-showtime-display mt-5"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
            >
              Indicadores traduzidos<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">pra gente normal</span>
            </h2>
            <p class="font-showtime-body mx-auto mt-6 max-w-2xl text-base" :style="{ color: `${brand.colors.text}CC` }">
              Esses nomes parecem coisa de outro planeta mas são só ferramentas pra entender se a empresa é saudável. Respira, criatura. Vamos com calma.
            </p>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="(card, idx) in showtimeIndicatorCards"
              :key="card.label"
              class="showtime-frame relative rounded-[24px] p-5"
              :class="idx % 2 === 0 ? 'showtime-frame--tilt-left' : 'showtime-frame--tilt-right'"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <div class="washi-tape" />
              <div
                class="mb-4 flex size-12 items-center justify-center rounded-full"
                :style="{ backgroundColor: `${brand.colors.primary}25` }"
              >
                <UIcon :name="card.icon" class="size-6" :style="{ color: brand.colors.primary }" />
              </div>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">
                {{ card.label }}
              </span>
              <div
                class="font-showtime-display mt-1 tabular-nums"
                :style="{ color: brand.colors.text, fontSize: '2rem' }"
              >
                {{ card.value }}
              </div>
              <p class="font-showtime-body mt-3 text-[12px] italic" :style="{ color: `${brand.colors.text}B3` }">
                "{{ card.explain }}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- QUADRO 03: Dividendos em estilo piggy bank -->
      <div v-if="dividendsData.length > 0" class="relative py-16 md:py-20" :style="{ backgroundColor: brand.colors.surface }">
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="mb-10">
            <span class="lower-third">QUADRO 03 · DINHEIRO PINGANDO</span>
            <h2
              class="font-showtime-display mt-5"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
            >
              Os dividendos do<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">{{ tickerUpper }}</span> 🐷
            </h2>
            <p class="font-showtime-body mt-5 max-w-2xl text-base" :style="{ color: `${brand.colors.text}CC` }">
              Cada centavo que essa empresa te paga por ser dono dela. É o tal do dinheiro "trabalhando pra você" enquanto você dorme, o nosso querido juro composto, esse filho maravilhoso!
            </p>
          </div>

          <div
            class="showtime-frame showtime-frame--tilt-left rounded-[28px] p-6"
            :style="{ backgroundColor: brand.colors.background }"
          >
            <div class="washi-tape" />
            <ul class="flex flex-col gap-3">
              <li
                v-for="(div, idx) in showtimeDividendsPreview"
                :key="`div-${idx}`"
                class="flex items-center gap-4 rounded-2xl p-3 transition-transform hover:translate-x-1"
                :style="{ backgroundColor: brand.colors.surface }"
              >
                <div
                  class="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl"
                  :style="{ backgroundColor: `${brand.colors.primary}25` }"
                >
                  🪙
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-showtime-body text-base font-bold" :style="{ color: brand.colors.text }">
                    {{ div.label || 'Dividendo' }}
                  </div>
                  <div class="font-showtime-body text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                    Pagou dia {{ formatShowtimeDate(div.payment_date) }}
                  </div>
                </div>
                <span
                  class="font-showtime-label rounded-full px-4 py-2 text-[12px]"
                  :style="{ backgroundColor: `${brand.colors.positive}20`, color: brand.colors.positive }"
                >
                  R$ {{ formatDividendRate(div.rate) }}
                </span>
              </li>
            </ul>
            <p v-if="dividendsData.length > showtimeDividendsPreview.length" class="font-showtime-label mt-5 text-center" :style="{ color: `${brand.colors.text}70` }">
              + {{ dividendsData.length - showtimeDividendsPreview.length }} PROVENTOS NO HISTÓRICO
            </p>
          </div>
        </div>
      </div>

      <!-- QUADRO 04: Sobre a empresa (company info) -->
      <div v-if="brand.assetPage.showCompanyInfo && asset?.description" class="relative py-16 md:py-20">
        <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div class="grid gap-10 md:grid-cols-12">
            <div class="md:col-span-5">
              <span class="lower-third">QUADRO 04 · QUEM É ESSA EMPRESA</span>
              <h2
                class="font-showtime-display mt-5"
                :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
              >
                Afinal, o que a<br />
                <span class="highlighter" :style="{ color: brand.colors.primary }">{{ assetName }}</span> faz?
              </h2>
              <p class="font-showtime-body mt-5 text-base" :style="{ color: `${brand.colors.text}CC` }">
                Antes de investir no bicho, você precisa saber o que ele come, onde dorme e como ganha dinheiro, criatura. Regra número 1 da Nath.
              </p>
            </div>
            <div class="md:col-span-7">
              <div
                class="showtime-frame showtime-frame--tilt-right rounded-[28px] p-6"
                :style="{ backgroundColor: brand.colors.surface }"
              >
                <div class="washi-tape" />
                <p class="font-showtime-body text-[15px] leading-relaxed" :style="{ color: `${brand.colors.text}E6` }">
                  {{ asset.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CLOSING BUMPER: CTA pra Na_th IA -->
      <div class="relative py-20 md:py-28" :style="{ backgroundColor: brand.colors.surface }">
        <div class="mx-auto max-w-4xl px-6 text-center md:px-10">
          <span class="lower-third">BORA LÁ, CRIATURA!</span>
          <h2
            class="font-showtime-display chunky-shadow mt-6"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }"
          >
            Ficou com dúvida,<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">criatura?</span>
          </h2>
          <p class="font-showtime-body mt-6 text-base" :style="{ color: `${brand.colors.text}CC` }">
            A Na_th IA tá acordada 24h pra te ajudar a entender qualquer coisa sobre o {{ tickerUpper }}. Pergunte sem medo.
          </p>
          <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NuxtLink
              to="/help"
              class="group inline-flex items-center gap-3 rounded-full px-10 py-5 font-showtime-label transition-transform hover:-translate-y-0.5"
              :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
            >
              <UIcon name="i-lucide-sparkles" class="size-5" />
              FALAR COM A NA_TH IA
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
            <NuxtLink
              to="/"
              class="font-showtime-label text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.text }"
            >
              Voltar pro programa
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== EDITORIAL VARIANT (Norte Capital, "letter from your advisor") ========== -->
    <div
      v-else-if="brand.assetPage.variant === 'editorial'"
      class="relative z-10 flex flex-col"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Editorial header strip: eyebrow + date + page number -->
      <header class="mx-auto flex w-full max-w-4xl items-start justify-between px-6 pt-10 md:px-10 md:pt-14">
        <div class="flex flex-col gap-0.5">
          <span
            class="font-small-caps text-[11px]"
            :style="{ color: brand.colors.textMuted }"
          >
            Norte Capital &nbsp;·&nbsp; Análise de ativo
          </span>
          <span
            class="font-editorial-body text-[12px] italic"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ assetEditorialDate }}
          </span>
        </div>
        <span
          class="font-editorial-body text-[11px] italic tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >
          {{ tickerUpper }}
        </span>
      </header>

      <!-- Hero: company name huge + quiet price -->
      <div class="mx-auto w-full max-w-4xl px-6 pb-8 pt-16 md:px-10 md:pt-20">
        <span
          class="font-small-caps text-[11px]"
          :style="{ color: brand.colors.secondary }"
        >
          {{ (asset?.type || 'ACAO').toString().toUpperCase() === 'REIT' ? 'Fundo imobiliário' : 'Ação' }} &nbsp;·&nbsp; {{ tickerUpper }}
        </span>
        <h1
          class="font-editorial-display mt-2 leading-[0.95] tracking-tight"
          :style="{ color: brand.colors.text, fontSize: 'clamp(3rem, 7vw, 6rem)' }"
        >
          {{ asset?.name || assetName }}
        </h1>

        <hr class="hairline-rule mt-8 max-w-[6rem]" />

        <!-- Price narrated, not tabular -->
        <div class="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span class="font-editorial-body text-lg italic" :style="{ color: brand.colors.textMuted }">
            Cotação atual
          </span>
          <span
            class="font-editorial-display font-serif-numeric leading-none"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(3rem, 6vw, 5rem)',
            }"
          >
            R$ {{ formatPriceNumber(asset?.market_price) }}
          </span>
          <span
            class="font-editorial-display text-2xl italic"
            :style="{
              color: Number(asset?.change_percent) >= 0 ? brand.colors.positive : brand.colors.negative,
            }"
          >
            {{ Number(asset?.change_percent) >= 0 ? '+' : '−' }}{{ Math.abs(Number(asset?.change_percent) || 0).toFixed(2).replace('.', ',') }}% hoje
          </span>
        </div>

        <p
          v-if="editorialPriceNarration"
          class="font-editorial-body mt-6 max-w-2xl italic"
          :style="{ color: brand.colors.textMuted, fontSize: '1.05rem' }"
        >
          {{ editorialPriceNarration }}
        </p>
      </div>

      <hr class="hairline-rule mx-auto max-w-4xl" />

      <!-- Chapter I: Price chart with editorial framing -->
      <div class="mx-auto w-full max-w-4xl px-6 py-16 md:px-10">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div class="flex flex-col gap-1">
            <span class="font-small-caps text-[11px]" :style="{ color: brand.colors.secondary }">
              Capítulo I
            </span>
            <h2 class="font-editorial-display text-3xl leading-tight md:text-4xl" :style="{ color: brand.colors.text }">
              A trajetória do preço
            </h2>
          </div>
          <MoleculesPeriodSelector
            v-model="selectedTimeRange"
            :loading="isLoadingChart"
          />
        </div>
        <AtomsGraphLine
          :data="chartData"
          :legend="chartLabel"
          :height="320"
          :loading="isLoadingChart"
          :markers="chartMarkers"
          @marker-click="onMarkerClick"
        />
      </div>

      <hr class="hairline-rule mx-auto max-w-4xl" />

      <!-- Chapter II: The fundamentals, narrated -->
      <div v-if="brand.assetPage.showIndicators" class="mx-auto w-full max-w-4xl px-6 py-16 md:grid md:grid-cols-12 md:gap-10 md:px-10">
        <div class="md:col-span-4">
          <span class="font-small-caps text-[11px]" :style="{ color: brand.colors.secondary }">
            Capítulo II
          </span>
          <h2 class="font-editorial-display mt-1 text-3xl leading-tight md:text-4xl" :style="{ color: brand.colors.text }">
            A tese de investimento
          </h2>
          <p class="font-editorial-body mt-4 italic" :style="{ color: brand.colors.textMuted, fontSize: '0.95rem' }">
            Os números que, na nossa leitura, definem a conversa sobre este ativo.
          </p>
        </div>
        <div class="mt-6 md:col-span-7 md:col-start-6 md:mt-0">
          <p
            v-if="editorialThesisText"
            class="font-editorial-body dropcap"
            :style="{ color: brand.colors.text, fontSize: '1.1rem' }"
          >
            {{ editorialThesisText }}
          </p>

          <!-- Narrative metric list, oldstyle numbers inline, no grid -->
          <dl class="mt-8 flex flex-col gap-5">
            <div
              v-for="(item, idx) in editorialFundamentalsList"
              :key="item.label"
              class="flex items-baseline gap-4 border-t pt-4"
              :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }"
            >
              <span
                class="font-editorial-display text-xl italic"
                :style="{ color: brand.colors.secondary }"
              >
                {{ romanNumeralAsset(idx + 1) }}
              </span>
              <dt
                class="font-editorial-body flex-1 italic"
                :style="{ color: brand.colors.textMuted, fontSize: '1rem' }"
              >
                {{ item.label }}
              </dt>
              <dd
                class="font-editorial-display font-serif-numeric text-2xl"
                :style="{ color: brand.colors.text }"
              >
                {{ item.value || '-' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <hr class="hairline-rule mx-auto max-w-4xl" />

      <!-- Chapter III: Advisor commentary, static narrative fallback when AI commentaries are off -->
      <div class="mx-auto w-full max-w-4xl px-6 py-16 md:grid md:grid-cols-12 md:gap-10 md:px-10">
        <div class="md:col-span-4">
          <span class="font-small-caps text-[11px]" :style="{ color: brand.colors.secondary }">
            Capítulo III
          </span>
          <h2 class="font-editorial-display mt-1 text-3xl leading-tight md:text-4xl" :style="{ color: brand.colors.text }">
            Nota do seu assessor
          </h2>
        </div>
        <div class="mt-6 md:col-span-7 md:col-start-6 md:mt-0">
          <blockquote
            class="font-editorial-display border-l-2 pl-6 italic"
            :style="{
              color: brand.colors.text,
              borderColor: brand.colors.secondary,
              fontSize: 'clamp(1.25rem, 1.8vw, 1.75rem)',
              lineHeight: '1.35',
            }"
          >
            "Mantemos esta posição em nossas carteiras modelo. O preço atual oferece uma margem de segurança razoável em relação à nossa estimativa de valor justo, e a distribuição consistente de proventos ao longo dos últimos anos reforça nossa convicção na qualidade do negócio."
          </blockquote>
          <div class="mt-8">
            <AtomsAdvisorSignature
              name="Marcelo Oliveira, CFA"
              role="Seu assessor dedicado · Norte Capital"
              closing=", Comentário de hoje"
            />
          </div>
        </div>
      </div>

      <hr class="hairline-rule mx-auto max-w-4xl" />

      <!-- Chapter IV: Company identity, quiet and dry -->
      <div v-if="brand.assetPage.showCompanyInfo" class="mx-auto w-full max-w-4xl px-6 py-16 md:grid md:grid-cols-12 md:gap-10 md:px-10">
        <div class="md:col-span-4">
          <span class="font-small-caps text-[11px]" :style="{ color: brand.colors.secondary }">
            Capítulo IV
          </span>
          <h2 class="font-editorial-display mt-1 text-3xl leading-tight md:text-4xl" :style="{ color: brand.colors.text }">
            A empresa
          </h2>
        </div>
        <div class="mt-6 md:col-span-7 md:col-start-6 md:mt-0">
          <dl class="flex flex-col gap-4">
            <div v-if="asset?.sector" class="flex items-baseline gap-4 border-t pt-4" :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }">
              <dt class="font-small-caps w-32 text-[11px]" :style="{ color: brand.colors.textMuted }">
                Setor
              </dt>
              <dd class="font-editorial-body" :style="{ color: brand.colors.text }">
                {{ asset.sector }}
              </dd>
            </div>
            <div v-if="asset?.industry" class="flex items-baseline gap-4 border-t pt-4" :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }">
              <dt class="font-small-caps w-32 text-[11px]" :style="{ color: brand.colors.textMuted }">
                Indústria
              </dt>
              <dd class="font-editorial-body" :style="{ color: brand.colors.text }">
                {{ asset.industry }}
              </dd>
            </div>
            <div v-if="asset?.website" class="flex items-baseline gap-4 border-t pt-4" :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }">
              <dt class="font-small-caps w-32 text-[11px]" :style="{ color: brand.colors.textMuted }">
                Site institucional
              </dt>
              <dd>
                <a
                  :href="asset.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-editorial-body border-b pb-[1px] transition-colors"
                  :style="{
                    color: brand.colors.text,
                    borderColor: brand.colors.secondary,
                  }"
                >
                  {{ asset.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }} →
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Bottom strip: compliance + ticker echo -->
      <div
        class="mx-auto flex w-full max-w-4xl items-center justify-between border-t px-6 py-6 font-editorial-body text-[11px] italic md:px-10"
        :style="{
          borderColor: `color-mix(in srgb, ${brand.colors.text} 12%, transparent)`,
          color: brand.colors.textMuted,
        }"
      >
        <span>Credenciada CVM · Ancord · Esta análise não constitui recomendação de investimento.</span>
        <span class="tabular-nums">{{ tickerUpper }}</span>
      </div>
    </div>

    <!-- ========== PLAYBOOK VARIANT (Saraiva Invest, calm method + chunky sticker accents) ========== -->
    <!--
      Playbook asset page: dark profundo + amber + chunky sticker highlights
      no estilo do logo. Dados densos mas calmos, framing do "método aplicado
      a este ativo". Sem alertas piscantes, sem badges hype.

      Estrutura:
        §1  Lower-third com data + catchphrase "cabeça fria"
        §2  Hero: ticker + name + sticker-price + variation
        §3  "O método diz", 4 cards horizontais (P/L, DY, Preço-teto, ROE)
        §4  Checklist do investidor (se houver)
        §5  Fundamentais
        §6  Signature closing, foto do André + quote
    -->
    <div
      v-else-if="brand.assetPage.variant === 'playbook'"
      class="pb-asset-root relative z-10 flex flex-col"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- Atmospheric glows -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-40 right-0 h-[560px] w-[900px] rounded-full blur-3xl opacity-20"
          :style="{ background: `radial-gradient(ellipse, ${brand.colors.primary}, transparent 65%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{
            backgroundImage: `radial-gradient(${brand.colors.text} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }"
        />
      </div>

      <!-- §1 · Top lower-third strip -->
      <div class="pb-asset-strip relative z-10 mx-auto w-full max-w-7xl px-6 pt-10 md:px-10 md:pt-12">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div
              class="pb-asset-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 6px 20px -6px ${brand.colors.primary}80, 0 0 0 2px ${brand.colors.background}, 0 0 0 4px ${brand.colors.primary}40`,
              }"
            >
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.background }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.background }" />
              </span>
              <span class="text-[10px] font-bold uppercase tracking-[0.15em]">CABEÇA FRIA · {{ tickerUpper }}</span>
            </div>
            <span class="text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              Análise do método · {{ assetEditorialDate }}
            </span>
          </div>
          <span class="text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
            B3 · {{ tickerUpper }}
          </span>
        </div>
      </div>

      <!-- §2 · Hero: ticker + giant price -->
      <section class="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div class="grid gap-10 md:grid-cols-12 md:gap-12">
          <!-- LEFT: ticker identity -->
          <div class="md:col-span-7">
            <!-- Logo + ticker row -->
            <div class="mb-6 flex items-center gap-5">
              <img
                v-if="resolvedLogo"
                :src="resolvedLogo"
                :alt="tickerUpper"
                class="size-20 rounded-2xl object-cover"
                :style="{ backgroundColor: brand.colors.surface, border: `2px solid ${brand.colors.border}` }"
              />
              <div
                v-else
                class="flex size-20 items-center justify-center rounded-2xl text-[26px] font-black"
                :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
              >
                {{ tickerUpper.slice(0, 2) }}
              </div>
              <div>
                <div class="pb-asset-ticker text-[52px] font-black leading-[0.9] tracking-tight md:text-[72px]" :style="{ color: brand.colors.text }">
                  {{ tickerUpper }}
                </div>
                <div class="mt-1 text-[14px] font-medium" :style="{ color: brand.colors.textMuted }">
                  {{ asset?.name || 'Empresa listada na B3' }}
                </div>
              </div>
            </div>

            <!-- Price row -->
            <div class="flex items-baseline gap-5">
              <div class="pb-asset-price" :style="{ color: brand.colors.text }">
                <span class="text-[14px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">R$&nbsp;</span>
                <span class="text-[76px] font-black leading-none tabular-nums md:text-[96px]">
                  {{ (asset?.market_price ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </div>
              <div
                class="pb-asset-change inline-flex items-center gap-1.5 rounded-full px-4 py-2"
                :style="{
                  backgroundColor: (asset?.change_percent ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative,
                  color: brand.colors.background,
                  boxShadow: `0 6px 20px -6px ${(asset?.change_percent ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative}80`,
                }"
              >
                <UIcon
                  :name="(asset?.change_percent ?? 0) >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                  class="size-4"
                />
                <span class="text-[14px] font-bold tabular-nums">
                  {{ (asset?.change_percent ?? 0) >= 0 ? '+' : '' }}{{ (asset?.change_percent ?? 0).toFixed(2) }}%
                </span>
              </div>
            </div>

            <p class="mt-6 max-w-xl text-[14px]" :style="{ color: `${brand.colors.text}A0` }">
              {{ lastUpdateLabel ? `Última atualização: ${lastUpdateLabel}` : 'Cotação em tempo real.' }}
              Zero alerta vermelho piscante, só o dado.
            </p>
          </div>

          <!-- RIGHT: sector + type badge -->
          <div class="md:col-span-5">
            <div
              class="flex flex-col gap-5 rounded-3xl border p-8"
              :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}80` }"
            >
              <div class="text-[11px] font-bold uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                Ficha técnica
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Tipo</div>
                  <div class="mt-1 text-[15px] font-bold" :style="{ color: brand.colors.text }">
                    {{ asset?.type === 'STOCK' ? 'Ação' : asset?.type === 'REIT' ? 'FII' : asset?.type === 'ETF' ? 'ETF' : asset?.type || '-' }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Setor</div>
                  <div class="mt-1 truncate text-[15px] font-bold" :style="{ color: brand.colors.text }">
                    {{ asset?.sector || '-' }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Market Cap</div>
                  <div class="mt-1 text-[15px] font-bold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ formatMarketCapShort(asset?.market_cap) || '-' }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Listado desde</div>
                  <div class="mt-1 text-[15px] font-bold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ asset?.founded_at ? new Date(asset.founded_at).getFullYear() : '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- §3 · "O método diz", indicator cards -->
      <section class="relative z-10 border-y" :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}40` }">
        <div class="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 max-w-3xl">
            <div class="mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
             , O método diz
            </div>
            <h2
              class="leading-[0.95] tracking-tight"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontFamily: `'Fredoka', 'Inter', sans-serif`,
                fontWeight: 700,
              }"
            >
              O que os dados<br />
              dizem sobre <span class="pb-asset-sticker" :style="{ color: brand.colors.primary }">{{ tickerUpper }}.</span>
            </h2>
          </div>

          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <!-- P/L -->
            <div
              class="flex flex-col gap-4 rounded-3xl border p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Preço / Lucro
                </div>
                <UIcon name="i-lucide-scale" class="size-4" :style="{ color: brand.colors.textMuted }" />
              </div>
              <div class="text-[46px] font-black leading-none tabular-nums" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                {{ basicIndicators?.pl || '-' }}
              </div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">
                Relação entre preço atual e lucro por ação.
              </div>
            </div>

            <!-- DY -->
            <div
              class="flex flex-col gap-4 rounded-3xl border p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Dividend Yield
                </div>
                <UIcon name="i-lucide-coins" class="size-4" :style="{ color: brand.colors.textMuted }" />
              </div>
              <div class="text-[46px] font-black leading-none tabular-nums" :style="{ color: brand.colors.positive, fontFamily: `'Fredoka', sans-serif` }">
                {{ basicIndicators?.dividendYield || '-' }}
              </div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">
                Retorno em dividendos nos últimos 12 meses.
              </div>
            </div>

            <!-- P/VPA -->
            <div
              class="flex flex-col gap-4 rounded-3xl border p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Preço / VPA
                </div>
                <UIcon name="i-lucide-layout-grid" class="size-4" :style="{ color: brand.colors.textMuted }" />
              </div>
              <div class="text-[46px] font-black leading-none tabular-nums" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                {{ basicIndicators?.pvpa || '-' }}
              </div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">
                Preço em relação ao valor patrimonial.
              </div>
            </div>

            <!-- ROE -->
            <div
              class="flex flex-col gap-4 rounded-3xl border p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  ROE
                </div>
                <UIcon name="i-lucide-trending-up" class="size-4" :style="{ color: brand.colors.textMuted }" />
              </div>
              <div class="text-[46px] font-black leading-none tabular-nums" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                {{ basicIndicators?.roe || '-' }}
              </div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">
                Retorno sobre patrimônio líquido.
              </div>
            </div>
          </div>

          <!-- Method commentary -->
          <div
            class="mt-10 flex items-start gap-4 rounded-3xl border p-6 md:p-8"
            :style="{ borderColor: `${brand.colors.primary}40`, backgroundColor: `${brand.colors.primary}08` }"
          >
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-xl"
              :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
            >
              <UIcon name="i-lucide-flask-conical" class="size-5" />
            </div>
            <div class="flex-1">
              <div class="text-[11px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                Nota do método
              </div>
              <p class="mt-2 text-[14px] leading-relaxed" :style="{ color: brand.colors.text }">
                Esses números são um ponto de partida, não uma sentença. O que importa é o histórico de consistência, a qualidade da gestão e o ciclo do setor.
                <strong :style="{ color: brand.colors.primary }">Cabeça fria</strong> e zero FOMO.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           §3.5 · CABEÇA QUENTE vs CABEÇA FRIA, debate split
           ============================================================
           Os dois personagens reagem ao MESMO ativo de jeitos opostos.
           Reações dinâmicas baseadas no preço atual, P/L, DY, etc.
           Pedagógico: o leitor vê o ridículo do impulso e a sanidade
           do método lado a lado, ambos olhando os mesmos dados.
      -->
      <section class="relative z-10 overflow-hidden">
        <!-- Background flame on left, amber on right -->
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full blur-3xl opacity-[0.15]"
            style="background: radial-gradient(circle, #EF4444, transparent 65%);"
          />
          <div
            class="absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full blur-3xl opacity-[0.15]"
            :style="{ background: `radial-gradient(circle, ${brand.colors.primary}, transparent 65%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <!-- Header -->
          <div class="mb-14 max-w-3xl">
            <div class="mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
             , Como cada um vê
            </div>
            <h2
              class="leading-[0.95] tracking-tight"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                fontFamily: `'Fredoka', 'Inter', sans-serif`,
                fontWeight: 700,
              }"
            >
              <span class="pb-asset-sticker pb-asset-sticker-cold" :style="{ color: brand.colors.primary }">Cabeça Fria</span>
              vs.
              <span class="pb-asset-sticker pb-asset-sticker-hot">Cabeça Quente.</span><br />
              Olhando o mesmo {{ tickerUpper }}.
            </h2>
            <p class="mt-6 max-w-2xl text-[15px] leading-relaxed" :style="{ color: `${brand.colors.text}B0` }">
              Os mesmos números aí em cima podem ser lidos de dois jeitos. Um destrói patrimônio. O outro constrói.
              <strong :style="{ color: brand.colors.text }">Adivinha qual é qual.</strong>
            </p>
          </div>

          <!-- Debate cards: villain LEFT, hero RIGHT -->
          <div class="grid gap-6 md:grid-cols-2">
            <!-- LEFT: Cabeça Quente -->
            <div
              class="pb-asset-villain relative flex flex-col gap-6 rounded-3xl border-2 p-8 md:p-10"
              style="border-color: #EF4444; background: rgba(239, 68, 68, 0.05);"
            >
              <!-- Avatar -->
              <div class="flex items-center gap-4">
                <div class="pb-asset-villain-avatar relative shrink-0">
                  <div
                    class="flex size-16 items-center justify-center rounded-full"
                    style="background: #EF4444; box-shadow: 0 0 0 3px #0B0B0E, 0 0 0 6px #EF4444, 0 16px 32px -8px rgba(239, 68, 68, 0.5);"
                  >
                    <UIcon name="i-lucide-flame" class="size-8 text-white" />
                  </div>
                  <!-- sweat drops -->
                  <div class="pb-asset-sweat absolute -right-1 top-1 size-2.5 rounded-full bg-blue-300 opacity-80"></div>
                  <div class="pb-asset-sweat pb-asset-sweat-2 absolute -left-2 top-4 size-2 rounded-full bg-blue-300 opacity-80"></div>
                </div>
                <div>
                  <div class="text-[10px] font-bold uppercase tracking-[0.18em]" style="color: #EF4444;">
                    O VILÃO REAGE
                  </div>
                  <div class="text-[24px] font-black leading-tight md:text-[28px]" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                    Cabeça Quente.
                  </div>
                </div>
              </div>

              <!-- Reactions to actual data -->
              <div class="flex flex-col gap-4">
                <!-- Reaction to price/change -->
                <div class="flex items-start gap-3 rounded-2xl border px-4 py-3" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                  <UIcon name="i-lucide-megaphone" class="size-4 shrink-0 mt-0.5" style="color: #EF4444;" />
                  <div class="text-[14px] font-bold leading-snug italic" style="color: #FF8A8A;">
                    <template v-if="(asset?.change_percent ?? 0) > 3">
                      "+{{ Number(asset?.change_percent || 0).toFixed(1) }}%?! PERDI A CORRIDA! COMPRA TUDO ANTES QUE SUBA MAIS!"
                    </template>
                    <template v-else-if="(asset?.change_percent ?? 0) < -3">
                      "{{ Number(asset?.change_percent || 0).toFixed(1) }}%?! VAI ZERAR! VENDE TUDO AGORA, SALVA O QUE DÁ!"
                    </template>
                    <template v-else-if="(asset?.change_percent ?? 0) > 0">
                      "Só +{{ Number(asset?.change_percent || 0).toFixed(1) }}%?! Que tédio! Vou trocar por algo que sobe mais rápido!"
                    </template>
                    <template v-else>
                      "{{ Number(asset?.change_percent || 0).toFixed(1) }}%?! Já começou a queda! Foge enquanto pode!"
                    </template>
                  </div>
                </div>

                <!-- Reaction to DY -->
                <div v-if="basicIndicators?.dividendYield" class="flex items-start gap-3 rounded-2xl border px-4 py-3" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                  <UIcon name="i-lucide-megaphone" class="size-4 shrink-0 mt-0.5" style="color: #EF4444;" />
                  <div class="text-[14px] font-bold leading-snug italic" style="color: #FF8A8A;">
                    "{{ basicIndicators.dividendYield }} de dividendo?! É O MELHOR DO BRASIL! COMPRA TUDO AGORA, MAIS TARDE EU PENSO NO PORQUÊ!"
                  </div>
                </div>

                <!-- Reaction to P/L -->
                <div v-if="basicIndicators?.pl" class="flex items-start gap-3 rounded-2xl border px-4 py-3" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                  <UIcon name="i-lucide-megaphone" class="size-4 shrink-0 mt-0.5" style="color: #EF4444;" />
                  <div class="text-[14px] font-bold leading-snug italic" style="color: #FF8A8A;">
                    "P/L de {{ basicIndicators.pl }}?! Tá BARATO DEMAIS, certeza que tem coisa errada, FOGE!"
                  </div>
                </div>
              </div>

              <!-- Disclaimer footer -->
              <div class="mt-auto flex items-start gap-2 border-t pt-5" style="border-color: rgba(239, 68, 68, 0.3);">
                <UIcon name="i-lucide-x-circle" class="size-3.5 shrink-0 mt-0.5" style="color: #EF4444;" />
                <span class="text-[11px] font-bold uppercase tracking-[0.1em] leading-snug" style="color: #FF8A8A;">
                  Isso não é uma estratégia. É um diagnóstico.
                </span>
              </div>
            </div>

            <!-- RIGHT: Cabeça Fria -->
            <div
              class="pb-asset-hero relative flex flex-col gap-6 rounded-3xl border-2 p-8 md:p-10"
              :style="{ borderColor: brand.colors.primary, backgroundColor: `${brand.colors.primary}08` }"
            >
              <!-- Avatar -->
              <div class="flex items-center gap-4">
                <div class="shrink-0">
                  <img
                    v-if="brand.hero.image"
                    :src="brand.hero.image"
                    :alt="brand.founder.name"
                    class="size-16 rounded-full object-cover"
                    :style="{
                      backgroundColor: brand.colors.primary,
                      boxShadow: `0 0 0 3px ${brand.colors.background}, 0 0 0 6px ${brand.colors.primary}, 0 16px 32px -8px ${brand.colors.primary}80`,
                    }"
                  />
                  <div
                    v-else
                    class="flex size-16 items-center justify-center rounded-full"
                    :style="{
                      backgroundColor: brand.colors.primary,
                      boxShadow: `0 0 0 3px ${brand.colors.background}, 0 0 0 6px ${brand.colors.primary}, 0 16px 32px -8px ${brand.colors.primary}80`,
                    }"
                  >
                    <UIcon name="i-lucide-snowflake" class="size-8" :style="{ color: brand.colors.background }" />
                  </div>
                </div>
                <div>
                  <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                    O HERÓI RESPONDE
                  </div>
                  <div class="text-[24px] font-black leading-tight md:text-[28px]" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                    Cabeça Fria.
                  </div>
                </div>
              </div>

              <!-- Calm interpretations of the same data -->
              <div class="flex flex-col gap-4">
                <!-- Calm reading of price -->
                <div class="flex items-start gap-3 rounded-2xl border px-4 py-3" :style="{ borderColor: `${brand.colors.primary}40`, backgroundColor: `${brand.colors.primary}08` }">
                  <UIcon name="i-lucide-snowflake" class="size-4 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                  <div class="text-[14px] leading-snug" :style="{ color: brand.colors.text }">
                    Variação de
                    <strong class="tabular-nums" :style="{ color: brand.colors.primary }">{{ (asset?.change_percent ?? 0) >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(1) }}%</strong>
                    num único dia é <strong>ruído estatístico</strong>. Decisão de investir não se toma olhando candle de 5 minutos, se toma olhando histórico de 5 anos.
                  </div>
                </div>

                <!-- Calm reading of DY -->
                <div v-if="basicIndicators?.dividendYield" class="flex items-start gap-3 rounded-2xl border px-4 py-3" :style="{ borderColor: `${brand.colors.primary}40`, backgroundColor: `${brand.colors.primary}08` }">
                  <UIcon name="i-lucide-snowflake" class="size-4 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                  <div class="text-[14px] leading-snug" :style="{ color: brand.colors.text }">
                    DY de
                    <strong :style="{ color: brand.colors.primary }">{{ basicIndicators.dividendYield }}</strong>
                    é uma <strong>foto, não um filme</strong>. Vai no histórico: paga há quantos anos? É consistente? Se não pagou em 2020, é armadilha, não oportunidade.
                  </div>
                </div>

                <!-- Calm reading of P/L -->
                <div v-if="basicIndicators?.pl" class="flex items-start gap-3 rounded-2xl border px-4 py-3" :style="{ borderColor: `${brand.colors.primary}40`, backgroundColor: `${brand.colors.primary}08` }">
                  <UIcon name="i-lucide-snowflake" class="size-4 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                  <div class="text-[14px] leading-snug" :style="{ color: brand.colors.text }">
                    P/L de
                    <strong :style="{ color: brand.colors.primary }">{{ basicIndicators.pl }}</strong>
                    pode ser desconto, pode ser problema. <strong>Estuda o setor</strong>: se o ciclo tá no fundo, é oportunidade. Se a empresa tá perdendo mercado, é armadilha.
                  </div>
                </div>
              </div>

              <!-- Method footer -->
              <div class="mt-auto flex items-start gap-2 border-t pt-5" :style="{ borderColor: `${brand.colors.primary}30` }">
                <UIcon name="i-lucide-check-circle-2" class="size-3.5 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                <span class="text-[11px] font-bold uppercase tracking-[0.1em] leading-snug" :style="{ color: brand.colors.primary }">
                  Isso é o método. Cabeça fria.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           §3.7 · MOVIMENTOS NOTÁVEIS, timeline com framing dos personagens
           ============================================================
           Cada commentary do mercado é um momento histórico em que algo
           aconteceu com o ativo. Aqui mostramos como timeline editorial:
           data + magnitude + título + reação cabeça quente em vermelho +
           leitura calma do método em ambar. É a literalização do
           manifesto: "olha o mesmo evento por dois lados."
      -->
      <section
        v-if="commentaries.length > 0"
        class="relative z-10 border-y"
        :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}40` }"
      >
        <div class="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <!-- Header -->
          <div class="mb-14 max-w-3xl">
            <div class="mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
             , Movimentos notáveis
            </div>
            <h2
              class="leading-[0.95] tracking-tight"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                fontFamily: `'Fredoka', 'Inter', sans-serif`,
                fontWeight: 700,
              }"
            >
              Cada movimento<br />
              tem <span class="pb-asset-sticker" :style="{ color: brand.colors.primary }">duas leituras.</span>
            </h2>
            <p class="mt-6 max-w-2xl text-[15px] leading-relaxed" :style="{ color: `${brand.colors.text}B0` }">
              Toda vez que o {{ tickerUpper }} se mexeu de forma notável, o
              <strong style="color: #EF4444;">Cabeça Quente</strong> reagiu no impulso
              e o <strong :style="{ color: brand.colors.primary }">Cabeça Fria</strong> respondeu no método.
              Aqui está a história, lado a lado.
            </p>
          </div>

          <!-- Timeline of commentaries (max 5) -->
          <div class="flex flex-col gap-8">
            <article
              v-for="(c, idx) in commentaries.slice(0, 5)"
              :key="c.id || idx"
              class="pb-asset-event relative grid gap-6 md:grid-cols-12 md:gap-10"
            >
              <!-- LEFT: timestamp / magnitude -->
              <div class="flex items-start gap-4 md:col-span-3">
                <!-- Big rotated date sticker -->
                <div
                  class="pb-asset-event-date inline-flex flex-col items-center justify-center rounded-2xl px-5 py-4"
                  :style="{
                    backgroundColor: brand.colors.background,
                    border: `2px solid ${brand.colors.border}`,
                  }"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
                    {{ formatEventMonth(c.date) }}
                  </div>
                  <div class="text-[32px] font-black leading-none tabular-nums" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                    {{ formatEventDay(c.date) }}
                  </div>
                  <div class="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                    {{ formatEventYear(c.date) }}
                  </div>
                </div>
                <!-- Magnitude pill -->
                <div
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold tabular-nums"
                  :style="{
                    backgroundColor: (c.change_percent ?? 0) >= 0 ? `${brand.colors.positive}20` : `${brand.colors.negative}20`,
                    color: (c.change_percent ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative,
                  }"
                >
                  <UIcon
                    :name="(c.change_percent ?? 0) >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                    class="size-3.5"
                  />
                  {{ (c.change_percent ?? 0) >= 0 ? '+' : '' }}{{ Number(c.change_percent || 0).toFixed(1) }}%
                </div>
              </div>

              <!-- RIGHT: title + dual reading -->
              <div class="flex flex-col gap-5 md:col-span-9">
                <!-- Event title -->
                <h3
                  class="text-[20px] leading-snug md:text-[24px]"
                  :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif`, fontWeight: 700 }"
                >
                  {{ c.title }}
                </h3>

                <!-- Cabeça Quente reaction (red panic pill) -->
                <div
                  class="flex items-start gap-3 rounded-2xl border px-4 py-3"
                  style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06);"
                >
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-full" style="background: #EF4444;">
                    <UIcon name="i-lucide-flame" class="size-4 text-white" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[9px] font-bold uppercase tracking-[0.18em]" style="color: #EF4444;">
                      Cabeça Quente reagiu
                    </div>
                    <div class="mt-1 text-[14px] font-bold leading-snug italic" style="color: #FF8A8A;">
                      <template v-if="(c.change_percent ?? 0) > 5">
                        "+{{ Number(c.change_percent || 0).toFixed(1) }}%?! COMPRA TUDO! Vai pro infinito!"
                      </template>
                      <template v-else-if="(c.change_percent ?? 0) > 2">
                        "Subiu {{ Number(c.change_percent || 0).toFixed(1) }}%! AINDA DÁ TEMPO! ENTRA AGORA!"
                      </template>
                      <template v-else-if="(c.change_percent ?? 0) < -5">
                        "{{ Number(c.change_percent || 0).toFixed(1) }}%?! É O FIM! VENDE TUDO ANTES QUE ZERA!"
                      </template>
                      <template v-else-if="(c.change_percent ?? 0) < -2">
                        "Caiu {{ Number(c.change_percent || 0).toFixed(1) }}%! FOGE ENQUANTO PODE!"
                      </template>
                      <template v-else>
                        "Mal se mexe! Que tédio! Vou trocar por uma cripto qualquer!"
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Cabeça Fria reading (the actual commentary, framed calmly) -->
                <div
                  class="flex items-start gap-3 rounded-2xl border px-5 py-4"
                  :style="{ borderColor: `${brand.colors.primary}40`, backgroundColor: `${brand.colors.primary}08` }"
                >
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-full" :style="{ backgroundColor: brand.colors.primary }">
                    <UIcon name="i-lucide-snowflake" class="size-4" :style="{ color: brand.colors.background }" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[9px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                      Cabeça Fria leu assim
                    </div>
                    <p class="mt-2 text-[14px] leading-relaxed" :style="{ color: brand.colors.text }">
                      {{ c.commentary }}
                    </p>

                    <!-- Sources, if any -->
                    <div v-if="c.sources && c.sources.length > 0" class="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" :style="{ borderColor: `${brand.colors.primary}30` }">
                      <span class="text-[9px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
                        Fontes:
                      </span>
                      <a
                        v-for="(src, sIdx) in c.sources.slice(0, 3)"
                        :key="sIdx"
                        :href="src.url"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1 text-[10px] underline-offset-2 hover:underline"
                        :style="{ color: brand.colors.primary }"
                      >
                        <UIcon name="i-lucide-link-2" class="size-3" />
                        {{ (src.title || 'fonte').slice(0, 30) }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Closing line -->
          <div class="mt-12 flex items-center gap-4 border-t pt-8" :style="{ borderColor: brand.colors.border }">
            <UIcon name="i-lucide-snowflake" class="size-5 shrink-0" :style="{ color: brand.colors.primary }" />
            <p class="text-[14px] italic" :style="{ color: `${brand.colors.text}B0` }">
              Cada um desses dias parecia o fim do mundo (ou o início do bull run). Nenhum era. <strong :style="{ color: brand.colors.primary }">Cabeça fria.</strong>
            </p>
          </div>
        </div>
      </section>

      <!-- §4 · What to do next (call-to-action sections) -->
      <section class="relative z-10">
        <div class="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 max-w-3xl">
            <div class="mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
             , O que fazer agora
            </div>
            <h2
              class="leading-[0.95] tracking-tight"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontFamily: `'Fredoka', 'Inter', sans-serif`,
                fontWeight: 700,
              }"
            >
              Aplique o método.
            </h2>
          </div>

          <div class="grid gap-5 md:grid-cols-3">
            <NuxtLink
              to="/calculadora/preco-teto"
              class="group flex flex-col gap-4 rounded-3xl border p-8 transition-all hover:-translate-y-1"
              :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}80` }"
            >
              <div class="flex size-12 items-center justify-center rounded-2xl" :style="{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }">
                <UIcon name="i-lucide-scale" class="size-6" />
              </div>
              <h3 class="text-[18px] font-bold" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                Calcular preço-teto
              </h3>
              <p class="text-[13px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                Use os métodos de Bazin e Graham pra saber se {{ tickerUpper }} está cara ou barata.
              </p>
              <div class="mt-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                Abrir calculadora <span>→</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/calculadora/juros-compostos"
              class="group flex flex-col gap-4 rounded-3xl border p-8 transition-all hover:-translate-y-1"
              :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}80` }"
            >
              <div class="flex size-12 items-center justify-center rounded-2xl" :style="{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }">
                <UIcon name="i-lucide-timer" class="size-6" />
              </div>
              <h3 class="text-[18px] font-bold" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                Simular juros compostos
              </h3>
              <p class="text-[13px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                Veja quanto essa posição pode render se você segurar por 10, 15 ou 20 anos.
              </p>
              <div class="mt-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                Rodar simulação <span>→</span>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/help"
              class="group flex flex-col gap-4 rounded-3xl border p-8 transition-all hover:-translate-y-1"
              :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}80` }"
            >
              <div class="flex size-12 items-center justify-center rounded-2xl" :style="{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }">
                <UIcon name="i-lucide-message-circle" class="size-6" />
              </div>
              <h3 class="text-[18px] font-bold" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                Perguntar à Saraiva IA
              </h3>
              <p class="text-[13px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                "{{ tickerUpper }} tá cara agora pelo método Bazin?", resposta em 3s, com fonte.
              </p>
              <div class="mt-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                Abrir chat <span>→</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- §5 · Signature closing -->
      <section class="relative z-10 border-t" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto max-w-5xl px-6 py-20 text-center md:px-10 md:py-28">
          <div class="mb-8 text-[60px] leading-none" :style="{ color: brand.colors.primary, fontFamily: `'Fredoka', sans-serif` }">"</div>
          <blockquote
            class="-mt-4 leading-[1.2]"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              fontFamily: `'Fredoka', 'Inter', sans-serif`,
              fontWeight: 700,
            }"
          >
            Não é palpite. É método, paciência e juros compostos.
          </blockquote>
          <div class="mt-10 flex justify-center">
            <div
              class="inline-flex items-center gap-3 rounded-full px-5 py-2.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 0 0 3px ${brand.colors.background}, 0 0 0 6px ${brand.colors.primary}, 0 20px 40px -15px ${brand.colors.primary}A0`,
              }"
            >
              <img
                v-if="brand.hero.image"
                :src="brand.hero.image"
                :alt="brand.founder.name"
                class="size-9 rounded-full object-cover"
              />
              <div class="flex flex-col items-start">
                <span class="text-[12px] font-bold leading-tight">{{ brand.founder.name }}</span>
                <span class="text-[9px] font-medium uppercase tracking-[0.15em] opacity-80">Fundador · Saraiva Invest</span>
              </div>
            </div>
          </div>
          <p class="mt-10 text-[11px] font-bold uppercase tracking-[0.2em]" :style="{ color: brand.colors.textMuted }">
            cabeça fria · sem grito · sem guru
          </p>
        </div>
      </section>
    </div>

    <!-- ========== HOLDER VARIANT (Holder, sentencious editorial paper) ========== -->
    <!--
      Holder asset page: pure editorial autoral. Black + red + cream.
      IBM Plex Serif body + Anton chunky condensed display + JetBrains
      Mono numbers. Sem sticker, sem outline, sem emoji. § paragrafação,
      números de capítulo, footnotes. Catchphrase HOLD. fechando.

      Estrutura:
        §1   Top strip: chapter index + ticker
        1.01 Hero, ticker em Anton GIGANTE + name serif + price editorial
        2.01 § VALUATION, table 4 indicadores estilo paper
        3.01 § TESE, long-form (porque holdar ou não holdar)
        4.01 § HISTÓRICO, commentaries com framing serif
        5.01 § O QUE FAZER, 3 CTAs sharp
        6.01 § HOLD, assinatura final com selo
    -->
    <div
      v-else-if="brand.assetPage.variant === 'holder'"
      class="hl-asset-root relative z-10 flex flex-col"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- §1 · Top chapter strip -->
      <div
        class="hl-asset-strip relative z-10 border-b"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div class="flex items-center gap-4">
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [ HOLD. ]
            </span>
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              FICHA · {{ tickerUpper }} · {{ assetEditorialDate }}
            </span>
          </div>
          <div class="flex items-center gap-4">
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              B3 · BRASIL
            </span>
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              ⊕
            </span>
          </div>
        </div>
      </div>

      <!-- 1.01 · Hero, ticker em Anton + price editorial -->
      <section class="relative">
        <div class="mx-auto grid max-w-7xl grid-cols-12 gap-10 px-6 py-20 md:px-10 md:py-28">
          <!-- LEFT: ticker + name + price -->
          <div class="col-span-12 lg:col-span-8">
            <!-- Chapter mark -->
            <div class="hl-mono mb-6 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
              01 · Ficha
            </div>

            <!-- Logo + ticker -->
            <div class="flex items-end gap-6">
              <img
                v-if="resolvedLogo"
                :src="resolvedLogo"
                :alt="tickerUpper"
                class="h-24 w-24 shrink-0 object-cover md:h-28 md:w-28"
                :style="{ backgroundColor: brand.colors.surface, border: `2px solid ${brand.colors.border}` }"
              />
              <div
                v-else
                class="hl-display flex h-24 w-24 shrink-0 items-center justify-center text-[34px] md:h-28 md:w-28 md:text-[42px]"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.text,
                  fontFamily: `'Anton', sans-serif`,
                }"
              >
                {{ tickerUpper.slice(0, 2) }}
              </div>
              <div class="min-w-0 flex-1">
                <div
                  class="hl-display leading-[0.85]"
                  :style="{
                    color: brand.colors.text,
                    fontFamily: `'Anton', 'Bebas Neue', sans-serif`,
                    fontWeight: 400,
                    fontSize: 'clamp(4rem, 12vw, 9rem)',
                    letterSpacing: '0.01em',
                  }"
                >
                  {{ tickerUpper }}
                </div>
              </div>
            </div>

            <!-- Company name in serif italic -->
            <div
              class="hl-serif mt-6 max-w-xl text-[20px] italic md:text-[24px]"
              :style="{
                color: `${brand.colors.text}D0`,
                fontFamily: `'Spectral', 'Georgia', serif`,
              }"
            >
              {{ asset?.name || 'Empresa listada na B3' }} · {{ asset?.sector || '-' }}
            </div>

            <!-- Price block -->
            <div class="mt-12 flex items-baseline gap-6 border-t pt-10" :style="{ borderColor: brand.colors.border }">
              <div>
                <div class="hl-mono mb-2 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
                  Preço · fechamento
                </div>
                <div class="flex items-baseline gap-4">
                  <span class="hl-serif text-[20px]" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">R$</span>
                  <span
                    class="hl-display tabular-nums leading-none"
                    :style="{
                      color: brand.colors.text,
                      fontFamily: `'Anton', 'Bebas Neue', sans-serif`,
                      fontSize: 'clamp(3rem, 8vw, 6rem)',
                      letterSpacing: '0.01em',
                    }"
                  >
                    {{ (asset?.market_price ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </span>
                </div>
              </div>
              <div class="hl-mono inline-flex items-center gap-2 text-[16px] tabular-nums md:text-[20px]" :style="{ color: (asset?.change_percent ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative }">
                <span>{{ (asset?.change_percent ?? 0) >= 0 ? '↑' : '↓' }}</span>
                {{ (asset?.change_percent ?? 0) >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2) }}%
              </div>
            </div>

            <!-- Sentencious one-liner -->
            <p
              class="hl-serif mt-8 max-w-xl text-[16px] italic"
              :style="{
                color: brand.colors.textMuted,
                fontFamily: `'Spectral', 'Georgia', serif`,
              }"
            >
              O preço é uma opinião. Aqui você vai encontrar o que importa: o fato.
            </p>
          </div>

          <!-- RIGHT: ficha técnica column -->
          <aside class="col-span-12 lg:col-span-4">
            <div
              class="border p-6 md:p-8"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <div class="hl-mono mb-5 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                Ficha técnica
              </div>
              <dl class="hl-mono flex flex-col gap-4 text-[12px]">
                <div class="flex items-baseline justify-between gap-4 border-b pb-3" :style="{ borderColor: brand.colors.border }">
                  <dt class="uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">Tipo</dt>
                  <dd class="text-right tabular-nums" :style="{ color: brand.colors.text }">
                    {{ asset?.type === 'STOCK' ? 'Ação' : asset?.type === 'REIT' ? 'FII' : asset?.type === 'ETF' ? 'ETF' : asset?.type || '-' }}
                  </dd>
                </div>
                <div class="flex items-baseline justify-between gap-4 border-b pb-3" :style="{ borderColor: brand.colors.border }">
                  <dt class="uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">Setor</dt>
                  <dd class="truncate text-right text-[11px]" :style="{ color: brand.colors.text }">
                    {{ asset?.sector || '-' }}
                  </dd>
                </div>
                <div class="flex items-baseline justify-between gap-4 border-b pb-3" :style="{ borderColor: brand.colors.border }">
                  <dt class="uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">Market Cap</dt>
                  <dd class="text-right tabular-nums" :style="{ color: brand.colors.text }">
                    {{ formatMarketCapShort(asset?.market_cap) || '-' }}
                  </dd>
                </div>
                <div class="flex items-baseline justify-between gap-4 border-b pb-3" :style="{ borderColor: brand.colors.border }">
                  <dt class="uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">Listado</dt>
                  <dd class="text-right tabular-nums" :style="{ color: brand.colors.text }">
                    {{ asset?.founded_at ? new Date(asset.founded_at).getFullYear() : '-' }}
                  </dd>
                </div>
                <div class="flex items-baseline justify-between gap-4">
                  <dt class="uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">Última atual.</dt>
                  <dd class="text-right tabular-nums" :style="{ color: brand.colors.text }">
                    {{ lastUpdateLabel || '-' }}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <!-- 2.01 · § VALUATION, paper-style indicator table -->
      <section class="relative border-y" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div class="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                02 · Valuation
              </div>
              <h2
                class="hl-serif leading-[1.05]"
                :style="{
                  color: brand.colors.text,
                  fontFamily: `'Spectral', 'Georgia', serif`,
                  fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                  fontWeight: 600,
                }"
              >
                Os <em :style="{ color: brand.colors.primary }">fatos</em>,<br />
                não as opiniões.
              </h2>
            </div>
            <p class="hl-serif text-[15px] italic md:col-span-5" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
              Cada número aqui é mensurável, auditável e reportado oficialmente. O resto é narrativa.
            </p>
          </div>

          <!-- Indicator paper-style table -->
          <div class="grid grid-cols-12 gap-px overflow-hidden border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <!-- Headers -->
            <div class="col-span-12 grid grid-cols-12 gap-px" style="border-collapse: collapse;">
              <div class="hl-mono col-span-1 px-4 py-4 text-[10px] uppercase tracking-[0.18em]" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">№</div>
              <div class="hl-mono col-span-5 px-4 py-4 text-[10px] uppercase tracking-[0.18em]" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">Indicador</div>
              <div class="hl-mono col-span-2 px-4 py-4 text-right text-[10px] uppercase tracking-[0.18em]" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">Valor</div>
              <div class="hl-mono col-span-4 px-4 py-4 text-[10px] uppercase tracking-[0.18em]" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">Leitura do método</div>
            </div>

            <!-- P/L row -->
            <div class="col-span-12 grid grid-cols-12 gap-px">
              <div class="hl-mono col-span-1 px-4 py-5 text-[11px] tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">2.01</div>
              <div class="col-span-5 px-4 py-5" :style="{ backgroundColor: brand.colors.background }">
                <div class="hl-serif text-[15px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">Preço sobre lucro</div>
                <div class="hl-mono mt-1 text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">P/L · múltiplo</div>
              </div>
              <div class="hl-display col-span-2 px-4 py-5 text-right text-[26px] leading-none tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.primary, fontFamily: `'Anton', sans-serif` }">
                {{ basicIndicators?.pl || '-' }}
              </div>
              <div class="hl-serif col-span-4 px-4 py-5 text-[12px] italic" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                Abaixo de 10 sugere desconto frente ao histórico brasileiro.
              </div>
            </div>

            <!-- DY row -->
            <div class="col-span-12 grid grid-cols-12 gap-px">
              <div class="hl-mono col-span-1 px-4 py-5 text-[11px] tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">2.02</div>
              <div class="col-span-5 px-4 py-5" :style="{ backgroundColor: brand.colors.background }">
                <div class="hl-serif text-[15px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">Dividend yield 12M</div>
                <div class="hl-mono mt-1 text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">DY · proventos anualizados</div>
              </div>
              <div class="hl-display col-span-2 px-4 py-5 text-right text-[26px] leading-none tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.positive, fontFamily: `'Anton', sans-serif` }">
                {{ basicIndicators?.dividendYield || '-' }}
              </div>
              <div class="hl-serif col-span-4 px-4 py-5 text-[12px] italic" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                Acima de 6% indica empresa geradora de caixa madura.
              </div>
            </div>

            <!-- P/VPA row -->
            <div class="col-span-12 grid grid-cols-12 gap-px">
              <div class="hl-mono col-span-1 px-4 py-5 text-[11px] tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">2.03</div>
              <div class="col-span-5 px-4 py-5" :style="{ backgroundColor: brand.colors.background }">
                <div class="hl-serif text-[15px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">Preço sobre valor patrimonial</div>
                <div class="hl-mono mt-1 text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">P/VP · book value</div>
              </div>
              <div class="hl-display col-span-2 px-4 py-5 text-right text-[26px] leading-none tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.text, fontFamily: `'Anton', sans-serif` }">
                {{ basicIndicators?.pvpa || '-' }}
              </div>
              <div class="hl-serif col-span-4 px-4 py-5 text-[12px] italic" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                Abaixo de 1: negocia por menos do que vale no papel. Investigue.
              </div>
            </div>

            <!-- ROE row -->
            <div class="col-span-12 grid grid-cols-12 gap-px">
              <div class="hl-mono col-span-1 px-4 py-5 text-[11px] tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted }">2.04</div>
              <div class="col-span-5 px-4 py-5" :style="{ backgroundColor: brand.colors.background }">
                <div class="hl-serif text-[15px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">Retorno sobre patrimônio</div>
                <div class="hl-mono mt-1 text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">ROE · eficiência do capital</div>
              </div>
              <div class="hl-display col-span-2 px-4 py-5 text-right text-[26px] leading-none tabular-nums" :style="{ backgroundColor: brand.colors.background, color: brand.colors.text, fontFamily: `'Anton', sans-serif` }">
                {{ basicIndicators?.roe || '-' }}
              </div>
              <div class="hl-serif col-span-4 px-4 py-5 text-[12px] italic" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                Acima de 15% por anos seguidos indica vantagem competitiva.
              </div>
            </div>
          </div>

          <p class="hl-mono mt-8 text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
            ⊕ Fontes: Demonstrativos públicos · CVM · B3 · Atualização trimestral
          </p>
        </div>
      </section>

      <!-- 3.01 · § TESE, long-form -->
      <section class="relative">
        <div class="mx-auto grid max-w-6xl grid-cols-12 gap-12 px-6 py-24 md:px-10 md:py-32">
          <div class="col-span-12 md:col-span-3">
            <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em] sticky top-24" :style="{ color: brand.colors.primary }">
              03 · Tese
            </div>
          </div>
          <div class="col-span-12 md:col-span-9">
            <h2
              class="hl-serif leading-[1.1]"
              :style="{
                color: brand.colors.text,
                fontFamily: `'Spectral', 'Georgia', serif`,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                fontWeight: 600,
              }"
            >
              Por que <em :style="{ color: brand.colors.primary }">eu deteria</em> {{ tickerUpper }}.
            </h2>

            <div class="hl-serif mt-10 flex flex-col gap-6 text-[17px] leading-[1.7] md:text-[18px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">
              <p>
                <span class="hl-drop-cap-asset" :style="{ color: brand.colors.primary }">A</span>ntes de qualquer linha sobre {{ tickerUpper }}, dois fatos: o ativo está negociando a {{ basicIndicators?.pl || '-' }}× lucros e entrega DY de {{ basicIndicators?.dividendYield || '-' }}. Os números são pontos de partida, não conclusões.
              </p>
              <p>
                A pergunta correta nunca é "essa ação vai subir?". A pergunta correta é: <em :style="{ color: brand.colors.primary }">se eu tivesse capital pra comprar a empresa inteira nesse preço, eu compraria?</em> Se a resposta for sim, comprar uma parte é trivial. Se for não, nem o melhor gráfico técnico do mundo deveria te convencer.
              </p>
              <p>
                Quem analisa {{ asset?.name || tickerUpper }} olhando 5 indicadores numa tela perde 95% da história. A história está no histórico de 10 anos de receita, na consistência de payout, no que o management fala em call de resultado, na durabilidade do moat. Nada disso aparece num candle de 5 minutos. Tudo isso aparece num relatório anual lido com calma.
              </p>
              <p>
                Eu não vou te dizer "compra hoje". Eu vou te dizer: <strong :style="{ color: brand.colors.primary }">leia o último 10-K, compare com o de 5 anos atrás, e me diga se a empresa está melhor ou pior</strong>. Se está melhor e o preço é razoável, há tese pra holdar. Se está pior e o preço é caro, esquece. Se está melhor e o preço é caro, esperar é grátis. <strong>HOLD.</strong>
              </p>
            </div>

            <div class="hl-mono mt-12 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
              <span class="h-px flex-1 max-w-12" :style="{ backgroundColor: brand.colors.border }" />
              <span :style="{ color: brand.colors.primary }">, @holder</span>
              <span class="h-px flex-1" :style="{ backgroundColor: brand.colors.border }" />
            </div>
          </div>
        </div>
      </section>

      <!-- 4.01 · § HISTÓRICO DE MOVIMENTOS, commentaries reframed -->
      <section
        v-if="commentaries.length > 0"
        class="relative border-y"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-14 max-w-3xl">
            <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
              04 · Histórico
            </div>
            <h2
              class="hl-serif leading-[1.05]"
              :style="{
                color: brand.colors.text,
                fontFamily: `'Spectral', 'Georgia', serif`,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                fontWeight: 600,
              }"
            >
              Os dias em que<br />
              <em :style="{ color: brand.colors.primary }">tudo parecia importar.</em>
            </h2>
            <p class="hl-serif mt-6 max-w-xl text-[15px] italic" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
              Cada um desses momentos pareceu o fim do mundo (ou o início do bull run). Nenhum era. O Holder leu, registrou, e seguiu.
            </p>
          </div>

          <div class="flex flex-col gap-12">
            <article
              v-for="(c, idx) in commentaries.slice(0, 5)"
              :key="c.id || idx"
              class="grid grid-cols-12 gap-6 border-t pt-12 md:gap-10"
              :style="{ borderColor: brand.colors.border }"
            >
              <!-- LEFT: chapter mark + date stack -->
              <div class="col-span-12 md:col-span-3">
                <div class="hl-mono mb-4 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
                  4.{{ String(idx + 2).padStart(2, '0') }}
                </div>
                <div
                  class="hl-display leading-[0.85]"
                  :style="{
                    color: brand.colors.text,
                    fontFamily: `'Anton', sans-serif`,
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  }"
                >
                  {{ formatEventDay(c.date) }}<span :style="{ color: brand.colors.primary }">.</span>{{ formatEventMonth(c.date) }}
                </div>
                <div class="hl-mono mt-2 text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
                  {{ formatEventYear(c.date) }}
                </div>
                <div
                  class="hl-mono mt-4 inline-flex items-center gap-1.5 text-[12px] tabular-nums"
                  :style="{ color: (c.change_percent ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative }"
                >
                  <span>{{ (c.change_percent ?? 0) >= 0 ? '↑' : '↓' }}</span>
                  {{ (c.change_percent ?? 0) >= 0 ? '+' : '' }}{{ Number(c.change_percent || 0).toFixed(2) }}%
                </div>
              </div>

              <!-- RIGHT: title + commentary -->
              <div class="col-span-12 md:col-span-9">
                <h3
                  class="hl-serif leading-[1.2]"
                  :style="{
                    color: brand.colors.text,
                    fontFamily: `'Spectral', 'Georgia', serif`,
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    fontWeight: 600,
                  }"
                >
                  {{ c.title }}
                </h3>

                <p
                  class="hl-serif mt-5 text-[15px] leading-[1.7] md:text-[16px]"
                  :style="{
                    color: `${brand.colors.text}D0`,
                    fontFamily: `'Spectral', 'Georgia', serif`,
                  }"
                >
                  {{ c.commentary }}
                </p>

                <!-- Sources, footnote-style -->
                <div v-if="c.sources && c.sources.length > 0" class="mt-6 flex flex-wrap items-center gap-3 border-t pt-4" :style="{ borderColor: brand.colors.border }">
                  <span class="hl-mono text-[9px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
                    Fontes:
                  </span>
                  <a
                    v-for="(src, sIdx) in c.sources.slice(0, 3)"
                    :key="sIdx"
                    :href="src.url"
                    target="_blank"
                    rel="noopener"
                    class="hl-mono text-[10px] underline-offset-4 hover:underline"
                    :style="{ color: brand.colors.primary }"
                  >
                    {{ String(sIdx + 1).padStart(2, '0') }}. {{ (src.title || 'fonte').slice(0, 32) }}
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 5.01 · § O QUE FAZER, 3 sharp CTAs -->
      <section class="relative">
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-14 max-w-3xl">
            <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
              05 · O que fazer
            </div>
            <h2
              class="hl-serif leading-[1.05]"
              :style="{
                color: brand.colors.text,
                fontFamily: `'Spectral', 'Georgia', serif`,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                fontWeight: 600,
              }"
            >
              Antes de comprar.<br />
              <em :style="{ color: brand.colors.primary }">Antes de vender.</em>
            </h2>
          </div>

          <div class="grid grid-cols-1 gap-px overflow-hidden border md:grid-cols-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <NuxtLink
              to="/calculadora/preco-teto"
              class="group flex flex-col gap-5 p-8 transition-colors md:p-10"
              :style="{ backgroundColor: brand.colors.background }"
            >
              <div class="hl-mono text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                01 · Calcule
              </div>
              <h3 class="hl-serif text-[24px] leading-tight" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif`, fontWeight: 600 }">
                O preço-teto
              </h3>
              <p class="hl-serif text-[14px] italic" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                Bazin para dividendos. Graham para crescimento. Espere o preço.
              </p>
              <div class="hl-mono mt-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                Abrir →
              </div>
            </NuxtLink>

            <NuxtLink
              to="/calculadora/juros-compostos"
              class="group flex flex-col gap-5 p-8 transition-colors md:p-10"
              :style="{ backgroundColor: brand.colors.background }"
            >
              <div class="hl-mono text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                02 · Simule
              </div>
              <h3 class="hl-serif text-[24px] leading-tight" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif`, fontWeight: 600 }">
                20 anos holdando
              </h3>
              <p class="hl-serif text-[14px] italic" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                Veja quanto este ativo pode pagar de dividendos compostos por décadas.
              </p>
              <div class="hl-mono mt-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                Abrir →
              </div>
            </NuxtLink>

            <NuxtLink
              to="/help"
              class="group flex flex-col gap-5 p-8 transition-colors md:p-10"
              :style="{ backgroundColor: brand.colors.background }"
            >
              <div class="hl-mono text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                03 · Pergunte
              </div>
              <h3 class="hl-serif text-[24px] leading-tight" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif`, fontWeight: 600 }">
                À Holder IA
              </h3>
              <p class="hl-serif text-[14px] italic" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                "Por que ainda deteria {{ tickerUpper }}?", resposta sentenciosa, sem floreio.
              </p>
              <div class="hl-mono mt-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                Abrir →
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- 6.01 · § HOLD, final signature -->
      <section class="relative border-t" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto max-w-5xl px-6 py-24 text-center md:px-10 md:py-32">
          <div class="hl-mono mb-8 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
            06 · Assinatura
          </div>
          <blockquote
            class="hl-serif italic leading-[1.2]"
            :style="{
              color: brand.colors.text,
              fontFamily: `'Spectral', 'Georgia', serif`,
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              fontWeight: 500,
            }"
          >
            "Compro empresa, não ação. O tempo é o único sócio que me importa."
          </blockquote>
          <div class="hl-mono mt-10 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.border }" />
            <span :style="{ color: brand.colors.primary }">, @holder</span>
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.border }" />
          </div>
          <p
            class="hl-display mt-12 leading-none"
            :style="{
              color: brand.colors.primary,
              fontFamily: `'Anton', sans-serif`,
              fontSize: 'clamp(4rem, 10vw, 8rem)',
              letterSpacing: '0.02em',
            }"
          >
            HOLD.
          </p>
        </div>
      </section>
    </div>

    <!-- ========== DEFAULT VARIANT (Redentia, Bloomberg terminal) ========== -->
    <div v-else class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Terminal status bar, pinned context line for the asset -->
        <div
          class="-mx-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-t px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
            </span>
            [TICKER.QUOTE]
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.text }">{{ tickerUpper }}</span>
          <span v-if="asset?.name" :style="{ color: brand.colors.border }">·</span>
          <span v-if="asset?.name" class="truncate max-w-[240px]" :style="{ color: brand.colors.textMuted }">{{ asset.name }}</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.textMuted }">B3 · BOLSA BRASILEIRA</span>
          <span v-if="lastUpdateLabel" :style="{ color: brand.colors.border }">·</span>
          <span v-if="lastUpdateLabel" :style="{ color: brand.colors.textMuted }">UPDATE {{ lastUpdateLabel }}</span>
        </div>

        <!-- Hero Section do Ativo, 3-column terminal layout -->
        <section class="border-b pb-8" :style="{ borderColor: brand.colors.border }">
          <div class="grid gap-6 md:grid-cols-12 md:items-end">
            <!-- Col 1: Ticker + company name (serif display) -->
            <div class="flex items-center gap-4 md:col-span-4">
              <USkeleton
                v-if="isLoadingAsset"
                class="h-16 w-16 rounded-xl"
              />
              <img
                v-else-if="resolvedLogo"
                :src="resolvedLogo"
                :alt="`Logo de ${assetName}`"
                class="h-16 w-16 rounded-xl object-cover"
              />
              <div class="flex min-w-0 flex-col gap-1">
                <span
                  class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                  :style="{ color: brand.colors.primary }"
                >
                  [SYMBOL]
                </span>
                <h1
                  class="font-mono-tab text-3xl font-bold tracking-tight md:text-4xl"
                  :style="{ color: brand.colors.text }"
                >
                  {{ tickerUpper }} <span class="text-lg font-semibold md:text-xl" :style="{ color: brand.colors.text }">— {{ asset?.name || assetName }}</span>
                </h1>
                <span
                  v-if="asset?.sector"
                  class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  &gt; {{ asset.sector }}
                </span>
              </div>
            </div>

            <!-- Col 2: Price + change (monumental mono) -->
            <div class="flex flex-col gap-1 md:col-span-4">
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                :style="{ color: brand.colors.primary }"
              >
                [LAST.PRICE]
              </span>
              <USkeleton v-if="isLoadingAsset" class="h-14 w-[200px]" />
              <template v-else>
                <div class="flex items-baseline gap-2">
                  <span
                    class="font-mono-tab text-[10px] font-normal opacity-60"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    R$
                  </span>
                  <span
                    class="font-mono-tab text-5xl font-bold tabular-nums md:text-6xl"
                    :style="{
                      color: asset?.change_percent >= 0 ? brand.colors.positive : brand.colors.negative,
                    }"
                  >
                    {{ formatPriceNumber(asset?.market_price) }}
                  </span>
                </div>
                <div class="flex items-center gap-3 font-mono-tab text-sm">
                  <span
                    class="flex items-center gap-1 tabular-nums"
                    :style="{
                      color: asset?.change_percent >= 0 ? brand.colors.positive : brand.colors.negative,
                    }"
                  >
                    <UIcon
                      :name="asset?.change_percent >= 0 ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
                      class="h-3 w-3"
                    />
                    {{ asset?.change_percent >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2) }}%
                  </span>
                  <span :style="{ color: brand.colors.border }">·</span>
                  <span
                    class="text-[11px] uppercase tracking-[0.12em]"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    HOJE
                  </span>
                </div>
              </template>
            </div>

            <!-- Col 3: Quick stats (tabular data cell) -->
            <div class="flex flex-col gap-1 md:col-span-4">
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                :style="{ color: brand.colors.primary }"
              >
                [SESSION.STATS]
              </span>
              <div
                class="grid grid-cols-3 gap-px border font-mono-tab text-[11px]"
                :style="{
                  borderColor: brand.colors.border,
                  backgroundColor: brand.colors.border,
                }"
              >
                <div
                  v-for="stat in sessionStats"
                  :key="stat.label"
                  class="flex flex-col gap-0.5 px-3 py-2"
                  :style="{ backgroundColor: brand.colors.surface }"
                >
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                    {{ stat.label }}
                  </span>
                  <span
                    class="font-semibold tabular-nums"
                    :style="{ color: stat.accent || brand.colors.text }"
                  >
                    {{ stat.value || '-' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart with terminal-styled header -->
          <div class="mt-8">
            <div class="mb-3 flex items-end justify-between gap-4">
              <div class="flex flex-col gap-1">
                <span
                  class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                  :style="{ color: brand.colors.primary }"
                >
                  [CHART.PRICE]
                </span>
                <span
                  class="font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  &gt; HISTÓRICO DE COTAÇÃO · {{ selectedTimeRange?.toString().toUpperCase() || 'PERÍODO' }}
                </span>
              </div>
              <MoleculesPeriodSelector
                v-model="selectedTimeRange"
                :loading="isLoadingChart"
                class="max-md:w-full"
              />
            </div>
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLabel"
              :height="360"
              :loading="isLoadingChart"
              :markers="chartMarkers"
              @marker-click="onMarkerClick"
            />
          </div>
        </section>

        <!-- Market Commentaries (AI-generated news/analysis) -->
        <section
          v-if="
            brand.features?.showMarketCommentaries !== false &&
            brand.assetPage.showMarketCommentaries !== false &&
            (commentaries.length > 0 || backfillStatus?.running)
          "
        >
          <MoleculesMarketCommentaries
            :commentaries="commentaries"
            :highlighted-date="highlightedCommentaryDate"
            :backfill-status="backfillStatus"
          />
        </section>

        <!-- Imprensa (notícias dos portais financeiros que citam o ticker) -->
        <MoleculesNewsByTickerSection
          v-if="brand.assetPage.showNews"
          :ticker="tickerUpper"
        />

        <!-- Fundamentals + Volatility side by side (terminal panels) —
             only when scrape_extras is NOT available (otherwise the new
             StatusInvestPanel below covers these indicators + more). -->
        <section v-if="!scrapeExtras" class="grid grid-cols-1 gap-6 border-b py-8 lg:grid-cols-3" :style="{ borderColor: brand.colors.border }">
          <!-- Col 1-2: Fundamentals register -->
          <div v-if="brand.assetPage.showIndicators" class="lg:col-span-2">
            <div class="mb-4 flex flex-col gap-1">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [FUNDAMENTALS.SNAPSHOT]
              </span>
              <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                Indicadores fundamentalistas
              </h2>
              <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; MÉTRICAS DE {{ tickerUpper }} · ÚLTIMA ATUALIZAÇÃO DISPONÍVEL
              </p>
            </div>

            <!-- Basic indicators register, 6 tight columns glued together -->
            <div
              v-if="isLoadingFundamentus"
              class="grid grid-cols-3 gap-px border md:grid-cols-6"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
            >
              <div v-for="i in 6" :key="`ind-load-${i}`" class="p-4" :style="{ backgroundColor: brand.colors.surface }">
                <USkeleton class="h-16 w-full" />
              </div>
            </div>
            <div
              v-else-if="basicIndicators"
              class="grid grid-cols-3 gap-px border md:grid-cols-6"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
            >
              <div
                v-for="(item, idx) in fundamentalsCells"
                :key="item.label"
                class="flex flex-col gap-1.5 px-4 py-4 transition-colors hover:brightness-110"
                :style="{ backgroundColor: brand.colors.surface }"
              >
                <div class="flex items-center justify-between">
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                    [{{ String(idx + 1).padStart(2, '0') }}]
                  </span>
                  <UTooltip v-if="item.tooltip" :text="item.tooltip" :delay-duration="0">
                    <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
                  </UTooltip>
                </div>
                <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                  {{ item.label }}
                </span>
                <span class="font-mono-tab text-xl font-bold tabular-nums" :style="{ color: item.accent || brand.colors.text }">
                  {{ item.value || '-' }}
                </span>
              </div>
            </div>
            <div v-else class="border border-dashed p-6 text-center font-mono-tab text-[11px] uppercase tracking-wider" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">
              &gt; DATA UNAVAILABLE
            </div>

            <!-- Smart indicators register (AI analysis) — only when scrape is missing -->
            <div v-if="!scrapeExtras && brand.assetPage.showSmartIndicators && (intelligentIndicators || isLoadingFundamentus)" class="mt-4">
              <div class="mb-2 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                <IconAi class="h-3 w-3" :style="{ fill: brand.colors.primary }" />
                <span>[AI.ANALYSIS]</span>
                <span :style="{ color: brand.colors.textMuted }">&gt; METRICAS INTERPRETADAS</span>
              </div>
              <div
                v-if="isLoadingFundamentus"
                class="grid grid-cols-2 gap-px border md:grid-cols-4"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
              >
                <div v-for="i in 8" :key="`smart-load-${i}`" class="p-4" :style="{ backgroundColor: brand.colors.surface }">
                  <USkeleton class="h-16 w-full" />
                </div>
              </div>
              <div
                v-else-if="intelligentIndicators"
                class="grid grid-cols-2 gap-px border md:grid-cols-4"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
              >
                <div
                  v-for="(item, idx) in smartCells"
                  :key="item.label"
                  class="flex flex-col gap-1.5 px-4 py-4"
                  :style="{ backgroundColor: brand.colors.surface }"
                >
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                    [{{ String(idx + 1).padStart(2, '0') }}]
                  </span>
                  <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                    {{ item.label }}
                  </span>
                  <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ item.value || '-' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Col 3: Volatility + Analyst consensus panels -->
          <div class="lg:col-span-1 flex flex-col gap-8">
            <div v-if="brand.assetPage.showVolatility">
              <div class="mb-4 flex flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  [VOLATILITY.30D]
                </span>
                <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                  Volatilidade
                </h2>
                <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                  &gt; {{ volatilityPeriodLabel || 'JANELA DE 30 DIAS' }}
                </p>
              </div>
              <div class="border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
                <AtomsRiskMeter
                  :risk="volatilityRisk"
                  :period="volatilityPeriodLabel"
                />
              </div>
            </div>

            <MoleculesAnalystConsensusCard v-if="brand.assetPage.showNews && !isForeignOrFii" :ticker="tickerUpper" />
          </div>
        </section>

        <!-- StatusInvest rich panels — FII or stock variant based on asset_type -->
        <section v-if="scrapeExtras" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <MoleculesStatusInvestFiiPanel v-if="scrapeExtras.asset_type === 'fii'" :extras="scrapeExtras" />
          <MoleculesStatusInvestEtfPanel v-else-if="scrapeExtras.asset_type === 'etf'" :extras="scrapeExtras" />
          <MoleculesStatusInvestPanel v-else :extras="scrapeExtras" />

          <!-- Volatility + Analyst consensus side by side (only when scrape panel is shown) -->
          <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div v-if="brand.assetPage.showVolatility">
              <div class="mb-4 flex flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  [VOLATILITY.30D]
                </span>
                <h3 class="text-lg font-semibold md:text-xl" :style="{ color: brand.colors.text }">
                  Volatilidade
                </h3>
                <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                  &gt; {{ volatilityPeriodLabel || 'JANELA DE 30 DIAS' }}
                </p>
              </div>
              <div class="border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
                <AtomsRiskMeter
                  :risk="volatilityRisk"
                  :period="volatilityPeriodLabel"
                />
              </div>
            </div>

            <MoleculesAnalystConsensusCard v-if="brand.assetPage.showNews && !isForeignOrFii" :ticker="tickerUpper" />
          </div>
        </section>
      </div>

      <!-- Dividends -->
      <section v-if="(brand.assetPage.showDividendMap || brand.assetPage.showDividendChart) && !isEtf" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <!-- Terminal header -->
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [DIVIDEND.CALENDAR]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Dividendos e proventos
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; HISTÓRICO DE PAGAMENTOS{{ isForeignOrFii ? '' : ' · PROBABILIDADE MENSAL' }}
          </p>
        </header>

        <!-- MDI Card, terminal dividend heatmap — stock-only; FIIs distribute
             monthly, BDRs irregularly, so probability-by-month is noise there -->
        <div v-if="brand.assetPage.showDividendMap && !isForeignOrFii" class="mb-8 border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <!-- Header: mono label + reference -->
          <div class="flex items-center justify-between border-b px-5 py-3" :style="{ borderColor: brand.colors.border }">
            <div class="flex flex-col gap-0.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [DIVIDEND.HEATMAP]
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; PROBABILIDADE MENSAL · BASELINE 10A
              </span>
            </div>
            <div v-if="isLoadingDividends" class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
              <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
              ANALISANDO
            </div>
            <span
              v-else-if="monthlyDividendProbability.referenceLabel"
              class="font-mono-tab text-[10px] uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              REF · {{ monthlyDividendProbability.referenceLabel }}
            </span>
          </div>

          <!-- Grid of 12 months, tight cells glued with gap-px -->
          <div
            v-if="isLoadingDividends"
            class="grid grid-cols-4 gap-px md:grid-cols-6 lg:grid-cols-12"
            :style="{ backgroundColor: brand.colors.border }"
          >
            <div v-for="month in 12" :key="`dividend-month-skeleton-${month}`" class="p-4" :style="{ backgroundColor: brand.colors.surface }">
              <USkeleton class="h-16 w-full" />
            </div>
          </div>
          <div
            v-else
            class="grid grid-cols-4 gap-px md:grid-cols-6 lg:grid-cols-12"
            :style="{ backgroundColor: brand.colors.border }"
          >
            <div
              v-for="item in monthlyDividendProbability.months"
              :key="item.label"
              class="group relative flex flex-col items-start gap-1.5 px-3 py-4 transition-colors"
              :style="monthCellStyle(item)"
            >
              <!-- Month label mono (top-left) -->
              <span
                class="font-mono-tab text-[9px] uppercase tracking-[0.18em]"
                :style="{ color: item.highlight ? brand.colors.primary : brand.colors.textMuted }"
              >
                [{{ item.label }}]
              </span>

              <!-- Percentage big mono -->
              <span
                class="font-mono-tab text-xl font-bold tabular-nums md:text-2xl"
                :style="{ color: monthCellAccent(item) }"
              >
                {{ item.formattedPercentage }}
              </span>

              <!-- Tiny bar indicator at the bottom, horizontal, width = percentage -->
              <div class="mt-auto h-[3px] w-full" :style="{ backgroundColor: brand.colors.border }">
                <div
                  class="h-full transition-all"
                  :style="{
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    backgroundColor: monthCellAccent(item),
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Legend as terminal output -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            <span>&gt; LEGENDA</span>
            <div class="flex items-center gap-5">
              <span class="flex items-center gap-1.5">
                <span class="inline-block size-2" :style="{ backgroundColor: brand.colors.primary }" />
                MES ATUAL
              </span>
              <span class="flex items-center gap-1.5">
                <span class="inline-block size-2" :style="{ backgroundColor: brand.colors.positive }" />
                ALTA PROBABILIDADE
              </span>
              <span class="flex items-center gap-1.5">
                <span class="inline-block size-2" :style="{ backgroundColor: brand.colors.border }" />
                BAIXA PROBABILIDADE
              </span>
            </div>
          </div>
        </div>

        <!-- Gráfico de Dividendos -->
        <AtomsGraphDividends
          v-if="brand.assetPage.showDividendChart"
          :data="dividendsData"
          :loading="isLoadingDividends"
        />
      </section>

      <!-- Financial Statements — hidden for BDRs (foreign company) and ETFs
           (basket, not an operating company with DRE/balance) -->
      <section v-if="brand.assetPage.showFinancials && !isBdr && !isEtf" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [FINANCIALS.LATEST]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Demonstrações financeiras
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; ÚLTIMO TRIMESTRE DISPONÍVEL{{ isFii ? ' · BALANÇO · DRE' : ' · FLUXO DE CAIXA · BALANÇO · DRE' }}
          </p>
        </header>

        <div
          v-if="
            cashFlowItems.length ||
            balanceItems.length ||
            incomeItems.length ||
            isLoadingFundamentus
          "
          class="grid gap-4"
          :class="isFii ? 'lg:grid-cols-2' : 'lg:grid-cols-3'"
        >
          <AtomsGraphFinancialSummary
            v-if="!isFii"
            title="Fluxo de Caixa"
            icon="i-lucide-arrow-right-left"
            :items="cashFlowItems"
            :is-loading="isLoadingFundamentus"
          />
          <AtomsGraphFinancialSummary
            title="Balanço Patrimonial"
            icon="i-lucide-scale"
            :items="balanceItems"
            :is-loading="isLoadingFundamentus"
          />
          <AtomsGraphFinancialSummary
            title="DRE"
            icon="i-lucide-trending-up"
            :items="incomeItems"
            :is-loading="isLoadingFundamentus"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center brand-card border border-dashed py-12 text-center"
          :style="{ borderColor: brand.colors.border }"
        >
          <UIcon name="i-lucide-file-x" class="mb-3 h-8 w-8" :style="{ color: brand.colors.textMuted }" />
          <p class="text-sm" :style="{ color: brand.colors.textMuted }">Demonstrações indisponíveis</p>
        </div>
      </section>

      <!-- Buy & Hold Checklist — stock, FII, or BDR variant. ETFs don't
           have per-fund fundamentals that map to these criteria. -->
      <section v-if="brand.assetPage.showChecklist && !isEtf" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <div class="border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <!-- Header terminal-style -->
          <header class="mb-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div class="flex flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  [QUALITY.CHECK]
                </span>
                <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                  Checklist Buy & Hold
                </h2>
                <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                  &gt; CRITERIOS PARA INVESTIDORES DE LONGO PRAZO
                </p>
              </div>

              <!-- Score as terminal register -->
              <div v-if="!isLoadingFundamentus && activeChecklist.length" class="flex items-center gap-3 font-mono-tab">
                <span class="text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [SCORE]
                </span>
                <span class="text-3xl font-bold tabular-nums" :style="{ color: brand.colors.positive }">
                  {{ activeChecklist.filter(i => i.status === 'pass').length }}
                </span>
                <span class="text-xl tabular-nums" :style="{ color: brand.colors.textMuted }">/</span>
                <span class="text-xl tabular-nums" :style="{ color: brand.colors.text }">
                  {{ activeChecklist.length }}
                </span>
              </div>
            </div>
          </header>

          <div v-if="isLoadingFundamentus" class="grid gap-2 md:grid-cols-2">
            <USkeleton
              v-for="index in 6"
              :key="`checklist-skeleton-${index}`"
              class="h-16 brand-card"
            />
          </div>
          <template v-else>
            <div
              v-if="activeChecklist.length"
              class="grid gap-2 md:grid-cols-2"
            >
              <div
                v-for="item in activeChecklist"
                :key="item.id"
                class="group flex items-center gap-3 brand-card border p-3 transition-all"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
              >
                <!-- Status Icon -->
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  :class="[
                    item.status === 'pass'
                      ? 'bg-green-500/10 text-green-500'
                      : item.status === 'fail'
                        ? 'bg-red-500/10 text-red-500'
                        : '',
                  ]"
                  :style="item.status === 'unknown' ? { backgroundColor: brand.colors.surface, color: brand.colors.textMuted } : {}"
                >
                  <UIcon
                    :name="
                      item.status === 'pass'
                        ? 'i-lucide-check'
                        : item.status === 'fail'
                          ? 'i-lucide-x'
                          : 'i-lucide-minus'
                    "
                    class="h-4 w-4"
                  />
                </div>

                <!-- Content -->
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm" :style="{ color: brand.colors.text }">
                      {{ item.label }}
                    </span>
                    <UTooltip
                      v-if="item.tooltip"
                      :text="item.tooltip"
                      :delay-duration="0"
                    >
                      <button
                        type="button"
                        class="transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                      >
                        <UIcon name="i-lucide-info" class="h-3 w-3" />
                      </button>
                    </UTooltip>
                  </div>
                  <p
                    v-if="item.detail"
                    class="text-xs leading-relaxed" :style="{ color: brand.colors.textMuted }"
                  >
                    {{ item.detail }}
                  </p>
                  <p
                    v-else-if="item.status === 'unknown'"
                    class="text-xs" :style="{ color: brand.colors.textMuted }"
                  >
                    Dados indisponíveis
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-else
              class="flex flex-col items-center justify-center brand-card border border-dashed py-12 text-center"
              :style="{ borderColor: brand.colors.border }"
            >
              <UIcon name="i-lucide-clipboard-list" class="mb-3 h-8 w-8" :style="{ color: brand.colors.textMuted }" />
              <p class="text-sm" :style="{ color: brand.colors.textMuted }">Checklist indisponível</p>
              <p class="text-xs" :style="{ color: brand.colors.textMuted }">Dados insuficientes para análise</p>
            </div>
          </template>
        </div>
      </section>

      <!-- Company profile -->
      <section v-if="brand.assetPage.showCompanyInfo" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [COMPANY.PROFILE]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Sobre a empresa
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; DADOS INSTITUCIONAIS · SETOR · INDÚSTRIA
          </p>
        </header>

        <div class="border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-start gap-5">
            <USkeleton v-if="isLoadingAsset" class="h-16 w-16 flex-shrink-0 rounded-xl" />
            <img
              v-else-if="resolvedLogo"
              :src="resolvedLogo"
              :alt="`Logo de ${assetName}`"
              class="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
            />
            <div class="flex flex-1 flex-col gap-1">
              <USkeleton v-if="isLoadingAsset" class="h-6 w-48" />
              <template v-else>
                <h3 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                  {{ asset?.name }}
                </h3>
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
                  {{ tickerUpper }} · CODIGO B3
                </span>
              </template>
            </div>
          </div>

          <div
            class="mt-6 grid grid-cols-1 gap-px border sm:grid-cols-2 lg:grid-cols-3"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <USkeleton v-if="isLoadingAsset" class="h-16" />
            <template v-else>
              <div v-if="asset?.sector" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [SETOR]
                </span>
                <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ asset.sector }}</span>
              </div>
              <div v-if="asset?.industry" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [INDÚSTRIA]
                </span>
                <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ asset.industry }}</span>
              </div>
              <div v-if="asset?.website" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [WEBSITE]
                </span>
                <a
                  :href="asset.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-medium transition-colors hover:underline"
                  :style="{ color: brand.colors.primary }"
                >
                  {{ asset.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }} →
                </a>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Seção de IA para não autenticados, terminal REPL style -->
      <section v-if="!authStore.isAuthenticated" class="border-t py-12" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [AI.ASSISTANT]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Dúvidas sobre <span class="italic" :style="{ color: brand.colors.primary }">{{ tickerUpper }}</span>?
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; PERGUNTE QUALQUER COISA · RESPOSTA EM ~3 SEGUNDOS
          </p>
        </header>

        <!-- Terminal-styled query cards, like recent commands list -->
        <div class="mb-6 grid gap-px border sm:grid-cols-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
          <NuxtLink
            v-for="(item, idx) in [
              { text: `Vale investir em ${tickerUpper}?`, desc: 'Analise de viabilidade' },
              { text: 'Qual o preço teto?', desc: 'Método Bazin' },
              { text: 'Relatório completo', desc: 'Analise fundamentalista' },
            ]"
            :key="idx"
            to="/auth/login"
            class="group flex flex-col gap-2 p-5 transition-colors hover:brightness-125"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [Q.{{ String(idx + 1).padStart(2, '0') }}]
            </span>
            <p class="text-base font-semibold leading-snug" :style="{ color: brand.colors.text }">
              <span :style="{ color: brand.colors.primary }">&gt;</span> {{ item.text }}
            </p>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              {{ item.desc }}
            </span>
            <span class="mt-auto flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors" :style="{ color: brand.colors.textMuted }">
              PERGUNTAR →
            </span>
          </NuxtLink>
        </div>

        <!-- CTA as terminal keyboard key -->
        <div class="flex flex-col items-center gap-4 border p-6 md:p-8" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <UButton
            to="/auth/login"
            size="xl"
            class="group w-full font-mono-tab font-semibold uppercase tracking-wider transition-all hover:opacity-90 sm:w-auto"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
            }"
          >
            <template #leading>
              <span class="font-mono-tab text-[10px] opacity-70">[F3]</span>
            </template>
            {{ brand.ai.ctaButton }}
          </UButton>
          <p class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
            <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
            GRATUITO · SEM CARTAO · RESPOSTA EM SEGUNDOS
          </p>
        </div>
      </section>

      <MoleculesChat
        v-else
        class="w-full"
        :suggestions="[
          'Me dê um relatório completo sobre a ação',
          'Por que devo investir neste ativo?',
          // caindo ou subindo, dependendo da variacao
          `Porque está ${ticker} ${
            dailyChangePercent && dailyChangePercent >= 0 ? 'subindo' : 'caindo'
          }`,
        ]"
        route-path="/ticker"
        :ticker="ticker"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ChartTimeRange } from '~/types/chart'
import type {
  AssetMdiEntry,
  FundamentusApiResponse,
  FundamentusData,
} from '~/types/asset'
import { generateChartConfig } from '~/helpers/utils'

const brand = useBrand()
const authStore = useAuthStore()
const route = useRoute()
const {
  assetHistoricPrices,
  getTickerDetails,
  getTickerDividends,
  getTickerFundamentus,
} = useAssetsService()

interface DividendData {
  ticker: string
  payment_date: string
  rate: string
  label?: string
  mdi?: AssetMdiEntry[]
}

const ticker = route.params.ticker as string
const {
  data: asset,
  pending: assetPending,
  error: assetError,
} = await useAsyncData(`asset-details-${ticker.toLowerCase()}`, () =>
  getTickerDetails(ticker)
)

if (assetError.value || !asset.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Asset not found',
    fatal: true,
  })
}

const blockChat = ref(false)
const isLoadingAsset = computed(() => assetPending.value)
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)
const dividendsData = ref<DividendData[]>([])
const isLoadingDividends = ref(true)
const fundamentusData = ref<FundamentusApiResponse | null>(null)
const isLoadingFundamentus = ref(true)
const selectedTimeRange = ref<ChartTimeRange>('month')
const isLoadingChart = ref(true)

onMounted(() => {
  // Dados pesados (gráficos/dividendos/fundamentos) no client: reduz TTFB e custo de crawl do SSR
  fetchChartData()
  fetchDividendsData()
  fetchFundamentusData()
})

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

function handleChatCardClick() {
  blockChat.value = true
}

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}
const chartData = ref<ChartPoint[]>([])

const volatilityRisk = computed(() => {
  if (!chartData.value.length) return 0
  const values = chartData.value.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === 0) return 0

  // Fórmula: (max - min) / min
  // Se variou 100% (dobrou ou caiu pela metade partindo do topo? não, variação total relativa ao fundo), risco é 100%
  const variation = ((max - min) / min) * 100

  return Math.min(variation, 100)
})

const volatilityPeriodLabel = computed(() => {
  const map: Record<string, string> = {
    month: 'último mês',
    year: 'último ano',
    '3years': 'últimos 3 anos',
    full: 'todo o período',
  }
  return map[selectedTimeRange.value] || 'período selecionado'
})

const runtimeConfig = useRuntimeConfig()
const baseSiteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return url.endsWith('/') ? url.slice(0, -1) : url
})

const tickerUpper = computed(() => ticker.toUpperCase())

// ==========================================================
// Terminal-style formatters (Redentia Bloomberg-reimagined hero)
// ==========================================================

function formatPriceNumber(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatVolumeShort(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '-'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(Math.round(num))
}

function formatMarketCapShort(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '-'
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(0)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)}M`
  return num.toLocaleString('pt-BR')
}

function formatDyShort(value: unknown): string {
  if (value == null) return '-'
  const str = String(value).replace('%', '').trim()
  const num = Number(str)
  if (!Number.isFinite(num)) return '-'
  return `${num.toFixed(2)}%`
}

// =======================================================
// Event date formatters used by the playbook 'Movimentos
// Notáveis' timeline. Each commentary date is split into
// month / day / year stacks for the date sticker.
// =======================================================
const PT_MONTHS_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
function parseEventDate(value: unknown): Date | null {
  if (!value) return null
  // Accept Date, ISO string, "YYYY-MM-DD", or "DD/MM/YYYY".
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const s = String(value).trim()
  if (!s) return null
  // DD/MM/YYYY → YYYY-MM-DD
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) {
    const d = new Date(`${br[3]}-${br[2]}-${br[1]}`)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}
function formatEventMonth(value: unknown): string {
  const d = parseEventDate(value)
  return d ? PT_MONTHS_SHORT[d.getMonth()] : '-'
}
function formatEventDay(value: unknown): string {
  const d = parseEventDate(value)
  return d ? String(d.getDate()).padStart(2, '0') : '-'
}
function formatEventYear(value: unknown): string {
  const d = parseEventDate(value)
  return d ? String(d.getFullYear()) : '-'
}

// Current volume, tries fundamentus first, then asset field
const currentVolume = computed(() => {
  const v = safeNumber(
    (fundamentusData.value as any)?.key_statistics?.volume
  )
  if (v !== null) return v
  return safeNumber((asset.value as any)?.volume) ?? 0
})

// "Last update" label for the status bar, tracks the latest price_at
const lastUpdateLabel = computed(() => {
  const rawDate = (asset.value as any)?.price_at || (asset.value as any)?.priceAt
  if (!rawDate) return ''
  const d = new Date(rawDate)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
})

// Fundamentals register rows, maps basicIndicators into the terminal grid.
const fundamentalsCells = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    { label: 'P/L', value: ind.pl, tooltip: 'Preco sobre Lucro' },
    { label: 'P/VP', value: ind.pvpa, tooltip: 'Preco sobre Valor Patrimonial' },
    { label: 'DY', value: ind.dividendYield, tooltip: 'Dividend Yield 12M', accent: brand.colors.primary },
    { label: 'ROE', value: ind.roe, tooltip: 'Return on Equity' },
    { label: 'ROA', value: ind.roa, tooltip: 'Return on Assets' },
    { label: 'MG.LIQ', value: ind.netMargin, tooltip: 'Margem liquida' },
  ]
})

// Dividend heatmap cell styling, flat terminal look, no rounded/gradients.
// Cells share a border via gap-px on a bordered parent, so each cell is
// a simple rectangle filled with surface/background colors.
function monthCellStyle(item: any): Record<string, string> {
  if (item.highlight) {
    return {
      backgroundColor: brand.colors.primary + '1F', // ~12% amber tint
      borderLeft: `2px solid ${brand.colors.primary}`,
    }
  }
  if (item.percentage >= 80) {
    return {
      backgroundColor: brand.colors.positive + '14', // ~8% green tint
    }
  }
  if (item.percentage >= 50) {
    return {
      backgroundColor: brand.colors.positive + '0A', // ~4% green tint
    }
  }
  if (item.percentage > 0) {
    return { backgroundColor: brand.colors.surface }
  }
  return { backgroundColor: brand.colors.background }
}

function monthCellAccent(item: any): string {
  if (item.highlight) return brand.colors.primary
  if (item.percentage >= 80) return brand.colors.positive
  if (item.percentage >= 50) return brand.colors.text
  if (item.percentage > 0) return brand.colors.textMuted
  return brand.colors.border
}

// ==========================================================
// Editorial variant helpers (Norte Capital, advisor letter tone)
// ==========================================================

const assetEditorialDate = computed(() => {
  try {
    const d = new Date()
    const full = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return full.charAt(0).toUpperCase() + full.slice(1)
  } catch {
    return ''
  }
})

// A short narrated line that frames the day's price move in plain language.
const editorialPriceNarration = computed(() => {
  const pct = Number(asset.value?.change_percent)
  if (!Number.isFinite(pct)) return ''
  const abs = Math.abs(pct)
  if (abs < 0.2) return 'A ação negocia praticamente estável, em linha com o pregão anterior.'
  if (pct > 0 && abs < 1) return 'A ação sobe de forma discreta, dentro da oscilação típica do pregão.'
  if (pct > 0 && abs < 3) return 'A ação sobe de forma consistente, acima da variação média do Ibovespa.'
  if (pct > 0) return 'A ação avança com força no pregão de hoje, movimento que merece contexto antes de decisão.'
  if (pct < 0 && abs < 1) return 'A ação recua levemente, sem sinalizar mudança de tendência.'
  if (pct < 0 && abs < 3) return 'A ação recua, em movimento correspondente ao que vemos no setor hoje.'
  return 'A ação cai com intensidade. Recomendamos aguardar contexto antes de qualquer movimento.'
})

// A short thesis paragraph that introduces the fundamentals chapter.
const editorialThesisText = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return ''
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  const fragments: string[] = []
  if (Number.isFinite(pl) && pl > 0) {
    if (pl < 8) fragments.push(`negocia a ${ind.pl} vezes lucros, um múltiplo descontado em relação à média histórica do mercado brasileiro`)
    else if (pl < 15) fragments.push(`negocia a ${ind.pl} vezes lucros, múltiplo em linha com o que consideramos justo`)
    else fragments.push(`negocia a ${ind.pl} vezes lucros, múltiplo que exige um crescimento consistente para se justificar`)
  }
  if (Number.isFinite(dy) && dy > 0) {
    if (dy >= 6) fragments.push(`distribui ${ind.dividendYield} ao ano em proventos, acima da média de pares nacionais`)
    else if (dy >= 3) fragments.push(`distribui ${ind.dividendYield} ao ano em proventos, nível compatível com empresas maduras`)
    else fragments.push(`distribui ${ind.dividendYield} em proventos, política de dividendos ainda modesta`)
  }
  if (fragments.length === 0) {
    return `${asset.value?.name || tickerUpper.value} é acompanhada regularmente pela nossa mesa. Os números abaixo resumem a fotografia mais recente.`
  }
  return `${asset.value?.name || tickerUpper.value} ${fragments.join(', e ')}.`
})

// Fundamentals as a narrated list, different shape than the terminal grid.
const editorialFundamentalsList = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    { label: 'Preço sobre lucro', value: ind.pl },
    { label: 'Preço sobre valor patrimonial', value: ind.pvpa },
    { label: 'Dividend yield nos últimos 12 meses', value: ind.dividendYield },
    { label: 'Retorno sobre patrimônio', value: ind.roe },
    { label: 'Margem líquida', value: ind.netMargin },
  ]
})

// ==========================================================
// Research variant helpers (Investidor Sardinha, AUVP paper)
// ==========================================================

// Indicators table with per-row methodological reading
const researchAssetIndicators = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    {
      label: 'Preço sobre lucro',
      code: 'P/L · múltiplo de lucros',
      value: ind.pl,
      reading: 'Abaixo de 10 sugere desconto frente ao histórico brasileiro.',
    },
    {
      label: 'Preço sobre valor patrimonial',
      code: 'P/VP · book value',
      value: ind.pvpa,
      reading: 'Abaixo de 1: negocia por menos do que vale no papel. Investigue o motivo.',
    },
    {
      label: 'Dividend yield 12M',
      code: 'DY · proventos anualizados',
      value: ind.dividendYield,
      reading: 'Acima de 6% indica empresa geradora de caixa madura.',
    },
    {
      label: 'Retorno sobre patrimônio',
      code: 'ROE · eficiência do capital',
      value: ind.roe,
      reading: 'Acima de 15% ao longo de anos é sinal de vantagem competitiva.',
    },
    {
      label: 'Retorno sobre ativos',
      code: 'ROA · eficiência geral',
      value: ind.roa,
      reading: 'Menos manipulável que o ROE, ignora a alavancagem.',
    },
    {
      label: 'Margem líquida',
      code: 'MG.Líq · lucro sobre receita',
      value: ind.netMargin,
      reading: 'Dois dígitos sustentados indicam negócio com moat real.',
    },
  ]
})

// Thesis paragraph, long-form narrative combining the indicators
const researchAssetThesis = computed(() => {
  const ind = basicIndicators.value
  const name = asset.value?.name || tickerUpper.value
  if (!ind) {
    return `${name} está sob observação da mesa de análise AUVP. Os dados fundamentais ainda não estão disponíveis neste relatório, mas isso não dispensa o estudo: leia a última carta aos acionistas, entenda o modelo de negócio, compare com três pares diretos e pergunte-se se você compraria a empresa inteira pelo valor de mercado atual. Preço é ruído; fundamento é sinal.`
  }
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  const parts: string[] = []
  parts.push(`${name} negocia a ${ind.pl} vezes lucros e entrega dividend yield de ${ind.dividendYield} nos últimos doze meses.`)
  if (Number.isFinite(pl) && pl < 10) {
    parts.push(' Múltiplo em território historicamente descontado, pode indicar oportunidade, pode indicar que o mercado sabe algo que nós não sabemos. O estudo é justamente esse: descobrir qual das duas hipóteses é verdadeira.')
  } else if (Number.isFinite(pl) && pl > 20) {
    parts.push(' Múltiplo esticado em relação à média brasileira. Para justificar, a empresa precisa entregar crescimento consistente nos próximos anos, o que exige análise do histórico e do guidance.')
  } else {
    parts.push(' Múltiplo em linha com o que consideramos razoável para ativos do seu porte e setor.')
  }
  if (Number.isFinite(dy) && dy >= 6) {
    parts.push(' A distribuição de proventos é consistente com empresas maduras, o que reforça a tese de buy and hold para gerar renda passiva.')
  }
  parts.push(' A conclusão final, por princípio, é sua: os números servem como insumo, não como veredicto.')
  return parts.join('')
})

// Quick panel on the right of the cover, compact session data
const researchAssetQuickPanel = computed(() => {
  const ind = basicIndicators.value
  const price = Number(asset.value?.market_price)
  const changePct = Number(asset.value?.change_percent)
  const rows: { label: string; note?: string; value: string }[] = []

  rows.push({
    label: 'Último fechamento',
    note: 'cotação oficial B3',
    value: Number.isFinite(price) ? `R$ ${formatPriceNumber(price)}` : '-',
  })
  rows.push({
    label: 'Variação do dia',
    note: 'pregão corrente',
    value: Number.isFinite(changePct)
      ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2).replace('.', ',')}%`
      : '-',
  })
  rows.push({
    label: 'Market cap',
    note: 'valor de mercado',
    value: formatMarketCapShort(asset.value?.market_cap) || '-',
  })
  rows.push({
    label: 'Volume do dia',
    note: 'negócios em R$',
    value: formatVolumeShort(currentVolume.value) || '-',
  })
  if (ind?.dividendYield) {
    rows.push({
      label: 'Dividend yield',
      note: 'últimos 12 meses',
      value: String(ind.dividendYield),
    })
  }
  if (ind?.pl) {
    rows.push({
      label: 'P/L',
      note: 'múltiplo de lucros',
      value: String(ind.pl),
    })
  }
  return rows
})

// Dividends list rendered in §4, formatted dates and limited to 10 recent
const researchAssetDividends = computed(() => {
  const raw = Array.isArray(dividendsData.value) ? dividendsData.value : []
  const sorted = [...raw]
    .filter((d: any) => d?.payment_date)
    .sort((a: any, b: any) => {
      const da = new Date(a.payment_date).getTime()
      const db = new Date(b.payment_date).getTime()
      return db - da
    })
    .slice(0, 10)
  return sorted.map((d: any) => {
    const rate = Number(d.rate)
    let dateStr = '-'
    try {
      const dt = new Date(d.payment_date)
      dateStr = dt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {}
    return {
      paymentDate: dateStr,
      label: d.label || 'Provento',
      rate: Number.isFinite(rate)
        ? rate.toLocaleString('pt-BR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 6,
          })
        : '-',
    }
  })
})

// ==========================================================
// SHOWTIME VARIANT, Me Poupe! asset page helpers
// ==========================================================

// Quick panel on the cover (tilted card on the right)
const showtimeQuickPanel = computed(() => {
  const ind = basicIndicators.value
  const rows: { label: string; value: string; icon: string }[] = []

  rows.push({
    label: 'MARKET CAP',
    icon: 'i-lucide-landmark',
    value: formatMarketCapShort(asset.value?.market_cap) || '-',
  })
  rows.push({
    label: 'VOLUME HOJE',
    icon: 'i-lucide-activity',
    value: formatVolumeShort(currentVolume.value) || '-',
  })
  if (ind?.dividendYield) {
    rows.push({
      label: 'DIVIDENDOS',
      icon: 'i-lucide-piggy-bank',
      value: String(ind.dividendYield),
    })
  }
  if (ind?.pl) {
    rows.push({
      label: 'P/L',
      icon: 'i-lucide-calculator',
      value: String(ind.pl),
    })
  }
  return rows
})

// Indicator cards translated into Nath's voice
const showtimeIndicatorCards = computed(() => {
  const ind = basicIndicators.value
  const cards: { label: string; value: string; icon: string; explain: string }[] = []

  cards.push({
    label: 'DIVIDEND YIELD',
    value: ind?.dividendYield ? String(ind.dividendYield) : '-',
    icon: 'i-lucide-piggy-bank',
    explain: 'O quanto a empresa te paga por ano só por você ser dono dela. Quanto maior, mais dinheiro pingando.',
  })
  cards.push({
    label: 'P / L',
    value: ind?.pl ? String(ind.pl) : '-',
    icon: 'i-lucide-calculator',
    explain: 'Quantos anos de lucro custa comprar a empresa hoje. Abaixo de 15 costuma ser um bom sinal.',
  })
  cards.push({
    label: 'P / VPA',
    value: ind?.pvpa ? String(ind.pvpa) : '-',
    icon: 'i-lucide-scale',
    explain: 'Quanto você paga por cada real de patrimônio. Perto de 1 é a conta justa.',
  })
  cards.push({
    label: 'ROE',
    value: ind?.roe ? String(ind.roe) : '-',
    icon: 'i-lucide-trending-up',
    explain: 'O quanto a empresa gera de retorno pro dono. Acima de 10% é festa do aluguel!',
  })
  return cards
})

// Dividends list preview (6 most recent)
const showtimeDividendsPreview = computed(() => {
  const raw = Array.isArray(dividendsData.value) ? dividendsData.value : []
  return [...raw]
    .filter((d: any) => d?.payment_date)
    .sort((a: any, b: any) => {
      const da = new Date(a.payment_date).getTime()
      const db = new Date(b.payment_date).getTime()
      return db - da
    })
    .slice(0, 6)
})

function formatShowtimeDate(d: string | undefined): string {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '-'
  }
}

function formatDividendRate(rate: string | number | undefined): string {
  const n = Number(rate)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
}

// AUVP filters applied to the asset, 4 pass/fail checks
const researchAssetFilters = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  const parseNum = (v: unknown) => {
    if (v == null) return NaN
    const s = String(v).replace('%', '').replace(',', '.').trim()
    const n = Number(s)
    return Number.isFinite(n) ? n : NaN
  }
  const roe = parseNum(ind.roe)
  const netMargin = parseNum(ind.netMargin)
  const pl = parseNum(ind.pl)
  const pvp = parseNum(ind.pvpa)

  return [
    {
      label: 'Retorno sobre patrimônio',
      rule: 'ROE ≥ 10% (geração de valor)',
      observed: ind.roe || '-',
      passes: Number.isFinite(roe) && roe >= 10,
    },
    {
      label: 'Margem líquida',
      rule: 'margem ≥ 10% (competitividade sustentável)',
      observed: ind.netMargin || '-',
      passes: Number.isFinite(netMargin) && netMargin >= 10,
    },
    {
      label: 'Múltiplo de lucros',
      rule: 'P/L ≤ 15 (margem de segurança)',
      observed: ind.pl || '-',
      passes: Number.isFinite(pl) && pl > 0 && pl <= 15,
    },
    {
      label: 'Preço sobre valor patrimonial',
      rule: 'P/VP ≤ 1,5 (não pagar caro pelo book)',
      observed: ind.pvpa || '-',
      passes: Number.isFinite(pvp) && pvp > 0 && pvp <= 1.5,
    },
  ]
})

// Next steps, the AUVP ecosystem hooks specific to asset page
const researchAssetNextSteps = [
  {
    kind: 'CURSO',
    title: 'AUVP Escola',
    body: 'Aprofunde o método por trás dos filtros. Mais de 90 horas de aula sobre análise fundamentalista aplicada à realidade brasileira.',
    cta: 'Entrar na escola',
    url: 'https://auvp.com.br',
  },
  {
    kind: 'PLATAFORMA',
    title: 'AUVP Analítica',
    body: 'Compare este ativo com pares diretos, histórico próprio e médias setoriais. Screener e comparativos avançados.',
    cta: 'Comparar pares',
    url: 'https://analitica.auvp.com.br',
  },
  {
    kind: 'COMUNIDADE',
    title: 'Grupo VIP · Telegram',
    body: 'Debata este case com outros sardinhas estudando o mesmo setor. Canal oficial fechado para alunos AUVP.',
    cta: 'Entrar no grupo',
    url: 'https://t.me/investidorsardinha',
  },
]

// Short verdict, used in the highlighted red-pen callout
const researchAssetVerdict = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return 'Caso sob observação, dados insuficientes para análise.'
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  const roe = parseFloat(String(ind.roe).replace(',', '.').replace('%', ''))
  if (Number.isFinite(dy) && dy >= 6 && Number.isFinite(roe) && roe >= 10) {
    return 'Passa nos filtros de geração de caixa e retorno sobre capital.'
  }
  if (Number.isFinite(pl) && pl < 10 && Number.isFinite(roe) && roe >= 10) {
    return 'Múltiplo descontado com retorno aceitável, caso para aprofundar o estudo.'
  }
  if (Number.isFinite(pl) && pl > 25) {
    return 'Múltiplo esticado, exige convicção alta no crescimento futuro.'
  }
  return 'Caso neutro pelos filtros metodológicos, recomenda-se estudo aprofundado.'
})

// ==========================================================
// Mentor variant helpers (Primo Rico, masterclass tone)
// ==========================================================

// Quick 4-stat block rendered in the hero right column.
const mentorQuickStats = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    { label: 'DIVIDEND YIELD', value: ind.dividendYield },
    { label: 'P/L', value: ind.pl },
    { label: 'P/VP', value: ind.pvpa },
    { label: 'ROE', value: ind.roe },
  ]
})

// Fundamentals list, 6 heavy rows with descriptive copy in the mentor tone.
const mentorFundamentalsList = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    {
      label: 'PREÇO / LUCRO',
      shortCode: 'P/L · Quantos anos pra pagar o investimento',
      description: 'Quanto mais baixo, mais descontado está o ativo em relação ao lucro gerado. Compare sempre com pares do mesmo setor.',
      value: ind.pl,
    },
    {
      label: 'PREÇO / VALOR PATRIMONIAL',
      shortCode: 'P/VP · O mercado paga acima ou abaixo do book value',
      description: 'Abaixo de 1 significa que o ativo negocia por menos do que vale no papel. Cuidado com value traps, entenda porquê está barato.',
      value: ind.pvpa,
    },
    {
      label: 'DIVIDEND YIELD',
      shortCode: 'DY 12M · Renda passiva em relação ao preço',
      description: 'Quanto o ativo distribui em proventos por ano como percentual do preço atual. Útil para comparar geradores de caixa.',
      value: ind.dividendYield,
    },
    {
      label: 'RETORNO SOBRE PATRIMÔNIO',
      shortCode: 'ROE · Eficiência do capital dos acionistas',
      description: 'Acima de 15% é sinal de gestão eficiente. Empresas que sustentam ROE alto por anos são as que constroem valor de verdade.',
      value: ind.roe,
    },
    {
      label: 'RETORNO SOBRE ATIVOS',
      shortCode: 'ROA · Eficiência sobre todos os ativos',
      description: 'Mede quanto a empresa gera de lucro sobre cada real de ativo. Menos manipulável que o ROE porque ignora a alavancagem.',
      value: ind.roa,
    },
    {
      label: 'MARGEM LÍQUIDA',
      shortCode: 'MG.LÍQ · Quanto sobra de cada real vendido',
      description: 'Percentual do lucro líquido sobre a receita total. Margens sustentáveis de dois dígitos indicam negócio com moat.',
      value: ind.netMargin,
    },
  ]
})

// Pull quote in the mentor variant, rotates between a few Thiago-esque lines
// based on the asset's change percent so it feels contextual without hitting AI.
const mentorAssetQuote = computed(() => {
  const pct = Number(asset.value?.change_percent)
  if (Number.isFinite(pct)) {
    if (pct < -3) return 'O mercado testa sua convicção todo dia. Tese não muda com 3% de queda.'
    if (pct < 0) return 'Preço oscila. Fundamento, não.'
    if (pct > 3) return 'Euforia não é motivo pra comprar. Nem sua ausência é motivo pra vender.'
  }
  return 'Patrimônio se constrói com consistência, não com sorte. Skin in the game.'
})

// Thesis text, a narrated paragraph that adapts to the basic indicators.
const mentorThesisText = computed(() => {
  const ind = basicIndicators.value
  const name = asset.value?.name || tickerUpper.value
  if (!ind) {
    return `${name} está no seu radar? Antes de qualquer decisão, entenda o negócio: como a empresa ganha dinheiro, quem são os concorrentes, qual a margem de segurança na tese. Os números são só a foto, a história é que importa.`
  }
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  const parts: string[] = [`${name} negocia a ${ind.pl} vezes lucros`]
  if (Number.isFinite(pl) && pl < 10) parts.push(', múltiplo que, em ambientes normais, indica desconto em relação ao fluxo de caixa gerado')
  else if (Number.isFinite(pl) && pl > 20) parts.push(', múltiplo esticado que exige crescimento sustentado pra fazer sentido')
  if (Number.isFinite(dy) && dy >= 5) {
    parts.push(`e distribui ${ind.dividendYield} ao ano em proventos, acima do CDI em vários cenários`)
  }
  parts.push('.\n\nOlhe além do número: entenda o ciclo do setor, a consistência histórica dos resultados e o posicionamento competitivo. Nenhum indicador sozinho substitui pensamento.')
  return parts.join(' ')
})

// A punchy one-liner summary in the thesis section.
const mentorOneLiner = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return 'Faça sua lição de casa antes de decidir.'
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  if (Number.isFinite(dy) && dy >= 6) return 'Gerador de caixa para quem busca renda passiva com disciplina.'
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  if (Number.isFinite(pl) && pl < 10) return 'Múltiplo descontado, vale entender se é oportunidade ou value trap.'
  return 'Um caso que merece estudo antes de virar posição.'
})

// Roman numerals for the fundamentals list prefix in editorial mode.
function romanNumeralAsset(n: number): string {
  const romans: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
  }
  return romans[n] || String(n)
}

// Smart/AI-interpreted indicators register
const smartCells = computed(() => {
  const ii = intelligentIndicators.value
  if (!ii) return []
  return [
    { label: 'D/E', value: (ii.debtToEquity?.value || '') + (ii.debtToEquity?.value ? '%' : '') },
    { label: 'LIQ.CORR', value: ii.currentRatio?.value },
    { label: 'ROE', value: ii.roe?.value },
    { label: 'ROA', value: ii.roa?.value },
    { label: 'MG.LUCRO', value: ii.profitMargin?.value },
    { label: 'P/VP', value: ii.priceToBook?.value },
    { label: 'P/L.FWD', value: ii.forwardPE?.value },
    { label: 'BAZIN', value: ii.bazinPrice?.value },
  ]
})

// ==========================================================
// Market Commentaries (AI-generated news/analysis)
// ==========================================================
const commentariesService = useCommentariesService()
const { data: commentariesData } = await useAsyncData(
  `commentaries-${ticker}`,
  () => commentariesService.forTicker(ticker),
  { default: () => [] }
)
const commentaries = computed(() => commentariesData.value || [])

const chartMarkers = computed(() =>
  commentaries.value.map((c) => ({
    date: c.date,
    title: c.title,
    changePercent: c.change_percent,
  }))
)

const highlightedCommentaryDate = ref<string | null>(null)

function onMarkerClick(date: string) {
  highlightedCommentaryDate.value = date
  // Scroll to the commentary element
  nextTick(() => {
    const el = document.getElementById(`commentary-${date}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Clear highlight after a few seconds
      setTimeout(() => {
        highlightedCommentaryDate.value = null
      }, 3000)
    }
  })
}

// ==========================================================
// Backfill: generate historical commentaries on first visit
// ==========================================================
interface BackfillStatus {
  running: boolean
  total: number
  current: number
  done: boolean
}

const backfillStatus = ref<BackfillStatus | null>(null)
let backfillPollTimer: ReturnType<typeof setInterval> | null = null

async function refreshCommentaries() {
  try {
    const fresh = await commentariesService.forTicker(ticker)
    commentariesData.value = fresh
  } catch {}
}

async function startBackfill() {
  try {
    // Fire and forget (don't await the POST, server runs it async)
    await $fetch<{ queued?: number; skipped?: boolean; reason?: string }>(
      '/api/commentaries/backfill-ticker',
      {
        method: 'POST',
        body: { ticker: tickerUpper.value },
      }
    ).catch(() => null)

    // Poll status every 3s
    let stableCount = 0
    backfillPollTimer = setInterval(async () => {
      try {
        const res = await $fetch<{ status: BackfillStatus; stale?: boolean }>(
          '/api/commentaries/backfill-status',
          { query: { ticker: tickerUpper.value } }
        )
        const status = res?.status
        if (!status) return

        // Only expose to UI if there's actual work
        if (status.total > 0 && !status.done) {
          backfillStatus.value = status
        }

        // Refresh commentaries list whenever progress increments
        if (status.current > 0) {
          await refreshCommentaries()
        }

        if (status.done || !status.running) {
          stableCount++
          // Wait one extra tick to catch the last saved commentary
          if (stableCount >= 2) {
            backfillStatus.value = null
            if (backfillPollTimer) {
              clearInterval(backfillPollTimer)
              backfillPollTimer = null
            }
          }
        }
      } catch {}
    }, 3000)

    // Hard timeout after 3 minutes
    setTimeout(
      () => {
        if (backfillPollTimer) {
          clearInterval(backfillPollTimer)
          backfillPollTimer = null
        }
        backfillStatus.value = null
      },
      3 * 60 * 1000
    )
  } catch {}
}

onMounted(() => {
  // Start backfill in background, but only if this tenant actually
  // shows market commentaries. Saves AI costs on tenants that disabled it.
  if (brand.features?.showMarketCommentaries === false) return
  if (brand.assetPage.showMarketCommentaries === false) return
  startBackfill()
})

onBeforeUnmount(() => {
  if (backfillPollTimer) {
    clearInterval(backfillPollTimer)
    backfillPollTimer = null
  }
})

const assetName = computed(() => {
  const resolvedName = asset.value?.name
  if (!resolvedName) return tickerUpper.value
  // Brapi costuma devolver "BRASIL      ON      NM" com espacos multiplos
  // para alinhamento. Normaliza para evitar strings feias em title/meta.
  return String(resolvedName).replace(/\s+/g, ' ').trim()
})
const assetCurrentPrice = computed(() => {
  const price =
    safeNumber(asset.value?.market_price) ?? safeNumber(asset.value?.close)
  return price
})
const formattedAssetPrice = computed(() => {
  if (assetCurrentPrice.value === null) return null
  return `R$ ${assetCurrentPrice.value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})
const dailyChangePercent = computed(() =>
  safeNumber(asset.value?.change_percent)
)
const dailyChangeSentence = computed(() => {
  if (dailyChangePercent.value === null) return null
  const absolute = Math.abs(dailyChangePercent.value).toFixed(2)
  const trend = dailyChangePercent.value >= 0 ? 'alta' : 'queda'
  return `${trend} de ${absolute}% hoje`
})
const yearChangeRaw = computed(() => {
  const fundamentusChange = safeNumber(
    fundamentusData.value?.key_statistics?.fifty_two_week_change
  )
  const tickerChange = safeNumber(
    (asset.value as { year_change_percent?: unknown } | undefined)
      ?.year_change_percent
  )
  return fundamentusChange ?? tickerChange
})
const yearChangePercent = computed(() => {
  if (yearChangeRaw.value === null) return null
  const normalized =
    Math.abs(yearChangeRaw.value) <= 1
      ? yearChangeRaw.value * 100
      : yearChangeRaw.value
  return normalized
})
const yearChangeSentence = computed(() => {
  if (yearChangePercent.value === null) return null
  const absolute = Math.abs(yearChangePercent.value).toFixed(2)
  const trend = yearChangePercent.value >= 0 ? 'alta' : 'queda'
  return `Nos últimos 12 meses, ${assetName.value} acumula ${trend} de ${absolute}%.`
})

const pageTitle = computed(() => {
  // Ticker primeiro, mais curto e direto. Meta Seobility: < 580px.
  // Formato anterior tinha 615px com preço + nome + 3 keywords; reduzido
  // removendo "e Análise" e encurtando o nome da empresa quando possível.
  const price = formattedAssetPrice.value
    ? ` ${formattedAssetPrice.value}`
    : ''
  return `${tickerUpper.value}${price} · ${assetName.value} | Cotação e Dividendos`
})

const pageDescription = computed(() => {
  // Meta Seobility: max 1000px (antes: 1435px). Encurtado removendo
  // redundâncias (nome da empresa já vem no title) e lista longa de
  // keywords no final. Mantém ticker + preço + variação + CTA curto.
  const priceSegment = formattedAssetPrice.value
    ? `hoje ${formattedAssetPrice.value}`
    : 'em tempo real'
  const intradaySegment = dailyChangeSentence.value
    ? `, ${dailyChangeSentence.value}`
    : ''
  const yearSegment = yearChangeSentence.value
    ? ` ${yearChangeSentence.value}.`
    : ''
  return `${tickerUpper.value}: cotação ${priceSegment}${intradaySegment}.${yearSegment} Dividendos, indicadores e análise com IA na ${brand.name}.`
})

const canonicalUrl = computed(
  () => `${baseSiteUrl.value}/asset/${ticker.toLowerCase()}`
)

const shareImage = computed(() => {
  const logo = asset.value?.logo
  if (typeof logo === 'string' && logo.length > 0) {
    if (logo.startsWith('http')) {
      return logo
    }
    return `${baseSiteUrl.value}${logo.startsWith('/') ? logo : `/${logo}`}`
  }
  return `${baseSiteUrl.value}/512x512.png`
})

// FAQPage expande a SERP com rich snippets (accordion). Perguntas escolhidas
// para bater o intent das pessoas que procuram o ticker: "o que eh", "paga
// dividendos", "qual a cotacao", "como investir", "qual o setor".
const faqStructuredData = computed(() => {
  const ticker = tickerUpper.value
  const name = assetName.value
  const price = formattedAssetPrice.value || 'variável conforme o pregão'
  const sector = asset.value?.sector || asset.value?.industry_category || null
  const divLastPaid =
    (dividendsData.value && dividendsData.value.length > 0)
      ? dividendsData.value[0]
      : null

  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `O que é ${ticker}?`,
      a: `${ticker} é o código de negociação da ${name} na B3 (Bolsa de Valores brasileira).${sector ? ` A empresa atua no setor de ${sector}.` : ''} Esse ticker pode ser comprado através de qualquer corretora autorizada.`,
    },
    {
      q: `Qual a cotação de ${ticker} hoje?`,
      a: `A cotação atual de ${ticker} (${name}) é ${price}.${dailyChangeSentence.value ? ' No dia, ' + dailyChangeSentence.value + '.' : ''} Os preços são atualizados em tempo real durante o pregão da B3 (10h às 17h30).`,
    },
    {
      q: `${ticker} paga dividendos?`,
      a: divLastPaid
        ? `Sim, ${ticker} distribui dividendos aos acionistas. O último pagamento registrado foi em ${String(divLastPaid.payment_date || '').slice(0, 10)}. Consulte o histórico completo de dividendos, DY e MDI na página.`
        : `Consulte o histórico de dividendos, dividend yield e indicadores fundamentalistas de ${ticker} atualizados diariamente.`,
    },
    {
      q: `Como investir em ${ticker}?`,
      a: `Para investir em ${ticker} você precisa abrir conta em uma corretora autorizada a operar na B3, transferir recursos e comprar o ativo pelo home broker ou aplicativo da corretora. Lembre-se que investimento em renda variável envolve riscos de perda de capital.`,
    },
    {
      q: `Qual o setor de ${name}?`,
      a: sector
        ? `A ${name} (${ticker}) atua no setor de ${sector} na classificação setorial da B3.`
        : `${name} (${ticker}) é negociada na B3. Consulte os indicadores fundamentalistas e a ficha da companhia na página do ativo.`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }
})

// NewsArticle para cada commentary mais recente (ate 5), marcando a pagina
// como fonte fresca no indice do Google. Ajuda em queries tipo "petr4 hoje".
const newsArticlesStructuredData = computed(() => {
  const arr = (commentaries.value || []) as any[]
  if (!arr || arr.length === 0) return []
  return arr.slice(0, 5).map((c) => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: c.title,
    description: (c.commentary || '').slice(0, 200),
    datePublished: c.date,
    dateModified: c.updated_at || c.date,
    author: {
      '@type': 'Organization',
      name: brand.name,
    },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseSiteUrl.value}/512x512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${canonicalUrl.value}#commentary-${c.date}`,
    },
    about: {
      '@type': 'FinancialProduct',
      name: `${tickerUpper.value}, ${assetName.value}`,
    },
    isAccessibleForFree: true,
  }))
})

const financialProductStructuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: `${tickerUpper.value}, ${assetName.value}`,
  alternateName: [tickerUpper.value, assetName.value].filter(Boolean),
  url: canonicalUrl.value,
  description: pageDescription.value,
  provider: {
    '@type': 'Organization',
    name: 'B3, Brasil, Bolsa, Balcão',
    url: 'https://www.b3.com.br',
  },
  offers: assetCurrentPrice.value
    ? {
        '@type': 'Offer',
        price: assetCurrentPrice.value,
        priceCurrency: 'BRL',
        priceValidUntil: new Date().toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
      }
    : undefined,
  image: shareImage.value,
}))

const combinedStructuredData = computed(() => {
  const base: any[] = [financialProductStructuredData.value, faqStructuredData.value]
  return [...base, ...newsArticlesStructuredData.value]
})

usePageSeo({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  path: `/asset/${ticker.toLowerCase()}`,
  image: () => shareImage.value,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Ativos', path: '/acoes' },
    { name: tickerUpper.value, path: `/asset/${ticker.toLowerCase()}` },
  ],
  structuredData: combinedStructuredData.value,
})

const monthLabels = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

// Mantém apenas o label do chartConfig
const chartLabel = computed(
  () =>
    generateChartConfig({
      timeRange: selectedTimeRange.value,
      label: ticker.toUpperCase(),
      basePrice: asset.value?.close || 100,
    }).legend
)

async function fetchChartData() {
  isLoadingChart.value = true
  try {
    let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' =
      '1mo'
    if (selectedTimeRange.value === 'month') period = '1mo'
    else if (selectedTimeRange.value === 'year') period = '12mo'
    else if (selectedTimeRange.value === '3years') period = '3y'
    else if (selectedTimeRange.value === 'full') period = 'full'
    const data = await assetHistoricPrices(ticker, period)
    // Transforma para o formato aceito pelo gráfico
    chartData.value = Array.isArray(data)
      ? data.map((item) => ({
          date: item.price_at,
          value: item.market_price,
          timestamp: new Date(item.price_at).getTime(),
        }))
      : []
  } catch (error) {
    console.error('Error fetching chart data:', error)
    chartData.value = []
  } finally {
    isLoadingChart.value = false
  }
}

async function fetchDividendsData() {
  isLoadingDividends.value = true
  try {
    const data = await getTickerDividends(ticker)
    dividendsData.value = Array.isArray(data) ? data : []
  } catch {
    dividendsData.value = []
  }
  isLoadingDividends.value = false
}

function redirectToLogin(source: string) {
  navigateTo(
    `/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`
  )
}

async function fetchFundamentusData() {
  isLoadingFundamentus.value = true
  try {
    const data = await getTickerFundamentus(ticker)
    fundamentusData.value = data || null
  } catch {
    fundamentusData.value = null
  }
  isLoadingFundamentus.value = false
}

// Computed para transformar dados da API para formato dos gráficos
const transformedFundamentusData = computed((): FundamentusData | undefined => {
  if (!fundamentusData.value) return undefined

  const data = fundamentusData.value

  // Pega o período mais recente (primeiro item do array)
  const latestCashFlow =
    data.cash_flow?.quarterly?.[0] || data.cash_flow?.annual?.[0]
  const latestBalance =
    data.balance?.quarterly?.[0] || data.balance?.annual?.[0]
  const latestIncome = data.income?.quarterly?.[0] || data.income?.annual?.[0]

  return {
    // Indicadores básicos
    priceToEarnings: parseFloat(data.key_statistics?.forward_pe) || undefined,
    priceToBook: parseFloat(data.key_statistics?.price_to_book) || undefined,
    dividendYield: parseFloat(data.key_statistics?.dividend_yield) || undefined,
    roe: parseFloat(data.financial_data?.return_on_equity) || undefined,
    roa: parseFloat(data.financial_data?.return_on_assets) || undefined,
    netMargin: parseFloat(data.financial_data?.profit_margins) || undefined,

    // Demonstrações financeiras - usando dados mais recentes
    cashFlow: latestCashFlow
      ? {
          operatingCashFlow:
            parseFloat(latestCashFlow.operating_cash_flow) || undefined,
          investingCashFlow:
            parseFloat(latestCashFlow.investment_cash_flow) || undefined,
          financingCashFlow:
            parseFloat(latestCashFlow.financing_cash_flow) || undefined,
          freeCashFlow:
            parseFloat(data.financial_data?.free_cashflow) || undefined,
        }
      : undefined,

    balanceSheet: latestBalance
      ? {
          totalAssets: parseFloat(latestBalance.total_assets) || undefined,
          totalLiabilities: parseFloat(latestBalance.total_liab) || undefined,
          totalEquity: parseFloat(latestBalance.equity) || undefined,
          currentAssets: undefined, // Não disponível na estrutura atual
          currentLiabilities: undefined, // Não disponível na estrutura atual
          longTermDebt: latestBalance.long_term_debt
            ? parseFloat(latestBalance.long_term_debt)
            : undefined,
          cash: parseFloat(latestBalance.cash) || undefined,
        }
      : undefined,

    incomeStatement: latestIncome
      ? {
          totalRevenue: parseFloat(latestIncome.total_revenue) || undefined,
          grossProfit: parseFloat(latestIncome.gross_profit) || undefined,
          operatingIncome:
            parseFloat(latestIncome.operating_income) || undefined,
          netIncome: parseFloat(latestIncome.net_income) || undefined,
          ebitda: data.financial_data?.ebitda
            ? parseFloat(data.financial_data.ebitda)
            : undefined,
          operatingExpenses: undefined, // Não disponível diretamente, pode ser calculado
        }
      : undefined,
  }
})

const cashFlowItems = computed(() => {
  const cashFlow = transformedFundamentusData.value?.cashFlow
  if (!cashFlow) return []
  return [
    { label: 'Operacional', value: cashFlow.operatingCashFlow },
    { label: 'Investimento', value: cashFlow.investingCashFlow },
    { label: 'Financiamento', value: cashFlow.financingCashFlow },
    { label: 'Livre', value: cashFlow.freeCashFlow },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

const balanceItems = computed(() => {
  const balance = transformedFundamentusData.value?.balanceSheet
  if (!balance) return []
  return [
    { label: 'Ativos', value: balance.totalAssets },
    { label: 'Passivos', value: balance.totalLiabilities },
    { label: 'Patrimônio', value: balance.totalEquity },
    { label: 'Caixa', value: balance.cash },
    { label: 'Dívida LP', value: balance.longTermDebt },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

const incomeItems = computed(() => {
  const income = transformedFundamentusData.value?.incomeStatement
  if (!income) return []
  const derivedOperatingExpenses =
    income.operatingExpenses !== undefined && income.operatingExpenses !== null
      ? Number(income.operatingExpenses)
      : income.grossProfit !== undefined && income.operatingIncome !== undefined
        ? Number(income.grossProfit) - Number(income.operatingIncome)
        : undefined

  return [
    { label: 'Receita', value: income.totalRevenue },
    { label: 'Lucro Bruto', value: income.grossProfit },
    { label: 'Operacional', value: income.operatingIncome },
    { label: 'Lucro Líquido', value: income.netIncome },
    { label: 'EBITDA', value: income.ebitda },
    {
      label: 'Despesas',
      value:
        derivedOperatingExpenses !== undefined &&
        Number.isFinite(derivedOperatingExpenses)
          ? -Math.abs(derivedOperatingExpenses)
          : undefined,
    },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

// Computeds para indicadores inteligentes
const intelligentIndicators = computed(() => {
  if (!fundamentusData.value) return null

  const data = fundamentusData.value
  const stats = data.key_statistics
  const financial = data.financial_data

  // Cálculos de indicadores inteligentes com safeguards
  const debtToEquityRaw = safeNumber(financial?.debt_to_equity)
  const debtToEquityRatio = debtToEquityRaw ?? 0

  const totalCash = safeNumber(financial?.total_cash)
  const totalDebt = safeNumber(financial?.total_debt)
  const currentRatioRaw = totalCash !== null && totalDebt !== null && totalDebt !== 0
    ? totalCash / totalDebt
    : null
  const currentRatio = currentRatioRaw ?? 0

  const roeRaw = safeNumber(financial?.return_on_equity)
  const roe = roeRaw !== null ? roeRaw * 100 : 0

  const roaRaw = safeNumber(financial?.return_on_assets)
  const roa = roaRaw !== null ? roaRaw * 100 : 0

  const profitMarginRaw = safeNumber(financial?.profit_margins)
  const profitMargin = profitMarginRaw !== null ? profitMarginRaw * 100 : 0

  const priceToBookRaw = safeNumber(stats?.price_to_book)
  const priceToBook = priceToBookRaw ?? 0

  const forwardPERaw = safeNumber(stats?.forward_pe)
  const forwardPE = forwardPERaw ?? 0

  const bazinIndicatorPrice = bazinPrice.value

  // Classificações baseadas em benchmarks do mercado
  const getDebtRating = (ratio: number) => {
    if (ratio < 30) return { label: 'Baixo', color: 'text-green-400' }
    if (ratio < 60) return { label: 'Moderado', color: 'text-yellow-400' }
    return { label: 'Alto', color: 'text-red-400' }
  }

  const getROERating = (roeVal: number) => {
    if (roeVal > 15) return { label: 'Excelente', color: 'text-green-400' }
    if (roeVal > 10) return { label: 'Bom', color: 'text-yellow-400' }
    return { label: 'Baixo', color: 'text-red-400' }
  }

  const getPERating = (pe: number) => {
    if (pe < 10) return { label: 'Barato', color: 'text-green-400' }
    if (pe < 20) return { label: 'Justo', color: 'text-yellow-400' }
    return { label: 'Caro', color: 'text-red-400' }
  }

  return {
    debtToEquity: {
      value: debtToEquityRaw !== null ? formatIndicator(debtToEquityRaw, { decimals: 1 }) : '-',
      rating: getDebtRating(debtToEquityRatio),
    },
    currentRatio: {
      value: currentRatioRaw !== null ? formatIndicator(currentRatioRaw, { decimals: 2 }) : '-',
      rating:
        currentRatio > 1
          ? { label: 'Saudável', color: 'text-green-400' }
          : { label: 'Preocupante', color: 'text-red-400' },
    },
    roe: {
      value: roeRaw !== null ? formatIndicator(roeRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '-',
      rating: getROERating(roe),
    },
    roa: {
      value: roaRaw !== null ? formatIndicator(roaRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '-',
      rating:
        roa > 5
          ? { label: 'Bom', color: 'text-green-400' }
          : { label: 'Baixo', color: 'text-red-400' },
    },
    profitMargin: {
      value: profitMarginRaw !== null ? formatIndicator(profitMarginRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '-',
      rating:
        profitMargin > 10
          ? { label: 'Alta', color: 'text-green-400' }
          : { label: 'Baixa', color: 'text-red-400' },
    },
    priceToBook: {
      value: priceToBookRaw !== null ? formatIndicator(priceToBookRaw, { decimals: 2 }) : '-',
      rating:
        priceToBook < 1.5
          ? { label: 'Barato', color: 'text-green-400' }
          : { label: 'Caro', color: 'text-red-400' },
    },
    forwardPE: {
      value: forwardPERaw !== null ? formatIndicator(forwardPERaw, { decimals: 1 }) : '-',
      rating: getPERating(forwardPE),
    },
    bazinPrice: {
      value: bazinPriceDisplay.value,
      rating:
        bazinIndicatorPrice !== null
          ? {
              label: 'Referência Bazin',
              color: 'text-sky-400',
            }
          : undefined,
    },
  }
})

function extractMonthIndex(dateString: string | undefined) {
  if (!dateString) return null

  const parsedDate = new Date(dateString)
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getUTCMonth()
  }

  const normalized = dateString.trim()
  const parts = normalized.includes('-')
    ? normalized.split('-')
    : normalized.split('/')

  if (parts.length >= 2) {
    const monthPart = parts[1]
    const monthIndex = Number.parseInt(monthPart, 10) - 1
    if (Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return monthIndex
    }
  }

  return null
}

const highlightedMonthsCount = 3

function selectLatestRecord<T extends { period_end_date?: string }>(
  ...sources: Array<T[] | null | undefined>
): T | null {
  const withDates = sources
    .flatMap((items) => items ?? [])
    .map((item) => {
      const date = item?.period_end_date ? new Date(item.period_end_date) : null
      if (!date || Number.isNaN(date.getTime())) return null
      return { item, timestamp: date.getTime() }
    })
    .filter((entry): entry is { item: T; timestamp: number } => entry !== null)

  if (!withDates.length) return null

  withDates.sort((a, b) => b.timestamp - a.timestamp)
  return withDates[0].item
}

const aggregatedMdiEntries = computed<AssetMdiEntry[]>(() => {
  const fromDividends = dividendsData.value.find(
    (entry) => Array.isArray(entry.mdi) && entry.mdi.length
  )

  if (fromDividends?.mdi?.length) {
    return fromDividends.mdi
  }

  if (Array.isArray(asset.value?.mdi) && asset.value?.mdi.length) {
    return asset.value.mdi
  }

  return []
})

const bazinPrice = computed<number | null>(() => {
  if (!Array.isArray(dividendsData.value) || dividendsData.value.length === 0) {
    return null
  }

  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  let total = 0

  for (const record of dividendsData.value) {
    const rate = safeNumber(record?.rate)
    if (!Number.isFinite(rate) || rate === null || rate <= 0) continue

    const paymentDate = record?.payment_date
      ? new Date(record.payment_date)
      : null
    if (!paymentDate || Number.isNaN(paymentDate.getTime())) continue

    if (paymentDate < cutoff || paymentDate > now) continue

    total += rate
  }

  if (total <= 0) return null

  const ceilingPrice = total * 16
  return Number.isFinite(ceilingPrice) ? ceilingPrice : null
})

const bazinPriceDisplay = computed(() => {
  const price = bazinPrice.value
  if (!Number.isFinite(price) || price === null) return '-'

  return `R$ ${price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})

const monthlyDividendProbability = computed(() => {
  const baseMonths = monthLabels.map((label) => ({
    label,
    percentage: 0,
    formattedPercentage: '0%',
    highlight: false,
  }))

  const aggregated = aggregatedMdiEntries.value
  if (aggregated.length) {
    const totalYears = safeNumber(aggregated[0]?.total_years) ?? null
    const monthsWithPercentages = baseMonths.map((month, index) => {
      const stats = aggregated.find((item) => item.month === index + 1)
      const occurrences = stats ? Number(stats.occurrences ?? 0) : 0
      const divisor =
        safeNumber(stats?.total_years) ??
        totalYears ??
        (occurrences > 0 ? occurrences : 0)
      const percentage =
        divisor && divisor > 0 ? (occurrences / divisor) * 100 : 0
      const formattedPercentage =
        percentage === 0
          ? '0%'
          : percentage < 10
            ? `${percentage.toFixed(1)}%`
            : `${Math.round(percentage)}%`

      return {
        ...month,
        percentage,
        formattedPercentage,
      }
    })

    const topMonths = monthsWithPercentages
      .filter((item) => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, highlightedMonthsCount)
      .map((item) => item.label)

    const highlightSet = new Set(topMonths)

    const finalMonths = monthsWithPercentages.map((item) => ({
      ...item,
      highlight: highlightSet.has(item.label),
    }))

    const totalOccurrences = aggregated.reduce(
      (acc, item) => acc + Number(item.occurrences ?? 0),
      0
    )

    return {
      months: finalMonths,
      totalCount: totalYears ?? totalOccurrences,
      totalYears: totalYears ?? null,
      referenceLabel: totalYears
        ? `(Histórico de ${totalYears} anos)`
        : totalOccurrences
          ? `(Baseado em ${totalOccurrences} pagamentos)`
          : null,
    }
  }

  const records = dividendsData.value ?? []
  if (!records.length) {
    return {
      months: baseMonths,
      totalCount: 0,
      totalYears: null,
      referenceLabel: null,
    }
  }

  const counts = Array.from({ length: 12 }, () => 0)

  records.forEach((item) => {
    const monthIndex = extractMonthIndex(item.payment_date)
    if (monthIndex !== null) {
      counts[monthIndex] += 1
    }
  })

  const totalCount = counts.reduce((acc, value) => acc + value, 0)

  if (!totalCount) {
    return {
      months: baseMonths,
      totalCount,
      totalYears: null,
      referenceLabel: null,
    }
  }

  const monthsWithPercentages = baseMonths.map((month, index) => {
    const count = counts[index]
    const percentage = totalCount ? (count / totalCount) * 100 : 0
    const formattedPercentage =
      percentage === 0
        ? '0%'
        : percentage < 10
          ? `${percentage.toFixed(1)}%`
          : `${Math.round(percentage)}%`

    return {
      ...month,
      percentage,
      formattedPercentage,
    }
  })

  const topMonths = monthsWithPercentages
    .filter((item) => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, highlightedMonthsCount)
    .map((item) => item.label)

  const highlightSet = new Set(topMonths)

  const finalMonths = monthsWithPercentages.map((item) => ({
    ...item,
    highlight: highlightSet.has(item.label),
  }))

  return {
    months: finalMonths,
    totalCount,
    totalYears: null,
    referenceLabel:
      totalCount > 0 ? `(Baseado em ${totalCount} pagamentos)` : null,
  }
})

function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const lastComma = trimmed.lastIndexOf(',')
  const lastDot = trimmed.lastIndexOf('.')
  const hasComma = lastComma !== -1
  const hasDot = lastDot !== -1

  let decimalSeparator: ',' | '.' | null = null
  if (hasComma && hasDot) {
    decimalSeparator = lastComma > lastDot ? ',' : '.'
  } else if (hasComma) {
    decimalSeparator = ','
  } else if (hasDot) {
    decimalSeparator = '.'
  }

  let standardized = trimmed
  if (decimalSeparator) {
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ','
    const parts = standardized.split(thousandsSeparator)
    standardized = parts.join('')
    if (decimalSeparator === ',') {
      standardized = standardized.replace(',', '.')
    }
  }

  const parsed = Number.parseFloat(standardized)
  return Number.isFinite(parsed) ? parsed : null
}

// Helper para formatar indicadores de forma segura (nunca retorna NaN)
function formatIndicator(
  value: unknown,
  options: {
    decimals?: number
    multiplier?: number
    suffix?: string
    fallback?: string
  } = {}
): string {
  const { decimals = 1, multiplier = 1, suffix = '', fallback = '-' } = options
  const num = safeNumber(value)
  if (num === null) return fallback
  const result = num * multiplier
  if (!Number.isFinite(result)) return fallback
  return `${result.toFixed(decimals)}${suffix}`
}

// Computed para indicadores básicos com safeguards
const scrapeExtras = computed(() => {
  return (fundamentusData.value as any)?.scrape_extras ?? null
})

const isFii = computed(() => scrapeExtras.value?.asset_type === 'fii')
const isBdr = computed(() => scrapeExtras.value?.asset_type === 'bdr')
const isEtf = computed(() => scrapeExtras.value?.asset_type === 'etf')
// Gates stock-only sections (DRE/Balance/consensus/heatmap). BDRs/FIIs/ETFs
// don't have the Brazilian company financials the stock layout assumes.
const isForeignOrFii = computed(() => isFii.value || isBdr.value || isEtf.value)

/**
 * Top-of-page 6-cell register. Picks relevant metrics by asset type:
 *   - FII   : VPA / cotistas / rendimento mensal
 *   - BDR   : same layout as stock but ROE/margins come from the scrape
 *             (Brazilian KeyStatistic model is empty for BDR tickers)
 *   - ETF   : basket metrics (52w range, ratio, volume) instead of fundamentals
 *   - STOCK : classic VOL · M.CAP · DY · P/L · P/VP · ROE
 */
const sessionStats = computed(() => {
  const extras = scrapeExtras.value

  // ----- FII -----
  if (extras?.asset_type === 'fii') {
    const f = extras.fii
    return [
      { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
      { label: 'COTISTAS', value: f.num_shareholders !== null ? Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(f.num_shareholders) : '-' },
      { label: 'DY', value: f.dividend_yield_12m !== null ? `${f.dividend_yield_12m.toFixed(2)}%` : '-', accent: brand.colors.primary },
      { label: 'VPA', value: f.book_value_per_share !== null ? `R$ ${f.book_value_per_share.toFixed(2)}` : '-' },
      { label: 'P/VP', value: f.price_to_book !== null ? f.price_to_book.toFixed(2) : '-' },
      { label: 'REND.MENSAL', value: f.monthly_income_avg_24m !== null ? `R$ ${f.monthly_income_avg_24m.toFixed(2)}` : '-' },
    ]
  }

  // ----- ETF -----
  if (extras?.asset_type === 'etf') {
    const e = extras.etf
    return [
      { label: 'VOL', value: formatVolumeShort(e.volume ?? currentVolume.value) },
      { label: 'COTISTAS', value: e.num_shareholders !== null ? Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(e.num_shareholders) : '-' },
      { label: 'VAR.12M', value: e.change_12m !== null ? `${e.change_12m >= 0 ? '+' : ''}${e.change_12m.toFixed(2)}%` : '-', accent: e.change_12m !== null ? (e.change_12m >= 0 ? brand.colors.positive : brand.colors.negative) : undefined },
      { label: 'MIN.52W', value: e.min_price_52_weeks !== null ? `R$ ${e.min_price_52_weeks.toFixed(2)}` : '-' },
      { label: 'MÁX.52W', value: e.max_price_52_weeks !== null ? `R$ ${e.max_price_52_weeks.toFixed(2)}` : '-' },
      { label: 'RATIO', value: e.ratio !== null ? String(e.ratio) : '-' },
    ]
  }

  // ----- BDR -----
  if (extras?.asset_type === 'bdr') {
    const v = extras.valuation
    const q = extras.quality
    return [
      { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
      { label: 'M.CAP', value: formatMarketCapShort(v.market_cap) },
      { label: 'DY', value: v.dividend_yield !== null ? `${v.dividend_yield.toFixed(2)}%` : '-', accent: brand.colors.primary },
      { label: 'P/L', value: v.price_to_earnings !== null ? v.price_to_earnings.toFixed(2) : '-' },
      { label: 'P/VP', value: v.price_to_book !== null ? v.price_to_book.toFixed(2) : '-' },
      { label: 'ROE', value: q.return_on_equity !== null ? `${q.return_on_equity.toFixed(1)}%` : '-' },
    ]
  }

  // ----- STOCK (default) -----
  return [
    { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
    { label: 'M.CAP', value: formatMarketCapShort((asset.value as { market_cap?: number } | undefined)?.market_cap) },
    { label: 'DY', value: formatDyShort(basicIndicators.value?.dividendYield), accent: brand.colors.primary },
    { label: 'P/L', value: basicIndicators.value?.pl || '-' },
    { label: 'P/VP', value: basicIndicators.value?.pvpa || '-' },
    { label: 'ROE', value: basicIndicators.value?.roe || '-' },
  ]
})

const resolvedLogo = computed<string | null>(() => {
  const scrape = scrapeExtras.value?.identity?.logo ?? null
  return resolveLogo(scrape, (asset.value as { logo?: string | null })?.logo ?? null)
})

const basicIndicators = computed(() => {
  if (!fundamentusData.value) return null
  const stats = fundamentusData.value.key_statistics
  const financial = fundamentusData.value.financial_data

  return {
    pl: formatIndicator(stats?.forward_pe, { decimals: 1 }),
    pvpa: formatIndicator(stats?.price_to_book, { decimals: 2 }),
    dividendYield: formatIndicator(stats?.dividend_yield, { decimals: 1, suffix: '%' }),
    roe: formatIndicator(financial?.return_on_equity, { decimals: 1, multiplier: 100, suffix: '%' }),
    roa: formatIndicator(financial?.return_on_assets, { decimals: 1, multiplier: 100, suffix: '%' }),
    netMargin: formatIndicator(financial?.profit_margins, { decimals: 1, multiplier: 100, suffix: '%' }),
  }
})

interface AnnualRecord {
  date: Date
  revenue: number | null
  netIncome: number | null
}

const annualIncomeRecords = computed<AnnualRecord[]>(() => {
  const annual = fundamentusData.value?.income?.annual ?? []

  return annual
    .map((item) => {
      const date = item.period_end_date ? new Date(item.period_end_date) : null
      if (!date || Number.isNaN(date.getTime())) return null

      return {
        date,
        revenue: safeNumber(item.total_revenue),
        netIncome: safeNumber(item.net_income),
      }
    })
    .filter((item): item is AnnualRecord => item !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
})

const latestBalanceSnapshot = computed(() =>
  selectLatestRecord(
    fundamentusData.value?.balance?.quarterly,
    fundamentusData.value?.balance?.annual
  )
)

type ChecklistStatus = 'pass' | 'fail' | 'unknown'

interface ChecklistItem {
  id: string
  label: string
  status: ChecklistStatus
  detail?: string | null
  tooltip?: string
}

const buyAndHoldChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []

  if (!fundamentusData.value) return items

  const annual = annualIncomeRecords.value
  const today = new Date()
  const mdiEntries = aggregatedMdiEntries.value
  const totalYearsHistory = mdiEntries.length
    ? (safeNumber(mdiEntries[0]?.total_years) ?? null)
    : null

  const oldestAnnual = annual.at(-1)
  const firstAnnualDate = oldestAnnual?.date ?? null
  const availableYearsFromAnnual =
    firstAnnualDate !== null
      ? today.getFullYear() - firstAnnualDate.getFullYear() + 1
      : null
  const hasFiveYearsHistory =
    totalYearsHistory !== null
      ? totalYearsHistory >= 5
      : availableYearsFromAnnual !== null
        ? availableYearsFromAnnual >= 5
        : null
  const historyDetail =
    totalYearsHistory !== null
      ? `Histórico de ${totalYearsHistory} anos`
      : firstAnnualDate
        ? `Dados desde ${firstAnnualDate.getFullYear()}`
        : null

  let annualNeverNegative: boolean | null = null
  if (annual.length > 0) {
    if (annual.some((item) => item.netIncome === null)) {
      annualNeverNegative = null
    } else {
      annualNeverNegative = annual.every((item) => (item.netIncome ?? 0) >= 0)
    }
  }

  const dividendYieldRaw = safeNumber(
    fundamentusData.value.key_statistics?.dividend_yield
  )
  const dividendYieldValue = dividendYieldRaw !== null ? dividendYieldRaw : null
  const dividendYieldAboveFive =
    dividendYieldValue !== null ? dividendYieldValue >= 5 : null

  const roeRaw = safeNumber(
    fundamentusData.value.financial_data?.return_on_equity
  )
  const roeValue = roeRaw !== null ? roeRaw * 100 : null
  const roeAboveTen = roeValue !== null ? roeValue >= 10 : null

  const roaRaw = safeNumber(
    fundamentusData.value.financial_data?.return_on_assets
  )
  const roaValue = roaRaw !== null ? roaRaw * 100 : null
  const roaAboveFive = roaValue !== null ? roaValue >= 5 : null

  const balanceSnapshot = latestBalanceSnapshot.value
  const totalEquity = safeNumber(balanceSnapshot?.equity)
  const totalDebt = safeNumber(
    fundamentusData.value?.financial_data?.total_debt
  )
  const totalLiabilities = safeNumber(balanceSnapshot?.total_liab)
  const debtComparisonSource = totalDebt !== null ? totalDebt : totalLiabilities
  const debtBelowEquity =
    debtComparisonSource !== null && totalEquity !== null
      ? debtComparisonSource <= totalEquity
      : null

  const netMarginRaw = safeNumber(
    fundamentusData.value.financial_data?.profit_margins
  )
  const netMarginValue = netMarginRaw !== null ? netMarginRaw * 100 : null
  const netMarginPositive = netMarginValue !== null ? netMarginValue > 0 : null

  const freeCashFlowRaw = safeNumber(
    fundamentusData.value.financial_data?.free_cashflow
  )
  const freeCashFlowPositive =
    freeCashFlowRaw !== null ? freeCashFlowRaw > 0 : null

  const marketCapValue = safeNumber(
    (asset.value as { market_cap?: unknown } | undefined)?.market_cap
  )
  const marketCapAboveOneB =
    marketCapValue !== null ? marketCapValue >= 1_000_000_000 : null

  const recentDividendYears = new Set<number>()
  const dividendDataAvailable = dividendsData.value.length > 0
  const currentYear = today.getFullYear()
  const targetYears = Array.from(
    { length: 5 },
    (_, index) => currentYear - index
  )

  dividendsData.value.forEach((record) => {
    const date = record.payment_date ? new Date(record.payment_date) : null
    if (!date || Number.isNaN(date.getTime())) return
    const year = date.getFullYear()
    if (targetYears.includes(year)) {
      recentDividendYears.add(year)
    }
  })

  const paidDividendsLastFiveYears =
    targetYears.length > 0
      ? targetYears.every((year) => recentDividendYears.has(year))
      : null
  const sortedRecentDividendYears = Array.from(recentDividendYears).sort(
    (a, b) => a - b
  )

  const toStatus = (value: boolean | null | undefined): ChecklistStatus => {
    if (value === true) return 'pass'
    if (value === false) return 'fail'
    return 'unknown'
  }

  items.push({
    id: 'history',
    label: 'Mais de 5 anos de histórico',
    status: toStatus(hasFiveYearsHistory),
    detail: historyDetail,
    tooltip:
      'Verifica se há demonstrações anuais disponíveis há pelo menos 5 anos.',
  })

  items.push({
    id: 'dividends-five-years',
    label: 'Pagou dividendos nos últimos 5 anos',
    status: toStatus(dividendDataAvailable ? paidDividendsLastFiveYears : null),
    detail:
      dividendDataAvailable && sortedRecentDividendYears.length > 0
        ? `Pagamentos em: ${sortedRecentDividendYears.join(', ')} (${sortedRecentDividendYears.length}/5)`
        : dividendDataAvailable
          ? 'Sem pagamentos registrados no intervalo'
          : 'Histórico de dividendos indisponível',
    tooltip:
      'Verifica se houve pelo menos um pagamento de dividendos em cada um dos últimos 5 anos.',
  })

  items.push({
    id: 'annual-loss',
    label: 'Sem prejuízo em exercícios anuais recentes',
    status: toStatus(annualNeverNegative),
    detail:
      annualNeverNegative === false ? 'Há registros de prejuízo anual' : null,
    tooltip: 'Analisa os resultados fiscais anuais disponíveis.',
  })

  items.push({
    id: 'dividend-yield',
    label: 'Dividend Yield acima de 5%',
    status: toStatus(dividendYieldAboveFive),
    detail:
      dividendYieldValue !== null
        ? `Yield atual: ${dividendYieldValue.toFixed(1)}%`
        : null,
    tooltip: 'Usa o Dividend Yield informado pelo Fundamentus.',
  })

  items.push({
    id: 'roe',
    label: 'ROE acima de 10%',
    status: toStatus(roeAboveTen),
    detail: roeValue !== null ? `ROE atual: ${roeValue.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre o patrimônio líquido da empresa.',
  })

  items.push({
    id: 'debt-equity',
    label: 'Dívida menor ou igual ao patrimônio',
    status: toStatus(debtBelowEquity),
    detail:
      debtComparisonSource !== null && totalEquity !== null
        ? `Dívida: R$ ${formatNumberToShort(debtComparisonSource)} • Patrimônio: R$ ${formatNumberToShort(totalEquity)}`
        : null,
    tooltip: 'Compara dívida total e patrimônio líquido mais recentes.',
  })

  items.push({
    id: 'market-cap',
    label: 'Market Cap maior que R$ 1B',
    status: toStatus(marketCapAboveOneB),
    detail:
      marketCapValue !== null
        ? `Market Cap: R$ ${formatNumberToShort(marketCapValue)}`
        : 'Market Cap indisponível',
    tooltip: 'Compara o valor de mercado atual com o patamar mínimo desejado.',
  })

  items.push({
    id: 'roa',
    label: 'ROA acima de 5%',
    status: toStatus(roaAboveFive),
    detail: roaValue !== null ? `ROA atual: ${roaValue.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre os ativos totais da empresa.',
  })

  items.push({
    id: 'net-margin',
    label: 'Margem líquida positiva',
    status: toStatus(netMarginPositive),
    detail:
      netMarginValue !== null ? `Margem: ${netMarginValue.toFixed(1)}%` : null,
    tooltip: 'Verifica se a margem líquida consolidada está positiva.',
  })

  items.push({
    id: 'free-cashflow',
    label: 'Fluxo de caixa livre positivo',
    status: toStatus(freeCashFlowPositive),
    detail:
      freeCashFlowRaw !== null
        ? `FCF: R$ ${formatNumberToShort(freeCashFlowRaw)}`
        : 'Fluxo de caixa livre indisponível',
    tooltip: 'Verifica se a empresa gera caixa excedente após investimentos.',
  })

  return items
})

/**
 * FII-specific checklist. FIIs are income vehicles, not operating companies —
 * criteria focus on yield consistency, governance indicators (shareholder
 * count, IFIX membership) and capital preservation (P/VP, recent drawdown)
 * rather than margins and debt-to-equity.
 */
const fiiChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []
  const extras = scrapeExtras.value
  if (!extras || extras.asset_type !== 'fii') return items
  const f = extras.fii

  const toStatus = (v: boolean | null): ChecklistStatus =>
    v === true ? 'pass' : v === false ? 'fail' : 'unknown'

  items.push({
    id: 'fii-dy',
    label: 'Dividend Yield 12M acima de 7%',
    status: toStatus(f.dividend_yield_12m !== null ? f.dividend_yield_12m >= 7 : null),
    detail: f.dividend_yield_12m !== null ? `DY: ${f.dividend_yield_12m.toFixed(2)}%` : null,
    tooltip: 'Referência histórica do mercado brasileiro de FIIs (~8% a.a.).',
  })

  items.push({
    id: 'fii-pvp',
    label: 'P/VP entre 0,85 e 1,10',
    status: toStatus(
      f.price_to_book !== null ? f.price_to_book >= 0.85 && f.price_to_book <= 1.1 : null,
    ),
    detail: f.price_to_book !== null ? `P/VP: ${f.price_to_book.toFixed(2)}` : null,
    tooltip: 'Faixa equilibrada entre preço e patrimônio. Abaixo vira desconto; acima, ágio.',
  })

  items.push({
    id: 'fii-monthly-income',
    label: 'Distribui proventos mensalmente',
    status: toStatus(f.monthly_income_avg_24m !== null ? f.monthly_income_avg_24m > 0 : null),
    detail:
      f.monthly_income_avg_24m !== null
        ? `Média 24M: R$ ${f.monthly_income_avg_24m.toFixed(2)}/cota`
        : null,
    tooltip: 'FIIs de renda devem distribuir pelo menos 95% do resultado.',
  })

  // Count unique months with payments in the 12-month window ending this
  // month. The cutoff is set to the first day of 11 months ago so the set
  // covers exactly 12 distinct (year, month) buckets.
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const paidMonths = new Set<string>()
  dividendsData.value.forEach((record) => {
    const raw = record.payment_date ? new Date(record.payment_date) : null
    if (!raw || Number.isNaN(raw.getTime()) || raw < cutoff) return
    paidMonths.add(`${raw.getFullYear()}-${raw.getMonth()}`)
  })
  const monthsPaid = Math.min(paidMonths.size, 12)
  const paid11of12 = dividendsData.value.length > 0 ? monthsPaid >= 11 : null

  items.push({
    id: 'fii-dividends-12m',
    label: 'Pagou em 11+ dos últimos 12 meses',
    status: toStatus(paid11of12),
    detail: dividendsData.value.length > 0 ? `${monthsPaid}/12 meses` : 'Histórico indisponível',
    tooltip: 'Fundos de qualidade distribuem quase todos os meses sem interromper.',
  })

  items.push({
    id: 'fii-shareholders',
    label: 'Mais de 10 mil cotistas',
    status: toStatus(f.num_shareholders !== null ? f.num_shareholders >= 10_000 : null),
    detail:
      f.num_shareholders !== null
        ? `${f.num_shareholders.toLocaleString('pt-BR')} cotistas`
        : null,
    tooltip: 'Pulverização adequada sugere liquidez e governança mais saudáveis.',
  })

  items.push({
    id: 'fii-ifix',
    label: 'Faz parte do IFIX',
    status: toStatus(f.ifix_share !== null ? f.ifix_share > 0 : null),
    detail:
      f.ifix_share !== null ? `Participação: ${f.ifix_share.toFixed(2)}%` : 'Fora do IFIX',
    tooltip: 'Inclusão no IFIX indica filtros mínimos de liquidez e volume.',
  })

  items.push({
    id: 'fii-change-12m',
    label: 'Variação 12M acima de -20%',
    status: toStatus(f.change_12m !== null ? f.change_12m > -20 : null),
    detail:
      f.change_12m !== null
        ? `${f.change_12m >= 0 ? '+' : ''}${f.change_12m.toFixed(1)}%`
        : null,
    tooltip: 'Evita fundos em forte tendência de queda recente.',
  })

  // Fund age from start date ("DD/MM/YYYY").
  let yearsOld: number | null = null
  if (f.fund_start_date) {
    const m = f.fund_start_date.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (m) yearsOld = now.getFullYear() - parseInt(m[3], 10)
  }
  items.push({
    id: 'fii-age',
    label: 'Fundo com mais de 5 anos',
    status: toStatus(yearsOld !== null ? yearsOld >= 5 : null),
    detail: yearsOld !== null ? `${yearsOld} anos de histórico` : null,
    tooltip: 'Fundos mais antigos têm histórico de gestão e de distribuições mais confiável.',
  })

  return items
})

/**
 * BDR-specific checklist. BDRs are Brazilian receipts for foreign stocks —
 * we lean on the StatusInvest scrape values (which for BDRs cover P/L,
 * P/VP, margins and growth) rather than the Brazil-only KeyStatistic model.
 * Governance badges and 5y Brazilian dividend history don't apply.
 */
const bdrChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []
  const extras = scrapeExtras.value
  if (!extras || extras.asset_type !== 'bdr') return items

  const toStatus = (v: boolean | null): ChecklistStatus =>
    v === true ? 'pass' : v === false ? 'fail' : 'unknown'

  const val = extras.valuation
  const q = extras.quality
  const lev = extras.leverage
  const g = extras.growth
  const mkt = extras.market

  // P/L — broader tolerance than Brazilian stocks because foreign tech
  // usually trades at higher multiples. Flag below 30.
  items.push({
    id: 'bdr-pl',
    label: 'P/L abaixo de 30',
    status: toStatus(val.price_to_earnings !== null ? val.price_to_earnings > 0 && val.price_to_earnings < 30 : null),
    detail: val.price_to_earnings !== null ? `P/L: ${val.price_to_earnings.toFixed(2)}` : null,
    tooltip: 'Múltiplo preço/lucro. Até 30 é razoável para empresas maduras e tech consolidadas.',
  })

  // ROE — foreign big-caps normally exceed 15%.
  items.push({
    id: 'bdr-roe',
    label: 'ROE acima de 15%',
    status: toStatus(q.return_on_equity !== null ? q.return_on_equity >= 15 : null),
    detail: q.return_on_equity !== null ? `ROE: ${q.return_on_equity.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre patrimônio. Empresas globais de qualidade costumam superar 15%.',
  })

  // ROIC — key quality metric.
  items.push({
    id: 'bdr-roic',
    label: 'ROIC acima de 10%',
    status: toStatus(q.return_on_invested_capital !== null ? q.return_on_invested_capital >= 10 : null),
    detail: q.return_on_invested_capital !== null ? `ROIC: ${q.return_on_invested_capital.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre capital investido. Acima de 10% indica que o capital gera valor acima do custo típico.',
  })

  // Net margin positive — foreign companies paying dividends tend to be
  // profitable; flag negative as risky.
  items.push({
    id: 'bdr-net-margin',
    label: 'Margem líquida positiva',
    status: toStatus(q.net_margin !== null ? q.net_margin > 0 : null),
    detail: q.net_margin !== null ? `Margem: ${q.net_margin.toFixed(1)}%` : null,
    tooltip: 'Verifica se a empresa é lucrativa considerando o último exercício.',
  })

  // Revenue CAGR 5y positive — ensures the business is growing.
  items.push({
    id: 'bdr-revenue-growth',
    label: 'Receita crescendo (CAGR 5A)',
    status: toStatus(g.revenue_cagr_5y !== null ? g.revenue_cagr_5y > 0 : null),
    detail: g.revenue_cagr_5y !== null ? `CAGR: ${g.revenue_cagr_5y.toFixed(1)}%/ano` : null,
    tooltip: 'Crescimento composto da receita nos últimos 5 anos.',
  })

  // Debt / equity — below 2 is considered healthy for foreign large-caps.
  items.push({
    id: 'bdr-leverage',
    label: 'Dív.Líquida/EBITDA abaixo de 3x',
    status: toStatus(lev.net_debt_to_ebitda !== null ? lev.net_debt_to_ebitda < 3 : null),
    detail: lev.net_debt_to_ebitda !== null ? `${lev.net_debt_to_ebitda.toFixed(2)}x` : null,
    tooltip: 'Alavancagem saudável: dívida líquida que é quitada em menos de 3 anos de geração de caixa.',
  })

  // Dividend Yield > 0 — BDR passes if it distributes any dividend.
  items.push({
    id: 'bdr-dy',
    label: 'Empresa distribui dividendos',
    status: toStatus(val.dividend_yield !== null ? val.dividend_yield > 0 : null),
    detail: val.dividend_yield !== null ? `DY: ${val.dividend_yield.toFixed(2)}%` : 'Sem pagamentos registrados',
    tooltip: 'BDRs repassam proventos da empresa estrangeira, geralmente trimestrais ou anuais.',
  })

  // Liquidity proxy: free float > 20% + big market cap.
  const bigMarketCap = val.market_cap !== null ? val.market_cap >= 10_000_000_000 : null
  items.push({
    id: 'bdr-size',
    label: 'Market Cap acima de US$ 10 bi (aprox)',
    status: toStatus(bigMarketCap),
    detail:
      val.market_cap !== null
        ? `MC equivalente: R$ ${formatNumberToShort(val.market_cap)}`
        : 'Market cap indisponível',
    tooltip: 'Large-caps têm liquidez consistente e cobertura global de analistas.',
  })

  // Price stability — penalize very recent drops over 30% in 52w.
  const priceVs52wMin =
    mkt.min_price_52_weeks !== null && mkt.price !== null && mkt.min_price_52_weeks > 0
      ? (mkt.price - mkt.min_price_52_weeks) / mkt.min_price_52_weeks
      : null
  items.push({
    id: 'bdr-price-52w',
    label: 'Preço atual sobre mínima 52s',
    status: toStatus(priceVs52wMin !== null ? priceVs52wMin > 0 : null),
    detail:
      priceVs52wMin !== null
        ? `${priceVs52wMin >= 0 ? '+' : ''}${(priceVs52wMin * 100).toFixed(1)}% sobre mín.`
        : null,
    tooltip: 'Evita ativos no fundo absoluto da janela de 52 semanas (potencial sinal de problema).',
  })

  return items
})

/**
 * Render the correct checklist depending on asset type.
 *   - FII       -> yield/governance/age criteria specific to real estate funds
 *   - BDR       -> scrape-based checks (P/L, ROE, ROIC, growth, leverage)
 *   - Stock     -> classic AUVP Buy & Hold criteria (KeyStatistic + dividends)
 */
const activeChecklist = computed(() => {
  if (isFii.value) return fiiChecklist.value
  if (isBdr.value) return bdrChecklist.value
  return buyAndHoldChecklist.value
})

function formatNumberToShort(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

// Atualiza ao trocar o período
watch(selectedTimeRange, () => {
  fetchChartData()
})

definePageMeta({
  isPublicRoute: true,
  middleware: (to) => {
    const raw =
      typeof to.params.ticker === 'string' ? to.params.ticker : String(to.params.ticker || '')
    const normalized = raw.toLowerCase()
    if (raw && raw !== normalized) {
      // Preserve query string when lowercasing the ticker, otherwise
      // params like ?brand=saraiva-invest get dropped on the redirect.
      return navigateTo(
        { path: `/asset/${normalized}`, query: to.query, hash: to.hash },
        import.meta.server ? { redirectCode: 301 } : { replace: true }
      )
    }
  },
})
</script>

<style scoped>
/* ========== PLAYBOOK ASSET PAGE (Saraiva Invest) ========== */
.pb-asset-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'ss01', 'cv11';
}

/* Sticker text styles, match the home hero */
.pb-asset-sticker {
  display: inline-block;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
}

.pb-asset-sticker-cold {
  display: inline-block;
}

.pb-asset-sticker-hot {
  display: inline-block;
  background: #EF4444;
  color: #FFFFFF !important;
  padding: 0.02em 0.3em;
  border-radius: 0.15em;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  box-shadow:
    -3px 3px 0 #0B0B0E,
    0 0 0 4px #FFFFFF,
    -3px 3px 0 4px #0B0B0E;
  transform: rotate(2deg);
}

/* Villain card pulse */
@keyframes pb-asset-villain-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 60px -10px rgba(239, 68, 68, 0.25); }
}

.pb-asset-villain {
  animation: pb-asset-villain-pulse 3s ease-in-out infinite;
}

/* Sweat drops */
@keyframes pb-asset-sweat-drop {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
  50% { transform: translateY(5px) scale(0.85); opacity: 0.4; }
}

.pb-asset-sweat {
  animation: pb-asset-sweat-drop 1.4s ease-in-out infinite;
}
.pb-asset-sweat-2 {
  animation-delay: 0.7s;
}
</style>
