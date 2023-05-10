import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the wiki page and get all page URLs
  await page.goto('https://github.com/trustoverip/acdc/wiki');
  const urls = await page.$$eval('#wiki-pages-box a', (links) =>
    // Full index:
    // links.map((link) => link.href)

    // Partial index for testing:
    links.map((link) => link.href).slice(0, 3)
  );

  // Iterate over each URL and create an array of entries for each URL
  const entries = [];
  console.log('Indexing pages...');
  for (const url of urls) {
    console.log(`Indexing ${url}`);

    // Navigate to the page URL and get all paragraph nodes
    await page.goto(url);
    const paragraphs = await page.$$eval('p', (elements) =>
      elements.map((el) => el.textContent)
    );

    // Create an entry for this URL with the text content of all the paragraphs
    const entry = {
      url: url,
      text: paragraphs.join('\n'),
      timestamp: new Date().toISOString(),
    };
    entries.push(entry);
  }

  // Write the entries array to a file
  console.log(`Writing search index to file...`);
  const fileContent = `${JSON.stringify(entries)}`;
  fs.writeFileSync('./output/acdc-text-only.json', fileContent);

  console.log(`Indexed ${entries.length} pages`);
  console.log(`Search index written to output`);

  await browser.close();
})();
