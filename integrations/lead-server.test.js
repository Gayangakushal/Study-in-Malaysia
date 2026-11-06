const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const ExcelJS = require('exceljs');
test('saves concurrent submissions to tracker and rejects incomplete submissions', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sitc-test-'));
  process.env.LEAD_WORKBOOK = path.join(dir, 'tracker.xlsx');
  await fs.copyFile(path.resolve('..','SITC_Consultation_Lead_Tracker.xlsx'), process.env.LEAD_WORKBOOK);
  const server = require('../server').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/leads`;
  const send = p => fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
  try {
    assert.equal((await send({})).status, 400);
    const p = {full_name:'TEST ONLY',whatsapp_number:'+94771234567',email:'test@example.com',district:'Colombo',age:'18–21',qualification:'A/L',study_mode:'Study in Malaysia',programme:'Computing & IT',start_timeline:'3–6 months',funding:'Parents/family',preferred_language:'Sinhala',consent:true};
    const before = await require('./read-workbook')(process.env.LEAD_WORKBOOK);
    const count = b => {let n=0;b.getWorksheet('Leads').eachRow((r,i)=>{if(i>1&&r.getCell(3).value)n++});return n};
    const responses = await Promise.all([send(p),send({...p, full_name:'=TEST',start_timeline:'Within 3 months'})]);
    responses.forEach(r => assert.equal(r.status,201));
    const book = new ExcelJS.Workbook(); await book.xlsx.readFile(process.env.LEAD_WORKBOOK);
    assert.equal(count(book),count(before)+2);
    const rows=[];book.getWorksheet('Leads').eachRow(r=>{if(['TEST ONLY','=TEST'].includes(r.getCell(3).value))rows.push(r)});
    assert.equal(rows[0].getCell(24).value,'WARM');
    assert.equal(rows[1].getCell(24).value,'HOT');
    assert.equal(rows[1].getCell(25).value,'New');
    assert.equal(typeof rows[1].getCell(3).value,'string');
    assert.match(book.getWorksheet('Dashboard').getCell('A5').value.formula,/1048576/);
    assert.equal((await fetch(url.replace('/api/leads','/integrations/README.md'))).status,404);
  } finally {await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true});}
});
