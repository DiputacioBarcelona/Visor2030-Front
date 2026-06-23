import useFilters from "@/functions/useFilters";
import useTrams from "@/functions/useTrams";
import { municipalityMatchesSlug } from "@/utils/aggregationFilter";

export default function useHighlightMunicipalities(t) {
  const municipalities = inject("municipalities");
  const { comarca, tram, municipi, gr } = useFilters();
  const tramOptions = useTrams(t);

  const highlightMunicipalities = computed(() => {
    if (
      !comarca.value &&
      !tram.value &&
      !municipi.value.length &&
      !gr.value.length
    )
      return null;

    return municipalities.value
      .filter((m) => {
        if (municipi.value.length && !municipi.value.includes(m.id)) {
          return false;
        }
        if (comarca.value && +m.comarca.comarca_code !== +comarca.value) {
          return false;
        }
        if (tram.value) {
          const tramOption = tramOptions.value.find(
            (t) => t.id === tram.value,
          );
          if (tramOption) {
            const min = tramOption.min;
            const max = tramOption.max ?? Infinity;
            if (m.population < min || m.population > max) return false;
          }
        }
        if (gr.value.length) {
          const hasAll = gr.value.every((slug) =>
            municipalityMatchesSlug(m, slug),
          );
          if (!hasAll) return false;
        }

        return true;
      })
      .map((m) => m.id);
  });

  return highlightMunicipalities;
}
