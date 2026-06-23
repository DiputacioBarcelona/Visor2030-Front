<template>
  <div>
    <section class="pb-16">
      <div class="ot-container">
        <div class="grid gap-8 md:grid-cols-2">
          <div class="md:pt-8">
            <h1 class="ot-title-1"><OTText value="HOMEPAGE.TITLE" /></h1>

            <p class="mb-8 tracking-wide md:mb-8">
              <OTText value="HOMEPAGE.DESCRIPTION" />
            </p>

            <div class="">
              <div class="mb-6 flex items-baseline gap-x-7">
                <button
                  @click="scope = 'municipi'"
                  class="text-grey-4 border-b-2 pb-2 text-sm font-semibold capitalize outline-offset-2 focus-visible:outline-secondary"
                  :class="
                    scope === 'municipi'
                      ? 'border-primary text-primary brightness-95'
                      : 'hover:border-grey-4 border-transparent'
                  "
                >
                  <OTText value="MUNICIPIS" />
                </button>
                <button
                  @click="scope = 'comarca'"
                  class="text-grey-4 border-b-2 pb-2 text-sm font-semibold capitalize outline-offset-2 focus-visible:outline-secondary"
                  :class="
                    scope === 'comarca'
                      ? 'border-primary text-primary brightness-95'
                      : 'hover:border-grey-4 border-transparent'
                  "
                >
                  <OTText value="COMARQUES" />
                </button>
                <button
                  @click="scope = 'aggregations'"
                  class="text-grey-4 border-b-2 pb-2 text-sm font-semibold capitalize outline-offset-2 focus-visible:outline-secondary"
                  :class="
                    scope === 'aggregations'
                      ? 'border-primary text-primary brightness-95'
                      : 'hover:border-grey-4 border-transparent'
                  "
                >
                  <OTText value="AGREGACIONS" />
                </button>
              </div>

              <label for="municipalities" class="sr-only"
                ><OTText :value="defaultOptionName" />
              </label>

              <SearchSelect
                v-if="scope !== 'aggregations'"
                class="hidden w-full md:block md:w-[380px]"
                main-class="rounded-full bg-gray-100 ot-btn border-gray-100 font-semibold"
                popover-class="w-[300px]"
                :options="useOptions"
                @input="routeToTarget"
                :default-option-name="defaultOptionName"
                :placeholder="placeholder"
                label="municipalities"
              />

              <OTSelect
                v-else
                :options="filteredOtherGroupingOptions"
                @update:model-value="routeToTarget"
                class="hidden w-full md:block md:w-[380px]"
                main-class="rounded-full bg-gray-100 ot-btn border-gray-100 font-semibold"
                popover-class="w-[275px]"
                :allow-search="false"
                :default-option-name="defaultOptionName"
                label="other"
                :placeholder="placeholder"
                :options-text="t('OPTIONS')"
                :leaf-only="true"
                popover-height="max-h-[310px]"
              />

              <select
                id="municipalities"
                @change="routeToTarget"
                class="ot-btn w-full rounded-full border-gray-100 bg-gray-100 font-semibold md:hidden"
              >
                <option>{{ defaultOptionName }}</option>
                <option
                  v-for="option in useOptions"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.formattedName || option.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="relative">
            <div class="absolute right-0">
              <div class="mb-1 text-right text-xs text-gray-500">
                <OTText value="SYNTHETIC_INDEX" />&nbsp;
                <OTText value="SDG" :options="{ sdg }" />
              </div>
              <div class="flex items-center justify-end gap-1">
                <LegendColor
                  :color="colorScale"
                  class="legend-color max-w-48 rounded text-gray-500"
                  :show-axis="true"
                  :margin="{ top: 0, right: 0, bottom: 0, left: 0 }"
                  :height="8"
                />
              </div>
              <div>
                <div class="ml-auto mt-6 h-2 w-[38px] bg-gray-100"></div>
                <div class="mt-0.5 text-right text-xs text-gray-500">
                  <OTText value="ND" />
                </div>
              </div>
            </div>

            <BarcelonaMap
              class="mt-12 lg:mt-0"
              :data="mapData"
              :color="colorScaleMap"
              @select="goToMunicipi"
              @hover="toggleMapTooltip"
            />

            <NavigateODS
              :sdg="sdg"
              @previous="previousSDG"
              @next="nextSDG"
              class="mt-4"
            />

            <LoadingSpinner
              :loading="loading"
              class="inset-0"
              bg-color-class="bg-white/50"
              :border-class="`h-6 w-6 border-2 border-primary`"
            />

            <OTTooltip :info="tooltip" ref="tooltipElement1" :smooth="false">
              <div class="relative flex items-start">
                <div v-if="tooltip.data" class="space-y-2 overflow-x-hidden">
                  <div class="mt-0.5 text-base font-semibold">
                    {{
                      tooltip.data.name ||
                      getMunicipalityByCode(tooltip.data.id)?.name
                    }}
                  </div>
                  <hr />

                  <div>
                    <div class="mb-1 text-gray-500">
                      <OTText :value="`SDGS.${sdg}.TITLE`" />
                      <!-- <OTText value="SYNTHETIC_INDEX" /> -->
                    </div>
                    <div class="text-2xl">
                      <span class="font-medium"
                        ><span v-if="tooltip.data.value !== undefined">{{
                          number(tooltip.data.value)
                        }}</span>
                        <span v-else><OTText value="ND" /></span
                      ></span>
                    </div>
                  </div>

                  <!-- <pre>{{ tooltip.data }}</pre> -->
                </div>
              </div>
            </OTTooltip>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-16">
      <div class="ot-container">
        <div class="grid gap-8 md:grid-cols-2">
          <div class="">
            <h2 class="ot-title-2 text-gray-800">
              <OTText value="HOMEPAGE.SUBTITLE" />
            </h2>

            <p class="mb-8 tracking-wide">
              <OTText value="HOMEPAGE.SDG_DESCRIPTION" />
            </p>

            <label for="ods" class="sr-only"
              ><OTText value="NAVEGA_PER_ODS"
            /></label>

            <OTSelectODS
              label="ods"
              v-model="ods"
              class="hidden w-[380px] md:block"
              main-class="rounded-full bg-gray-100 ot-btn border-gray-100 font-semibold"
            />

            <select
              id="ods"
              @change="routeSDG"
              class="ot-btn w-full rounded-full border-gray-100 bg-gray-100 font-semibold md:hidden"
            >
              <option>{{ $t("NAVEGA_PER_ODS") }}</option>
              <option
                v-for="option in sdgOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
          </div>

          <div>
            <div class="relative h-64">
              <BeeswarmChart
                :data="beeswarmData"
                :radius="3"
                :color="beeswarmColor"
                :extent="[0, 100]"
              />

              <LoadingSpinner
                :loading="loading"
                class="inset-0"
                bg-color-class="bg-gray-50/50"
                :border-class="`h-6 w-6 border-2 border-primary`"
              />
            </div>

            <NavigateODS
              :sdg="sdg"
              @previous="previousSDG"
              @next="nextSDG"
              class="mt-4"
            />
          </div>
        </div>

        <!-- <pre class="ot-code">{{ mapData }}</pre> -->
      </div>
    </section>

    <section class="bg-main-80 text-white">
      <div class="ot-container">
        <div class="grid gap-4 py-8 md:grid-cols-2 md:gap-8 md:py-16">
          <div class="flex flex-col">
            <h3 class="ot-title-3 text-xl font-semibold">
              <OTText value="HOMEPAGE.FOOTER_TITLE" />
            </h3>
            <div class="prose text-sm tracking-wide text-white">
              <OTText value="HOMEPAGE.FOOTER_TEXT" markdown />
            </div>
            <div class="mt-auto">
              <RouterLink
                class="ot-btn rounded-full bg-white px-6 py-2 text-sm font-semibold text-gray-500 hover:bg-white/30"
                :to="{ name: 'about' }"
              >
                <OTText value="HOMEPAGE.ABOUT_BUTTON" />
              </RouterLink>
            </div>
          </div>
          <div class="flex flex-col">
            <h3 class="ot-title-3 text-xl font-semibold">
              <OTText value="METODOLOGIA" />
            </h3>
            <div class="prose mb-8 text-sm tracking-wide text-white">
              <OTText value="METODOLOGIA_SHORT_DESC" markdown />
            </div>
            <div class="mt-auto">
              <RouterLink
                class="ot-btn rounded-full bg-white px-6 py-2 text-sm font-semibold text-gray-500 hover:bg-white/30"
                :to="{ name: 'metodologia' }"
              >
                <OTText value="HOMEPAGE.METODOLOGIA_BUTTON" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import useLoadData from "@/functions/useLoadData";
import colors from "@/utils/colors";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import useTooltip from "@/functions/useTooltip";
import { getMunicipalityByCode } from "@/utils/helpers";
import { number } from "@/utils/filters";
import * as d3 from "d3";
import useFilterOptions from "@/functions/useFilterOptions";
import useFilters from "@/functions/useFilters";

const { t } = useI18n();

const router = useRouter();

const { scope } = useFilters();
const { filteredOtherGroupingOptions } = useFilterOptions();

useHead({
  // the number of the indicator, its name and then the name of the city
  title: () => `${t("TITLE")}`,
  // meta: () => [
  //   {
  //     name: "description",
  //     content: "Municipi",
  //   },
  // ],
});

// const scope = ref("municipi"); // comarca or municipi

const municipalityOptions = inject("municipalities");
const comarcaOptions = inject("comarcas");
const aggregationOptions = inject("aggregations");

const useOptions = computed(() => {
  if (scope.value === "municipi") {
    return municipalityOptions.value;
  } else if (scope.value === "comarca") {
    return comarcaOptions.value;
  } else if (scope.value === "aggregations") {
    return aggregationOptions.value.filter(
      (option) =>
        option.id !== "rural-especial-atencio" && option.id !== "incorporat",
    );
  }
  return [];
});

function routeMunicipality(event) {
  const id = event?.target?.value || event;
  router.push({ name: "municipi", params: { id } });
}

function routeComarca(event) {
  const id = event?.target?.value || event;
  router.push({ name: "comarca", params: { comarcaId: id } });
}

function routeAggregation(event) {
  const id = event?.target?.value || event;
  router.push({ name: "agregacio", params: { agregacioId: id } });
}

function routeToTarget(event) {
  // console.log(event);
  if (scope.value === "municipi") {
    routeMunicipality(event);
  } else if (scope.value === "comarca") {
    routeComarca(event);
  } else if (scope.value === "aggregations") {
    routeAggregation(event);
  }
}

const defaultOptionName = computed(() => {
  if (scope.value === "municipi") {
    return t("SELECCIONA_UN_MUNICIPI");
  } else if (scope.value === "comarca") {
    return t("SELECCIONA_UNA_COMARCA");
  } else if (scope.value === "aggregations") {
    return t("SELECCIONA_UNA_AGREGACIO");
  }
  return "";
});

const placeholder = computed(() => {
  if (scope.value === "municipi") {
    return t("CERCA_MUNICIPI");
  } else if (scope.value === "comarca") {
    return t("CERCA_COMARCA");
  } else if (scope.value === "aggregations") {
    return t("CERCA_AGREGACIO");
  }
  return "";
});

const currentIndex = ref(1);

// just for naming convention...
const sdg = computed(() => {
  return currentIndex.value;
});

const beeswarmColor = computed(() => {
  return colors.sdg[currentIndex.value];
});

// interval to change the currentIndex every 5 seconds to the next in the indicators array, and loop back to the first one
let interval;

function startInterval() {
  // reset interval
  // if (interval) clearInterval(interval);
  // // set the interval to change the currentIndex every 5 seconds to the next in the indicators array, and loop back to the first one
  // interval = setInterval(() => {
  //   // increase the index by 1, if it is greater 17 it will be 1
  //   currentIndex.value = (currentIndex.value % 17) + 1;
  // }, 5000);
}

onBeforeUnmount(() => {
  clearInterval(interval);
});
onMounted(() => {
  // start the interval when the component is mounted
  // startInterval();
});

function previousSDG() {
  // decrease the index by 1, if it is less than 1 it will be 17
  currentIndex.value = ((currentIndex.value - 2 + 17) % 17) + 1;

  startInterval();
}
function nextSDG() {
  // increase the index by 1, if it is greater 17 it will be 1
  currentIndex.value = (currentIndex.value % 17) + 1;

  startInterval();
}

const { data: allData, loading } = useLoadData(
  "getAllSyntheticSDGValues",
  [],
  false,
);

const sdgValuesData = computed(() => {
  return allData.value.filter((e) => e.sdg === currentIndex.value);
});

const beeswarmData = computed(() => {
  const data = sdgValuesData.value.map((item) => ({
    id: item.municipality_code_6.substring(0, 5),
    name: item.municipality_name,
    value: item.value,
    municipality_code_6: item.municipality_code_6,
  }));

  return data;
});

const mapData = computed(() => {
  const data = {};
  beeswarmData.value.forEach((item) => {
    data[item.municipality_code_6] = { value: item.value };
  });
  return data;
});

function goToMunicipi(e) {
  const id = e.data.id.substring(0, 5);
  router.push({ name: "municipi", params: { id } });
}

const sdgOptions = computed(() => {
  return Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}. ${t(`SDGS.${i + 1}.TITLE`)}`,
  }));
});

function routeSDG(event) {
  const sdg = event?.target?.value || event;

  router.push({
    // if current route is home, go to municipi, else stay in current route
    name: "sdg",
    params: {
      sdg,
    },
  });
}

const ods = ref(null);

watch(ods, (sdg) => {
  router.push({ name: "sdg", params: { sdg } });
});

const tooltipElement1 = ref(null);

const [tooltip, toggleTooltip] = useTooltip();

function toggleMapTooltip(e) {
  if (!e) {
    tooltip.value = null;
  } else {
    tooltip.value = {
      data: e.data,
    };
  }
  toggleTooltip(e);
}

const colorScale = computed(() => {
  // a sequential color scale from  colors.map[sdg.value].min to colors.map[sdg.value].max
  // const interpolator = d3.interpolateRgb(
  //   colors.map[sdg.value].min,
  //   colors.map[sdg.value].max,
  // );
  // return d3.scaleSequential(extent.value, interpolator);

  // a threshold scale with 5 colors
  // colors are colors.SDG_VARIANTS[sdg.value][20], then [40], [60], [80], [100]
  const scale = d3
    .scaleThreshold()
    .domain([0, 100])
    .range([
      colors.SDG_VARIANTS[sdg.value][20],
      colors.SDG_VARIANTS[sdg.value][40],
      colors.SDG_VARIANTS[sdg.value][60],
      colors.SDG_VARIANTS[sdg.value][80],
      colors.SDG_VARIANTS[sdg.value][100],
    ]);
  return scale;
});

const colorScaleMap = computed(() => {
  // a sequential color scale from  colors.map[sdg.value].min to colors.map[sdg.value].max
  // const interpolator = d3.interpolateRgb(
  //   colors.map[sdg.value].min,
  //   colors.map[sdg.value].max,
  // );
  // return d3.scaleSequential(extent.value, interpolator);

  // a threshold scale with 5 colors
  // colors are colors.SDG_VARIANTS[sdg.value][20], then [40], [60], [80], [100]
  const scale = d3
    .scaleThreshold()
    .domain([0, 20, 40, 60, 80, 100])
    .range([
      colors.gray[100],
      colors.SDG_VARIANTS[sdg.value][20],
      colors.SDG_VARIANTS[sdg.value][40],
      colors.SDG_VARIANTS[sdg.value][60],
      colors.SDG_VARIANTS[sdg.value][80],
      colors.SDG_VARIANTS[sdg.value][100],
    ]);
  return scale;
});
</script>

<style>
.legend-color line {
  stroke: white;
}
</style>
