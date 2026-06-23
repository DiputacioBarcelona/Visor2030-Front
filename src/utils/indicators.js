const simple = (d) => d.value;
const percent = (d) => (d.value2 ? (d.value * 100) / d.value2 : simple(d));
const percentMonthly = (d) =>
  d.value2 ? (d.value * 12 * 100) / d.value2 : simple(d);
const perThousand = (d) => (d.value2 ? (d.value * 1000) / d.value2 : simple(d));
// const dividedThousand = (d) => d.value / (d.value2 * 1);
const perUnit = (d) => (d.value2 ? d.value / d.value2 : simple(d));
const simplePerHundred = (d) => d.value * 100;
const simplePerThousand = (d) => d.value * 1000;
const perTenThousand = (d) =>
  d.value2 ? (d.value * 10000) / d.value2 : simple(d);
const perHundredThousand = (d) =>
  d.value2 ? (d.value * 100000) / d.value2 : simple(d);
const diffPercent = (d) => ((d.value - d.value2) * 100) / (d.value + d.value2);
const diff = (d) => d.value - d.value2;
const baixaAlta = (d) => {
  // values 1,2,3,4 for LOW, MEDIUM, HIGH, VERY_HIGH
  switch (d.value) {
    case 1:
      return "LOW";
    case 2:
      return "MEDIUM";
    case 3:
      return "HIGH";
    case 4:
      return "VERY_HIGH";
    default:
      return "UNKNOWN";
  }
};
const siNo = (d) => {
  switch (d.value) {
    case 0:
      return "NO";
    case 1:
      return "SI";
    default:
      return "UNKNOWN";
  }
};
const actualitzat = (d) => {
  switch (d.value) {
    case 0:
      return "NO_ACTUALITZAT";
    case 1:
      return "ACTUALITZAT";
    default:
      return "UNKNOWN";
  }
};

const indicators = {
  "1.1.1": {
    calculation: simple,
    decimals: 1,
    decimals1: 1,
    decimals2: 0,
  },
  "1.2.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "1.2.2": {
    calculation: simple,
    decimals: 0,
    decimals1: 0,
    decimals2: 0,
  },
  "1.2.3": {
    calculation: perThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "1.3.1": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "1.4.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 1,
  },
  "1.4.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "1.5.1": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
    // subindicators: [0, 2, 3, 4, 5, 6], // the subindicators
  },
  "2.1.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "2.3.1": {
    calculation: percent, // it's not really a percentage, it's just every 100 habitants, so same calculation
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "2.3.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 1,
    decimals2: 1,
  },
  "2.3.3": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
    // subindicators: [0, 2], // the subindicators
  },
  "2.3.4": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
    // subindicators: [0, 2], // the subindicators
  },
  "3.4.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "3.4.2": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "3.6.1": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.1.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.1.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.2.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.4.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
    // subindicators: [0, 2, 3, 4], // the subindicators
  },
  "4.4.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.4.3": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.4.4": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.5.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "4.a.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "5.1.1": {
    calculation: diff,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "5.5.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "5.c.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 1,
    decimals2: 1,
  },
  "5.c.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 1,
    decimals2: 0,
  },
  "6.1.1": {
    calculation: simple,
    decimals: 3,
    decimals1: 3,
    decimals2: 0,
  },
  "6.4.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "7.1.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "7.2.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 1,
    decimals2: 1,
  },
  "7.3.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 1,
    decimals2: 0,
  },
  "8.2.1": {
    calculation: simple, // redo
    decimals: 0,
    decimals1: 0,
    decimals2: 0,
  },
  "8.3.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "8.3.2": {
    calculation: perThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "8.3.3": {
    calculation: simple,
    decimals: 1,
    decimals1: 1,
    decimals2: 0,
  },
  "8.3.4": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "8.5.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 1,
    decimals2: 0,
  },
  "8.5.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 1,
    decimals2: 0,
  },
  "8.9.1": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "9.1.1": {
    calculation: simplePerHundred,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "9.2.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "9.5.1": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "9.5.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "9.c.1": {
    calculation: simplePerHundred,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "10.1.1": {
    calculation: simple,
    decimals: 1,
    decimals1: 1,
    decimals2: 0,
  },
  "10.1.2": {
    calculation: simple,
    decimals: 1,
    decimals1: 1,
    decimals2: 0,
  },
  "10.1.3": {
    calculation: simple,
    decimals: 1,
    decimals1: 1,
    decimals2: 0,
  },
  "10.1.4": {
    calculation: simple,
    decimals: 0,
    decimals1: 0,
    decimals2: 0,
  },
  "10.4.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
    // subindicators: [0, 2], // the subindicators
  },
  "10.4.2": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
    // subindicators: [0, 2], // the subindicators
  },
  "11.1.1": {
    calculation: percentMonthly,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "11.2.1": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "11.3.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "11.3.2": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "11.4.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "11.4.2": {
    calculation: perTenThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "11.6.1": {
    calculation: perThousand,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "11.6.2": {
    calculation: percent,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "11.7.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "12.1.1": {
    calculation: perHundredThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "12.5.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "12.5.2": {
    calculation: perThousand,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "13.1.1": {
    calculation: simple,
    textFormat: baixaAlta,
    decimals: 0,
    decimals1: 0,
    decimals2: 0,
  },
  "13.2.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "13.2.2": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "14.1.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "14.2.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "15.1.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "15.1.2": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "15.2.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "15.4.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 2,
    decimals2: 2,
  },
  "16.6.1": {
    calculation: simple,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "16.7.1": {
    calculation: percent,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "16.7.2": {
    calculation: simple,
    textFormat: actualitzat,
    decimals: 0,
    decimals1: 0,
    decimals2: 0,
  },
  "16.10.1": {
    calculation: simple,
    decimals: 1,
    decimals1: 1,
    decimals2: 0,
  },
  "17.1.1": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "17.1.2": {
    calculation: perUnit,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "17.2.1": {
    calculation: perUnit,
    // textFormat: siNo,
    decimals: 2,
    decimals1: 2,
    decimals2: 0,
  },
  "17.17.1": {
    calculation: perHundredThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
  "17.17.2": {
    calculation: perHundredThousand,
    decimals: 2,
    decimals1: 0,
    decimals2: 0,
  },
};

export default indicators;
