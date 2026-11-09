/* Local website assistant. Reads published page content; no external AI service. */
(() => {
  'use strict';
  const normalise = value => value.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const topics = [
    ['programmes', ['course', 'courses', 'programmes', 'programs', 'degree', 'degrees', 'bachelor', 'පාඨමාලා', 'උපාධි', 'පාඨමාලාව', 'courses monawada']],
    ['diploma', ['diploma', 'diplomas', 'ඩිප්ලෝමා', 'ol', 'o level', 'o/l']],
    ['fees', ['fee', 'fees', 'cost', 'price', 'payment', 'ගාස්තු', 'ගාන', 'කීයද', 'kiyada', 'gana', 'gewanna', 'mudal']],
    ['scholarship', ['scholarship', 'scholarships', 'ශිෂ්‍යත්ව', 'scholarship eka']],
    ['entry', ['entry', 'requirements', 'eligible', 'eligibility', 'qualification', 'qualifications', 'සුදුසුකම්', 'sudusukam', 'credit transfer', 'a/l', 'al']],
    ['intake', ['intake', 'intakes', 'start', 'when', 'කවදාද', 'කවදද', 'kawadada', 'patanganne']],
    ['online', ['online', 'odl', 'distance', 'ලංකාවේ', 'ඔන්ලයින්', 'lankawe', 'gedara']],
    ['visa', ['visa', 'වීසා', 'වීසාගැන', 'viza']],
    ['accommodation', ['accommodation', 'hostel', 'housing', 'නවාතැන්', 'නවාතැන', 'room']],
    ['support', ['support', 'help', 'journey', 'pre departure', 'උදව්', 'සහාය']],
    ['locations', ['location', 'locations', 'address', 'branch', 'branches', 'map', 'colombo', 'gampola', 'uae', 'sharjah', 'kuala lumpur', 'malaysia location', 'ලිපිනය', 'කොහෙද', 'koheda', 'gampola', 'කොළඹ', 'ගම්පොළ']],
    ['contact', ['contact', 'whatsapp', 'phone', 'number', 'telephone', 'email', 'කතා', 'අංකය', 'නම්බර්', 'nomber', 'call', 'human', 'advisor', 'counsellor']],
    ['booking', ['book', 'booking', 'visit', 'consultation', 'appointment', 'apply', 'application', 'applications', 'register', 'ලියාපදිංචි', 'අයදුම්']],
    ['portal', ['portal', 'student portal', 'login', 'ලොගින්']],
    ['certificate', ['certificate', 'verify', 'verification', 'සහතික']],
    ['policies', ['privacy', 'refund', 'terms', 'policy', 'policies']],
    ['partner', ['partner', 'partnership', 'perdana', 'university', 'sitc', 'about']],
  ];
  const matches = (q, term) => (' '+q+' ').includes(' '+normalise(term)+' ');
  function intent(query) {
    const q = normalise(query);
    for (const name of ['portal','certificate','policies','locations','contact','visa','accommodation','online','scholarship','fees','entry','intake','booking','diploma']) {
      const [, words] = topics.find(([key]) => key === name);
      if (words.some(w => matches(q, w))) return name;
    }
    return topics.find(([, words]) => words.some(w => matches(q, w)))?.[0] || '';
  }
  function rank(query, records) {
    const tokens = normalise(query).split(' ').filter(t => t.length > 2 && !['the','and','can','you','tell','about','what','please','mata','eka','ona','give','have','does','with','this','that','your','want','know'].includes(t));
    return records.map(record => ({record, score: tokens.reduce((n,t) => n + (normalise(record.title).includes(t) ? 5 : normalise(record.text).includes(t) ? 1 : 0),0)})).filter(r => r.score > 0).sort((a,b) => b.score-a.score);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalise, intent, rank };
  if (typeof document === 'undefined') return;
  const clean = node => (node?.textContent || '').replace(/\s+/g,' ').trim();
  const extractLinks = node => [...node.querySelectorAll('a[href]')].map(a => ({label:clean(a),url:a.getAttribute('href')}));
  const programmes = [...document.querySelectorAll('#programmes .programme')].map(node => ({title:clean(node.querySelector('h3')),text:clean(node.querySelector('.programme-body')),links:extractLinks(node),type:clean(node.querySelector('.programme-type'))}));
  const locations = [...document.querySelectorAll('.location-card')].map(node => ({title:clean(node.querySelector('h3')),text:clean(node),links:extractLinks(node)}));
  const records = [...document.querySelectorAll('main section, .faq-card details, .team-contact')].map(node => ({title:clean(node.querySelector('h2,h3,summary')) || clean(node).slice(0,65),text:clean(node),links:extractLinks(node)})).filter(r => r.text);
  const contact = {label:'WhatsApp SITC · 074 121 5897',url:'https://wa.link/study-in-malaysia'};
  let lastProgrammes = [];
  function answer(query) {
    const q = normalise(query), si = /[\u0d80-\u0dff]/.test(query);
    const response = (en, sinhala, links=[]) => ({text:si?sinhala:en,links});
    const topic = intent(query);
    const subjectQuery=q.replace(/\b(bachelor|bachelors|s|degree|degrees|honours|hons|diploma|diplomas|programme|programmes|pdf|brochure|details)\b/g,' ');
    const candidates=topic==='diploma'?programmes.filter(p=>p.type.startsWith('Diploma')):programmes;
    const relevant = rank(subjectQuery, candidates).filter(r => r.score >= 5).slice(0,3).map(r=>r.record);
    if (/^(hi|hello|hey|ayubowan|ආයුබෝවන්|හායි|හෙලෝ)[ !.]*$/i.test(query.trim())) return response('Hello! I’m the SITC website assistant. Ask me about degrees, diplomas, brochures, locations or studying in Malaysia.','ආයුබෝවන්! මම SITC website assistant. Degrees, diplomas, PDF brochures, locations හෝ Malaysia studies ගැන අහන්න.');
    if (['fees','entry','intake'].includes(topic)) {
      const names=relevant.length?'\n\n'+relevant.map(p=>p.title).join('\n'):'';
      return response('Please confirm current '+({fees:'course fees and payment options',entry:'entry requirements and credit transfer eligibility',intake:'intake dates and availability'}[topic])+' with SITC. The website does not publish a confirmed breakdown for every programme.'+names,'මේ programme එකේ '+({fees:'ගාස්තු සහ ගෙවීම් විස්තර',entry:'ඇතුළත් වීමේ සුදුසුකම් සහ credit transfer',intake:'intake දින සහ availability'}[topic])+' SITC වෙතින් තහවුරු කරගන්න. සියලුම programmes සඳහා තහවුරු කළ විස්තර website එකේ නැහැ.'+names,[...relevant.flatMap(p=>p.links.filter(l=>l.url.endsWith('.pdf'))),contact]);
    }
    if (topic==='online') return response('Interested in studying online from Sri Lanka? Ask SITC which Perdana programmes currently offer approved ODL options. Confirm the study mode and intake before applying.','ලංකාවේ සිට online ඉගෙනගන්න කැමතිද? දැනට අනුමත ODL programmes සහ intake ගැන SITC වෙතින් තහවුරු කරගන්න.',[contact,{label:'Study pathways',url:'#paths'}]);
    if (topic==='scholarship') return response(clean(document.querySelector('#scholarship'))+'\n\nScholarships depend on eligibility, availability and approved terms. Ask SITC to confirm your options.','Scholarship එක programme එක, සුදුසුකම් සහ availability අනුව තීරණය වෙනවා. අදාළ කොන්දේසි SITC වෙතින් තහවුරු කරගන්න.',[{label:'Scholarship information',url:'#scholarship'},contact]);
    if (topic==='visa'||topic==='accommodation'||topic==='support') return response('SITC offers guidance with applications, student visas, accommodation and pre-departure preparation. Contact the team for support specific to your programme and journey.','Applications, student visa guidance, accommodation assistance සහ pre-departure guidance සඳහා SITC කණ්ඩායමට කතා කරන්න.',[contact,{label:'Journey support',url:'#study-support-title'}]);
    if (topic==='locations') {
      let chosen=rank(query,locations).map(r=>r.record);if(!chosen.length)chosen=locations;
      return {text:chosen.map(l=>l.text).join('\n\n'),links:chosen.flatMap(l=>l.links.map(a=>({...a,label:l.title+' · '+a.label})))};
    }
    if (topic==='contact') return {text:'Study in Malaysia enquiries: 074 121 5897\nEmail: info@sitc.lk\nHead office: +94 11 453 2139\n\n'+[...document.querySelectorAll('.team-contact')].map(clean).join('\n'),links:[contact,{label:'Email SITC',url:'mailto:info@sitc.lk'},{label:'Call SITC',url:'tel:+94114532139'}]};
    if (topic==='booking') return response('Book a free consultation with SITC or chat with the team on WhatsApp to discuss your application. Online consultation requests are currently unavailable. Please use WhatsApp to arrange your consultation.','Free consultation හෝ application ගැන WhatsApp එකෙන් SITC කණ්ඩායමට කතා කරන්න. Website form එකේ submission service එක දැනට configure කරලා නැති නිසා enquiries සඳහා WhatsApp භාවිතා කරන්න.',[contact,{label:'Consultation form',url:'#consultation'},...locations.flatMap(p=>p.links.filter(l=>l.url.includes('calendly')))]);
    if (topic==='portal') return {text:'Open the SITC student portal to access your student account.',links:[{label:'Open student portal',url:'https://portal.sitc.lk/'}]};
    if (topic==='certificate') return {text:'Use the official SITC certificate verification service.',links:[{label:'Verify a certificate',url:'https://verify.sitc.lk/'}]};
    if (topic==='policies') return {text:'Read SITC’s official policies using these links.',links:[...document.querySelectorAll('.campus-bottom nav a')].map(a=>({label:clean(a),url:a.href}))};
    if (relevant.length) {lastProgrammes=relevant;return {text:relevant.map(p=>p.title+'\n'+cleanText(p)).join('\n\n'),links:relevant.flatMap(p=>p.links.map(l=>({...l,label:p.title+' · '+l.label})))};}
    if (/brochure|pdf|විස්තර|details/.test(q) && lastProgrammes.length) return {text:'Here are the official PDF links for the programmes we discussed.',links:lastProgrammes.flatMap(p=>p.links.filter(l=>l.url.endsWith('.pdf')))};
    if (topic==='programmes'||topic==='diploma'||/brochure|pdf/.test(q)) {const list=topic==='diploma'?programmes.filter(p=>p.type.startsWith('Diploma')):programmes;lastProgrammes=list;return response('Choose your path at Perdana University, Malaysia:\n\n'+list.map(p=>p.title).join('\n')+'\n\nAsk for a programme by name to see its PDF brochure.','Perdana University, Malaysia programmes:\n\n'+list.map(p=>p.title).join('\n')+'\n\nPDF brochure එක බලන්න programme එකේ නම අහන්න.',[{label:'Explore programmes & PDFs',url:topic==='diploma'?'#diploma-programmes':'#programmes'},contact]);}
    if (topic==='partner') return response('This website introduces studying in Malaysia with Perdana University through SITC Campus. Explore six bachelor’s degrees and seven diploma pathways, with application and travel preparation guidance from SITC.','SITC Campus මගින් Perdana University, Malaysia හි bachelor’s degrees 6ක් සහ diploma pathways 7ක් ගැන දැනගන්න පුළුවන්. Application සහ ගමනට අවශ්‍ය guidance සඳහා SITC කණ්ඩායමට කතා කරන්න.',[{label:'Explore programmes',url:'#programmes'},contact]);
    const found=rank(query,records)[0];
    if(found && found.score>=5)return {text:found.record.text,links:found.record.links.slice(0,5)};
    return response('I couldn’t find a clear answer in this website’s information. Try a programme name, PDF brochure, fees, visa, accommodation or locations. For anything else, the SITC team can help on WhatsApp.','මේ ප්‍රශ්නයට පැහැදිලි පිළිතුරක් website එකේ තොරතුරුවලින් හමු වුණේ නැහැ. Programme නමක්, PDF, fees, visa හෝ locations ගැන අහන්න. වැඩිදුර උදව් සඳහා SITC WhatsApp එකට කතා කරන්න.',[contact]);
  }
  function cleanText(p){return p.text.replace(p.type,'').replace(p.title,'').replace(/View (brochure|general programme flyer) \(PDF\).*$/,'').trim();}
  const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-4 3v-11a8 8 0 0 1 8-8h3a8 8 0 0 1 8 8Z" transform="translate(1 -1) scale(.95)"/><path d="M7 10h.01M12 10h.01M17 10h.01" stroke-width="3" stroke-linecap="round"/></svg>';
  const root=document.createElement('div');root.className='sitc-chat';
  root.innerHTML=`<div class="chat-invite" id="chat-invite"><button type="button" class="chat-invite-open">Need help? Chat with us <span aria-hidden="true">👋</span></button><button type="button" class="chat-invite-dismiss" aria-label="Dismiss chat invitation">×</button></div><button type="button" class="chat-launcher" aria-label="Chat with SITC assistant" aria-controls="sitc-chat-panel" aria-expanded="false">${icon}<span class="chat-launcher-dot"></span></button><section class="chat-panel" id="sitc-chat-panel" aria-label="SITC website assistant" hidden><header class="chat-header"><span class="chat-avatar">${icon}</span><div><strong>SITC Assistant</strong><small>Programme & campus guide</small></div><button type="button" class="chat-close" aria-label="Close chat">×</button></header><p class="chat-disclosure">Answers from this website · Automated guide</p><div class="chat-messages" role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions"></div><div class="chat-suggestions" aria-label="Suggested questions"></div><form class="chat-form"><label class="chat-sr-only" for="chat-question">Your message</label><input id="chat-question" placeholder="Ask in Sinhala or English…" autocomplete="off" maxlength="600" required><button type="submit" aria-label="Send message">➤</button></form><p class="chat-footnote">Need a person? <a href="https://wa.link/study-in-malaysia" target="_blank" rel="noopener noreferrer">WhatsApp SITC ↗</a></p></section>`;
  document.body.append(root);
  const panel=root.querySelector('.chat-panel'), launcher=root.querySelector('.chat-launcher'),input=root.querySelector('input'),log=root.querySelector('.chat-messages'),suggestions=root.querySelector('.chat-suggestions');
  let busy=false,opened=false;
  const scroll=()=>{log.scrollTop=log.scrollHeight;};
  function bubble(text,who,links=[]){const el=document.createElement('div');el.className='chat-bubble chat-'+who;const content=document.createElement('p');content.textContent=text;el.append(content);if(links.length){const list=document.createElement('div');list.className='chat-links';const seen=new Set();for(const l of links){if(seen.has(l.url)||!(/^(https:\/\/|mailto:|tel:|#)/.test(l.url)))continue;seen.add(l.url);const a=document.createElement('a');a.textContent=l.label;a.href=l.url;if(/^https:\/\/(wa\.me|wa\.link)\//.test(l.url)){a.classList.add('has-wa-icon');const wa=document.createElement('span');wa.className='wa-icon';wa.setAttribute('aria-hidden','true');a.prepend(wa);}if(l.url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}else if(l.url.startsWith('#'))a.addEventListener('click',()=>setOpen(false));list.append(a);}el.append(list);}log.append(el);scroll();return el;}
  function setOpen(open){panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));root.querySelector('.chat-invite').hidden=true;if(open){if(!opened){bubble('Hello! 👋 I’m your SITC website guide. I can help with programmes, PDF brochures, locations and studying in Malaysia.\n\nසිංහලෙන් හෝ English වලින් අහන්න.','bot');opened=true;}input.focus();scroll();}else launcher.focus();}
  launcher.addEventListener('click',()=>setOpen(panel.hidden));root.querySelector('.chat-invite-open').addEventListener('click',()=>setOpen(true));root.querySelector('.chat-invite-dismiss').addEventListener('click',()=>root.querySelector('.chat-invite').hidden=true);root.querySelector('.chat-close').addEventListener('click',()=>setOpen(false));root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();setOpen(false);}});
  for(const text of ['Bachelor’s degrees','Diploma programmes','Fees & intakes','Our locations','Talk to SITC']){const button=document.createElement('button');button.type='button';button.textContent=text;button.addEventListener('click',()=>send(text==='Talk to SITC'?'Contact SITC':text));suggestions.append(button);}
  function send(query){query=query.trim();if(!query||busy)return;busy=true;input.value='';bubble(query,'user');const sendButton=root.querySelector('.chat-form button');sendButton.disabled=true;suggestions.querySelectorAll('button').forEach(b=>b.disabled=true);log.setAttribute('aria-busy','true');const typing=document.createElement('div');typing.className='chat-typing';typing.setAttribute('role','status');typing.setAttribute('aria-label','SITC assistant is typing');typing.innerHTML='<span></span><span></span><span></span>';log.append(typing);scroll();setTimeout(()=>{typing.remove();log.setAttribute('aria-busy','false');const result=answer(query);bubble(result.text,'bot',result.links);busy=false;sendButton.disabled=false;suggestions.querySelectorAll('button').forEach(b=>b.disabled=false);if(!panel.hidden)input.focus();},window.matchMedia('(prefers-reduced-motion: reduce)').matches?100:800+Math.min(query.length*12,600));}
  root.querySelector('.chat-form').addEventListener('submit',e=>{e.preventDefault();send(input.value);});
})();
