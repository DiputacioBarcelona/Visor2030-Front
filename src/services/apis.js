import { dsvFormat } from "d3";
import { apiUrl as basePath, basePath as localBasePath } from "@/config";
// import localBasePath from "@/utils/basePath";
// import { csvToJson } from "@/utils/csvJsonUtils";
import { createCachedAPI } from "./apiFactory";

function apiConfigure(api) {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("visor2030-token");
      // only for endpoint labels-import
      if (token && config.url.includes("labels-import")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // Do something with request error
      return Promise.reject(error);
    },
  );

  return api;
}

const csvParse = dsvFormat(",");
const csvParse2 = dsvFormat(";");

export const api = createCachedAPI(basePath + "api", undefined, apiConfigure);
export const localApi = createCachedAPI(localBasePath + "data", csvParse.parse);
export const localApiPlans = createCachedAPI(
  localBasePath + "data",
  csvParse2.parse,
);
