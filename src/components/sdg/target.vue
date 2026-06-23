<template>
  <div>
    <h3 v-if="!all" class="ot-line my-4 text-base tracking-wide lg:h-20">
      <span class="text-main-100"
        ><OTText value="TARGET" :options="{ target: fullTargetId }" /></span
      >&nbsp;
      <span class=""
        ><OTText :value="`SDGS.${sdg}.TARGETS.${pieces.target}.DESCRIPTION`"
      /></span>
    </h3>
    <p class="ot-line my-4 text-base tracking-wide lg:h-16" v-else>
      <OTText value="SHOW_ALL_INDICATORS" :options="{ sdg }" />
    </p>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4 print:grid-cols-4">
      <div class="col-span-1 self-start md:sticky md:top-[110px]">
        <div class="grid grid-cols-1 gap-2 tracking-wide">
          <!-- bg-sdg-1/20 bg-sdg-2/20 bg-sdg-3/20 bg-sdg-4/20 bg-sdg-5/20 bg-sdg-6/20 bg-sdg-7/20 bg-sdg-8/20 bg-sdg-9/20 bg-sdg-10/20 bg-sdg-11/20 bg-sdg-12/20 bg-sdg-13/20 bg-sdg-14/20 bg-sdg-15/20 bg-sdg-16/20 bg-sdg-17/20 hover:bg-sdg-1/20 hover:bg-sdg-2/20 hover:bg-sdg-3/20 hover:bg-sdg-4/20 hover:bg-sdg-5/20 hover:bg-sdg-6/20 hover:bg-sdg-7/20 hover:bg-sdg-8/20 hover:bg-sdg-9/20 hover:bg-sdg-10/20 hover:bg-sdg-11/20 hover:bg-sdg-12/20 hover:bg-sdg-13/20 hover:bg-sdg-14/20 hover:bg-sdg-15/20 hover:bg-sdg-16/20 hover:bg-sdg-17/20 -->

          <div
            v-for="indicator in indicators"
            class="grid grid-cols-1 gap-2 text-sm"
          >
            <RouterLink
              :to="{
                name: `${entityType}-indicator`,
                params: {
                  id,
                  targetId: indicator.indicator_id.split('.')[1],
                  sdg: sdg,
                  indicatorId: indicator.indicator_id.split('.')[2],
                },
                query: route.query,
              }"
              class="bg-gray-50 py-4 pl-4 pr-2 hover:bg-gray-100"
              :class="{
                [`bg-sdg-${sdg}/20 hover:bg-sdg-${sdg}/20`]:
                  indicator.indicator_id === fullIndicatorId,
              }"
            >
              <div class="leading-tight">
                <OTText
                  :value="`SDGS.${sdg}.TARGETS.${indicator.indicator_id?.split('.')[1]}.INDICATORS.${indicator.indicator_id?.split('.')[2]}.TITLE`"
                />
              </div>
            </RouterLink>
            <div
              v-if="
                subindicators.length &&
                indicator.indicator_id === fullIndicatorId
              "
              class="relative"
            >
              <OTSelect
                :options="subindicators"
                v-model="subindicator"
                :default-text="subindicatorName"
                class="z-20 w-full"
                main-class="ot-btn text-xs border-secondary"
                popover-class="w-96"
                :allow-search="false"
              />
            </div>
          </div>
        </div>

        <LoadingSpinner
          :loading="loadingTargets"
          class="inset-0 py-8"
          bg-color-class=""
          :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
        />
      </div>
      <div class="col-span-1 md:col-span-3 print:col-span-3">
        <div class="">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useEntityType from "@/functions/useEntityType";
import { useRoute } from "vue-router";
import calculations from "@/utils/indicators";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

const {
  id,
  sdg,
  targetId,
  indicatorId,
  pieces,
  fullTargetId,
  fullIndicatorId,
  subindicator,
  all,
} = useFilters();

const entityType = useEntityType();

const data = inject("entity");

useHead({
  title: () =>
    `${fullTargetId.value} - ${t(`SDGS.${sdg.value}.TARGETS.${pieces.value.target}.DESCRIPTION`)} - ${data.value?.name}`,
});

const targets = inject("targets");
const loadingTargets = inject("loadingTargets");

const target = computed(() => {
  return targets.value.find((t) => t.target_id == fullTargetId.value);
});

provide("target", target);

const indicators = computed(() => {
  if (all.value) {
    return targets.value
      .filter((t) => t.sdg == sdg.value)
      .flatMap((t) => t.indicators);
  }
  return target.value?.indicators || [];
});

provide("indicators", indicators);

const formatter = computed(() => {
  return calculations[fullIndicatorId.value] || {};
});

const subindicators = computed(() => {
  const items = formatter.value.subindicators || [];

  return items.map((e) => ({
    id: e ? e.toString() : null,
    name: t(
      `SDGS.${sdg.value}.TARGETS.${targetId.value}.INDICATORS.${indicatorId.value}.SUBINDICATORS.${e}.TITLE`,
    ),
  }));
});

const subindicatorName = computed(() => {
  return t(
    `SDGS.${sdg.value}.TARGETS.${targetId.value}.INDICATORS.${indicatorId.value}.SUBINDICATORS.${subindicator.value || 0}.TITLE`,
  );
});
</script>
