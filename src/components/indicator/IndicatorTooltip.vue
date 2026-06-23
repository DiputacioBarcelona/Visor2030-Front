<template>
  <OTTooltip :info="info" :smooth="smooth" ref="otTooltipRef">
    <div class="relative min-w-64">
      <div v-if="tooltipData" class="space-y-2 overflow-x-hidden">
        <div class="mt-0.5 text-base font-semibold">
          {{ tooltipData.name || getMunicipalityByCode(tooltipData.id)?.name }}
        </div>

        <hr />

        <!-- primary entity block -->
        <div class="border-l-2 pl-2" :class="`border-sdg-${sdg}`">
          <div>
            <div class="mb-1 text-gray-500">
              {{ tooltipData.id ? tooltipData.meta?.year : entityName }}
            </div>
            <div class="text-2xl">
              <span class="font-medium"
                ><template v-if="formatter.textFormat"
                  ><OTText
                    :value="
                      formatter.textFormat({ value: tooltipData.value })
                    " /></template
                ><template v-else
                  ><span v-if="tooltipData.value !== undefined">{{
                    number(tooltipData.value, formatter.decimals)
                  }}</span>
                  <span v-else><OTText value="ND" /></span></template></span
              >&#8239;<span
                v-if="tooltipData.value !== undefined"
                class="text-xl"
                ><OTText
                  :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
              /></span>
            </div>
            <!-- warning for % higher than 100 in 7.2.1 -->
            <div
              v-if="
                pieces.sdg === 7 &&
                pieces.target === '2' &&
                pieces.indicator === '1' &&
                tooltipData.value > 100
              "
              class="flex items-center"
            >
              <ExclamationTriangleIcon class="h-5 w-5 text-yellow-500" />
              <span class="ml-2 text-xs text-yellow-500"
                ><OTText value="WARNING"
              /></span>
            </div>
          </div>

          <div v-if="tooltipData.meta" class="space-y-2">
            <div
              v-if="
                t(
                  `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.VALUES.1.TITLE`,
                ) && tooltipData.meta.value2 !== undefined
              "
            >
              <hr class="my-2" />
              <div class="text-sm text-gray-500">
                <OTText
                  :value="
                    hasSubindicators
                      ? `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.SUBINDICATORS.${formattedSubindicator}.VALUES.1.TITLE`
                      : `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.VALUES.1.TITLE`
                  "
                />
              </div>
              <div class="text-base">
                <span class="font-medium">{{
                  number(tooltipData.meta.value, formatter.decimals1)
                }}</span
                >&#8239;<span class="text-sm"
                  ><OTText
                    :value="
                      hasSubindicators
                        ? `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.SUBINDICATORS.${formattedSubindicator}.VALUES.1.UNIT`
                        : `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.VALUES.1.UNIT`
                    "
                /></span>
              </div>
            </div>

            <div
              v-if="
                t(
                  `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.VALUES.2.TITLE`,
                ) && tooltipData.meta.value2 !== undefined
              "
            >
              <div class="text-sm text-gray-500">
                <OTText
                  :value="
                    hasSubindicators
                      ? `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.SUBINDICATORS.${formattedSubindicator}.VALUES.2.TITLE`
                      : `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.VALUES.2.TITLE`
                  "
                />
              </div>
              <div class="text-base">
                <span class="font-medium">{{
                  number(tooltipData.meta.value2, formatter.decimals2)
                }}</span
                >&#8239;<span class="text-sm"
                  ><OTText
                    :value="
                      hasSubindicators
                        ? `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.SUBINDICATORS.${formattedSubindicator}.VALUES.2.UNIT`
                        : `SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.VALUES.2.UNIT`
                    "
                /></span>
              </div>
            </div>
          </div>
        </div>

        <!-- year-indexed comparison rows (only IndicatorEvolution passes yearData) -->
        <template v-for="comparison in comparisons" :key="comparison.label">
          <div v-if="comparison.yearData">
            <hr class="mb-2" />
            <div
              class="border-l-2 border-gray-400 pl-2"
              :class="comparison.legendClass"
            >
              <div class="mb-1 text-gray-500">{{ comparison.label }}</div>
              <div class="text-2xl">
                <span class="font-medium"
                  ><template v-if="formatter.textFormat"
                    ><OTText
                      :value="
                        formatter.textFormat({
                          value: comparison.yearData.value,
                        })
                      " /></template
                  ><template v-else
                    ><span v-if="comparison.yearData.value !== undefined">{{
                      number(comparison.yearData.value, formatter.decimals)
                    }}</span>
                    <span v-else><OTText value="ND" /></span></template></span
                >&#8239;<span
                  v-if="comparison.yearData.value !== undefined"
                  class="text-xl"
                  ><OTText
                    :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.UNIT`"
                /></span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </OTTooltip>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useFormatter from "@/functions/useFormatter";
import { number } from "@/utils/filters";
import { getMunicipalityByCode } from "@/utils/helpers";
import { useI18n } from "vue-i18n";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  info: { type: Object, default: () => ({}) },
  smooth: { type: Boolean, default: false },
  tooltipData: { type: Object, default: null },
  // shown as subtitle when hovering the line chart (no id on hover datum)
  entityName: String,
  // [{ label, legendClass, yearData? }] — only IndicatorEvolution passes yearData
  comparisons: { type: Array, default: () => [] },
});

const otTooltipRef = ref(null);
defineExpose({ createPopper: () => otTooltipRef.value?.createPopper() });

const { pieces, sdg, subindicator } = useFilters();
const { formatter } = useFormatter();
const { t } = useI18n();

const hasSubindicators = computed(
  () => formatter.value.subindicators?.length > 0,
);
const formattedSubindicator = computed(() => subindicator.value || "0");
</script>
