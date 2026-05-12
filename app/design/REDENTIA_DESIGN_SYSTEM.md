# Redentia — Design System

> Documento para designers. Sem código, sem implementação. Só o DNA visual.

---

## Filosofia

**Quiet. Lightness as luxury.**

A Redentia é fintech editorial premium. Sussurro, não grito. Uma headline em peso 300 carrega mais autoridade que uma em peso 800 — porque assume que o leitor já confia.

Inspiração: Stripe, FT, The New York Times, mas com paleta amber em vez do azul corporate de fintech genérica.

Cinco regras inegociáveis:

1. Tipografia leve em onyx warm
2. Amber pontual (não decorativo)
3. Sombras com tint cromático do brand (nunca cinza neutro)
4. Radii conservadores (4 a 8 pixels)
5. Tabular numerals em todo número financeiro

Se um elemento quebra qualquer uma dessas, está fora do padrão.

---

## Paleta

### Cores do brand

```
PRIMARY        AMBER        #D8881A
                            Acento, CTA, links, foco.
                            Único papel: ação.

POSITIVE       GREEN        #0AAE7C
                            Ganho, sucesso, ativo, alta.
                            Verde fechado, não fluo.

NEGATIVE       RED          #E0353D
                            Perda, erro, risco, baixa.
                            Vermelho closado, não tomato.

WARNING        AMBER-LARANJA #F59E0B
                            Pausado, atenção, validação.
                            Universal, sem variar por tenant.

NEUTRAL        GREY         #6B7280
                            Apenas para texto desligado raro.
```

### Texto (light mode)

```
HEADING        ONYX WARM    #1A0A2E
                            H1, H2, H3, eyebrow ativo.
                            Aubergine quente, nunca preto puro.

LABEL          DEEP VIOLET  #2A1A4A
                            Labels de input, botões secundários.

BODY           MUTED VIOLET (derivado do textMuted)
                            Parágrafo padrão.

MUTED          GREY-VIOLET  #9A92A8
                            Caption, metadata, placeholder, footer.
```

### Texto (dark mode)

```
HEADING                     Cream warm (derivado de brand.text)
BODY                        Mesmo cream com 78% opacidade
MUTED                       Mesmo cream com 55% opacidade
```

### Superfícies (light mode)

```
BG BASE                     Off-white (canvas)
BG ELEVATED                 Branco puro (cards)
BG OVERLAY                  Cream sutil (cards aninhados, hover)
BG INPUT                    Off-white levemente cinzento
```

### Bordas

```
SUBTLE                      Amber 8% + brand border
                            Card padrão, divisores leves

DEFAULT                     Amber 14-16% + brand border
                            Hover de card, input ativo, segmented

STRONG                      Amber 24-28% + brand border
                            Modal, popover, focus visible
```

### Texto sobre amber

```
LIGHT MODE                  Branco (#FFFFFF)
DARK MODE                   Onyx warm (#1A0A2E)
```

Contraste mínimo de 7:1 garantido em qualquer tenant.

### Cores auxiliares de categoria

Usadas em chips de ação/categoria que NÃO representam estado semântico. São apenas identifiers visuais.

```
TOOLS          PURPLE       #A78BFA
RANKINGS       GOLD         #FBBF24
DIVIDENDS      MINT         #34D399
SETTINGS       CORAL        #F87171
```

### Proibido

- Preto puro `#000000` — sempre onyx warm
- Branco puro como texto sobre fundo escuro — sempre cream
- Verde fluo / vermelho tomato — sempre as variantes brand
- Cinza neutro como border — sempre amber-tinted

---

## Tipografia

### Famílias

```
DISPLAY + UI    Montserrat
                Pesos: 300 (Light), 400 (Regular), 500 (Medium)
                Headlines, body, labels, botões.

ÊNFASE          Instrument Serif italic
                Apenas em hero, palavras-chave isoladas.
                Nunca em body.

NÚMEROS         JetBrains Mono
                Com tabular-nums obrigatório.
                Preços, percentuais, datas, tickers.
```

### Escala de tamanhos

```
DISPLAY HERO     clamp(36px → 64px)     Weight 300, line-height 1.02
                                          Apenas em hero flagship.

H1 PADRÃO        clamp(28px → 36px)     Weight 300, line-height 1.05
                                          letter-spacing -0.7px
                                          Top de page (rankings, calc, guias).

H2               24px → 30px            Weight 300, line-height 1.1
                                          letter-spacing -0.5px
                                          Section divider editorial.

H3               20px → 22px            Weight 400, line-height 1.15
                                          letter-spacing -0.36px

H4 / H5 / H6     16px → 18px            Weight 500, line-height 1.2

BODY LARGE       17.5px                 Weight 400, line-height 1.55
                                          Lead paragraph, descrição de hero.

BODY             16px                   Weight 400, line-height 1.6
                                          Parágrafo padrão de leitura.

BODY SMALL       14px                   Weight 400, line-height 1.6

CAPTION          12px → 13px            Weight 400, line-height 1.45
                                          Metadata, hint, fine print.

EYEBROW          11px                   Weight 500, UPPERCASE
                                          letter-spacing 0.18em
                                          Cor: AMBER
                                          Kicker acima de headlines.

LABEL FORM       13px → 14px            Weight 500
                                          Acima de inputs.
```

### Regras

- **Weight 300 em H1/H2 é obrigatório.** Pesos pesados (700+) só em mentor variant (Primo Rico).
- **Italic apenas em hero** para destacar palavra-chave. Nunca em body, nunca em UI.
- **Tabular numerals em qualquer número financeiro.** Os zeros precisam alinhar.
- **Headlines balanceadas** — text-wrap: balance no h1/h2 para não deixar palavra órfã na última linha.
- **Linha de leitura**: 60-75 caracteres. Nunca parágrafo full-bleed em desktop. Use max-width 672px (max-w-2xl) para texto longo.

---

## Formas

### Border radius

3 perfis disponíveis. Redentia base usa **sharp** (radii conservadores).

```
SHARP    (Redentia)
    Inner pills, status dots          4px
    Buttons, inputs, badges, segmented  6px
    Cards, panels, modals             8px
    Hero cards, screenshots          12px
    Full pill                       9999px

ROUNDED  (Norte Capital)
    Pills                              8px
    Buttons                          12px
    Cards                            16px
    Hero                             24px

PILL     (Primo Rico, Me Poupe)
    Pills                            12px
    Buttons                          16px
    Cards                            24px
    Hero                             32px
```

### Regras

- **Cards principais**: 8px
- **Botões**: 6px
- **Inputs**: 6px
- **Status badges**: 4px
- **Avatares, status dots**: full pill (circular)
- **Proibido**: `rounded-full` em CTAs de texto. Use 6px.
- **Proibido**: radii intermediários sem perfil (10px, 14px, 18px).

### Densidade de elementos

```
COMPACT  (financial UI)
    Padding interno          8 → 12px
    Gap entre itens          4 → 8px
    Font base                13 → 14px

CONFORTÁVEL  (marketing, onboarding)
    Padding interno          24 → 32px
    Gap entre itens          16 → 24px
    Font base                16px
```

Nunca misturar densidades dentro do mesmo card.

---

## Sombras

**Regra de ouro**: toda sombra carrega tint amber. Sombra cinza neutra é proibida.

```
CARD              0 30px 45px -30px amber 18%
                  0 18px 36px -18px black 8%
                  
                  Eleva sutilmente. Usar em cards padrão.

CARD HOVER        0 40px 55px -30px amber 18%
                  0 24px 40px -18px black 8%
                  
                  Hover do card.

POPOVER           0 14px 30px -10px black 12%
                  0 30px 45px -30px amber 18%
                  
                  Modais, dropdowns, menus.

FOCUS RING        0 0 0 3px amber 22%
                  
                  Outline de foco em qualquer interativo.
                  Sem offset.
```

### Em dark mode

A sombra perde função de elevação. Use mudança de superfície (`bg-elevated` → `bg-overlay`) + border mais forte. A sombra ainda existe, mas mais sutil.

---

## Espaçamento

Base **4 pixels**. Tudo na escala.

```
1    = 4px       Hairline gap, icon padding
2    = 8px       Padding interno de input, badge
3    = 12px      Gap em form, padding compacto
4    = 16px      Padding base de card, gap de stack
5    = 20px      Section gap pequeno
6    = 24px      Padding confortável, gap de feature
8    = 32px      Padding de container, gap de coluna
12   = 48px      Section padding mobile
16   = 64px      Section padding desktop
20   = 80px      Section padding hero
24   = 96px      Section padding hero amplo
```

Off-scale (18, 22, 30, 50) é proibido. Exceção: hairlines de 1-2px.

### Ritmo vertical em conteúdo editorial

```
H2 → H2          margin-top 48px (separa blocos)
H2 → body        margin-top 12px
Body → H3        margin-top 32px
H3 → body        margin-top 8px
Body → body      margin-top 16px
```

---

## Iconografia

```
BIBLIOTECA       Lucide Icons
                 (https://lucide.dev)

TAMANHOS
    Denso         16px      (em chips, inline)
    Padrão        20px      (header, list item)
    Destaque      24px      (hero icon, section header)

STROKE           1.5 → 2px, consistente em toda tela
COR              var(--brand-primary) ou semantic match
                 (positive/negative pra estados)
```

**Não misturar** Lucide com Heroicons no mesmo card.

---

## Movimento

```
TRANSIÇÕES UI             150 → 200ms     ease-out
HOVER PRIMARY             filter: brightness(0.92)
                          Nunca opacity (rouba saturação)

ACTIVE STATE              transform: translateY(1px)
                          Nunca scale

MODAL/DRAWER ENTRY        200 → 250ms     ease-out
PAGE TRANSITION           300ms ou nenhuma
DECORATIVO (loops, glow)  até 2000ms      ease-in-out
```

Tudo acima de 400ms em UI funcional é lento. Tudo acima de 800ms em UX crítica é bug.

`prefers-reduced-motion: reduce` deve cortar TODO motion não-essencial. Status loading vira badge estático, scroll animations desligam.

---

## Padrões de componente

### Botão primary (CTA)

```
Fundo            AMBER
Texto            BRANCO (light) ou ONYX (dark)
Peso texto       500
Tamanho texto    15px
Padding          10px vertical · 20px horizontal
Radius           6px
Hover            filter brightness 0.92
Active           translateY(1px)
Focus            ring amber 22% (3px sem offset)
```

### Botão ghost

```
Fundo            transparente
Texto            ONYX WARM
Border           1px amber 14%
Peso texto       500
Hover            border amber 50%, fundo amber 6%
```

### Card

```
Fundo            BRANCO (light) ou SURFACE (dark)
Border           1px AMBER 8%
Radius           8px
Sombra           amber-tinted (var card)
Padding          24px
Hover            border AMBER 14%, sombra hover
```

### Badge / Status pill

```
Sucesso          fundo POSITIVE 18%, texto POSITIVE 85%, border POSITIVE 35%
Negativo         fundo NEGATIVE 18%, texto NEGATIVE 85%, border NEGATIVE 35%
Neutro           fundo OVERLAY, texto BODY, border SUBTLE
Brand            fundo AMBER 14%, texto AMBER 90%, border AMBER 30%

Radius           4px
Peso             500
Tamanho          11px
Letter-spacing   0.02em
```

### Segmented control (tabs/toggle)

```
Container        border AMBER default, fundo INPUT, radius 6px, padding 2px
Inner pill       radius 4px, padding 6px vertical · 12px horizontal
Active           fundo AMBER, texto contraste primary
Inactive         fundo transparente, texto BODY
Hover inactive   fundo OVERLAY
Tamanho fonte    12px
Peso             500
```

### Input / Textarea

```
Fundo            INPUT (off-white)
Border           1px AMBER default
Radius           6px
Texto            ONYX WARM
Placeholder      MUTED
Peso label       500 (acima do input)
Tamanho input    16px (mínimo para evitar zoom iOS)
Focus            border AMBER 100%, ring amber 22%
```

### Modal / Popover / Dropdown

```
Fundo            ELEVATED (light) ou OVERLAY (dark)
Border           SUBTLE (light) ou STRONG (dark)
Radius           8px
Sombra           popover
Padding interno  24px (modal), 16px (dropdown), 4px (popover wrapper)
```

### Page header editorial

```
Estrutura
    [back link opcional]
    [eyebrow opcional]
    [icon (32px inline OU 48px circle com bg amber 14%)]
    [h1 clamp 28-36px weight 300]
    [descrição body large com max-w-2xl]
    [chips de feature opcionais]
    [meta caption opcional]

Cores
    Eyebrow      AMBER, 11px UPPERCASE
    H1           ONYX WARM, weight 300
    Descrição    BODY, line-height 1.55
    Chips        BODY com icon AMBER ou POSITIVE
    Meta         MUTED 11px
```

### FAQ item

```
Container        BG ELEVATED, border SUBTLE, radius 8px
Open state       border DEFAULT, sombra card
Padding          16px vertical · 20px horizontal
Question         peso 500, 15px, ONYX WARM
Chevron          AMBER, rotaciona 180° ao abrir
Answer           BODY, line-height 1.6
Gap entre items  12px
```

---

## Hierarquia de Heroes (variants por tenant)

Cada tenant white-label tem hero próprio. Mas tudo ABAIXO do hero segue exclusivamente este design system.

```
QUIET            Redentia (default)
                 Editorial fintech premium, lightness as luxury,
                 Montserrat, paleta amber.

EDITORIAL        Norte Capital
                 Letter-from-advisor private bank,
                 Fraunces serif, paleta cream + gold.

MENTOR           Primo Rico
                 Aspirational book-cover orange chunky,
                 Montserrat Black, paleta orange.

SHOWTIME         Me Poupe!
                 TV pop magazine, washi tape, polaroid,
                 Poppins Black, paleta yellow.

RESEARCH         Investidor Sardinha
                 Academic paper, dropcap, footnotes,
                 IBM Plex Serif, paleta red.

PLAYBOOK         Saraiva Invest
                 Calm method + author photo,
                 paleta amber.

HOLDER           Holder
                 Editorial portrait condensed serif,
                 paleta red.
```

---

## Acessibilidade

```
CONTRASTE        Body         ≥ 4.5:1
                 UI/large     ≥ 3:1

TOUCH TARGET     Mobile button     44 × 44px
                 Desktop button    32 × 32px (icon) ou 36px altura (texto)
                 Tab/chip          32px altura mínima
                 Row clicável      40px altura mínima

FOCUS            Outline visível obrigatório (ring amber 3px 22%)
                 Nunca remover sem substituição

LABELS           Todo input tem label visível ou aria-label
                 Placeholder não substitui label
```

---

## Princípios visuais

1. **Sussurro, não grito.** Hierarquia por peso (300 vs 500), não por tamanho.
2. **Espaço respira.** Padding generoso. Linha de leitura confortável (60-75 chars).
3. **Cor é diagnóstico.** Verde = ganho. Vermelho = perda. Amber = ação. Sem decoração.
4. **Números alinham.** Tabular sempre.
5. **Sombra tem identidade.** Tint amber em vez de cinza neutro.
6. **Movimento é precisão.** 150-200ms, ease-out, brightness em vez de opacity.
7. **Tenant white-label muda hero.** Plataforma abaixo é invariante.

---

## Glossário rápido

| Termo | Significado |
|---|---|
| **Quiet** | Skin oficial da Redentia. Editorial premium, lightness as luxury. |
| **Eyebrow** | Kicker UPPERCASE 11px amber acima de headlines. |
| **Onyx warm** | `#1A0A2E` — preto aubergine quente. Substitui preto puro. |
| **Amber-tinted shadow** | Sombra com componente amber 18% em vez de cinza neutro. |
| **Tabular nums** | Numerais com largura fixa. Obrigatório em finanças. |
| **Tenant** | Marca white-label (Redentia, Norte, Primo Rico…). |
| **Variant** | Hero específico do tenant (quiet, editorial, mentor, showtime…). |

---

## Referências

- Stripe (stripe.com) — tipografia leve, espaço respirando, sombras com tint
- Linear (linear.app) — densidade UI, focus states
- FT (ft.com) — editorial financeiro, headline weight 300
- Bloomberg Terminal — tabular nums, monospaced numbers
- Vercel (vercel.com) — minimalismo geometricamente preciso
