/* V13 incremental UX and journal integration. Never deletes legacy stored totals. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),core=window.NutrixV13Core;
 const ledgerKey='nutrix-premium-food-journal-v13';
 let ledger={};try{const raw=JSON.parse(localStorage.getItem(ledgerKey)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))ledger=raw;}catch{}
 const saveLedger=()=>{try{localStorage.setItem(ledgerKey,JSON.stringify(ledger));}catch{}};
 const escape=s=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const val=n=>{let v=Number(n);return Number.isFinite(v)&&v>=0?v:0};
 const today=()=>typeof current==='string'?current:new Date().toISOString().slice(0,10);
 function goalUI(){const target=document.getElementById('nx-score-target');if(!target)return;const prev=document.getElementById('nx-v13-goal');if(prev)return;
  const row=document.createElement('label');row.className='nx-v13-settings';row.textContent='Objectif du score';const input=document.createElement('input');input.id='nx-v13-goal';input.type='number';input.min='40';input.max='100';input.step='1';input.value=String(Math.max(40,Math.min(100,Number(localStorage.getItem('nutrix-v13-score-goal'))||85)));input.setAttribute('aria-label','Objectif du score');row.append(input);row.append(' /100');target.parentElement?.parentElement?.append(row);
  input.addEventListener('change',()=>{input.value=String(Math.max(40,Math.min(100,Number(input.value)||85)));localStorage.setItem('nutrix-v13-score-goal',input.value);scoreUI();});
 }
 function scoreUI(){if(typeof totals!=='function'||typeof state==='undefined')return;let totalsToday;try{totalsToday=totals(today());}catch{return;}
 const week=typeof weekOf==='function'?weekOf(today()):[today()];const daysLogged=week.filter(d=>totals(d).kcal>0).length;
 const logged=(Object.values(dayData(today()).meals||{})).filter(m=>val(m.kcal)>0).length;
 const result=core.dailyScore({...totalsToday,target:state.settings.target,pGoal:typeof macroGoals==='function'?macroGoals().p:100,loggedMeals:logged,daysLoggedWeek:daysLogged});
 const goal=Math.max(40,Math.min(100,Number(localStorage.getItem('nutrix-v13-score-goal'))||85));
 if($('nx-score-target'))$('nx-score-target').textContent=String(goal);
 if($('nx-fit-score'))$('nx-fit-score').innerHTML=String(result?.score??0)+'<small>/100</small>';
 if($('nx-fit-score-line'))$('nx-fit-score-line').style.width=String(result?Math.min(100,result.score/goal*100):0)+'%';
 if($('nx-fit-score-foot'))$('nx-fit-score-foot').textContent=!result?'Ajoute ton premier repas pour commencer 🌱':result.score>=goal?'🎉 Objectif atteint !':result.score>=goal-15?'Excellent progrès ! Continue ✨':'Chaque repas suivi te rapproche de ton objectif';
 const scoresKey='nutrix-v13-score-history';try{const history=JSON.parse(localStorage.getItem(scoresKey)||'{}');if(result){history[today()]=result.score;localStorage.setItem(scoresKey,JSON.stringify(history));}const best=Math.max(0,...Object.values(history).map(Number).filter(Number.isFinite));if($('nx-score-best'))$('nx-score-best').textContent=best?'Record personnel : '+best+'/100':'Ton premier score t’attend';}catch{}
 }
 function entries(){return ledger[today()]||[];}
 function logAdded(meal,item){const date=today(),list=ledger[date]||(ledger[date]=[]);const id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);list.push({id,meal,name:String(item.name||'Aliment').slice(0,120),grams:val(item.grams)||100,kcal:val(item.kcal),p:val(item.p),c:val(item.c),f:val(item.f),time:Date.now()});saveLedger();renderJournal();}
 function adjustMeal(meal,item,factor){if(typeof writeDay!=='function')return;const m=writeDay(today()).meals;const target=m[meal]||(m[meal]={});for(const k of ['kcal','p','c','f'])target[k]=String(Math.round(Math.max(0,val(target[k])+val(item[k])*factor)*10)/10);save();renderMeals();updateSummary();renderJournal();}
 function renderJournal(){const cards=document.getElementById('meals');if(!cards)return;
  cards.querySelectorAll('.nx-v13-journal').forEach(n=>n.remove());const list=entries();const groups=[['b','Petit-déjeuner'],['l','Déjeuner'],['d','Dîner'],['s','Collation']];const mealCards=[...cards.children];
  groups.forEach(([id,label],index)=>{const data=list.filter(item=>item.meal===id);if(!data.length)return;let host=mealCards[index];if(!host){host=document.createElement('div');host.className='card';host.innerHTML='<h3>'+label+'</h3>';cards.append(host);}
  const section=document.createElement('section');section.className='nx-v13-journal';section.innerHTML='<div class="nx-v13-journal-heading">Aliments enregistrés · '+escape(label)+'</div>'+data.map(x=>'<div class="nx-v13-item"><div><strong>'+escape(x.name)+'</strong><small>'+Math.round(x.grams)+' g · '+Math.round(x.kcal)+' kcal</small></div><button type="button" data-nx-v13-edit="'+escape(x.id)+'" aria-label="Modifier '+escape(x.name)+'">Modifier</button><button type="button" data-nx-v13-duplicate="'+escape(x.id)+'" aria-label="Dupliquer '+escape(x.name)+'">Dupliquer</button><button type="button" data-nx-v13-delete="'+escape(x.id)+'" aria-label="Supprimer '+escape(x.name)+'">Supprimer</button></div>').join('');host.append(section);
  });
 }
 function listenJournal(){document.addEventListener('click',event=>{const del=event.target.closest('[data-nx-v13-delete]'),edit=event.target.closest('[data-nx-v13-edit]'),dup=event.target.closest('[data-nx-v13-duplicate]');const btn=del||edit||dup;if(!btn)return;const list=entries(),id=btn.dataset.nxV13Delete||btn.dataset.nxV13Edit||btn.dataset.nxV13Duplicate,idx=list.findIndex(x=>x.id===id);if(idx<0)return;const old=list[idx];
  if(dup){const copy={...old,id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),time:Date.now()};list.push(copy);saveLedger();adjustMeal(copy.meal,copy,1);return;}
  if(del){if(!confirm('Supprimer cet aliment du repas ?'))return;list.splice(idx,1);saveLedger();adjustMeal(old.meal,old,-1);return;}
  const raw=prompt('Nouvelle quantité en grammes',String(old.grams));if(raw===null)return;const newGrams=Number(String(raw).replace(',','.'));if(!Number.isFinite(newGrams)||newGrams<=0||newGrams>10000){alert('Quantité invalide');return;}
  const updated={...old,grams:newGrams};const ratio=newGrams/old.grams;for(const k of ['kcal','p','c','f'])updated[k]=Math.round(val(old[k])*ratio*10)/10;
  adjustMeal(old.meal,old,-1);list[idx]=updated;saveLedger();adjustMeal(old.meal,updated,1);
 });}
 // Hook into existing validated addFood; legacy totals stay the source of truth.
 function installHooks(){if(typeof addFood==='function' && !addFood.__v13){const existing=addFood;window.addFood=function(food){const grams=val($('food-grams')?.value)||100,meal=$('food-meal')?.value||'l';const d=core.serving(food,grams);existing(food);logAdded(meal,{...d,name:food.name,grams});};window.addFood.__v13=true;}
  if(typeof addValues==='function'&&!addValues.__v13){const existing=addValues;window.addValues=function(meal,kcal,p,c,f){existing(meal,kcal,p,c,f);logAdded(meal,{name:'Produit ou repas analysé',grams:100,kcal,p,c,f});};window.addValues.__v13=true;}
  if(typeof renderMeals==='function'&&!renderMeals.__v13){const original=renderMeals;window.renderMeals=function(...args){const out=original(...args);renderJournal();return out};window.renderMeals.__v13=true;}
 }
 document.addEventListener('DOMContentLoaded',()=>{goalUI();installHooks();listenJournal();renderJournal();scoreUI();document.addEventListener('change',e=>{if(e.target.matches('[data-meal],[data-setting],#s-target'))scoreUI()});document.querySelectorAll('[data-shift]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{renderJournal();scoreUI()},100)));setInterval(()=>{if(!document.hidden)scoreUI()},3000);});
})();
