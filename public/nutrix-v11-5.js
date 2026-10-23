(()=>{'use strict';
const lang=()=>document.getElementById('v111-language')?.value==='ary';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Rotation daily, no fabricated publication dates, products or reviews.
const categories=['couscous','huile olive maroc','sardines','harissa','amlou','the vert menthe','lentilles','dattes maroc','lait maroc'];
const day=Math.floor(Date.now()/86400000);
const q=categories[((day%categories.length)+categories.length)%categories.length];
const holder=document.getElementById('nx-morocco-items');
const label=document.getElementById('nx-today-label');
if(label)label.textContent=new Date().toLocaleDateString('fr-MA',{day:'numeric',month:'short'});
if(holder){fetch('/api/off/search?q='+encodeURIComponent(q)).then(r=>{if(!r.ok)throw Error('OFF '+r.status);return r.json()}).then(j=>{
 const products=(Array.isArray(j.products)?j.products:[]).filter(p=>p&&String(p.product_name_fr||p.product_name||'').trim()).slice(0,3);
 if(!products.length)throw Error('empty');
 holder.innerHTML=products.map(p=>{const name=String(p.product_name_fr||p.product_name).slice(0,90),brand=String(p.brands||'').slice(0,50),grade=String(p.nutriscore_grade||p.nutrition_grades||'').toUpperCase();const valid=/^[A-E]$/.test(grade);const image=p.image_front_small_url||p.image_front_url||p.image_small_url||p.image_url||'';
 return `<article class="nx-morocco-card"><div class="nx-morocco-image">${image?`<img loading="lazy" src="${esc(image)}" alt="${esc(name)}">`:'<span aria-hidden="true">▤</span>'}</div><h4>${esc(name)}</h4><p>${esc(brand)}</p><div class="nx-grade ${valid?'nx-grade-'+grade.toLowerCase():''}">${valid?'Nutri-Score '+grade:(lang()?'النقطة ما متوفراش':'Note indisponible')}</div></article>`;}).join('');
 }).catch(()=>{holder.textContent=lang()?'المعطيات ما متوفراش دابا. عاود من بعد.':'Produits indisponibles pour le moment.';});}
function updateLang(){const ar=lang();document.querySelectorAll('[data-nx115-fr][data-nx115-ary]').forEach(el=>{el.textContent=ar?el.dataset.nx115Ary:el.dataset.nx115Fr;});}
document.getElementById('v111-language')?.addEventListener('change',()=>{updateLang();document.getElementById('nutri-compare-a')?.dispatchEvent(new Event('change'));});updateLang();
})();