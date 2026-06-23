import calculations from "@/utils/indicators";
import useFilters from "./useFilters";

export default function useFormatter() {
  const { fullIndicatorId } = useFilters();
  const formatter = computed(() => calculations[fullIndicatorId.value] || {});
  const calculator = computed(() => formatter.value.calculation || ((d) => d.value));
  return { formatter, calculator };
}
