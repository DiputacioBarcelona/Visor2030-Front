<template>
  <ul class="flex h-full md:items-center">
    <li v-if="dark" class="flex h-full">
      <button @click="closeMenu">
        <XMarkIcon class="w-10 text-white" />
      </button>
    </li>
    <li class="flex h-full">
      <RouterLink
        :to="{ name: 'home' }"
        class="md:auto flex h-full w-full items-center border-b px-2 py-4 hover:border-main-80 hover:text-main-80 focus:text-main-80 focus:outline-none md:py-0"
        :class="{
          'border-main-80 bg-white font-bold text-main-80':
            !dark && route.name === 'home',
          'border-white text-white': dark && route.name === 'home',
          'border-transparent': route.name !== 'home',
          'hover:border-main-80 hover:bg-white hover:text-main-80 focus:text-main-80':
            !dark,
          'hover:border-white hover:bg-gray-700 hover:text-white focus:text-white':
            dark,
        }"
      >
        <span>
          <OTText value="INICI" />
        </span>
      </RouterLink>
    </li>
    <li v-if="showMunicipis" class="flex h-full">
      <SearchSelect
        v-if="comarcaId || scope === 'comarca'"
        class="h-full w-full md:w-[175px]"
        :main-class="`h-full px-2 py-4 md:py-0 font-normal border-b rounded-none border-gray-100 text-sm border-transparent focus:outline-none ${dark ? 'hover:border-white hover:text-white focus:border-white focus:text-white hover:bg-gray-700' : 'hover:border-main-80 hover:text-main-80 focus:border-main-80 focus:text-main-80 hover:bg-white'}`"
        popover-class="w-[260px] text-gray-700"
        :options="comarcaOptions"
        @input="routeComarca"
        :value="comarcaId"
        :default-option-name="$t('NAVEGA_PER_COMARCA')"
        :placeholder="$t('CERCA_COMARCA')"
      />
      <OTSelect
        v-else-if="agregacioId || scope === 'aggregations'"
        :options="filteredOtherGroupingOptions"
        :value="agregacioId"
        @update:model-value="routeAggregation"
        class="h-full w-full"
        :main-class="`h-full px-2 py-4 md:py-0 font-normal border-b rounded-none border-gray-100 text-sm border-transparent focus:outline-none ${dark ? 'text-white hover:border-white hover:text-white focus:border-white focus:text-white hover:bg-gray-700' : 'text-gray-700 hover:border-main-80 hover:text-main-80 focus:border-main-80 focus:text-main-80 hover:bg-white'}`"
        popover-class="w-[260px] text-gray-700"
        icon-class="mr-0 ml-0"
        :allow-search="false"
        :default-option-name="t('NAVEGA_PER_AGREGACIO')"
        label="other"
        :placeholder="t('CERCA_AGREGACIO')"
        :options-text="t('OPTIONS')"
        :leaf-only="true"
        popover-height="max-h-[310px]"
      />

      <SearchSelect
        v-else
        class="h-full w-full md:w-[175px]"
        :main-class="`h-full px-2 py-4 md:py-0 font-normal border-b rounded-none border-gray-100 text-sm border-transparent focus:outline-none ${dark ? 'hover:border-white hover:text-white focus:border-white focus:text-white hover:bg-gray-700' : 'hover:border-main-80 hover:text-main-80 focus:border-main-80 focus:text-main-80 hover:bg-white'}`"
        popover-class="w-[260px] text-gray-700"
        :options="municipalityOptions"
        @input="routeMunicipality"
        :value="id"
        :default-option-name="$t('NAVEGA_PER_MUNICIPI')"
        :always-use-default-name="true"
        :placeholder="$t('CERCA_MUNICIPI')"
      />
    </li>
    <li class="flex h-full">
      <OTSelectODS
        class="w-full"
        :main-class="`w-full h-full px-2 py-4 md:py-0 font-normal border-b rounded-none border-gray-100 text-sm border-transparent focus:outline-none ${dark ? 'text-white hover:border-white hover:text-white focus:border-white focus:text-white hover:bg-gray-700' : 'text-gray-700 hover:border-main-80 hover:text-main-80 focus:border-main-80 focus:text-main-80 hover:bg-white'}`"
        popover-class="w-[320px]"
        @update:modelValue="routeSDG"
        :modelValue="undefined"
      />
    </li>
    <li class="flex h-full">
      <RouterLink
        :to="{ name: 'analisi' }"
        class="md:auto flex h-full w-full items-center border-b px-2 py-4 hover:border-main-80 hover:text-main-80 focus:text-main-80 focus:outline-none md:py-0"
        :class="{
          'border-main-80 bg-white font-bold text-main-80':
            !dark && route.name === 'analisi',
          'border-white text-white': dark && route.name === 'analisi',
          'border-transparent': route.name !== 'analisi',
          'hover:border-main-80 hover:bg-white hover:text-main-80 focus:text-main-80':
            !dark,
          'hover:border-white hover:bg-gray-700 hover:text-white focus:text-white':
            dark,
        }"
      >
        <span>
          <OTText value="ANALISI" />
        </span>
      </RouterLink>
    </li>
    <li class="flex h-full">
      <RouterLink
        :to="{ name: 'metodologia' }"
        class="md:auto flex h-full w-full items-center border-b px-2 py-4 hover:border-main-80 hover:text-main-80 focus:text-main-80 focus:outline-none md:py-0"
        :class="{
          'border-main-80 bg-white font-bold text-main-80':
            !dark && route.name === 'metodologia',
          'border-white text-white': dark && route.name === 'metodologia',
          'border-transparent': route.name !== 'metodologia',
          'hover:border-main-80 hover:bg-white hover:text-main-80 focus:text-main-80':
            !dark,
          'hover:border-white hover:bg-gray-700 hover:text-white focus:text-white':
            dark,
        }"
      >
        <span>
          <OTText value="METODOLOGIA" />
        </span>
      </RouterLink>
    </li>
    <li class="flex h-full">
      <RouterLink
        :to="{ name: 'about' }"
        class="md:auto flex h-full w-full items-center border-b px-2 py-4 hover:border-main-80 hover:text-main-80 focus:text-main-80 focus:outline-none md:py-0"
        :class="{
          'border-main-80 bg-white font-bold text-main-80':
            !dark && route.name === 'about',
          'border-white text-white': dark && route.name === 'about',
          'border-transparent': route.name !== 'about',
          'hover:border-main-80 hover:bg-white hover:text-main-80 focus:text-main-80':
            !dark,
          'hover:border-white hover:bg-gray-700 hover:text-white focus:text-white':
            dark,
        }"
      >
        <span>
          <OTText value="ABOUT_MENU" />
        </span>
      </RouterLink>
    </li>
    <div class="block sm:hidden">
      <li class="flex h-full py-4"><LanguageSwitcher /></li>
    </div>
  </ul>
</template>
<script setup>
import useFilters from "@/functions/useFilters";
import useGetLink from "@/functions/useGetLink";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import useFilterOptions from "@/functions/useFilterOptions";

const props = defineProps({
  dark: {
    type: Boolean,
    default: false,
  },
  showMunicipis: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);

function closeMenu() {
  // Emit an event to close the menu
  emit("close");
}

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const { id, targetId, indicatorId, comarcaId, agregacioId, scope } =
  useFilters();

const { filteredOtherGroupingOptions } = useFilterOptions();

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

// function routeMunicipality(value) {
//   router.push({
//     // if current route is home, go to municipi, else stay in current route
//     name: ["home", "analisi", "metodologia", "sdg", "about"].includes(
//       route.name,
//     )
//       ? "municipi"
//       : undefined,
//     params: {
//       id: value,
//       targetId: targetId.value,
//       indicatorId: indicatorId.value,
//     },
//     query: route.query,
//   });
// }

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
</script>
