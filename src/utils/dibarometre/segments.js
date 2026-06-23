export const segments = {
  numero_respostes_total: "Total",
  numero_respostes_dona: "Dones",
  numero_respostes_home: "Homes",
  numero_respostes_18_24: "18 a 24 anys",
  numero_respostes_25_34: "25 a 34 anys",
  numero_respostes_35_44: "35 a 44 anys",
  numero_respostes_45_54: "45 a 54 anys",
  numero_respostes_55_64: "55 a 64 anys",
  numero_respostes_mes_65: "Més de 65",
};
export const sections_segments = [
  {
    id: "total",
    name: "Totals",
    name_barchart: "Total",
    buttonText: "Total",
    segments: { numero_respostes_total: "Total" },
    stacked_segments: {
      numero_respostes_total: "Municipi",
      numero_respostes_total_tram: "Tram",
      numero_respostes_total_comarca: "Comarca",
      numero_respostes_total_provincia: "Província de Barcelona",
    },
  },
  {
    id: "gender",
    name: "Per sexe",
    name_barchart: "Per sexe",
    buttonText: "Gènere",
    segments: {
      numero_respostes_dona: "Dones",
      numero_respostes_home: "Homes",
    },
    stacked_segments: {
      numero_respostes_dona: "Dones",
      numero_respostes_home: "Homes",
    },
  },
  {
    id: "age",
    name: "Per edat",
    name_barchart: "Per edat",
    buttonText: "Edat",
    segments: {
      numero_respostes_18_24: "18 a 24",
      numero_respostes_25_34: "25 a 34",
      numero_respostes_35_44: "35 a 44",
      numero_respostes_45_54: "45 a 54",
      numero_respostes_55_64: "55 a 64",
      numero_respostes_mes_65: "Més de 65",
    },
    stacked_segments: {
      numero_respostes_18_24: "18 a 24",
      numero_respostes_25_34: "25 a 34",
      numero_respostes_35_44: "35 a 44",
      numero_respostes_45_54: "45 a 54",
      numero_respostes_55_64: "55 a 64",
      numero_respostes_mes_65: "Més de 65",
    },
  },
];
export const stacked_segments = {
  numero_respostes_total: "Municipi",
  numero_respostes_total_provincia: "Provincia de Barcelona",
  numero_respostes_total_comarca: "Comarca",
  numero_respostes_total_tram: "Tram",
  numero_respostes_dona: "Dones",
  numero_respostes_home: "Homes",
  numero_respostes_18_24: "18 a 24 anys",
  numero_respostes_25_34: "25 a 34 anys",
  numero_respostes_35_44: "35 a 44 anys",
  numero_respostes_45_54: "45 a 54 anys",
  numero_respostes_55_64: "55 a 64 anys",
  numero_respostes_mes_65: "Més de 65",
};

export default { segments, sections_segments, stacked_segments };
