<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="product-overview">
    <h2 class="product-overview__heading">Опис товару</h2>
    <p class="product-overview__description">{{ product.description }}</p>

    <h3 class="product-overview__subheading">Характеристики</h3>
    <dl class="product-specs">
      <div v-if="product.brand" class="product-specs__row">
        <dt class="product-specs__term">Бренд</dt>
        <dd class="product-specs__value">{{ product.brand }}</dd>
      </div>
      <div v-if="product.sku" class="product-specs__row">
        <dt class="product-specs__term">Артикул (SKU)</dt>
        <dd class="product-specs__value">{{ product.sku }}</dd>
      </div>
      <div class="product-specs__row">
        <dt class="product-specs__term">Категорія</dt>
        <dd class="product-specs__value">{{ product.category }}</dd>
      </div>
      <div v-if="product.weight" class="product-specs__row">
        <dt class="product-specs__term">Вага</dt>
        <dd class="product-specs__value">{{ product.weight }} од.</dd>
      </div>
      <div v-if="product.warrantyInformation" class="product-specs__row">
        <dt class="product-specs__term">Гарантія</dt>
        <dd class="product-specs__value">{{ product.warrantyInformation }}</dd>
      </div>
      <div v-if="product.shippingInformation" class="product-specs__row">
        <dt class="product-specs__term">Доставка</dt>
        <dd class="product-specs__value">{{ product.shippingInformation }}</dd>
      </div>
      <div v-if="product.returnPolicy" class="product-specs__row">
        <dt class="product-specs__term">Повернення</dt>
        <dd class="product-specs__value">{{ product.returnPolicy }}</dd>
      </div>
    </dl>
  </div>
</template>