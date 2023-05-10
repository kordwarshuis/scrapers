import puppeteer from 'puppeteer';
import xml2js from 'xml2js';
import fetch from 'node-fetch';
import fs from 'fs';

const url = 'https://weboftrust.github.io/WOT-terms/sitemap.xml';
const result = './output/WOT-terms.js';

(async () => {
  // Fetch and parse the sitemap.xml file
  console.log('Fetching sitemap...');
  const sitemapUrl = url;
  const sitemapResponse = await fetch(sitemapUrl);
  const sitemapXml = await sitemapResponse.text();
  const sitemap = await xml2js.parseStringPromise(sitemapXml);
  console.log(`Found ${sitemap.urlset.url.length} URLs in sitemap`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Iterate over each URL in the sitemap and create an array of entries for each URL
  const entries = [];
  console.log('Indexing pages...');
  for (const url of sitemap.urlset.url) {
    const pageUrl = url.loc[0];
    console.log(`Indexing ${pageUrl}`);

    // Navigate to the page URL and get all paragraph nodes
    await page.goto(pageUrl);
    const paragraphs = await page.$$eval('p', (elements) =>
      // Full index:
      // elements.map((el) => el.textContent)

      // Partial index for testing:
      elements.map((el) => el.textContent).slice(0, 3)
    );

    // Create an entry for this URL with the text content of all the paragraphs
    const entry = {
      url: pageUrl,
      text: paragraphs.join('\n'),
      timestamp: new Date().toISOString(),
    };
    entries.push(entry);
  }

  // Write the entries array to a file
  console.log(`Writing search index to file...`);
  const fileContent = `const searchIndex = ${JSON.stringify(
    entries
  )};\nmodule.exports = searchIndex;`;
  fs.writeFileSync(result, fileContent);

  console.log(`Indexed ${entries.length} pages`);
  console.log(`Search index written to ${result}`);

  await browser.close();
})();
