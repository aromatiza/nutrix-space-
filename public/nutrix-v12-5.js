
(()=>{
'use strict';
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
ready(()=>{
  const compareFocus = document.getElementById('nutri-focus-compare');
  compareFocus?.addEventListener('click',()=>setTimeout(()=>document.getElementById('nutri-compare-card')?.scrollIntoView({behavior:'smooth',block:'center'}),160));
  const launcher = document.getElementById('v11-ai-launch');
  if(launcher) launcher.title = 'Assistant vocal & visuel';
  const top = document.querySelector('.v11-ai-top strong');
  if(top) top.textContent = 'Nutrix Voice Assistant';
  const sub = document.querySelector('.v11-ai-top small');
  if(sub) sub.textContent = 'Voice · Image · Texte';
  const drawer = document.getElementById('v11-ai-drawer');
  if(drawer) drawer.classList.add('v12-ai-fullscreen');
});
})();
