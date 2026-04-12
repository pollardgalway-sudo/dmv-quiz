const OpenCC = require("opencc-js");
const fs = require("fs");
const path = require("path");

const converter = OpenCC.Converter({ from: "cn", to: "twp" });

function convertQuestion(q) {
  // Convert question text
  if (q.question && typeof q.question === "object") {
    if (q.question["zh-Hans"]) {
      q.question["zh-Hant"] = converter(q.question["zh-Hans"]);
    }
  }

  // Convert options
  if (q.options && typeof q.options === "object" && !Array.isArray(q.options)) {
    for (const key of ["A", "B", "C", "D"]) {
      if (q.options[key] && typeof q.options[key] === "object") {
        if (q.options[key]["zh-Hans"]) {
          q.options[key]["zh-Hant"] = converter(q.options[key]["zh-Hans"]);
        }
      }
    }
  }

  // Convert explanation
  if (q.explanation && typeof q.explanation === "object") {
    if (q.explanation["zh-Hans"]) {
      q.explanation["zh-Hant"] = converter(q.explanation["zh-Hans"]);
    }
  }

  // Convert dmv_ref analysis
  if (q.dmv_ref && typeof q.dmv_ref === "object") {
    if (q.dmv_ref["analysis_zh-Hans"]) {
      q.dmv_ref["analysis_zh-Hant"] = converter(q.dmv_ref["analysis_zh-Hans"]);
    }
  }

  return q;
}

// Process files
const files = [
  "data/questions-all.json",
  "public/data/questions-all.json",
  "public/data/questions-basics.json",
  "public/data/questions-deepdive.json",
  "public/data/questions-signs.json",
];

for (const file of files) {
  const fullPath = path.join(__dirname, "..", file);
  try {
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    console.log(`\nProcessing ${file} (${data.length} questions)...`);

    let converted = 0;
    data.forEach((q) => {
      const before = q.question?.["zh-Hant"] || "";
      convertQuestion(q);
      const after = q.question?.["zh-Hant"] || "";
      if (before !== after) converted++;
    });

    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    console.log(`  ✅ Converted ${converted} questions to Traditional Chinese`);
  } catch (e) {
    console.log(`  ⚠️ ${file}: ${e.message}`);
  }
}

console.log("\n🎉 All done!");
