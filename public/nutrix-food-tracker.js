/* V6: presentation-only enhancement. Existing Nutrix event handlers are retained. */
(()=>{'use strict';
const icon=(paths)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const icons={camera:icon('<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="3.2"/>'),scan:icon('<path d="M7 3H4v5m13-5h3v5M4 16v5h4m12-5v5h-4M4 12h16"/>'),ai:icon('<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>'),search:icon('<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>')};
function initialize(){
 const health=document.getElementById('page-health'),input=document.getElementById('food-q'),addButton=document.getElementById('food-search-btn'),results=document.getElementById('food-results'),frequent=document.getElementById('frequent-list');
 if(!health||!input||!addButton||!results||!frequent||document.querySelector('.nx-food-tracker'))return;
 const block=input.closest('.block'),card=block?.querySelector(':scope > .card');if(!card)return;
 block.classList.add('nx-food-tracker');
 const head=document.createElement('div');head.className='nx-ft-header';head.innerHTML=`<div><span class="nx-ft-kicker">NUTRIX · SUIVI DES REPAS</span><h2>Ajouter un aliment</h2><p>Suivez votre alimentation en toute simplicité.</p></div><div class="nx-ft-actions"><button class="nx-ft-icon" type="button" data-action="scan" aria-label="Scanner un code-barres" title="Scanner">${icons.scan}</button><button class="nx-ft-icon" type="button" data-action="photo" aria-label="Analyser une photo" title="Photo IA">${icons.camera}</button><button class="nx-ft-icon" type="button" data-action="ai" aria-label="Ouvrir l'assistant IA" title="Space AI">${icons.ai}</button></div>`;
 card.prepend(head);
 const searchRow=input.closest('.form-row');const search=document.createElement('div');search.className='nx-ft-search';search.innerHTML=icons.search;search.append(input,addButton);head.after(search);searchRow?.remove();input.placeholder='Aliment, marque ou code-barres…';input.setAttribute('aria-label','Aliment, marque ou code-barres');
 const barcode=document.getElementById('barcode-q')?.closest('.form-row');if(barcode){barcode.classList.add('nx-ft-barcode');barcode.hidden=true;search.after(barcode)}
 const tabs=document.createElement('div');tabs.className='nx-ft-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Catégories alimentaires');
 const choices=[['results','Résultats'],['frequent','Fréquents']];choices.forEach(([id,label],i)=>{const b=document.createElement('button');b.type='button';b.className='nx-ft-tab';b.setAttribute('role','tab');b.dataset.pane=id;b.setAttribute('aria-selected',String(i===0));b.textContent=label;tabs.append(b)});
 const resPane=document.createElement('div');resPane.className='nx-ft-pane';resPane.dataset.pane='results';resPane.setAttribute('role','tabpanel');resPane.append(results);
 const freqPane=document.createElement('div');freqPane.className='nx-ft-pane';freqPane.dataset.pane='frequent';freqPane.setAttribute('role','tabpanel');freqPane.hidden=true;freqPane.append(frequent);
 const status=document.getElementById('food-msg');status?.classList.add('nx-ft-status');
 const portion=document.getElementById('food-grams')?.closest('.inline');portion?.classList.add('nx-ft-portion');
 const anchor=card.querySelector('.ai-nutrition-panel');if(anchor){anchor.classList.add('nx-ft-ai-panel');anchor.hidden=true;}
 if(status)status.before(tabs,resPane,freqPane);else card.append(tabs,resPane,freqPane);
 function openPane(pane){tabs.querySelectorAll('[data-pane]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.pane===pane)));resPane.hidden=pane!=='results';freqPane.hidden=pane!=='frequent'}
 tabs.addEventListener('click',e=>{const tab=e.target.closest('[data-pane]');if(tab)openPane(tab.dataset.pane)});
 addButton.addEventListener('click',()=>openPane('results'));
 const barcodeBtn=document.getElementById('barcode-btn');barcodeBtn?.addEventListener('click',()=>openPane('results'));
 head.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;if(action==='scan'){if(barcode){barcode.hidden=false;barcode.scrollIntoView({behavior:'smooth',block:'nearest'})}document.getElementById('scan-btn')?.click();}else if(action==='photo'){if(anchor){anchor.hidden=false;anchor.scrollIntoView({behavior:'smooth',block:'nearest'})}document.getElementById('ai-product-photo')?.click();}else if(action==='ai'){const launch=document.getElementById('v11-ai-launch');if(launch)launch.click();else document.querySelector('.pulse-nav-links .tab[data-tab="ai"]')?.click()}});
 if(anchor){const file=document.getElementById('ai-product-photo');file?.addEventListener('change',()=>{anchor.hidden=false})}
 const codeInput=document.getElementById('barcode-q');input.addEventListener('input',()=>{if(/^\d{8,14}$/.test(input.value.replace(/\s/g,''))){if(barcode)barcode.hidden=false;if(codeInput)codeInput.value=input.value.replace(/\s/g,'')}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
