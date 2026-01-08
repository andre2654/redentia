# Sistema de Notificações no Footer

## Mudança Implementada

Removido o **modal automático** de notificações que aparecia ao entrar no site e substituído por um **CTA discreto no footer** que só aparece quando necessário.

## Comportamento

### ❌ Antes
- Modal/toast aparecia automaticamente ao abrir o site
- Bloqueava parte da tela
- Podia ser intrusivo para usuários

### ✅ Agora
- **Sem modal automático** - experiência limpa
- **CTA no footer** - visível mas não intrusivo
- **Condicional inteligente** - só aparece quando faz sentido

## Condições para Mostrar o CTA

O CTA de notificações no footer **só aparece** quando:

1. ✅ Usuário está no **app instalado** (PWA)
2. ✅ Permissão de notificações ainda **não foi concedida** (`status === 'default'`)

**Se ambas condições forem verdadeiras:**
```
┌──────────────────────────────────────────────────┐
│ 🔔 Ativar notificações                          │
│    Receba alertas de mercado e dividendos       │
│                        [Ativar agora] ←─────────┤
└──────────────────────────────────────────────────┘
```

**Caso contrário:**
- Footer normal sem CTA (não aparece nada)

## Localização

**Arquivo:** [`app/components/footer.vue`](app/components/footer.vue)

**Posição:** Topo do footer, antes da seção "Termos do Mercado"

## Lógica Implementada

```typescript
// Verifica se está no app instalado
const isAppInstalled = computed(() => {
  const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches
  const iosStandalone = (window.navigator as any).standalone === true
  return standalone || iosStandalone
})

// Mostra CTA apenas se necessário
const showNotificationCta = computed(() => {
  return isAppInstalled.value && permissionStatus.value === 'default'
})
```

## Design do CTA

### Visual
- Background: `from-secondary/10 to-secondary/5` (verde sutil)
- Ícone: 🔔 Bell (48×48px)
- Botão: Verde secondary com hover effect
- Layout: Horizontal (desktop) / Vertical (mobile)

### Responsividade
- **Desktop:** Ícone + texto à esquerda, botão à direita
- **Mobile:** Stack vertical, botão full-width

## Quando o CTA Desaparece

O CTA some automaticamente quando:
1. Usuário clica em "Ativar agora" e concede permissão
2. Usuário fecha o app e abre fora do PWA (navegador)
3. Permissão já foi concedida anteriormente

## Benefícios

1. **Menos Intrusivo** ✅
   - Não bloqueia conteúdo
   - Não interrompe navegação
   - Usuário decide quando interagir

2. **Contexto Adequado** ✅
   - Só aparece no app (onde faz sentido)
   - Só aparece se necessário
   - Desaparece após ativação

3. **UX Melhorada** ✅
   - Experiência mais limpa
   - Sem popups intrusivos
   - CTA visível mas discreto

4. **Performance** ✅
   - Sem toast library carregando
   - Menos JavaScript executando
   - Footer condicional leve

## Código Removido

### app.vue
Removido:
- Import do `useToast()`
- Lógica do toast automático
- Listener do permissionStatus

### main.css
Removido:
- Regras CSS específicas para toast
- Overrides de background
- Customizações de cores

## Teste Manual

Para testar o CTA:

1. Instale o PWA da Redentia
2. Abra o app instalado
3. Se não concedeu notificações, veja o CTA no footer
4. Clique em "Ativar agora"
5. Conceda permissão
6. CTA desaparece automaticamente

## Manutenção Futura

Para ajustar o CTA de notificações, edite apenas:

**Arquivo:** [`app/components/footer.vue`](app/components/footer.vue)

- Texto/visual: Linhas 3-33 (template)
- Lógica: Linhas 88-114 (script)
