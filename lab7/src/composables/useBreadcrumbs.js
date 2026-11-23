import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs(productTitle = null) {
  const route = useRoute()

  return computed(() => {
    const preservedQuery =
      typeof route.query.q === 'string' && route.query.q.trim()
        ? { q: route.query.q.trim() }
        : {}

    const items = []

    for (const record of route.matched) {
      const crumb = record.meta?.breadcrumb
      if (!crumb) {
        continue
      }

      let label = crumb.label
      if (crumb.dynamic === 'product' || crumb.dynamic === 'manage-product') {
        const resolvedTitle = toValue(productTitle)
        label = resolvedTitle || `Товар №${route.params.id}`
      }

      const to = { name: crumb.name }

      if (
        (crumb.name === 'product-overview' ||
          crumb.name === 'product-reviews' ||
          crumb.name === 'manage-edit') &&
        route.params.id
      ) {
        to.params = { id: route.params.id }
      }

      if (
        (crumb.name === 'products' ||
          crumb.name === 'product-overview' ||
          crumb.name === 'product-reviews') &&
        Object.keys(preservedQuery).length > 0
      ) {
        to.query = preservedQuery
      }

      items.push({ label, to })
    }

    return items
  })
}