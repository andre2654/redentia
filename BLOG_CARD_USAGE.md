# BlogCard Component - Guia de Uso

## Visão Geral

O componente `MoleculesBlogCard` é usado para exibir artigos/guias em formato de blog, com visual moderno e informações de metadata (data, tempo de leitura, categoria).

## Características

- ✅ Visual moderno estilo blog/artigo
- ✅ Ícone em destaque no header
- ✅ Badge de categoria
- ✅ Data de publicação
- ✅ Tempo estimado de leitura
- ✅ Preview do conteúdo (3 linhas)
- ✅ Hover effects suaves
- ✅ Design responsivo

## Props

### Obrigatórias

| Prop | Tipo | Descrição |
|------|------|-----------|
| `titulo` | `string` | Título do artigo/guia |
| `descricao` | `string` | Preview/resumo do conteúdo (até 3 linhas) |
| `to` | `string` | URL de destino do link |
| `icon` | `string` | Ícone Lucide a ser exibido |
| `categoria` | `string` | Nome da categoria (ex: "Ações", "FIIs") |

### Opcionais

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `data` | `string` | `'4 Jan 2026'` | Data de publicação |
| `tempoLeitura` | `number` | `8` | Tempo estimado de leitura em minutos |

## Uso Básico

```vue
<MoleculesBlogCard
  titulo="Como Investir em Ações"
  descricao="Guia completo para iniciantes começarem a investir na bolsa de valores."
  to="/guias/como-investir-em-acoes"
  icon="i-lucide-trending-up"
  categoria="Ações"
  data="4 Jan 2026"
  :tempo-leitura="8"
/>
```

## Exemplo em Grid

```vue
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <MoleculesBlogCard
    titulo="Como Investir em Ações"
    descricao="Guia completo para iniciantes..."
    to="/guias/acoes"
    icon="i-lucide-trending-up"
    categoria="Ações"
    :tempo-leitura="8"
  />
  
  <MoleculesBlogCard
    titulo="Melhores FIIs 2026"
    descricao="Fundos imobiliários mais promissores..."
    to="/guias/fiis"
    icon="i-lucide-building-2"
    categoria="FIIs"
    :tempo-leitura="10"
  />
  
  <MoleculesBlogCard
    titulo="Análise PETR4"
    descricao="Vale a pena investir?..."
    to="/guias/petr4"
    icon="i-lucide-chart-line"
    categoria="Análises"
    :tempo-leitura="12"
  />
</div>
```

## Ícones Recomendados por Categoria

### Ações
- `i-lucide-trending-up` - Gráfico crescente
- `i-lucide-bar-chart-3` - Gráfico de barras
- `i-lucide-candlestick-chart` - Candlestick

### FIIs
- `i-lucide-building-2` - Edifício
- `i-lucide-home` - Casa
- `i-lucide-landmark` - Marco/prédio

### Dividendos
- `i-lucide-coins` - Moedas
- `i-lucide-piggy-bank` - Cofrinho
- `i-lucide-wallet` - Carteira

### Análises
- `i-lucide-chart-line` - Gráfico de linha
- `i-lucide-search` - Lupa/análise
- `i-lucide-microscope` - Microscópio

### Small Caps
- `i-lucide-rocket` - Foguete
- `i-lucide-zap` - Raio/velocidade
- `i-lucide-sparkles` - Brilho/destaque

### Geral
- `i-lucide-book-open` - Livro aberto
- `i-lucide-graduation-cap` - Educação
- `i-lucide-lightbulb` - Ideia

## Anatomia do Componente

```
┌─────────────────────────────────────────┐
│  Header (border-bottom)                 │
│  ┌─────┐  Categoria (badge)             │
│  │Icon │  Título do Artigo               │
│  │ 14px│                                 │
│  └─────┘                                 │
├─────────────────────────────────────────┤
│  Conteúdo                                │
│                                          │
│  Descrição do artigo (3 linhas max)     │
│  com line-clamp para truncar...         │
│                                          │
├─────────────────────────────────────────┤
│  Footer (border-top, mt-auto)           │
│  📅 4 Jan 2026  🕐 8 min  →  Ler artigo │
└─────────────────────────────────────────┘
```

## Estados Visuais

### Normal
- Border: `border-white/10`
- Background: `from-white/5 to-transparent`

### Hover
- Border: `border-secondary/30`
- Background: `from-white/10`
- Título: `text-secondary`
- Seta: Desliza para direita

## Cores de Categoria (Badges)

As badges usam `color="neutral"` com `variant="subtle"`:
- Background cinza suave
- Texto branco
- Adaptável ao tema

Para customizar cores por categoria, você pode criar variações do componente.

## Boas Práticas

### ✅ Faça

- Mantenha títulos concisos (2-6 palavras)
- Descrições de 1-2 frases (máx 3 linhas)
- Use ícones relevantes ao conteúdo
- Tempo de leitura realista (5-15 min)
- Data de publicação real

### ❌ Evite

- Títulos muito longos (quebram layout)
- Descrições vagas ou genéricas
- Ícones que não fazem sentido
- Tempo de leitura irreal (>30 min)
- Datas muito antigas sem atualização

## Responsividade

- **Mobile:** 1 coluna (stack vertical)
- **Tablet (md):** 2 colunas
- **Desktop (lg):** 3 colunas
- **Wide (xl):** 3 colunas (pode expandir para 4 se necessário)

## Tempo de Leitura

Recomendações baseadas em contagem de palavras:

- **5 min:** ~800-1000 palavras
- **8 min:** ~1300-1600 palavras
- **10 min:** ~1600-2000 palavras
- **12 min:** ~2000-2400 palavras
- **15 min:** ~2400-3000 palavras

Fórmula: `palavras ÷ 200 = minutos`

## Onde Usar

### Já implementado:
- ✅ `/index.vue` - Seção de guias na home
- ✅ `/guias/index.vue` - Página índice de todos os guias

### Oportunidades futuras:
- Blog posts individuais
- Seção de notícias de mercado
- Análises de ativos destacadas
- Tutoriais em vídeo (adaptando com thumbnail)

## Customização

### Adicionar Thumbnail/Imagem

Se quiser adicionar imagens no futuro, pode estender o componente:

```vue
<!-- No template do componente -->
<div v-if="thumbnail" class="aspect-video overflow-hidden">
  <img :src="thumbnail" :alt="titulo" class="object-cover w-full h-full" />
</div>
```

### Adicionar Autor

```vue
<div class="flex items-center gap-2">
  <UAvatar :alt="autor" size="xs" />
  <span class="text-xs">{{ autor }}</span>
</div>
```

## Acessibilidade

- ✅ Link semântico com `NuxtLink`
- ✅ Textos descritivos
- ✅ Contraste adequado (WCAG AA)
- ✅ Navegação por teclado
- ✅ Hover states claros

## Performance

- ✅ Componente leve (~1.5KB)
- ✅ Lazy loading do Nuxt
- ✅ Transitions otimizadas
- ✅ Line-clamp CSS nativo

## Exemplo Real

Veja implementação em:
- `/index.vue` - Seção "Aprenda a investir"
- `/guias/index.vue` - Grid completo de artigos
