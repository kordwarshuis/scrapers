export default function createOutput(input) {
  let entries = [];
  for (const element of input.elements) {
    const entry = {
      url: input.pageUrl,
      content: element.text || '',
      tag: element.tag || '',
      timestamp: new Date().toISOString() || '',
      'hierarchy.lvl0': input.hierarchyLvl0 || '',
      'hierarchy.lvl1': input.hierarchyLvl1 || '',
      'hierarchy.lvl2': input.hierarchyLvl2 || '',
      'hierarchy.lvl3': input.hierarchyLvl3 || '',
      knowledgeLevel: input.knowledgeLevel || '',
    };
    entries.push(entry);
  }
  return entries;
}
