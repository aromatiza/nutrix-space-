/* Nutrix Studio V9 extension — five guided tools with photo / scan / manual entry and AI help. */
(()=>{'use strict';
const root=document.getElementById('ns-workspace'), tabs=document.getElementById('ns-tabs');if(!root||!tabs)return;
const STORE='nutrix-studio-v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}};
let db={fridge:[],restaurant:[],...read()};if(!Array.isArray(db.fridge))db.fridge=[];if(!Array.isArray(db.restaurant))db.restaurant=[];
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(db))}catch{}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(n)?Number(n.toFixed(1)).toLocaleString('fr-FR'):'—';
const num=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)&&n>=0?n:null};
const date=()=>typeof current==='string'?current:new Date().toISOString().slice(0,10);
const input=id=>document.getElementById(id);
const on=(id,event,fn)=>input(id)?.addEventListener(event,fn);
const message=(s,cls='')=>`<div class="ns-message ${cls}">${s}</div>`;
const button=(txt,id,cls='')=>`<button type="button" class="ns-btn ${cls}" id="${id}">${txt}</button>`;
const field=(label,id,type='text',extra='')=>`<label class="ns-field"><span>${label}</span><input id="${id}" type="${type}" ${extra}></label>`;
const select=(label,id,options)=>`<label class="ns-field"><span>${label}</span><select id="${id}">${options}</select></label>`;
const fact=(label,value,unit='')=>`<div class="ns-stat"><small>${esc(label)}</small><strong>${value==null?'—':esc(fmt(value))}${value==null?'':` ${unit}`}</strong></div>`;
const card=(body,title,note='')=>`<article class="ns-card"><div class="ns-card-head"><h3>${title}</h3>${note?`<small>${note}</small>`:''}</div>${body}</article>`;
function foods(){
  const a=[...(Array.isArray(state.recent)?state.recent:[]),...(Array.isArray(state.customFoods)?state.customFoods:[])];
  const keys=new Set();
  return a.filter(f=>{const k=String(f.name||'').trim().toLowerCase();if(!k||keys.has(k))return false;keys.add(k);return true})
    .map(f=>({name:String(f.name),kcal:num(f.kcal),p:num(f.p),c:num(f.c),f:num(f.f),image:f.image||'',ingredients:f.ingredients||'',allergens:f.allergens||'',score:f.score||f.nutriscore||''}));
}
const options=()=>foods().map((f,i)=>`<option value="${i}">${esc(f.name)}</option>`).join('');
const foodFrom=id=>foods()[Number(input(id)?.value)];
function totalsFor(items){const r={kcal:0,p:0,c:0,f:0},missing=new Set();for(const {food,grams} of items){for(const key of Object.keys(r)){if(food[key]==null)missing.add(key);else r[key]+=food[key]*grams/100}}for(const key of missing)r[key]=null;return r}
function statsHtml(r){return `<div class="ns-stats">${fact('Calories',r.kcal,'kcal')}${fact('Protéines',r.p,'g')}${fact('Glucides',r.c,'g')}${fact('Lipides',r.f,'g')}</div>`}
const studioState={};
function goToScanner(){document.querySelector('.tab[data-tab="nutri"]')?.click();setTimeout(()=>document.getElementById('nutri-scan-btn')?.click(),120)}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('read_error'));r.readAsDataURL(file)})}
async function describeImage(dataUrl, language='fr'){try{const r=await fetch('/api/ai/photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:dataUrl,language})});if(!r.ok)return '';const j=await r.json();return String(j.answer||'').trim()}catch{return ''}}
async function askAI(question, context){
  try{
    const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context,language:'fr'})});
    if(!r.ok) throw new Error('ai_unavailable');
    const j=await r.json();
    return String(j.answer||'').trim() || 'Réponse vide.';
  }catch{return ''}
}
function toolMeta(tool){
  return {
    plate:{title:'Composer mon assiette',desc:'Assemblez vos aliments enregistrés et obtenez le bilan nutritionnel de votre repas.',tag:'Assiette',image:'assets/sections/home-photo.webp',accent:'Assiette équilibrée'},
    fridge:{title:'Mon frigo',desc:'Suivez votre inventaire, repérez les dates limites proches et préparez vos courses.',tag:'Frigo',image:'assets/sections/journal-photo.webp',accent:'Anti-gaspillage'},
    swap:{title:'Comparer deux aliments',desc:'Choisissez le meilleur des deux selon votre priorité : protéines, calories, sucres…',tag:'Comparaison',image:'assets/sections/health-photo.webp',accent:'Meilleur choix'},
    intelligence:{title:'Comprendre un aliment',desc:'Une lecture claire de ses valeurs nutritionnelles, sans rien inventer.',tag:'Analyse',image:'assets/sections/scanner-photo.webp',accent:'Repères utiles'},
    restaurant:{title:'Choisir au restaurant',desc:'Comparez les plats d’un menu pour faire un choix plus équilibré.',tag:'Restaurant',image:'assets/sections/coach-photo.webp',accent:'Choix guidé'}
  }[tool];
}
function sectionShell(tool, manualHtml, guideHtml=''){
  const m=toolMeta(tool);
  return `
  <div class="ns-tool-head"><div class="ns-section-head"><h3>${m.title}</h3><p>${m.desc}</p></div></div>
  <div class="ns-tool-grid">
    <div class="ns-main-stack">
      <article class="ns-card ns-entry-card">
        <div class="ns-cover" style="--cover:url('${m.image}')">
          <div class="ns-cover-copy"><span class="ns-cover-tag">${m.tag}</span><h3>${m.title}</h3><p>${m.desc}</p><div class="ns-cover-pills"><span>Photo</span><span>Scan</span><span>Saisie</span></div></div>
          <div class="ns-cover-media"><img src="${m.image}" alt="${m.title}" loading="lazy"></div>
        </div>
        <div class="ns-entry-modes">
          <button type="button" class="ns-mode-btn" data-ns-photo="${tool}"><span class="ns-ico"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></span><b>Photo</b><small>Importer une image</small></button>
          <button type="button" class="ns-mode-btn" data-ns-scan="${tool}"><span class="ns-ico"><svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m8 0h3a1 1 0 0 0 1-1v-3M7 12h10"/></svg></span><b>Scan</b><small>Scanner un code-barres</small></button>
          <button type="button" class="ns-mode-btn" data-ns-manual="${tool}"><span class="ns-ico"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></span><b>Saisie</b><small>Remplir à la main</small></button>
        </div>
        <input type="file" id="ns-photo-${tool}" accept="image/jpeg,image/png,image/webp" hidden>
        <div id="ns-photo-preview-${tool}"></div>
      </article>
      ${manualHtml}
    </div>
    <aside class="ns-side-stack">
      <article class="ns-card ns-ai-card">
        <div class="ns-card-head"><h3>Demander à Nutrix AI</h3><small>Conseil personnalisé pour cet outil</small></div>
        <div class="ns-ai-summary"><span>${m.accent}</span><strong>Ajoutez une photo ou des informations, l’assistant les analyse pour vous.</strong></div>
        <label class="ns-field"><span>Votre question (facultatif)</span><textarea id="ns-ai-note-${tool}" rows="4" placeholder="Ex. Quelle est la meilleure option pour mon objectif ?"></textarea></label>
        <div class="ns-ai-actions"><button type="button" class="ns-btn primary" id="ns-ai-run-${tool}">Analyser</button><button type="button" class="ns-btn" id="ns-ai-open-${tool}">Ouvrir le chat</button></div>
        <div id="ns-ai-result-${tool}">${message('Ajoutez une photo, scannez un produit ou saisissez les données, puis lancez l’analyse.','soft')}</div>
      </article>
      <article class="ns-card ns-guide-card"><div class="ns-card-head"><h3>Comment ça marche</h3><small>En 3 gestes</small></div>${guideHtml || message('Photo pour montrer, Scan pour identifier un produit, Saisie pour compléter les données.','soft')}</article>
    </aside>
  </div>`;
}
function bindSectionControls(tool, manualTarget, buildQuestion, fallbackAnswer){
  const file=input(`ns-photo-${tool}`), preview=input(`ns-photo-preview-${tool}`), note=input(`ns-ai-note-${tool}`), result=input(`ns-ai-result-${tool}`);
  studioState[tool]=studioState[tool]||{};
  document.querySelector(`[data-ns-photo="${tool}"]`)?.addEventListener('click',()=>file?.click());
  document.querySelector(`[data-ns-scan="${tool}"]`)?.addEventListener('click',goToScanner);
  document.querySelector(`[data-ns-manual="${tool}"]`)?.addEventListener('click',()=>document.getElementById(manualTarget)?.scrollIntoView({behavior:'smooth',block:'start'}));
  file?.addEventListener('change',async()=>{
    const f=file.files?.[0]; if(!f) return;
    const dataUrl=await fileToDataUrl(f); studioState[tool].photo={name:f.name,dataUrl};
    preview.innerHTML=`<div class="ns-photo-inline"><img src="${dataUrl}" alt="Aperçu" loading="lazy"><div><strong>${esc(f.name)}</strong><small>Image prête pour l’assistance AI.</small></div></div>`;
  });
  input(`ns-ai-open-${tool}`)?.addEventListener('click',()=>{document.querySelector('.tab[data-tab="ai"]')?.click()});
  input(`ns-ai-run-${tool}`)?.addEventListener('click',async()=>{
    result.innerHTML=message('Analyse en cours…','soft');
    let photoText='';
    if(studioState[tool]?.photo?.dataUrl) photoText=await describeImage(studioState[tool].photo.dataUrl);
    const payload=buildQuestion({note:note?.value.trim()||'',photoText});
    const answer=await askAI(payload.question,payload.context);
    result.innerHTML=answer?`<div class="ns-ai-answer">${answer.replace(/\n/g,'<br>')}</div>`:message(fallbackAnswer({note:note?.value.trim()||'',photoText}),'soft');
  });
}

function renderPlate(){
  const manual=card(`<div id="ns-manual-plate"></div><div class="ns-row">${select('Aliment','ns-plate-food',options())}${field('Quantité (g)','ns-plate-grams','number','min="1" max="2000" step="1" value="100"')}</div>${button('Ajouter à mon assiette','ns-plate-add','primary')}<div id="ns-plate-list" class="ns-list"></div>`,`Créer mon assiette`,'Base : valeurs pour 100 g')+
               card('<div class="ns-plate-visual"><span>🥗</span><strong>Votre assiette</strong><small>Composition personnalisée</small></div><div id="ns-plate-total"></div>','Bilan de l’assiette');
  const guide='<ul class="ns-tips"><li>Photo : montrez votre assiette ou un ingrédient.</li><li>Scan : lisez le code-barres d’un produit emballé.</li><li>Saisie : choisissez vos aliments enregistrés pour un calcul plus précis.</li></ul>';
  root.innerHTML=sectionShell('plate',manual,guide);
  let entries=[];
  function update(){input('ns-plate-list').innerHTML=entries.map((x,i)=>`<div class="ns-list-item"><span>${esc(x.food.name)} <small>${x.grams} g</small></span><button data-remove="${i}" aria-label="Retirer">×</button></div>`).join('')||message('Choisissez un aliment pour commencer.');input('ns-plate-total').innerHTML=entries.length?statsHtml(totalsFor(entries))+message('Calcul basé sur les valeurs du journal. Une valeur absente reste « — ».','soft'):message('Aucune valeur calculée tant que l’assiette est vide.');}
  on('ns-plate-add','click',()=>{const f=foodFrom('ns-plate-food'),g=num(input('ns-plate-grams').value);if(!f||!g||g>2000)return alert('Choisissez un aliment et une quantité entre 1 et 2 000 g.');entries.push({food:f,grams:g});update()});
  on('ns-plate-list','click',e=>{const b=e.target.closest('[data-remove]');if(b){entries.splice(Number(b.dataset.remove),1);update()}});update();
  bindSectionControls('plate','ns-manual-plate',({note,photoText})=>({question:`Aide-moi à équilibrer cette assiette. ${note||''}`.trim(),context:{tool:'smart-plate-builder',date:date(),photoDescription:photoText,plate:entries.map(x=>({name:x.food.name,grams:x.grams})),totals:entries.length?totalsFor(entries):null}}),({photoText})=>photoText?`Je peux déjà t’aider à partir de la photo : ${photoText}. Ajoute ensuite les aliments manuellement pour un calcul plus précis.`:'Ajoute des aliments dans ton assiette ou une photo, puis redemande une aide plus ciblée.');
}
function renderFridge(){
  const manual=card(`<div id="ns-manual-fridge"></div><div class="ns-row">${field('Produit','ns-fridge-name','text','maxlength="80" placeholder="Ex. Tomates"')}${field('Quantité','ns-fridge-qty','text','maxlength="30" placeholder="Ex. 500 g"')}</div>${field('Date limite (si connue)','ns-fridge-date','date')}${button('Ajouter au frigo','ns-fridge-add','primary')}<div id="ns-fridge-list" class="ns-list"></div>`,'Inventaire')+
               card('<div id="ns-fridge-summary"></div>','À utiliser en priorité');
  const guide='<ul class="ns-tips"><li>Photo : montrez le contenu du frigo ou vos courses.</li><li>Scan : identifiez un produit emballé.</li><li>Saisie : notez les quantités et les dates limites.</li></ul>';
  root.innerHTML=sectionShell('fridge',manual,guide);
  function update(){const today=new Date(date()+'T12:00:00');db.fridge.sort((a,b)=>(a.exp||'9999').localeCompare(b.exp||'9999'));input('ns-fridge-list').innerHTML=db.fridge.map((x,i)=>{const diff=x.exp?Math.round((new Date(x.exp+'T12:00:00')-today)/86400000):null;return `<div class="ns-list-item"><span><strong>${esc(x.name)}</strong> ${esc(x.qty)}<small>${x.exp?`Date : ${esc(x.exp)}`:'Date non renseignée'} ${diff!==null?` · ${diff<0?'Date dépassée':diff===0?"Aujourd’hui":`${diff} j`}`:''}</small></span><button data-del="${i}" aria-label="Supprimer">×</button></div>`}).join('')||message('Votre frigo est vide. Ajoutez vos ingrédients.');const priority=db.fridge.filter(x=>x.exp&&x.exp<=new Date(Date.now()+3*86400000).toISOString().slice(0,10));input('ns-fridge-summary').innerHTML=`<div class="ns-stats">${fact('Produits',db.fridge.length)}${fact('Dates proches / passées',priority.length)}</div>`+(priority.length?`<div class="ns-list">${priority.map(x=>`<div class="ns-list-item"><span>${esc(x.name)} <small>${esc(x.exp)}</small></span></div>`).join('')}</div>`:message('Aucune date proche renseignée.'))+message('La date saisie dépend de votre emballage et de vos conditions de conservation.','soft')}
  on('ns-fridge-add','click',()=>{const name=input('ns-fridge-name').value.trim();if(!name)return;db.fridge.push({name:name.slice(0,80),qty:input('ns-fridge-qty').value.slice(0,30),exp:input('ns-fridge-date').value});persist();input('ns-fridge-name').value='';input('ns-fridge-qty').value='';input('ns-fridge-date').value='';update()});
  on('ns-fridge-list','click',e=>{const b=e.target.closest('[data-del]');if(b){db.fridge.splice(Number(b.dataset.del),1);persist();update()}});update();
  bindSectionControls('fridge','ns-manual-fridge',({note,photoText})=>({question:`Aide-moi à organiser ce frigo et à prioriser ce qu’il faut utiliser. ${note||''}`.trim(),context:{tool:'smart-fridge',date:date(),photoDescription:photoText,fridge:db.fridge.slice(0,20)}}),({photoText})=>photoText?`Photo décrite : ${photoText}. Ajoute aussi les dates et les quantités pour obtenir une aide plus concrète.`:'Ajoute quelques produits du frigo ou une photo pour recevoir un conseil plus utile.');
}
function renderSwap(){
  const f=foods();
  const manual = f.length<2 ? card(message('Enregistrez au moins 2 aliments dans le Journal pour activer la comparaison.'),'Comparaison manuelle') : card(`<div id="ns-manual-swap"></div><div class="ns-row">${select('Aliment actuel','ns-swap-a',options())}${select('Alternative','ns-swap-b',options())}</div>${select('Votre priorité','ns-swap-metric','<option value="p">Plus de protéines</option><option value="kcal">Moins de calories</option><option value="c">Moins de glucides</option><option value="f">Moins de lipides</option>')}${button('Comparer','ns-swap-run','primary')}<div id="ns-swap-result"></div>`,'Comparer pour 100 g');
  const guide='<ul class="ns-tips"><li>Photo : montrez deux produits ou un emballage.</li><li>Scan : ajoutez un produit absent de votre liste.</li><li>Saisie : comparez les aliments de votre journal.</li></ul>';
  root.innerHTML=sectionShell('swap',manual,guide);
  if(f.length<2){bindSectionControls('swap','ns-manual-swap',({note,photoText})=>({question:`Aide-moi à comparer des aliments et à choisir la meilleure alternative. ${note||''}`.trim(),context:{tool:'smart-food-swap',photoDescription:photoText}}),({photoText})=>photoText?`Je peux t’aider à comparer à partir de cette photo : ${photoText}. Pour un verdict plus fiable, ajoute les produits dans Nutrix.`:'Ajoute au moins deux aliments au journal ou une photo plus claire des produits.'); return;}
  input('ns-swap-b').value='1';
  on('ns-swap-run','click',()=>{const a=foodFrom('ns-swap-a'),b=foodFrom('ns-swap-b'),k=input('ns-swap-metric').value,hi=k==='p';if(!a||!b)return;const valA=a[k],valB=b[k];let verdict='Données insuffisantes pour déterminer une alternative.';if(valA!==null&&valB!==null)verdict=valA===valB?'Les deux aliments sont équivalents pour ce critère.':(hi?valB>valA:valB<valA)?`${b.name} correspond mieux au critère choisi.`:`${a.name} correspond mieux au critère choisi.`;input('ns-swap-result').innerHTML=`<div class="ns-comparison"><div><strong>${esc(a.name)}</strong>${statsHtml(a)}</div><div><strong>${esc(b.name)}</strong>${statsHtml(b)}</div></div>${message(esc(verdict),'soft')}<p class="ns-note">Une comparaison à 100 g ne remplace pas l’analyse de la portion réelle ni des ingrédients.</p>`});
  bindSectionControls('swap','ns-manual-swap',({note,photoText})=>{const a=foodFrom('ns-swap-a'),b=foodFrom('ns-swap-b');return {question:`Compare ces deux choix alimentaires et explique-moi la meilleure option selon ma priorité. ${note||''}`.trim(),context:{tool:'smart-food-swap',priority:input('ns-swap-metric')?.value||'',photoDescription:photoText,foods:[a,b].filter(Boolean)}}},({photoText})=>photoText?`Photo reçue : ${photoText}. Utilise aussi la comparaison manuelle pour un résultat plus précis sur 100 g.`:'Choisis deux aliments puis demande à l’AI de les comparer.');
}
function renderIntelligence(){
  const f=foods();
  const manual = f.length ? card(`<div id="ns-manual-intelligence"></div>${select('Aliment enregistré','ns-int-food',options())}${button('Analyser','ns-int-run','primary')}<div id="ns-int-result"></div>`,'Lecture nutritionnelle') : card(message('Ajoutez d’abord un aliment au Journal ou utilisez le Scanner.'),'Lecture nutritionnelle');
  const guide='<ul class="ns-tips"><li>Photo : montrez l’étiquette ou le produit.</li><li>Scan : récupérez les données Open Food Facts si elles existent.</li><li>Saisie : sélectionnez un aliment enregistré pour lire ses infos.</li></ul>';
  root.innerHTML=sectionShell('intelligence',manual,guide);
  if(f.length){on('ns-int-run','click',()=>{const x=foodFrom('ns-int-food');let text=[];if(x.p!==null)text.push(x.p>=20?'Riche en protéines pour 100 g.':x.p>=10?'Apport modéré en protéines pour 100 g.':'Faible apport en protéines pour 100 g.');if(x.kcal!==null)text.push(`Énergie enregistrée : ${fmt(x.kcal)} kcal pour 100 g.`);if(x.c!==null)text.push(`Glucides enregistrés : ${fmt(x.c)} g pour 100 g.`);if(x.f!==null)text.push(`Lipides enregistrés : ${fmt(x.f)} g pour 100 g.`);input('ns-int-result').innerHTML=statsHtml(x)+card(`<ul class="ns-tips">${text.map(t=>`<li>${esc(t)}</li>`).join('')||'<li>Les valeurs nutritives ne sont pas renseignées.</li>'}</ul><p class="ns-note">Ingrédients : ${esc(x.ingredients||'non renseignés')}<br>Allergènes : ${esc(x.allergens||'non renseignés')}<br>Nutri-Score : ${esc(x.score||'non disponible')}</p>`,'Points clés')+message('Les champs absents ne sont pas interprétés comme « aucun allergène » ou « sans additif ».','soft')});}
  bindSectionControls('intelligence','ns-manual-intelligence',({note,photoText})=>{const x=f.length?foodFrom('ns-int-food'):null;return {question:`Explique-moi simplement cet aliment, ses points utiles et ses limites. ${note||''}`.trim(),context:{tool:'food-intelligence',photoDescription:photoText,food:x}}},({photoText})=>photoText?`Je peux déjà te dire ceci sur l’image : ${photoText}. Si tu scans le produit ou le sélectionnes manuellement, l’analyse sera plus claire.`:'Sélectionne un aliment ou ajoute une photo pour lancer une lecture guidée.');
}
function renderRestaurant(){
  const manual=card(`<div id="ns-manual-restaurant"></div>${field('Nom du plat','ns-rest-name','text','maxlength="100" placeholder="Ex. Salade de poulet"')}${select('Mode de préparation','ns-rest-cook','<option value="grillé / cuit au four">Grillé ou au four</option><option value="frit">Frit</option><option value="cru / salade">Cru ou salade</option><option value="inconnu">Non indiqué</option>')}${field('Ingrédients / sauces indiqués','ns-rest-note','text','maxlength="240" placeholder="Selon la carte du restaurant"')}${button('Ajouter le plat','ns-rest-add','primary')}<div id="ns-rest-list"></div>`,'Créer une sélection de menu')+
                card('<div id="ns-rest-guide"></div>','Conseils de lecture');
  const guide='<ul class="ns-tips"><li>Photo : prenez le menu ou le plat en photo.</li><li>Scan : utile pour les produits emballés vendus sur place.</li><li>Saisie : notez la cuisson, les sauces et les ingrédients annoncés.</li></ul>';
  root.innerHTML=sectionShell('restaurant',manual,guide);
  function update(){input('ns-rest-list').innerHTML=(db.restaurant||[]).map((x,i)=>`<div class="ns-list-item"><span><strong>${esc(x.name)}</strong><small>${esc(x.cook)} · ${esc(x.notes||'ingrédients non indiqués')}</small></span><button data-del="${i}" aria-label="Supprimer">×</button></div>`).join('')||message('Ajoutez les plats disponibles sur le menu.');input('ns-rest-guide').innerHTML=message('Les calories, allergènes et portions ne sont pas fournis par un simple nom de plat. Demandez au restaurant les ingrédients, les sauces, les portions et les allergènes.','soft')+`<ul class="ns-tips"><li>Privilégiez les informations détaillées plutôt que le nom du plat.</li><li>Vérifiez les sauces, assaisonnements et méthodes de cuisson.</li><li>Une préparation grillée n’est pas automatiquement moins calorique.</li></ul>`}
  on('ns-rest-add','click',()=>{const name=input('ns-rest-name').value.trim();if(!name)return;db.restaurant=db.restaurant||[];db.restaurant.push({name:name.slice(0,100),cook:input('ns-rest-cook').value,notes:input('ns-rest-note').value.slice(0,240)});persist();input('ns-rest-name').value='';input('ns-rest-note').value='';update()});
  on('ns-rest-list','click',e=>{const b=e.target.closest('[data-del]');if(b){db.restaurant.splice(Number(b.dataset.del),1);persist();update()}});update();
  bindSectionControls('restaurant','ns-manual-restaurant',({note,photoText})=>({question:`Aide-moi à choisir un plat au restaurant de façon simple et prudente. ${note||''}`.trim(),context:{tool:'restaurant-mode',photoDescription:photoText,menu:db.restaurant.slice(0,20)}}),({photoText})=>photoText?`Je peux déjà t’aider à partir de la photo : ${photoText}. Ajoute aussi les noms des plats et les sauces pour un meilleur conseil.`:'Ajoute des plats du menu ou une photo du menu pour recevoir un conseil contextualisé.');
}
const renderers={plate:renderPlate,fridge:renderFridge,swap:renderSwap,intelligence:renderIntelligence,restaurant:renderRestaurant};
let active='plate';
function show(tool){if(!renderers[tool])return;active=tool;tabs.querySelectorAll('button').forEach(b=>{const selected=b.dataset.tool===tool;b.classList.toggle('on',selected);b.setAttribute('aria-pressed',selected?'true':'false')});if(window.NutrixVision&&window.NutrixVision.render(tool))return;renderers[tool]();}
tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-tool]');if(b)show(b.dataset.tool)});
show(active);
})();
