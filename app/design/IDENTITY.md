# Redentia v3 — Identidade Visual

> Documento autoritativo. Toda decisao visual nesta plataforma deve aderir a este DNA.
> Conflitos sao resolvidos a favor deste documento, nao do componente legado.

A Redentia v3 e **fintech editorial premium**. Lightness como luxo. Sussurro,
nao grito. Headlines em weight 300 carregam mais autoridade que weight 800
porque assumem que o leitor ja confia.

A skin e chamada internamente de **quiet** (substantivo, nao adjetivo: o quiet,
o sussurro). E a unica skin oficial da marca Redentia. Qualquer tenant white-label
diferente (Holder, Norte, Saraiva, etc.) usa hero variant proprio mas DEVE seguir
estes fundamentos para o resto da plataforma.

---

## 1. DNA, em uma frase

> Tipografia leve em onyx warm + amber pontual + sombras com tint cromatico do brand + radii conservadores 4-8px + tabular numerals em todo numero financeiro.

Se um componente quebra qualquer um destes 5, esta fora do padrao.

---

## 2. Regras nao-negociaveis

### 2.1 Cor

- **Heading text**: SEMPRE `var(--text-heading)`. Nunca `#000`, nunca `#FFF`, nunca cinza neutro.
  - Light mode resolve para `#1A0A2E` (deep aubergine warm)
  - Dark mode resolve para `var(--brand-text)` (cream warm)
- **Body text**: `var(--text-body)`. Substitui `text-gray-*`, `text-zinc-*`, qualquer cinza neutro.
- **Muted text**: `var(--text-muted)`. Captions, metadata, placeholders.
- **Primary brand**: SEMPRE `var(--brand-primary)`. Nunca hardcode `#FACC15`/`#F5A623`/`#D8881A`.
- **Texto sobre amber**: SEMPRE `#1A0A2E` (contraste >= 7:1 garantido em qualquer tenant).
- **Positive/negative**: `var(--brand-positive)` / `var(--brand-negative)`. Nunca verde/vermelho puro fora dessas vars.
- **Borders**: `var(--border-subtle)` (default), `var(--border-default)` (hover/active), `var(--border-strong)` (modals/popovers).
- **Surfaces**: `var(--bg-base)` canvas, `var(--bg-elevated)` cards, `var(--bg-overlay)` hover/nested, `var(--bg-input)` chrome.

### 2.2 Tipografia

- **Display headlines (>= 32px)**: weight 300. Letter-spacing -0.025em (h1/h2) ou -0.018em (h3).
- **Body**: weight 400. Line-height 1.55.
- **Labels e UI**: weight 500. Inputs, buttons, eyebrows.
- **Eyebrow**: classe `.eyebrow` — 11px UPPERCASE letter-spacing 0.18em em amber.
- **Numeros financeiros**: SEMPRE `tabular-nums`. Use `.font-mono-tab` para tabela densa, ou `tabular-nums` standalone.
- **Italico**: APENAS em hero para enfase pontual (ex. "investir com *inteligencia*"). Nunca em body.
- **Fonte**: `var(--brand-font)` (Montserrat na Redentia base). Nao trocar por componente.

### 2.3 Radii

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-[4px]` | 4 | Inner pills (segmented), badges, status dots |
| `rounded-md` | 6 | Buttons, inputs, segmented containers, dropdown items |
| `rounded-lg` | 8 | Cards, panels, modals |
| `rounded-xl` | 12 | Hero cards, screenshots, proeminent containers (raro) |

**Proibido**: `rounded-full` em CTAs principais ou cards. Permitido apenas em avatars, status dots,
chips de filtro com 1 letra, indicador de notificacao.

### 2.4 Shadow

- Light mode: SEMPRE com tint amber. Use os tokens compostos: `var(--shadow-card)`, `var(--shadow-card-hover)`, `var(--shadow-popover)`.
- Dark mode: a sombra perde funcao de elevacao. Use mudanca de superficie (`var(--bg-elevated)` -> `var(--bg-overlay)`) + border mais forte.
- **Proibido**: sombra cinza neutra (`rgba(0,0,0,X)` sozinha). SEMPRE pareada com tint amber ou nao usada.

### 2.5 Focus

- SEMPRE `focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)]`. Sem excecao.
- O ring e amber 22%, 3px, sem offset. Funciona em qualquer surface.

### 2.6 Motion

- Transitions: 150-200ms `ease-out`.
- Hover em primary: `filter: brightness(0.92)`. Nunca opacity (rouba saturacao).
- Active: `transform: translateY(1px)`. Nunca scale.

---

## 3. Padroes de componentes recorrentes

### 3.1 Botao primary (CTA)

```html
<button class="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[15px] font-medium leading-none transition-all duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)] active:translate-y-px hover:brightness-[0.92]"
        style="background-color: var(--brand-primary); color: #1A0A2E;">
  Label
</button>
```

Helper class equivalente: `.quiet-btn-primary` (em [main.css](../assets/css/main.css)).

### 3.2 Botao ghost

```html
<button class="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-[15px] font-medium leading-none transition-all duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)]"
        style="background-color: transparent; color: var(--text-heading); border-color: var(--border-default);">
  Label
</button>
```

Helper class: `.quiet-btn-ghost`.

### 3.3 Segmented control

**Use o componente `<AtomsSegmented>`** ([atoms/segmented.vue](../components/atoms/segmented.vue)):

```vue
<AtomsSegmented
  v-model="value"
  :options="[
    { value: 'a', label: 'Um' },
    { value: 'b', label: 'Dois' },
    { value: 'c', label: 'Tres' },
  ]"
/>
```

Props: `options`, `size` ('sm'|'md'), `disabled`, `aria-label`. NUNCA reescrever inline.

### 3.4 Card

```html
<article class="quiet-card p-6">
  <h3>Titulo</h3>
  <p>Body</p>
</article>
```

`.quiet-card` ja traz: bg-elevated, border-subtle, rounded-lg, shadow-card, hover state.

### 3.5 Badge (status pill)

```html
<span class="quiet-badge quiet-badge--success">+1.24%</span>
<span class="quiet-badge quiet-badge--negative">-0.38%</span>
<span class="quiet-badge quiet-badge--neutral">Pausado</span>
<span class="quiet-badge quiet-badge--brand">Novo</span>
```

### 3.6 Input

UInput / UTextarea / UInputNumber ja vem configurados em [app.config.ts](../app.config.ts)
com border-default, focus border primary + ring amber, tabular-nums em numbers.
Nao precisa override por componente.

### 3.7 Modal / Popover / Dropdown

- Background: `var(--bg-elevated)` (light) ou `var(--bg-overlay)` (dark)
- Border: `var(--border-subtle)` (light) ou `var(--border-strong)` (dark)
- Radius: `rounded-lg` (8px)
- Shadow: `var(--shadow-popover)`
- Padding interno: 6 (24px) para modal, 4 (16px) para dropdown, 1 (4px) para popover wrapper

### 3.8 Numero financeiro

```html
<span class="font-mono-tab tabular-nums" :style="{ color: change >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }">
  {{ formatBRL(value) }}
</span>
```

Em `<table>`, `tabular-nums` ja e automatico via reset CSS global.

---

## 4. Anti-patterns (proibidos)

| Faca isto | Em vez disto |
|-----------|--------------|
| `var(--text-heading)` | `text-black`, `text-white`, `#000`, `#FFF` |
| `var(--text-body)` | `text-gray-500`, `text-zinc-400`, qualquer Tailwind cinza |
| `var(--brand-primary)` | `#FACC15` ou outro hex amber hardcoded |
| `font-light` (300) em h1/h2 | `font-bold`, `font-extrabold`, `font-black` |
| `rounded-md` (6px) | `rounded-2xl`, `rounded-full` em CTAs |
| `tabular-nums` | numeros em fonte proporcional |
| `<AtomsSegmented>` | reescrever segmented control inline |
| `var(--shadow-card)` | `shadow-2xl`, `shadow-md` puro |
| `var(--brand-positive)` / `var(--brand-negative)` | `text-green-500`, `text-red-500` |
| Hover via filter brightness | Hover via opacity |
| Sombra com tint amber | Sombra cinza/preta neutra |

Quando voce ver qualquer um da coluna direita, e um defeito a corrigir.

---

## 5. Variants de hero

A skin quiet e o **default** da Redentia. Outras hero variants existem para
white-label tenants e devem ser usadas APENAS no hero, nao no resto da plataforma.

| Variant | Tenant canonico | Quando usar |
|---------|-----------------|-------------|
| `quiet` | **Redentia** | Default. Premium fintech editorial. Esta skin. |
| `terminal` | (legacy v2) | Bloomberg-reimagined. Mantido para referencia historica. NAO usar em novas tenants. |
| `editorial` | Norte Capital | Letter-from-advisor private bank |
| `mentor` | Primo Rico | Aspirational book-cover orange chunky |
| `showtime` | Me Poupe! | TV pop magazine |
| `research` | Investidor Sardinha | Academic paper |
| `playbook` | Saraiva Invest | Calm method + author photo |
| `holder` | Holder | Editorial portrait condensed serif |

Cada variant carrega sua propria atmosfera no hero. Mas todos os componentes
ABAIXO do hero (cards, tabelas, inputs, modals, segmented, badges) seguem
exclusivamente os padroes deste IDENTITY.md.

---

## 6. Como adicionar um novo componente

Antes de escrever um novo componente, responda:

1. Headings em weight 300 e color `var(--text-heading)`?
2. Cores derivam de `var(--brand-*)` ou `var(--text-*)` / `var(--bg-*)` / `var(--border-*)`? Zero hex hardcoded.
3. Numeros tem `tabular-nums`?
4. Radii estao entre 4px e 8px?
5. Hover via `filter: brightness(0.92)` em primary, ou mudanca de surface em ghost?
6. Focus aplica `var(--shadow-ring-focus)`?
7. Funciona em light E em dark sem branch de codigo (apenas via CSS vars)?
8. Existe um componente reusavel ja ([atoms/segmented.vue](../components/atoms/segmented.vue),
   `.quiet-card`, `.quiet-btn-primary`, etc.) que evita reescrever inline?

Se sim para todos, esta dentro da identidade. Se nao para qualquer um, refaca antes de fazer commit.

---

## 7. Onde os tokens vivem

- Geracao de CSS vars: [`plugins/brand.ts`](../plugins/brand.ts) (gera `--text-*`, `--bg-*`, `--border-*`, `--shadow-*` por mode)
- Defaults globais (typography, helpers): [`assets/css/main.css`](../assets/css/main.css) (h1/h2/h3 weight 300, body color, `.quiet-*` classes)
- Defaults @nuxt/ui components: [`app.config.ts`](../app.config.ts) (button, input, textarea, card, badge)
- Config de tenant: [`config/brand.ts`](../config/brand.ts) (paleta, fonte, radii por tenant)

Ao precisar adicionar/ajustar token, edite o `plugins/brand.ts`. Nao crie token
ad-hoc por componente.

---

## 8. Skill agente

A skill [`redentia-stripe-style`](../../.claude/skills/redentia-stripe-style/SKILL.md)
contem o conhecimento completo desta identidade em formato consumivel por agente.
Esta skill e o conhecimento exterior; o IDENTITY.md e a constituicao interna do
projeto. Os dois devem permanecer alinhados.
