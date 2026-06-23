import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useEntityType() {
  const route = useRoute();
  return computed(() => route.meta.entityType ?? "municipi");
}
