import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";

import api from "@/services/dataDibarometre";

export default function useLoadDibarometre() {
  const data = ref({});
  const loading = ref(false);
  const error = ref(null);

  const route = useRoute();

  const loadData = async () => {
    // always reset to avoid unexpected results
    data.value = [];
    let timeout;
    try {
      // activate the loading status after 200ms
      timeout = setTimeout(() => (loading.value = true), 200);

      const result = await api.getData();

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

  onMounted(loadData);

  return {
    data,
    loading,
    error,
  };
}
