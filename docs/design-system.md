# Design System - Redentia

## Paleta de Cores

### Cores Principais

```css
--ui-primary: #b9ecc1    /* Verde claro - Ações primárias */
--ui-secondary: #a7d6ff  /* Azul claro - Destaques secundários */
--ui-tertiary: #042f54   /* Azul escuro - Elementos terciários */
```

### Cores de Estado (Market)

```css
--ui-positive: #22c55e   /* Verde - Variações positivas (+) */
--ui-negative: #ef4444   /* Vermelho - Variações negativas (-) */
--ui-neutral: #6b7280    /* Cinza - Estado neutro */
```

### Uso em Componentes

#### Variações de Mercado

Use as cores de estado para indicadores financeiros:

```vue
<!-- Variação positiva -->
<span class="text-green-500">+2.45%</span>

<!-- Variação negativa -->
<span class="text-red-500">-1.32%</span>

<!-- Neutro -->
<span class="text-gray-500">0.00%</span>
```

#### Classes Tailwind Equivalentes

- `text-green-500` = `--ui-positive`
- `text-red-500` = `--ui-negative`
- `text-green-400` para tons mais claros
- `text-red-400` para tons mais claros

### ChartColors

Para gráficos, use o objeto `ChartColors`:

```ts
import { ChartColors } from '~/design/chartColors'

ChartColors.positive  // '#b9ecc1'
ChartColors.negative  // '#8E3939'
ChartColors.secondary // '#a7d6ff'
ChartColors.neutral   // '#6B7280'
```

## Tipografia

- **Font Family**: 'Sora'
- **Escala de Tamanhos**: Use classes Tailwind padrão (`text-sm`, `text-base`, `text-lg`, etc.)
- Evite tamanhos customizados como `text-[13px]` a menos que necessário

### Tamanhos Recomendados

```
text-xs     12px  - Labels, timestamps
text-sm     14px  - Corpo secundário
text-base   16px  - Corpo principal
text-lg     18px  - Subtítulos
text-xl     20px  - Títulos menores
text-2xl    24px  - Títulos médios
text-3xl    30px  - Títulos grandes
text-4xl    36px  - Hero titles
```

## Espaçamento

Use a escala de espaçamento Tailwind:
- `gap-2` (0.5rem / 8px)
- `gap-4` (1rem / 16px)
- `gap-6` (1.5rem / 24px)
- `gap-8` (2rem / 32px)

## Componentes de UI

### Botões

Use o componente `UButton` do Nuxt UI:

```vue
<UButton color="secondary" variant="solid">
  Ação Principal
</UButton>

<UButton color="neutral" variant="outline">
  Ação Secundária
</UButton>
```

### Inputs

```vue
<UInput 
  variant="soft" 
  color="neutral" 
  placeholder="Digite aqui..."
/>
```

## Acessibilidade

- **Focus States**: Todos os elementos focáveis têm outline visível
- **Contraste**: Cores atendem WCAG 2.1 Level AA
- **Dark Mode**: Todo o site usa dark mode por padrão

## Exemplos

### Card de Ativo

```vue
<div class="rounded-xl border border-white/10 bg-white/5 p-4">
  <h3 class="text-lg font-semibold">PETR4</h3>
  <p class="text-sm text-gray-400">Petrobras PN</p>
  <span class="text-2xl font-bold">R$ 38,45</span>
  <span class="text-green-500">+2.34%</span>
</div>
```

### Ticker Badge

```vue
<span class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
  <span class="font-semibold">VALE3</span>
  <span class="text-green-400">+1.2%</span>
</span>
```

## Migração de Cores Hardcoded

Se encontrar cores hardcoded como:
- `#b9ecc1` → use `text-primary` ou `bg-primary`
- `#a7d6ff` → use `text-secondary` ou `bg-secondary`
- `#22c55e` ou `text-green-500` → mantenha (cor de estado positivo)
- `#ef4444` ou `text-red-500` → mantenha (cor de estado negativo)
