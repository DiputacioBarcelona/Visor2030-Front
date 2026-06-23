import useFilters from "@/functions/useFilters";
import useEntityType from "@/functions/useEntityType";

export default function useGetLink() {
  const { id, comarcaId, agregacioId } = useFilters();
  const entityType = useEntityType();
  const targets = inject("targets");

  const entityIdParamMap = {
    comarca: () => ({ comarcaId: comarcaId.value }),
    agregacio: () => ({ agregacioId: agregacioId.value }),
  };

  const entityIdParam = computed(
    () => (entityIdParamMap[entityType.value] || (() => ({ id: id.value })))(),
  );

  function getLink(sdg) {
    // if we have an indicator for this sdg, return the link to the first indicator
    const target = targets.value.find(
      (t) => t.sdg === sdg && t.indicators.length > 0,
    );

    if (target) {
      const targetId = target.target_id.split(".")[1];
      return {
        name: `${entityType.value}-indicator`,
        params: {
          ...entityIdParam.value,
          targetId,
          sdg,
          indicatorId: target.indicators[0].indicator_id.split(".")[2],
        },
        query: { all: true },
      };
    }
    // otherwise return the link to the sdg page
    return {
      name: `${entityType.value}-sdg`,
      params: { ...entityIdParam.value, sdg },
    };
  }

  return getLink;
}
