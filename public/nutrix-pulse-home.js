/* Visual-only adapter: reads already-computed Nutrix DOM metrics; no mock records, no API changes. */
(()=>{'use strict';
 const menu=document.getElementById('pulse-menu-btn');const links=document.getElementById('pulse-nav-links');
 if(menu&&links){menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});links.addEventListener('click',e=>{if(e.target.closest('[data-tab]')){links.classList.remove('open');menu.setAttribute('aria-expanded','false');}});}
 const pairs=[['nx-fit-score','pulse-score'],['nx-fit-cal','pulse-calories'],['nx-home-pro','pulse-protein'],['nx-fit-cal-goal','pulse-goal']];
 const sync=()=>pairs.forEach(([source,target])=>{const a=document.getElementById(source),b=document.getElementById(target);if(!a||!b)return;let value=a.textContent.trim();if(source==='nx-fit-score')value=value.replace(/\s*\/100.*/,'').trim();if(source==='nx-fit-cal-goal'){const found=value.match(/[\d\s.,]+/);value=found?found[0].trim():'—';}if(source==='nx-home-pro')value=value.replace(/g\s*$/i,'');if(value)b.textContent=value;});
 sync();const sources=pairs.map(([id])=>document.getElementById(id)).filter(Boolean);if(sources.length){const observer=new MutationObserver(sync);sources.forEach(el=>observer.observe(el,{childList:true,characterData:true,subtree:true}));}
})();

/* Bind template metric rings/bars only to existing computed Nutrix DOM. */
(()=>{'use strict';
const grab=(id)=>document.getElementById(id)?.textContent||'';
const num=(v)=>{const m=String(v).replace(/\s/g,'').match(/-?\d+(?:[.,]\d+)?/);return m?Number(m[0].replace(',','.')):NaN;};
const ids=['nx-fit-score','nx-fit-cal','nx-fit-cal-goal','nx-home-pro','nx-home-pro-goal','nx-home-fat','nx-home-fat-goal','nx-home-carb','nx-home-carb-goal'];
const put=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=Number.isFinite(value)?Math.round(value).toLocaleString('fr-FR'):'—'};
const ring=(id,value,goal)=>{const el=document.getElementById(id);if(el)el.style.setProperty('--pct',String(Number.isFinite(value)&&Number.isFinite(goal)&&goal>0?Math.max(0,Math.min(100,value/goal*100)):0));};
function update(){const [score,cal,goal,pro,proGoal,fat,fatGoal,carb,carbGoal]=ids.map(i=>num(grab(i)));
put('pulse-score',score);put('pulse-calories',cal);put('pulse-goal',goal);put('pulse-protein',pro);put('pulse-protein-goal',proGoal);put('pulse-fat',fat);put('pulse-fat-goal',fatGoal);put('pulse-carb',carb);put('pulse-carb-goal',carbGoal);
ring('pulse-ring-score',score,100);ring('pulse-ring-cal',cal,goal);ring('pulse-ring-pro',pro,proGoal);
for(const [key,value,total] of [['fat',fat,fatGoal],['carb',carb,carbGoal]]){const el=document.getElementById('pulse-'+key+'-bar');if(el)el.style.width=(Number.isFinite(value)&&Number.isFinite(total)&&total>0?Math.max(0,Math.min(100,value/total*100)):0)+'%';}}
let queued=false;const schedule=()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;update()})}};
const nodes=ids.map(i=>document.getElementById(i)).filter(Boolean);if(nodes.length){const observer=new MutationObserver(schedule);nodes.forEach(n=>observer.observe(n,{childList:true,characterData:true,subtree:true}));}update();
})();
