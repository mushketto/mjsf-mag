import { readonly, ref, toValue, watch } from 'vue'

export function useDebouncedValue(source, delay = 400) {
  const debounced = ref(toValue(source))

  watch(
    () => toValue(source),
    (nextValue, _previousValue, onCleanup) => {
      const timerId = setTimeout(() => {
        debounced.value = nextValue
      }, delay)

      onCleanup(() => {
        clearTimeout(timerId)
      })
    },
  )

  return readonly(debounced)
}