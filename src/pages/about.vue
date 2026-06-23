<template>
  <div>
    <section class="-mt-4 bg-main-80 py-10 text-white md:-mt-8">
      <div class="ot-container">
        <header>
          <h1 class="ot-title-1 text-white"><OTText value="ABOUT" /></h1>
          <!-- <div class="ot-line prose text-xl text-white">
            <OTText value="ABOUT_DESC" markdown />
          </div> -->
        </header>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <h2 class="text-3xl font-semibold">
          <OTText value="ABOUT_PAGE.QUE_ES" />
        </h2>
        <div class="ot-line prose tracking-wide">
          <OTText value="ABOUT_PAGE.QUE_ES_DESC" markdown />
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-6 md:py-16">
      <div class="ot-container">
        <h2 class="text-3xl font-semibold">
          <OTText value="ABOUT_PAGE.OBJECTIUS" />
        </h2>
        <div class="ot-line prose tracking-wide">
          <OTText value="ABOUT_PAGE.OBJECTIUS_DESC" markdown />
        </div>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <h2 class="text-3xl font-semibold">
          <OTText value="ABOUT_PAGE.A_QUI" />
        </h2>
        <div class="ot-line prose tracking-wide">
          <OTText value="ABOUT_PAGE.A_QUI_DESC" markdown />
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-6 md:py-16">
      <div class="ot-container">
        <h2 class="text-3xl font-semibold">
          <OTText value="ABOUT_PAGE.QUI_SOM" />
        </h2>
        <div class="ot-line prose tracking-wide">
          <OTText value="ABOUT_PAGE.QUI_SOM_DESC" markdown />
        </div>
      </div>
    </section>

    <section class="py-6 md:py-16">
      <div class="ot-container">
        <h2 class="text-3xl font-semibold">
          <OTText value="ABOUT_PAGE.SOLUCIO" />
        </h2>
        <div class="ot-line prose tracking-wide">
          <OTText value="ABOUT_PAGE.SOLUCIO_DESC" markdown />
        </div>
      </div>
    </section>

    <!-- <pre class="ot-code">{{ simplified }}</pre> -->
  </div>
</template>

<script setup>
// import useLoadData from "@/functions/useLoadData";
// import useTooltip from "@/functions/useTooltip";
// import colors from "@/utils/colors";
// import { number } from "@/utils/filters";
// import * as d3 from "d3";
import { useI18n } from "vue-i18n";
import sdgs from "@/assets/sdgs.json";

const { t } = useI18n();

useHead({
  title: () => t(`METODOLOGIA`),
});

const simplified = computed(() => {
  const result = {};

  for (const [key, value] of Object.entries(sdgs.SDGS)) {
    const targets = {};
    for (const [key2, value2] of Object.entries(value.TARGETS)) {
      targets[key2] = {
        DESCRIPTION: value2.DESCRIPTION,
      };
    }
    result[key] = {
      TARGETS: targets,
    };
  }

  return { SDGS: result };
});
</script>
