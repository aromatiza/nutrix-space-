/* Dashboard display patch: robust initial render; core scoring remains in nutrix-v12-12.js. */
(()=>{'use strict';
 const boot=()=>{
  const score=document.getElementById('nx-fit-score');
  if(score && (!score.textContent.trim() || score.textContent.includes('—')))score.innerHTML='0<small>/100</small>';
  const launcher=document.getElementById('health-launchers');
  if(launcher&&!launcher.textContent.trim()&&!launcher.querySelector('button,a'))launcher.hidden=true;
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
