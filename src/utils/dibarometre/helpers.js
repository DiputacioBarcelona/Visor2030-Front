export const charts = {
  "stacked bar": "StackedBarChart",
  barchart: "BarChart",
  donut: "DonutChart",
  heatmap: "BarChartHeatMap",
  barchart2level: "BarChartSwitch",
};

export const allYearOptions = [
  { id: 2020, name: "2020-2022", label: "20-22", version: 1 },
  { id: 2023, name: "2023-2024", label: "23-24", version: 2 },
];

export const getTramId = (surveyElementId) => {
  return +surveyElementId
    .split("_")
    .find((e) => e.startsWith("t"))
    ?.replace("t", "");
};

export const getComarcaId = (surveyElementId) => {
  return +surveyElementId
    .split("_")
    .find((e) => e.startsWith("c"))
    ?.replace("c", "");
};

export const getMunId = (surveyElementId) => {
  return +surveyElementId
    .split("_")
    .find((e) => e.startsWith("m"))
    ?.replace("m", "");
};

const accentsMap = {
  a: "á|à|ã|â|À|Á|Ã|Â",
  e: "é|è|ê|É|È|Ê",
  i: "í|ì|î|Í|Ì|Î",
  o: "ó|ò|ô|õ|Ó|Ò|Ô|Õ",
  u: "ú|ù|û|ü|Ú|Ù|Û|Ü",
  c: "ç|Ç",
  n: "ñ|Ñ",
};

export const slugify = (text) =>
  Object.keys(accentsMap)
    .reduce(
      (acc, cur) => acc.replace(new RegExp(accentsMap[cur], "g"), cur),
      text?.toLowerCase() || "",
    )
    .trim()
    .replace(/ +(?= )/g, "")
    .replace(/\s/g, "-");
