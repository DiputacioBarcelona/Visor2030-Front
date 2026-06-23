<template>
  <div class="mt-8">
    <div class="mb-4 flex items-center justify-between gap-4 text-sm">
      <div class="tracking-wide">
        <OTText value="DISTRIBUCIO" /> ({{ lastYear }})&nbsp;
        <span class="font-bold">
          <OTText
            :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.TITLE`"
          />
        </span>
      </div>
      <div class="flex items-center gap-2">
        <a
          class="ot-btn ot-btn-soft px-2 py-1"
          :href="`${apiUrl}export/csv?id=${fullIndicatorId}&year=${lastYear}`"
          :download="`${entityName}_${fullIndicatorId}.csv`"
          :title="t('DOWNLOAD_DATA')"
        >
          <DocumentArrowDownIcon class="w-4" />
        </a>
        <DownloadImageButton
          element-id="indicator-beeswarm"
          :filename="downloadFilename"
        />
      </div>
    </div>
    <ImageWrapper id="indicator-beeswarm" :margin="40">
      <div class="relative h-64">
        <BeeswarmChart
          :data="data"
          :radius="4"
          :color="colors.sdg[sdg]"
          @hover="toggleTooltip"
          :selected="selectedId"
          @select="emit('select', $event)"
          :selected-color="colors.black"
          :highlight-color="colors.black"
          id-label="beeswarm"
          :domain="fullIndicatorId === '13.1.1' ? [0.5, 4.5] : null"
          :tick-format="fullIndicatorId === '13.1.1' ? ordinalTickFormat : null"
        />
        <div class="mt-2 flex items-center justify-end gap-1 text-xs">
          <OTText
            :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
          />
          <ArrowRightIcon class="h-4 w-4" />
        </div>
      </div>
    </ImageWrapper>

    <IndicatorTooltip
      :info="tooltip"
      :tooltip-data="tooltip.data"
      :entity-name="entityName"
    />
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useTooltip from "@/functions/useTooltip";
import colors from "@/utils/colors";
import { apiUrl } from "@/config";
import {
  ArrowRightIcon,
  DocumentArrowDownIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import IndicatorTooltip from "./IndicatorTooltip.vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  selectedId: [String, Array],
  lastYear: Number,
  entityName: String,
});

const emit = defineEmits(["select"]);

const { pieces, sdg, fullIndicatorId } = useFilters();
const { t } = useI18n();
const [tooltip, toggleTooltip] = useTooltip();

const ordinalTickFormat = computed(() => {
  const labels = {
    1: t("LOW"),
    2: t("MEDIUM"),
    3: t("HIGH"),
    4: t("VERY_HIGH"),
  };
  return (d) => labels[d] ?? "";
});

const downloadFilename = computed(
  () => `${t("DISTRIBUCIO")}_${props.entityName}_${fullIndicatorId.value}`,
);
</script>
