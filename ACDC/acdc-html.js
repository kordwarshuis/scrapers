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
  console.log('urls: ', urls);

  // Iterate over each URL and create an array of entries for each URL
  const entries = [];
  console.log('Indexing pages...');
  for (const url of urls) {
    console.log(`Indexing ${url}`);

    // Navigate to the page URL and get all child nodes of #wiki-content
    await page.goto(url);

    let content;
    const elementExists = (await page.$('.markdown-body')) !== null;
    console.log(await page.$('.markdown-body'));
    console.log('elementExists: ', elementExists);
    if (elementExists) {
      content = await page.$eval(
        // '#wiki-content',
        '.markdown-body',
        (element) => element.innerHTML
      );
    }

    // Create an entry for this URL with the HTML content of #wiki-content
    const entry = {
      url: url,
      html: content,
      timestamp: new Date().toISOString(),
    };
    entries.push(entry);
  }

  // Write the entries array to a file
  console.log(`Writing search index to file...`);
  const fileContent = `const searchIndex = ${JSON.stringify(
    entries
  )};\nmodule.exports = searchIndex;`;
  fs.writeFileSync('ACDC/searchIndex.js', fileContent);

  console.log(`Indexed ${entries.length} pages`);
  console.log(`Search index written to searchIndex.js`);

  await browser.close();
})();
