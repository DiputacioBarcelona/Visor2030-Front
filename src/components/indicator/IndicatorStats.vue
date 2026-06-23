<template>
  <div class="mt-9 space-y-4 lg:space-y-5 xl:space-y-8">
    <!-- Current value -->
    <div>
      <div class="mb-1 text-sm tracking-wide text-gray-500">
        {{ primaryLabel }}
        <span v-if="primaryData.year"> ({{ primaryData.year }})</span>
      </div>
      <div class="relative text-3xl font-semibold">
        <div v-if="primaryData.year">
          <template v-if="formatter.textFormat"
            ><OTText :value="formatter.textFormat(primaryData)" /></template
          ><template v-else>{{
            number(calculator(primaryData), formatter.decimals)
          }}</template
          >&#8239;<span class="text-xl"
            ><OTText
              :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
          /></span>
        </div>
        <div v-else-if="sdg === 14 && !municipisWithCoast.includes(entityId)">
          <OTText value="NA" />
        </div>
        <div v-else><OTText value="ND" /></div>
        <LoadingSpinner
          :loading="loading"
          class="inset-0"
          bg-color-class="bg-white/50"
          :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
        />
      </div>
      <hr class="mt-4 border-gray-200 lg:mt-5 xl:mt-7" />
    </div>

    <!-- Previous year -->
    <div>
      <div class="mb-1 text-sm tracking-wide text-gray-500">
        <OTText value="PREVIOUS_YEAR" />
        <span v-if="previousData.year"> ({{ previousData.year }})</span>
      </div>
      <div class="relative text-xl font-semibold">
        <div v-if="previousData.year">
          <template v-if="formatter.textFormat"
            ><OTText :value="formatter.textFormat(previousData)" /></template
          ><template v-else>{{
            number(calculator(previousData), formatter.decimals)
          }}</template
          >&#8239;<span class="text-base"
            ><OTText
              :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
          /></span>
        </div>
        <div v-else-if="sdg === 14 && !municipisWithCoast.includes(entityId)">
          <OTText value="NA" />
        </div>
        <div v-else><OTText value="ND" /></div>
        <LoadingSpinner
          :loading="loading"
          class="inset-0"
          bg-color-class="bg-white/50"
          :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
        />
      </div>
      <hr class="mt-4 border-gray-200 lg:mt-5 xl:mt-7" />
    </div>

    <!-- Flexible comparisons (comarca, province, etc.) -->
    <div v-for="comparison in comparisons" :key="comparison.label">
      <div class="mb-1 text-sm tracking-wide text-gray-500">
        {{ comparison.label }}
        <span v-if="comparison.data?.year"> ({{ comparison.data.year }})</span>
      </div>
      <div class="relative text-xl font-semibold">
        <div v-if="comparison.data?.year">
          <template v-if="formatter.textFormat"
            ><OTText :value="formatter.textFormat(comparison.data)" /></template
          ><template v-else>{{
            number(calculator(comparison.data), formatter.decimals)
          }}</template
          >&#8239;<span class="text-base"
            ><OTText
              :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
          /></span>
        </div>
        <div v-else-if="sdg === 14 && !municipisWithCoast.includes(entityId)">
          <OTText value="NA" />
        </div>
        <div v-else><OTText value="ND" /></div>
        <LoadingSpinner
          :loading="comparison.loading ?? false"
          class="inset-0"
          bg-color-class="bg-white/50"
          :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
        />
      </div>
      <hr class="mt-4 border-gray-200 lg:mt-5 xl:mt-7" />
    </div>
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useFormatter from "@/functions/useFormatter";
import { number } from "@/utils/filters";
import { municipisWithCoast } from "@/utils/helpers";

const props = defineProps({
  primaryLabel: String,
  primaryData: { type: Object, default: () => ({}) },
  previousData: { type: Object, default: () => ({}) },
  // [{ label: String, data: Object, loading?: Boolean }]
  comparisons: { type: Array, default: () => [] },
  loading: Boolean,
  // used for SDG 14 coastal exception
  entityId: String,
});

const { pieces, sdg } = useFilters();
const { formatter, calculator } = useFormatter();
</script>
