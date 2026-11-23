import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'

export function useIntersectionObserver(target, callback, options = {}) {
  let observer = null
  let stopWatch = null

  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry)
        }
      }
    }, options)

    stopWatch = watch(
      () => toValue(target),
      (nextElement, previousElement) => {
        if (previousElement && observer) {
          observer.unobserve(previousElement)
        }
        if (nextElement && observer) {
          observer.observe(nextElement)
        }
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    if (stopWatch) {
      stopWatch()
      stopWatch = null
    }
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })
}