const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/data/sheets/a2z.json');
const content = fs.readFileSync(filePath, 'utf8');

// The file contains a JS object literal, not strict JSON.
// We can parse it by evaluating it.
// To make it a valid JS expression, wrap it in parentheses.
let obj;
try {
  obj = eval('(' + content + ')');
} catch (e) {
  // If it's multiple comma separated objects without root braces, wrap in {}
  try {
    obj = eval('({' + content + '})');
  } catch (e2) {
    console.error("Failed to parse JS object:", e2);
    process.exit(1);
  }
}

fs.writeFileSync(filePath, JSON.stringify(obj, null, 4));
console.log("Converted a2z.json to valid JSON");
