# Glossário Financeiro - Redentia

Este diretório contém os dados e a estrutura do glossário financeiro da plataforma Redentia.

## 📁 Estrutura

```
app/data/glossario/
├── README.md          # Este arquivo
└── termos.ts          # Base de dados dos termos
```

## ✅ Implementação Atual

### Termos Implementados (15)

**Indicadores Financeiros (6)**:
- Dividend Yield (DY)
- P/L (Preço sobre Lucro)
- ROE (Return on Equity)
- EV/EBIT
- EBITDA
- P/VP (Preço sobre Valor Patrimonial)

**Fundos Imobiliários (2)**:
- FII (Fundos Imobiliários)
- Vacância

**Mercado (2)**:
- IFIX
- Ibovespa

**Estratégias (1)**:
- Buy and Hold

**Conceitos Gerais (4)**:
- Dividendos
- Liquidez
- Volatilidade
- Diversificação

## 🎯 Como Adicionar Novos Termos

### 1. Estrutura de um Termo

Cada termo segue a interface `TermoGlossario`:

```typescript
{
  slug: string              // URL amigável (ex: "dividend-yield")
  nome: string              // Nome do termo (ex: "Dividend Yield")
  categoria: CategoriaGlossario  // Ver categorias abaixo
  sigla?: string            // Sigla opcional (ex: "DY")
  definicaoResumida: string // 150-200 caracteres (para featured snippet)
  definicaoCompleta: string // 300-500 palavras
  formula?: string          // Fórmula de cálculo (opcional)
  exemplo?: string          // Exemplo prático (recomendado)
  comoUsar?: string         // Como usar na prática (opcional)
  atencao?: string          // Pontos de atenção (opcional)
  relacionados: string[]    // Array de slugs de termos relacionados
  palavrasChave: string[]   // Para busca interna
}
```

### 2. Categorias Disponíveis

- `indicador` - Indicadores Financeiros (P/L, ROE, etc.)
- `acao` - Ações e Bolsa
- `fii` - Fundos Imobiliários
- `renda-fixa` - Renda Fixa (Tesouro, CDB, etc.)
- `mercado` - Mercado (índices, bolsas)
- `estrategia` - Estratégias de investimento
- `geral` - Conceitos gerais

### 3. Exemplo Prático

```typescript
{
  slug: 'roic',
  nome: 'ROIC',
  sigla: 'ROIC',
  categoria: 'indicador',
  definicaoResumida:
    'ROIC (Return on Invested Capital) mede o retorno que a empresa gera sobre todo o capital investido (próprio e de terceiros). Indica a eficiência na alocação de capital.',
  definicaoCompleta: `O ROIC é um indicador que mostra quanto de retorno...
  
  **Por que é importante?**
  • Item 1
  • Item 2
  
  **Como interpretar:**
  • ROIC > WACC: empresa cria valor
  • ROIC < WACC: empresa destrói valor`,
  formula: 'ROIC = NOPAT ÷ Capital Investido',
  exemplo: 'Se uma empresa tem NOPAT de R$ 100 milhões...',
  atencao: 'Compare sempre com o WACC da empresa...',
  comoUsar: 'Use para identificar empresas que geram valor...',
  relacionados: ['roe', 'roa', 'wacc', 'nopat'],
  palavrasChave: ['roic', 'return on invested capital', 'retorno capital investido']
}
```

### 4. Boas Práticas

#### Definição Resumida (150-200 chars)
- Objetiva e clara
- Responde "O que é?"
- Otimizada para featured snippets do Google
- Sem jargões desnecessários

#### Definição Completa (300-500 palavras)
- Explique o conceito em detalhes
- Use subtítulos com ** ** (negrito)
- Use listas com • (bullet points)
- Inclua contexto prático
- Linguagem acessível mas precisa

#### Fórmula
- Use símbolos matemáticos simples
- Explique cada variável se necessário
- Formato limpo e legível

#### Exemplo
- Use valores realistas
- Seja específico (nome de empresas, valores em R$)
- Mostre o cálculo passo a passo

#### Termos Relacionados
- Inclua 3-7 termos relacionados
- Use os slugs corretos
- Crie uma rede de conhecimento

#### Palavras-Chave
- Variações do nome do termo
- Sinônimos
- Termos em inglês (se aplicável)
- Como as pessoas buscam no Google

## 🎨 SEO e Otimização

### Cada termo gera automaticamente:

1. **URL otimizada**: `/glossario/[slug]`
2. **Title**: "O que é [Termo]? Definição e Como Usar | Redentia"
3. **Meta Description**: Definição resumida
4. **Schema.org**:
   - DefinedTerm
   - FAQPage
   - BreadcrumbList

### Dicas de SEO:

- Use perguntas reais nas definições resumidas
- Responda "O que é", "Como calcular", "Para que serve"
- Inclua exemplos com valores do Brasil (R$, empresas BR)
- Link para termos relacionados (link juice interno)

## 📊 Próximos Termos a Adicionar

### Alta Prioridade (Alto Volume de Busca)

**Indicadores**:
- [ ] ROA
- [ ] ROIC
- [ ] P/EBIT
- [ ] P/EBITDA
- [ ] Margem Líquida
- [ ] Margem Bruta
- [ ] Margem EBITDA
- [ ] Dívida Líquida/EBITDA
- [ ] LPA (Lucro por Ação)
- [ ] VPA (Valor Patrimonial por Ação)

**Ações e Mercado**:
- [ ] IPO
- [ ] Blue Chips
- [ ] Small Caps
- [ ] Ações ON e PN
- [ ] Tag Along
- [ ] Free Float

**FIIs**:
- [ ] Cap Rate
- [ ] NOI (Net Operating Income)
- [ ] Fundos de Tijolo
- [ ] Fundos de Papel
- [ ] Come-Cotas

**Renda Fixa**:
- [ ] Tesouro Direto
- [ ] Tesouro Selic
- [ ] Tesouro IPCA
- [ ] CDB
- [ ] LCI/LCA
- [ ] Debêntures

**Estratégias**:
- [ ] Swing Trade
- [ ] Day Trade
- [ ] Stop Loss/Gain
- [ ] Alocação de Carteira
- [ ] Rebalanceamento

**Conceitos**:
- [ ] Risco
- [ ] Benchmarketing
- [ ] Beta
- [ ] Correlação
- [ ] Diversificação
- [ ] Hedge
- [ ] Alavancagem

## 🔄 Workflow de Adição

1. **Edite** `termos.ts`
2. **Adicione** o novo termo no array `termos`
3. **Teste localmente**: `bun run dev`
4. **Verifique**:
   - `/glossario` (termo aparece na lista?)
   - `/glossario/[slug]` (página individual funciona?)
   - Busca funciona?
   - Links relacionados funcionam?
5. **Commit** e deploy

## 📈 Métricas de Sucesso

- **+200 termos** no glossário
- **Tempo na página** > 2 minutos
- **Taxa de rejeição** < 40%
- **Featured snippets** no Google para termos principais
- **Backlinks** de outros sites financeiros

## 🛠 Manutenção

### Atualizar termos existentes:
- Revise definições trimestralmente
- Atualize exemplos com valores atuais
- Adicione novos termos relacionados
- Melhore SEO baseado em analytics

### Monitorar:
- Google Search Console: queries de glossário
- Google Analytics: páginas mais visitadas
- Hotjar: comportamento dos usuários
- Backlinks: quem está linkando para o glossário

## 💡 Ideias Futuras

- [ ] Quiz interativo por categoria
- [ ] Vídeos explicativos (YouTube embeds)
- [ ] Calculadoras embutidas nos termos
- [ ] Download de e-book do glossário completo
- [ ] Versão em PDF para impressão
- [ ] Widget de "Termo do Dia" compartilhável
- [ ] API pública do glossário
