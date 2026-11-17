(() => {
  const raiz = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const puntero = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $$('[data-anio]').forEach(e => { e.textContent = new Date().getFullYear(); });

  // Menú móvil
  const botonMenu = $('[data-menu]');
  const panelMenu = $('[data-menu-panel]');
  const cerrarMenu = () => {
    panelMenu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  botonMenu.addEventListener('click', () => {
    const abrir = !panelMenu.classList.contains('abierto');
    panelMenu.classList.toggle('abierto', abrir);
    botonMenu.setAttribute('aria-expanded', String(abrir));
    document.body.style.overflow = abrir ? 'hidden' : '';
  });

  // Acordeón: solo uno abierto
  $$('.acordeon details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.acordeon details').forEach(o => { if (o !== d) o.open = false; });
  }));

  if (!window.gsap || !window.ScrollTrigger) { raiz.classList.remove('js'); return; }
  window.__petcardListo = true;
  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave
  let lenis = null;
  if (!reducir && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); return; }
    const destino = $(id);
    if (!destino) return;
    e.preventDefault();
    cerrarMenu();
    if (lenis) lenis.scrollTo(destino, { offset: -16, duration: 1.4 });
    else destino.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth' });
  }));

  // Nav: se esconde al bajar, vuelve al subir
  const nav = $('[data-nav]');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: s => nav.classList.toggle('oculta', s.direction === 1 && s.scroll() > 240 && !panelMenu.classList.contains('abierto'))
  });

  // Separa títulos en palabras para revelarlas con máscara
  const separar = el => {
    const recorrer = nodo => {
      [...nodo.childNodes].forEach(hijo => {
        if (hijo.nodeType === 3) {
          const frag = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(parte => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
            const caja = document.createElement('span');
            caja.className = 'palabra';
            const interior = document.createElement('span');
            interior.textContent = parte;
            caja.appendChild(interior);
            frag.appendChild(caja);
          });
          hijo.replaceWith(frag);
        } else if (hijo.nodeType === 1 && hijo.tagName !== 'BR') {
          recorrer(hijo);
        }
      });
    };
    recorrer(el);
    return $$('.palabra > span', el);
  };

  if (reducir) {
    gsap.set('[data-revelar], [data-revelar-grupo] > *, [data-hero-in], .hero__gigante span, .telefono--hero, .flotante, .foco .titulo', { opacity: 1 });
    const foco = $('[data-foco]');
    activarFoco(foco, null);
    return;
  }

  // Intro del hero
  const tituloHero = $('.hero__titulo');
  const palabrasHero = separar(tituloHero);
  gsap.set(tituloHero, { opacity: 1 });
  gsap.set(palabrasHero, { yPercent: 110 });

  gsap.timeline({ defaults: { ease: 'expo.out' }, delay: .15 })
    .fromTo('.hero__gigante span', { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 1.5, stagger: .06 })
    .fromTo('.telefono--hero', { y: 260, rotation: 10, opacity: 0 }, { y: 0, rotation: -6, opacity: 1, duration: 1.6, ease: 'elastic.out(1, .65)' }, .35)
    .to(palabrasHero, { yPercent: 0, duration: 1.2, stagger: .045 }, .5)
    .fromTo('[data-hero-in]:not(.hero__titulo)', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: .08 }, .75)
    .fromTo('.flotante', { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: .12, ease: 'back.out(2.2)' }, .95);

  // Ola del hero que respira
  gsap.to('[data-ola]', {
    attr: { d: 'M0,560 C200,660 360,520 560,600 C760,680 900,460 1100,500 C1260,530 1340,400 1440,380 L1440,900 L0,900 Z' },
    duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true
  });

  // Parallax del hero con el scroll
  gsap.to('.hero__gigante', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__escena', { y: -90, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__texto', { y: 60, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });

  // Parallax con el mouse
  const escena = $('[data-parallax-escena]');
  if (puntero && escena) {
    const capas = $$('[data-capa]', escena).map(el => ({
      fuerza: parseFloat(el.dataset.capa),
      x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' })
    }));
    $('.hero').addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - .5;
      const ny = e.clientY / innerHeight - .5;
      capas.forEach(c => { c.x(nx * c.fuerza); c.y(ny * c.fuerza); });
    });
  }

  // Títulos por palabras
  $$('.titulo').forEach(t => {
    const palabras = separar(t);
    gsap.set(t, { opacity: 1, y: 0 });
    gsap.fromTo(palabras, { yPercent: 110 }, {
      yPercent: 0, duration: 1.1, stagger: .05, ease: 'expo.out',
      scrollTrigger: { trigger: t, start: 'top 88%' }
    });
  });

  // Revelados
  $$('[data-revelar]:not(.titulo)').forEach(el => gsap.fromTo(el, { y: 50, opacity: 0 }, {
    y: 0, opacity: 1, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  }));
  $$('[data-revelar-grupo]').forEach(g => {
    const hijos = [...g.children].filter(h => !h.classList.contains('titulo'));
    gsap.fromTo(hijos, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.1, stagger: .09, ease: 'expo.out',
      scrollTrigger: { trigger: g, start: 'top 86%' }
    });
  });

  // Fotos con zoom suave al entrar
  $$('.problema__foto img, .como__foto img').forEach(img => gsap.fromTo(img, { scale: 1.12 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: img, start: 'top bottom', end: 'center center', scrub: true }
  }));

  // Stickers que rebotan
  $$('[data-sticker]').forEach(s => gsap.fromTo(s, { scale: 0, rotation: -25 }, {
    scale: 1, rotation: 0, duration: 1.4, ease: 'elastic.out(1, .5)',
    scrollTrigger: { trigger: s, start: 'top 92%' }
  }));

  // Garabato y perritos decorativos
  gsap.to('.garabato', { y: -120, rotation: 8, ease: 'none', scrollTrigger: { trigger: '.problema', scrub: true } });
  $$('.encabezado__perro, .preguntas__perro, .final__perro').forEach(p => gsap.fromTo(p, { xPercent: -14 }, {
    xPercent: 14, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true }
  }));

  // Pila de cartillas que se abre
  const pila = { trigger: '[data-pila]', start: 'top 85%', end: 'bottom 35%', scrub: 1 };
  gsap.to('.cartilla--atras', { rotation: 22, x: 80, y: 20, ease: 'none', scrollTrigger: pila });
  gsap.to('.cartilla--medio', { rotation: 11, x: 40, y: 8, ease: 'none', scrollTrigger: pila });
  gsap.to('.cartilla--frente', { rotation: -9, x: -20, ease: 'none', scrollTrigger: pila });

  // Sección fijada con pantallas
  activarFoco($('[data-foco]'), true);

  // Marquesinas que aceleran con la velocidad del scroll
  const marquesinas = $$('[data-marquesina]').map(fila => {
    const pista = $('.marquesina__pista', fila);
    pista.innerHTML += pista.innerHTML;
    $$('span', pista).slice(pista.children.length / 2).forEach(s => s.setAttribute('aria-hidden', 'true'));
    const inversa = fila.classList.contains('marquesina__fila--inversa');
    return gsap.fromTo(pista, { xPercent: inversa ? -50 : 0 }, { xPercent: inversa ? 0 : -50, duration: 32, ease: 'none', repeat: -1 });
  });
  ScrollTrigger.create({
    trigger: '.marquesina', start: 'top bottom', end: 'bottom top',
    onUpdate: s => {
      const extra = Math.min(Math.abs(s.getVelocity()) / 300, 5);
      marquesinas.forEach(t => gsap.to(t, {
        timeScale: 1 + extra, duration: .2, overwrite: true,
        onComplete: () => gsap.to(t, { timeScale: 1, duration: 1, ease: 'power2.out' })
      }));
    }
  });

  // Planes: aparecen girando un poco
  gsap.fromTo('.plan--destacado', { rotation: 4 }, { rotation: 0, ease: 'none', scrollTrigger: { trigger: '.planes', start: 'top bottom', end: 'center center', scrub: true } });

  // Wordmark gigante del pie
  gsap.fromTo('.pie__grande .wordmark', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.pie', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  if (puntero) {
    // Botones magnéticos
    $$('[data-magnetico]').forEach(b => {
      const x = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3.out' });
      const y = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3.out' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .3);
        y((e.clientY - r.top - r.height / 2) * .4);
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' }));
    });

    // Tarjetas con inclinación 3D
    $$('[data-inclinar]').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotationY: px * 10, rotationX: -py * 10, transformPerspective: 900, duration: .6, ease: 'power3.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotationY: 0, rotationX: 0, duration: 1.2, ease: 'elastic.out(1, .45)' }));
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());

  function activarFoco(seccion, animado) {
    if (!seccion) return;
    const pasos = $$('[data-paso]', seccion);
    const pantallas = $$('[data-pantalla]', seccion);
    const barra = $('[data-foco-barra]', seccion);
    let actual = 0;
    const mostrar = i => {
      if (i === actual) return;
      actual = i;
      pasos.forEach((p, k) => p.classList.toggle('activo', k === i));
      pantallas.forEach((p, k) => p.classList.toggle('activa', k === i));
    };

    if (!animado) {
      pasos.forEach((p, i) => p.addEventListener('click', () => mostrar(i)));
      return;
    }

    const st = ScrollTrigger.create({
      trigger: seccion, start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        mostrar(Math.min(pasos.length - 1, Math.floor(s.progress * pasos.length)));
        if (barra) gsap.set(barra, { scaleX: s.progress });
      }
    });
    pasos.forEach((p, i) => p.addEventListener('click', () => {
      const y = st.start + (st.end - st.start) * ((i + .5) / pasos.length);
      lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: 'smooth' });
    }));

    const tel = $('.foco__telefono .telefono', seccion);
    gsap.fromTo(tel, { rotation: 7, y: 80 }, { rotation: -4, y: -40, ease: 'none', scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    $$('.foco__pastilla', seccion).forEach((p, i) => gsap.fromTo(p, { y: 60 * (i + 1) }, { y: -60 * (i + 1), ease: 'none', scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: true } }));
    gsap.to('.nube--1', { x: 260, ease: 'none', scrollTrigger: { trigger: seccion, scrub: true } });
    gsap.to('.nube--2', { x: -220, ease: 'none', scrollTrigger: { trigger: seccion, scrub: true } });
  }
})();
