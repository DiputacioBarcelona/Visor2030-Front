<template>
  <div class="mb-16">
    <div class="top-[56px] z-20 bg-white py-2 md:sticky print:hidden">
      <div class="ot-container">
        <div class="mb-1 text-xs text-main-100">
          <OTText value="CONSULTEU_CAPES_INFO" />
        </div>
        <div class="flex flex-wrap gap-2">
          <RouterLink
            to="#points"
            class="ot-btn gap-2 border-none bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 md:px-6 md:py-2 md:text-sm"
          >
            <OTText value="POINTS_BY_SDG" />
          </RouterLink>
        </div>
      </div>
    </div>

    <RoseChartSection endpoint="getSyntheticAggregationValues" />
  </div>
</template>

<script setup>
const data = inject("entity");

useHead({
  title: () => `${data.value?.name}`,
});
</script>
