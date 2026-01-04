# CtaSection Component - Guia de Uso

## Visão Geral

O componente `MoleculesCtaSection` é um componente reutilizável para criar seções de Call-to-Action (CTA) padronizadas em todo o site, garantindo consistência visual e facilitando manutenção.

## Características

- ✅ Design padronizado com background glassmorphism
- ✅ Suporte a múltiplos botões (1-3 recomendado)
- ✅ 3 variantes de botão (primary, outline, ghost)
- ✅ Animações consistentes com a home
- ✅ Responsivo e adaptável
- ✅ Centralizado e fácil de manter

## Props

### `title` (string, obrigatório)
Título principal do CTA em negrito e branco

### `description` (string, obrigatório)
Descrição/subtítulo em cinza abaixo do título

### `buttons` (array, obrigatório)
Array de objetos de botão com a seguinte estrutura:

```typescript
interface CtaButton {
  label: string        // Texto do botão
  to: string          // URL/rota de destino
  icon?: string       // Ícone do Lucide (opcional)
  variant?: 'primary' | 'outline' | 'ghost'  // Estilo do botão
}
```

## Variantes de Botão

### `primary` (Verde Secondary)
- Cor verde brilhante
- Efeito de escala 110% no hover
- Sombra verde brilhante
- **Uso:** Ação principal/mais importante

### `outline` (Branco com Borda)
- Borda branca sem preenchimento
- Efeito de escala 110% no hover
- Sombra verde brilhante
- **Uso:** Ação secundária importante

### `ghost` (Branco Transparente)
- Texto branco sem borda
- Efeito de escala 110% no hover
- Sem sombra (mais sutil)
- **Uso:** Ação terciária/link relacionado

## Exemplos de Uso

### Exemplo 1: CTA Simples (1 botão)

```vue
<MoleculesCtaSection
  title="Comece Agora"
  description="Cadastre-se gratuitamente e comece a investir hoje mesmo"
  :buttons="[
    { label: 'Criar Conta', to: '/auth/register', icon: 'i-lucide-user-plus', variant: 'primary' }
  ]"
/>
```

### Exemplo 2: CTA Padrão (3 botões)

```vue
<MoleculesCtaSection
  title="Use as Ferramentas da Redentia"
  description="Encontre as melhores ações e tome decisões informadas"
  :buttons="[
    { label: 'Buscar Ações', to: '/search?group=stocks', icon: 'i-lucide-search', variant: 'primary' },
    { label: 'Calculadoras', to: '/calculadora', icon: 'i-lucide-calculator', variant: 'outline' },
    { label: 'Glossário', to: '/glossario', icon: 'i-lucide-book-open', variant: 'ghost' }
  ]"
/>
```

### Exemplo 3: Sem Ícones

```vue
<MoleculesCtaSection
  title="Continue Aprendendo"
  description="Explore mais conteúdo educacional"
  :buttons="[
    { label: 'Próximo Guia', to: '/guias/proximo', variant: 'primary' },
    { label: 'Voltar ao Índice', to: '/guias', variant: 'outline' }
  ]"
/>
```

### Exemplo 4: Dois Botões

```vue
<MoleculesCtaSection
  title="Analise seus Investimentos"
  description="Ferramentas completas para acompanhar sua carteira"
  :buttons="[
    { label: 'Minha Carteira', to: '/wallet', icon: 'i-lucide-wallet', variant: 'primary' },
    { label: 'Ver Todas as Ações', to: '/acoes', icon: 'i-lucide-trending-up', variant: 'outline' }
  ]"
/>
```

## Ícones Disponíveis

Todos os ícones do Lucide Icons são suportados. Alguns exemplos:

- `i-lucide-search` - Buscar
- `i-lucide-trending-up` - Ações
- `i-lucide-building-2` - FIIs
- `i-lucide-calculator` - Calculadora
- `i-lucide-coins` - Dividendos
- `i-lucide-book-open` - Guias/Glossário
- `i-lucide-chart-line` - Análise
- `i-lucide-rocket` - Small Caps
- `i-lucide-user-plus` - Cadastro
- `i-lucide-wallet` - Carteira

[Lista completa de ícones Lucide](https://lucide.dev/icons/)

## Boas Práticas

### ✅ Faça

- Use 1-3 botões (ideal: 3)
- Mantenha hierarquia: primary → outline → ghost
- Textos curtos e objetivos nos botões
- Descrição clara e concisa (1-2 linhas)
- Ícones relevantes que complementam o texto

### ❌ Evite

- Mais de 4 botões (poluição visual)
- Textos muito longos nos botões
- Múltiplos botões primary (apenas 1)
- Descrições muito extensas
- Ícones que não fazem sentido com o contexto

## Onde Usar

### Páginas que JÁ usam:

1. ✅ `/guias/index.vue`
2. ✅ `/guias/como-investir-em-acoes-para-iniciantes.vue`
3. ✅ `/guias/melhores-fiis-para-investir-em-2026.vue`
4. ✅ `/guias/calculadora-de-dividendos.vue`
5. ✅ `/guias/analise-petr4-vale-a-pena-investir.vue`
6. ✅ `/guias/small-caps-guia-completo.vue`
7. ✅ `/acoes.vue`

### Oportunidades de uso:

- `/fiis.vue` - CTA para explorar FIIs
- `/etfs.vue` - CTA para ETFs
- `/dividendos.vue` - CTA para dividendos
- `/small-caps.vue` - CTA para small caps
- Páginas estáticas em `/redentia/`
- Qualquer landing page ou página de categoria

## Anatomia do Componente

```
┌────────────────────────────────────┐
│  Glassmorphism Background          │
│  ┌──────────────────────────────┐  │
│  │      📝 Título (h2)          │  │
│  │   Descrição (p, gray-300)    │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Btn 1│ │ Btn 2│ │ Btn 3│      │
│  │Primary│ │Outline│ │Ghost│      │
│  └──────┘ └──────┘ └──────┘      │
└────────────────────────────────────┘
```

## Customização

Se precisar de variações específicas, você pode:

1. **Adicionar classes adicionais:**
   ```vue
   <MoleculesCtaSection
     class="mt-12"
     title="..."
     description="..."
     :buttons="[...]"
   />
   ```

2. **Criar wrapper customizado:**
   ```vue
   <div class="custom-wrapper">
     <MoleculesCtaSection ... />
   </div>
   ```

## Manutenção

Para alterar o design global dos CTAs, edite apenas:

📁 `/app/components/molecules/CtaSection.vue`

Mudanças se aplicarão automaticamente a todos os CTAs do site! 🎉

## Acessibilidade

- ✅ Semântica HTML correta (`h2`, `p`)
- ✅ Links acessíveis via `NuxtLink`
- ✅ Contraste adequado (WCAG AA)
- ✅ Navegação por teclado
- ✅ Animações respeitam `prefers-reduced-motion`

## Performance

- ✅ Componente leve (~1KB)
- ✅ Renderização rápida
- ✅ Transitions otimizadas com GPU
- ✅ Sem dependências extras
