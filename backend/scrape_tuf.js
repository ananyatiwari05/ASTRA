const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log("Navigating...");
  await page.goto('https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', { waitUntil: 'networkidle', timeout: 60000 });
  
  console.log("Evaluating...");
  const data = await page.evaluate(() => {
    const topics = Array.from(document.querySelectorAll('details.tuf-details'));
    return topics.map((t, idx) => {
      const summary = t.querySelector('summary h2, summary span.font-semibold');
      const topicName = summary ? summary.innerText.trim() : `Topic ${idx+1}`;
      
      const rows = Array.from(t.querySelectorAll('table tbody tr'));
      const problems = rows.map((r, pIdx) => {
        const titleA = r.querySelector('td:nth-child(2) a');
        const diffSpan = r.querySelector('td:nth-child(4) span');
        const urlA = r.querySelector('td:nth-child(5) a, td:nth-child(6) a'); // depends on columns
        
        return {
          title: titleA ? titleA.innerText.trim() : `Problem ${pIdx+1}`,
          url: urlA ? urlA.href : '',
          difficulty: diffSpan ? diffSpan.innerText.trim() : 'Medium'
        };
      }).filter(p => p.title && p.url); // only valid problems
      
      return { topic: topicName, problems };
    });
  });

  fs.writeFileSync('a2z_scraped.json', JSON.stringify(data, null, 2));
  console.log("Saved A2Z data. Total topics:", data.length);
  await browser.close();
})();
