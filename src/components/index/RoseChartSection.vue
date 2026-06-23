<template>
  <section class="py-6">
    <div class="ot-container">
      <img
        :src="`${basePath}img/icons/hash.svg`"
        alt=""
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

      <div class="mb-12 grid items-end gap-4 md:grid-cols-2 print:mb-4">
        <header>
          <h2 class="ot-title-2 mb-2" id="points">
            <OTText value="POINTS_BY_SDG" />
          </h2>
          <div class="ot-line text-sm tracking-wide">
            <OTText value="POINTS_DESCRIPTION" />
          </div>
        </header>
        <div class="text-balance text-xs text-main-100 print:hidden">
          <OTText value="CLICK_SDG" />
        </div>
      </div>

      <!-- ROSECHART -->
      <div class="relative mt-2 flex justify-center md:mt-6">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center font-semibold text-main-80">
            <OTText
              :value="centerName"
              :options="{ sdg: highlightedRoseChart }"
            />
            <div class="relative md:mt-2">
              <span
                class="text-3xl"
                v-if="highlightedRoseChart === 14 && !isCoastal"
              >
                <OTText value="NA" />
              </span>
              <span
                v-else
                class="text-5xl transition-opacity"
                :class="{ 'opacity-0': firstLoad }"
                >{{ number(centerNumber, 0) }}</span
              >
              <LoadingSpinner
                :loading="loadingSynthData"
                class="inset-0"
                bg-color-class="bg-white/70"
                border-class="h-10 w-10 border-4 border-main-80"
              />
            </div>
          </div>
        </div>

        <div
          class="absolute inset-0 hidden grid-cols-2 gap-80 md:grid print:grid"
        >
          <!-- hover:bg-sdg-1 hover:bg-sdg-2 hover:bg-sdg-3 hover:bg-sdg-4 hover:bg-sdg-5 hover:bg-sdg-6 hover:bg-sdg-7 hover:bg-sdg-8 hover:bg-sdg-9 hover:bg-sdg-10 hover:bg-sdg-11 hover:bg-sdg-12 hover:bg-sdg-13 hover:bg-sdg-14 hover:bg-sdg-15 hover:bg-sdg-16 hover:bg-sdg-17 -->
          <!-- hover:border-sdg-1 hover:border-sdg-2 hover:border-sdg-3 hover:border-sdg-4 hover:border-sdg-5 hover:border-sdg-6 hover:border-sdg-7 hover:border-sdg-8 hover:border-sdg-9 hover:border-sdg-10 hover:border-sdg-11 hover:border-sdg-12 hover:border-sdg-13 hover:border-sdg-14 hover:border-sdg-15 hover:border-sdg-16 hover:border-sdg-17 -->
          <!-- focus:border-sdg-1 focus:border-sdg-2 focus:border-sdg-3 focus:border-sdg-4 focus:border-sdg-5 focus:border-sdg-6 focus:border-sdg-7 focus:border-sdg-8 focus:border-sdg-9 focus:border-sdg-10 focus:border-sdg-11 focus:border-sdg-12 focus:border-sdg-13 focus:border-sdg-14 focus:border-sdg-15 focus:border-sdg-16 focus:border-sdg-17 -->

          <!-- bg-sdg-1 bg-sdg-2 bg-sdg-3 bg-sdg-4 bg-sdg-5 bg-sdg-6 bg-sdg-7 bg-sdg-8 bg-sdg-9 bg-sdg-10 bg-sdg-11 bg-sdg-12 bg-sdg-13 bg-sdg-14 bg-sdg-15 bg-sdg-16 bg-sdg-17 -->

          <div class="flex flex-col items-end justify-between">
            <RouterLink
              v-for="item in roseChartLinks.slice(9).reverse()"
              :key="item.id"
              class="ot-btn group z-[5] justify-end gap-2 truncate rounded-full border border-transparent px-3 py-1 text-sm tracking-wide duration-0 hover:text-white lg:py-2 print:text-xs"
              :class="[
                item.class,
                'hover:bg-sdg-' + item.id,
                `focus:ring-sdg-${item.id}/30`,
                `focus:border-transparent`,
                {
                  [`bg-sdg-${item.id} text-white`]:
                    item.id === sdg || item.id === highlightedRoseChart,
                },
              ]"
              :to="item.to"
              @mouseenter="highlightedRoseChart = item.id"
              @mouseleave="highlightedRoseChart = null"
              >{{ item.id }}. <OTText :value="`SDGS.${item.id}.TITLE`" /><span
                class="h-3 w-3 rounded-full group-hover:bg-white"
                :class="[
                  `bg-sdg-${item.id}`,
                  {
                    [`bg-white`]:
                      item.id === sdg || item.id === highlightedRoseChart,
                  },
                ]"
              ></span
            ></RouterLink>
          </div>
          <div class="flex flex-col items-start justify-between">
            <RouterLink
              v-for="item in roseChartLinks.slice(0, 9)"
              :key="item.id"
              class="ot-btn group z-[5] gap-2 truncate rounded-full border border-transparent px-3 py-1 text-sm tracking-wide duration-0 hover:text-white lg:py-2 print:text-xs"
              :class="[
                item.class,
                'hover:bg-sdg-' + item.id,
                `focus:ring-sdg-${item.id}/30`,
                `focus:border-transparent`,
                {
                  [`bg-sdg-${item.id} text-white`]:
                    item.id === sdg || item.id === highlightedRoseChart,
                },
              ]"
              :to="item.to"
              @mouseenter="highlightedRoseChart = item.id"
              @mouseleave="highlightedRoseChart = null"
              ><span
                class="h-3 w-3 rounded-full group-hover:bg-white"
                :class="[
                  `bg-sdg-${item.id}`,
                  {
                    [`bg-white`]:
                      item.id === sdg || item.id === highlightedRoseChart,
                  },
                ]"
              ></span
              >{{ item.id }}. <OTText :value="`SDGS.${item.id}.TITLE`"
            /></RouterLink>
          </div>
        </div>

        <RoseChart
          class="z-[5] w-full max-w-[360px] rounded-full"
          :data="roseChartData"
          :max="100"
          :inner-radius="0.5"
          :show-labels="false"
          :show-values="false"
          :bg-color="colors.gray[50]"
          :highlighted="highlightedRoseChart"
          @select="goToSDG"
          @hover="hoverRoseChart"
          :stroke-width="0"
        />

        <OTTooltip
          :info="rosechartTooltip"
          ref="tooltipElement2"
          :smooth="false"
          class="md:hidden"
        >
          <div class="relative flex items-start">
            <div
              v-if="rosechartTooltip?.data"
              class="space-y-2 overflow-x-hidden"
            >
              <div class="mt-0.5 text-base font-semibold">
                {{ rosechartTooltip.data.data?.id }}.
                <OTText
                  :value="`SDGS.${rosechartTooltip.data.data?.id}.TITLE`"
                />
              </div>
              <hr />

              <div>
                <div class="mb-1 text-gray-500">
                  <OTText value="SYNTHETIC_INDEX" />
                </div>

                <div class="text-2xl">
                  <span
                    class="font-medium"
                    v-if="rosechartTooltip.data.data?.id === 14 && !isCoastal"
                  >
                    <OTText value="NA" />
                  </span>
                  <span v-else class="font-medium">{{
                    number(rosechartTooltip.data?.data?.value, 2)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </OTTooltip>
      </div>
    </div>
  </section>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useGetLink from "@/functions/useGetLink";
import useEntityType from "@/functions/useEntityType";
import colors from "@/utils/colors";
import { useRouter, useRoute } from "vue-router";
import useTooltip from "@/functions/useTooltip";
import { number } from "@/utils/filters";
import { basePath } from "@/config";
import {
  municipisWithCoast,
  comarcasWithCoast,
  aggregationsWithCoast,
} from "@/utils/helpers";
import useSyntheticEntityData from "@/functions/useSyntheticEntityData";

const props = defineProps({
  endpoint: {
    type: String,
    default: "getSyntheticSDGValues",
  },
});

const router = useRouter();
const route = useRoute();

const { id, comarcaId, agregacioId, sdg, year } = useFilters();
const entityType = useEntityType();

const entityIdParam = computed(() =>
  entityType.value === "comarca"
    ? { comarcaId: comarcaId.value }
    : entityType.value === "agregacio"
      ? { agregacioId: agregacioId.value }
      : { id: id.value },
);

const { synthData, loadingSynthData, roseChartData, globalIndex } =
  useSyntheticEntityData({
    endpoint: props.endpoint,
  });

const isCoastal = computed(() =>
  entityType.value === "comarca"
    ? comarcasWithCoast.includes(comarcaId.value)
    : entityType.value === "agregacio"
      ? aggregationsWithCoast.includes(agregacioId.value)
      : municipisWithCoast.includes(id.value),
);

const getLink = useGetLink();

const firstLoad = ref(true);

watch(synthData, () => {
  firstLoad.value = false;
});

const [rosechartTooltip, toggleRosechartTooltip] = useTooltip();

const highlightedRoseChart = ref(null);

function hoverRoseChart(e) {
  if (e) {
    highlightedRoseChart.value = e.data.data.id;
  } else {
    highlightedRoseChart.value = null;
  }
  toggleRosechartTooltip(e);
}

const centerNumber = computed(() => {
  if (!highlightedRoseChart.value) {
    return globalIndex.value;
  }
  // otherwise grab the number from the rosechartData which is an array indexed 0 - 16 therefore the -1
  return roseChartData.value[highlightedRoseChart.value - 1]?.value;
});

const centerName = computed(() => {
  if (!highlightedRoseChart.value) {
    return "INDEX_GLOBAL_SDG";
  }
  // otherwise grab the name from the rosechartData which is an array indexed 0 - 16 therefore the -1
  return "INDEX_SDG";
});

const roseChartLinks = computed(() => {
  return Array.from({ length: 17 }, (_, i) => {
    let className = "";

    // for rosechart size 360px
    if (i === 0 || i === 8) {
      className = "ml-[-50px] ";
    } else if (i === 1 || i === 7) {
      className = "ml-[-12px] ";
    } else if (i === 2 || i === 6) {
      className = "ml-[11px] ";
    } else if (i === 3 || i === 5) {
      className = "ml-[23px] ";
    } else if (i === 4) {
      className = "ml-[28px] ";
    }
    // left side
    else if (i === 9 || i === 16) {
      className = "mr-[-50px] ";
    } else if (i === 10 || i === 15) {
      className = "mr-[-8px] ";
    } else if (i === 11 || i === 14) {
      className = "mr-[16px]";
    } else if (i === 12 || i === 13) {
      className = "mr-[26px] ";
    }

    return {
      id: i + 1,
      name: `Val ${i + 1}`,
      to:
        route.name === `${entityType.value}-sdg-budget`
          ? {
              name: `${entityType.value}-sdg-budget`,
              params: { ...entityIdParam.value, sdg: i + 1 },
              query: { year: year.value },
            }
          : getLink(i + 1),
      class: className,
    };
  });
});

function goToSDG(event) {
  if (sdg.value === +event.data.data.id) {
    router.push({ name: entityType.value, params: { ...entityIdParam.value } });
  } else {
    if (
      route.name === `${entityType.value}-indicator` ||
      route.name === entityType.value
    ) {
      router.push(getLink(+event.data.data.id));
    } else {
      router.push({
        name: route.name,
        params: { ...entityIdParam.value, sdg: +event.data.data.id },
      });
    }
  }
}
</script>
