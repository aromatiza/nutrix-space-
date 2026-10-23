/* Nutrix Santé layout adapter. Real values only; existing health tools stay mounted. */
(()=>{'use strict';
const svg=(content)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
const icons={
  plus:svg('<path d="M12 5v14M5 12h14"/>'),
  heart:svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>'),
  food:svg('<path d="M5 3v7m4-7v7M5 7h4M7 10v11M17 3v18M17 3c-3 4-3 8 0 10"/>'),
  chart:svg('<path d="m3 18 6-6 4 3 8-9"/>'),
  scan:svg('<path d="M7 3H4v5m13-5h3v5M4 16v5h4m12-5v5h-4M4 12h16"/>')
};
const COVER={'nh-activity':'health-photo','nh-overview':'home-photo','nh-heart':'journal-photo','nh-output':'project-photo','nh-recommend':'scanner-photo'};
const card=(extra,title,body)=>{const c=COVER[extra];return `<section class="nh-card ${extra}">${c?`<div class="nh-cover" style="--img:url(assets/sections/${c}.webp)"></div>`:''}<header class="nh-card-head"><h3>${title}</h3></header>${body}</section>`};
function init(){
  const health=document.getElementById('page-health');
  if(!health || document.getElementById('nh-dashboard')) return;
  const dashboard=document.createElement('div');
  dashboard.id='nh-dashboard';
  dashboard.className='nh-dashboard';
  dashboard.innerHTML=`
  <div class="nh-welcome">
    <div>
      <span class="nh-overline">NUTRIX · SANTÉ</span>
      <h2>Votre santé, en un regard.</h2>
      <p>Suivi nutritionnel et bien-être à partir de vos données réellement enregistrées.</p>
    </div>
    <div class="nh-welcome-actions">
      <button type="button" data-nh="add">${icons.food}<span>Ajouter un aliment</span></button>
      <button type="button" data-nh="scan">${icons.scan}<span>Scanner</span></button>
      <button type="button" data-nh="tools">${icons.chart}<span>Mes outils</span></button>
    </div>
  </div>
  <div class="nh-grid">
    ${card('nh-activity','Activité <span class="nh-muted nh-filter">7 derniers jours</span>','<div class="nh-bars" id="nh-bars"><p class="nh-empty">Ajoutez des repas pour voir votre activité.</p></div>')}
    ${card('nh-overview','Aujourd’hui','<div class="nh-overview-body"><div class="nh-donut" id="nh-donut" style="--percent:0"><div><b id="nh-kcal">—</b><small>kcal aujourd’hui</small></div></div><div class="nh-macros" id="nh-macros"></div></div>')}
    ${card('nh-goals','Objectifs du jour','<div class="nh-goal-track"><article class="nh-goal nh-goal-one"><small>Calories</small><b id="nh-goalcal">—</b><span>Progression énergétique</span><div class="nh-wave"><img src="assets/sections/journal-photo.webp" alt="Repas équilibré et suivi des calories" loading="lazy"></div></article><article class="nh-goal nh-goal-two"><small>Protéines</small><b id="nh-goalpro">—</b><span>Apport protéines</span><div class="nh-wave"><img src="assets/sections/scanner-photo.webp" alt="Produit riche en protéines" loading="lazy"></div></article><article class="nh-goal nh-goal-three"><small>Équilibre</small><b id="nh-goalwater">—</b><span>Suivi bien-être</span><div class="nh-wave"><img src="assets/sections/health-photo.webp" alt="Routine bien-être et équilibre" loading="lazy"></div></article></div>')}
    ${card('nh-trainer','Mon coach','<div class="nh-trainers"><article><div class="nh-trainer-face"><img src="assets/sections/project-photo.webp" alt="Planification nutritionnelle sur tablette avec repas équilibrés" loading="lazy"></div><b>Conseils nutrition</b><small>Nutrix AI</small><button type="button" data-nh="ai">Ouvrir le coach</button></article><article><div class="nh-trainer-face"><img src="assets/sections/health-photo.webp" alt="Suivi personnel avec montre connectée et carnet de bien-être" loading="lazy"></div><b>Suivi personnel</b><small>Vos données Santé</small><button type="button" data-nh="tools">Voir le suivi</button></article></div>')}
    ${card('nh-recommend','Actions rapides','<div class="nh-list"><button type="button" data-nh="add"><span class="nh-list-icon">'+icons.food+'</span><span><b>Ajouter un repas</b><small>Enregistrer vos calories et macros</small></span><span class="nh-list-right"><img src="assets/sections/journal-discovery.svg" alt="" loading="lazy"><em>Journal</em></span></button><button type="button" data-nh="scan"><span class="nh-list-icon">'+icons.scan+'</span><span><b>Scanner un produit</b><small>Recherche par code-barres</small></span><span class="nh-list-right"><img src="assets/sections/scanner-product.svg" alt="" loading="lazy"><em>Scanner</em></span></button><button type="button" data-nh="ai"><span class="nh-list-icon">'+icons.chart+'</span><span><b>Conseils AI</b><small>Votre assistant nutritionnel</small></span><span class="nh-list-right"><img src="assets/sections/coach-ai.svg" alt="" loading="lazy"><em>Coach</em></span></button></div>')}
    ${card('nh-heart','Tendance des calories','<div class="nh-trend-body"><div class="nh-trend-head"><div><strong id="nh-trend-value">0 kcal</strong><span>Évolution des 7 derniers jours</span></div><small id="nh-trend-range">—</small></div><svg class="nh-trend-graph" id="nh-trend-graph" viewBox="0 0 280 110" preserveAspectRatio="none" aria-hidden="true"></svg><div class="nh-chart-foot" id="nh-trend-foot"></div></div>')}
    ${card('nh-output','Bilan du jour','<div class="nh-outputs"><article><span class="nh-output-icon">'+icons.food+'</span><div><small>Apport énergétique</small><b id="nh-out-cal">—</b></div><span class="nh-output-badge">kcal</span></article><article><span class="nh-output-icon">'+icons.chart+'</span><div><small>Repas enregistrés</small><b id="nh-out-meals">—</b></div><span class="nh-output-badge">Aujourd’hui</span></article></div>')}
    ${card('nh-food','Mon parcours repas','<div class="nh-food-intro">Votre parcours alimentaire · 4 jours récents</div><div class="nh-food-timeline" id="nh-food-timeline"></div><div class="nh-food-foot"><button type="button" data-nh="add">'+icons.food+' Ajouter un aliment</button><button type="button" data-nh="journal">Voir mon journal →</button></div>')}
  </div>
  <details class="nh-existing" id="nh-existing"><summary>${icons.chart} Outils Santé et suivi détaillé <span>Humeur · Sommeil · Poids · Suivi repas · IA</span></summary><div id="nh-existing-mount" class="nh-existing-mount"></div></details>`;

  const hero=health.querySelector(':scope > .nx-section-hero');
  if(hero) hero.hidden=true;
  health.insertBefore(dashboard,hero?hero.nextSibling:health.firstChild);
  const mount=dashboard.querySelector('#nh-existing-mount');
  [...health.children].filter(node=>node!==dashboard && node!==hero).forEach(node=>mount.appendChild(node));

  const openTools=(selector)=>{
    const details=dashboard.querySelector('#nh-existing');
    details.open=true;
    requestAnimationFrame(()=>{(selector?document.querySelector(selector):details)?.scrollIntoView({behavior:'smooth',block:'start'});});
  };
  dashboard.addEventListener('click',e=>{
    const b=e.target.closest('[data-nh]'); if(!b) return;
    switch(b.dataset.nh){
      case 'add': openTools('.nx-food-tracker'); break;
      case 'scan': openTools('.nx-food-tracker'); document.querySelector('.nx-ft-actions [data-action="scan"]')?.click(); break;
      case 'tools': openTools(); break;
      case 'ai': document.getElementById('v11-ai-launch')?.click() || document.querySelector('.pulse-nav-links [data-tab="ai"]')?.click(); break;
      case 'journal': document.querySelector('.pulse-nav-links [data-tab="journal"]')?.click(); break;
    }
  });

  const refresh=()=>{
    try{
      if(typeof totals!=='function' || typeof macroGoals!=='function' || typeof current==='undefined') return;
      const t=totals(current), g=macroGoals(), target=Number(state?.settings?.target)||2000;
      const fmt=n=>Math.round(n||0).toLocaleString('fr-FR');
      const put=(id,x)=>{const el=document.getElementById(id); if(el) el.textContent=x;};
      put('nh-kcal',fmt(t.kcal));
      put('nh-goalcal',`${fmt(t.kcal)} / ${fmt(target)}`);
      put('nh-goalpro',`${fmt(t.p)} / ${fmt(g.p)}`);
      put('nh-goalwater','—');
      put('nh-out-cal',fmt(t.kcal));
      put('nh-out-meals',Object.values(dayData(current).meals||{}).filter(m=>Number(m.kcal)>0).length);
      dashboard.querySelector('#nh-donut')?.style.setProperty('--percent',Math.min(100,Math.max(0,t.kcal/target*100))+'%');

      const dates=Array.from({length:7},(_,i)=>{const d=new Date(current+'T12:00:00'); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10);});
      const values=dates.map(d=>totals(d).kcal||0);
      const mx=Math.max(target,...values,1);

      const macros=[['Calories',t.kcal,target,'#a4ebc1','kcal'],['Protéines',t.p,g.p,'#80bfff','g'],['Glucides',t.c,g.c,'#f6c184','g']];
      dashboard.querySelector('#nh-macros').innerHTML = macros.map(([label,value,goal,color,unit])=>`<div class="nh-macro"><i style="background:${color}"></i><div><strong>${label}</strong><small>${fmt(value)} / ${fmt(goal)} ${unit}</small></div><b>${goal>0?Math.round(value/goal*100):0}%</b></div>`).join('');

      dashboard.querySelector('#nh-bars').innerHTML = dates.map((d,i)=>`<div class="nh-bar-col"><span>${values[i]?fmt(values[i]):'—'}</span><div class="nh-bar"><i style="height:${Math.max(values[i]?7:0,values[i]/mx*100)}%"></i></div><small>${new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short'})}</small></div>`).join('');

      const graph=dashboard.querySelector('#nh-trend-graph');
      const trendFoot=dashboard.querySelector('#nh-trend-foot');
      const trendValue=dashboard.querySelector('#nh-trend-value');
      const trendRange=dashboard.querySelector('#nh-trend-range');
      if(graph && trendFoot && trendValue && trendRange){
        const w=280, h=110, px=10, py=16, chartH=68, baseY=py+chartH, chartW=w-px*2;
        const pts=values.map((v,i)=>{
          const x = px + (chartW * (i / Math.max(values.length-1,1)));
          const y = baseY - (v/mx)*chartH;
          return {x,y,v,label:new Date(dates[i]+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short'})};
        });
        const path = pts.map((p,idx)=>`${idx?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
        const area = pts.length ? `M${pts[0].x.toFixed(2)} ${baseY.toFixed(2)} ` + pts.map((p,idx)=>`${idx?'L':'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ` L${pts[pts.length-1].x.toFixed(2)} ${baseY.toFixed(2)} Z` : '';
        const last = pts[pts.length-1] || {x:w-px,y:baseY,v:0};
        graph.innerHTML = `<path d="M${px} ${py}H${w-px} M${px} ${(py+chartH/2).toFixed(2)}H${w-px} M${px} ${baseY}H${w-px}" stroke="currentColor" stroke-opacity=".12" stroke-dasharray="3 5" fill="none"></path><path d="${area}" fill="rgba(74,169,137,.12)"></path><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="${last.x.toFixed(2)}" cy="${last.y.toFixed(2)}" r="4.6" fill="#4ba989" stroke="#ffffff" stroke-width="1.5"></circle>`;
        trendFoot.innerHTML = pts.map(p=>`<span>${p.label}</span>`).join('');
        trendValue.textContent = `${fmt(values.reduce((a,b)=>a+b,0))} kcal`;
        trendRange.textContent = `${pts[0]?.label||'—'} → ${pts[pts.length-1]?.label||'—'}`;
      }

      const foodDates=dates.slice(-4);
      const foodCards=[
        {img:'assets/sections/journal-photo.webp',label:'Bol équilibré',alt:'Bol équilibré avec légumes et protéines'},
        {img:'assets/sections/scanner-photo.webp',label:'Découverte produit',alt:'Produit alimentaire à scanner et comparer'},
        {img:'assets/sections/home-photo.webp',label:'Routine nutrition',alt:'Repas sain pour routine nutritionnelle'},
        {img:'assets/sections/health-photo.webp',label:'Vue rapide',alt:'Smoothie et bien-être'}
      ];
      dashboard.querySelector('#nh-food-timeline').innerHTML = foodDates.map((d,i)=>{const v=totals(d),has=v.kcal>0,c=foodCards[i]||foodCards[0];return `<article class="nh-food-day ${d===current?'nh-food-day-active':''}"><div class="nh-timeline-node ${has?'is-done':''}">${has?'✓':i+1}</div><small>Jour ${i+1}</small><div class="nh-food-photo"><img src="${c.img}" alt="${c.alt}" loading="lazy"></div><b>${c.label}</b><span>${new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} · ${has?fmt(v.kcal)+' kcal':'Aucun repas'}</span></article>`}).join('');
    }catch(err){
      console.warn('Nutrix health dashboard update skipped',err);
    }
  };
  const originalFields=['sum-kcal','sum-target','nx-fit-pro','nx-fit-carb','nx-fit-fat','date-label','meals'];
  let refreshQueued=false;
  const observer=new MutationObserver(()=>{ if(!refreshQueued){ refreshQueued=true; requestAnimationFrame(()=>{refreshQueued=false; refresh();}); } });
  originalFields.forEach(id=>{const el=document.getElementById(id); if(el) observer.observe(el,{subtree:true,childList:true,characterData:true});});
  refresh();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
