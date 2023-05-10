import puppeteer from 'puppeteer';
import xml2js from 'xml2js';
import fetch from 'node-fetch';
import fs from 'fs';

const url = 'https://weboftrust.github.io/WOT-terms/sitemap.xml';
const result = './output/WOT-terms.json';

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

  // Full index:
  // for (const url of sitemap.urlset.url) {

  // Partial index for testing:
  for (const url of sitemap.urlset.url.slice(100, 103)) {
    const pageUrl = url.loc[0];
    console.log(`Indexing ${pageUrl}`);

    // Navigate to the page URL and get all paragraph nodes
    await page.goto(pageUrl);
    const paragraphs = await page.$$eval('p', (elements) =>
      elements.map((el) => el.textContent)
    );

    // await page.waitForSelector('ul li.breadcrumbs__item span');

    // Find the breadcrumbs element and all its child <li> elements
    const breadcrumbs = await page.$$eval('.breadcrumbs__link', (nodes) =>
      nodes.map((node) => node.textContent.trim())
    );

    console.log(breadcrumbs);

    // Create an entry for this URL with the text content of all the paragraphs
    const entry = {
      url: pageUrl,
      content: paragraphs.join('\n'),
      timestamp: new Date().toISOString(),
      'hierarchy.lvl0': breadcrumbs[0],
      'hierarchy.lvl1': breadcrumbs[1],
      'hierarchy.lvl2': breadcrumbs[2],
      'hierarchy.lvl3': breadcrumbs[3],
    };
    entries.push(entry);
  }

  // Write the entries array to a file
  console.log(`Writing search index to file...`);
  const fileContent = `${JSON.stringify(entries)}`;
  fs.writeFileSync(result, fileContent);

  console.log(`Indexed ${entries.length} pages`);
  console.log(`Search index written to ${result}`);

  await browser.close();
})();
