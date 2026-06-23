<template>
  <div class="divide-blue-10/30 divide-x text-sm">
    <RouterLink
      v-for="lang in ['ca', 'es', 'en']"
      :key="lang"
      :to="{
        name: route.name,
        params: { ...route.params, locale: lang === 'ca' ? '' : lang },
        query: route.query,
      }"
      na
      class="px-2"
      :class="
        locale === lang
          ? 'font-bold text-white sm:text-primary'
          : 'text-gray-400 sm:text-gray-500'
      "
      >{{ lang.toUpperCase() }}</RouterLink
    >
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";

import { useI18n } from "vue-i18n";
const locale = useI18n().locale;

const route = useRoute();
const router = useRouter();

function switchLanguage(lang) {
  if (route.params.locale !== lang) {
    router.push({
      name: route.name,
      params: { ...route.params, locale: lang },
      query: route.query,
      hash: route.hash,
    });
  }
}
</script>
