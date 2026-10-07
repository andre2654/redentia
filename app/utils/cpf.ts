/**
 * CPF só no navegador. A página de conexão do cliente pede o CPF do titular
 * (como o Open Finance pede) e NUNCA o envia nem o guarda: estas funções
 * só mascaram e validam o que está no campo. Nada aqui toca rede, cookie,
 * localStorage ou useState.
 */

/** Só os dígitos, no máximo 11. */
export function cpfDigitos(v: string): string {
  return v.replace(/\D/g, '').slice(0, 11)
}

/** '000.000.000-00' progressivo, para digitar com a máscara aparecendo. */
export function mascararCpf(v: string): string {
  const d = cpfDigitos(v)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** 11 dígitos, não todos iguais e com os dois dígitos verificadores batendo. */
export function cpfValido(v: string): boolean {
  const d = cpfDigitos(v)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  const dv = (fatia: string, peso: number) => {
    let soma = 0
    for (const c of fatia) soma += Number(c) * peso--
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return dv(d.slice(0, 9), 10) === Number(d[9]) && dv(d.slice(0, 10), 11) === Number(d[10])
}
