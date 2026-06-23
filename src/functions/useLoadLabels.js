import useLoadData from "@/functions/useLoadData";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

export default function useLoadLabels(loadOnMount = true, loadOnChange = true) {
  // globally change the language messages for current lang
  const i18n = useI18n();
  const route = useRoute();

  const locale = computed(() => {
    // if the route has a locale param, use that, otherwise use the i18n locale
    return route.params.locale || i18n.locale.value;
  });

  // function to get labels from the server
  const {
    data: labels,
    loadData: getLabels,
    error: errorOnLoading,
  } = useLoadData(
    "getLabels",
    {},
    undefined,
    computed(() => ({
      locale: locale.value,
    })),
    loadOnMount,
    false,
    loadOnChange ? locale : undefined,
  );

  // post labels (and get the new ones as a responsex)
  const {
    data: updatedLabels,
    loadData: postLabels,
    loading,
    error,
  } = useLoadData("postLabels", {}, false, undefined, false, false);

  watch(labels, (labels) => {
    !errorOnLoading.value && updateLocales(labels);
  });
  watch(updatedLabels, updateLocales);

  function updateLocales(labels) {
    // if  labels[locale.value] is array, then make apiLabels an empty object
    const apiLabels =
      (Array.isArray(labels[locale.value]) ? {} : labels[locale.value]) || {};

    i18n.mergeLocaleMessage(locale.value, apiLabels);
  }

  // function deepMerge(obj1, obj2) {
  //   if (typeof obj1 !== "object" || obj1 === null) return obj2;
  //   if (typeof obj2 !== "object" || obj2 === null) return obj1;

  //   let merged = { ...obj1 };

  //   for (let key in obj2) {
  //     if (obj2.hasOwnProperty(key)) {
  //       merged[key] = deepMerge(obj1[key], obj2[key]);
  //     }
  //   }

  //   return merged;
  // }

  // utility function to get a nested object from a path
  function convertToHierarchy(path, value) {
    // path is like this: SDGS.1.TARGETS.1.INDICATORS.1.TITLE
    // we want to convert it to this: { SDGS: { 1: { TARGETS: { 1: { INDICATORS: { 1: { TITLE: value } } } } } } }
    const keys = path.split(".");
    const result = {};
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return result;
  }

  return {
    labels,
    getLabels,
    locale,
    postLabels,
    convertToHierarchy,
    loading,
    error,
  };
}
