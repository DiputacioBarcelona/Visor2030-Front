<template>
  <div>
    <section class="-mt-4 bg-main-80 py-10 text-white md:-mt-8">
      <div class="ot-container">
        <header>
          <h1 class="ot-title-1 text-white"><OTText value="ANALISI" /></h1>
          <p class="ot-line text-xl">
            <OTText value="ANALISI_DESC" />
          </p>
        </header>
      </div>
    </section>

    <!-- DISTRIBUCIO ODS -->
    <section class="ot-container mb-16 mt-4">
      <!-- <img
        :src="`${basePath}img/icons/search.svg`"
        alt="Hash icon"
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-4 border-dashed border-gray-500 md:mb-8" /> -->

      <header class="mb-2 flex justify-between gap-4">
        <div>
          <h2 class="ot-title-2 mb-2"><OTText value="DISTRIBUCIO_ODS" /></h2>
          <p class="ot-line text-sm tracking-wide">
            <OTText value="DISTRIBUCIO_ODS_DESC" markdown />
          </p>
        </div>
      </header>

      <!-- FILTERS -->
      <div class="top-[56px] z-20 mb-4 gap-4 sm:sticky">
        <div
          class="-mx-2 rounded bg-white p-2 transition-shadow"
          :class="{ 'sm:shadow': showShadow }"
        >
          <MunicipalityFilterBar />
        </div>
      </div>

      <!-- <div class="grid grid-cols-2 gap-4">
        <pre class="ot-code">{{ highlightMunicipalities6codes }}</pre>
        <pre class="ot-code">{{ comarcaMunicipalities }}</pre>
      </div> -->

      <div class="relative">
        <div class="mb-6 flex items-center justify-end gap-2">
          <DownloadCSVButton
            :data="filteredDotPlotData"
            :filename="`${t('DISTRIBUCIO_ODS')}${filenameWithSelectedFilters}`"
          />
          <DownloadImageButton
            element-id="jittered-dot-plot"
            :filename="`${t('DISTRIBUCIO_ODS')}${filenameWithSelectedFilters}`"
          />
        </div>
        <ImageWrapper id="jittered-dot-plot">
          <JitteredDotPlot
            :data="dotPlotData"
            class="ml-4 h-[400px] md:h-[500px]"
            :color="colors.sdg"
            @hover="handleTooltip"
            :x-accessor="(d) => d.sdg"
            :y-accessor="(d) => d.municipality_code_6"
            :minRandomness="minRandomness"
            :numBins="numBins"
            :highlighted="highlightMunicipalities6codes"
          />
        </ImageWrapper>

        <LoadingSpinner
          :loading="loading"
          class="inset-0"
          bg-color-class="bg-white/50"
          :border-class="`h-6 w-6 border-2 border-main-80`"
        />
      </div>

      <OTTooltip :info="tooltip" ref="tooltipElement2" :smooth="false">
        <div class="relative flex items-start">
          <div v-if="tooltip.data" class="space-y-2 overflow-x-hidden">
            <div class="mt-0.5 text-base font-semibold">
              {{ tooltip.data.municipality_name }}
            </div>
            <hr />

            <div>
              <div class="mb-1 text-gray-500">
                <OTText :value="`SDGS.${tooltip.data.sdg}.TITLE`" />
              </div>
              <div class="text-2xl">
                <span class="font-medium">{{
                  number(tooltip.data.value, 2)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </OTTooltip>
    </section>

    <!-- RELACIO ENTRE ODS -->
    <section class="ot-container my-16">
      <img
        :src="`${basePath}img/icons/arrow-left-right.svg`"
        alt="Hash icon"
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

      <div class="flex justify-between">
        <h2 class="ot-title-2"><OTText value="RELACIO_ENTRE_ODS" /></h2>
        <div class="flex items-center gap-2">
          <DownloadCSVButton
            :data="filteredScatterData"
            :filename="`${t('RELACIO_ENTRE_ODS')}${filenameWithSelectedFilters}_${t('SDG').trim()}${sdg1}_vs_${sdg2}`"
          />
          <DownloadImageButton
            :element-id="
              facet === 'comarca' ? 'scatter-plot' : 'single-scatter-plot'
            "
            :filename="`${t('RELACIO_ENTRE_ODS')}${filenameWithSelectedFilters}_${t('SDG').trim()}${sdg1}_vs_${sdg2}`"
          />
        </div>
      </div>

      <div class="grid gap-8 gap-y-12 md:grid-cols-3">
        <div class="col-span-1">
          <p class="ot-line mb-6 text-sm tracking-wide">
            <OTText value="RELACIO_ENTRE_ODS_DESC" />
          </p>
          <div class="space-y-4">
            <div>
              <RouterSwitch
                :options="facetOptions"
                :active="facet"
                class="rounded-full bg-gray-50 p-1 text-sm"
                item-class=" basis-1/2 rounded-full text-center transition font-semibold py-2 px-4 bg-transparent focus:outline-none truncate sm:overflow-visible rounded-full whitespace-nowrap z-20 ot-ring first:rounded-l-full last:rounded-r-full  focus-visible:ring-main-80/50 focus-visible:ring-4 focus-visible:ring-offset-0"
                item-active-class="text-white ring-transparent ring-0"
                slider-class="absolute inset-y-0 my-1 bg-main-80 rounded-full ease-out transition-all "
                item-inactive-class="text-gray-700 hover:bg-gray-200"
                inner-container-class="gap-1"
              />
            </div>

            <div>
              <OTSelectODS v-model="sdg1" />
            </div>
            <div>
              <OTSelectODS v-model="sdg2" />
            </div>

            <div class="">
              <OTToggle
                v-model="showMedianLines"
                small
                disabled-class="bg-gray-200"
                enabled-class="bg-main-80"
                label-position="end"
                switch-class="ot-ring focus:outline-none group-hover:ring-2 group-hover:ring-main-80/50 focus-visible:ring-2 focus-visible:ring-main-80/50 focus-visible:ring-offset-0"
                ><span class="ml-1 text-xs text-main-100"
                  ><OTText value="SHOW_MEDIAN_LINES" /></span
              ></OTToggle>
            </div>

            <div class="">
              <OTToggle
                v-model="showTrendLine"
                small
                disabled-class="bg-gray-200"
                enabled-class="bg-main-80"
                label-position="end"
                switch-class="ot-ring focus:outline-none group-hover:ring-2 group-hover:ring-main-80/50 focus-visible:ring-2 focus-visible:ring-main-80/50 focus-visible:ring-offset-0"
                ><span class="ml-1 text-xs text-main-100"
                  ><OTText value="SHOW_TREND_LINE" /></span
              ></OTToggle>
            </div>
          </div>
        </div>
        <div class="md:col-span-2">
          <div class="my-0">
            <ImageWrapper id="scatter-plot">
              <div class="relative">
                <div class="absolute -top-6 left-1 flex items-center gap-0">
                  <ArrowUpIcon class="h-4 w-4" />
                  <!-- <OTSelect
                  :options="sdgOptions"
                  v-model="sdg1"
                  main-class="ot-btn bg-white px-2 py-1 rounded border-none text-xs"
                  popover-class="w-[400px]"
                  class=""
                /> -->
                  <span class="px-2 text-xs"
                    ><OTText :value="`SDGS.${sdg2}.TITLE`"
                  /></span>
                </div>
                <div
                  class="my-0 grid gap-1"
                  :class="{
                    'grid-cols-4': segments.length > 1,
                    'grid-cols-1': segments.length <= 1,
                  }"
                >
                  <div
                    v-for="(segment, i) in segments"
                    :key="segment.name"
                    class="relative w-full"
                  >
                    <div
                      class="pointer-events-none absolute left-1 top-2.5 mb-1 ml-3 text-xs font-medium"
                      v-if="segments.length > 1"
                    >
                      {{ segment.name }}
                    </div>
                    <!-- {{ segment.highlighted }} -->
                    <ImageWrapper id="single-scatter-plot">
                      <div class="aspect-1 w-full">
                        <ScatterPlotWithZoom
                          :data="scatterData"
                          class="h-full w-full"
                          :x-domain="domain"
                          :y-domain="domain"
                          nice
                          :dot-size="[facet === 'none' ? 6 : 3, 20]"
                          :size-by-value="size !== 'none'"
                          @hover="toggleTooltipScatter"
                          :highlighted="segment.highlighted"
                          :show-median-lines="showMedianLines"
                          :show-regression-line="showTrendLine"
                          :crosshair="crosshair"
                          @hover-bg="updateCrosshair"
                          :show-cells="false"
                          @click-bg="fixCrosshair"
                          :color="colors.main[80]"
                          :dot-opacity="0.8"
                          :x-tick-format="
                            facet === 'none'
                              ? null
                              : (d) =>
                                  i >= 9 ? (![0, 100].includes(d) ? d : '') : ''
                          "
                          :y-tick-format="
                            facet === 'none'
                              ? null
                              : (d) =>
                                  i % 4 === 0
                                    ? ![0, 100].includes(d)
                                      ? d
                                      : ''
                                    : ''
                          "
                          :opacity-for-non-highlighted="0.3"
                          :dot-size-for-non-highlighted="
                            facet === 'none' ? 3 : 1.5
                          "
                          :x-ticks="facet === 'none' ? null : 5"
                          :y-ticks="facet === 'none' ? null : 5"
                          show-border
                          :border-color="colors.gray[700]"
                          :only-highlighted-points="true"
                          :use-voronoi-for-hover="true"
                        />

                        <!-- :x-tick-format="
                        facet === 'none'
                          ? null
                          : (d) => ([0, 100].includes(d) ? d : '')
                      " -->
                      </div>
                    </ImageWrapper>
                    <!-- <div class="h-full w-full bg-gray-200"></div> -->
                  </div>
                </div>

                <div class="absolute -bottom-6 right-0 flex items-center gap-0">
                  <ArrowRightIcon class="h-4 w-4" />
                  <!-- <OTSelect
                  :options="sdgOptions"
                  v-model="sdg2"
                  main-class="ot-btn bg-white px-2 py-1 rounded border-none text-xs"
                  popover-class="w-[400px]"
                /> -->
                  <span class="px-2 text-xs"
                    ><OTText :value="`SDGS.${sdg1}.TITLE`"
                  /></span>
                </div>

                <LoadingSpinner
                  :loading="loading"
                  class="inset-0"
                  bg-color-class="bg-white/50"
                  :border-class="`h-6 w-6 border-2 border-main-80`"
                />
              </div>
            </ImageWrapper>
          </div>
        </div>
        <OTTooltip :info="tooltipScatter" ref="tooltipElement" :smooth="false">
          <div class="relative flex items-start">
            <div v-if="tooltipScatter.data" class="space-y-2 overflow-x-hidden">
              <div class="mt-0.5 text-base font-semibold">
                {{ tooltipScatter.data.name }}
              </div>
              <hr />

              <div>
                <div class="mb-1 text-gray-500">
                  <OTText :value="`SDGS.${sdg1}.TITLE`" />
                </div>
                <div class="text-2xl">
                  <span class="font-medium">{{
                    number(tooltipScatter.data.x, 2)
                  }}</span>
                </div>
              </div>

              <div>
                <div class="mb-1 text-gray-500">
                  <OTText :value="`SDGS.${sdg2}.TITLE`" />
                </div>
                <div class="text-2xl">
                  <span class="font-medium">{{
                    number(tooltipScatter.data.y, 2)
                  }}</span>
                </div>
              </div>

              <!-- <pre>{{ tooltipScatter.data }}</pre> -->
            </div>
          </div>
        </OTTooltip>
      </div>
    </section>

    <div class="grid grid-cols-2 gap-4">
      <!-- <pre class="ot-code">{{ scatterData }}</pre> -->
      <!-- <pre class="ot-code">{{ dotPlotData }}</pre> -->
    </div>
  </div>
</template>

<script setup>
import useLoadData from "@/functions/useLoadData";
import useTooltip from "@/functions/useTooltip";
import colors from "@/utils/colors";
import { number } from "@/utils/filters";
import * as d3 from "d3";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import useFilters from "@/functions/useFilters";
import {
  ArrowUpIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import useComarques from "@/functions/useComarques";
import { basePath } from "@/config";
import { useWindowScroll } from "@vueuse/core";
import useHighlightMunicipalities from "@/functions/useHighlightMunicipalities";

const municipalities = inject("municipalities");

const route = useRoute();

const { t } = useI18n();

const { factor, min_weight, size, facet, comarca, tram, municipi, gr } =
  useFilters();

useHead({
  title: () => t(`ANALISI`),
});

const { y } = useWindowScroll();

const showShadow = computed(() => y.value > 360);

const params = computed(() => {
  return { factor: factor.value, min_weight: min_weight.value };
});

const { data, loading } = useLoadData(
  "getAllSyntheticSDGValues",
  [],
  false,
  params,
);

const dotPlotData = computed(() => {
  return data.value.filter((item) => item.value);
});

const [tooltip, toggleTooltip] = useTooltip();

const groupedData = computed(() => {
  const grouped = d3.rollup(
    data.value,
    (v) => v[0], // there is only one row per municipality and sdg
    (d) => d.municipality_code_6,
    (d) => d.sdg,
  );

  return grouped;
});

// array from 1 to 17
const sdgOptions = computed(() => {
  return Array.from({ length: 17 }, (_, i) => i + 1).map((i) => ({
    id: i,
    name: `${t(`SDGS.${i}.TITLE`)}`,
  }));
});

const sdg1 = ref(1);
const sdg2 = ref(2);

const comarcaOptions = useComarques(true, t);

// highglight jittered dot plot
const comarcaMunicipalities = computed(() => {
  if (!comarca.value) return null;
  return comarcaOptions.value.find((c) => c.id === comarca.value).highlighted;
});

const highlightMunicipalities = useHighlightMunicipalities(t);

const highlightMunicipalities6codes = computed(() => {
  return highlightMunicipalities.value
    ? highlightMunicipalities.value.map((id) => {
        const mun = municipalities.value.find((m) => m.id === id);
        return mun.municipality_code_6;
      })
    : null;
});

const filteredDotPlotData = computed(() => {
  if (!highlightMunicipalities6codes.value) return dotPlotData.value;

  return dotPlotData.value.filter((mun) =>
    highlightMunicipalities6codes.value.includes(mun.municipality_code_6),
  );
});

const comarcaName = computed(
  () => comarcaOptions.value.find((c) => c.id === comarca.value).name,
);

const filenameWithSelectedFilters = computed(() => {
  return `${comarca.value ? `_${t("COMARCA")}_${comarcaName.value}` : ""}${tram.value ? `_${t("TRAM")}_${tram.value}` : ""}${municipi.value.length ? `_${t("MUNICIPI")}_${municipi.value}` : ""}${gr.value.length ? `_${t("OTHER_GROUPINGS")}_${gr.value}` : ""}`;
});

const handleTooltip = (event) => {
  if (!event) toggleTooltip(null);
  const munCode = event?.data?.municipality_code_6;
  if (!highlightMunicipalities6codes.value) {
    toggleTooltip(event);
  } else if (highlightMunicipalities6codes.value.includes(munCode)) {
    toggleTooltip(event);
  } else {
    toggleTooltip(null);
  }
};

const segments = computed(() => {
  // if facet is none, return an array with one element
  if (facet.value === "none") {
    return [
      {
        id: "none",
        name: "none",
        scatterData: scatterData,
        highlighted: highlightMunicipalities6codes.value || [],
      },
    ];
  }
  // if facet is comarca, return an array with one element for each comarca
  const [first, ...rest] = comarcaOptions.value;
  return rest.map((c) => ({
    ...c,
    // not for now.
    // highlighted: c.highlighted.filter((munCode) => {
    //   // the munCode has to appear also in highlightMunicipalities6codes
    //   if (!highlightMunicipalities6codes.value) return true;
    //   return highlightMunicipalities6codes.value?.includes(munCode);
    // }),
  }));
});

const scatterData = computed(() => {
  const final = [];
  for (const [key, sdgMap] of groupedData.value) {
    // key is municipality_code_6
    // value is a map with sdg as key and an array of objects as value
    // value.get(sdg1.value) is an array of objects
    // value.get(sdg2.value) is an array of objects
    let value = 1;
    switch (size.value) {
      case "population":
        value = sdgMap.get(sdg1.value)?.population || 1;
        break;
      case "none":
        value = 1;
        break;
      default:
        value = sdgMap.get(+size.value)?.value || 1;
    }

    const x = sdgMap.get(sdg1.value)?.value;
    const y = sdgMap.get(sdg2.value)?.value;

    const item = {
      id: key,
      name: sdgMap.get(sdg1.value)?.municipality_name,
      x,
      y,
      value,
    };

    if (x !== undefined && y !== undefined) final.push(item);
  }

  return final;
});

const filteredScatterData = computed(() => {
  if (!highlightMunicipalities6codes.value) return scatterData.value;

  return scatterData.value.filter((mun) =>
    highlightMunicipalities6codes.value.includes(mun.id),
  );
});

const [tooltipScatter, toggleTooltipScatter] = useTooltip();

const minRandomness = ref(0);
const numBins = ref(100);

const domain = [0, 100];

const sizeOptions = computed(() => {
  return [
    { id: "none", name: t("NONE") },
    { id: "population", name: t("POBLACIO") },
    ...sdgOptions.value.map((e) => ({ ...e, id: e.id.toString() })),
  ];
});

const facetOptions = computed(() => {
  return [
    {
      id: "none",
      name: t("VISIO_GENERAL"),
      to: { query: { ...route.query, facet: "none" } },
    },
    {
      id: "comarca",
      name: t("BY_COMARCA"),
      to: { query: { ...route.query, facet: "comarca" } },
    },
  ];
});

const showMedianLines = ref(false);

const showTrendLine = ref(true);

const crosshair = ref(null);

const allowCrosshairUpdate = ref(true);

function updateCrosshair(e) {
  if (!allowCrosshairUpdate.value) return;
  crosshair.value = e;
}

function fixCrosshair(e) {
  allowCrosshairUpdate.value = !allowCrosshairUpdate.value;
  updateCrosshair(e);
}
</script>
