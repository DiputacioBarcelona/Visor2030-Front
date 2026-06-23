<template>
  <div class="flex flex-col">
    <label class="ot-label"><OTText value="TIPUS_GRAFIC" /></label>
    <ButtonSwitchDibarometre
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      @hover="toggleTooltip"
      class="bg-grey-fosc inline-flex rounded !p-0 text-text-light"
      item-class="flex-grow text-center transition font-medium py-2 px-7 bg-transparent focus:outline-none truncate sm:overflow-visible w-auto rounded whitespace-nowrap z-20 ot-ring first:rounded-l-full last:rounded-r-full  focus-visible:ring-main-80/50 focus-visible:ring-4 focus-visible:ring-offset-0 bg-grey-fosc"
      item-active-class="text-white ring-transparent ring-0"
      :slider-class="
        options.findIndex((e) => e.id === modelValue) === 0
          ? 'absolute text-white inset-y-0 my-0 bg-main-80 rounded-l ease-out transition-all'
          : 'absolute text-white inset-y-0 my-0 bg-main-80 rounded-r ease-out transition-all'
      "
      item-inactive-class=""
      inner-container-class="gap-1"
    />
    <OTTooltip small :info="tooltip" class="text-grey">
      <div v-if="tooltip.data.name === 'grouped'">
        veure com barres apilades
      </div>
      <div v-if="tooltip.data.name === 'separate'">
        veure com barres independents
      </div>
      <div v-if="tooltip.data.name === 'barchart'">
        veure valor mitjà com barres
      </div>
      <div v-if="tooltip.data.name === 'heatmap'">
        veure distribució com mapa de calor
      </div>
    </OTTooltip>
  </div>
</template>

<script setup>
import ButtonSwitchDibarometre from "./ButtonSwitchDibarometre.vue";

import useTooltip from "@/functions/useTooltip";

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

const [tooltip, toggleTooltip] = useTooltip();
</script>

<style lang="scss" scoped></style>
