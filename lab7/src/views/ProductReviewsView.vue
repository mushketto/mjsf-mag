<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const reviews = computed(() =>
  Array.isArray(props.product.reviews) ? props.product.reviews : [],
)

function formatDate(rawDate) {
  const parsed = new Date(rawDate)
  return Number.isNaN(parsed.getTime()) ? rawDate : dateFormatter.format(parsed)
}
</script>

<template>
  <div class="product-reviews">
    <h2 class="product-overview__heading">Відгуки покупців</h2>

    <div v-if="!reviews.length" class="catalog__message">
      <p class="catalog__message-index">00 / REVIEWS</p>
      <h3 class="catalog__message-title">Відгуків поки немає</h3>
      <p class="catalog__message-text">
        Для цього товару ще не додано жодного відгуку.
      </p>
    </div>

    <ul v-else class="product-reviews__list">
      <li
        v-for="(review, index) in reviews"
        :key="`${review.reviewerEmail ?? review.reviewerName}-${index}`"
        class="product-reviews__item"
      >
        <div class="product-reviews__header">
          <strong class="product-reviews__author">{{ review.reviewerName }}</strong>
          <span class="product-reviews__rating">{{ review.rating }} / 5</span>
        </div>
        <p class="product-reviews__comment">{{ review.comment }}</p>
        <time class="product-reviews__date" :datetime="review.date">
          {{ formatDate(review.date) }}
        </time>
      </li>
    </ul>
  </div>
</template>