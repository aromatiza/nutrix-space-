/* Nutrix V11.3: compact FR/Darija switch. Original localization owns translations. */
(()=>{'use strict';
const select=document.getElementById('v111-language');const choices=[...document.querySelectorAll('[data-nx-lang]')];
if(!select||choices.length!==2)return;
function sync(){choices.forEach(button=>{const selected=button.dataset.nxLang===select.value;button.setAttribute('aria-pressed',String(selected));});}
choices.forEach(button=>button.addEventListener('click',()=>{if(select.value!==button.dataset.nxLang){select.value=button.dataset.nxLang;select.dispatchEvent(new Event('change',{bubbles:true}));}sync();}));
select.addEventListener('change',sync);sync();
})();
