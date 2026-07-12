/**
 * Estado global "valores ocultos" (NuHiddenValuesState do spec da Home):
 * o toggle-olho do hero mascara TODO valor monetário da página — patrimônio
 * ('R$ ••••••'), badge do dia ('+R$ •• hoje'), posições/alocação ('R$ ••••'),
 * pill e tooltip do gráfico e o card Reinvestir.
 *
 * Persistência em localStorage (contrato do spec). GOTCHA de hidratação:
 * localStorage não existe no SSR, então o server SEMPRE renderiza revelado e a
 * preferência é aplicada num watcher pós-mount — mesmo trade-off do color mode
 * sem cookie; aceito porque a máscara é anti-shoulder-surfing, não segurança.
 */
const KEY = 'nu:hidden-values'

export function useHiddenValues() {
  const hidden = useState('nu:hidden-values', () => false)

  if (import.meta.client) {
    // 1× por sessão de client: hidrata a preferência salva.
    const booted = useState('nu:hidden-values-booted', () => false)
    if (!booted.value) {
      booted.value = true
      onMounted(() => {
        try {
          hidden.value = localStorage.getItem(KEY) === '1'
        } catch { /* storage bloqueado — segue revelado */ }
      })
    }
  }

  function toggle() {
    hidden.value = !hidden.value
    if (import.meta.client) {
      try {
        localStorage.setItem(KEY, hidden.value ? '1' : '0')
      } catch { /* storage bloqueado — só não persiste */ }
    }
  }

  /** máscara padrão dos cards ('R$ ••••') e do patrimônio ('R$ ••••••'). */
  const mask = (value: string, dots = 4) => (hidden.value ? `R$ ${'•'.repeat(dots)}` : value)

  return { hidden, toggle, mask }
}
