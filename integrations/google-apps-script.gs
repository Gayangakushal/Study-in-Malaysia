// Paste into Extensions > Apps Script in the Google Sheets copy of the tracker.
// Set SPREADSHEET_ID and LEAD_API_TOKEN under Project Settings > Script properties.
function doPost(e) {
  var reply = function(data) {return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);};
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('LEAD_API_TOKEN');
    if (!token || body.token !== token) return reply({ok:false});
    var p = body.lead;
    var fields = ['full_name','whatsapp_number','email','district','age','qualification','study_mode','programme','start_timeline','funding','preferred_language'];
    var required = fields.filter(function(k){return k !== 'email';});
    if (!p || p.consent !== true || required.some(function(k){return typeof p[k] !== 'string' || !p[k].trim() || p[k].length>300;}) || !/^\+947\d{8}$/.test(p.whatsapp_number)) return reply({ok:false});
    lock.waitLock(15000);
    var sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')).getSheetByName('Leads');
    if (!sheet || sheet.getRange('C1').getValue() !== 'Full Name') throw new Error('Wrong tracker');
    var names = sheet.getRange(2,3,Math.max(sheet.getLastRow()-1,1),1).getValues();
    var row = 2;
    while (row-2<names.length && names[row-2][0] !== '') row++;
    if(row>sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(),1);
    var clean = function(k) {
      var v = typeof p[k] === 'string' ? p[k].slice(0,2000) : '';
      // Store user input as text, including phone numbers and formula-like input.
      return /^[=+\-@]/.test(v) ? "'"+v : v;
    };
    var id = Utilities.getUuid();
    var score = ['As soon as possible','Within 3 months'].indexOf(p.start_timeline)>=0?'HOT':p.start_timeline==='3–6 months'?'WARM':'FUTURE';
    var tracking = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid','ttclid','page_url'];
    var values=[id,new Date()].concat(fields.map(clean),['Yes'],tracking.map(clean),[score,'New']);
    sheet.getRange(row,1,1,values.length).setValues([values]);
    SpreadsheetApp.flush();
    return reply({ok:true,id:id});
  } catch(error) {return reply({ok:false});}
  finally {if(lock.hasLock()) lock.releaseLock();}
}
