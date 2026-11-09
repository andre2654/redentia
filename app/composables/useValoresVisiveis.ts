/**
 * O olho do topo do Agora no site (31/10/2026): a home e a /carteira. Os
 * valores em R$ abrem escondidos, como nos apps, e o "mostrar" vale só para a
 * visita (decisão do dono): fica no sessionStorage da aba e some quando ela
 * fecha. A porcentagem nunca se esconde.
 *
 * Um olho só para todos os R$ da tela: o R$ do dia dividido pelo % do dia dá o
 * patrimônio, então um valor à mostra entrega os outros.
 *
 * O useHiddenValues é outro olho, o dos detalhes da /carteira (revelado por
 * padrão, guardado no aparelho); os dois não se misturam.
 */
const CHAVE = 'redentia:valores-visiveis'

export function useValoresVisiveis() {
  const visiveis = useState('agora:valores-visiveis', () => false)

  // chame no setup antes de qualquer await, senão o onMounted não registra
  onMounted(() => {
    try {
      if (sessionStorage.getItem(CHAVE) === '1') visiveis.value = true
    } catch { /* storage bloqueado: segue escondido */ }
  })

  function alternar() {
    visiveis.value = !visiveis.value
    try {
      if (visiveis.value) sessionStorage.setItem(CHAVE, '1')
      else sessionStorage.removeItem(CHAVE)
    } catch { /* storage bloqueado: só não lembra */ }
  }

  return { visiveis, alternar }
}
