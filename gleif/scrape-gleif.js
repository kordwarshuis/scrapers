import puppeteer from 'puppeteer';
import xml2js from 'xml2js';
import fetch from 'node-fetch';
import fs from 'fs';

// specify the file path
const filePath = 'sitemap2.xml';

// read the file contents synchronously
let fileContents = fs.readFileSync(filePath, 'utf-8');

// fileContents = fileContents
//   .replace(/[\n\r]/g, '\\n')
//   .replace(/&/g, '&amp;')
//   .replace(/-/g, '&#45;');

// var cleanedString = fileContents.replace(/[\n]/g, '');
var cleanedString = fileContents;

// log the contents of the file
// console.log(fileContents);

// var cleanedString = sitemapXml.replace('\ufeff', '');
// var cleanedString = fileContents;
console.log('cleanedString: ', cleanedString);
const result = '../output/gleif.json';

(async () => {
  // const sitemap = await xml2js.parseStringPromise(sitemapXml);
  const sitemap = await xml2js.parseStringPromise(cleanedString);

  console.log(`Found ${sitemap.urlset.url.length} URLs in sitemap`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Iterate over each URL in the sitemap and create an array of entries for each URL
  const entries = [];
  console.log('Indexing pages...');

  // Full index:
  for (const url of sitemap.urlset.url) {
    try {
      // Partial index for testing:
      // for (const url of sitemap.urlset.url.slice(0, 3)) {
      const pageUrl = url.loc[0];
      console.log(`Indexing ${pageUrl}`);

      // Navigate to the page URL and get all paragraph nodes
      await page.goto(pageUrl);
      const paragraphs = await page.$$eval('p', (elements) =>
        elements.map((el) => ({
          text: el.textContent.trim(),
          tag: el.tagName.toLowerCase(),
        }))
      );
      console.log('paragraphs: ', paragraphs);

      // Create an entry for each paragraph with its own breadcrumbs
      for (const paragraph of paragraphs) {
        const entry = {
          url: pageUrl,
          content: paragraph.text || '',
          tag: paragraph.tag || '',
          timestamp: new Date().toISOString() || '',
          'hierarchy.lvl0': '',
          'hierarchy.lvl1': '',
          'hierarchy.lvl2': '',
          'hierarchy.lvl3': '',
          knowledgeLevel: '',
        };
        entries.push(entry);
      }
    } catch (error) {
      console.log(`Error indexing ${pageUrl}: ${error.message}`);
    }
  }

  // Write the entries array to a file
  console.log(`Writing search index to file...`);
  const fileContent = `${JSON.stringify(entries)}`;
  fs.writeFileSync(result, fileContent);

  console.log(`Indexed ${entries.length} pages`);
  console.log(`Search index written to ${result}`);

  await browser.close();
})();
