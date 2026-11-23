import { useAuthStore } from '../stores/auth.js'

const ALLOWED_REDIRECT_NAMES = new Set(['manage-products', 'manage-edit'])

export function resolveSafeRedirect(router, rawRedirect) {
  if (typeof rawRedirect !== 'string') {
    return { name: 'manage-products' }
  }

  const trimmed = rawRedirect.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return { name: 'manage-products' }
  }

  try {
    const resolved = router.resolve(trimmed)
    if (ALLOWED_REDIRECT_NAMES.has(resolved.name)) {
      return resolved.fullPath
    }
  } catch {
    return { name: 'manage-products' }
  }

  return { name: 'manage-products' }
}

export function installRouterGuards(router, pinia) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)
    await auth.restore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }
  })
}