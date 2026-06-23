<template>
  <div class="text-main min-h-screen bg-white text-base antialiased">
    <NavBar />

    <RouterView class="z-30 pt-4 md:pt-8" />

    <FooterComponent class="print:hidden" />

    <div v-if="isDev" class="fixed bottom-2 right-2 print:hidden">
      <RouterLink
        v-if="route.query.mode === 'edit'"
        class="ot-btn border-2 border-black bg-orange-300 hover:bg-orange-500"
        :to="{ query: { ...route.query, mode: null } }"
        >Exit edit mode</RouterLink
      >
      <RouterLink
        v-else
        class="ot-btn border-2 border-black bg-orange-300 hover:bg-orange-500"
        :to="{ query: { ...route.query, mode: 'edit' } }"
        >Enter edit mode</RouterLink
      >
    </div>
    <BreakpointMarker
      v-if="isDev"
      class="fixed bottom-2 left-2 rounded border-2 border-black bg-white p-1 print:hidden"
    />
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// import useFilters from "@/functions/useFilters";
import useLoadData from "@/functions/useLoadData";
import useLoadLabels from "@/functions/useLoadLabels";
import useLoadDibarometre from "@/functions/useLoadDibarometre";

// manually constructed from API response
import municipalities from "@/assets/municipalities.json";
import comarcas from "@/assets/comarcas.json";

const isDev = import.meta.env.DEV || localStorage.getItem("visor2030-token");

const route = useRoute();

const { locale, t } = useI18n();

watch(
  locale,
  (newLocale) => {
    document.documentElement.lang = newLocale;
  },
  { immediate: true },
);

// initial load text labels globally
useLoadLabels();

const { data: municipalitiesDataUpdated } = useLoadData(
  "getMunicipalities",
  null,
);

const municipalitiesData = computed(() => {
  if (municipalitiesDataUpdated.value) {
    const mapped = municipalitiesDataUpdated.value.member.map((e) => {
      const name = e.municipality_name;
      const formattedMunicipalityName = formatName(name);

      return {
        ...e,
        id: e.municipality_code,
        formattedName: formattedMunicipalityName,
        name: name,
      };
    });

    // console.log("municipalitiesDataUpdated", mapped);

    return mapped.sort((a, b) =>
      a.formattedName.localeCompare(b.formattedName),
    );
  }
  return municipalities;
});

const formatName = (name) => {
  const article = name.match(/^(L'|La |El |Les |Els )/gm);
  if (!article) return name;

  const lastArticleIndex = article[0].length;
  const nameWithoutArticle = name.slice(lastArticleIndex);
  article[0] = article[0].trim().toLowerCase();

  return `${nameWithoutArticle}, ${article[0]}`;
};

provide("municipalities", municipalitiesData);

const { data: comarcasDataUpdated } = useLoadData("getComarcas", null);

const comarcasData = computed(() => {
  if (comarcasDataUpdated.value) {
    return comarcasDataUpdated.value.member
      .map((e) => {
        const population = municipalitiesData.value
          .filter((m) => m.comarca.comarca_code === e.comarca_code)
          .reduce((acc, m) => acc + m.population, 0);

        const populationYear =
          municipalitiesData.value[0]?.population_year || null;

        return {
          id: e.comarca_code,
          comarca_code: e.comarca_code,
          name: e.comarca_name,
          population,
          population_year: populationYear,
        };
      })
      .sort((a, b) => formatName(a.name).localeCompare(formatName(b.name)));
  }
  return comarcas;
});

provide("comarcas", comarcasData);

const { data: aggregationsDataUpdated } = useLoadData("getAggregations", null);

const aggregationsData = computed(() => {
  if (aggregationsDataUpdated.value) {
    return aggregationsDataUpdated.value.member.map((e) => {
      const population = municipalitiesData.value
        .filter((m) => m.aggregations?.some((a) => a.slug === e.slug))
        .reduce((acc, m) => acc + m.population, 0);

      const populationYear =
        municipalitiesData.value[0]?.population_year || null;

      return {
        id: e.slug,
        slug: e.slug,
        name: t(`GROUPING.${e.slug}`),
        group: e.group,
        population,
        population_year: populationYear,
      };
    });
  }
  return [];
});

provide("aggregations", aggregationsData);

const {
  data: targetsData,
  loading: loadingTargets,
  error,
} = useLoadData("getTargets", { member: [] });

const targets = computed(() => {
  return targetsData.value.member
    .sort((a, b) => {
      // target_id is like 17.17 and 17.4 but we need to order numerically by first and then second number
      const [a1, a2] = a.target_id.split(".");
      const [b1, b2] = b.target_id.split(".");
      return a1 - b1 || a2 - b2;
    })
    .filter((t) => {
      // only targets where indicators array is not empty
      // return t.indicators.length > 0;
      return true;
    });
});

provide("targets", targets);
provide("loadingTargets", loadingTargets);

// preload dibarometre data because api is very slow
const { data: dibarometreData, loading: dibarometreLoading } =
  useLoadDibarometre();
provide("dibarometreData", dibarometreData);
provide("dibarometreLoading", dibarometreLoading);
</script>
