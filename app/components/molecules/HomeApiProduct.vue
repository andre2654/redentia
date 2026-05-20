<!--
  HomeApiProduct — Bloco "Developer Products" (API + Creative + Embed),
  extraído de /mercado-completo. 3 product cards lado a lado vendendo as
  3 interfaces de dados: JSON (api.redentia), PNG creative, HTML embed.
  Usado em / e /mercado-completo.
-->
<template>
  <section
    :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-background)' }"
    class="api-product-section relative mt-16 overflow-hidden border-t"
  >
    <!-- Atmospheric layers: scanlines + grid + amber sweep -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute inset-0 opacity-[0.035]"
        :style="{ backgroundImage: `linear-gradient(var(--brand-text) 1px, transparent 1px), linear-gradient(90deg, var(--brand-text) 1px, transparent 1px)`, backgroundSize: '48px 48px' }"
      />
      <div
        class="absolute inset-x-0 top-0 h-px"
        :style="{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand-primary) 50%, transparent), transparent)` }"
      />
      <div
        class="absolute -right-32 top-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
        :style="{ background: `radial-gradient(circle, var(--brand-primary), transparent 65%)` }"
      />
      <div
        class="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full blur-3xl opacity-15"
        :style="{ background: `radial-gradient(circle, var(--brand-primary), transparent 70%)` }"
      />
    </div>

    <!-- ============ MASTHEAD ============ -->
    <div class="relative mx-auto max-w-7xl px-6 pt-20 md:px-10 md:pt-28">
      <div class="flex flex-wrap items-end justify-between gap-6 border-b pb-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.22em]">
            <span class="flex items-center gap-1.5" :style="{ color: 'var(--brand-primary)' }">
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: 'var(--brand-primary)' }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: 'var(--brand-primary)' }" />
              </span>
              DEVELOPERS.SHIPPED
            </span>
            <span :style="{ color: 'var(--brand-border)' }">/</span>
            <span :style="{ color: 'var(--brand-text-muted)' }">2026.04 · BUILD 2</span>
          </div>
          <h2
            class="font-display max-w-2xl text-[44px] leading-[0.92] tracking-tight sm:text-[60px] md:text-[80px]"
            :style="{ color: 'var(--brand-text)' }"
          >
            Pegue os dados.
            <br />
            <span class="italic" :style="{ color: 'var(--brand-primary)' }">Faça outra coisa.</span>
          </h2>
        </div>
        <p class="max-w-sm text-sm leading-relaxed md:text-[15px]" :style="{ color: 'var(--brand-text-muted)' }">
          Três produtos abertos: a <span :style="{ color: 'var(--brand-text)' }">plataforma</span> que você está vendo é só uma das interfaces. Pegue os dados em JSON, em PNG pronto pro feed, ou em widget pra embedar no seu site.
        </p>
      </div>
    </div>

    <!-- ============ PRODUCT 01, API ============ -->
    <a
      href="https://api.redentia.com.br"
      target="_blank"
      rel="noopener"
      class="api-row group relative block border-b transition-colors"
      :style="{ borderColor: `${'var(--brand-border)'}60` }"
    >
      <div class="relative mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
        <!-- Numero gigante outline -->
        <div class="col-span-12 md:col-span-2">
          <div
            class="font-display select-none text-[120px] leading-[0.8] tracking-tighter md:text-[180px]"
            :style="{ color: 'transparent', WebkitTextStroke: `1.5px ${'var(--brand-primary)'}50` }"
          >
            01
          </div>
        </div>

        <!-- Conteudo -->
        <div class="col-span-12 md:col-span-5 md:pl-4">
          <div class="mb-5 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]">
            <span class="rounded-full border px-2.5 py-1" :style="{ borderColor: 'color-mix(in srgb, var(--brand-primary) 50%, transparent)', color: 'var(--brand-primary)', backgroundColor: `color-mix(in srgb, var(--brand-primary) 6%, transparent)` }">
              PUBLIC BETA
            </span>
            <span :style="{ color: 'var(--brand-text-muted)' }">REDENTIA.API/V1</span>
          </div>

          <h3 class="font-display text-[40px] leading-[0.95] tracking-tight md:text-[64px]" :style="{ color: 'var(--brand-text)' }">
            Os dados em <span class="italic" :style="{ color: 'var(--brand-primary)' }">JSON.</span>
          </h3>

          <p class="mt-5 max-w-md text-[14px] leading-relaxed md:text-[15px]" :style="{ color: 'var(--brand-text-muted)' }">
            Preços, fundamentos completos, dividendos e commentaries via REST. Schemas estáveis, latência sub-50&nbsp;ms, autenticação por API key. Pronta pra rodar em produção amanhã.
          </p>

          <!-- Stats inline -->
          <div class="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded border" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }">
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">50+</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">ENDPOINTS</span>
            </div>
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">42<span class="text-[12px]">ms</span></span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">P50 LAT.</span>
            </div>
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">99.9<span class="text-[12px]">%</span></span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">UPTIME</span>
            </div>
          </div>

          <div class="mt-10 inline-flex items-center gap-3 border-b pb-1 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-colors" :style="{ color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' }">
            <span>PEGAR API KEY</span>
            <span class="transition-transform group-hover:translate-x-2">→</span>
          </div>
        </div>

        <!-- Terminal mockup -->
        <div class="col-span-12 md:col-span-5">
          <div
            class="terminal-window overflow-hidden rounded-lg border shadow-2xl"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: `${'var(--brand-background)'}F5`, boxShadow: `0 30px 80px -30px color-mix(in srgb, var(--brand-primary) 25%, transparent), 0 0 0 1px color-mix(in srgb, var(--brand-border) 25%, transparent)` }"
          >
            <div class="flex items-center justify-between border-b px-4 py-2.5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 50%, transparent)' }">
              <div class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-full" style="background: #ff5f57" />
                <span class="size-2.5 rounded-full" style="background: #febc2e" />
                <span class="size-2.5 rounded-full" style="background: #28c840" />
              </div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">~/redentia/api</span>
              <span class="font-mono-tab text-[10px]" :style="{ color: 'var(--brand-text-muted)' }">●●●</span>
            </div>

            <div class="px-5 py-4 font-mono-tab text-[12px] leading-[1.65] md:text-[13px]">
              <div class="flex items-center gap-2">
                <span :style="{ color: 'var(--brand-positive)' }">$</span>
                <span :style="{ color: 'var(--brand-text)' }">curl https://api.redentia.com.br/v1/tickers/<span :style="{ color: 'var(--brand-primary)' }">PETR4</span></span>
              </div>
              <div class="mt-1.5 flex items-center gap-2" :style="{ color: 'var(--brand-text-muted)' }">
                <span :style="{ color: 'var(--brand-positive)' }">→</span>
                <span :style="{ color: 'var(--brand-positive)' }">200 OK</span>
                <span :style="{ color: 'var(--brand-border)' }">·</span>
                <span>42 ms</span>
                <span :style="{ color: 'var(--brand-border)' }">·</span>
                <span>1.4 KB</span>
              </div>

              <div class="mt-3 rounded border-l-2 py-1 pl-3" :style="{ borderColor: 'var(--brand-primary)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 3%, transparent)' }">
                <div :style="{ color: 'var(--brand-text)' }">{</div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">"symbol"</span><span :style="{ color: 'var(--brand-text-muted)' }">: </span><span :style="{ color: 'var(--brand-positive)' }">"PETR4"</span>,
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">"price"</span><span :style="{ color: 'var(--brand-text-muted)' }">: </span><span :style="{ color: 'var(--brand-text)' }">38.42</span>,
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">"market_cap"</span><span :style="{ color: 'var(--brand-text-muted)' }">: </span><span :style="{ color: 'var(--brand-text)' }">501823000000</span>,
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">"dividend_yield"</span><span :style="{ color: 'var(--brand-text-muted)' }">: </span><span :style="{ color: 'var(--brand-text)' }">0.142</span>,
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">"updated_at"</span><span :style="{ color: 'var(--brand-text-muted)' }">: </span><span :style="{ color: 'var(--brand-positive)' }">"2026-04-11T14:32:18Z"</span>
                </div>
                <div :style="{ color: 'var(--brand-text)' }">}</div>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <span :style="{ color: 'var(--brand-positive)' }">$</span>
                <span class="inline-block h-3 w-1.5 motion-safe:animate-pulse" :style="{ backgroundColor: 'var(--brand-primary)' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>

    <!-- ============ PRODUCT 02, CREATIVE ============ -->
    <a
      href="https://creative.redentia.com.br"
      target="_blank"
      rel="noopener"
      class="api-row group relative block transition-colors"
    >
      <div class="relative mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
        <!-- Creative thumbs first on desktop (asymmetric flip) -->
        <div class="order-2 col-span-12 md:order-1 md:col-span-5">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(thumb, i) in creativeThumbs"
              :key="thumb.slug"
              class="creative-tile relative aspect-square overflow-hidden rounded-lg border transition-transform"
              :style="{
                borderColor: 'var(--brand-border)',
                backgroundColor: 'var(--brand-surface)',
                boxShadow: `0 20px 50px -25px color-mix(in srgb, var(--brand-primary) 19%, transparent)`,
                transform: i % 2 === 0 ? 'translateY(-12px)' : 'translateY(12px)',
              }"
            >
              <div class="absolute inset-0" :style="{ background: `radial-gradient(circle at 30% 20%, ${'var(--brand-primary)'}25, transparent 60%)` }" />
              <div class="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 font-mono-tab text-[8px] uppercase tracking-[0.18em]">
                <span :style="{ color: 'var(--brand-primary)' }">{{ thumb.eyebrow || '·' }}</span>
                <span :style="{ color: 'var(--brand-text-muted)' }">1080²</span>
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <UIcon :name="thumb.icon" class="size-10" :style="{ color: 'var(--brand-primary)' }" />
              </div>
              <div class="absolute inset-x-0 bottom-0 px-3 py-2 font-mono-tab text-[9px] uppercase tracking-[0.16em]" :style="{ color: 'var(--brand-text)' }">
                {{ thumb.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Conteudo -->
        <div class="order-1 col-span-12 md:order-2 md:col-span-5 md:pl-4">
          <div class="mb-5 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]">
            <span class="rounded-full px-2.5 py-1" :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }">
              NEW · GRÁTIS
            </span>
            <span :style="{ color: 'var(--brand-text-muted)' }">REDENTIA.CREATIVE</span>
          </div>

          <h3 class="font-display text-[40px] leading-[0.95] tracking-tight md:text-[64px]" :style="{ color: 'var(--brand-text)' }">
            Os dados no <span class="italic" :style="{ color: 'var(--brand-primary)' }">feed.</span>
          </h3>

          <p class="mt-5 max-w-md text-[14px] leading-relaxed md:text-[15px]" :style="{ color: 'var(--brand-text-muted)' }">
            Cards, rankings e mockups com dados reais, prontos pra tirar print e postar. Growth races, spotlights de ativo, notificações iPhone, top gainers. Tudo em 1080×1080.
          </p>

          <div class="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded border" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }">
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">20+</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">TEMPLATES</span>
            </div>
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">1080²</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">FORMATO</span>
            </div>
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">PNG</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">EXPORT</span>
            </div>
          </div>

          <div class="mt-10 inline-flex items-center gap-3 border-b pb-1 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-colors" :style="{ color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' }">
            <span>ABRIR STUDIO</span>
            <span class="transition-transform group-hover:translate-x-2">→</span>
          </div>
        </div>

        <!-- Numero gigante outline na direita -->
        <div class="order-3 col-span-12 flex justify-end md:col-span-2">
          <div
            class="font-display select-none text-[120px] leading-[0.8] tracking-tighter md:text-[180px]"
            :style="{ color: 'transparent', WebkitTextStroke: `1.5px ${'var(--brand-primary)'}50` }"
          >
            02
          </div>
        </div>
      </div>
    </a>

    <!-- ============ PRODUCT 03, EMBED ============ -->
    <a
      href="https://embed.redentia.com.br"
      target="_blank"
      rel="noopener"
      class="api-row group relative block border-t transition-colors"
      :style="{ borderColor: `${'var(--brand-border)'}60` }"
    >
      <div class="relative mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
        <!-- Numero gigante outline -->
        <div class="col-span-12 md:col-span-2">
          <div
            class="font-display select-none text-[120px] leading-[0.8] tracking-tighter md:text-[180px]"
            :style="{ color: 'transparent', WebkitTextStroke: `1.5px ${'var(--brand-primary)'}50` }"
          >
            03
          </div>
        </div>

        <!-- Conteudo -->
        <div class="col-span-12 md:col-span-5 md:pl-4">
          <div class="mb-5 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]">
            <span class="rounded-full px-2.5 py-1" :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }">
              NEW · GRÁTIS
            </span>
            <span :style="{ color: 'var(--brand-text-muted)' }">REDENTIA.EMBED</span>
          </div>

          <h3 class="font-display text-[40px] leading-[0.95] tracking-tight md:text-[64px]" :style="{ color: 'var(--brand-text)' }">
            Os dados no <span class="italic" :style="{ color: 'var(--brand-primary)' }">seu site.</span>
          </h3>

          <p class="mt-5 max-w-md text-[14px] leading-relaxed md:text-[15px]" :style="{ color: 'var(--brand-text-muted)' }">
            Widgets gratuitos de cotações, rankings, mapas de calor e calculadoras pra embedar em blog, newsletter ou dashboard. Um iframe, zero cadastro, sempre atualizado em tempo real.
          </p>

          <div class="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded border" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }">
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">8</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">WIDGETS</span>
            </div>
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">iframe</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">HTML PADRÃO</span>
            </div>
            <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: 'var(--brand-primary)' }">0</span>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">CADASTRO</span>
            </div>
          </div>

          <div class="mt-10 inline-flex items-center gap-3 border-b pb-1 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-colors" :style="{ color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' }">
            <span>VER WIDGETS</span>
            <span class="transition-transform group-hover:translate-x-2">→</span>
          </div>
        </div>

        <!-- Iframe code mockup -->
        <div class="col-span-12 md:col-span-5">
          <div
            class="terminal-window overflow-hidden rounded-lg border shadow-2xl"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: `${'var(--brand-background)'}F5`, boxShadow: `0 30px 80px -30px color-mix(in srgb, var(--brand-primary) 25%, transparent), 0 0 0 1px color-mix(in srgb, var(--brand-border) 25%, transparent)` }"
          >
            <div class="flex items-center justify-between border-b px-4 py-2.5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 50%, transparent)' }">
              <div class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-full" style="background: #ff5f57" />
                <span class="size-2.5 rounded-full" style="background: #febc2e" />
                <span class="size-2.5 rounded-full" style="background: #28c840" />
              </div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">~/blog/post-petr4.html</span>
              <span class="font-mono-tab text-[10px]" :style="{ color: 'var(--brand-text-muted)' }">●●●</span>
            </div>

            <div class="px-5 py-4 font-mono-tab text-[12px] leading-[1.65] md:text-[13px]">
              <div :style="{ color: 'var(--brand-text-muted)' }">
                <span :style="{ color: 'var(--brand-text)' }">&lt;!--</span> cotação PETR4 no meu blog <span :style="{ color: 'var(--brand-text)' }">--&gt;</span>
              </div>
              <div class="mt-3 rounded border-l-2 py-1 pl-3" :style="{ borderColor: 'var(--brand-primary)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 3%, transparent)' }">
                <div :style="{ color: 'var(--brand-text)' }">
                  <span :style="{ color: 'var(--brand-primary)' }">&lt;iframe</span>
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">src</span><span :style="{ color: 'var(--brand-text-muted)' }">=</span><span :style="{ color: 'var(--brand-positive)' }">"https://embed.redentia.com.br/</span>
                </div>
                <div class="pl-8">
                  <span :style="{ color: 'var(--brand-positive)' }">ticker/small?ticker=PETR4"</span>
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">width</span><span :style="{ color: 'var(--brand-text-muted)' }">=</span><span :style="{ color: 'var(--brand-positive)' }">"320"</span>
                  <span :style="{ color: 'var(--brand-primary)' }"> height</span><span :style="{ color: 'var(--brand-text-muted)' }">=</span><span :style="{ color: 'var(--brand-positive)' }">"80"</span>
                </div>
                <div class="pl-4">
                  <span :style="{ color: 'var(--brand-primary)' }">frameborder</span><span :style="{ color: 'var(--brand-text-muted)' }">=</span><span :style="{ color: 'var(--brand-positive)' }">"0"</span>
                  <span :style="{ color: 'var(--brand-primary)' }"> loading</span><span :style="{ color: 'var(--brand-text-muted)' }">=</span><span :style="{ color: 'var(--brand-positive)' }">"lazy"</span><span :style="{ color: 'var(--brand-primary)' }">&gt;</span>
                </div>
                <div :style="{ color: 'var(--brand-primary)' }">&lt;/iframe&gt;</div>
              </div>

              <div class="mt-3 flex items-center gap-2 text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
                <span :style="{ color: 'var(--brand-positive)' }">✓</span>
                <span>cole, salve, publique. pronto.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

// Creative studio thumbnails (4 tiles do bloco Product 02).
const creativeThumbs = [
  { slug: 'growth-race', path: '/growth-race?tickers=PETR4,VALE3,ITUB4&reinvest=true', icon: 'i-lucide-trending-up', eyebrow: 'NOVO', label: 'Growth Race', isNew: true },
  { slug: 'asset-spotlight', path: '/asset-spotlight?ticker=PETR4', icon: 'i-lucide-star', eyebrow: 'DESTAQUE', label: 'Spotlight', isNew: false },
  { slug: 'ranking-top', path: '/ranking/top', icon: 'i-lucide-trophy', eyebrow: 'RANKING', label: 'Top Altas', isNew: false },
  { slug: 'market-updates', path: '/market-updates?format=square', icon: 'i-lucide-bell', eyebrow: 'UPDATE', label: 'Notificação', isNew: false },
]
</script>
