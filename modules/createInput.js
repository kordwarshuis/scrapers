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
}
