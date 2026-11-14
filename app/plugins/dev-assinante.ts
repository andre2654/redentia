/**
 * Só no `nuxi dev` (o build de produção corta tudo): `?dev-assinante=1` liga
 * o modo "como se eu assinasse" para testar o chat e a carteira de assinante
 * sem cobrança de verdade; `?dev-assinante=0` desliga. Fica num cookie para o
 * SSR enxergar igual ao navegador. Quem lê é useAssinatura (comoAssinanteNoDev).
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return
  const q = useRequestURL().searchParams.get('dev-assinante')
  if (q !== '1' && q !== '0') return
  useCookie('nu-dev-assinante', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' }).value = q === '1' ? '1' : null
})
