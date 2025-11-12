// generateDatabases.js
import fs from "fs";
import path from "path";
import Papa from "papaparse";

// CSV 路徑
const csvPath = path.resolve("./ms_csv.csv");

// 讀取 CSV
const csvFile = fs.readFileSync(csvPath, "utf8");

const scamData = [];
const trueData = [];

Papa.parse(csvFile, {
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    results.data.forEach((row) => {
      const message = {
        id: Number(row.編號),
        type: row.類型,
        sender: row.傳送者,
        content: row.內容,
        isScam: row['是否詐騙(1詐騙2否)'] === "1",
        explanation: row.解析,
        // 新增心理分析分數
        psychologyScores: {
          authority: Number(row.delta_auth_權威分) || 0,
          timing: Number(row.delta_time_時間分) || 0,
          style: Number(row.delta_style_風格分) || 0,
          motivation: Number(row.delta_motive_獎懲分) || 0,
        },
        // 新增科技指標
        techScore: Number(row.tech_score_科技指標) || 0,
      };

      if (row['是否詐騙(1詐騙2否)'] === "1") scamData.push(message);
      else if (row['是否詐騙(1詐騙2否)'] === "2") trueData.push(message);
    });
  },
});

// 輸出 database.js（詐騙簡訊）
fs.writeFileSync(
  path.resolve("./database.js"),
  `export const scamMessages = ${JSON.stringify(scamData, null, 2)};`
);

// 輸出 database_true.js（真實簡訊）
fs.writeFileSync(
  path.resolve("./database_true.js"),
  `export const realMessages = ${JSON.stringify(trueData, null, 2)};`
);

console.log("✅ database.js 與 database_true.js 已生成完成！");
console.log(`📦 詐騙筆數: ${scamData.length}`);
console.log(`📦 真實筆數: ${trueData.length}`);
