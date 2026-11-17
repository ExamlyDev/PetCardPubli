// PetCard · landing: movimiento con transform/opacity, un solo ciclo de scroll
(() => {
  window.__petcardListo = true;
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ESP = /[^ \t\n\r]/;

  document.querySelectorAll("[data-anio]").forEach((n) => (n.textContent = new Date().getFullYear()));

  // Partir texto en palabras (respeta etiquetas internas e imágenes)
  const partir = (raiz, clase, mascara) => {
    let i = 0;
    const envolver = (contenido) => {
      const fuera = document.createElement("span");
      fuera.className = clase;
      if (mascara) {
        const dentro = document.createElement("span");
        dentro.append(contenido);
        fuera.append(dentro);
        fuera.style.setProperty("--i", i);
      } else fuera.append(contenido);
      i++;
      return fuera;
    };
    const recorrer = (nodo) => [...nodo.childNodes].forEach((h) => {
      if (h.nodeType === 3) {
        if (!ESP.test(h.textContent)) return;
        const frag = document.createDocumentFragment();
        h.textContent.split(/([ \t\n\r]+)/).forEach((p) => {
          if (!p) return;
          frag.append(ESP.test(p) ? envolver(document.createTextNode(p)) : " ");
        });
        h.replaceWith(frag);
      } else if (h.nodeType === 1 && (h.tagName === "IMG" || h.classList.contains("chip-texto"))) {
        h.replaceWith(envolver(h.cloneNode(true)));
      } else if (h.nodeType === 1) recorrer(h);
    });
    recorrer(raiz);
  };
  document.querySelectorAll("[data-partir]").forEach((n) => {
    n.setAttribute("aria-label", n.textContent.replace(/\s+/g, " ").trim());
    partir(n, "palabra", true);
  });
  const encender = document.querySelector("[data-encender]");
  if (encender) partir(encender, "pal", false);

  // Apariciones
  const ver = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    ver.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  document.querySelectorAll(".aparecer, [data-partir], [data-revelar]").forEach((n) => ver.observe(n));

  // Entrada de la portada
  const panel = document.querySelector(".portada__panel");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    panel.classList.add("listo");
    panel.querySelectorAll(".aparecer").forEach((n, k) => n.style.setProperty("--retraso", `${0.45 + 0.1 * k}s`));
    panel.querySelectorAll(".aparecer, [data-partir]").forEach((n) => n.classList.add("visible"));
  }));

  // Menú móvil
  const boton = document.querySelector("[data-menu]");
  const menu = document.querySelector("[data-menu-panel]");
  boton.addEventListener("click", () => {
    const abrir = !menu.classList.contains("abierto");
    menu.classList.toggle("abierto", abrir);
    boton.setAttribute("aria-expanded", String(abrir));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { menu.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); }));

  // Capas de la portada: siguen al mouse y se separan al bajar
  const capas = [...document.querySelectorAll("[data-capa]")].map((n) => ({ n, f: Number(n.dataset.capa) }));
  let mx = 0, my = 0, ax = 0, ay = 0, animandoMouse = false;
  const moverCapas = () => {
    ax += (mx - ax) * 0.08; ay += (my - ay) * 0.08;
    capas.forEach(({ n, f }) => { n.style.setProperty("--mx", (ax * f * 14).toFixed(2)); n.style.setProperty("--my", (ay * f * 14).toFixed(2)); });
    if (Math.abs(mx - ax) > 0.002 || Math.abs(my - ay) > 0.002) requestAnimationFrame(moverCapas);
    else animandoMouse = false;
  };
  if (fino && !quieto) {
    panel.addEventListener("pointermove", (e) => {
      const r = panel.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (!animandoMouse) { animandoMouse = true; requestAnimationFrame(moverCapas); }
    });
    panel.addEventListener("pointerleave", () => { mx = 0; my = 0; if (!animandoMouse) { animandoMouse = true; requestAnimationFrame(moverCapas); } });
  }

  // Efectos ligados al scroll (solo lo visible)
  const nav = document.querySelector("[data-nav]");
  const enPantalla = new Set();
  const vista = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? enPantalla.add(e.target) : enPantalla.delete(e.target))));
  const filas = [...document.querySelectorAll("[data-deslizar]")];
  const revelar = [...document.querySelectorAll("[data-revelar]")];
  const palabras = encender ? [...encender.querySelectorAll(".pal")] : [];
  [panel, encender, ...filas, ...revelar].filter(Boolean).forEach((n) => vista.observe(n));

  let pendiente = false;
  const pintar = () => {
    pendiente = false;
    nav.classList.toggle("solida", scrollY > 16);
    if (quieto) return;
    const alto = innerHeight;
    enPantalla.forEach((n) => {
      const r = n.getBoundingClientRect();
      const avance = (alto - r.top) / (alto + r.height);
      if (n === panel) {
        const s = Math.max(0, -r.top);
        capas.forEach(({ n: c, f }) => c.style.setProperty("--sy", `${(s * f * -0.12).toFixed(1)}px`));
      } else if (n === encender) {
        const p = Math.min(1, Math.max(0, (alto * 0.85 - r.top) / (r.height + alto * 0.3)));
        const total = palabras.length;
        palabras.forEach((w, k) => { w.style.opacity = (0.16 + Math.min(1, Math.max(0, p * total * 1.15 - k)) * 0.84).toFixed(2); });
        encender.classList.toggle("encendido", p > 0.5);
      } else if (n.hasAttribute("data-deslizar")) {
        const dir = Number(n.dataset.deslizar);
        n.style.setProperty("--px", `${((avance - 0.5) * -dir * Math.min(innerWidth, 1400) * 0.35 - (dir > 0 ? 0 : innerWidth * 0.25)).toFixed(1)}px`);
      } else if (n.hasAttribute("data-revelar")) {
        n.querySelector(".marco img").style.setProperty("--py", `${((avance - 0.5) * -r.height * 0.12).toFixed(1)}px`);
      }
    });
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir, { passive: true });
  pintar();

  // Contadores del panel de PetCard Vet
  const contar = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    contar.unobserve(e.target);
    const fin = Number(e.target.dataset.contar);
    if (quieto) return;
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / 1200);
      e.target.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }), { threshold: 0.6 });
  document.querySelectorAll("[data-contar]").forEach((n) => contar.observe(n));

  // Botones magnéticos
  if (fino && !quieto) {
    document.querySelectorAll(".boton, .tienda").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.28 - 2).toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  // Acordeón con altura animada (uno abierto a la vez)
  const detalles = [...document.querySelectorAll(".acordeon details")];
  const animar = (d, abrir) => {
    const cuerpo = d.querySelector(".acordeon__cuerpo");
    if (quieto || !cuerpo.animate) { d.open = abrir; return; }
    d._anim?.cancel();
    if (abrir) d.open = true;
    const h = cuerpo.scrollHeight;
    d._anim = cuerpo.animate(
      { height: abrir ? ["0px", `${h}px`] : [`${h}px`, "0px"], opacity: abrir ? [0, 1] : [1, 0] },
      { duration: abrir ? 520 : 360, easing: "cubic-bezier(.22, 1, .36, 1)" }
    );
    d._anim.onfinish = () => { if (!abrir) d.open = false; };
  };
  detalles.forEach((d) => d.querySelector("summary").addEventListener("click", (ev) => {
    ev.preventDefault();
    const abrir = !d.open;
    if (abrir) detalles.forEach((o) => o !== d && o.open && animar(o, false));
    animar(d, abrir);
  }));
})();
