const INTEGER_PATTERN = /^\d+$/

export function createProductDraft(product) {
  return {
    title: String(product?.title ?? ''),
    price: product?.price != null ? String(product.price) : '',
    stock: product?.stock != null ? String(product.stock) : '',
    description: String(product?.description ?? ''),
  }
}

export function isDraftDirty(draft, initialDraft) {
  if (!draft || !initialDraft) {
    return false
  }

  return (
    draft.title !== initialDraft.title ||
    String(draft.price) !== String(initialDraft.price) ||
    String(draft.stock) !== String(initialDraft.stock) ||
    draft.description !== initialDraft.description
  )
}

export function validateProductDraft(draft) {
  const errors = {}

  const title = String(draft.title ?? '').trim()
  if (title.length < 1 || title.length > 120) {
    errors.title = 'Назва має містити від 1 до 120 символів.'
  }

  const rawPrice = String(draft.price ?? '').trim().replace(',', '.')
  const parsedPrice = Number(rawPrice)
  if (rawPrice === '' || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    errors.price = 'Ціна має бути додатним скінченним числом.'
  }

  const rawStock = String(draft.stock ?? '').trim()
  const parsedStock = Number(rawStock)
  if (
    rawStock === '' ||
    !INTEGER_PATTERN.test(rawStock) ||
    !Number.isInteger(parsedStock) ||
    parsedStock < 0
  ) {
    errors.stock = 'Залишок має бути цілим невід’ємним числом.'
  }

  const description = String(draft.description ?? '').trim()
  if (description.length < 1 || description.length > 2000) {
    errors.description = 'Опис має містити від 1 до 2000 символів.'
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    errors,
    normalized: isValid
      ? {
          title,
          price: parsedPrice,
          stock: parsedStock,
          description,
        }
      : null,
  }
}