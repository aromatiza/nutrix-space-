// V12.13: keep a visible score placeholder until the first food entry.
(()=>{document.addEventListener('DOMContentLoaded',()=>{const s=document.getElementById('nx-fit-score');if(s&&s.textContent.trim().startsWith('—'))s.innerHTML='0<small>/100</small>';});})();
