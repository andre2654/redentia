/**
 * Liga o tema da Redentia (B2B) na página: põe .marca-redentia no <body>, e o
 * tema-redentia.css devolve cada token que a Aportou mudou ao valor de antes
 * (azul, navy, creme, Plus Jakarta Sans). Fica no <body>, e não num wrapper,
 * porque modal e folha são teleportados para fora do layout.
 *
 * Quem chama: os layouts business e jantar, e as páginas de escritório que
 * rodam sem layout (cadastro e convite do Business, acesso do cliente).
 */
export function useMarcaRedentia() {
  useHead({ bodyAttrs: { class: 'marca-redentia' } })
}
