import useFilters from "@/functions/useFilters";
import useComarques from "@/functions/useComarques";
import useTrams from "@/functions/useTrams";
import useOtherGroupings from "@/functions/useOtherGroupings";
import { useI18n } from "vue-i18n";
import {
  municipalityMatchesSlug,
  filterByAggregationSlugs,
} from "@/utils/aggregationFilter";

// Filter out filter options that are impossible according
// to the already selected options in other filters
export default function useFilterOptions() {
  const { t } = useI18n();
  const { comarca, tram, municipi, gr } = useFilters();
  const municipalities = inject("municipalities");
  const comarcaOptions = useComarques(true);
  const tramOptions = useTrams();
  const otherGroupingsOptions = useOtherGroupings(false);

  const filteredMunicipalityOptions = computed(() => {
    if (!comarca.value && !tram.value && !gr.value.length)
      return municipalities.value;

    let visibleMuns = municipalities.value;

    if (comarca.value) {
      visibleMuns = visibleMuns.filter(
        (m) => m.comarca.comarca_code === comarca.value,
      );
    }
    if (tram.value) {
      const tramOption = tramOptions.value.find((t) => t.id === tram.value);
      if (tramOption) {
        const min = tramOption.min;
        const max = tramOption?.max || Infinity;
        visibleMuns = visibleMuns.filter(
          (m) => m.population > min && m.population < max,
        );
      }
    }
    if (gr.value.length) {
      visibleMuns = filterByAggregationSlugs(visibleMuns, gr.value);
    }
    return visibleMuns;
  });

  const filteredComarcaOptions = computed(() => {
    if (!municipi.value.length && !tram.value && !gr.value.length)
      return comarcaOptions.value;

    const municipalityIds = new Set(
      municipi.value.length
        ? municipi.value
        : filteredMunicipalityOptions.value.map((m) => m.id),
    );

    return comarcaOptions.value.filter((c) =>
      c.highlighted.some((id) => municipalityIds.has(id)),
    );
  });

  const filteredTramOptions = computed(() => {
    if (!municipi.value.length && !comarca.value && !gr.value.length)
      return tramOptions.value;

    let visibleTrams = tramOptions.value;

    if (municipi.value.length) {
      visibleTrams = visibleTrams.filter((t) => {
        const min = t.min;
        const max = t.max ?? Infinity;

        return municipi.value.some((m) => {
          const municipality = municipalities.value.find((mun) => mun.id === m);

          return municipality.population > min && municipality.population < max;
        });
      });
    }
    if (comarca.value) {
      visibleTrams = visibleTrams.filter((t) => {
        const min = t.min;
        const max = t.max ?? Infinity;
        const selectedComarca = comarcaOptions.value.find(
          (c) => c.id === comarca.value,
        );
        const comarcaMunicipalities = selectedComarca.highlighted;
        return comarcaMunicipalities.some((m) => {
          const mun = municipalities.value.find((mun) => mun.id === m);
          if (!mun) return;
          return mun.population > min && mun.population < max;
        });
      });
    }
    if (gr.value.length) {
      visibleTrams = visibleTrams.filter((t) => {
        const min = t.min;
        const max = t.max ?? Infinity;

        const availableMunicipalities = filterByAggregationSlugs(
          municipalities.value,
          gr.value,
        );

        return availableMunicipalities.some((m) => {
          return m.population > min && m.population < max;
        });
      });
    }

    return visibleTrams;
  });

  const filteredOtherGroupingOptions = computed(() => {
    if (!municipi.value.length && !comarca.value && !tram.value)
      return otherGroupingsOptions.value;

    let selectedMunicipalities = municipalities.value;
    if (municipi.value.length) {
      selectedMunicipalities = municipi.value.map((munId) =>
        municipalities.value.find((mun) => mun.id === munId),
      );
    } else {
      if (comarca.value) {
        selectedMunicipalities = selectedMunicipalities.filter(
          (mun) => mun.comarca.comarca_code === comarca.value,
        );
      }
      if (tram.value) {
        const selectedTram = tramOptions.value.find((t) => t.id === tram.value);
        const min = selectedTram.min;
        const max = selectedTram?.max || Infinity;

        selectedMunicipalities = selectedMunicipalities.filter(
          (mun) => mun.population > min && mun.population < max,
        );
      }
    }

    return otherGroupingsOptions.value
      .map((g) => {
        const hasChildren = g?.children?.length > 0;

        if (!hasChildren) {
          // Flat option: check if any municipality has this aggregation slug
          const shouldInclude = selectedMunicipalities.some((mun) =>
            municipalityMatchesSlug(mun, g.id),
          );
          return shouldInclude ? g : null;
        }

        // Group with children: filter to only children that exist in the municipalities
        const filteredChildren = g.children.filter((child) =>
          selectedMunicipalities.some((mun) =>
            municipalityMatchesSlug(mun, child.id),
          ),
        );

        if (!filteredChildren.length) return null;

        return { ...g, children: filteredChildren };
      })
      .filter(Boolean);
  });

  return {
    filteredMunicipalityOptions,
    filteredComarcaOptions,
    filteredTramOptions,
    filteredOtherGroupingOptions,
  };
}
