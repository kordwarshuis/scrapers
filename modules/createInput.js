import puppeteer from 'puppeteer';
import xml2js from 'xml2js';
import fetch from 'node-fetch';
import fs from 'fs';

export default async function createInput(input) {
  if (input.sourceType === 'remoteXMLsitemap') {
    // Fetch and parse the sitemap.xml file
    console.log('Fetching sitemap...');
    const sitemapUrl = input.sourcePath;
    const sitemapResponse = await fetch(sitemapUrl);
    const sitemapXml = await sitemapResponse.text();
    const sitemap = await xml2js.parseStringPromise(sitemapXml);
    console.log(`Found ${sitemap.urlset.url.length} URLs in sitemap`);
    return sitemap;
  }
  if (input.sourceType === 'localXMLsitemap') {
    // read the file contents synchronously
    let fileContents = fs.readFileSync(input.sourcePath, 'utf-8');

    fileContents = fileContents
      .replace(/[\n\r]/g, '\\n')
      .replace(/&/g, '&amp;')
      .replace(/-/g, '&#45;');

    // log the contents of the file
    // console.log(fileContents);

    // var cleanedString = sitemapXml.replace('\ufeff', '');
    var cleanedString = fileContents;
    console.log('cleanedString: ', cleanedString);

    let sitemap;
    try {
      sitemap = await xml2js.parseStringPromise(cleanedString);
      console.log(`Found ${sitemap.urlset.url.length} URLs in sitemap`);
      return sitemap;
    } catch (err) {
      console.error(`Error parsing sitemap XML: ${err}`);
      return;
    }
  }
  if (input.sourceType === 'querySelector') {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the wiki page and get all page URLs
    await page.goto(input.sourcePath);
    const urls = await page.$$eval(input.queryString, (links) =>
      links.map((link) => link.href)
    );
    console.log('urls: ', urls);

    const sitemapXml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${urls
      .map((url) => `<url><loc>${url}</loc></url>`)
      .join('\n  ')}</urlset>`;

    const sitemap = await xml2js.parseStringPromise(sitemapXml);
    await browser.close();
    return sitemap;
  }
}
