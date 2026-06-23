import municipalities from "@/assets/municipalities.json";

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
    .replace(/ +(?= )/g, "");

export function trailingZero(num) {
  return num < 10 ? "0" + num : "" + num;
}

export function urlSafe(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
}

export function num(num) {
  return +num.replace(",", ".");
}

export function removeNulls(data) {
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      if (!data[key]) delete data[key];
    }
  }
  return data;
}

export function getMunicipalityByCode(id) {
  return municipalities.find(
    (m) => m.id === id || m.municipality_code_6 === id,
  );
}

export const darkSDGs = [2, 3, 5, 6, 7, 9, 11, 12, 14, 15];

export const municipisWithCoast = [
  "08110",
  "08261",
  "08163",
  "08035",
  "08235",
  "08040",
  "08006",
  "08032",
  "08264",
  "08197",
  "08121",
  "08029",
  "08219",
  "08172",
  "08118",
  "08126",
  "08015",
  "08194",
  "08019",
  "08169",
  "08301",
  "08089",
  "08056",
  "08270",
  "08307",
  "08074",
  "08231",
];

export const comarcasWithCoast = ["11", "13", "17", "21"];

export const aggregationsWithCoast = [
  "litoral",
  "penedes",
  "no-rural",
  "amb",
  "rmb",
  "industrials",
];
