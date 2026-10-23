/* Nutrix Pro — AI welcome screen (greeting + suggestion cards). No backend changes. */
(()=>{'use strict';
 const SUGGESTIONS=[
  ['Analyser mon repas','Décris ou photographie ton assiette','Analyse mon repas et les portions.'],
  ['Mon bilan du jour','Calories et macros enregistrées',"Analyse mon alimentation aujourd'hui."],
  ['Idées de repas','Riches en protéines, simples à préparer','Propose-moi un repas riche en protéines.'],
  ['Comparer des aliments','Poulet, riz, œufs…','Compare le poulet, le riz et les œufs.']
 ];
 function hour(){const h=new Date().getHours();return h<5||h>=18?'Bonsoir':'Bonjour'}
 function init(){
  const drawer=document.getElementById('v11-ai-drawer'),shell=drawer&&drawer.querySelector('.ai-shell'),chat=document.getElementById('ai-chat'),input=document.getElementById('ai-input'),form=document.getElementById('ai-form');
  if(!shell||!chat||!input||!form||shell.querySelector('.nx-welcome'))return false;
  input.placeholder='Posez votre question…';const w=document.createElement('div');w.className='nx-welcome';
  w.innerHTML='<div class="nx-spark" aria-hidden="true">✦</div><h2></h2><p>Je peux analyser tes repas, tes macros et t’aider à mieux manger.</p><div class="nx-welcome-chips"></div>';
  w.querySelector('h2').textContent=hour()+', comment puis-je vous aider ?';
  const box=w.querySelector('.nx-welcome-chips');
  SUGGESTIONS.forEach(([t,s,q])=>{const b=document.createElement('button');b.type='button';b.append(document.createTextNode(t));const sm=document.createElement('small');sm.textContent=s;b.append(sm);b.addEventListener('click',()=>{input.value=q;form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))});box.append(b)});
  shell.insertBefore(w,chat);
  const sync=()=>drawer.classList.toggle('nx-welcome-on',!chat.querySelector('.ai-message.user')&&chat.querySelectorAll('.ai-message').length<=1);
  new MutationObserver(sync).observe(chat,{childList:true,subtree:true});sync();
  return true;
 }
 let n=0;const t=setInterval(()=>{if(init()||++n>40)clearInterval(t)},250);
})();

/* Section banners: same photo + green overlay language as the home hero. */
(()=>{'use strict';
 const B={
  health:['health-photo','SANTÉ · BIEN-ÊTRE','Votre santé, au quotidien','Activité, sommeil et habitudes : tout votre suivi au même endroit.'],
  journal:['journal-photo','JOURNAL · LABO','Votre journal alimentaire','Enregistrez vos repas, comparez vos produits et suivez vos apports.'],
  nutri:['scanner-photo','SCANNER','Analysez un produit en un instant','Code-barres, photo ou recherche : obtenez Nutri-Score, NOVA et valeurs clés.'],
  faq:['coach-photo','PROJET','À propos de Nutrix','Un compagnon pour analyser, comparer et mieux comprendre ce que vous mangez.']
 };
 function run(){Object.entries(B).forEach(([id,[img,eb,t,sub]])=>{const pg=document.getElementById('page-'+id);if(!pg||pg.querySelector(':scope>.nx-banner'))return;
  const d=document.createElement('header');d.className='nx-banner';d.style.setProperty('--bn','url(assets/sections/'+img+'.webp)');
  const e=document.createElement('span');e.textContent=eb;const h=document.createElement('h2');h.textContent=t;const p=document.createElement('p');p.textContent=sub;d.append(e,h,p);pg.prepend(d)})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

/* Short labels for the mobile tab bar (full names stay in aria-label). */
(()=>{'use strict';
 const L={home:'Accueil',health:'Santé',nutri:'Scanner',journal:'Journal',ai:'Coach',studio:'Studio',faq:'Projet'};
 function run(){document.querySelectorAll('.pulse-nav-links .tab[data-tab]').forEach(b=>{const t=L[b.dataset.tab];if(t)b.setAttribute('data-short',t)})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

/* Optional access code for AI routes (server: NUTRIX_ACCESS_CODE). Asked once, kept on this device. */
(()=>{'use strict';
 const KEY='nutrix-access-code',native=window.fetch.bind(window);
 const get=()=>{try{return localStorage.getItem(KEY)||''}catch{return ''}};
 const isAI=u=>/\/api\/ai\//.test(String(typeof u==='string'?u:u&&u.url||''));
 window.fetch=async(input,init={})=>{
  if(!isAI(input))return native(input,init);
  const go=()=>{const h=new Headers(init.headers||{});const c=get();if(c)h.set('x-nutrix-code',c);return native(input,{...init,headers:h})};
  let r=await go();
  if(r.status===401){let j={};try{j=await r.clone().json()}catch{}
   if(j.code_required){const c=window.prompt('Code d’accès Nutrix :');if(c){try{localStorage.setItem(KEY,c.trim())}catch{}r=await go()}}}
  return r};
})();

/* Onboarding: goal → body → preferences → personal calorie target. Shown once. */
(()=>{'use strict';
 const FLAG='nutrix-onboarded-v1',PREFS='nutrix-prefs';
 const done=()=>{try{return !!localStorage.getItem(FLAG)}catch{return true}};
 const GOALS=[['lose','🔥','Perdre du poids','Léger déficit calorique'],['maintain','⚖️','Garder mon poids','Équilibre au quotidien'],['gain','💪','Prendre du muscle','Plus de calories et de protéines']];
 const ACT=[['1.2','Sédentaire'],['1.375','Léger'],['1.55','Actif'],['1.725','Très actif']];
 const PREF=[['Végétarien','🥗'],['Halal','🕌'],['Sans gluten','🌾'],['Sans lactose','🥛'],['Sans sucre ajouté','🍬'],['Riche en protéines','🥚']];
 const D={goal:'maintain',sex:'h',age:'',height:'',weight:'',activity:'1.55',prefs:[]};
 const kcal=()=>{const w=+D.weight,h=+D.height,a=+D.age;if(!(w&&h&&a))return 2000;const bmr=10*w+6.25*h-5*a+(D.sex==='h'?5:-161);let t=bmr*(+D.activity);t+=D.goal==='lose'?-500:D.goal==='gain'?300:0;return Math.min(4500,Math.max(1200,Math.round(t/50)*50))};
 let step=0,root;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const panes=[
  ()=>`<h2>Quel est votre objectif ?</h2><p>On adapte vos calories et vos macros.</p><div class="ob-goals">${GOALS.map(([k,e,t,s])=>`<button type="button" class="ob-goal ${D.goal===k?'on':''}" data-goal="${k}"><b>${e}</b><span><strong>${t}</strong><small>${s}</small></span></button>`).join('')}</div>`,
  ()=>`<h2>Parlez-nous de vous</h2><p>Pour calculer vos besoins réels.</p>
   <div class="ob-seg">${[['h','Homme'],['f','Femme']].map(([k,t])=>`<button type="button" class="${D.sex===k?'on':''}" data-sex="${k}">${t}</button>`).join('')}</div>
   <div class="ob-fields"><label>Âge<input inputmode="numeric" data-f="age" value="${esc(D.age)}" placeholder="25"><i>ans</i></label><label>Taille<input inputmode="numeric" data-f="height" value="${esc(D.height)}" placeholder="170"><i>cm</i></label><label>Poids<input inputmode="decimal" data-f="weight" value="${esc(D.weight)}" placeholder="70"><i>kg</i></label></div>
   <div class="ob-seg four">${ACT.map(([k,t])=>`<button type="button" class="${D.activity===k?'on':''}" data-act="${k}">${t}</button>`).join('')}</div>`,
  ()=>`<h2>Vos préférences</h2><p>Optionnel — l’IA en tiendra compte.</p><div class="ob-prefs">${PREF.map(([t,e])=>`<button type="button" class="${D.prefs.includes(t)?'on':''}" data-pref="${esc(t)}"><em>${e}</em>${t}</button>`).join('')}</div>
   <div class="ob-result"><small>Votre objectif quotidien</small><strong>${kcal().toLocaleString('fr-FR')}<span> kcal</span></strong><small>${D.weight?'Calculé pour vous':'Valeur par défaut — complétez l’étape précédente pour l’affiner'}</small></div>`
 ];
 function draw(){root.innerHTML=`<div class="ob-card" role="dialog" aria-modal="true" aria-label="Configuration">
  <div class="ob-top"><div class="ob-dots">${panes.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div><button type="button" class="ob-skip" data-skip>Plus tard</button></div>
  <div class="ob-body">${panes[step]()}</div>
  <div class="ob-actions">${step?'<button type="button" class="ob-back" data-back>Retour</button>':'<span></span>'}<button type="button" class="ob-next" data-next>${step===panes.length-1?'Commencer':'Continuer'}</button></div></div>`}
 function finish(save){try{localStorage.setItem(FLAG,'1')}catch{}
  if(save){try{Object.assign(state.settings,{goal:D.goal,sex:D.sex,activity:D.activity,target:kcal()});['age','height','weight'].forEach(k=>{if(D[k])state.settings[k]=String(D[k])});window.save&&save_();try{renderAll()}catch{}localStorage.setItem(PREFS,JSON.stringify(D.prefs))}catch{}}
  root.classList.add('out');setTimeout(()=>root.remove(),250)}
 const save_=()=>{try{window.save()}catch{try{save()}catch{}}};
 function open(){if(root)root.remove();root=document.createElement('div');root.className='ob';document.body.append(root);draw();
  root.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
   if(t.dataset.goal){D.goal=t.dataset.goal;draw()}
   else if(t.dataset.sex){D.sex=t.dataset.sex;draw()}
   else if(t.dataset.act){D.activity=t.dataset.act;draw()}
   else if(t.dataset.pref){const p=t.dataset.pref;D.prefs=D.prefs.includes(p)?D.prefs.filter(x=>x!==p):[...D.prefs,p];draw()}
   else if('skip' in t.dataset)finish(false)
   else if('back' in t.dataset){step--;draw()}
   else if('next' in t.dataset){if(step===panes.length-1)finish(true);else{step++;draw()}}});
  root.addEventListener('input',e=>{const f=e.target.dataset.f;if(f)D[f]=e.target.value.replace(/[^0-9.]/g,'')})}
 window.NutrixOnboarding={open:()=>{step=0;open()}};
 const start=()=>{if(done())return;let has=false;try{has=Object.keys(state.days||{}).length>0||!!state.settings.weight}catch{}if(has){try{localStorage.setItem(FLAG,'1')}catch{}return}setTimeout(open,700)};
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
