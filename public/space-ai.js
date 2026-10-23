/* Space AI V12.8 — minimal assistant with icon controls */
(() => {
  'use strict';
  const log = document.getElementById('ai-chat');
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');
  const overview = document.getElementById('ai-overview');
  const clearBtn = document.getElementById('ai-clear');
  const shell = document.querySelector('.ai-shell');
  const heading = document.querySelector('.ai-heading');
  if(!log || !form || !input || !overview || !clearBtn || !shell || !heading) return;

  const messages = [];
  let sending = false;
  let attachedImageData = '';
  let attachedImageName = '';
  let autoSpeak = false;
  let recognition = null;
  let listening = false;
  let continuousCallWanted = false;
  let restartTimer = null;
  let lastLang = document.getElementById('v111-language')?.value === 'ary' ? 'ary' : 'fr';

  const number = x => { const n = Number(String(x ?? '').replace(',','.')); return Number.isFinite(n) && n >= 0 ? n : null; };
  const val = (day, key) => number(day?.[key]);
  const dateLabel = iso => new Date(iso+'T12:00:00').toLocaleDateString('fr-FR', {day:'numeric',month:'short'});
  const get = () => dayData(current);
  const week = () => Array.from({length:7},(_,i)=>dayData(shiftDate(current,i-6)));
  const average = data => data.length ? data.reduce((a,b)=>a+b,0)/data.length : null;
  const fmt = n => n == null ? '—' : Number(n.toFixed(1)).toLocaleString('fr-FR');
  const hasArabic = t => /[\u0600-\u06FF]/.test(String(t||''));
  const cleanText = t => String(t||'').replace(/\s+/g,' ').trim();
  const detectQuestionLanguage = q => {
    const s = String(q || '').trim();
    if(hasArabic(s) || /(darija|دارجة|بالدارجة|عربية)/i.test(s)) return 'ary';
    if(/(francais|français|french|en français)/i.test(s)) return 'fr';
    const ui = document.getElementById('v111-language')?.value;
    return ui === 'ary' ? 'ary' : 'fr';
  };
  const tr = (fr, ary, lang = lastLang) => lang === 'ary' ? ary : fr;
  const placeholderText = lang => tr('⏳ Je prépare la réponse…','⏳ كنوجد ليك الجواب…', lang);
  const imageTag = lang => tr('[image jointe]','[صورة مرفقة]', lang);
  const stripMarkdownForSpeech = text => String(text || '').replace(/```[\s\S]*?```/g,' ').replace(/\|/g,' ').replace(/[*_#>`~-]+/g,' ').replace(/\s+/g,' ').trim();

  function enhanceHeader(){
    heading.innerHTML = `
      <div class="nx-ai-identity">
        <div class="nx-ai-robot" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v2.4"></path>
            <rect x="4.5" y="6.5" width="15" height="12" rx="5"></rect>
            <path d="M4.5 11.5h-1.5m18 0H19.5"></path>
            <circle cx="9.3" cy="11.7" r="1"></circle>
            <circle cx="14.7" cy="11.7" r="1"></circle>
            <path d="M8.5 15c1 .9 2.1 1.3 3.5 1.3S14.5 15.9 15.5 15"></path>
            <path d="M8 6V4.8m8 1.2V4.8"></path>
          </svg>
        </div>
        <div>
          <div class="ai-eyebrow">AI ASSISTANT</div>
          <h2>Nutrix <span>Intelligence</span></h2>
        </div>
      </div>`;
  }

  function addMessage(who, content){ messages.push({who, content}); if(messages.length > 50) messages.shift(); drawMessages(); }
  function formatAnswer(box, content){
    const lines = String(content || '').split(/\n/); let i = 0;
    const inline = (el, text) => { for(const chunk of String(text).split(/(\*\*[^*]+\*\*)/)){ if(/^\*\*[^*]+\*\*$/.test(chunk)){ const b = document.createElement('strong'); b.textContent = chunk.slice(2, -2); el.append(b);} else el.append(document.createTextNode(chunk)); } };
    while(i < lines.length){
      const l = lines[i].trim(); if(!l){ i++; continue; }
      if(l.startsWith('|') && i + 1 < lines.length && /^\|?[\s:|-]+\|?$/.test(lines[i+1].trim())){
        const table = document.createElement('table'); table.className = 'nx-ai-table'; const head = document.createElement('thead'); const body = document.createElement('tbody');
        const row = (cells, parent, tag) => { const trEl=document.createElement('tr'); cells.forEach(c=>{const td=document.createElement(tag); inline(td,c.trim()); trEl.append(td);}); parent.append(trEl); };
        const cells = txt => txt.replace(/^\||\|$/g,'').split('|').slice(0,4);
        row(cells(l), head, 'th'); i += 2; while(i < lines.length && lines[i].trim().startsWith('|')){ row(cells(lines[i].trim()), body, 'td'); i++; } table.append(head, body); const wrap=document.createElement('div'); wrap.className='nx-ai-table-scroll'; wrap.append(table); box.append(wrap); continue;
      }
      if(/^[-•]\s+/.test(l)){ const ul = document.createElement('ul'); while(i < lines.length && /^[-•]\s+/.test(lines[i].trim())){ const li = document.createElement('li'); inline(li, lines[i].trim().replace(/^[-•]\s+/,'')); ul.append(li); i++; } box.append(ul); continue; }
      const par = document.createElement('p'); inline(par, l); box.append(par); i++;
    }
  }
  function drawMessages(){
    log.replaceChildren();
    messages.forEach(({who, content}) => { const root = document.createElement('div'); root.className = 'ai-message ' + (who === 'user' ? 'user' : 'assistant'); const icon = document.createElement('div'); icon.className='ai-avatar'; icon.textContent = who === 'user' ? '☺' : '✦'; const bubble = document.createElement('div'); bubble.className='ai-bubble'; if(who === 'assistant') formatAnswer(bubble, content); else bubble.textContent = content; root.append(icon, bubble); log.append(root); });
    log.scrollTop = log.scrollHeight;
  }

  function sleep(lang){ const n = val(get(),'sleep'); if(n == null || n === 0) return tr('🌙 Le sommeil du jour n’est pas encore renseigné.','🌙 النعاس ديال اليوم مازال ما تسجّلش.', lang); return lang === 'ary' ? `🌙 سجّلتي ${fmt(n)} ساعة ديال النعاس.` : `🌙 Tu as noté ${fmt(n)} heure(s) de sommeil.`; }
  function activity(lang){ const n = val(get(),'sport'); if(n == null || n === 0) return tr('🏃 Aucune minute d’activité n’est enregistrée aujourd’hui.','🏃 ما كاين حتى نشاط مسجّل اليوم.', lang); return lang === 'ary' ? `🏃 سجّلتي ${fmt(n)} دقيقة ديال النشاط اليوم.` : `🏃 Tu as enregistré ${fmt(n)} minute(s) de sport aujourd’hui.`; }
  function nutrition(lang){ const total = totals(current), target = number(state.settings.target); if(!total.kcal) return tr('🥗 Aucun aliment n’est enregistré pour cette journée.','🥗 ما كاين حتى ماكلة مسجّلة اليوم.', lang); return lang === 'ary' ? `🥗 تقريباً ${Math.round(total.kcal)} كالوري (${Math.round(total.p)}غ بروتين، ${Math.round(total.c)}غ كاربوهيدرات و ${Math.round(total.f)}غ دهون)${target?`، والهدف ${Math.round(target)} كالوري`:''}.` : `🥗 Environ ${Math.round(total.kcal)} kcal (${Math.round(total.p)} g protéines, ${Math.round(total.c)} g glucides et ${Math.round(total.f)} g lipides)${target?`, objectif ${Math.round(target)} kcal`:''}.`; }
  function weekly(lang){ const days = week(), s = days.map(d=>val(d,'sleep')).filter(x=>x>0), a = days.map(d=>val(d,'sport')).filter(x=>x>0); if(![s,a].some(x=>x.length)) return tr('📊 Il n’y a pas encore assez de données pour cette semaine.','📊 مازال ما كايناش معطيات كافية هاد السيمانة.', lang); return lang === 'ary' ? `📊 هاد السيمانة:\n• النعاس: ${s.length?`${fmt(average(s))} ساعة فالمتوسط`: 'ما متسجّلش'}\n• الرياضة: ${a.length?`${fmt(average(a))} دقيقة فالمتوسط`: 'ما متسجّلاش'}` : `📊 Cette semaine :\n• Sommeil : ${s.length?`${fmt(average(s))} h en moyenne`:'non renseigné'}\n• Sport : ${a.length?`${fmt(average(a))} min en moyenne`:'non renseigné'}`; }
  function summary(lang){ const d = get(), sleepNum = val(d,'sleep'), sportNum = val(d,'sport'); return (lang === 'ary' ? [`✨ ملخص ${dateLabel(current)}:`,`• النعاس: ${sleepNum?fmt(sleepNum)+' ساعة':'—'}`,`• النشاط: ${sportNum?fmt(sportNum)+' دقيقة':'—'}`,`• التغذية: ${totals(current).kcal?Math.round(totals(current).kcal)+' كالوري':'—'}`] : [`✨ Bilan du ${dateLabel(current)} :`,`• Sommeil : ${sleepNum?fmt(sleepNum)+' h':'—'}`,`• Activité : ${sportNum?fmt(sportNum)+' min':'—'}`,`• Nutrition : ${totals(current).kcal?Math.round(totals(current).kcal)+' kcal':'—'}`]).join('\n'); }
  function reply(q, lang){ const tNorm = String(q||'').toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g,''); if(/(semaine|hebdo|7 jours|tendance)/.test(tNorm)) return weekly(lang); if(/(sommeil|dorm|nuit|fatigue|repos|نعاس|نوم)/.test(tNorm)) return sleep(lang); if(/(sport|activit|bouger|march|exercice|رياض)/.test(tNorm)) return activity(lang); if(/(nutrition|mang|repas|calori|aliment|proteine|ماكلة|تغذية|nutri.score|nutri score)/.test(tNorm)) return nutrition(lang); return summary(lang); }
  const aiState = (state) => window.nutrixCopilotState?.(state);
  async function smartReply(question, lang){
    const snapshot = {date: current, nutrition: totals(current), sleep: val(get(),'sleep'), activity: val(get(),'sport'), goals: {calories: state.settings.target}};
    try { const r = await fetch('/api/ai/chat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ question, history: messages.slice(-10).map(m=>({role:m.who==='user'?'user':'assistant', content:m.content})), context: snapshot, language: lang }) }); if (r.status === 503 || r.status === 404){aiState('error'); return '[Réponse locale — Gemini indisponible]\n' + reply(question,lang);} if(!r.ok){aiState('error'); return '[Réponse locale — erreur Gemini]\n' + reply(question,lang);} const j = await r.json(); if(j.answer){aiState('answering'); return j.answer;} aiState('error');return '[Réponse locale — réponse Gemini vide]\n'+reply(question,lang); } catch { aiState('error'); return '[Réponse locale — connexion indisponible]\n'+reply(question,lang); }
  }
  function stopSpeech(){ try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch{} }
  function scheduleRecognitionRestart(){ clearTimeout(restartTimer); if(!continuousCallWanted || sending) return; restartTimer = setTimeout(() => startRecognition(true), 520); }
  function speakAnswer(text, lang){ if(!('speechSynthesis' in window) || !autoSpeak) { scheduleRecognitionRestart(); return; } try{ stopSpeech(); const utter = new SpeechSynthesisUtterance(stripMarkdownForSpeech(text).slice(0, 1000)); utter.lang = lang === 'ary' ? 'ar-MA' : 'fr-FR'; utter.rate = .98; utter.onend = () => scheduleRecognitionRestart(); utter.onerror = () => scheduleRecognitionRestart(); window.speechSynthesis.speak(utter);}catch{ scheduleRecognitionRestart(); } }
  function renderAttachment(){ const pill = document.getElementById('nx-ai-attach-pill'); if(!pill) return; if(!attachedImageData){ pill.hidden = true; pill.innerHTML = ''; return; } pill.hidden = false; pill.innerHTML = `<span>${attachedImageName || tr('Image prête','الصورة واجدة', lastLang)}</span><button type="button" id="nx-ai-remove-image" aria-label="Retirer">×</button>`; pill.querySelector('#nx-ai-remove-image')?.addEventListener('click', clearAttachment, {once:true}); }
  function clearAttachment(){ attachedImageData = ''; attachedImageName = ''; renderAttachment(); const file = document.getElementById('ai-chat-image'); if(file) file.value = ''; }
  async function fileToDataUrl(file){ return await new Promise((resolve, reject)=>{ const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(reader.error || new Error('read_error')); reader.readAsDataURL(file); }); }
  async function describeAttachedImage(question, lang){ if(!attachedImageData) return ''; try{ const r = await fetch('/api/ai/photo', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({image: attachedImageData, language: lang})}); if(r.status === 503 || r.status === 404) return ''; const j = await r.json(); if(!r.ok) return ''; return cleanText(j.answer || ''); }catch{ return ''; } }

  function iconSvg(name){
    const map = {
      mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"></path><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path><path d="M9 21h6"></path></svg>',
      image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="3"></rect><circle cx="9" cy="10" r="1.2"></circle><path d="m8 15 2.5-2.5L13 15l2-2 3 3"></path></svg>',
      call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.02.34 2.1.52 3.22.52a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.54a1 1 0 0 1 1 1c0 1.12.18 2.2.52 3.22a1 1 0 0 1-.24 1L6.6 10.8Z"></path></svg>',
      send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"></path><path d="m12 5 7 7-7 7"></path></svg>'
    }; return map[name] || '';
  }
  function updateButtons(){
    const voiceBtn = document.getElementById('ai-voice-btn'); const speakBtn = document.getElementById('ai-speak-toggle'); const callBtn = document.getElementById('ai-call-btn');
    if(voiceBtn){ voiceBtn.classList.toggle('is-active', listening || (!listening && continuousCallWanted)); voiceBtn.title = listening ? tr('Arrêter le micro','وقف الميكرو') : tr('Micro','الميكرو'); }
    if(speakBtn){ speakBtn.classList.toggle('is-active', autoSpeak); speakBtn.title = autoSpeak ? tr('Voix activée','الصوت مفعّل') : tr('Voix désactivée','الصوت مطفي'); }
    if(callBtn){ callBtn.classList.toggle('is-active', continuousCallWanted); callBtn.title = continuousCallWanted ? tr('Terminer l’appel','سالي المكالمة') : tr('Appel AI','مكالمة AI'); }
  }
  function stopRecognition(){ clearTimeout(restartTimer); if(!recognition) return; try { recognition.stop(); } catch {} }
  function startRecognition(continuous = false){ const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if(!SR) return false; if(recognition && listening) return true; recognition = new SR(); recognition.lang = lastLang === 'ary' ? 'ar-MA' : 'fr-FR'; recognition.interimResults = !!continuous; recognition.continuous = !!continuous; recognition.maxAlternatives = 1; let transcript=''; recognition.onstart=()=>{listening=true; updateButtons();}; recognition.onresult=(e)=>{ let finalChunk=''; for(let i=e.resultIndex;i<e.results.length;i++){ const res=e.results[i]; const text=cleanText(res[0]?.transcript||''); if(res.isFinal) finalChunk += (finalChunk?' ':'') + text; else if(continuous) input.value=text; } if(finalChunk){ transcript = cleanText((transcript+' '+finalChunk).trim()); input.value = transcript; if(continuous){ try{ recognition.stop(); }catch{} setTimeout(()=>{ const q=transcript; transcript=''; input.value=''; ask(q); }, 120); } } }; recognition.onend=()=>{ listening=false; updateButtons(); if(!continuous && input.value.trim()){ const q=input.value.trim(); input.value=''; ask(q); return; } if(continuousCallWanted && !sending && (!('speechSynthesis' in window) || !window.speechSynthesis.speaking)) scheduleRecognitionRestart(); }; try{ recognition.start(); return true;}catch{return false;} }
  function handleCallModeState(){ const active = document.body.classList.contains('ai-call-active'); if(active === continuousCallWanted) return; continuousCallWanted = active; autoSpeak = active || autoSpeak; if(active) startRecognition(true); else { stopRecognition(); stopSpeech(); listening = false; } updateButtons(); }
  async function ask(rawQuestion){ if(sending) return; let q=cleanText(rawQuestion); lastLang = detectQuestionLanguage(q || input.value || ''); if(!q && attachedImageData) q = tr('Analyse cette image et aide-moi à la comprendre.','حلل ليا هاد الصورة وشرحها ليا.', lastLang); if(!q) return; sending=true; aiState('thinking'); const submitBtn=form.querySelector('button[type=submit]'); if(submitBtn) submitBtn.disabled=true; stopRecognition(); const shownQuestion = attachedImageData ? `${q} ${imageTag(lastLang)}` : q; addMessage('user', shownQuestion); const loading=placeholderText(lastLang); addMessage('assistant', loading); const position=messages.length-1; let answer=''; try{ let finalQuestion=q; if(attachedImageData){ const visual=await describeAttachedImage(q,lastLang); if(visual) finalQuestion += lastLang==='ary' ? `\n\nمعطيات بصرية من الصورة: ${visual}` : `\n\nContexte visuel extrait de l’image : ${visual}`; } answer = await smartReply(finalQuestion,lastLang);}catch{ answer = reply(q,lastLang);} finally{ sending=false; if(submitBtn) submitBtn.disabled=false; } if(messages[position]?.content===loading){ messages[position].content=answer; drawMessages(); } clearAttachment(); speakAnswer(answer,lastLang); if(!String(answer).startsWith('[Réponse locale'))aiState('success'); input.focus(); updateButtons(); }
  function stat(icon,value,caption){ const card=document.createElement('div');card.className='ai-stat'; const i=document.createElement('div');i.className='ai-stat-icon';i.textContent=icon; const v=document.createElement('div');v.className='ai-stat-value';v.textContent=value; const c=document.createElement('div');c.className='ai-stat-caption';c.textContent=caption; card.append(i,v,c);return card; }
  function quickCard(kind, title, hint, icon){ const btn=document.createElement('button'); btn.type='button'; btn.className='nx-ai-quick-card'; btn.dataset.kind=kind; btn.innerHTML=`<span class="nx-ai-quick-icon">${icon}</span><strong>${title}</strong><small>${hint}</small>`; return btn; }
  function render(){ overview.replaceChildren(
    quickCard('scan', tr('Scanner produit','سكاني المنتوج'), tr('Code-barres','الباركود'), '▦'),
    quickCard('meal-photo', tr('Photo repas','صوّر الوجبة'), tr('Analyse image','حلّل الصورة'), '◫')
  );
    overview.querySelector('[data-kind="scan"]')?.addEventListener('click', ()=>{ document.querySelector('.tab[data-tab="nutri"]')?.click(); setTimeout(()=>document.querySelector('.nutri-scan-card')?.scrollIntoView({behavior:'smooth',block:'center'}), 120); setTimeout(()=>document.getElementById('nutri-scan-btn')?.click(), 160); });
    overview.querySelector('[data-kind="meal-photo"]')?.addEventListener('click', ()=>{ document.querySelector('.tab[data-tab="health"]')?.click(); setTimeout(()=>document.querySelector('[data-v9-action="photo"]')?.click() || document.getElementById('ai-product-photo')?.click(), 150); });
  }
  window.renderSpaceAI = render;

  function buildControls(){
    if(document.getElementById('ai-voice-btn')) return;
    const voiceBtn = document.createElement('button'); voiceBtn.type='button'; voiceBtn.id='ai-voice-btn'; voiceBtn.className='nx-ai-icon-btn'; voiceBtn.innerHTML=iconSvg('mic'); voiceBtn.setAttribute('aria-label','Micro'); voiceBtn.title='Micro'; voiceBtn.addEventListener('click',()=>{ if(continuousCallWanted){ if(listening){ stopRecognition(); listening=false; updateButtons(); } else startRecognition(true);} else { if(listening){ stopRecognition(); listening=false; updateButtons(); } else startRecognition(false);} });
    const submitBtn = form.querySelector('button[type=submit]'); if(submitBtn){ submitBtn.innerHTML = iconSvg('send'); submitBtn.setAttribute('aria-label','Envoyer'); }
    form.insertBefore(voiceBtn, input);
    const dock = document.createElement('div'); dock.className='nx-ai-dock'; dock.innerHTML = `<div class="nx-ai-meta"><div class="nx-ai-attach-pill" id="nx-ai-attach-pill" hidden></div></div><div class="nx-ai-actions"><button type="button" class="nx-ai-icon-btn" id="ai-image-btn" aria-label="Image" title="Image">${iconSvg('image')}</button><button type="button" class="nx-ai-icon-btn" id="ai-speak-toggle" aria-label="Voix" title="Voix">${iconSvg('mic')}</button><button type="button" class="nx-ai-icon-btn" id="ai-call-btn" aria-label="Appel AI" title="Appel AI">${iconSvg('call')}</button></div><input type="file" id="ai-chat-image" accept="image/jpeg,image/png,image/webp" hidden>`; form.insertAdjacentElement('afterend', dock);
    const fileInput = dock.querySelector('#ai-chat-image'); const imageButton=dock.querySelector('#ai-image-btn'); if(imageButton){form.insertBefore(imageButton, input)} imageButton?.addEventListener('click',()=>fileInput?.click()); fileInput?.addEventListener('change', async ()=>{ const file=fileInput.files?.[0]; if(!file) return; attachedImageName=file.name; attachedImageData=await fileToDataUrl(file); renderAttachment(); }); dock.querySelector('#ai-speak-toggle')?.addEventListener('click',()=>{ autoSpeak=!autoSpeak; if(!autoSpeak) stopSpeech(); updateButtons(); });
    const bodyObs=new MutationObserver(handleCallModeState); bodyObs.observe(document.body,{attributes:true,attributeFilter:['class']}); handleCallModeState(); updateButtons();
  }

  // minimalize AI UI
  enhanceHeader();
  document.querySelector('.ai-disclaimer')?.setAttribute('hidden','hidden');
  document.querySelector('.ai-label')?.setAttribute('hidden','hidden');
  document.querySelector('.ai-suggestions')?.setAttribute('hidden','hidden');
  shell.classList.add('nx-ai-minimal-shell');

  form.addEventListener('submit', e=>{ e.preventDefault(); const q=input.value.trim(); if(!q && !attachedImageData) return; input.value=''; ask(q); });
  clearBtn.addEventListener('click', ()=>{ messages.length=0; clearAttachment(); stopSpeech(); addMessage('assistant', tr('Bonjour ! Je suis Nutrix Intelligence.','سلام! أنا Nutrix Intelligence.')); });

  buildControls();
  addMessage('assistant', tr('Bonjour ! Je suis Nutrix Intelligence.','سلام! أنا Nutrix Intelligence.'));
  render();
})();
