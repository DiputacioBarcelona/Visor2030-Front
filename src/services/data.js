import { api, localApi, localApiPlans } from "./apis";

const urls = {
  municipalities: "/municipalities?order[municipality_name]=asc",
  comarcas: "/comarcas?order[comarca_name]=asc",
  aggregations: "/aggregations",
  // municipality: (id) => `/municipalities/${id}`,
  targets: "/targets",
  values: "/municipality_values",
  provinceValues: "/province_values",
  comarcaValues: "/comarca_values",
  aggregationValues: "/aggregation_values",
  budgets: "/budgets",
  weights: "/pesos.csv",
  labels: "/labels-hierarchy?language=",
  postLabels: "/labels-import?language=ca",
  synthetic: "/synthetic-sdg",
  plans_municipals: "/plans_municipals.csv",
  plans_intermunicipals: "/plans_intermunicipals.csv",
  plans_comarcals: "/plans_comarcals.csv",
  plans: "/llistat_plans.csv",
  sdg_indicators: "/sdg-indicators",
  indicators: "/indicators",
  populations: "/populations",
};

function queryParamsToString(params, ignore = { locale: true }) {
  // map some names
  // id becomes municipality.id
  // indicatorId becomes indicator.indicator_id
  // const mapped = {
  //   id: "municipality.id",
  //   indicatorId: "indicator.id",
  // };

  // create a clone of params
  params = { ...params };

  // params.targetId needs to combine the sdg and target_id
  if (params.targetId) {
    params.targetId = `${params.sdg}.${params.targetId}`;
  }

  // same for indicatorId
  if (params.indicatorId) {
    params.indicatorId = `${params.targetId}.${params.indicatorId}`;
  }

  const mapped = {
    id: "municipality.municipality_code",
    comarcaId: "comarca.comarca_code",
    agregacioId: "aggregation.slug",
    indicatorId: "indicator.indicator_id",
  };

  // return as a query string with the mapped names
  return Object.keys(params)
    .filter((key) => !ignore[key])
    .map((key) => `${mapped[key] || key}=${params[key]}`)
    .join("&");
}

export default {
  async getMunicipalities() {
    return await api(urls.municipalities);
  },
  async getComarcas() {
    return await api(urls.comarcas);
  },
  async getPopulations(params) {
    const qs = params ? "?" + queryParamsToString(params, { locale: true }) : "";
    return await api(urls.populations + qs);
  },
  async getTargets(params, query) {
    return await api(
      urls.targets +
        "?" +
        queryParamsToString(params, { sdg: true, id: true, locale: true }),
    );
  },
  async getValues(params, query) {
    return await api(urls.values + "?" + queryParamsToString(params));
  },
  async getProvinceValues(params, query) {
    return await api(
      urls.provinceValues +
        "?" +
        queryParamsToString(params, {
          sdg: true,
          targetId: true,
          agregacioId: true,
          locale: true,
        }),
    );
  },
  async getComarcaValues(params, query) {
    return await api(urls.comarcaValues + "?" + queryParamsToString(params));
  },
  async getAggregationValues(params, query) {
    return await api(
      urls.aggregationValues + "?" + queryParamsToString(params),
    );
  },
  async getAggregations() {
    return await api(urls.aggregations);
  },
  async getBudgets(params, query) {
    return await api(
      urls.budgets +
        "?" +
        queryParamsToString(params, { sdg: true, id: true, locale: true }),
    );
  },
  async getWeights() {
    return await localApi(urls.weights, processWeights);
  },
  async getSyntheticSDGValues(params, query) {
    // global: 1 means get also the dimension values
    const queryString = queryParamsToString({ ...params, global: 1 }).replace(
      "municipality.municipality_code",
      "municipality_code",
    );
    return await api(urls.synthetic + "?" + queryString);
  },
  async getSyntheticComarcaValues(params, query) {
    const queryString = queryParamsToString(
      { ...params, type: "comarca", global: 1 },
      { locale: true, comarcaId: true },
    );
    const comarcaCode = params.comarcaId;
    return await api(
      urls.synthetic + "?" + queryString + "&comarca_code=" + comarcaCode,
    );
  },
  async getSyntheticAggregationValues(params, query) {
    const queryString = queryParamsToString(
      { ...params, type: "aggregation", global: 1 },
      { locale: true, agregacioId: true },
    );
    const slug = params.agregacioId;
    return await api(
      urls.synthetic + "?" + queryString + "&aggregation_slug=" + slug,
    );
  },
  async getAllSyntheticSDGValues(params) {
    return await api(urls.synthetic + "?" + queryParamsToString(params));
  },
  async getSDGIndicatorValues(params) {
    return await api(urls.sdg_indicators + "?" + queryParamsToString(params));
  },

  // language system
  async getLabels(params) {
    const locale = params.locale || "ca";

    // console.log("getLabels", params, urls.labels + locale);

    return await api(urls.labels + locale, (data) =>
      processLabels(data, locale),
    );
  },
  async postLabels(_, __, data) {
    return await api(urls.postLabels, undefined, "post", false, data);
  },

  // plans
  async getMunicipalityPlans() {
    // const [municipals, intermunicipals, comarcals] = await Promise.all([
    //   localApiPlans(urls.plans_municipals, processPlansMunicipals),
    //   localApiPlans(urls.plans_intermunicipals, processPlansMunicipals),
    //   localApiPlans(urls.plans_comarcals, processPlansMunicipals),
    // ]);
    // const result = [
    //   ...municipals.map((e) => {
    //     e.type = "MUNICIPAL";
    //     return e;
    //   }),
    //   ...intermunicipals.map((e) => {
    //     e.type = "INTERMUNICIPAL";
    //     return e;
    //   }),
    //   ...comarcals.map((e) => {
    //     e.type = "COMARCAL";
    //     return e;
    //   }),
    // ];
    // console.log(result)

    // return result;

    const result = await localApi(urls.plans);
    // console.log(result)
    return result;
  },

  async getIndicators() {
    // console.log("getIndicators", params, query);

    const pageData = await api(
      urls.indicators, // + "?" + queryParamsToString(params)
    );

    return pageData.data;
  },
};

function processWeights(data) {
  return data;
}

function processPlansMunicipals(data) {
  // loop through data. for every column except
  // "Nom complet":
  //   "Any central":
  //   "Període":
  //   "Municipi"
  // remove the ending " %" and convert to number

  // and convert to number
  const columns = data.columns.filter(
    (col) =>
      col !== "Nom complet" &&
      col !== "Any central" &&
      col !== "Període" &&
      col !== "Municipi" &&
      col !== "Comarca",
  );
  // console.log(columns);
  // return data;
  // loop through data. for every column in columns, remove the ending " %" and convert to number
  data.forEach((row) => {
    columns.forEach((col) => {
      if (row[col]) {
        row[col] = parseFloat(row[col].replace(" %", "").replace(",", "."));
      }
    });
  });

  return data;
}

function processLabels(data, locale) {
  return { [locale]: data };
}
