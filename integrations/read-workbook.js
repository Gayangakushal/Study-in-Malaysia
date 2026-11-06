const fs = require('node:fs/promises');
const JSZip = require('jszip');
const ExcelJS = require('exceljs');
module.exports = async function readWorkbook(filename) {
  const zip = await JSZip.loadAsync(await fs.readFile(filename));
  // The supplied tracker uses explicit x: namespaces, which ExcelJS cannot read.
  for (const name of Object.keys(zip.files)) {
    if (!name.endsWith('.xml')) continue;
    const xml = await zip.file(name).async('string');
    if (xml.includes('xmlns:x=')) zip.file(name, xml.replace(/xmlns:x=/g, 'xmlns=').replace(/(<\/?)(x:)/g, '$1'));
  }
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await zip.generateAsync({ type: 'nodebuffer' }));
  return book;
};
