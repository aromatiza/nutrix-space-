
/* V12.15 — circular calories card on home with Prot/Fat/Carbs */
(()=>{'use strict';
 const el=id=>document.getElementById(id);
 const fmt=n=>Math.round(Math.max(0,Number(n)||0)).toLocaleString('fr-FR');
 const drawRing=(pct,color='#2f855a',size=178,stroke=14)=>{
   const p=Math.max(0,Math.min(1,Number(pct)||0));
   const r=(size-stroke)/2, c=2*Math.PI*r, off=c*(1-p), h=size/2;
   return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="rgba(23,59,44,.09)" stroke-width="${stroke}"/><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${h} ${h})"/></svg>`;
 };
 const sync=()=>{
   if(typeof totals!=='function') return;
   let t,goal=2000,mac={p:100,f:70,c:250};
   try{t=totals(typeof current==='string'?current:(new Date()).toISOString().slice(0,10));}catch(e){return;}
   try{goal=Math.max(1,Number(state?.settings?.target)||2000); if(typeof macroGoals==='function') mac=macroGoals()||mac;}catch(e){}
   const kcal=Math.max(0,Number(t?.kcal)||0), p=Math.max(0,Number(t?.p)||0), f=Math.max(0,Number(t?.f)||0), c=Math.max(0,Number(t?.c)||0);
   const color=kcal===0?'#d7e2da':(kcal<goal*0.9?'#3b82f6':(kcal<=goal*1.1?'#2f855a':'#e28a22'));
   if(el('nx-home-cal-ring')) el('nx-home-cal-ring').innerHTML=drawRing(kcal/goal,color,178,14);
   if(el('nx-fit-cal')) el('nx-fit-cal').textContent=fmt(kcal);
   if(el('nx-fit-cal-goal')) el('nx-fit-cal-goal').textContent='sur '+fmt(goal)+' kcal';
   if(el('nx-cal-remaining')) el('nx-cal-remaining').textContent = kcal>goal ? 'Objectif dépassé de '+fmt(kcal-goal)+' kcal' : 'Il reste '+fmt(goal-kcal)+' kcal';
   const map=[['pro',p,mac.p||100],['fat',f,mac.f||70],['carb',c,mac.c||250]];
   map.forEach(([name,val,target])=>{
      if(el('nx-home-'+name)) el('nx-home-'+name).textContent=fmt(val)+'g';
      if(el('nx-home-'+name+'-goal')) el('nx-home-'+name+'-goal').textContent='/'+fmt(target)+'g';
      if(el('nx-home-'+name+'-line')) el('nx-home-'+name+'-line').style.backgroundSize=Math.min(100,val/Math.max(1,target)*100)+'% 100%, auto';
   });
 };
 document.addEventListener('DOMContentLoaded',()=>{sync();setInterval(()=>{if(!document.hidden)sync();},1500);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
})();
