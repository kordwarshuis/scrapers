import puppeteer from 'puppeteer';
import createOutput from '../modules/createOutput.js';
import createInput from '../modules/createInput.js';
import writeToFile from '../modules/writeToFile.js';

const siteName = 'Gleif website';
const filePath = '../output/gleif-sitemap.xml';
const result = '../output/gleif.json';

(async () => {
  const sitemap = await createInput({
    sourceType: 'localXMLsitemap',
    sourcePath: filePath,
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Iterate over each URL in the sitemap and create an array of entries for each URL
  const entries = [];
  console.log('Indexing pages...');

  // Full index:
  for (const url of sitemap.urlset.url) {
    // Partial index for testing:
    // for (const url of sitemap.urlset.url.slice(0, 3)) {
    const pageUrl = url.loc[0];
    console.log(`Indexing ${pageUrl}`);

    try {
      // Navigate to the page URL and get all paragraph nodes
      await page.goto(pageUrl);
      const elements = await page.$$eval('.content p', (elements) =>
        elements.map((el) => ({
          text: el.textContent.trim(),
          tag: el.tagName.toLowerCase(),
        }))
      );
      console.log('elements: ', elements);

      let output = createOutput({
        siteName,
        pageUrl,
        elements: elements,
        hierarchyLvl0: '',
        hierarchyLvl1: 'Gleif website',
        hierarchyLvl2: '',
        hierarchyLvl3: '',
        knowledgeLevel: '',
        knowledgeLevel: '',
      });

      output.forEach((entry) => {
        entries.push(entry);
      });
    } catch (err) {
      console.error(`Error processing page ${pageUrl}: ${err}`);
    }
  }

  writeToFile(entries, result);

  await browser.close();
})();
