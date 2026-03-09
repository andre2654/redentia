/**
 * Persists the `?brand=` query param across all client-side navigations.
 *
 * When a user is on `/?brand=me-poupe` and clicks <NuxtLink to="/carteira">,
 * this guard ensures the target becomes `/carteira?brand=me-poupe`.
 *
 * When migrating to tenants: delete this file entirely.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to, from) => {
    const currentBrand = from.query.brand as string | undefined
    if (!currentBrand) return // No brand active — nothing to do
    if (to.query.brand) return // Already has brand param — don't override

    return {
      ...to,
      query: { ...to.query, brand: currentBrand },
      replace: true,
    }
  })
})
