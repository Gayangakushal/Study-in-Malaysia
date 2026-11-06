const express = require('express');
const readWorkbook = require('./integrations/read-workbook');
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const app = express();
const workbookPath = process.env.LEAD_WORKBOOK || path.resolve('..', 'SITC_Consultation_Lead_Tracker.xlsx');
app.use(express.json({ limit: '16kb' }));
let queue = Promise.resolve();
app.post('/api/leads', (req, res) => {
  const p = req.body;
  const required = ['full_name','whatsapp_number','district','age','qualification','study_mode','programme','start_timeline','funding','preferred_language'];
  if (!p || required.some(k => typeof p[k] !== 'string' || !p[k].trim() || p[k].length > 300) || p.consent !== true || !/^\+947\d{8}$/.test(p.whatsapp_number)) {
    return res.status(400).json({ error: 'Please check the required fields and WhatsApp number.' });
  }
  const save = async () => {
    const book = await readWorkbook(workbookPath);
    const sheet = book.getWorksheet('Leads');
    if (!sheet || sheet.getCell('C1').value !== 'Full Name') throw new Error('Unexpected tracker layout');
    let rowNumber = 2;
    while (sheet.getCell(rowNumber, 3).value) rowNumber++;
    const score = ['As soon as possible','Within 3 months'].includes(p.start_timeline) ? 'HOT' : p.start_timeline === '3–6 months' ? 'WARM' : 'FUTURE';
    const id = randomUUID();
    const fields = ['full_name','whatsapp_number','email','district','age','qualification','study_mode','programme','start_timeline','funding','preferred_language'];
    const tracking = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid','ttclid','page_url'];
    const value = k => typeof p[k] === 'string' ? p[k].slice(0, 2000) : '';
    const values = [id, new Date(), ...fields.map(value), 'Yes', ...tracking.map(value), score, 'New'];
    values.forEach((v, i) => { sheet.getCell(rowNumber, i + 1).value = v; });
    sheet.getCell(rowNumber, 2).numFmt = 'yyyy-mm-dd hh:mm:ss';
    // The template dashboard is initially limited to 500 leads.
    const dashboard = book.getWorksheet('Dashboard');
    if (dashboard) dashboard.eachRow(row => row.eachCell(cell => {
      if (cell.value && cell.value.formula) cell.value = { formula: cell.value.formula.replace(/(Leads![A-Z]+2:[A-Z]+)501/g, (_, prefix) => prefix + '1048576') };
    }));
    book.calcProperties.fullCalcOnLoad = true;
    await fs.copyFile(workbookPath, workbookPath + '.backup');
    const temp = workbookPath + '.pending.xlsx';
    try { await book.xlsx.writeFile(temp); await fs.rename(temp, workbookPath); }
    finally { await fs.rm(temp, { force: true }).catch(() => {}); }
    return id;
  };
  const pending = queue.then(save);
  queue = pending.catch(() => {});
  pending.then(id => res.status(201).json({ ok: true, id })).catch(error => {
    console.error('Lead save failed:', error.message);
    res.status(503).json({ error: 'Unable to save. Close the Excel tracker and try again.' });
  });
});
// Serve only public website assets; the tracker and backups stay private.
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get(['/', '/index.html'], (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/thank-you.html', (req, res) => res.sendFile(path.join(__dirname, 'thank-you.html')));
if (require.main === module) app.listen(process.env.PORT || 3000, '127.0.0.1', () => console.log('Open http://localhost:' + (process.env.PORT || 3000)));
module.exports = app;
