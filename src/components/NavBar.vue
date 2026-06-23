<template>
  <div class="z-30 bg-gray-100 print:hidden">
    <div class="ot-container z-30 flex justify-between gap-2 md:pt-2">
      <div class="flex items-center gap-4">
        <button
          v-if="showHamburgerMenu"
          class="gap-2 rounded-full border-none bg-gray-100 px-0 font-semibold text-gray-500 lg:hidden"
          @click="toggleMenu"
          :title="t('MENU')"
        >
          <Bars3Icon class="w-10 hover:text-gray-800" />
          <!-- <OTText value="MENU" /> -->
        </button>

        <RouterLink :to="{ name: 'home' }" class="flex-shrink-0 py-2">
          <img
            src="/img/visor-logo-name.svg"
            alt="Visor 2030"
            class="h-[40px]"
          />
        </RouterLink>
        <!-- v-if="route.name === 'home'" -->

        <!-- <RouterLink :to="{ name: 'home' }" class="flex-shrink-0 py-2">
          <img src="/img/visor-logo.svg" alt="Visor 2030" class="h-[40px]" />
        </RouterLink> -->
      </div>
      <div class="flex items-center gap-2 lg:gap-4">
        <LanguageSwitcher class="hidden sm:block" />
        <RouterLink
          :to="{ name: 'home' }"
          class="py-2 lg:ml-auto lg:block"
          :class="{ hidden: route.name !== 'home' }"
        >
          <img
            src="/img/diba-logo.svg"
            class="h-[40px]"
            alt="Diputació de Barcelona"
          />
        </RouterLink>
      </div>
    </div>
  </div>
  <div
    v-if="!showMenu"
    class="sticky top-0 z-30 bg-gray-100 print:hidden"
    :class="{ 'py-0': visibleMenu, 'py-2': !visibleMenu }"
  >
    <div
      class="ot-container flex h-full flex-wrap items-center justify-center gap-2 gap-y-0 px-4 md:flex-nowrap md:justify-start md:gap-y-2"
      :class="{
        'pb-0': id || comarcaId || agregacioId || ['sdg'].includes(route.name),
      }"
    >
      <nav
        v-if="
          !id && !comarcaId && !agregacioId && !['sdg'].includes(route.name)
        "
        class="hidden flex-grow items-center justify-between md:h-[56px] lg:flex"
      >
        <SubMenu
          class="flex h-full items-center justify-start gap-2 text-sm text-gray-700"
        />
        <!-- <LanguageSwitcher /> -->
      </nav>

      <div
        v-if="id || comarcaId || agregacioId || sdg"
        class="flex flex-grow items-center justify-between gap-2 lg:flex-grow-0"
      >
        <button v-if="showDots" @click="toggleMenu" :title="t('MENU')">
          <Bars3Icon
            class="w-10 hover:text-gray-800"
            :class="{ 'text-gray-500': !showMenu }"
          />
        </button>

        <SearchSelect
          v-if="comarcaId"
          class="w-full lg:w-[280px]"
          main-class="rounded-full bg-gray-50 ot-btn border-gray-100 "
          popover-class="w-[300px]"
          :options="comarcaOptions"
          @input="routeComarca"
          :value="comarcaId"
          :default-option-name="$t('NAVEGA_PER_COMARCA')"
          :placeholder="$t('CERCA_COMARCA')"
        />
        <!-- <SearchSelect
          v-else-if="agregacioId"
          class="w-full lg:w-[280px]"
          main-class="rounded-full bg-gray-50 ot-btn border-gray-100 "
          popover-class="w-[300px]"
          :options="aggregationOptions"
          @input="routeAggregation"
          :value="agregacioId"
          :default-option-name="$t('NAVEGA_PER_AGREGACIO')"
          :placeholder="$t('CERCA_AGREGACIO')"
        /> -->
        <OTSelect
          v-else-if="agregacioId"
          :options="filteredOtherGroupingOptions"
          v-model="agregacioId"
          class="w-full lg:w-[280px]"
          main-class="rounded-full bg-gray-50 ot-btn border-gray-100 "
          popover-class="w-[275px]"
          :allow-search="false"
          :default-option-name="t('TOTES')"
          label="other"
          :placeholder="t('CERCA_AGREGACIO')"
          :options-text="t('OPTIONS')"
          :leaf-only="true"
          popover-height="max-h-[310px]"
        />

        <SearchSelect
          v-else
          class="w-full lg:w-[280px]"
          main-class="rounded-full bg-gray-50 ot-btn border-gray-100 "
          popover-class="w-[300px]"
          :options="municipalityOptions"
          @input="routeMunicipality"
          :value="id"
          :default-option-name="$t('NAVEGA_PER_MUNICIPI')"
          :placeholder="$t('CERCA_MUNICIPI')"
        />

        <!-- {{ [agregacioId] }} -->
      </div>

      <!-- bg-sdg-1 bg-sdg-2 bg-sdg-3 bg-sdg-4 bg-sdg-5 bg-sdg-6 bg-sdg-7 bg-sdg-8 bg-sdg-9 bg-sdg-10 bg-sdg-11 bg-sdg-12 bg-sdg-13 bg-sdg-14 bg-sdg-15 bg-sdg-16 bg-sdg-17
       focus:ring-sdg-1/30 focus:ring-sdg-2/30 focus:ring-sdg-3/30 focus:ring-sdg-4/30 focus:ring-sdg-5/30 focus:ring-sdg-6/30 focus:ring-sdg-7/30 focus:ring-sdg-8/30 focus:ring-sdg-9/30 focus:ring-sdg-10/30 focus:ring-sdg-11/30 focus:ring-sdg-12/30 focus:ring-sdg-13/30 focus:ring-sdg-14/30 focus:ring-sdg-15/30 focus:ring-sdg-16/30 focus:ring-sdg-17/30
       group-focus:ring-sdg-1/30 group-focus:ring-sdg-2/30 group-focus:ring-sdg-3/30 group-focus:ring-sdg-4/30 group-focus:ring-sdg-5/30 group-focus:ring-sdg-6/30 group-focus:ring-sdg-7/30 group-focus:ring-sdg-8/30 group-focus:ring-sdg-9/30 group-focus:ring-sdg-10/30 group-focus:ring-sdg-11/30 group-focus:ring-sdg-12/30 group-focus:ring-sdg-13/30 group-focus:ring-sdg-14/30 group-focus:ring-sdg-15/30 group-focus:ring-sdg-16/30 group-focus:ring-sdg-17/30
       ring-sdg-1/30 ring-sdg-2/30 ring-sdg-3/30 ring-sdg-4/30 ring-sdg-5/30 ring-sdg-6/30 ring-sdg-7/30 ring-sdg-8/30 ring-sdg-9/30 ring-sdg-10/30 ring-sdg-11/30 ring-sdg-12/30 ring-sdg-13/30 ring-sdg-14/30 ring-sdg-15/30 ring-sdg-16/30 ring-sdg-17/30

       hover:bg-SDG_VARIANTS-1-60 hover:bg-SDG_VARIANTS-2-60 hover:bg-SDG_VARIANTS-3-60 hover:bg-SDG_VARIANTS-4-60 hover:bg-SDG_VARIANTS-5-60 hover:bg-SDG_VARIANTS-6-60 hover:bg-SDG_VARIANTS-7-60 hover:bg-SDG_VARIANTS-8-60 hover:bg-SDG_VARIANTS-9-60 hover:bg-SDG_VARIANTS-10-60 hover:bg-SDG_VARIANTS-11-60 hover:bg-SDG_VARIANTS-12-60 hover:bg-SDG_VARIANTS-13-60 hover:bg-SDG_VARIANTS-14-60 hover:bg-SDG_VARIANTS-15-60 hover:bg-SDG_VARIANTS-16-60 hover:bg-SDG_VARIANTS-17-60

       -->

      <div
        v-if="id || comarcaId || agregacioId || ['sdg'].includes(route.name)"
        class="order-1 grid grid-cols-18 gap-0 py-2 md:-ms-1 lg:order-none"
      >
        <RouterLink
          v-if="comarcaId"
          :to="{ name: 'comarca', params: { comarcaId }, query: { year } }"
          class="group flex items-center justify-center px-0.5 focus:outline-none md:px-1"
        >
          <div
            class="flex h-4 w-4 items-center justify-center rounded-full border-none p-0 text-xxs text-white transition-all group-focus:ring-4 group-focus:ring-primary/30 group-focus:ring-offset-0 md:h-5 md:w-5 md:text-xs lg:h-6 lg:w-6"
            :class="{
              'ring-main ring-1 ring-offset-1 md:ring-2 md:ring-offset-2': !sdg,
            }"
          >
            <img src="/img/sdg-circle.svg" class="h-6 w-6" alt="Tots els ODS" />
          </div>
        </RouterLink>
        <RouterLink
          v-else-if="agregacioId"
          :to="{ name: 'agregacio', params: { agregacioId }, query: { year } }"
          class="group flex items-center justify-center px-0.5 focus:outline-none md:px-1"
        >
          <div
            class="flex h-4 w-4 items-center justify-center rounded-full border-none p-0 text-xxs text-white transition-all group-focus:ring-4 group-focus:ring-primary/30 group-focus:ring-offset-0 md:h-5 md:w-5 md:text-xs lg:h-6 lg:w-6"
            :class="{
              'ring-main ring-1 ring-offset-1 md:ring-2 md:ring-offset-2': !sdg,
            }"
          >
            <img src="/img/sdg-circle.svg" class="h-6 w-6" alt="Tots els ODS" />
          </div>
        </RouterLink>
        <RouterLink
          v-else-if="id"
          :to="{ name: 'municipi', params: { id }, query: { year } }"
          class="group flex items-center justify-center px-0.5 focus:outline-none md:px-1"
        >
          <div
            class="flex h-4 w-4 items-center justify-center rounded-full border-none p-0 text-xxs text-white transition-all group-focus:ring-4 group-focus:ring-primary/30 group-focus:ring-offset-0 md:h-5 md:w-5 md:text-xs lg:h-6 lg:w-6"
            :class="{
              'ring-main ring-1 ring-offset-1 md:ring-2 md:ring-offset-2': !sdg,
            }"
          >
            <img src="/img/sdg-circle.svg" class="h-6 w-6" alt="Tots els ODS" />
          </div>
        </RouterLink>
        <RouterLink
          v-for="n in 17"
          :to="generateLink(n)"
          class="group flex items-center justify-center px-0.5 focus:outline-none md:px-1"
          @mouseenter="setTooltip({ event: $event, data: { sdgN: n } })"
          @mouseleave="setTooltip(null)"
        >
          <div
            class="flex h-4 w-4 items-center justify-center rounded-full border-none p-0 text-xxs transition-all group-focus:ring-4 group-focus:ring-offset-0 sm:h-5 sm:w-5 sm:text-xs lg:h-6 lg:w-6"
            :class="{
              [`bg-sdg-${n} hover:bg-SDG_VARIANTS-${n}-60`]: true,
              [`group-focus:ring-sdg-${n}/30`]: true,
              [`ring-2 md:ring-4 ring-sdg-${n}/30 `]: n === sdg,
              [`text-gray-900`]: darkSDGs.includes(n),
              [`text-white`]: !darkSDGs.includes(n),
            }"
          >
            {{ n }}
          </div>
        </RouterLink>
        <OTTooltip
          v-if="tooltip.show"
          :info="tooltip"
          placement="bottom"
          :offset="[0, 10]"
          :inner-class="`rounded text-xs !p-1 !px-2 bg-sdg-${tooltip.data.sdgN} ${darkSDGs.includes(tooltip.data.sdgN) ? 'text-gray-900' : 'text-white'} `"
        >
          <OTText :value="`SDGS.${tooltip.data.sdgN}.TITLE`" />
        </OTTooltip>
      </div>
    </div>
  </div>

  <div v-else class="sticky top-0 z-40 bg-gray-800 md:h-[56px]">
    <SubMenu
      dark
      class="ot-container flex h-full flex-col justify-start gap-4 gap-y-0 px-4 pt-2 text-sm text-white md:flex-row md:items-center md:py-0"
      @close="closeMenu"
    />
  </div>
</template>

<script setup>
import useFilters from "@/functions/useFilters";
import useTooltip from "@/functions/useTooltip";
import useGetLink from "@/functions/useGetLink";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { EllipsisHorizontalIcon, Bars3Icon } from "@heroicons/vue/24/outline";
import { darkSDGs } from "@/utils/helpers";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import useFilterOptions from "@/functions/useFilterOptions";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const { id, sdg, targetId, indicatorId, year, comarcaId, agregacioId } =
  useFilters();

const { filteredOtherGroupingOptions } = useFilterOptions();

const [tooltip, setTooltip] = useTooltip();

const municipalityOptions = inject("municipalities");
const comarcaOptions = inject("comarcas");

const getLink = useGetLink();

function routeEntity(params, defaultName) {
  router.push({
    name: ["home", "analisi", "metodologia", "sdg", "about"].includes(
      route.name,
    )
      ? defaultName
      : undefined,
    params: {
      ...params,
      targetId: targetId.value,
      indicatorId: indicatorId.value,
    },
    query: route.query,
  });
}

const routeMunicipality = (value) => routeEntity({ id: value }, "municipi");
const routeComarca = (value) => routeEntity({ comarcaId: value }, "comarca");
const routeAggregation = (value) =>
  routeEntity({ agregacioId: value }, "agregacio");

function generateLink(n) {
  if (
    ["-sdg-budget", "-sdg-plans", "-sdg-valoration"].some((suffix) =>
      route.name?.endsWith(suffix),
    )
  ) {
    return {
      name: route.name,
      params: {
        id: id.value,
        sdg: n,
      },
      query: route.query,
    };
  }
  if (["sdg", ,].includes(route.name)) {
    return {
      name: route.name,
      params: {
        sdg: n,
      },
      query: route.query,
    };
  }

  return getLink(n);
}

const sdgOptions = computed(() => {
  return Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}. ${t(`SDGS.${i + 1}.TITLE`)}`,
  }));
});

function routeSDG(value) {
  router.push({
    // if current route is home, go to municipi, else stay in current route
    name: "sdg",
    params: {
      sdg: value,
    },
  });
}

const showMenu = ref(false);
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};
const closeMenu = () => {
  showMenu.value = false;
};

const showDots = computed(() => {
  return !["home", "analisi", "metodologia", "about"].includes(route.name);
});

const showHamburgerMenu = computed(() => {
  return ["home", "analisi", "metodologia", "about"].includes(route.name);
});

const visibleMenu = computed(() => {
  return ["home", "analisi", "metodologia", "about"].includes(route.name);
});

watch(route, () => {
  // if route changes, close the menu

  closeMenu();
});
</script>
