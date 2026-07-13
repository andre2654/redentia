/**
 * Seguir / deixar de seguir uma tese — persiste em `/thesis-favorites`
 * (auth:sanctum, cross-device; contrato do ThesisFavoriteController: GET lista
 * slugs, POST {slug} faz upsert idempotente, DELETE {slug} remove).
 *
 * A página da tese é pública e SSR-first, então o estado inicial é hidratado no
 * CLIENT (só quando logado) — nada bloqueia o SSR nem vaza favorito no HTML
 * cacheado. O toggle é OTIMISTA (flip imediato) com revert se o backend falhar;
 * anônimo → /login preservando o destino. A Home já LÊ esses favoritos (PR7),
 * então seguir aqui aparece lá na próxima visita.
 */
export function useThesisFollow(slug: MaybeRefOrGetter<string>) {
  const { isAuthenticated } = useAuthState()
  const { authFetch } = useApi()

  const following = ref(false)
  const pending = ref(false)

  async function hydrate() {
    if (!isAuthenticated.value) return
    try {
      // redirectOnAuthError:false — página pública: token expirado limpa a
      // sessão em silêncio, não pode expulsar o visitante pro /login.
      const res = await authFetch<{ favorites: string[] }>('/thesis-favorites', {}, { redirectOnAuthError: false })
      following.value = (res?.favorites ?? []).includes(toValue(slug))
    } catch {
      /* silencioso: sem confirmação, o botão fica em 'Acompanhar' (nunca falso-positivo) */
    }
  }

  async function toggle() {
    const s = toValue(slug)
    if (!isAuthenticated.value) {
      navigateTo(`/login?redirect=${encodeURIComponent(`/tese/${s}`)}`)
      return
    }
    if (pending.value) return
    const prev = following.value
    following.value = !prev // otimista
    pending.value = true
    try {
      if (prev) {
        await authFetch(`/thesis-favorites/${encodeURIComponent(s)}`, { method: 'DELETE' })
      } else {
        await authFetch('/thesis-favorites', { method: 'POST', body: { slug: s } })
      }
    } catch {
      following.value = prev // revert em erro (401/403 já cai pro login pelo useApi)
    } finally {
      pending.value = false
    }
  }

  onMounted(hydrate)
  return { following, pending, toggle }
}
