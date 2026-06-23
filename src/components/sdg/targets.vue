<template>
  <div>
    <div class="mb-6 mt-8">
      <img
        :src="`${basePath}img/icons/graph-up.svg`"
        alt="Hash icon"
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

      <div class="">
        <header>
          <h2 class="ot-title-2 mb-2">
            <OTText value="INDICATORS" />
          </h2>
          <div class="ot-line text-sm tracking-wide">
            <OTText
              value="INDICATORS_DESCRIPTION"
              :options="{ sdg: t(`SDGS.${sdg}.TITLE`) }"
              markdown
            />
          </div>
        </header>
      </div>
    </div>

    <div
      class="sticky top-[60px] z-20 grid items-center gap-1 bg-white py-2 pt-2 sm:top-[66px] md:top-[30px]"
    >
      <p
        class="inline-flex items-center gap-1 text-xs text-main-100 print:text-white"
      >
        <OTText value="CHOOSE_TARGET" />
        <button @click="showModal = true" :title="t('LLISTA_INDICADORS')">
          <InformationCircleIcon class="h-5 w-5" />
        </button>
      </p>

      <OTModal :is-open="showModal" @close="closeModal">
        <template #body>
          <div class="hidden gap-4 md:grid md:grid-cols-2">
            <div class="rounded bg-gray-100 p-4">
              <OTText value="FITES_LOCALITZADES" />
            </div>
            <div class="rounded bg-gray-100 p-4">
              <OTText value="INDICADORS_RELACIONATS" />
            </div>
          </div>
          <div class="divide-y-4 divide-gray-200 text-base md:divide-y">
            <div v-for="target in targets" class="grid md:grid-cols-2">
              <div class="px-4 py-4">
                <div
                  class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden"
                >
                  <OTText value="FITA_LOCALITZADA" />
                </div>
                <div class="flex gap-4">
                  <div class="w-8 shrink-0 text-main-100">
                    {{ target.target_id }}
                  </div>
                  <div>
                    <OTText
                      :value="`SDGS.${sdg}.TARGETS.${target.target_id?.split('.')[1]}.DESCRIPTION`"
                    />
                  </div>
                </div>
              </div>
              <div class="border-t border-gray-100 px-4 py-4 md:border-t-0">
                <div
                  class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden"
                >
                  <OTText value="INDICADORS_RELACIONATS" />
                </div>
                <div class="space-y-2 divide-y">
                  <div
                    v-for="indicator in target.indicators"
                    class="flex justify-between gap-4 py-2"
                  >
                    <div>
                      <OTText
                        :value="`SDGS.${sdg}.TARGETS.${target.target_id?.split('.')[1]}.INDICATORS.${indicator.indicator_id?.split('.')[2]}.TITLE`"
                      />
                    </div>

                    <RouterLink
                      :to="{
                        name: `${entityType}-indicator`,
                        params: {
                          id: id.value,
                          targetId: indicator.indicator_id.split('.')[1],
                          sdg,
                          indicatorId: indicator.indicator_id.split('.')[2],
                        },
                        query: { all: true },
                      }"
                      class="ot-btn shrink-0 self-start border-none bg-gray-100"
                      @click="closeModal"
                      ><OTText value="VEURE_DADES"
                    /></RouterLink>
                  </div>
                  <div
                    v-if="target.indicators.length === 0"
                    class="text-gray-500"
                  >
                    <OTText value="NO_INDICATORS_AVAILABLE" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- <pre class="ot-code">{{ targets }}</pre> -->
        </template>
      </OTModal>

      <div class="sm:col-span-3 print:hidden">
        <RouterSwitch
          :options="pages"
          :active="active"
          class="h-[40px] p-1 px-0 text-xs"
          item-class="text-center transition font-semibold py-2 px-1 sm:px-4  focus:outline-none truncate sm:overflow-visible w-auto"
          item-active-class="text-main-80  ring-transparent ring-0 border-b border-main-80"
          slider-class="absolute  inset-y-0 my-1 bg-gray-100 ease-out transition-all"
          item-inactive-class="bg-gray-50 text-gray-600 hover:bg-gray-100 border-b border-gray-200"
          inner-container-class="grid grid-cols-7 gap-1"
          @hover="toggleTooltip"
          :use-o-t-text="false"
        />
        <OTTooltip
          :info="tooltip"
          :offset="[0, 9]"
          class="font-regular"
          inner-class="rounded-lg border border-main-80 bg-main-80 text-white text-sm"
          arrow-class="border-main-80"
        >
          <div class="w-48 text-xs">
            <OTText
              v-if="tooltip?.data?.id === 'all'"
              :value="`SEE_ALL_TARGETS`"
            />
            <OTText
              v-else-if="tooltip?.data?.to?.params?.sdg"
              :value="`SDGS.${tooltip?.data?.to?.params?.sdg}.TARGETS.${tooltip?.data?.to?.params?.targetId}.DESCRIPTION`"
            />
          </div>
        </OTTooltip>
        <LoadingSpinner
          :loading="loadingTargets"
          class="inset-0"
          bg-color-class=""
          :border-class="`h-6 w-6 border-2 border-sdg-${sdg}`"
        />
      </div>
    </div>

    <div class="mt-2"><RouterView /></div>
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useTooltip from "@/functions/useTooltip";
import useEntityType from "@/functions/useEntityType";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { InformationCircleIcon } from "@heroicons/vue/24/solid";
import { basePath } from "@/config";

const { t } = useI18n();

const route = useRoute();

const [tooltip, toggleTooltip] = useTooltip();

const { id, sdg, targetId } = useFilters();
const entityType = useEntityType();

const allTargets = inject("targets");
const loadingTargets = inject("loadingTargets");

const targets = computed(() => {
  return allTargets.value.filter((t) => t.sdg === sdg.value);
});

const pages = computed(() => {
  const result = targets.value
    .filter((t) => t.indicators.length > 0)
    .map((target) => {
      const targetId = target.target_id.split(".")[1];

      return {
        id: targetId,
        name: target.target_id,
        to: {
          name: `${entityType.value}-indicator`,
          params: {
            id: id.value,
            targetId: targetId,
            sdg: sdg.value,
            indicatorId: target.indicators[0]?.indicator_id.split(".")[2],
          },
        },
      };
    });

  if (result[0]) {
    const all = {
      ...result[0],
      id: "all",
      name: t("ALL_TARGETS"),
      to: { ...result[0].to, query: { all: true } },
    };
    result.unshift(all);
  }

  return result;
});

const active = computed(() => {
  return route.query.all ? "all" : targetId.value;
});

const showModal = ref(false);

function closeModal() {
  showModal.value = false;
}
</script>
