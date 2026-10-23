
(function(){
  const heroMap = {
    'page-home': {
      kicker: 'TABLEAU DE BORD',
      title: 'Ton espace nutritionnel, simple et motivant.',
      text: 'Retrouve rapidement tes calories, tes macros, ton historique et les produits à découvrir dans une interface plus claire, vivante et agréable à utiliser.',
      points: ['Vue rapide', 'Calories & macros', 'Découverte'],
      badgeTitle: 'Dashboard', badgeText: 'Fresh overview',
      img: 'assets/sections/home-photo.webp', alt: 'Photo réaliste d’un bowl healthy avec saumon, avocat et légumes frais.'
    },
    'page-health': {
      kicker: 'SUIVI SANTÉ',
      title: 'Suivi personnel plus lisible, plus humain.',
      text: 'Calories, humeur, énergie, poids, sommeil et sport : chaque information importante reste visible sans surcharger la page.',
      points: ['Humeur', 'Sommeil', 'Progression'],
      badgeTitle: 'Health', badgeText: 'Daily tracking',
      img: 'assets/sections/health-photo.webp', alt: 'Photo lifestyle bien-être avec smoothie, yoga mat, eau citronnée et montre connectée.'
    },
    'page-journal': {
      kicker: 'LABO & DÉCOUVERTE',
      title: 'Explorer les produits devient plus intuitif.',
      text: 'Recherche, scan et outils d’exploration sont rassemblés dans un espace plus fluide pour comprendre rapidement ce que tu consommes.',
      points: ['Recherche', 'Découverte', 'Outils'],
      badgeTitle: 'Labo', badgeText: 'Explore & compare',
      img: 'assets/sections/journal-photo.webp', alt: 'Photo éditoriale de produits sains, carnet et loupe pour la découverte nutritionnelle.'
    },
    'page-ai': {
      kicker: 'COACH INTELLIGENT',
      title: 'Un assistant plus premium et rassurant.',
      text: 'Le module Coach bénéficie d’un look plus moderne pour poser des questions, relire tes données et obtenir des réponses plus confortablement.',
      points: ['Assistant', 'Bilan', 'Conseils'],
      badgeTitle: 'Coach', badgeText: 'Nutrix AI',
      img: 'assets/sections/coach-photo.webp', alt: 'Photo premium d’un espace de travail bien-être avec laptop et ambiance coach nutritionnel.'
    },
    'page-faq': {
      kicker: 'À PROPOS DU PROJET',
      title: 'Présenter Nutrix avec une identité plus professionnelle.',
      text: 'La partie projet devient plus claire pour expliquer la vision, les fonctionnalités et les sources avec une présentation plus crédible.',
      points: ['Projet', 'Fonctions', 'Sources'],
      badgeTitle: 'Projet', badgeText: 'About Nutrix',
      img: 'assets/sections/project-photo.webp', alt: 'Photo de présentation créative du projet Nutrix avec tablette, croquis et repas sain.'
    }
  };

  function createHero(cfg){
    const wrap = document.createElement('section');
    wrap.className = 'nx-section-hero reveal-up';
    wrap.innerHTML = `
      <div class="nx-hero-copy">
        <span class="nx-hero-kicker">${cfg.kicker}</span>
        <h2 class="nx-hero-title">${cfg.title}</h2>
        <p class="nx-hero-text">${cfg.text}</p>
        <div class="nx-hero-points">${cfg.points.map(p => `<span class="nx-hero-point"><i></i>${p}</span>`).join('')}</div>
      </div>
      <div class="nx-hero-media" aria-hidden="false">
        <span class="nx-hero-orb nx-hero-orb--one"></span>
        <span class="nx-hero-orb nx-hero-orb--two"></span>
        <span class="nx-hero-orb nx-hero-orb--three"></span>
        <div class="nx-hero-photo-shell">
          <img class="nx-hero-photo" src="${cfg.img}" loading="lazy" decoding="async" width="900" height="675" alt="${cfg.alt}">
          <div class="nx-hero-badge"><div>${cfg.badgeTitle}<span>${cfg.badgeText}</span></div></div>
        </div>
      </div>`;
    return wrap;
  }

  function injectHeroes(){
    Object.entries(heroMap).forEach(([id, cfg]) => {
      const page = document.getElementById(id);
      if (!page || page.querySelector('.nx-section-hero')) return;
      const hero = createHero(cfg);
      page.insertBefore(hero, page.firstElementChild);
    });
  }

  function addRevealClasses(){
    const selectors = [
      '.v10-panel','.card','.explore-panel','.nx-morocco','.space-module','.v111-about article','.ai-chip','.v11-shortcuts button','.explore-hero','.nutri-hero','.ai-heading','.v111-about','.hero.card'
    ];
    document.querySelectorAll(selectors.join(','))
      .forEach(el => el.classList.add('reveal-up'));
  }

  function observeReveals(){
    const targets = document.querySelectorAll('.reveal-up');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: .12, rootMargin: '0px 0px -40px 0px'});
    targets.forEach(t => io.observe(t));
  }

  function addHeroMotion(){
    document.querySelectorAll('.nx-hero-photo-shell').forEach(shell => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      shell.addEventListener('mousemove', e => {
        const rect = shell.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        shell.style.setProperty('--mx', `${x * 8}px`);
        shell.style.setProperty('--my', `${y * 8}px`);
      });
      shell.addEventListener('mouseleave', () => {
        shell.style.setProperty('--mx', '0px');
        shell.style.setProperty('--my', '0px');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('has-js-motion');
    injectHeroes();
    addRevealClasses();
    observeReveals();
    addHeroMotion();
  });
})();
