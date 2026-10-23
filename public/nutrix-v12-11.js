/* Nutrix 12.11 — Fitness-style live dashboard (same nutrition data as journal) */
(()=>{'use strict';
 const el=id=>document.getElementById('nx-fit-'+id);
 const fmt=n=>Math.round(Math.max(0,Number(n)||0)).toLocaleString('fr-FR');
 const safe=n=>Math.max(0,Number(n)||0);
 const dateNow=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 function update(){
  if(typeof totals!=='function')return;
  let t;try{t=totals(dateNow())}catch{return}
  if(!t)return;
  let goal=2000,macros={p:100,f:70,c:250};
  try{goal=safe(state.settings.target)||2000;if(typeof macroGoals==='function')macros=macroGoals()}catch{}
  const data=[['cal','kcal',goal],['pro','p',macros.p||100],['fat','f',macros.f||70],['carb','c',macros.c||250]];
  data.forEach(([name,key,target])=>{
   const value=safe(t[key]); if(el(name))el(name).textContent=fmt(value);
   if(el(name+'-goal'))el(name+'-goal').textContent='/ '+fmt(target)+(name==='cal'?' kcal':' g');
   if(el(name+'-line'))el(name+'-line').style.width=Math.min(100,value/Math.max(1,target)*100)+'%';
  });
  try{const result=typeof computeScore==='function'?computeScore(dateNow()):null;
   if(el('score'))el('score').innerHTML=result?fmt(result.score)+'<small>/100</small>':'—<small>/100</small>';
   if(el('score-foot'))el('score-foot').textContent=result?(result.score>=75?'Excellent progrès':result.score>=50?'Bon progrès':'Continuez vos efforts'):'Ajoutez un repas';
  }catch{}
 }
 document.addEventListener('DOMContentLoaded',()=>{update();setInterval(()=>{if(!document.hidden)update()},1200)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
})();
