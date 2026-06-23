const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2); // Skip the first two elements
const lang = args[0] || "ca"; // Store language code
const filename = `${lang}.csv`;

async function convertJsonToCsv() {
  const d3 = await import("d3");

  // read locale keys from json
  const filePath = path.resolve(__dirname, `../src/locales/${lang}.json`);
  const jsonData = fs.readFileSync(filePath, "utf8");

  const textObject = JSON.parse(jsonData);

  // convert to csv
  const csv = d3.csvFormat(flattenJson(textObject));

  // write to file
  fs.writeFileSync(path.resolve(__dirname, filename), csv);
}

// Call the async function
convertJsonToCsv().catch(console.error);

function flattenJson(json) {
  // turn hierarchical object into an array of objects where each leaf is an object
  // key is the path connected by dots

  const result = [];

  const traverse = (obj, path = []) => {
    Object.keys(obj).forEach((key) => {
      const newPath = [...path, key];

      if (Array.isArray(obj[key])) {
        obj[key].forEach((value) => {
          // add array syntax []
          const newKey = newPath.join(".") + "[]";
          result.push({
            key: newKey,
            value: value,
          });
        });
      } else if (typeof obj[key] === "string") {
        result.push({
          key: newPath.join("."),
          value: obj[key],
        });
      } else {
        traverse(obj[key], newPath);
      }
    });
  };

  traverse(json);

  return result;
}
