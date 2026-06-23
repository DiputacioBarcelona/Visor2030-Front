<template>
  <div>
    <header class="mb-2 md:min-h-12">
      <h3 class="font-semibold">
        <OTText
          :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.DESCRIPTION`"
        />
      </h3>
    </header>

    <div
      v-if="error"
      class="sticky top-28 z-10 my-4 rounded border-red-600 bg-red-100 p-6 text-sm text-red-800"
    >
      <OTText value="ERROR" />
    </div>

    <div class="grid gap-4 md:grid-cols-2 print:grid-cols-2">
      <!-- text-sdg-1 text-sdg-2 text-sdg-3 text-sdg-4 text-sdg-5 text-sdg-6 text-sdg-7 text-sdg-8 text-sdg-9 text-sdg-10 text-sdg-11 text-sdg-12 text-sdg-13 text-sdg-14 text-sdg-15 text-sdg-16 text-sdg-17 -->
      <IndicatorStats
        :primary-label="data?.name"
        :primary-data="lastData"
        :previous-data="previousData"
        :comparisons="statsComparisons"
        :loading="loading"
        :entity-id="data?.id"
      />
      <IndicatorMap
        :map-data="mapData"
        :extent="extent"
        :color-scale="colorScale"
        :selected="comarcaCode"
        :highlighted="data?.municipality_code_6"
        :loading="loadingComarques"
        :municipality-comarca-codes="municipalityComarcaCodes"
        @select="goToMunicipi"
        :name="data?.comarca.comarca_name"
      />
    </div>
    <IndicatorEvolution
      :line-chart-data="lineChartData"
      :dash-array="dashArray"
      :entity-name="data?.name"
      :comparisons="evolutionComparisons"
      :download-data="lineChartDownloadData"
      :data-available="dataAvailable"
      :loading="loading"
      :entity-id="data?.id"
    />

    <IndicatorDistribution
      :data="beeswarmData"
      :selected-id="data?.id"
      :last-year="lastData.year"
      :entity-name="data?.name"
      @select="goToMunicipi"
    />

    <div class="mt-8 tracking-wide">
      <div class="mb-4 text-sm">
        <OTText value="SOURCE" />
      </div>
      <div class="">
        <OTText
          :value="`SDGS.${sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.SOURCE`"
          markdown
          md-class="prose text-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useFormatter from "@/functions/useFormatter";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import municipalities from "@/assets/municipalities.json";
import useEntityIndicatorData from "@/functions/useEntityIndicatorData";
import * as IDS from "@/utils/ids";
import IndicatorStats from "@/components/indicator/IndicatorStats.vue";
import IndicatorEvolution from "@/components/indicator/IndicatorEvolution.vue";
import IndicatorDistribution from "@/components/indicator/IndicatorDistribution.vue";
import IndicatorMap from "@/components/indicator/IndicatorMap.vue";

const route = useRoute();

const { t } = useI18n();

const { id, sdg, pieces, fullIndicatorId, year } = useFilters();
const { calculator } = useFormatter();

const data = inject("entity");

const mapFilter = computed(() => ({
  "indicator.indicator_id": fullIndicatorId.value,
  "municipality.comarca.comarca_code": data.value?.comarca?.comarca_code,
}));

useHead({
  // the number of the indicator, its name and then the name of the city
  title: () =>
    `${fullIndicatorId.value} - ${t(`SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.TITLE`)} - ${data.value?.name}`,
});

const comarcaCode = computed(() => {
  // prepend 0 if only 1 digit
  const comarcaCode = data.value?.comarca?.comarca_code;
  return comarcaCode.padStart(2, "0");
});

// unique comarca codes from municipalities
const municipalityComarcaCodes = computed(() => {
  return municipalities
    .filter((m) => m.comarca.comarca_code === data.value?.comarca?.comarca_code)
    .map((m) => m.municipality_code_6);
});

const {
  formattedData,
  loading,
  error,
  lastData,
  previousData,
  secondarySeriesData,
  lineChartData,
  dashArray,
  dataAvailable,
  lineChartDownloadData,
  beeswarmData,
  mapData,
  loadingComarques,
  extent,
  colorScale,
} = useEntityIndicatorData({
  primaryEndpoint: "getValues",
  secondaryEndpoints: [
    { endpoint: "getComarcaValues", labelKey: IDS.COMARCA, useFilter: true },
    { endpoint: "getProvinceValues", labelKey: IDS.PROVINCE },
  ],
  distributionEndpoint: "getValues",
  mapEndpoint: "getValues",
  mapFilter,
  entityRef: data,
});

const formattedProvinceData = computed(() => {
  return (
    secondarySeriesData.value.find((d) => d.labelKey === IDS.PROVINCE)
      ?.formattedData || []
  );
});

const lastProvinceData = computed(() => {
  return secondarySeriesData.value.find((d) => d.labelKey === IDS.PROVINCE)
    ?.lastData;
});

const loadingProvince = computed(() => {
  return (
    secondarySeriesData.value.find((d) => d.labelKey === IDS.PROVINCE)
      ?.loading || false
  );
});

const formattedComarcaData = computed(() => {
  return (
    secondarySeriesData.value.find((d) => d.labelKey === IDS.COMARCA)
      ?.formattedData || []
  );
});

const lastComarcaData = computed(() => {
  return secondarySeriesData.value.find((d) => d.labelKey === IDS.COMARCA)
    ?.lastData;
});

const loadingComarca = computed(() => {
  return (
    secondarySeriesData.value.find((d) => d.labelKey === IDS.COMARCA)
      ?.loading || false
  );
});

const statsComparisons = computed(() => [
  {
    label: t("COMARCA_AVERAGE", { comarca: data.value?.comarca?.comarca_name }),
    data: lastComarcaData.value,
    loading: loadingComarca.value,
  },
  {
    label: t("PROVINCE_AVERAGE"),
    data: lastProvinceData.value,
    loading: loadingProvince.value,
  },
]);

// linechart data
const provinceData = computed(() =>
  formattedProvinceData.value.map((v) => ({
    name: v.year,
    value: calculator.value(v),
    meta: v,
  })),
);

const comarcaData = computed(() =>
  formattedComarcaData.value.map((v) => ({
    name: v.year,
    value: calculator.value(v),
    meta: v,
  })),
);

const evolutionComparisons = computed(() => [
  {
    label: data.value?.comarca?.comarca_name,
    legendClass: "border-dotted",
    data: comarcaData.value,
  },
  {
    label: t("PROVINCIA_BARCELONA"),
    legendClass: "border-dashed",
    data: provinceData.value,
  },
]);

function goToMunicipi(e) {
  // router.push({ name: "municipi", params: { code } });
  // console.log("goToMunicipi", e.data);
  id.value = e.data.meta?.municipality_code || e.data.id.substr(0, 5);
}
</script>
