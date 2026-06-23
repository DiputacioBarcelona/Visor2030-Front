<template>
  <div class="mt-8">
    <div class="mb-4 flex items-center justify-between gap-4 text-sm">
      <div class="tracking-wide">
        <OTText value="EVOLUCIO" />&nbsp;
        <span class="font-bold">
          <OTText
            :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.TITLE`"
          />
        </span>
      </div>
      <div class="flex items-center gap-2">
        <DownloadCSVButton :data="downloadData" :filename="downloadFilename" />
        <DownloadImageButton
          element-id="indicator-line-chart"
          :filename="downloadFilename"
        />
      </div>
    </div>

    <div class="-ml-2 -mr-4">
      <ImageWrapper id="indicator-line-chart">
        <div class="relative overflow-hidden p-4">
          <div class="-ml-3 mb-4 flex items-center gap-1 text-xs">
            <ArrowUpIcon class="h-4 w-4" />
            <OTText
              :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
            />
          </div>
          <LineChart
            v-if="dataAvailable"
            :data="lineChartData"
            class="-ml-[30px] -mr-[15px] -mt-[4px] h-48"
            xAxisStyle
            :x-filter="xFilter"
            yAxisStyle
            :showAllXTicks="showAllXTicks"
            showYGrid
            :force-zero="fullIndicatorId !== '13.1.1'"
            :range="fullIndicatorId === '13.1.1' ? [1, 4] : null"
            :num-ticks="fullIndicatorId === '13.1.1' ? 4 : 3"
            :format="fullIndicatorId === '13.1.1' ? ordinalFormat : undefined"
            :margin="{ top: 4, right: 15, bottom: 18, left: 30 }"
            :padding="{ top: 0, right: 0, bottom: 0, left: 7 }"
            :hover-num="hoverNum"
            @hover="onHover"
            :color="chartColors"
            :dataset-stroke-dasharray="dashArray"
            id-label="linechart"
          />
          <div
            v-if="!dataAvailable && !loading"
            class="flex h-48 items-center justify-center"
          >
            <div
              v-if="
                entityType === 'municipi' &&
                sdg === 14 &&
                !municipisWithCoast.includes(entityId)
              "
            >
              <OTText value="MUN_NOT_SEA" />
            </div>
            <div v-else><OTText :value="noDataKey" /></div>
          </div>
          <LoadingSpinner
            :loading="loading"
            class="inset-0"
            bg-color-class="bg-white/50"
            :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
          />
        </div>
      </ImageWrapper>

      <!-- linechart legend -->
      <!-- border-sdg-1 border-sdg-2 border-sdg-3 border-sdg-4 border-sdg-5 border-sdg-6 border-sdg-7 border-sdg-8 border-sdg-9 border-sdg-10 border-sdg-11 border-sdg-12 border-sdg-13 border-sdg-14 border-sdg-15 border-sdg-16 border-sdg-17 -->
      <div class="mr-4 flex items-center justify-end gap-8 text-xs">
        <div class="inline-flex items-center gap-2">
          <div class="w-6 border-t-2" :class="`border-sdg-${sdg}`"></div>
          {{ entityName }}
        </div>
        <template
          v-for="(comparison, i) in comparisons"
          :key="comparison.label"
        >
          <div
            v-if="lineChartData[i + 1]?.length"
            class="inline-flex items-center gap-2"
          >
            <div
              class="w-6 border-t-2 border-gray-400"
              :class="comparison.legendClass"
            ></div>
            {{ comparison.label }}
          </div>
        </template>
      </div>
    </div>

    <IndicatorTooltip
      ref="tooltipEl"
      :info="tooltip"
      :tooltip-data="tooltip.data"
      :entity-name="entityName"
      :comparisons="tooltipComparisons"
    />
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useTooltip from "@/functions/useTooltip";
import colors from "@/utils/colors";
import { municipisWithCoast } from "@/utils/helpers";
import { ArrowUpIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import IndicatorTooltip from "./IndicatorTooltip.vue";

const props = defineProps({
  lineChartData: { type: Array, default: () => [[]] },
  dashArray: { type: Array, default: () => [] },
  entityName: String,
  // [{ label, legendClass?, data? }] — parallel to lineChartData series (index 1+)
  // data: Array<{ name: year, value, meta }> — used for tooltip year lookup
  comparisons: { type: Array, default: () => [] },
  downloadData: { type: Array, default: () => [] },
  dataAvailable: Boolean,
  loading: Boolean,
  // used for SDG 14 coastal exception
  entityId: String,
  // 'municipi' | 'comarca' | 'agregacio'
  entityType: { type: String, default: "municipi" },
});

const noDataKey = computed(() => {
  if (sdg.value === 14) {
    if (props.entityType === "comarca") return "COMARCA_NOT_SEA";
    if (props.entityType === "agregacio") return "AGRUPACIO_NOT_SEA";
  }
  if (props.entityType === "comarca") return "NO_COMARCA_DATA";
  if (props.entityType === "agregacio") return "NO_AGGREGATION_DATA";
  return "NO_MUNICIPALITY_DATA";
});

const { pieces, sdg, fullIndicatorId } = useFilters();
const { t } = useI18n();

const showAllXTicks = computed(() => {
  if (fullIndicatorId.value === "5.5.1") {
    return true;
  } else {
    return props.lineChartData[0].length < 10;
  }
});

const xFilter = computed(() => {
  if (fullIndicatorId.value === "5.5.1") {
    return (d) => d.name !== 2024 && d.name !== 2025;
  } else {
    return () => true;
  }
});

const ordinalFormat = computed(() => {
  const labels = {
    1: t("LOW"),
    2: t("MEDIUM"),
    3: t("HIGH"),
    4: t("VERY_HIGH"),
  };
  return (d) => labels[d] ?? "";
});

const chartColors = computed(() => [
  colors.sdg[sdg.value],
  colors.gray[400],
  colors.gray[400],
]);
const downloadFilename = computed(
  () => `${t("EVOLUCIO")}_${props.entityName}_${fullIndicatorId.value}`,
);

const hover = ref(null);
const tooltipEl = ref(null);
const [tooltip, toggleTooltip] = useTooltip();

const hoverNum = computed(() => {
  if (hover.value === null) {
    return props.lineChartData[0]?.length - 1;
  }
  return hover.value.i;
});

const tooltipComparisons = computed(() => {
  const hoverYear = hover.value?.data?.name;
  return props.comparisons.map((c) => ({
    label: c.label,
    legendClass: c.legendClass,
    yearData:
      hoverYear !== undefined
        ? c.data?.find((e) => e.name === hoverYear)
        : undefined,
  }));
});

function onHover(e) {
  hover.value = e;
  if (e?.target) {
    tooltipEl.value?.createPopper();
  }
  toggleTooltip(e);
}
</script>
