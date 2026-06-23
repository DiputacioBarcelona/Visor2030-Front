<template>
  <div class="ot-container">
    <header class="mb-4 sm:mb-16">
      <h1 class="ot-title-1 mb-1 inline-flex items-center gap-1">
        <img
          :src="`${basePath}img/icons/ODS${sdg}.svg`"
          :alt="t(`SDGS.${sdg}.TITLE`)"
          class="w-[36px]"
        />
        <OTSelectODS
          v-model="sdg"
          main-class="ot-btn bg-none border-none ot-title-1 m-0 px-2"
          popover-class="w-[320px] max-w-[calc(100vw-4.5rem)]"
          circle-class="h-7 w-7 text-base"
        />
      </h1>

      <p class="mb-8 tracking-wide">
        <OTText :value="`SDGS.${sdg}.DESCRIPTION`" />
      </p>
      <p class="ot-line text-xl text-gray-500">
        <OTText
          value="SDG_GENERIC_TEXT"
          :options="{ sdg: t(`SDGS.${sdg}.TITLE`) }"
          markdown
        />
      </p>
    </header>

    <!-- FILTERS -->
    <div class="top-[56px] z-30 mb-6 gap-4 sm:sticky md:-mt-12">
      <div
        class="-mx-2 rounded bg-white p-2 transition-shadow"
        :class="{ 'sm:shadow': showShadow }"
      >
        <MunicipalityFilterBar />
      </div>
    </div>
    <img
      :src="`${basePath}img/icons/collection.svg`"
      alt="Hash icon"
      class="absolute -mt-2 bg-white pr-2"
    />
    <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

    <!-- MAIN BEESWARM -->
    <div>
      <header class="mb-4 md:mb-8">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <h2 class="ot-title-2 mb-2">
              <OTText value="INDEX_SINTETIC" />
            </h2>

            <p class="ot-line text-sm tracking-wide">
              <OTText value="INDEX_SINTETIC_TEXT" />
            </p>
          </div>
        </div>
      </header>

      <div class="mt-1 flex items-center justify-end gap-2">
        <DownloadCSVButton
          :data="filteredBeeswarmData"
          :filename="`${t('SDG').trim()}_${sdg}${filenameWithSelectedFilters}`"
        />
        <DownloadImageButton
          element-id="main-beeswarm"
          :filename="`${t('SDG').trim()}_${sdg}${filenameWithSelectedFilters}`"
        />
      </div>
      <ImageWrapper id="main-beeswarm">
        <div class="relative h-72 w-full">
          <BeeswarmChart
            class="beeswarm-chart h-full"
            :data="beeswarmData"
            :radius="5"
            :color="colors.sdg[sdg]"
            :extent="[0, 100]"
            @hover="toggleTooltipMain"
            :selected="highlightMunicipalities"
            :opacity-for-non-highlighted="0.1"
            @select="goToMunicipi($event, 'index')"
          />

          <OTTooltip :info="tooltipMain" ref="tooltipElement2" :smooth="false">
            <div class="relative flex items-start">
              <div v-if="tooltipMain.data" class="space-y-2 overflow-x-hidden">
                <div class="mt-0.5 text-base font-semibold">
                  {{ tooltipMain.data.name }}
                </div>
                <hr />

                <div class="space-y-2">
                  <div>
                    <div class="text-sm text-gray-500">
                      <OTText value="INDEX_SINTETIC" />
                    </div>
                    <div class="text-base">
                      <span class="font-medium">{{
                        number(tooltipMain.data.value)
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- <hr />

            <pre class="ot-code">{{ tooltip.data?.meta }}</pre> -->
              </div>
            </div></OTTooltip
          >
          <!-- border-sdg-1 border-sdg-2 border-sdg-3 border-sdg-4 border-sdg-5 border-sdg-6 border-sdg-7 border-sdg-8 border-sdg-9 border-sdg-10 border-sdg-11 border-sdg-12 border-sdg-13 border-sdg-14 border-sdg-15 border-sdg-16 border-sdg-17 -->
          <LoadingSpinner
            :loading="loadingBeeswarm"
            class="inset-0"
            bg-color-class="bg-white/50"
            :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
          />
        </div>
      </ImageWrapper>
      <!-- INDICATORS -->
      <section class="my-16">
        <img
          :src="`${basePath}img/icons/graph-up.svg`"
          alt="Hash icon"
          class="absolute -mt-2 bg-white pr-2"
        />
        <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

        <header class="mb-8">
          <h2 class="ot-title-2 mb-2">
            <OTText value="INDICATORS" />
          </h2>

          <p class="ot-line text-sm tracking-wide">
            <OTText value="INDICATORS_TEXT" />
          </p>
        </header>

        <div class="space-y-16">
          <div v-for="[key, data] in indicators">
            <div class="grid gap-8 md:grid-cols-4">
              <div class="md:col-span-3">
                <div class="flex justify-between">
                  <h3 class="mb-4 text-sm font-semibold tracking-wide">
                    <OTText
                      :value="`SDGS.${key.split('.')[0]}.TARGETS.${key.split('.')[1]}.INDICATORS.${key.split('.')[2]}.TITLE`"
                    />
                  </h3>
                  <div class="flex items-center gap-2">
                    <DownloadCSVButton
                      :data="filteredIndicators.find(([k]) => k === key)?.[1]"
                      :filename="`${t('SDG').trim()}_${key}${filenameWithSelectedFilters}`"
                    />
                    <!-- <DownloadSVGButton svg-id="beeswarm" /> -->
                    <DownloadImageButton
                      :element-id="`beeswarm-${key}`"
                      :filename="`${t('SDG').trim()}_${key}${filenameWithSelectedFilters}`"
                    />
                  </div>
                </div>

                <ImageWrapper :id="`beeswarm-${key}`" :margin="40">
                  <div class="relative h-72 w-full">
                    <BeeswarmChart
                      class="beeswarm-chart h-full"
                      :data="data"
                      :radius="5"
                      :color="colors.sdg[sdg]"
                      @hover="toggleTooltip"
                      @select="goToMunicipi($event, key)"
                      :scaleType="scales[key] ? 'scaleLog' : 'scaleLinear'"
                      :selected="highlightMunicipalities"
                      :opacity-for-non-highlighted="0.1"
                      id-label="beeswarm"
                    />

                    <div
                      class="mt-2 flex items-center justify-end gap-4 text-xs"
                    >
                      <div class="flex items-center gap-1 text-xs">
                        <OTText
                          :value="`SDGS.${key.split('.')[0]}.TARGETS.${key.split('.')[1]}.INDICATORS.${key.split('.')[2]}.UNIT`"
                        />
                        <ArrowRightIcon class="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </ImageWrapper>
              </div>

              <div class="flex flex-col justify-between gap-4">
                <div>
                  <div class="mb-4 font-semibold">
                    <OTText
                      :value="`SDGS.${key.split('.')[0]}.TARGETS.${key.split('.')[1]}.INDICATORS.${key.split('.')[2]}.DESCRIPTION`"
                    />
                  </div>

                  <div class="mb-1 text-sm text-main-100">
                    <OTText
                      value="INDICADOR_ASSOCIAT"
                      :options="{ target: `${sdg}.${key.split('.')[1]}` }"
                    />
                  </div>
                  <div class="text-sm">
                    <OTText
                      :value="`SDGS.${key.split('.')[0]}.TARGETS.${key.split('.')[1]}.DESCRIPTION`"
                    />
                  </div>
                </div>

                <div class="order-first md:order-none">
                  <OTToggle
                    v-model="scales[key]"
                    small
                    disabled-class="bg-gray-200"
                    enabled-class="bg-main-80"
                    label-position="end"
                    switch-class="ot-ring focus:outline-none group-hover:ring-2 group-hover:ring-main-80/50 focus-visible:ring-2 focus-visible:ring-main-80/50 focus-visible:ring-offset-0"
                    ><span class="ml-1 text-xs text-main-100"
                      ><OTText value="ESCALA_LOGARITMICA" /></span
                  ></OTToggle>
                </div>
              </div>
            </div>

            <!-- <pre class="ot-code">{{ data }}</pre> -->
          </div>
        </div>

        <OTTooltip :info="tooltip" ref="tooltipElement1" :smooth="false">
          <div class="relative flex items-start">
            <div v-if="tooltip.data" class="space-y-2 overflow-x-hidden">
              <div class="mt-0.5 text-base font-semibold">
                {{ tooltip.data.name }}
              </div>
              <hr />

              <div>
                <div class="mb-1 text-gray-500">
                  <OTText
                    :value="
                      t(
                        `SDGS.${tooltip.data?.meta?.indicator_id.split('.')[0]}.TARGETS.${tooltip.data?.meta?.indicator_id.split('.')[1]}.INDICATORS.${tooltip.data?.meta?.indicator_id.split('.')[2]}.TITLE`,
                      )
                    "
                  />
                </div>
                <div class="text-2xl">
                  <span class="font-medium"
                    ><template
                      v-if="
                        calculations[tooltip.data?.meta?.indicator_id]
                          ?.textFormat
                      "
                      ><OTText
                        :value="
                          calculations[
                            tooltip.data?.meta?.indicator_id
                          ].textFormat({
                            value: tooltip.data.value,
                          })
                        " /></template
                    ><template v-else
                      ><span v-if="tooltip.data.value !== undefined">{{
                        number(
                          tooltip.data.value,
                          calculations[tooltip.data?.meta?.indicator_id]
                            ?.decimals,
                        )
                      }}</span>
                      <span v-else><OTText value="ND" /></span></template></span
                  >&#8239;<span
                    v-if="tooltip.data.value !== undefined"
                    class="text-xl"
                    ><OTText
                      :value="
                        t(
                          `SDGS.${tooltip.data?.meta?.indicator_id.split('.')[0]}.TARGETS.${tooltip.data?.meta?.indicator_id.split('.')[1]}.INDICATORS.${tooltip.data?.meta?.indicator_id.split('.')[2]}.UNIT`,
                        )
                      "
                  /></span>
                </div>
              </div>
            </div></div
        ></OTTooltip>
      </section>

      <!-- <pre class="ot-code">{{ indicators }}</pre> -->
    </div>
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { basePath } from "@/config";
import useLoadData from "@/functions/useLoadData";
import colors from "@/utils/colors";
import * as d3 from "d3";
import useTooltip from "@/functions/useTooltip";
import { number } from "@/utils/filters";
import useBeeswarmData from "@/functions/useBeeswarmData";
import calculations from "@/utils/indicators";
import { ArrowRightIcon } from "@heroicons/vue/24/outline";
import { useWindowScroll } from "@vueuse/core";
import useHighlightMunicipalities from "@/functions/useHighlightMunicipalities";

const { t } = useI18n();

const router = useRouter();

const { sdg, comarca, tram, municipi, gr } = useFilters();

useHead({
  title: () => `${sdg.value}. ${t(`SDGS.${sdg.value}.TITLE`)}`,
});

const { y } = useWindowScroll();

const showShadow = computed(() => y.value > 280);

const params = computed(() => {
  return {
    sdg: sdg.value,
  };
});

const { data: mainData, loading: loadingBeeswarm } = useLoadData(
  "getAllSyntheticSDGValues",
  [],
  false,
  params,
);

const beeswarmData = computed(() => {
  const data = mainData.value.map((item) => ({
    id: item.municipality_code_6.substring(0, 5),
    name: item.municipality_name,
    value: item.value,
    meta: item,
  }));

  return data;
});

const indicatorFilter = computed(() => {
  return {
    sdg: sdg.value,
    // year: lastData.value?.year || null,
  };
});

const { data: indicatorsData, loading: loadingBeeswarmIndicators } =
  useLoadData("getSDGIndicatorValues", [], false, indicatorFilter);

const indicators = computed(() => {
  // group them by sdg
  const grouped = d3
    .rollups(
      indicatorsData.value,
      (v) => {
        // if log scale, filter out the 0 values
        if (scales.value[v[0].indicator_id]) {
          v = v.filter((d) => d.value > 0);
        }
        const beeswarmData = useBeeswarmData({ value: v }).value;
        // const formatter = calculations[v[0].indicator_id] || {};
        return beeswarmData;
      },
      (d) => d.indicator_id,
    )
    // sort by sdg
    .sort((a, b) => {
      const aPieces = a[0].split(".");
      const bPieces = b[0].split(".");

      if (aPieces[0] === bPieces[0]) {
        if (aPieces[1] === bPieces[1]) {
          return aPieces[2] - bPieces[2];
        }
        return aPieces[1] - bPieces[1];
      }
      return aPieces[0] - bPieces[0];
    });

  return grouped;
});

const scales = ref({});

watch(indicatorsData, () => {
  // set the scales to false
  // for every key in indicators
  for (const key in indicators.value) {
    scales.value[key] = false;
  }
});

const [tooltip, toggleTooltip] = useTooltip();
const [tooltipMain, toggleTooltipMain] = useTooltip();

function goToMunicipi({ data }, indicator_id) {
  if (indicator_id === "index") {
    router.push({
      name: "municipi",
      params: { id: data.id },
    });
    return;
  }

  const pieces = indicator_id.split(".");
  const sdg = pieces[0];
  const targetId = pieces[1];
  const indicatorId = pieces[2];

  router.push({
    name: "municipi-indicator",
    params: { id: data.id, sdg, targetId, indicatorId },
    query: { all: true },
  });

  // id.value = e.data.meta?.municipality_code || e.data.id.substr(0, 5);
}

const highlightMunicipalities = useHighlightMunicipalities(t);

const filteredBeeswarmData = computed(() => {
  if (!highlightMunicipalities.value?.length) return beeswarmData.value;

  return beeswarmData.value.filter((mun) =>
    highlightMunicipalities.value.includes(mun.id),
  );
});

const filteredIndicators = computed(() => {
  if (!highlightMunicipalities.value?.length) return indicators.value;

  return indicators.value.map(([indicatorId, municipalities]) => [
    indicatorId,
    municipalities.filter((mun) =>
      highlightMunicipalities.value.includes(mun.id),
    ),
  ]);
});

const sdgOptions = computed(() => {
  return Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}. ${t(`SDGS.${i + 1}.TITLE`)}`,
  }));
});

const filenameWithSelectedFilters = computed(() => {
  return `${comarca.value ? `_${t("COMARCA")}_${comarca.value}` : ""}${tram.value ? `_${t("TRAM")}_${tram.value}` : ""}${municipi.value.length ? `_${t("MUNICIPI")}_${municipi.value}` : ""}${gr.value.length ? `_${t("OTHER_GROUPINGS")}_${gr.value}` : ""}`;
});

function routeSDG(value) {
  router.push({
    // if current route is home, go to municipi, else stay in current route
    name: "sdg",
    params: {
      sdg: value,
    },
  });
}
</script>

<style>
.beeswarm-chart .domain,
.beeswarm-chart .tick line {
  stroke: v-bind("colors.gray[200]");
}
</style>
