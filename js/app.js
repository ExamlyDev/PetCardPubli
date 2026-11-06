(() => {
  const raiz = document.documentElement;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('listo')));

  // Navegación: fondo al desplazar, se oculta al bajar y aparece al subir
  const nav = document.querySelector('[data-nav]');
  let ultimoY = scrollY;
  const alDesplazar = () => {
    const y = scrollY;
    nav.classList.toggle('es-solida', y > 12);
    if (!nav.classList.contains('menu-abierto')) nav.classList.toggle('se-oculta', y > 320 && y > ultimoY);
    ultimoY = y;
  };
  addEventListener('scroll', alDesplazar, { passive: true });
  alDesplazar();

  // Menú en celular
  const hamburguesa = document.querySelector('[data-hamburguesa]');
  const cerrarMenu = () => { nav.classList.remove('menu-abierto'); hamburguesa.setAttribute('aria-expanded', 'false'); };
  hamburguesa.addEventListener('click', () => {
    const abierto = nav.classList.toggle('menu-abierto');
    hamburguesa.setAttribute('aria-expanded', String(abierto));
  });
  document.querySelectorAll('[data-menu] a').forEach(a => a.addEventListener('click', cerrarMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  // Aparición al desplazar
  const revelar = document.querySelectorAll('[data-revela]');
  if (sinMovimiento || !('IntersectionObserver' in window)) {
    revelar.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .15 });
    revelar.forEach(el => io.observe(el));
  }

  // Pendiente que se marca solo en la app de la portada
  const check = document.querySelector('[data-check]');
  if (check && !sinMovimiento) setTimeout(() => check.classList.add('marcado'), 3200);

  // Buscador que se escribe solo
  const escribe = document.querySelector('[data-escribe]');
  if (escribe && !sinMovimiento) {
    const frases = ['Veterinarias cerca de mí', 'Radiografía de Max', 'Estética para Luna', 'Vacuna antirrábica'];
    let f = 0, i = 0, borrando = false;
    escribe.textContent = '';
    const paso = () => {
      const frase = frases[f];
      i += borrando ? -1 : 1;
      escribe.textContent = frase.slice(0, i);
      let espera = borrando ? 35 : 70;
      if (!borrando && i === frase.length) { borrando = true; espera = 1600; }
      else if (borrando && i === 0) { borrando = false; f = (f + 1) % frases.length; espera = 400; }
      setTimeout(paso, espera);
    };
    setTimeout(paso, 1200);
  }

  // Inclinación suave de los teléfonos con el puntero
  if (!sinMovimiento && matchMedia('(hover: hover)').matches) {
    const escena = document.querySelector('.portada__escena');
    const tel = escena?.querySelector('.tel');
    if (escena && tel) {
      let rx = 0, ry = 0, tx = 0, ty = 0, activo = false;
      const anima = () => {
        rx += (tx - rx) * .08; ry += (ty - ry) * .08;
        tel.style.translate = `${ry * 10}px ${rx * -8}px`;
        tel.style.rotate = `${ry * 2.2}deg`;
        if (activo || Math.abs(tx - rx) + Math.abs(ty - ry) > .001) requestAnimationFrame(anima);
      };
      escena.addEventListener('pointermove', e => {
        const r = escena.getBoundingClientRect();
        tx = (e.clientY - r.top) / r.height - .5; ty = (e.clientX - r.left) / r.width - .5;
        if (!activo) { activo = true; requestAnimationFrame(anima); }
      });
      escena.addEventListener('pointerleave', () => { tx = ty = 0; activo = false; requestAnimationFrame(anima); });
    }
  }
})();
