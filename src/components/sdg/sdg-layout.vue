<template>
  <section class="ot-section -mt-4 bg-white pb-16 md:-mt-8">
    <div class="mb-6 bg-main-80 py-10 text-white">
      <div class="ot-container">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="mb-4 text-xl print:mt-4">
              <span class="font-semibold">{{ data?.name }}</span>
              <span class=""> &nbsp; | &nbsp; </span>
              <span class="font-semibold"
                ><OTText value="SDG" :options="{ sdg: sdg }"
              /></span>
            </div>
            <h1 class="inline-flex items-center gap-2 text-2xl font-semibold">
              <img
                :src="`${basePath}img/icons/ODS${sdg}.svg`"
                alt=""
                class="sdg-icon"
              /><OTText :value="`SDGS.${sdg}.TITLE`" />
            </h1>

            <p class="ot-line mt-0 tracking-wide">
              <OTText :value="`SDGS.${sdg}.DESCRIPTION`" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="ot-container">
      <p
        class="inline-flex items-center gap-1 text-xs text-main-100 print:text-white"
      >
        <OTText value="EXPLORA_CAPES" />
      </p>
      <div class="hidden justify-start py-2 sm:flex print:hidden">
        <RouterSwitch
          :options="pages"
          :active="active"
          class="hide-scrollbar flex h-[40px] flex-grow overflow-x-scroll rounded-full bg-gray-100 p-1 text-xs md:flex-grow-0"
          item-class="sm:∫flex-grow rounded-full text-center transition font-medium py-2 px-4 bg-transparent focus:outline-none truncate sm:overflow-visible md:w-44 w-auto"
          item-active-class="text-white ring-transparent ring-0"
          slider-class="absolute inset-y-0 my-1 bg-main-80 rounded-full ease-out transition-all"
          item-inactive-class="text-gray-700 hover:bg-gray-200"
          inner-container-class="gap-1 flex-grow md:flex-grow-0 "
        />
      </div>
      <div class="flex flex-wrap gap-2 py-2 sm:hidden">
        <div v-for="page in pages" :key="page.id">
          <RouterLink
            :to="page.to"
            class="ot-btn gap-2 border-none bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 md:px-6 md:py-2 md:text-sm"
            :class="{ 'bg-main-80 text-white': active === page.id }"
          >
            <OTText :value="page.name" />
          </RouterLink>
        </div>
      </div>

      <div class="mt-2"><RouterView /></div>
    </div>
  </section>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import useGetLink from "@/functions/useGetLink";
import useEntityType from "@/functions/useEntityType";
import { basePath } from "@/config";

const { t } = useI18n();

const route = useRoute();

const { id, sdg } = useFilters();

const data = inject("entity");
const entityType = useEntityType();

const getLink = useGetLink();

useHead({
  title: () =>
    `${sdg.value} - ${t(`SDGS.${sdg.value}.TITLE`)} - ${data.value?.name}`,
});

const pages = computed(() => {
  const base = [
    {
      id: `${entityType.value}-indicator`,
      name: "INDICATORS",
      to: getLink(sdg.value),
    },
  ];

  if (entityType.value === "municipi") {
    base.push(
      {
        id: `${entityType.value}-sdg-budget`,
        name: "BUDGET_TITLE",
        to: {
          name: `${entityType.value}-sdg-budget`,
          params: {
            id: id.value,
            sdg: sdg.value,
          },
        },
      },
      {
        id: `${entityType.value}-sdg-plans`,
        name: "PLANS_TITLE",
        to: {
          name: `${entityType.value}-sdg-plans`,
          params: {
            id: id.value,
            sdg: sdg.value,
          },
        },
      },
      {
        id: `${entityType.value}-sdg-valoration`,
        name: "VALORATION_TITLE",
        to: {
          name: `${entityType.value}-sdg-valoration`,
          params: {
            id: id.value,
            sdg: sdg.value,
          },
        },
      },
    );
  }

  return base;
});

const active = computed(() => {
  if (
    [`${entityType.value}-target`, `${entityType.value}-sdg-targets`].includes(
      route.name,
    )
  ) {
    return `${entityType.value}-indicator`;
  }
  return route.name;
});
</script>

<style>
.ot-section {
  min-height: calc(100vh - 300px);
}

.sdg-icon {
  filter: brightness(0) invert(1);
}
</style>
