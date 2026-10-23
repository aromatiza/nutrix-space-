/* Nutrix AI V8 side-panel enhancements. No alternative chatbot/back-end. */
(()=>{'use strict';
 const svg=(s)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s}"/></svg>`;
 const $=s=>document.querySelector(s);
 function ready(){const drawer=$('#v11-ai-drawer'),head=drawer?.querySelector('.v11-ai-top'),body=$('#v11-ai-body'),chat=$('#ai-chat'),input=$('#ai-input'),form=$('#ai-form');if(!drawer||!head||!body||!chat||!input||!form)return;
  const left=head.querySelector('div');if(left){left.replaceChildren();const name=document.createElement('strong');name.textContent='Nutrix AI';const small=document.createElement('small');small.textContent='Votre copilote nutritionnel';left.append(name,small)}
  const buttons=document.createElement('div');buttons.className='nx-copilot-controls';
  const add=(label,markup,click)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.title=label;b.innerHTML=markup;b.addEventListener('click',click);buttons.append(b);return b};
  const history=[];const historyNode=document.createElement('div');historyNode.className='nx-copilot-history';
  const recent=()=>{historyNode.replaceChildren();history.slice().reverse().forEach((entry)=>{const b=document.createElement('button');b.type='button';b.textContent=entry.length>80?entry.slice(0,80)+'…':entry;b.addEventListener('click',()=>{input.value=entry;input.focus();historyNode.classList.remove('open')});historyNode.append(b)})};
  add('Nouvelle conversation',svg('M12 5v14M5 12h14'),()=>{$('#ai-clear')?.click();setState('idle')});
  add('Historique',svg('M3 12a9 9 0 1 0 3-6M3 3v5h5M12 7v6l4 2'),()=>{historyNode.classList.toggle('open');recent()});
  const expand=add('Agrandir',svg('M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5'),()=>{drawer.classList.toggle('nx-ai-expanded');expand.setAttribute('aria-label',drawer.classList.contains('nx-ai-expanded')?'Réduire':'Agrandir')});
  const close=$('#v11-ai-close');if(close){head.insertBefore(buttons,close);close.textContent='×'}else head.append(buttons);
  const avatar=document.createElement('div');avatar.className='nx-copilot-avatar';avatar.dataset.state='idle';avatar.innerHTML='<div class="nx-copilot-stage" id="nx-robot-stage"><span class="nx-copilot-fallback" aria-hidden="true">✦</span></div><span class="nx-copilot-status" role="status">Prêt à vous aider</span>';
  body.prepend(historyNode);historyNode.after(avatar);
  const overview=$('#ai-overview');if(overview){overview.hidden=false;overview.removeAttribute('hidden')}
  const suggestions=$('.ai-suggestions');if(suggestions){suggestions.hidden=true}
  input.placeholder='Demandez quelque chose à Nutrix AI…';
  const quick=[['Analyser un repas','Analyse mon repas et les portions.'],['Mon bilan nutritionnel',"Analyse mon alimentation aujourd'hui."],['Idées de repas','Propose-moi un repas riche en protéines.'],['Comparer des aliments','Compare le poulet, le riz et les œufs.']];
  if(overview){overview.replaceChildren();overview.hidden=true}
  const states={idle:'Prêt à vous aider',listening:'Je vous écoute',thinking:'Analyse en cours…',answering:'Réponse prête',success:'Terminé',error:'Service indisponible'};
  function setState(state){avatar.dataset.state=state;avatar.querySelector('.nx-copilot-status').textContent=states[state]||states.idle;window.dispatchEvent(new CustomEvent('nutrix:ai-state',{detail:{state}}))}
  window.nutrixCopilotState=setState;
  input.addEventListener('focus',()=>{if(avatar.dataset.state==='idle')setState('listening')});input.addEventListener('blur',()=>{if(avatar.dataset.state==='listening')setState('idle')});
  form.addEventListener('submit',()=>{const q=input.value.trim();if(q){history.push(q);if(history.length>35)history.shift();setState('thinking');if(overview)overview.hidden=true}},true);
  $('#ai-clear')?.addEventListener('click',()=>{if(overview)overview.hidden=true;setState('idle')});
  const observer=new MutationObserver(()=>{chat.querySelectorAll('.ai-message.assistant .ai-bubble').forEach(b=>{if(b.querySelector('.nx-ai-copy'))return;const btn=document.createElement('button');btn.type='button';btn.className='nx-ai-copy';btn.textContent='Copier';btn.addEventListener('click',()=>{navigator.clipboard?.writeText(b.innerText||b.textContent||'').catch(()=>{})});b.append(btn)});});observer.observe(chat,{childList:true,subtree:false});
  setup3D(drawer,avatar,setState);
 }
 async function setup3D(drawer,avatar,setState){const stage=avatar.querySelector('#nx-robot-stage');if(!stage)return;
  let renderer,scene,camera,robot,raf=0,clock=0,resize;
  try{
   const THREE=await import('https://esm.sh/three@0.161.0');
   const {GLTFLoader}=await import('https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js');
   if(!stage.isConnected)return;
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;stage.append(renderer.domElement);
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.1,20);camera.position.set(0,0,4.5);
   scene.add(new THREE.HemisphereLight(0xeefff7,0x386d5a,2.2));const key=new THREE.DirectionalLight(0xffffff,2.3);key.position.set(3,3,4);scene.add(key);
   const gltf=await new GLTFLoader().loadAsync('assets/ai/nutrix-robot.glb');robot=gltf.scene;scene.add(robot);robot.rotation.y=-.15;
   resize=()=>{const r=stage.getBoundingClientRect();const w=Math.max(r.width,1),h=Math.max(r.height,1);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();
   avatar.dataset.webgl='ready';
   const render=()=>{raf=0;if(!drawer.classList.contains('open')||document.hidden)return;clock+=.018;const state=avatar.dataset.state;robot.position.y=Math.sin(clock*1.3)*.07;robot.rotation.y=Math.sin(clock*.6)*.1+(state==='thinking'?.15:-.15);robot.rotation.z=Math.sin(clock*.55)*.025;renderer.render(scene,camera);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(render)};
   const start=()=>{if(drawer.classList.contains('open')&&!document.hidden&&!raf){resize();raf=requestAnimationFrame(render)}};
   const stop=()=>{if(raf)cancelAnimationFrame(raf);raf=0};
   new MutationObserver(()=>{if(drawer.classList.contains('open'))start();else stop()}).observe(drawer,{attributes:true,attributeFilter:['class']});
   document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('resize',()=>{resize();start()});start();
  }catch(e){avatar.dataset.webgl='fallback';avatar.querySelector('.nx-copilot-fallback').textContent='✦';avatar.querySelector('.nx-copilot-status').textContent='Assistant prêt · animation 3D indisponible';}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
