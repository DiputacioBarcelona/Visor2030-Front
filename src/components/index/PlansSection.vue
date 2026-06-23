<template>
  <section
    class="page-break bg-white py-8"
    :class="{ 'mb-16': +id === 8019 }"
  >
    <div class="ot-container">
      <img
        :src="`${basePath}img/icons/calendar.svg`"
        alt=""
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-6 border-dashed border-gray-500" />

      <div class="mb-2">
        <header
          class="mb-2 flex flex-wrap items-center justify-between gap-4"
        >
          <h2 class="ot-title-2 mb-0" id="plans">
            <OTText value="PLANS_ESTRATEGICS" />
          </h2>
        </header>

        <div class="flex items-end justify-between">
          <div class="ot-line text-sm tracking-wide">
            <OTText value="PLANS_SUBTITLE" />
          </div>
          <div class="flex items-center gap-2">
            <DownloadCSVButton
              :data="plan.themes"
              :filename="`${t('PLANS_ESTRATEGICS')}_${data.name}_${plan.name}`"
            />
            <DownloadImageButton
              element-id="strategic-plans"
              :filename="`${t('PLANS_ESTRATEGICS')}_${data.name}_${plan.name}`"
            />
          </div>
        </div>
      </div>

      <div class="mb-2 text-sm text-main-100">
        <OTText value="info_planType_selector" />
      </div>
      <div
        class="ml-auto flex items-baseline justify-start gap-6 self-start"
      >
        <!-- PROGRAM SELECTOR -->
        <div>
          <div class="flex items-baseline gap-x-6">
            <button
              @click="(planScope = 'by_period'), (planIndex = 0)"
              class="text-nowrap border-b-2 pb-1 text-sm font-semibold capitalize text-gray-500 outline-offset-2 focus-visible:outline-secondary"
              :class="
                planScope === 'by_period'
                  ? 'border-primary text-primary brightness-95'
                  : 'border-transparent hover:border-grey-fosc'
              "
            >
              {{ $t("by_period") }}
            </button>
            <button
              @click="(planScope = 'by_plan'), (planIndex = 0)"
              class="border-b-2 pb-1 text-sm font-semibold capitalize text-gray-500 outline-offset-2 focus-visible:outline-secondary"
              :class="
                planScope === 'by_plan'
                  ? 'border-primary text-primary brightness-95'
                  : 'border-transparent hover:border-grey-fosc'
              "
            >
              {{ $t("by_plan") }}
            </button>
          </div>
        </div>
        <div>
          <label for="plans" class="sr-only"
            ><OTText value="PLA_ESTRATEGIC"
          /></label>
          <select
            class="ot-btn dark w-full rounded-full border-gray-100 bg-main-80 text-sm text-white sm:hidden"
            v-model="planIndex"
            id="plans"
          >
            <option v-for="page in plans" :value="page.id">
              {{ page.name }}
            </option>
          </select>

          <OTSelect
            class="hidden rounded-full bg-gray-50 sm:block"
            main-class="sm:w-[345px] xl:w-[410px] rounded-full bg-main-80 ot-btn border-gray-100 pr-4 border-none py-2 text-white text-sm"
            popover-class="w-full"
            v-model="planIndex"
            :options="plans"
            :allow-search="false"
            label="plans"
            :prevent-deselect="true"
          />
        </div>
      </div>

      <div class="mt-4 sm:grid sm:gap-6 md:grid-cols-2 print:grid-cols-2">
        <!-- TABLE -->
        <div class="mb-6 sm:mb-0">
          <OTTable
            :rows="plan.themes"
            :columns="plansColumns"
            :items-per-page="20"
            row-class="budget-table"
            :show-chevron-always="true"
          >
            <template #header-value="{ name }"
              ><div class="flex-grow text-right">
                {{ name }}
              </div>
            </template>

            <template #theme="{ sdg }"
              ><div class="flex items-center gap-2">
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full border-none p-0 text-xs"
                  :class="{
                    [`bg-sdg-${sdg}`]: true,
                    [`text-gray-900`]: darkSDGs.includes(+sdg),
                    [`text-white`]: !darkSDGs.includes(+sdg),
                  }"
                  >{{ sdg }}</span
                >
                <OTText :value="`SDGS.${sdg}.TITLE`" />
              </div>
            </template>

            <template #value="{ value }"
              ><div class="text-right">
                <span>{{ number(value, 2) }}</span
                >&#8239;%
              </div>
            </template>
          </OTTable>

          <LoadingSpinner
            :loading="loadingPlans"
            class="left-0 right-0 top-16"
            bg-color-class=""
            border-class="h-6 w-6 border-2 border-primary"
          />
        </div>
        <!-- TREEMAP -->
        <ImageWrapper id="strategic-plans">
          <TreeMap
            :data="planTreeMapData"
            class="h-[360px] w-full sm:h-[400px] sm:w-auto md:h-full print:h-[550px] print:scale-100"
            unit="%"
            :has-round-borders="false"
            use-gradients
            padding="0"
            @hover="toggleTooltip2"
          />
        </ImageWrapper>

        <LoadingSpinner
          :loading="loadingPlans"
          class="inset-0"
          bg-color-class="bg-white/50"
          border-class="h-6 w-6 border-2 border-primary"
        />

        <OTTooltip :info="tooltip2" ref="tooltipElement3" :smooth="false">
          <div class="relative flex items-start">
            <div v-if="tooltip2?.data" class="space-y-2 overflow-x-hidden">
              <div class="mt-0.5 text-base font-semibold">
                {{ tooltip2.data?.data?.name }}
              </div>
              <hr />

              <div class="text-2xl">
                <span class="font-medium">{{
                  number(tooltip2.data?.data?.value, 2)
                }}</span
                >&#8239;<span class="text-xl">%</span>
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
import { useI18n } from "vue-i18n";
import usePlansData from "@/functions/usePlansData";
import useTooltip from "@/functions/useTooltip";
import { number } from "@/utils/filters";
import * as d3 from "d3";
import colors from "@/utils/colors";
import { basePath } from "@/config";
import { darkSDGs } from "@/utils/helpers";

const { t } = useI18n();

const { id } = useFilters();

const data = inject("entity");

const { loading: loadingPlans, processedData: plansData } = usePlansData();

const planScope = ref("by_period");
const planIndex = ref(0);

watch(id, () => {
  planScope.value = "by_period";
  planIndex.value = 0;
});

const plans = computed(() => {
  const isScopeByPlan = planScope.value === "by_plan";

  return plansData.value[planScope.value].map((plan) => {
    const planCopy = { ...plan };
    if (planCopy.name === "total") {
      planCopy.name = isScopeByPlan ? t("all_plans") : t("all_periods");
    }
    return planCopy;
  });
});

const plan = computed(() => {
  return plans.value.find((e) => e.id === planIndex.value) || {};
});

const plansColumns = computed(() => [
  { id: "theme", name: t("SDG") },
  { id: "value", name: t("CONTRIBUCIO_ODS") },
]);

const [tooltip2, toggleTooltip2] = useTooltip();

const planTreeMapData = computed(() => {
  const data = [...(plan.value?.themes || [])]
    .map((d) => {
      return {
        id: d.sdg,
        name: `${d.sdg}. ${t(`SDGS.${d.sdg}.TITLE`)}`,
        value: d.value,
        color: colors.sdg[d.sdg],
        textColor: "#000000",
      };
    })
    .filter((e) => e.value);
  data.unshift({
    id: "root",
    value: null,
    color: "transparent",
    textColor: "#000000",
  });

  const treeData = d3
    .stratify()
    .id((d) => d.id)
    .parentId((d) => {
      if (d.id === "root") {
        return "";
      }
      return "root";
    })(data);

  return treeData;
});
</script>
