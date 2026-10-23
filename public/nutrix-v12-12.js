/* Nutrix V12.12: Goal-centered score and calorie home; macros only in Santé */
(()=>{'use strict';
 const el=id=>document.getElementById(id);
 const fmt=n=>Math.round(Math.max(0,Number(n)||0)).toLocaleString('fr-FR');
 const safe=n=>Math.max(0,Number(n)||0);
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const historyKey='nutrix-motivation-score-v1212';
 function update(){
  if(typeof totals!=='function')return;
  const date=today();let t;try{t=totals(date)}catch{return}if(!t)return;
  let goal=2000,macros={p:100,f:70,c:250};
  try{goal=safe(state.settings.target)||2000;if(typeof macroGoals==='function')macros=macroGoals()}catch{}
  [['cal','kcal',goal,' kcal'],['pro','p',macros.p||100,' g'],['fat','f',macros.f||70,' g'],['carb','c',macros.c||250,' g']].forEach(([name,key,target,unit])=>{
   const value=safe(t[key]);if(el('nx-fit-'+name))el('nx-fit-'+name).textContent=fmt(value);
   if(el('nx-fit-'+name+'-goal'))el('nx-fit-'+name+'-goal').textContent=(name==='cal'?'sur ':'/ ')+fmt(target)+unit;
   if(el('nx-fit-'+name+'-line'))el('nx-fit-'+name+'-line').style.width=Math.min(100,value/Math.max(1,target)*100)+'%';
  });
  if(el('nx-cal-remaining'))el('nx-cal-remaining').textContent=t.kcal>goal?'Objectif dépassé de '+fmt(t.kcal-goal)+' kcal':'Il reste '+fmt(goal-t.kcal)+' kcal';
  let result=null;try{if(typeof computeScore==='function')result=computeScore(date)}catch{}
  const value=result?Math.min(100,Math.max(0,Math.round(result.score))):null;
  const target=85;
  if(el('nx-fit-score'))el('nx-fit-score').innerHTML=(value===null?'0':fmt(value))+'<small>/100</small>';
  if(el('nx-fit-score-line'))el('nx-fit-score-line').style.width=(value===null?0:Math.min(100,value/target*100))+'%';
  if(el('nx-fit-score-foot'))el('nx-fit-score-foot').textContent=value===null?'Ajoute un repas pour démarrer 🌱':value>=target?'🎉 Objectif atteint ! Continue comme ça !':value>=65?'Super progrès ! Encore '+(target-value)+' points pour ton objectif ✨':'Continue, chaque effort te rapproche de ton objectif 💪';
  // Keep a durable daily score record, recomputed from locally saved meals whenever the day changes.
  try{
   const data=JSON.parse(localStorage.getItem(historyKey)||'{}');
   if(value!==null && data[date]!==value){data[date]=value;const keys=Object.keys(data).sort();keys.slice(0,-90).forEach(k=>delete data[k]);localStorage.setItem(historyKey,JSON.stringify(data));}
   const best=Math.max(0,...Object.values(data).filter(v=>Number.isFinite(v)));
   if(el('nx-score-best'))el('nx-score-best').textContent=best?'Meilleur score enregistré : '+best+'/100':'Ton premier score t’attend';
  }catch{}
 }
 document.addEventListener('DOMContentLoaded',()=>{update();setInterval(()=>{if(!document.hidden)update()},1500)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
})();
