
(()=>{
  'use strict';
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  ready(()=>{
    const drawer = document.getElementById('v11-ai-drawer');
    const backdrop = document.getElementById('v11-ai-backdrop');
    const closeBtn = document.getElementById('v11-ai-close');
    const launch = document.getElementById('v11-ai-launch');
    if(!drawer || !backdrop || !closeBtn || !launch) return;

    launch.title = 'Assistant Nutrix';
    launch.setAttribute('aria-label','Ouvrir l’assistant Nutrix');

    function ensureCallButton(){
      const actions = document.querySelector('.nx-ai-actions');
      if(!actions || document.getElementById('ai-call-btn')) return false;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'ai-call-btn';
      btn.className = 'nx-ai-circle';
      btn.title = 'Appel vocal avec Nutrix';
      btn.setAttribute('aria-label','Appel vocal avec Nutrix');
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.02.34 2.1.52 3.22.52a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.54a1 1 0 0 1 1 1c0 1.12.18 2.2.52 3.22a1 1 0 0 1-.24 1L6.6 10.8Z"/></svg>';
      actions.append(btn);
      return true;
    }

    function leaveCallMode(){
      document.body.classList.remove('ai-call-active');
      document.getElementById('ai-call-btn')?.classList.remove('is-active');
    }
    function enterCallMode(){
      const isOpen = drawer.classList.contains('open');
      if(!isOpen) launch.click();
      setTimeout(()=>{
        document.body.classList.add('ai-call-active');
        document.getElementById('ai-call-btn')?.classList.add('is-active');
        const voiceBtn = document.getElementById('ai-voice-btn');
        if(voiceBtn && !voiceBtn.classList.contains('is-active')) voiceBtn.click();
      }, isOpen ? 0 : 160);
    }

    const boot = ()=>{
      ensureCallButton();
      const callBtn = document.getElementById('ai-call-btn');
      callBtn?.addEventListener('click', ()=>{
        if(document.body.classList.contains('ai-call-active')) leaveCallMode();
        else enterCallMode();
      });
    };
    boot();
    const obs = new MutationObserver(()=>ensureCallButton());
    const body = document.getElementById('v11-ai-body');
    if(body) obs.observe(body, {childList:true, subtree:true});

    closeBtn.addEventListener('click', leaveCallMode, true);
    backdrop.addEventListener('click', leaveCallMode, true);
    document.addEventListener('keydown', e=>{if(e.key==='Escape') leaveCallMode();});

    document.querySelectorAll('[data-v11-action],[data-v9-action="ai"],.sidebar .tab[data-tab="ai"]').forEach(el=>{
      el.addEventListener('click', ()=>leaveCallMode(), true);
    });
  });
})();
