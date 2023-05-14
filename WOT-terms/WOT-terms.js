import puppeteer from 'puppeteer';
import createOutput from '../modules/createOutput.js';
import createInput from '../modules/createInput.js';
import writeToFile from '../modules/writeToFile.js';

const url = 'https://weboftrust.github.io/WOT-terms/sitemap.xml';
const result = '../output/WOT-terms.json';

(async () => {
  const sitemap = await createInput({
    sourceType: 'remoteXMLsitemap',
    sourcePath: url,
  });
  console.log('sitemap: ', sitemap);

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
    const elements = await page.$$eval(
      'article p, article markdown h1, article markdown h2, article markdown h3, article markdown h4, article markdown h5, article markdown a, article markdown li',
      (elements) =>
        elements.map((el) => ({
          text: el.textContent.trim(),
          tag: el.tagName.toLowerCase(),
        }))
    );
    console.log('elements: ', elements);

    // await page.waitForSelector('ul li.breadcrumbs__item span');

    // Find the breadcrumbs element and all its child <li> elements
    const breadcrumbs = await page.$$eval('.breadcrumbs__link', (nodes) =>
      nodes.map((node) => node.textContent.trim())
    );

    console.log(breadcrumbs);

    const articleExists = await page.$('article');
    let knowledgeLevel;
    // Get the value of the data-level attribute from the article element
    if (articleExists) {
      knowledgeLevel = await page.$eval('article', (element) => {
        return element.getAttribute('data-level');
      });
      console.log(knowledgeLevel);
    } else {
      console.log('No article element found.');
    }

    entries.push(
      createOutput({
        pageUrl,
        elements: elements,
        hierarchyLvl0: breadcrumbs[0],
        hierarchyLvl1: breadcrumbs[1],
        hierarchyLvl2: breadcrumbs[2],
        hierarchyLvl3: breadcrumbs[3],
        knowledgeLevel,
      })
    );
  }

  writeToFile(entries, result);

  await browser.close();
})();
