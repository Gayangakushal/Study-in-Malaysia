const save = require('../../integrations/cloud-leads');
exports.handler = async event => {
  const reply = (statusCode, body) => ({ statusCode, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body:JSON.stringify(body) });
  if (event.httpMethod !== 'POST') return reply(405,{error:'Method not allowed'});
  if (!event.body || Buffer.byteLength(event.body)>16384) return reply(400,{error:'Invalid request'});
  let p;
  try { p=JSON.parse(event.body); } catch { return reply(400,{error:'Invalid JSON'}); }
  const required=['full_name','whatsapp_number','district','age','qualification','study_mode','programme','start_timeline','funding','preferred_language'];
  if (!p || required.some(k=>typeof p[k]!=='string'||!p[k].trim()||p[k].length>300)||p.consent!==true||!/^\+947\d{8}$/.test(p.whatsapp_number)) return reply(400,{error:'Please check the required fields'});
  try { return reply(201,{ok:true,id:await save(p)}); }
  catch { return reply(503,{error:'Unable to save your request. Please try again.'}); }
};
