/* Functional helpers for Nutrix Premium; Node-testable and browser-compatible. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NutrixV13Core=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{'use strict';
 const valid=n=>{const v=Number(n);return Number.isFinite(v)&&v>0?v:0;};
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function dailyScore(input={}){const kcal=valid(input.kcal),goal=valid(input.target)||2000,logged=Number(input.loggedMeals)||0,days=clamp(Number(input.daysLoggedWeek)||0,0,7),protein=valid(input.p),pgoal=valid(input.pGoal)||100;
  if(!kcal&&!logged)return null;
  const consistency=clamp(days/7*100,0,100);
  const logScore=clamp(logged/3*100,0,100);
  const ratio=kcal/goal;
  const balance=clamp(100-Math.abs(ratio-1)*65,35,100);
  const proteinScore=protein?clamp(protein/pgoal*100,25,100):40;
  return {score:Math.round(.35*consistency+.30*logScore+.25*balance+.10*proteinScore),parts:[{label:'Régularité',w:35,s:consistency},{label:'Repas suivis',w:30,s:logScore},{label:'Équilibre',w:25,s:balance},{label:'Protéines',w:10,s:proteinScore}]};
 }
 function aggregate(items){return items.reduce((a,x)=>{for(const k of ['kcal','p','c','f'])a[k]+=valid(x[k]);return a;},{kcal:0,p:0,c:0,f:0});}
 function serving(product,grams){const f=valid(grams)/100;return Object.fromEntries(['kcal','p','c','f'].map(k=>[k,Math.round(valid(product[k])*f*10)/10]));}
 return {dailyScore,aggregate,serving,clamp};
});
