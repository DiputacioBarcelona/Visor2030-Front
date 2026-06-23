import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";

import api from "@/services/data";

export default function useLoadData(
  endpoint = "getData",
  initialValue = [],
  resetData = true,
  params = ref(null),
  loadOnMount = true,
  useWatchers = true,
  customWatch = ref(null),
) {
  const data = ref(initialValue);
  const loading = ref(false);
  const error = ref(null);

  const route = useRoute();

  const loadData = async (postData) => {
    // skip if any filter param is explicitly null (e.g. year not yet resolved)
    if (params.value && Object.values(params.value).includes(null)) return;
    // always reset to avoid unexpected results
    if (resetData) data.value = initialValue;
    let timeout;
    try {
      // activate the loading status after 200ms
      timeout = setTimeout(() => (loading.value = true), 200);

      const useParams = params.value || route.params;
      // console.log(useParams);

      const result = await api[endpoint](useParams, route.query, postData);
      // console.log(endpoint, result);
      data.value = result;

      error.value = false;
    } catch (err) {
      error.value = err;
      console.error(err);
    } finally {
      loading.value = false;
      clearTimeout(timeout);
    }
  };

  onMounted(() => {
    loadOnMount && loadData();
  });

  let labelLang;

  watch(
    () => [route.params, route.query, params.value],
    (newVal, oldVal) => {
      if (!useWatchers) return;
      // console.log(newVal, oldVal);
      if (["getMunicipalities", "getWeights"].includes(endpoint)) return;
      else if (endpoint === "getMunicipality") {
        //only reload if id has changed
        if (newVal[0].id !== oldVal[0].id) {
          loadData();
        }
      } else if (endpoint === "getTargets") {
        // only reload if SDG has changed
        // if (newVal[0].sdg !== oldVal[0].sdg) {
        //   loadData();
        // }
        // DO NOT RELOAD
      } else if (endpoint === "getBudgets") {
        //only reload if id has changed or year has changed
        if (
          newVal[0].id !== oldVal[0].id ||
          newVal[1].year !== oldVal[1].year
        ) {
          loadData();
        }
      } else if (endpoint === "getLabels") {
        // load data only if locale has changed
        if (newVal[0].locale !== oldVal[0].locale) {
          if (labelLang !== newVal[0].locale) {
            labelLang = newVal[0].locale;
            // console.log("labelLang changed", labelLang);
            const useParams = route.params;
            console.log(
              "locale changed",
              useParams,
              newVal[0].locale,
              oldVal[0].locale,
            );
            loadData();
          }
        }
      } else {
        loadData();
      }
    },
  );

  watch(customWatch, () => {
    const useParams = params.value || route.params;
    // console.log(useParams);
    // console.log("custom watch triggered", customWatch.value);
    loadData();
  });

  // watch(
  //   () => ({ ...params.value }),
  //   () => {
  //     console.log("new watcher", params.value);
  //     loadData();
  //   }
  // );

  return {
    data,
    loading,
    error,
    loadData,
  };
}
