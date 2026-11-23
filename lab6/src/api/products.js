export const API_LIMIT = 12
export const API_DELAY = 1500
export const PRODUCT_DELAY = 800

const BASE_URL = 'https://dummyjson.com'
const POSITIVE_INT_RE = /^[1-9]\d*$/

export function isValidProductId(id) {
  return typeof id === 'string' && POSITIVE_INT_RE.test(id)
}

export function createProductsUrl(query = '', skip = 0) {
  const normalizedQuery = String(query ?? '').trim()
  const params = new URLSearchParams({
    limit: String(API_LIMIT),
    skip: String(skip),
    delay: String(API_DELAY),
  })

  if (normalizedQuery) {
    params.set('q', normalizedQuery)
    return `${BASE_URL}/products/search?${params.toString()}`
  }

  return `${BASE_URL}/products?${params.toString()}`
}

export function createProductUrl(id) {
  if (!isValidProductId(String(id ?? ''))) {
    return null
  }

  const params = new URLSearchParams({
    delay: String(PRODUCT_DELAY),
  })

  return `${BASE_URL}/products/${id}?${params.toString()}`
}