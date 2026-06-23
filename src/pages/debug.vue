<template>
  <div class="mb-16 px-8 text-sm">
    <h1 class="mb-4 text-xl font-bold">Debug: Indicator Data</h1>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <label class="font-semibold">Indicator ID:</label>
      <input
        v-model="indicatorInput"
        class="w-32 rounded border px-2 py-1"
        placeholder="e.g. 1.2.3"
        @keydown.enter="applyIndicator"
      />
      <button class="ot-btn px-3 py-1" @click="applyIndicator">Load</button>
      <select
        class="ot-btn w-full"
        @change="
          (e) => {
            indicatorInput = e.target.value;
            applyIndicator();
            e.target.value = '';
          }
        "
        :value="currentIndicator"
      >
        <option value="">— quick pick —</option>
        <optgroup
          v-for="(ids, listName) in INDICATOR_LISTS"
          :key="listName"
          :label="listName"
        >
          <option v-for="id in ids" :key="id" :value="id">
            {{ indicatorLabel(id) }}
          </option>
        </optgroup>
      </select>
      <span v-if="loading" class="text-gray-500">Loading...</span>
      <span v-if="error" class="text-red-500">Error loading data</span>
    </div>

    <div v-if="currentIndicator" class="mb-4 text-base font-semibold">
      {{ currentIndicator }} —
      <OTText
        :value="`SDGS.${pieces.sdg}.TARGETS.${pieces.target}.INDICATORS.${pieces.indicator}.DESCRIPTION`"
      />
    </div>

    <div class="mb-0">
      <MunicipalityFilterBar />
    </div>

    <div class="mb-8 grid grid-cols-2 gap-8">
      <!-- Comarca table -->
      <div
        v-if="currentIndicator && !loading && comarcaTableData.length"
        class="mt-10 overflow-x-auto font-mono"
      >
        <h2 class="mb-2 text-lg font-bold">Comarques</h2>
        <table class="border-collapse whitespace-nowrap text-xs">
          <thead>
            <tr class="sticky top-0 bg-gray-100">
              <th class="border border-gray-300 px-2 py-1 text-left">
                Comarca
              </th>
              <th class="border border-gray-300 px-2 py-1">Any</th>
              <th class="border border-gray-300 px-2 py-1">Població</th>
              <th class="border border-gray-300 px-2 py-1">Valor 1</th>
              <th class="border border-gray-300 px-2 py-1">Valor 2</th>
              <th class="border border-gray-300 bg-yellow-50 px-2 py-1">
                Final (DB)
              </th>
              <th class="border border-gray-300 bg-blue-50 px-2 py-1">
                Final mun
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in comarcaTableData"
              :key="row.id"
              :class="
                row.expectedFinal != null
                  ? row.final === row.expectedFinal
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                  : ''
              "
            >
              <td class="border border-gray-200 px-2 py-0.5">
                <RouterLink
                  :to="{
                    name: 'comarca-indicator',
                    params: {
                      comarcaId: row.id,
                      sdg: pieces.sdg,
                      targetId: pieces.target,
                      indicatorId: pieces.indicator,
                    },
                  }"
                  class="underline hover:text-blue-600"
                  >{{ row.name }}</RouterLink
                >
              </td>
              <td class="border border-gray-200 px-2 py-0.5 text-right">
                {{ row.year }}
              </td>
              <td class="border border-gray-200 px-2 py-0.5 text-right">
                {{ row.population }}
              </td>
              <td class="border border-gray-200 px-2 py-0.5 text-right">
                {{ row.value1 }}
              </td>
              <td class="border border-gray-200 px-2 py-0.5 text-right">
                {{ row.value2 }}
              </td>
              <td
                class="border border-gray-200 bg-yellow-50 px-2 py-0.5 text-right font-bold"
              >
                {{ row.final }}
              </td>
              <td
                class="border border-gray-200 bg-blue-50 px-2 py-0.5 text-right font-bold"
              >
                {{ row.expectedFinal ?? "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <!-- Aggregation table -->
        <div
          v-if="currentIndicator && !loading && aggregationTableData.length"
          class="mt-10 overflow-x-auto font-mono"
        >
          <h2 class="mb-2 text-lg font-bold">Agrupacions</h2>
          <table class="border-collapse whitespace-nowrap text-xs">
            <thead>
              <tr class="sticky top-0 bg-gray-100">
                <th class="border border-gray-300 px-2 py-1 text-left">
                  Agrupació
                </th>
                <th class="border border-gray-300 px-2 py-1">Any</th>
                <th class="border border-gray-300 px-2 py-1">Població</th>
                <th class="border border-gray-300 px-2 py-1">Valor 1</th>
                <th class="border border-gray-300 px-2 py-1">Valor 2</th>
                <th class="border border-gray-300 bg-yellow-50 px-2 py-1">
                  Final (DB)
                </th>
                <th class="border border-gray-300 bg-blue-50 px-2 py-1">
                  Final mun
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in aggregationTableData"
                :key="row.id"
                :class="
                  row.expectedFinal != null
                    ? row.final === row.expectedFinal
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                    : ''
                "
              >
                <td class="border border-gray-200 px-2 py-0.5">
                  <RouterLink
                    :to="{
                      name: 'agregacio-indicator',
                      params: {
                        agregacioId: row.id,
                        sdg: pieces.sdg,
                        targetId: pieces.target,
                        indicatorId: pieces.indicator,
                      },
                    }"
                    class="underline hover:text-blue-600"
                    >{{ row.name }}</RouterLink
                  >
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.year }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.population }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.value1 }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.value2 }}
                </td>
                <td
                  class="border border-gray-200 bg-yellow-50 px-2 py-0.5 text-right font-bold"
                >
                  {{ row.final }}
                </td>
                <td
                  class="border border-gray-200 bg-blue-50 px-2 py-0.5 text-right font-bold"
                >
                  {{ row.expectedFinal ?? "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Province table -->
        <div
          v-if="currentIndicator && !loading && provinceTableData.length"
          class="mt-6 overflow-x-auto font-mono"
        >
          <h2 class="mb-2 text-lg font-bold">Província</h2>
          <table class="border-collapse whitespace-nowrap text-xs">
            <thead>
              <tr class="sticky top-0 bg-gray-100">
                <th class="border border-gray-300 px-2 py-1 text-left">
                  Província
                </th>
                <th class="border border-gray-300 px-2 py-1">Any</th>
                <th class="border border-gray-300 px-2 py-1">Població</th>
                <th class="border border-gray-300 px-2 py-1">Valor 1</th>
                <th class="border border-gray-300 px-2 py-1">Valor 2</th>
                <th class="border border-gray-300 bg-yellow-50 px-2 py-1">
                  Final (DB)
                </th>
                <th class="border border-gray-300 bg-blue-50 px-2 py-1">
                  Final mun
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in provinceTableData"
                :key="row.id"
                :class="
                  row.expectedFinal != null
                    ? row.final === row.expectedFinal
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                    : ''
                "
              >
                <td class="border border-gray-200 px-2 py-0.5">
                  {{ row.name }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.year }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.population }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.value1 }}
                </td>
                <td class="border border-gray-200 px-2 py-0.5 text-right">
                  {{ row.value2 }}
                </td>
                <td
                  class="border border-gray-200 bg-yellow-50 px-2 py-0.5 text-right font-bold"
                >
                  {{ row.final }}
                </td>
                <td
                  class="border border-gray-200 bg-blue-50 px-2 py-0.5 text-right font-bold"
                >
                  {{ row.expectedFinal ?? "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="currentIndicator && !loading" class="overflow-x-auto font-mono">
      <div class="mb-2 text-xs text-gray-500">
        {{ rowsWithData }} / {{ tableData.length }} shown (of
        {{ municipalities?.length }} total) have data · year: {{ latestYear }} ·
        calculator: {{ calculatorName }} · decimals: {{ formatter.decimals }}
      </div>
      <table class="border-collapse whitespace-nowrap text-xs">
        <thead>
          <tr class="sticky top-0 bg-gray-100">
            <th class="border border-gray-300 px-2 py-1 text-left">Municipi</th>
            <th class="border border-gray-300 px-2 py-1 text-left">Comarca</th>
            <th class="border border-gray-300 px-2 py-1">Any</th>
            <th class="border border-gray-300 px-2 py-1">Població</th>
            <th class="border border-gray-300 px-2 py-1">Valor 1</th>
            <th class="border border-gray-300 px-2 py-1">Valor 2</th>
            <th class="border border-gray-300 bg-yellow-50 px-2 py-1">Final</th>
            <th
              v-for="agg in aggregations"
              :key="agg.slug"
              class="max-w-20 truncate border border-gray-300 px-1 py-1 text-center"
              :title="`${agg.name} (${agg.group})`"
            >
              {{ agg.slug }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableData"
            :key="row.id"
            :class="!row.hasData ? 'text-gray-300' : ''"
          >
            <td class="border border-gray-200 px-2 py-0.5">
              <RouterLink
                :to="{
                  name: 'municipi-indicator',
                  params: {
                    id: row.id,
                    sdg: pieces.sdg,
                    targetId: pieces.target,
                    indicatorId: pieces.indicator,
                  },
                }"
                class="underline hover:text-blue-600"
                >{{ row.name }}</RouterLink
              >
            </td>
            <td class="border border-gray-200 px-2 py-0.5">
              {{ row.comarca }}
            </td>
            <td class="border border-gray-200 px-2 py-0.5 text-right">
              {{ row.year ?? "—" }}
            </td>
            <td class="border border-gray-200 px-2 py-0.5 text-right">
              {{ row.population }}
            </td>
            <td class="border border-gray-200 px-2 py-0.5 text-right">
              {{ row.value1 }}
            </td>
            <td class="border border-gray-200 px-2 py-0.5 text-right">
              {{ row.value2 }}
            </td>
            <td
              class="border border-gray-200 bg-yellow-50 px-2 py-0.5 text-right font-bold"
            >
              {{ row.final }}
            </td>
            <td
              v-for="agg in aggregations"
              :key="agg.slug"
              class="border border-gray-200 px-1 py-0.5 text-center text-green-600"
            >
              {{ row.aggSlugs.includes(agg.slug) ? "✓" : "" }}
            </td>
          </tr>
        </tbody>
        <tfoot v-if="tableFooter">
          <tr class="bg-gray-50 font-bold">
            <td class="border border-gray-300 px-2 py-0.5" colspan="4">
              Σ ({{ rowsWithData }} municipalities)
            </td>
            <td class="border border-gray-300 px-2 py-0.5 text-right">
              {{ tableFooter.value1 }}
            </td>
            <td class="border border-gray-300 px-2 py-0.5 text-right">
              {{ tableFooter.value2 }}
            </td>
            <td
              class="border border-gray-300 bg-yellow-100 px-2 py-0.5 text-right"
            >
              {{ tableFooter.final }}
            </td>
            <td
              v-for="agg in aggregations"
              :key="agg.slug"
              class="border border-gray-300 px-1 py-0.5"
            />
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="!currentIndicator" class="text-gray-400">
      Enter an indicator ID above and press Load (or Enter).
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import useLoadData from "@/functions/useLoadData";
import useFilters from "@/functions/useFilters";
import useFilterOptions from "@/functions/useFilterOptions";
import calculations from "@/utils/indicators";
import { number } from "@/utils/filters";

useHead({
  title: () => `Debug`,
});

const INDICATOR_LISTS = {
  "Ratio (sum v1 / sum v2)": [
    "1.2.3",
    "1.3.1",
    "1.4.1",
    "1.4.2",
    "1.5.1",
    "2.1.1",
    "2.3.1",
    "2.3.2",
    "2.3.3",
    "2.3.4",
    "3.4.1",
    "3.6.1",
    "4.a.1",
    "4.1.1",
    "4.1.2",
    "4.2.1",
    "4.4.1",
    "4.4.2",
    "4.4.3",
    "4.4.4",
    "4.5.1",
    "5.1.1",
    "5.c.1",
    "5.c.2",
    "6.4.1",
    "7.2.1",
    "7.3.1",
    "8.3.1",
    "8.3.2",
    "8.3.4",
    "8.5.1",
    "8.5.2",
    "8.9.1",
    "9.2.1",
    "9.5.1",
    "11.2.1",
    "11.3.1",
    "11.4.2",
    "11.7.1",
    "12.1.1",
    "12.5.1",
    "12.5.2",
    "13.2.1",
    "15.4.1",
    "16.7.1",
    "17.1.1",
    "17.1.2",
    "17.2.1",
    "17.17.1",
  ],
  "Population-weighted average": [
    "1.1.1",
    "1.2.1",
    "1.2.2",
    "3.4.2",
    "5.1.1",
    "6.1.1",
    "7.1.1",
    "8.2.1",
    "8.3.3",
    "9.c.1",
    "10.1.2",
    "10.1.3",
    "10.1.4",
    "10.4.1",
    "10.4.2",
    "11.1.1",
    "11.3.2",
    "15.1.1",
    "15.1.2",
    "15.2.1",
    "16.6.1",
    "16.10.1",
  ],
};

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

function indicatorLabel(id) {
  const [sdg, target, indicator] = id.split(".");
  return `${id} — ${t(`SDGS.${sdg}.TARGETS.${target}.INDICATORS.${indicator}.DESCRIPTION`)}`;
}

const municipalities = inject("municipalities");
const aggregations = inject("aggregations");

const { municipi } = useFilters();
const { filteredMunicipalityOptions } = useFilterOptions();

// apply all bar filters + specific municipality selection
const visibleMunicipalities = computed(() => {
  let muns = filteredMunicipalityOptions.value;
  if (municipi.value.length) {
    const ids = new Set(municipi.value);
    muns = muns.filter((m) => ids.has(m.id));
  }
  return muns;
});

const indicatorInput = ref(route.query.indicator || "");
const currentIndicator = computed(() => route.query.indicator || "");

watch(
  () => route.query.indicator,
  (val) => {
    indicatorInput.value = val || "";
  },
);

const applyIndicator = () => {
  router.push({ query: { ...route.query, indicator: indicatorInput.value } });
};

// parse "1.2.3" → { sdg: "1", target: "2", indicator: "3" }
const pieces = computed(() => {
  const parts = currentIndicator.value.split(".");
  return {
    sdg: parts[0] || "",
    target: parts[1] || "",
    indicator: parts[2] || "",
  };
});

const formatter = computed(() => calculations[currentIndicator.value] || {});
const calculator = computed(
  () => formatter.value.calculation || ((d) => d.value),
);
const calculatorName = computed(
  () => formatter.value.calculation?.name || "none",
);

// ── Step 1: probe to discover the latest available year ──────────────────────
const probeParams = computed(() =>
  currentIndicator.value
    ? {
        "indicator.indicator_id": currentIndicator.value,
        "order[year]": "desc",
        itemsPerPage: 1,
      }
    : null,
);

const {
  data: probeData,
  loading: probeLoading,
  error: probeError,
  loadData: loadProbe,
} = useLoadData("getValues", [], true, probeParams, false, false);

const latestYear = computed(() => probeData.value?.member?.[0]?.year ?? null);

// ── Step 2: full data for that year only ─────────────────────────────────────
const mainParams = computed(() =>
  currentIndicator.value && latestYear.value
    ? {
        "indicator.indicator_id": currentIndicator.value,
        year: latestYear.value,
        itemsPerPage: 5000,
      }
    : null,
);

const {
  data,
  loading: mainLoading,
  error: mainError,
  loadData: loadMain,
} = useLoadData("getValues", [], true, mainParams, false, false);

// ── Population values ────────────────────────────────────────────────────────
const populationParams = computed(() =>
  latestYear.value ? { year: latestYear.value, itemsPerPage: 5000 } : null,
);

const {
  data: populationData,
  loading: populationLoading,
  error: populationError,
  loadData: loadPopulation,
} = useLoadData("getPopulations", [], true, populationParams, false, false);

// municipality_code → population number
const populationByCode = computed(() => {
  const members = populationData.value?.member || [];
  const map = {};
  for (const p of members) {
    const code = p.municipality?.municipality_code;
    if (code) map[code] = p.population_count;
  }
  return map;
});

const loading = computed(
  () =>
    probeLoading.value ||
    mainLoading.value ||
    comarcaLoading.value ||
    aggregationLoading.value ||
    provinceLoading.value ||
    populationLoading.value,
);
const error = computed(
  () =>
    probeError.value ||
    mainError.value ||
    comarcaError.value ||
    aggregationError.value ||
    provinceError.value ||
    populationError.value,
);

// ── Comarca values ───────────────────────────────────────────────────────────
const comarcaParams = computed(() =>
  currentIndicator.value && latestYear.value
    ? {
        "indicator.indicator_id": currentIndicator.value,
        year: latestYear.value,
        itemsPerPage: 5000,
      }
    : null,
);

const {
  data: comarcaData,
  loading: comarcaLoading,
  error: comarcaError,
  loadData: loadComarca,
} = useLoadData("getComarcaValues", [], true, comarcaParams, false, false);

// ── Province values ──────────────────────────────────────────────────────────
const provinceParams = computed(() =>
  currentIndicator.value && latestYear.value
    ? {
        "indicator.indicator_id": currentIndicator.value,
        year: latestYear.value,
        itemsPerPage: 100,
      }
    : null,
);

const {
  data: provinceData,
  loading: provinceLoading,
  error: provinceError,
  loadData: loadProvince,
} = useLoadData("getProvinceValues", [], true, provinceParams, false, false);

// ── Aggregation values ───────────────────────────────────────────────────────
const aggregationParams = computed(() =>
  currentIndicator.value && latestYear.value
    ? {
        "indicator.indicator_id": currentIndicator.value,
        year: latestYear.value,
        itemsPerPage: 5000,
      }
    : null,
);

const {
  data: aggregationData,
  loading: aggregationLoading,
  error: aggregationError,
  loadData: loadAggregation,
} = useLoadData(
  "getAggregationValues",
  [],
  true,
  aggregationParams,
  false,
  false,
);

watch(
  currentIndicator,
  async (val) => {
    if (!val) return;
    await loadProbe();
    loadMain();
    loadComarca();
    loadAggregation();
    loadProvince();
    loadPopulation();
  },
  { immediate: true },
);

const valuesByCode = computed(() => {
  const members = data.value?.member || [];
  const map = {};
  for (const v of members) {
    const code = v.municipality?.municipality_code;
    if (!code) continue;
    if (!map[code] || v.year > map[code].year) {
      map[code] = v;
    }
  }
  return map;
});

const tableData = computed(() => {
  if (!municipalities.value) return [];
  const fmt = formatter.value;
  const calc = calculator.value;
  return visibleMunicipalities.value.map((m) => {
    const v = valuesByCode.value[m.id];
    const aggSlugs = m.aggregations?.map((a) => a.slug) || [];
    let final = "—";
    if (v) {
      final = fmt.textFormat
        ? fmt.textFormat(v) // categorical: returns raw translation key
        : number(calc(v), fmt.decimals ?? 2);
    }
    return {
      id: m.id,
      name: m.name,
      comarca: m.comarca?.comarca_name || "—",
      year: v?.year ?? null,
      population: number(populationByCode.value[m.id] ?? null, 0),
      rawValue1: v?.value ?? null,
      rawValue2: v?.value2 ?? null,
      value1: v ? number(v.value, fmt.decimals1 ?? 4) : "—",
      value2: v?.value2 != null ? number(v.value2, fmt.decimals2 ?? 4) : "—",
      final,
      aggSlugs,
      hasData: !!v,
    };
  });
});

const rowsWithData = computed(
  () => tableData.value.filter((r) => r.hasData).length,
);

const tableFooter = computed(() => {
  const fmt = formatter.value;
  const calc = calculator.value;
  const rows = tableData.value.filter((r) => r.hasData);
  if (!rows.length || fmt.textFormat) return null;
  const sumV1 = rows.reduce((s, r) => s + (r.rawValue1 ?? 0), 0);
  const hasV2 = rows.some((r) => r.rawValue2 != null);
  const sumV2 = hasV2 ? rows.reduce((s, r) => s + (r.rawValue2 ?? 0), 0) : null;
  const finalVal = calc({ value: sumV1, value2: sumV2 });
  return {
    value1: number(sumV1, fmt.decimals1 ?? 4),
    value2: sumV2 != null ? number(sumV2, fmt.decimals2 ?? 4) : "—",
    final: number(finalVal, fmt.decimals ?? 2),
  };
});

// All municipalities with data (unfiltered, for comarca/aggregation cross-checks)
const allMunValues = computed(() => {
  const members = data.value?.member || [];
  const map = {};
  for (const v of members) {
    const code = v.municipality?.municipality_code;
    if (!code) continue;
    if (!map[code] || v.year > map[code].year) map[code] = v;
  }
  return map;
});

const isPopulationWeighted = computed(
  () =>
    INDICATOR_LISTS["Population-weighted average"]?.includes(
      currentIndicator.value,
    ) ?? false,
);

function computeExpectedFinal(munList) {
  const fmt = formatter.value;
  const calc = calculator.value;
  if (fmt.textFormat) return null;

  if (isPopulationWeighted.value) {
    const rows = munList.filter(
      (m) => allMunValues.value[m.id] && populationByCode.value[m.id] != null,
    );
    if (!rows.length) return null;
    const totalPop = rows.reduce(
      (s, m) => s + (populationByCode.value[m.id] ?? 0),
      0,
    );
    if (!totalPop) return null;
    const weightedSum = rows.reduce(
      (s, m) =>
        s +
        (allMunValues.value[m.id].value ?? 0) *
          (populationByCode.value[m.id] ?? 0),
      0,
    );
    return number(weightedSum / totalPop, fmt.decimals ?? 2);
  }

  const rows = munList.filter((m) => allMunValues.value[m.id]);
  if (!rows.length) return null;
  const sumV1 = rows.reduce(
    (s, m) => s + (allMunValues.value[m.id].value ?? 0),
    0,
  );
  const hasV2 = rows.some((m) => allMunValues.value[m.id].value2 != null);
  const sumV2 = hasV2
    ? rows.reduce((s, m) => s + (allMunValues.value[m.id].value2 ?? 0), 0)
    : null;
  return number(calc({ value: sumV1, value2: sumV2 }), fmt.decimals ?? 2);
}

// ── Comarca table ────────────────────────────────────────────────────────────
const comarcaTableData = computed(() => {
  const members = comarcaData.value?.member || [];
  if (!members.length) return [];
  const fmt = formatter.value;
  const calc = calculator.value;
  return members
    .map((v) => {
      const comarcaCode = v.comarca?.comarca_code;
      const munInComarca =
        municipalities.value?.filter(
          (m) => m.comarca?.comarca_code === comarcaCode,
        ) || [];
      const expectedFinal = computeExpectedFinal(munInComarca);
      const raw = calc(v);
      const final = fmt.textFormat
        ? fmt.textFormat(v)
        : number(raw, fmt.decimals ?? 2);
      return {
        id: comarcaCode,
        name: v.comarca?.comarca_name || "—",
        year: v.year,
        population: number(
          munInComarca.reduce(
            (s, m) => s + (populationByCode.value[m.id] ?? 0),
            0,
          ),
          0,
        ),
        value1: number(v.value, fmt.decimals1 ?? 4),
        value2: v.value2 != null ? number(v.value2, fmt.decimals2 ?? 4) : "—",
        final,
        expectedFinal,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

// ── Aggregation table ────────────────────────────────────────────────────────
const aggregationTableData = computed(() => {
  const members = aggregationData.value?.member || [];
  if (!members.length) return [];
  const fmt = formatter.value;
  const calc = calculator.value;
  return members
    .map((v) => {
      const slug = v.aggregation?.slug;
      const munInAgg =
        municipalities.value?.filter((m) =>
          m.aggregations?.some((a) => a.slug === slug),
        ) || [];
      const expectedFinal = computeExpectedFinal(munInAgg);
      const raw = calc(v);
      const final = fmt.textFormat
        ? fmt.textFormat(v)
        : number(raw, fmt.decimals ?? 2);
      return {
        id: slug,
        name: v.aggregation?.name || "—",
        year: v.year,
        population: number(
          munInAgg.reduce((s, m) => s + (populationByCode.value[m.id] ?? 0), 0),
          0,
        ),
        value1: number(v.value, fmt.decimals1 ?? 4),
        value2: v.value2 != null ? number(v.value2, fmt.decimals2 ?? 4) : "—",
        final,
        expectedFinal,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

// ── Province table ───────────────────────────────────────────────────────────
const provinceTableData = computed(() => {
  const members = provinceData.value?.member || [];
  if (!members.length) return [];
  const fmt = formatter.value;
  const calc = calculator.value;
  const expectedFinal = computeExpectedFinal(municipalities.value || []);
  return members.map((v) => {
    const raw = calc(v);
    const final = fmt.textFormat
      ? fmt.textFormat(v)
      : number(raw, fmt.decimals ?? 2);
    return {
      id: v.province?.id ?? "province",
      name: v.province?.province_name || "Barcelona",
      year: v.year,
      population: number(
        (municipalities.value || []).reduce(
          (s, m) => s + (populationByCode.value[m.id] ?? 0),
          0,
        ),
        0,
      ),
      value1: number(v.value, fmt.decimals1 ?? 4),
      value2: v.value2 != null ? number(v.value2, fmt.decimals2 ?? 4) : "—",
      final,
      expectedFinal,
    };
  });
});
</script>
