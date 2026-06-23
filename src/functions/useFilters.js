import { useRoute, useRouter } from "vue-router";
import { removeNulls } from "@/utils/helpers";
import { computed, ref } from "vue";
import { min } from "d3";

function useSetQuery() {
  const router = useRouter();
  const route = useRoute();

  const setQuery = (q = {}, page = null, params = null) => {
    router.push({
      name: page || route.name,
      params: params || route.params,
      query: removeNulls({ ...route.query, ...q }),
    });
  };

  return setQuery;
}

export function useSingleRouteFilter(
  name,
  defaultValue = ref(null),
  type = "string",
) {
  const route = useRoute();
  const setQuery = useSetQuery();

  const filter = computed({
    get: () => {
      if (type === "number") return +route.query[name] || defaultValue.value;
      else return route.query[name] || defaultValue.value;
    },
    set: (value) => setQuery({ [name]: value }),
  });

  return filter;
}

export function useSingleRouteParam(
  name,
  defaultValue = ref(null),
  type = "string",
) {
  const route = useRoute();
  const router = useRouter();

  const filter = computed({
    get: () => {
      if (type === "number") return +route.params[name] || defaultValue.value;
      else return route.params[name] || defaultValue.value;
    },
    set: (value) =>
      router.push({
        params: { ...route.params, [name]: value },
        query: route.query,
      }),
  });

  return filter;
}

export function useMultipleRouteFilter(name, defaultValue = ref([])) {
  const route = useRoute();
  const router = useRouter();

  const filter = computed({
    get: () => {
      return route.query[name]?.split(",") || [...defaultValue.value];
    },
    set: (value) => {
      // we can set it to null to remove the filter
      if (value === null) {
        setSegment(name, null);
        return;
      }
      // if it's an array, set it directly
      if (Array.isArray(value)) {
        setSegment(name, value.length ? value.join(",") : null);
        return;
      }
      // otherwise, toggle the value
      const curr = route.query[name]?.split(",") || [...defaultValue.value];

      if (curr.includes(value)) {
        curr.splice(curr.indexOf(value), 1);
      } else {
        curr.push(value);
      }

      setSegment(name, curr?.length ? curr.join(",") : null);
    },
  });

  const setSegment = (name, value) => {
    router.push({ query: removeNulls({ ...route.query, [name]: value }) });
  };

  return filter;
}

export default function useFilters() {
  const setQuery = useSetQuery();

  const id = useSingleRouteParam("id");
  const comarcaId = useSingleRouteParam("comarcaId");
  const agregacioId = useSingleRouteParam("agregacioId");
  const sdg = useSingleRouteParam("sdg", ref(null), "number");
  const targetId = useSingleRouteParam("targetId");
  const indicatorId = useSingleRouteParam("indicatorId");
  const subindicator = useSingleRouteFilter("subindicator");

  const year = useSingleRouteFilter("year", ref("2024"));
  const view = useSingleRouteFilter("view");
  const show = useSingleRouteFilter("show");
  const filterSDG = useSingleRouteFilter("sdg", ref(null), "number");
  const all = useSingleRouteFilter("all");

  // analisi
  const factor = useSingleRouteFilter("factor", ref(1.5));
  const min_weight = useSingleRouteFilter("min_weight", ref(30));

  const size = useSingleRouteFilter("size", ref("none"));
  const facet = useSingleRouteFilter("facet", ref("none"));
  const comarca = useSingleRouteFilter("comarca");
  const tram = useSingleRouteFilter("tram");
  const municipi = useMultipleRouteFilter("municipi");
  const ubicacio = useSingleRouteFilter("ubicacio", ref(null), "number");
  const ruralitat = useSingleRouteFilter("ruralitat", ref(null), "number");
  const gr = useMultipleRouteFilter("gr", ref([]));

  const scope = useSingleRouteFilter("scope", ref("municipi"));

  const pieces = computed(() => {
    return {
      sdg: sdg.value,
      target: targetId.value,
      indicator: indicatorId.value,
      subindicator: subindicator.value,
    };
  });

  const fullTargetId = computed(() => {
    return `${sdg.value}.${targetId.value}`;
  });

  const fullIndicatorId = computed(() => {
    return `${fullTargetId.value}.${indicatorId.value}`;
  });

  return {
    id,
    comarcaId,
    agregacioId,
    indicatorId,
    sdg,
    targetId,
    setQuery,
    pieces,
    fullTargetId,
    fullIndicatorId,
    subindicator,
    year,
    view,
    show,
    filterSDG,
    all,
    factor,
    min_weight,
    size,
    facet,
    comarca,
    tram,
    municipi,
    ubicacio,
    ruralitat,
    gr,
    scope,
  };
}
