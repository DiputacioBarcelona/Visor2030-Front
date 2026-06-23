import axios from "axios";
import { csvParse, autoType } from "d3";
import * as IDS from "@/utils/dibarometre/ids";

const url = {
  data: window.dibarometre_url,
  data_list:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHogWunytJZY0taxI8Dlv_CtvqOsJu0L9SoOsUYWqr3FjpZktlsujXDP7Z4QsYMkZMmyGm3_yNZ2j-/pub?output=csv",
  enquesta_text:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4JSSGiLVImIaHcL3kNVQKBM4QwaL957kDMRkHGISqZp-v0tKHuWPmKmK9j4FNKdsF8h56Pt8he6Nf/pub?output=csv",
  municipalities_dates_2024:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTylgXlu3P5Z_zT6sYSRuUb7U4mgfi2khH7e_kzCRkYUjYFhtI2Byz-qtbjAs0oBtBQRjYP94XHBZYz/pub?output=csv",
  municipalities_2024:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSawNIZOmzIu6d1BqS2OqPLUcIVR2HO0IX_Zw7csjB-hvg_9qUKmW_xbUBXstKYSQPhqKlBEzbuCHCz/pub?output=csv",
};

const data = {};

export default {
  async getData() {
    if (!data.data) {
      const json = (await axios(url.data)).data;

      const date = json.modificacio;
      data.date =
        typeof date === "string"
          ? date.split(" ")[0].split("-").reverse().join("/") // format date string
          : "";

      data.data = json.elements.map((e) => autoType(e));
    }

    return data.data;
  },

  // all municipalities
  async getMunis() {
    if (!data.munis) {
      try {
        const res = await Promise.all([
          axios("/data/municipalities_2020.csv"),
          axios(url.municipalities_2024),
        ]);

        data.munis = res.map((e) =>
          csvParse(e.data, (d) => {
            return {
              ...d,
              id: +d[IDS.MUN.ID],
              id_original: d["MUN_INE"],
              MUN_INE: +d["MUN_INE"],
              id_tram_poblacio: +d.id_tram_poblacio,
              population: +d.Population.replace(/,/g, ""),
              population_range: d["Tram etiqueta"].split("-"),
            };
          }),
        );
      } catch (err) {
        console.log(err);
      }
    }

    return data.munis;
  },

  async getDates(munId, surveyVersion, smallMun) {
    if (!data.dates) {
      try {
        const res = await Promise.all([
          axios("/data/municipalities_dates_2020.csv"),
          axios(url.municipalities_dates_2024),
        ]);
        data.dates = res.map((e) => csvParse(e.data, autoType));
      } catch (err) {
        console.log(err);
      }
    }

    const munDates = smallMun
      ? // for small muns, use dates in the first row with id 0
        data.dates[surveyVersion - 1].find((e) => !e[IDS.DATES.MUN_ID])
      : // otherwise find actual dates for mun
        data.dates[surveyVersion - 1].find(
          (e) => +e[IDS.DATES.MUN_ID] === +munId,
        );

    if (munDates) {
      return munDates;
    } else return null;
  },

  // all questions
  async getSurvey() {
    if (!data.survey) {
      try {
        const csv = (await axios(url.enquesta_text)).data;

        const processed = csvParse(csv, (d) => {
          // make sure id is the same format as in the data
          d[IDS.SURVEY.ID] = d[IDS.SURVEY.ID]
            .replace("P", "p")
            .replace(".", "_");

          return autoType(d);
        });

        data.survey = { 1: [], 2: [] };
        processed.forEach((e) => {
          if (e[IDS.SURVEY.VERSION_1]) data.survey[1].push(e);
          if (e[IDS.SURVEY.VERSION_2]) data.survey[2].push(e);
        });
      } catch (err) {
        console.log(err);
      }
    }

    return data.survey;
  },

  // dictionary for names of answer options
  async getDictionary() {
    if (!data.dict) {
      try {
        // fetch dictionary
        const file = (await axios(url.data_list)).data;

        data.dict = csvParse(file, (d) => {
          return {
            ...d,
            [IDS.DICT.VALUE]: +d[IDS.DICT.VALUE],
            [IDS.DICT.ID]: d[IDS.DICT.ID].replace("P", "p").replace(".", "_"),
          };
        });
      } catch (err) {
        console.log(err);
      }
    }

    return data.dict;
  },

  async getSdgQuestions() {
    if (!data.sdg_questions) {
      try {
        const csv = (await axios("/data/sdg_dibarometre.csv")).data;
        data.sdg_questions = csvParse(csv);
      } catch (err) {
        console.log(err);
      }
    }

    return data.sdg_questions;
  },
};
