/* V12.16 safeguard against the duplicate health calories module */
(()=>{'use strict';const init=()=>{const legacy=document.querySelector('#page-health .nx-legacy-health-calories');if(legacy){legacy.hidden=true;legacy.setAttribute('aria-hidden','true');}};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();})();
