/* Nutrix V11.2: accessibility + clean branding; all legacy business logic untouched. */
(()=>{'use strict';
const name='Nutrix';
document.title=document.title.replace(/Space Daily/gi,name).replace(/V11\.1/i,'V11.2');
const themeMeta=document.querySelector('meta[name="theme-color"]');
function syncTheme(){if(!themeMeta)return;const mode=document.documentElement.getAttribute('data-theme')||document.body.getAttribute('data-theme')||document.documentElement.getAttribute('data-mode');const dark=mode==='dark'||(!mode||mode==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches;themeMeta.content=dark?'#10241D':'#126B52';}
syncTheme();new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-mode']});
const launch=document.getElementById('v11-ai-launch');if(launch){launch.title='Assistant Nutrix';launch.setAttribute('aria-label','Ouvrir l’assistant Nutrix');}
const languages=document.getElementById('v111-language');if(languages){languages.title='Langue / اللغة';}
})();