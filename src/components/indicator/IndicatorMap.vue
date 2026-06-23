<template>
  <div class="">
    <div class="flex justify-end">
      <div class="max-w-56">
        <div class="flex items-center justify-between gap-1">
          <span class="text-xs text-gray-500"><OTText value="MIN" /></span>
          <span class="text-xs text-gray-500">{{ name }}</span>
          <span class="text-xs text-gray-500"><OTText value="MAX" /></span>
        </div>
        <div class="mb-2 flex items-center justify-end gap-1">
          <span class="text-xs text-gray-500">{{
            number(extent[0], formatter.decimals, { abbr: true })
          }}</span>
          <LegendColor
            :color="colorScale"
            class="overflow-hidden rounded"
            :show-axis="false"
            :margin="{ top: 0, right: 0, bottom: 0, left: 0 }"
            :height="8"
          />
          <span class="text-xs text-gray-500">{{
            number(extent[1], formatter.decimals, { abbr: true })
          }}</span>
        </div>
      </div>
    </div>

    <div class="relative w-full">
      <BarcelonaMap
        class="h-full w-full overflow-hidden rounded-lg"
        :data="mapData"
        :selected="selected"
        :highlighted="highlighted"
        @select="emit('select', $event)"
        @hover="onMapHover"
        :no-data-color="colors.gray[100]"
        :color="colors.map[sdg]"
      />
      <LoadingSpinner
        :loading="loading"
        class="inset-0"
        bg-color-class="bg-white/50"
        :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
      />
    </div>

    <IndicatorTooltip :info="tooltip" :tooltip-data="tooltip.data" />
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useFormatter from "@/functions/useFormatter";
import useTooltip from "@/functions/useTooltip";
import colors from "@/utils/colors";
import { number } from "@/utils/filters";
import IndicatorTooltip from "./IndicatorTooltip.vue";

const props = defineProps({
  mapData: { type: Object, default: () => ({}) },
  extent: { type: Array, default: () => [0, 0] },
  colorScale: { type: Function, default: () => "#ccc" },
  highlighted: String,
  selected: String,
  loading: Boolean,
  // municipality codes in the current comarca — only these show a tooltip on hover
  municipalityComarcaCodes: { type: Array, default: () => [] },
  name: String,
});

const emit = defineEmits(["select"]);

const { sdg } = useFilters();
const { formatter } = useFormatter();
const [tooltip, toggleTooltip] = useTooltip();

function onMapHover(e) {
  if (!e || !props.municipalityComarcaCodes.includes(e.data.id)) {
    toggleTooltip(null);
  } else {
    toggleTooltip(e);
  }
}
</script>
