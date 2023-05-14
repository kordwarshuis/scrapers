import fs from 'fs';
export default function writeToFile(entries, output) {
  // Write the entries array to a file
  console.log(`Writing search index to file...`);
  const fileContent = `${JSON.stringify(entries)}`;
  fs.writeFileSync(output, fileContent);

  console.log(`Indexed ${entries.length} pages`);
  console.log(`Search index written to ${output}`);
}
