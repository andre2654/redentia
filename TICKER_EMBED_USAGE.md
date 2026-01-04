# Ticker Embed - Guia de Uso

## Componente para Exibição de Tickers

O componente `AtomsTickerEmbed` permite exibir tickers de forma visual e interativa em qualquer parte do site, incluindo guias, artigos e páginas informativas.

## Características

- ✅ Exibe logo, ticker e variação em tempo real
- ✅ Link clicável para a página do ativo
- ✅ Hover effect com destaque
- ✅ 3 tamanhos disponíveis (sm, md, lg)
- ✅ Opção de mostrar ou ocultar variação
- ✅ Design responsivo e inline
- ✅ Carregamento automático de dados

## Uso Básico

### Tamanho Padrão (md)

```vue
<AtomsTickerEmbed ticker="PETR4" />
```

### Tamanho Pequeno (sm)

```vue
<AtomsTickerEmbed ticker="VALE3" size="sm" />
```

### Tamanho Grande (lg)

```vue
<AtomsTickerEmbed ticker="ITUB4" size="lg" />
```

### Sem Variação

```vue
<AtomsTickerEmbed ticker="BBDC4" :show-change="false" />
```

## Exemplos de Uso nos Guias

### 1. Lista de Tickers

```vue
<div class="flex flex-wrap gap-2">
  <AtomsTickerEmbed ticker="PETR4" />
  <AtomsTickerEmbed ticker="VALE3" />
  <AtomsTickerEmbed ticker="ITUB4" />
</div>
```

### 2. Dentro de Cards

```vue
<div class="rounded-xl border border-white/10 bg-white/5 p-4">
  <h4 class="mb-2 font-semibold">Setor Bancário</h4>
  <div class="flex flex-wrap gap-1.5">
    <AtomsTickerEmbed ticker="ITUB4" size="sm" />
    <AtomsTickerEmbed ticker="BBDC4" size="sm" />
    <AtomsTickerEmbed ticker="BBAS3" size="sm" />
  </div>
  <p class="text-sm text-gray-400">
    Principais bancos brasileiros
  </p>
</div>
```

### 3. Inline com Texto

```vue
<p class="leading-relaxed text-gray-300">
  Ao analisar <AtomsTickerEmbed ticker="PETR4" size="sm" />, é importante 
  considerar o preço do petróleo e comparar com 
  <AtomsTickerEmbed ticker="PRIO3" size="sm" />.
</p>
```

### 4. Destaque no Hero

```vue
<div class="flex items-center gap-2">
  <AtomsTickerEmbed ticker="PETR4" size="lg" />
  <span class="text-sm text-gray-400">Dados em tempo real</span>
</div>
```

## Propriedades

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `ticker` | `string` | - | Código do ticker (obrigatório) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do componente |
| `showChange` | `boolean` | `true` | Mostrar variação percentual |

## Tamanhos

- **sm**: Altura 24px (h-6) - Ideal para listas e inline
- **md**: Altura 28px (h-7) - Padrão balanceado
- **lg**: Altura 36px (h-9) - Destaque em títulos

## Comportamento

1. **Carregamento**: Ao montar, busca dados do ticker via API
2. **Loading**: Mostra "..." enquanto carrega
3. **Erro**: Se não encontrar, exibe apenas ticker e logo placeholder
4. **Link**: Clique redireciona para `/asset/[ticker]`
5. **Hover**: Destaque visual ao passar o mouse

## Cores da Variação

- 🟢 Verde (`text-green-400`): Variação positiva
- 🔴 Vermelho (`text-red-400`): Variação negativa
- ⚪ Branco/50 (`text-white/50`): Variação neutra (0%)

## Casos de Uso Recomendados

### ✅ Bom para:
- Mencionar ações em guias educacionais
- Comparar múltiplos tickers
- Destacar exemplos práticos
- Listas de recomendações
- Análises de setores

### ❌ Evitar:
- Texto corrido denso (quebra o fluxo)
- Mais de 10 tickers em sequência
- Contextos onde o link pode confundir

## Acessibilidade

- Link semântico com `NuxtLink`
- Alt text nas imagens de logo
- Cores com contraste adequado
- Hover states claros

## Performance

- Componente leve (~2KB)
- Carregamento assíncrono de dados
- Cache automático do Nuxt
- Lazy loading de imagens

## Troubleshooting

### Logo não aparece

**Possíveis causas:**
1. API não retornou campo `logo`
2. URL da imagem está quebrada
3. Erro de CORS

**Solução:**
- O componente mostra automaticamente um placeholder com as 2 primeiras letras
- Verifique no console do navegador se há erros de rede
- Logs de debug aparecem em modo desenvolvimento

### Variação não aparece

**Possíveis causas:**
1. API não retornou `change_percent` nem `change`
2. Valor é exatamente 0
3. `showChange` está como `false`

**Solução:**
- Verifique se a prop `showChange` está `true` (padrão)
- Confira logs no console (modo dev)
- API pode estar demorando, observe o estado de loading

### Debug Mode

Em desenvolvimento, o componente loga informações úteis:

```javascript
[TickerEmbed] Dados carregados para PETR4: {
  logo: "https://...",
  change: 1.23,
  change_percent: 1.23
}
```

### Testando Manualmente

Crie uma página de teste:

```vue
<template>
  <div class="p-8 space-y-4">
    <h1>Teste de Ticker Embeds</h1>
    
    <div class="flex gap-2">
      <AtomsTickerEmbed ticker="PETR4" size="sm" />
      <AtomsTickerEmbed ticker="VALE3" />
      <AtomsTickerEmbed ticker="ITUB4" size="lg" />
    </div>
    
    <div class="flex gap-2">
      <AtomsTickerEmbed ticker="INVALID" />
      <AtomsTickerEmbed ticker="TEST" :show-change="false" />
    </div>
  </div>
</template>
```

## API Requirements

O componente espera que `getTickerDetails(ticker)` retorne:

```typescript
{
  logo?: string,              // URL da imagem do logo
  change?: number,            // Variação absoluta
  change_percent?: number,    // Variação percentual (preferida)
  ticker?: string,
  stock?: string,
  // ... outros campos
}
```

## Exemplos Reais nos Guias

Veja exemplos implementados em:
- `/guias/como-investir-em-acoes-para-iniciantes` - Lista de exemplos
- `/guias/analise-petr4-vale-a-pena-investir` - Hero e comparação
- `/guias/calculadora-de-dividendos` - Setores de bons pagadores
