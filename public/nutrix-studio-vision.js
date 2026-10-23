/* Nutrix Studio — image-first tools. Photo in → visual result out (rings, bars, chips) with almost no text.
   Uses /api/ai/vision (structured analysis) and /api/ai/image (optional generated dish). */
(()=>{'use strict';
const root=document.getElementById('ns-workspace');if(!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,n(v)));
const r0=v=>Math.round(n(v));
const short=(s,m=40)=>String(s??'').slice(0,m);
const I={
 camera:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 image:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>',
 spark:'<svg viewBox="0 0 24 24"><path d="m12 3 2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
 refresh:'<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
 warn:'<svg viewBox="0 0 24 24"><path d="M12 4 3 20h18zM12 10v4M12 17v.5"/></svg>',
 clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
 trophy:'<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8"/></svg>',
 flame:'<svg viewBox="0 0 24 24"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8z"/></svg>',
 cube:'<svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5"/></svg>',
 drop:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/></svg>',
 salt:'<svg viewBox="0 0 24 24"><path d="M8 9h8l-1 11H9zM9 9V6h6v3M10.5 13h3"/></svg>',
 muscle:'<svg viewBox="0 0 24 24"><path d="M4 14c2-1 3-3 3-6l3 1c0 2 1 3 3 3l3-2c2 0 4 2 4 5s-3 5-6 5-6 0-8-2z"/></svg>',
 close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};
const ico=k=>`<i class="nv-i">${I[k]}</i>`;
const CFG={
 plate:{title:'Photographiez votre assiette',sub:'Calories, macros et score en un coup d’œil',cta:'Analyser',slots:['Assiette']},
 fridge:{title:'Ouvrez votre frigo',sub:'Ingrédients détectés et idées de plats',cta:'Scanner le frigo',slots:['Frigo ou courses']},
 swap:{title:'Deux produits, un gagnant',sub:'Ajoutez les deux photos pour comparer',cta:'Comparer',slots:['Produit A','Produit B']},
 intelligence:{title:'Décryptez un produit',sub:'Photo de l’emballage ou de l’étiquette',cta:'Décrypter',slots:['Produit']},
 restaurant:{title:'Menu ou plat du resto',sub:'Les meilleurs choix, classés',cta:'Trouver le meilleur choix',slots:['Menu ou plat']}
};
const state={};
const HK='nutrix-vision-history';
const hist=()=>{try{return JSON.parse(localStorage.getItem(HK)||'[]')}catch{return []}};
const histSave=a=>{try{localStorage.setItem(HK,JSON.stringify(a.slice(0,24)))}catch{}};
function thumb(dataUrl){return new Promise(res=>{if(!dataUrl)return res('');const im=new Image();im.onload=()=>{const k=120/Math.max(im.width,im.height);const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.6))};im.onerror=()=>res('');im.src=dataUrl})}
function titleOf(tool,r){return short(tool==='plate'?r.dish:tool==='fridge'?(r.items||[]).length+' ingrédients':tool==='swap'?`${(r.a||{}).name||'A'} vs ${(r.b||{}).name||'B'}`:tool==='intelligence'?r.name:((r.picks||[])[0]||{}).name||'Menu',34)}
async function remember(tool,imgs,r){const t=await thumb(imgs.find(Boolean));const a=hist();a.unshift({tool,ts:Date.now(),thumb:t,title:titleOf(tool,r),result:r});histSave(a)}
function addToJournal(r){try{const h=new Date().getHours(),meal=h<11?'b':h<17?'l':'d';const d=writeDay(current);d.meals[meal]=d.meals[meal]||{};const m=d.meals[meal];const add=(k,v)=>{m[k]=String(Math.round((Number(m[k])||0)+n(v))*1)};add('kcal',r.kcal);add('p',r.p);add('c',r.c);add('f',r.f);save();try{if(typeof renderAll==='function')renderAll()}catch{}return {ok:true,meal:({b:'Petit-déjeuner',l:'Déjeuner',d:'Dîner'})[meal]}}catch{return {ok:false}}}
const SK='nutrix-shopping';
const shopGet=()=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return []}};
const shopSet=a=>{try{localStorage.setItem(SK,JSON.stringify(a))}catch{}};
function missingOf(d){const m=[];(d.recipes||[]).forEach(r=>(r.missing||[]).forEach(x=>{const k=short(x,24).trim();if(k&&!m.some(y=>y.toLowerCase()===k.toLowerCase()))m.push(k)}));return m}
function shopHtml(d){const miss=missingOf(d);const list=shopGet();if(!miss.length&&!list.length)return '';return `<div class="nv-shop"><div class="nv-shop-h"><h4 class="nv-h">Liste de courses</h4>${miss.length?`<button type="button" class="nv-shop-add" data-shop-add>${ico('check')}Ajouter ${miss.length} article${miss.length>1?'s':''}</button>`:''}</div>${list.length?`<ul class="nv-shop-list">${list.map((x,i)=>`<li class="${x.done?'done':''}"><button type="button" data-shop-t="${i}" aria-label="Cocher"><i>${x.done?I.check:''}</i><span>${esc(x.t)}</span></button><button type="button" class="x" data-shop-x="${i}" aria-label="Retirer">${I.close}</button></li>`).join('')}</ul><div class="nv-shop-acts"><a class="nv-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('🛒 Ma liste de courses\n'+list.filter(x=>!x.done).map(x=>'• '+x.t).join('\n'))}">Envoyer sur WhatsApp</a><button type="button" data-shop-clear>Vider</button></div>`:''}</div>`}
function histHtml(tool){const a=hist().filter(x=>x.tool===tool).slice(0,6);if(!a.length)return '';return `<div class="nv-hist"><h4 class="nv-h">Récents</h4><div class="nv-hist-row">${a.map((x,i)=>`<button type="button" data-hi="${x.ts}" title="${esc(x.title)}">${x.thumb?`<img src="${x.thumb}" alt="">`:`<b>${ico('image')}</b>`}<span>${esc(x.title)}</span></button>`).join('')}</div></div>`}            // per tool: {imgs:[], result, gen, busy, err}
function fileToImage(file,max=1280){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej(new Error('read'));fr.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('img'));im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.src=String(fr.result)};fr.readAsDataURL(file)})}
async function post(path,body){let r;try{r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch{throw new Error('Connexion impossible. Lancez le serveur Nutrix.')}
 let j={};try{j=await r.json()}catch{}
 if(!r.ok)throw new Error(r.status===503?'Clé GEMINI_API_KEY manquante sur le serveur.':(j.error||'Service indisponible.'));return j}

/* ---------- visual atoms ---------- */
function ring(value,max,label,sub,color='var(--nx-primary)'){const p=clamp(value/max*100,0,100),C=2*Math.PI*52;return `<div class="nv-ring" style="--c:${color}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" stroke-dasharray="${(C*p/100).toFixed(1)} ${C.toFixed(1)}"/></svg><div><strong>${esc(label)}</strong><small>${esc(sub)}</small></div></div>`}
function bar(label,val,max,unit,color){return `<div class="nv-bar"><span>${esc(label)}</span><div><i style="width:${clamp(val/max*100,2,100)}%;background:${color}"></i></div><b>${val<10&&val%1?Math.round(val*10)/10:r0(val)}<small>${unit}</small></b></div>`}
function scoreColor(s){return s>=70?'#14a37a':s>=45?'#e8a317':'#e0533d'}
const chip=(t,e='',cls='')=>`<span class="nv-chip ${cls}">${e?`<em>${esc(e)}</em>`:''}${esc(t)}</span>`;

/* ---------- result renderers ---------- */
const R={
 plate(d){const kcal=n(d.kcal),p=n(d.p),c=n(d.c),f=n(d.f),s=clamp(d.score,0,100),items=Array.isArray(d.items)?d.items.slice(0,10):[];
  return `<div class="nv-res-top">${ring(kcal,900,r0(kcal),'kcal',scoreColor(s))}<div class="nv-res-head"><h3>${esc(short(d.dish,48))}</h3><span class="nv-badge" style="--b:${scoreColor(s)}">${s}/100 · ${esc(short(d.verdict,24))}</span></div></div>
  <div class="nv-bars">${bar('Protéines',p,60,'g','#14a37a')}${bar('Glucides',c,120,'g','#4f8df7')}${bar('Lipides',f,50,'g','#e8a317')}</div>
  <div class="nv-chips">${items.map(i=>chip(`${short(i.name,22)} · ${r0(i.grams)} g`,i.emoji)).join('')}</div>
  ${d.tip?`<p class="nv-tip">${ico('spark')}${esc(short(d.tip,90))}</p>`:''}`},
 fridge(d){const items=Array.isArray(d.items)?d.items.slice(0,16):[],rec=Array.isArray(d.recipes)?d.recipes.slice(0,3):[];
  const st={frais:['frais','ok'],a_utiliser:['à utiliser','warn'],incertain:['?','mute']};
  return `<div class="nv-chips big">${items.map(i=>{const s=st[i.state]||st.incertain;return chip(short(i.name,22),i.emoji,s[1])+''}).join('')}</div>
  <h4 class="nv-h">Idées rapides</h4><div class="nv-recipes">${rec.map(x=>`<div class="nv-recipe"><b>${esc(x.emoji||'🍽️')}</b><strong>${esc(short(x.name,40))}</strong><span>${ico('clock')}${r0(x.minutes)} min</span>${(x.missing||[]).length?`<div class="nv-miss">${(x.missing||[]).slice(0,4).map(m=>`<i>${esc(short(m,18))}</i>`).join('')}</div>`:''}</div>`).join('')}</div>${shopHtml(d)}`},
 swap(d){const a=d.a||{},b=d.b||{},w=d.winner;
  const lab=s=>s>=75?['Excellent','#14a37a']:s>=50?['Bon','#7bbf2a']:s>=25?['Médiocre','#ef8a1c']:['Mauvais','#e0533d'];
  const lvl=(v,g,o,inv)=>{v=n(v);const good=inv?v>=g:v<=g,ok=inv?v>=o:v<=o;return good?['g','Excellent']:ok?['o','Moyen']:['r','Élevé']};
  const rows=x=>[['Énergie','flame',x.kcal,' kcal',lvl(x.kcal,150,350)],['Sucres','cube',x.sugar,' g',lvl(x.sugar,5,12)],['Lipides','drop',x.fat,' g',lvl(x.fat,3,10)],['Sel','salt',x.salt,' g',lvl(x.salt,.3,1)],['Protéines','muscle',x.p,' g',(v=>v>=8?['g','Riche']:v>=3?['o','Moyen']:['m','Faible'])(n(x.p))]];
  const side=(x,k,img)=>{const s=clamp(x.score,0,100),[t,c]=lab(s),win=w===k;
   return `<article class="nv-prod ${win?'win':''}" style="--sc:${c}">
   <div class="nv-prod-hero"><span class="nv-letter">${k.toUpperCase()}</span>${img?`<img src="${img}" alt="">`:`<b>${esc(x.emoji||'🍽️')}</b>`}${win?`<span class="nv-crown">${ico('trophy')}<em>Meilleur choix</em></span>`:''}</div>
   <div class="nv-prod-body"><h4>${esc(short(x.name,34))}</h4>${x.brand?`<small>${esc(short(x.brand,26))}</small>`:''}
    <div class="nv-score"><div class="nv-score-n"><strong>${r0(s)}</strong><small>/100</small></div><div class="nv-score-bar"><i style="width:${clamp(s,3,100)}%"></i></div><span class="nv-score-l">${t}</span></div>
    <ul class="nv-facts">${rows(x).map(([l,ic,v,u,[lv,tx]])=>`<li class="${lv}"><i class="nv-fi">${I[ic]}</i><span>${l}<small>${tx}</small></span><b>${v==null?'—':(n(v)<10&&n(v)%1?Math.round(n(v)*10)/10:r0(v))}<small>${u}</small></b><em></em></li>`).join('')}</ul>
    ${Array.isArray(x.tags)&&x.tags.length?`<div class="nv-chips">${x.tags.slice(0,3).map(t=>chip(short(t,26))).join('')}</div>`:''}</div></article>`};
  const imgs=(state.swap&&state.swap.imgs)||[];
  return `<div class="nv-swap-res">${d.why?`<div class="nv-verdict">${ico('trophy')}<div><small>Verdict</small><strong>${esc(short(d.why,80))}</strong></div></div>`:''}<div class="nv-prods">${side(a,'a',imgs[0])}<div class="nv-vs-dot">VS</div>${side(b,'b',imgs[1])}</div></div>`},
 intelligence(d){const s=clamp(d.score,0,100),g=String(d.grade||'C').toUpperCase().slice(0,1),per=d.per100||{};const gc={A:'#1a9b58',B:'#7bbf2a',C:'#e8c21a',D:'#ef8a1c',E:'#e0533d'}[g]||'#e8c21a';
  const list=(a,cls,ic)=>(Array.isArray(a)?a.slice(0,3):[]).map(t=>`<li class="${cls}">${ico(ic)}${esc(short(t,34))}</li>`).join('');
  return `<div class="nv-res-top">${ring(s,100,s,'/100',scoreColor(s))}<div class="nv-res-head"><h3>${esc(d.emoji||'')} ${esc(short(d.name,40))}</h3><div class="nv-grades">${['A','B','C','D','E'].map(x=>`<i class="${x===g?'on':''}" style="--g:${{A:'#1a9b58',B:'#7bbf2a',C:'#e8c21a',D:'#ef8a1c',E:'#e0533d'}[x]}">${x}</i>`).join('')}</div></div></div>
  <ul class="nv-points">${list(d.good,'ok','check')}${list(d.watch,'warn','warn')}</ul>
  <div class="nv-bars">${bar('Énergie',n(per.kcal),600,' kcal','#e8a317')}${bar('Protéines',n(per.p),40,'g','#14a37a')}${bar('Sucres',n(per.sugar),50,'g','#e0533d')}${bar('Sel',n(per.salt),3,'g','#4f8df7')}</div><p class="nv-foot">pour 100 g · estimation</p>`},
 restaurant(d){const picks=Array.isArray(d.picks)?d.picks.slice(0,3):[];const lv={leger:'Léger',moyen:'Moyen',riche:'Riche'};
  return `<div class="nv-picks">${picks.map((x,i)=>`<div class="nv-pick ${i===0?'best':''}"><span class="nv-rank">${i+1}</span><b class="nv-emoji">${esc(x.emoji||'🍽️')}</b><div><strong>${esc(short(x.name,40))}</strong><small>${esc(short(x.why,50))}</small></div><div class="nv-pick-end"><em class="lv ${esc(x.level)}">${esc(lv[x.level]||'')}</em><span style="--b:${scoreColor(n(x.score))}">${r0(x.score)}</span></div></div>`).join('')}</div>`}
};
const GEN={plate:{k:'better_prompt',label:'Voir une version plus saine'},fridge:{k:'image_prompt',label:'Générer le plat'},restaurant:{k:'image_prompt',label:'Voir le plat conseillé'}};

/* ---------- view ---------- */
function slotHtml(tool,i,name){const img=state[tool].imgs[i];return `<div class="nv-slot ${img?'has':''}" data-slot="${i}" tabindex="0" role="button" aria-label="${esc(name)}">
 ${img?`<img src="${img}" alt="${esc(name)}"><span class="nv-scan"></span><button type="button" class="nv-x" data-clear="${i}" aria-label="Retirer">${I.close}</button>`:`<div class="nv-slot-empty">${ico('camera')}<strong>${esc(name)}</strong><small>Prendre ou déposer une photo</small></div>`}
 <input type="file" accept="image/jpeg,image/png,image/webp" ${'capture' in document.createElement('input')?'':''} hidden></div>`}
function view(tool){const c=CFG[tool],S=state[tool];if(tool==='swap')return viewSwap(c,S);const ready=S.imgs.filter(Boolean).length>=c.slots.length;
 return `<section class="nv" data-tool="${tool}">
  <div class="nv-in"><header><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></header>
   <div class="nv-slots n${c.slots.length}">${c.slots.map((nm,i)=>slotHtml(tool,i,nm)).join('')}</div>
   <button type="button" class="nv-go" ${ready&&!S.busy?'':'disabled'}>${S.busy?'<span class="nv-spin"></span>Analyse en cours':ico('spark')+esc(c.cta)}</button>
   ${S.err?`<p class="nv-err">${ico('warn')}${esc(S.err)}</p>`:''}${histHtml(tool)}</div>
  <div class="nv-out ${S.result||S.busy?'on':''}">${S.busy?'<div class="nv-skel"><i></i><i></i><i></i></div>':S.result?`<div class="nv-card">${R[tool](S.result)}${GEN[tool]&&S.result[GEN[tool].k]?`<button type="button" class="nv-gen" ${S.genBusy?'disabled':''}>${S.genBusy?'<span class="nv-spin dark"></span>Création…':ico('spark')+GEN[tool].label}</button>`:''}${tool==='plate'?`<button type="button" class="nv-journal" ${S.added?'disabled':''}>${S.added?ico('check')+esc(S.added):ico('check')+'Ajouter au journal'}</button>`:''}${S.genErr?`<p class="nv-err">${ico('warn')}${esc(S.genErr)}</p>`:''}${S.gen?`<figure class="nv-fig"><img src="${S.gen}" alt="Idée de plat générée"><figcaption>Image générée par IA · illustration</figcaption></figure>`:''}<button type="button" class="nv-reset">${ico('refresh')}Nouvelle analyse</button></div>`:`<div class="nv-empty"><b>${ico('image')}</b><span>Le résultat apparaîtra ici</span></div>`}</div>
 </section>`}
function viewSwap(c,S){const ready=S.imgs.filter(Boolean).length>=2;
 return `<section class="nv nv-swap" data-tool="swap">
  <div class="nv-in"><header><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></header>
   <div class="nv-vs-slots">${slotHtml('swap',0,'Produit A')}<div class="nv-vs-dot">VS</div>${slotHtml('swap',1,'Produit B')}</div>
   <button type="button" class="nv-go" ${ready&&!S.busy?'':'disabled'}>${S.busy?'<span class="nv-spin"></span>Comparaison en cours':ico('spark')+esc(c.cta)}</button>
   ${S.err?`<p class="nv-err">${ico('warn')}${esc(S.err)}</p>`:''}${histHtml('swap')}</div>
  ${S.busy?'<div class="nv-out on"><div class="nv-skel"><i></i><i></i><i></i></div></div>':S.result?`<div class="nv-out on nv-out-wide">${R.swap(S.result)}<button type="button" class="nv-reset">${ico('refresh')}Nouvelle comparaison</button></div>`:''}
 </section>`}
function render(tool){if(!CFG[tool])return false;state[tool]=state[tool]||{imgs:[]};root.innerHTML=view(tool);bind(tool);return true}
function bind(tool){const S=state[tool],el=root.querySelector('.nv');
 el.querySelectorAll('.nv-slot').forEach(slot=>{const i=Number(slot.dataset.slot),inp=slot.querySelector('input');
  const pick=()=>{if(!S.imgs[i])inp.click()};
  slot.addEventListener('click',e=>{if(e.target.closest('[data-clear]'))return;pick()});
  slot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
  slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('drag')});slot.addEventListener('dragleave',()=>slot.classList.remove('drag'));
  slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('drag');set(e.dataTransfer.files?.[0])});
  inp.addEventListener('change',()=>set(inp.files?.[0]));
  async function set(f){if(!f||!/^image\//.test(f.type))return;try{S.imgs[i]=await fileToImage(f);S.result=null;S.gen=null;S.err='';S.genErr='';render(tool)}catch{S.err='Image illisible.';render(tool)}}
 });
 el.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();S.imgs[Number(b.dataset.clear)]=null;S.result=null;S.gen=null;render(tool)}));
 el.querySelector('.nv-go')?.addEventListener('click',async()=>{S.busy=true;S.err='';S.gen=null;S.genErr='';render(tool);
  try{const j=await post('/api/ai/vision',{tool,images:S.imgs.filter(Boolean),note:(()=>{try{const p=JSON.parse(localStorage.getItem('nutrix-prefs')||'[]');return p.length?'Préférences : '+p.join(', '):''}catch{return ''}})(),language:document.documentElement.lang==='ary'?'ary':'fr'});S.result=j.result;S.added='';remember(tool,S.imgs,j.result);if(tool==='fridge')try{localStorage.setItem('nutrix-vision-fridge',JSON.stringify(j.result.items||[]))}catch{}}
  catch(e){S.err=e.message}S.busy=false;render(tool)});
 el.querySelector('.nv-gen')?.addEventListener('click',async()=>{S.genBusy=true;S.genErr='';render(tool);
  try{const j=await post('/api/ai/image',{prompt:short(S.result[GEN[tool].k],500)});S.gen=j.image}catch(e){S.genErr=e.message}S.genBusy=false;render(tool)});
 el.querySelector('[data-shop-add]')?.addEventListener('click',()=>{const l=shopGet();missingOf(S.result).forEach(t=>{if(!l.some(x=>x.t.toLowerCase()===t.toLowerCase()))l.push({t,done:false})});shopSet(l);render(tool)});
 el.querySelectorAll('[data-shop-t]').forEach(b=>b.addEventListener('click',()=>{const l=shopGet(),i=Number(b.dataset.shopT);if(l[i])l[i].done=!l[i].done;shopSet(l);render(tool)}));
 el.querySelectorAll('[data-shop-x]').forEach(b=>b.addEventListener('click',()=>{const l=shopGet();l.splice(Number(b.dataset.shopX),1);shopSet(l);render(tool)}));
 el.querySelector('[data-shop-clear]')?.addEventListener('click',()=>{shopSet([]);render(tool)});
 el.querySelectorAll('[data-hi]').forEach(b=>b.addEventListener('click',()=>{const x=hist().find(h=>String(h.ts)===b.dataset.hi);if(!x)return;S.result=x.result;S.gen=null;S.err='';S.added='';render(tool)}));
 el.querySelector('.nv-journal')?.addEventListener('click',()=>{const r=addToJournal(S.result);S.added=r.ok?'Ajouté · '+r.meal:'';if(!r.ok)S.err='Ajout impossible.';render(tool)});
 el.querySelector('.nv-reset')?.addEventListener('click',()=>{state[tool]={imgs:[]};render(tool)});
}
window.NutrixVision={render};
const cur=document.querySelector('#ns-tabs button.on')?.dataset.tool||'plate';render(cur);
})();
