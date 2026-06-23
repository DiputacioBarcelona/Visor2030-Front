// translate.cjs
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");
const translate = require("@vitalets/google-translate-api");

const [, , fromLang, toLang] = process.argv;

if (!fromLang || !toLang) {
  console.error("❌ Usage: npm run translate -- <fromLang> <toLang>");
  process.exit(1);
}

const inputPath = path.join(__dirname, `${fromLang}.csv`);
const outputPath = path.join(__dirname, `${toLang}.csv`);

const input = fs.readFileSync(inputPath, "utf-8");
const rows = parse(input, { columns: true });

function preserveTags(text) {
  const tags = text.match(/{[^}]+}/g) ?? [];
  let placeholder = text;
  tags.forEach((tag, i) => {
    placeholder = placeholder.replace(tag, `__T${i}__`);
  });
  return { placeholder, tags };
}

function restoreTags(text, tags) {
  let restored = text;
  tags.forEach((tag, i) => {
    restored = restored.replace(`__T${i}__`, tag);
  });
  return restored;
}

async function main() {
  console.log(`🔁 Translating from "${fromLang}.csv" to "${toLang}.csv"...`);

  for (const row of rows) {
    if (!row.value) continue;

    const { placeholder, tags } = preserveTags(row.value);
    try {
      // const res = await translate(placeholder, { from: fromLang, to: toLang });
      // row.value = restoreTags(res.text, tags);
      row.value = restoreTags(`[${toLang.toUpperCase()}] ${placeholder}`, tags);
    } catch (err) {
      console.error("❌ Translation error:", err.message);
    }
  }

  fs.writeFileSync(outputPath, stringify(rows, { header: true }));
  console.log(`✅ Translation complete. Output written to ${outputPath}`);
}

main();
