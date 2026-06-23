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
        :loading="loadingComarques"
        :municipality-comarca-codes="aggregationMunicipalityCodes"
        @select="goToMunicipi"
        :name="data?.name"
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
      entity-type="agregacio"
    />

    <IndicatorDistribution
      :data="beeswarmData"
      :selected-id="aggregationMunicipalityIds"
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
import { useRoute, useRouter } from "vue-router";
import useEntityIndicatorData from "@/functions/useEntityIndicatorData";
import * as IDS from "@/utils/ids";
import IndicatorStats from "@/components/indicator/IndicatorStats.vue";
import IndicatorEvolution from "@/components/indicator/IndicatorEvolution.vue";
import IndicatorDistribution from "@/components/indicator/IndicatorDistribution.vue";
import IndicatorMap from "@/components/indicator/IndicatorMap.vue";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

const { sdg, pieces, fullIndicatorId, targetId, indicatorId, agregacioId } =
  useFilters();
const { calculator } = useFormatter();

const data = inject("entity");

const municipalities = inject("municipalities");

const aggregationMunicipalities = computed(() =>
  municipalities.value.filter((m) =>
    m.aggregations?.some((a) => a.slug === agregacioId.value),
  ),
);

const aggregationMunicipalityIds = computed(() =>
  aggregationMunicipalities.value.map((m) => m.id),
);

const aggregationMunicipalityCodes = computed(() =>
  aggregationMunicipalities.value.map((m) => m.municipality_code_6),
);

const mapFilter = computed(() => ({
  "indicator.indicator_id": fullIndicatorId.value,
  "municipality.aggregations.slug": agregacioId.value,
}));

useHead({
  title: () =>
    `${fullIndicatorId.value} - ${t(`SDGS.${sdg.value}.TARGETS.${pieces.value.target}.INDICATORS.${pieces.value.indicator}.TITLE`)} - ${data.value?.name}`,
});

const {
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
  primaryEndpoint: "getAggregationValues",
  secondaryEndpoints: [
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

const statsComparisons = computed(() => [
  {
    label: t("PROVINCE_AVERAGE"),
    data: lastProvinceData.value,
    loading: loadingProvince.value,
  },
]);

const provinceData = computed(() =>
  formattedProvinceData.value.map((v) => ({
    name: v.year,
    value: calculator.value(v),
    meta: v,
  })),
);

const evolutionComparisons = computed(() => [
  {
    label: t("PROVINCIA_BARCELONA"),
    legendClass: "border-dashed",
    data: provinceData.value,
  },
]);

function goToMunicipi(e) {
  const municipalityId =
    e.data.meta?.municipality_code || e.data.id.substr(0, 5);
  router.push({
    name: "municipi-indicator",
    params: {
      id: municipalityId,
      sdg: sdg.value,
      targetId: targetId.value,
      indicatorId: indicatorId.value,
    },
    query: route.query,
  });
}
</script>
