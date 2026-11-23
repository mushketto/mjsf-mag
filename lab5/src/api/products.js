export const API_LIMIT = 12
export const API_DELAY = 1500

const BASE_URL = 'https://dummyjson.com'

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