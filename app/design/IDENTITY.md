# Redentia v4 — Identidade Visual (wallet-driven)

> Documento autoritativo, escrito ENGINEERING-FIRST: pega o que realmente foi
> implementado em `/wallet/index.vue` e codifica como **padrão replicável**.
> Quando refazer outra tela (`/wallet/resultado`, `/wallet/hoje`, `/raio-x`,
> etc), copiar essas recipes sem rediscutir do zero.

A skin atual é **redentia-cards**: cards macios sobre canvas off-white, cada
bloco é uma ilha com `padding suave + border quase transparente + arredondamento
suave`. Amber é assinatura, não preenchimento. Hero numbers em weight 300 com
tabular nums. Italic serif na palavra-âncora.

---

## 1. DNA, em uma frase

> Cada bloco vira card (off-white sobre canvas) · border quase transparente (35%) · arredondamento 14px · padding 24px · gap 12-16px entre cards · amber em hero numbers e accents · italic serif em uma palavra do headline · tabular numerals em todo número financeiro · sem shadows, sem text-shadow.

Se algum componente quebra isso, está fora do padrão.

---

## 2. Tokens em uso (extraídos do código real)

### 2.1 Cores via CSS vars (nunca hardcode)

```css
/* surfaces */
var(--bg-base)         /* canvas da página (off-white cream em light) */
var(--bg-elevated)     /* card surface */
var(--bg-overlay)      /* hover sutil / sub-card raríssimo */

/* texto */
var(--text-heading)    /* headlines, números neutros */
var(--text-body)       /* body */
var(--text-muted)      /* eyebrows, captions, meta */

/* brand */
var(--brand-primary)         /* amber #E58A2C — wealth queimado */
var(--brand-positive)        /* verde — ganhos */
var(--brand-negative)        /* vermelho — perdas */

/* borders quase transparentes (REGRA: sempre via color-mix com opacity) */
color-mix(in srgb, var(--brand-border) 30%, transparent)   /* cards top-level */
color-mix(in srgb, var(--brand-border) 35%, transparent)   /* sub-cards */

/* tints semânticos (chips, hovers) */
color-mix(in srgb, var(--brand-primary)  12%, transparent) /* amber tint */
color-mix(in srgb, var(--brand-positive) 12%, transparent) /* verde tint */
color-mix(in srgb, var(--brand-negative) 12%, transparent) /* vermelho tint */
color-mix(in srgb, var(--brand-primary)  28%, transparent) /* border de chip amber */
```

### 2.2 Radii canônicos

| Token | Uso |
|---|---|
| `9999px` (pill) | botões CTA, chips/pílulas, ícones redondos, badges |
| `14px` | **card top-level** (default) — cards principais da página |
| `14px` | **sub-card** dentro de outro card (mini-stat, KPI cell, lista item) |
| `12px` | rounded utilitário (banco card, cell de chart, etc) |
| `8px` | apenas chips muito pequenos |

> **Nunca** `4px`/`6px`/`8px` em cards top-level. **Nunca** `rounded-2xl` (16px) — fica grande demais; usar 14px (`rounded: 14px` direto).

### 2.3 Espaçamento

| Contexto | Valor |
|---|---|
| Padding interno card top-level | **24px** |
| Padding interno sub-card | **20px** |
| Padding interno pílula compacta | **4px 12px** |
| Padding interno botão CTA | **14px 24px** |
| Gap entre cards da mesma seção (grid) | **12-16px** |
| Gap entre sub-cards (grid 2-4 col) | **10-12px** |
| Gap entre rows verticais (stack) | **16px** |
| Container externo do layout | **p-4** (16px todos lados, em `layouts/default.vue`) |

### 2.4 Sombras

```css
/* PADRÃO: ZERO shadow nos cards */
border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
/* O peso visual vem do border + bg-elevated, NUNCA de box-shadow */
```

Exceções: CTA primário deep solid pode ter shadow leve só pra "elevar":
```css
box-shadow: 0 12px 32px -12px color-mix(in srgb, var(--text-heading) 50%, transparent);
```

Hero numbers: **sem** `text-shadow` (tira glow).

---

## 3. Recipes de componentes (copy-paste prontos)

### 3.1 Card top-level

```css
.<page>-card {
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-radius: 14px;
  background: var(--bg-elevated);
}
```

### 3.2 Sub-card (mini-stat / KPI cell — dentro de card)

```css
.<page>-mini {
  position: relative;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  border-radius: 14px;
  background: transparent;    /* só border, sem bg — destaca-se do card pai */
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 144px;          /* opcional: alinha grid de 3-4 colunas */
}
```

**Estrutura interna canônica** (todos seguem o mesmo flow):
```html
<div class="mini">
  <p class="eyebrow-muted">RENDA PROJETADA 12M</p>
  <p class="mini-value">R$ 1.0k</p>      <!-- pode ser .primary (amber) / .positive (verde) / heading -->
  <p class="mini-meta">Bom</p>           <!-- opcional, pequeno -->
  <div class="icon-chip">...</div>       <!-- opcional, absolute bottom-right -->
</div>
```

### 3.3 Eyebrow (não amber — é MUTED)

```css
.eyebrow-muted {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14-0.18em;
  color: var(--text-muted);
  margin: 0;
}
```

**Regra**: eyebrow é rótulo, não conteúdo. Amber fica reservado pro conteúdo (hero number, accents).

### 3.4 Hero number (patrimônio, score, retorno)

```css
.hero-number {
  font-size: clamp(40px, 7vw, 96px);
  font-weight: 300;            /* light — peso vem do tamanho, não do weight */
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--brand-primary); /* amber. positive/negative pra deltas */
  font-variant-numeric: tabular-nums;
  margin: 0;
  /* text-shadow: PROIBIDO */
}
```

### 3.5 Headline com italic serif (palavra-âncora)

```html
<h2 class="headline">
  Sua frase normal <em class="calc-italic">palavra-chave</em> resto da frase.
</h2>
```

```css
.headline {
  font-size: clamp(26px, 3.2vw, 38px);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--text-heading);
}
.calc-italic {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;            /* ou 700 se quiser bold */
  color: var(--brand-primary); /* amber */
}
```

**Regra**: **uma palavra** italic serif por headline. Mais que isso vira gimmick.

### 3.6 Ícone em chip outline (NÃO fill)

```css
.icon-chip {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: transparent;     /* sem bg colorido — só outline */
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
  color: var(--brand-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-chip--pos { border-color: ...positive 28%; color: var(--brand-positive); }
.icon-chip--neg { border-color: ...negative 28%; color: var(--brand-negative); }
.icon-chip--neutral { border-color: ...text-heading 14%; color: var(--text-muted); }
```

**Mini-stat icon** posiciona absoluto bottom-right do sub-card:
```css
.mini-icon { position: absolute; bottom: 16px; right: 16px; }
```

### 3.7 CTA primário (deep solid pill)

```css
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 9999px;
  background: var(--text-heading);   /* deep aubergine — vira o "preto warm" */
  color: var(--bg-base);             /* off-white cream */
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 200ms;
}
.cta-primary:hover {
  background: var(--brand-primary);  /* hover = amber */
  color: var(--text-on-primary);
  transform: translateY(-2px);
}
```

### 3.8 Pílula compacta (lista item — banco, tag, classe)

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;        /* avatar à esquerda, texto à direita */
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  text-decoration: none;
  color: inherit;
}
.pill-avatar {
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: var(--brand-primary);
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pill-badge {
  padding: 2px 7px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--brand-positive) 12%, transparent);
  color: var(--brand-positive);
  font-size: 10.5px;
  font-weight: 500;
}
```

**Variant "adicionar"** — border dashed amber:
```css
.pill--add {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}
```

### 3.9 Card hero com bg gradient + SVG decorativo

Pra cards de DESTAQUE (resultado, conquista, momento editorial):

```css
.cta-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 36px 32px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-primary) 14%, var(--bg-elevated)) 0%,
    color-mix(in srgb, var(--brand-primary) 5%, var(--bg-elevated)) 70%,
    var(--bg-elevated) 100%
  );
}
.cta-bg-illo {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;        /* SUTIL — não compete com o texto */
}
.cta-hero-content, .cta-primary { position: relative; z-index: 1; }
```

SVG pattern usado: curva tracejada amber + área translúcida abaixo:
```html
<svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="X" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--brand-primary)" stop-opacity="0.32" />
      <stop offset="100%" stop-color="var(--brand-primary)" stop-opacity="0" />
    </linearGradient>
  </defs>
  <path d="M 0 220 Q ... " fill="url(#X)" />
  <path d="M 0 220 Q ... " fill="none" stroke="var(--brand-primary)"
        stroke-width="3" stroke-dasharray="2 7" opacity="0.85" />
</svg>
```

### 3.10 Sparkline mini (sub-card lateral)

```html
<svg class="block-spark" viewBox="0 0 120 60" preserveAspectRatio="none">
  <path d="M 0 50 Q 20 42 35 38 T ... L 120 60 L 0 60 Z"
        fill="color-mix(in srgb, var(--brand-positive) 14%, transparent)" />
  <path d="M 0 50 Q 20 42 35 38 T ..."
        fill="none" stroke="var(--brand-positive)" stroke-width="2" />
</svg>
```

```css
.block-spark { width: 130px; height: 60px; flex-shrink: 0; opacity: 0.95; }
```

### 3.11 Pill com cor de destaque (card editorial, ex: "INSIGHTS DA IA")

```css
.insight-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
```

---

## 4. Padrões de layout (grids responsivos)

### 4.1 Stack vertical default

Mobile e tablet, tudo empilha:
```css
display: flex;
flex-direction: column;
gap: 16px;
```

### 4.2 Grid 2-col (50/50) no desktop

```css
display: grid;
grid-template-columns: 1fr;
gap: 16px;

@media (min-width: 1024px) {
  grid-template-columns: 1fr 1fr;
}
```

### 4.3 Grid asymétrico 1.6/1 (radar + insights)

```css
@media (min-width: 1280px) {
  grid-template-columns: 1.6fr 1fr;
  gap: 32px;
}
```

### 4.4 Grid 3 ou 4 colunas (mini-stats horizontais)

```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 12px;

@media (min-width: 768px) {
  grid-template-columns: repeat(3, 1fr);  /* ou 4 */
}
```

### 4.5 Grid de 9 cells (raio-x dimensions)

```css
grid-template-columns: 1fr 1fr;
@media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); }
@media (min-width: 1024px) { grid-template-columns: repeat(9, 1fr); }
```

### 4.6 Grid 2 col split com áreas (CalcUiShell legacy)

```css
@media (min-width: 1024px) {
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "hero result"
    "form chart";
}
.block-hero { grid-area: hero; }
.block-result { grid-area: result; }
.block-form { grid-area: form; }
.block-chart { grid-area: chart; }
```

### 4.7 Container externo: NÃO usar max-width nem mx-auto na page

O container do layout (`layouts/default.vue → div.flex.min-h-0.flex-1.flex-col`) tem `p-4`. Cards da página ocupam **100% da largura disponível**.

```css
.<page>-wrap {
  /* NÃO: max-width: 1280px; */
  /* NÃO: margin: 0 auto; */
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

---

## 5. Anti-patterns (proibidos)

| ❌ Faça isto | ✅ Em vez disto |
|---|---|
| `box-shadow` em card | `border 1px + bg-elevated` |
| `text-shadow` em hero number | Sem shadow |
| `border-top` separando sections | `gap` no flex parent |
| `padding-top` extra em seção | `gap` ou `margin-top: 16px` no container |
| Hardcoded `#F5A623`, `#FFFFFF` | Tokens via `var(--brand-*)` ou `color-mix` |
| Eyebrow em amber | Eyebrow em `var(--text-muted)` |
| Score numérico no título ("Diversificação 88") | Título prosaico + score em outro lugar OU sem score |
| Mini-card com bg colorido cheio | Border outline, bg transparente |
| Ícone redondo com bg fill colorido | Chip outline (border tinted + bg transparente) |
| `rounded-md`/`rounded-lg` em card | `border-radius: 14px` |
| `rounded-2xl` (16px) em card | `border-radius: 14px` (mais sutil) |
| `i-lucide-stairs` ou ícones inventados | Verificar em [lucide.dev](https://lucide.dev) primeiro |
| `font-size: 16px` em hero number | `clamp(40px, 7vw, 96px)` weight 300 |
| `font-weight: 700` em headline | `font-weight: 400` (medium) |
| 2+ palavras italic serif | 1 palavra-âncora máximo |
| Texto técnico ("HHI 0.17") como tag | Texto narrativo amigável |
| Múltiplas sections com mesmo conteúdo (Open Finance 2x) | DRY: uma seção, uma fonte |
| `max-width: 1280px; margin: 0 auto;` na page | Deixar full width, container externo cuida |
| Grid com border-top de separação | Gap no parent + cards autônomos |

---

## 6. Checklist pra replicar em nova tela

Quando refazer uma tela (ex: `/wallet/resultado`):

1. **Listar todos blocos visuais** (5-15 tipicamente). Para cada um decidir:
   - É **card top-level** ou **sub-card** (dentro de outro)?
   - Tem **hero number**? Em qual cor (amber/positive/negative/heading)?
   - Tem **eyebrow** + **headline** com italic serif na palavra-âncora?
   - Tem **ícone chip** (positive/negative/amber/neutral)?
   - Tem **CTA** (deep solid pill)?
   - Tem **mini-stats** internos (sub-cards)?

2. **Decidir layout**:
   - Mobile sempre stack vertical (flex column gap 16px).
   - Desktop: stack? 2-col 50/50? asymétrico 1.6/1?
   - Sub-stats: grid 3-4 col uniforme?

3. **Aplicar recipes da seção 3** copy-paste, ajustando apenas conteúdo.

4. **Verificar checklist final**:
   - [ ] Cards `padding: 24px; border-radius: 14px; border 1px ...30%`
   - [ ] Sub-cards transparentes com border 35%
   - [ ] Hero numbers em amber, weight 300, sem text-shadow
   - [ ] Eyebrows em muted (não amber)
   - [ ] Tabular nums em todo número
   - [ ] Italic serif em 1 palavra do headline
   - [ ] Ícones em chips outline (border colorida, bg transparente)
   - [ ] CTAs `rounded: 9999px`
   - [ ] Sem `border-top`, `padding-top`, `box-shadow` extras
   - [ ] Sem `max-width` / `mx-auto` na page
   - [ ] Container externo já tem `p-4` (não duplicar)
   - [ ] Ícones lucide validados em [lucide.dev](https://lucide.dev)

5. **Override de componentes legacy** (CalcUiShell, etc) via `:deep()` no `<style scoped>` da página, sem mexer no componente original — preserva uso em outras pages.

---

## 7. Sobre overrides + componentes legacy

A wallet usa `<CalcUiShell>` (componente compartilhado com calculadoras) +
classes legacy `wp8-*`. **Não modificamos o componente original** — todos os
ajustes (tirar grid 2x2, virar card, mudar padding, etc) foram feitos via
`:deep()` no `<style scoped>` da própria page.

**Vantagem**: `/wallet/index.vue` reescreve a aparência do CalcUiShell sem
afetar `/calculadora/*` que continua usando o visual original.

**Padrão de override**:
```css
:deep(.cui-shell-block-hero),
:deep(.cui-shell-block-result),
:deep(.cui-shell-block-form),
:deep(.cui-shell-block-chart) {
  padding: 24px !important;
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent) !important;
  border-radius: 14px !important;
  background: var(--bg-elevated) !important;
}
```

`!important` é OK aqui — estamos sobrescrevendo CSS scoped do componente
filho. Sem isso, especificidade não bate.

---

## 8. Onde os tokens vivem

- CSS vars: `plugins/brand.ts` (`--text-*`, `--bg-*`, `--border-*`, `--shadow-*`)
- Tokens semânticos default: derivados de `--brand-primary`, `--brand-positive`, etc do tenant ativo
- Helpers globais: `assets/css/main.css` (`.eyebrow`, `.calc-italic`, classes utilitárias)
- Recipes específicos da página: `<style scoped>` da própria page

---

## 9. Resumo executivo (TL;DR)

Pra qualquer tela nova:

1. Tudo é card. Card = `padding 24px + border-radius 14px + border 30% opacity + bg-elevated`. Stack vertical gap 16px.
2. Hero numbers em amber, weight 300, clamp gigante, tabular nums.
3. Eyebrows em muted (não amber). Italic serif em 1 palavra do headline.
4. Sub-cards (mini-stats) = transparente + border 35% + radius 14px.
5. Ícones em chips outline (border colorida, bg transparente).
6. CTAs pill rounded-full deep solid.
7. Grid 1fr 1fr no desktop, stack no mobile. Sem max-width na page.
8. Sem box-shadow, sem text-shadow, sem border-top entre sections (use gap).
9. Container externo já tem `p-4` no `layouts/default.vue` — não duplicar.
10. Override de componente legacy via `:deep()` scoped, sem mexer no original.
