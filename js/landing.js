// PetCard · landing: movimiento editorial ligero (solo transform/opacity, un ciclo de scroll)
(() => {
  window.__petcardListo = true;
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const escritorio = matchMedia("(min-width: 961px)");

  document.querySelectorAll("[data-anio]").forEach((n) => (n.textContent = new Date().getFullYear()));

  // Partir en palabras con máscara (respeta los spans, em, b, i e imágenes internas)
  const partir = (raiz, clase, conMascara) => {
    let i = 0;
    const recorrer = (nodo) => {
      [...nodo.childNodes].forEach((h) => {
        if (h.nodeType === 3) {
          const piezas = h.textContent.split(/([ \t\n\r]+)/);
          if (!/[^ \t\n\r]/.test(h.textContent)) return;
          const frag = document.createDocumentFragment();
          piezas.forEach((p) => {
            if (!p) return;
            if (!/[^ \t\n\r]/.test(p)) { frag.append(" "); return; }
            frag.append(envolver(document.createTextNode(p)));
          });
          h.replaceWith(frag);
        } else if (h.nodeType === 1 && h.tagName === "IMG") {
          h.replaceWith(envolver(h.cloneNode(true)));
        } else if (h.nodeType === 1) {
          recorrer(h);
        }
      });
    };
    const envolver = (contenido) => {
      const fuera = document.createElement("span");
      fuera.className = clase;
      if (conMascara) {
        const dentro = document.createElement("span");
        dentro.append(contenido);
        fuera.append(dentro);
        fuera.style.setProperty("--i", i);
      } else fuera.append(contenido);
      i++;
      return fuera;
    };
    recorrer(raiz);
    return i;
  };

  const partidos = [...document.querySelectorAll("[data-partir]")];
  partidos.forEach((n) => { n.setAttribute("aria-label", n.textContent.replace(/\s+/g, " ").trim()); partir(n, "palabra", true); });
  const encender = document.querySelector("[data-encender]");
  if (encender) partir(encender, "pal", false);

  // Apariciones
  const ver = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    ver.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
  document.querySelectorAll(".aparecer, [data-partir], [data-revelar]").forEach((n) => ver.observe(n));
  // La portada entra al cargar, sin esperar scroll
  requestAnimationFrame(() => document.querySelectorAll(".portada .aparecer, .portada [data-partir], .portada [data-revelar]").forEach((n, k) => {
    if (n.classList.contains("aparecer")) n.style.setProperty("--retraso", `${0.35 + 0.08 * k}s`);
    n.classList.add("visible");
  }));

  // Navegación y menú
  const nav = document.querySelector("[data-nav]");
  const boton = document.querySelector("[data-menu]");
  const panel = document.querySelector("[data-menu-panel]");
  const cerrarMenu = () => { panel.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); };
  boton.addEventListener("click", () => {
    const abrir = !panel.classList.contains("abierto");
    panel.classList.toggle("abierto", abrir);
    boton.setAttribute("aria-expanded", String(abrir));
  });
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrarMenu));

  // Funciones ↔ pantallas del teléfono
  const funciones = [...document.querySelectorAll(".funcion")];
  const pantallas = [...document.querySelectorAll(".pantalla")];
  const segmentos = [...document.querySelectorAll(".segmentos span")];
  const telefono = document.querySelector("[data-flotar]");
  let actual = 0;
  const mostrar = (i) => {
    if (i === actual) return;
    actual = i;
    funciones.forEach((f, k) => f.classList.toggle("activa", k === i));
    pantallas.forEach((p, k) => p.classList.toggle("activa", k === i));
    segmentos.forEach((s, k) => s.classList.toggle("activo", k === i));
    if (telefono && escritorio.matches && !quieto) {
      telefono.style.setProperty("--ry", `${i % 2 ? -7 : 7}deg`);
      telefono.style.setProperty("--rx", "2deg");
    }
  };
  const vigia = new IntersectionObserver((es) => {
    if (!escritorio.matches) return;
    es.forEach((e) => e.isIntersecting && mostrar(Number(e.target.dataset.paso)));
  }, { rootMargin: "-45% 0px -45% 0px" });
  funciones.forEach((f) => vigia.observe(f));
  let rotacion;
  const configurar = () => {
    clearInterval(rotacion);
    if (!escritorio.matches && !quieto) rotacion = setInterval(() => mostrar((actual + 1) % pantallas.length), 2800);
  };
  escritorio.addEventListener("change", configurar);
  configurar();

  // Efectos ligados al scroll: un solo rAF, solo para lo visible
  const enPantalla = new Set();
  const vista = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? enPantalla.add(e.target) : enPantalla.delete(e.target))));
  const parallax = [...document.querySelectorAll("[data-revelar]")];
  const especies = document.querySelector(".especies__lista");
  const palabras = encender ? [...encender.querySelectorAll(".pal")] : [];
  const tachado = encender?.querySelector(".tachado");
  [...parallax, especies, encender].filter(Boolean).forEach((n) => vista.observe(n));

  let pendiente = false;
  const pintar = () => {
    pendiente = false;
    const alto = innerHeight;
    nav.classList.toggle("solida", scrollY > 12);
    if (quieto) return;
    enPantalla.forEach((n) => {
      const r = n.getBoundingClientRect();
      const avance = (alto - r.top) / (alto + r.height); // 0 al entrar, 1 al salir
      if (n.hasAttribute("data-revelar")) {
        n.querySelector("img").style.setProperty("--py", `${((avance - 0.5) * -r.height * 0.12).toFixed(1)}px`);
      } else if (n === especies) {
        n.style.setProperty("--px", `${((0.5 - avance) * 120).toFixed(1)}px`);
      } else if (n === encender) {
        const p = Math.min(1, Math.max(0, (alto * 0.85 - r.top) / (r.height + alto * 0.35)));
        const total = palabras.length;
        palabras.forEach((w, k) => {
          const o = Math.min(1, Math.max(0, p * total * 1.15 - k));
          w.style.opacity = (0.16 + o * 0.84).toFixed(2);
        });
        if (tachado) encender.classList.toggle("visible", p > 0.55);
      }
    });
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir, { passive: true });
  pintar();

  // Botones magnéticos (solo con mouse)
  if (fino && !quieto) {
    document.querySelectorAll(".boton, .tienda").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = `translate(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  // Acordeón con altura animada
  document.querySelectorAll(".acordeon details").forEach((d) => {
    const resumen = d.querySelector("summary");
    const cuerpo = d.querySelector(".acordeon__cuerpo");
    let anim;
    resumen.addEventListener("click", (ev) => {
      if (quieto || !cuerpo.animate) return;
      ev.preventDefault();
      anim?.cancel();
      const abriendo = !d.open;
      if (abriendo) d.open = true;
      const h = cuerpo.scrollHeight;
      anim = cuerpo.animate(
        { height: abriendo ? ["0px", `${h}px`] : [`${h}px`, "0px"], opacity: abriendo ? [0, 1] : [1, 0] },
        { duration: abriendo ? 520 : 380, easing: "cubic-bezier(.22, 1, .36, 1)" }
      );
      anim.onfinish = () => { if (!abriendo) d.open = false; };
    });
  });
})();
